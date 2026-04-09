import yaml
from typing import Any


SUPPORTED_KINDS = {
    "Pod", "Deployment", "Service", "Ingress",
    "ConfigMap", "Secret", "Namespace",
    "StatefulSet", "DaemonSet", "ReplicaSet",
    "Job", "CronJob",
}


def parse_yaml(yaml_content: str) -> list[dict[str, Any]]:
    """Parse multi-document YAML and return list of K8s resource dicts."""
    resources = []
    try:
        docs = yaml.safe_load_all(yaml_content)
        for doc in docs:
            if not doc or not isinstance(doc, dict):
                continue
            kind = doc.get("kind")
            if not kind:
                continue
            resources.append(doc)
    except yaml.YAMLError:
        raise ValueError("Invalid YAML syntax")
    return resources


def extract_node(resource: dict) -> dict:
    """Extract a graph node from a K8s resource dict."""
    kind = resource.get("kind", "Unknown")
    metadata = resource.get("metadata", {})
    spec = resource.get("spec", {})
    name = metadata.get("name", "unnamed")
    namespace = metadata.get("namespace", "default")
    node_id = f"{kind}/{namespace}/{name}"

    data = {
        "labels": metadata.get("labels", {}),
    }

    if kind in ("Deployment", "StatefulSet", "DaemonSet"):
        data["replicas"] = spec.get("replicas", 1)
        # Extract image and ports from pod template
        template = spec.get("template", {})
        containers = template.get("spec", {}).get("containers", [])
        if containers:
            data["image"] = containers[0].get("image", "")
            ports = []
            for c in containers:
                for p in c.get("ports", []):
                    ports.append(p.get("containerPort"))
            data["ports"] = ports
        # Selector
        selector = spec.get("selector", {})
        data["selector"] = selector.get("matchLabels", {})

    elif kind == "Pod":
        containers = spec.get("containers", [])
        if containers:
            data["image"] = containers[0].get("image", "")
            ports = []
            for c in containers:
                for p in c.get("ports", []):
                    ports.append(p.get("containerPort"))
            data["ports"] = ports
        # Volume references
        data["volumes"] = []
        for vol in spec.get("volumes", []):
            if "configMap" in vol:
                data["volumes"].append({"type": "configMap", "name": vol["configMap"]["name"]})
            elif "secret" in vol:
                data["volumes"].append({"type": "secret", "name": vol["secret"]["secretName"]})

    elif kind == "Service":
        data["serviceType"] = spec.get("type", "ClusterIP")
        data["selector"] = spec.get("selector", {})
        data["ports"] = []
        for p in spec.get("ports", []):
            data["ports"].append({
                "port": p.get("port"),
                "targetPort": p.get("targetPort"),
                "protocol": p.get("protocol", "TCP"),
            })

    elif kind == "Ingress":
        data["rules"] = []
        for rule in spec.get("rules", []):
            paths = []
            http = rule.get("http", {})
            for path_entry in http.get("paths", []):
                backend = path_entry.get("backend", {})
                service = backend.get("service", {})
                paths.append({
                    "path": path_entry.get("path", "/"),
                    "serviceName": service.get("name", ""),
                    "servicePort": service.get("port", {}).get("number"),
                })
            data["rules"].append({
                "host": rule.get("host", "*"),
                "paths": [f"{p['path']} → {p['serviceName']}:{p.get('servicePort', '?')}" for p in paths],
                "_backends": paths,
            })

    elif kind == "ConfigMap":
        cm_data = resource.get("data", {})
        data["dataKeys"] = [{"key": k, "value": v} for k, v in cm_data.items()]

    elif kind == "Secret":
        secret_data = resource.get("data", {})
        data["dataKeys"] = [{"key": k, "value": "••••••••"} for k in secret_data.keys()]

    return {
        "id": node_id,
        "kind": kind,
        "name": name,
        "namespace": namespace,
        "data": data,
    }


def extract_implicit_pods(resource: dict, namespace: str) -> dict | None:
    """For Deployments etc., create implicit Pod nodes from template."""
    kind = resource.get("kind")
    if kind not in ("Deployment", "StatefulSet", "DaemonSet"):
        return None

    metadata = resource.get("metadata", {})
    spec = resource.get("spec", {})
    template = spec.get("template", {})
    template_metadata = template.get("metadata", {})
    template_spec = template.get("spec", {})
    name = metadata.get("name", "unnamed")

    pod_name = f"{name}-pod"
    containers = template_spec.get("containers", [])
    ports = []
    image = ""
    if containers:
        image = containers[0].get("image", "")
        for c in containers:
            for p in c.get("ports", []):
                ports.append(p.get("containerPort"))

    # Extract volume refs from pod spec
    volumes = []
    for vol in template_spec.get("volumes", []):
        if "configMap" in vol:
            volumes.append({"type": "configMap", "name": vol["configMap"]["name"]})
        elif "secret" in vol:
            volumes.append({"type": "secret", "name": vol["secret"]["secretName"]})

    # Extract envFrom refs
    env_refs = []
    for c in containers:
        for env_from in c.get("envFrom", []):
            if "configMapRef" in env_from:
                env_refs.append({"type": "configMap", "name": env_from["configMapRef"]["name"]})
            elif "secretRef" in env_from:
                env_refs.append({"type": "secret", "name": env_from["secretRef"]["name"]})

    return {
        "id": f"Pod/{namespace}/{pod_name}",
        "kind": "Pod",
        "name": pod_name,
        "namespace": namespace,
        "data": {
            "image": image,
            "ports": ports,
            "labels": template_metadata.get("labels", {}),
            "volumes": volumes + env_refs,
        },
    }
