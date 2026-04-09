def build_relationships(nodes: list[dict], resources: list[dict]) -> list[dict]:
    """Detect edges/relationships between K8s resources."""
    edges = []
    edge_id = 0

    # Build lookup maps
    node_by_id = {n["id"]: n for n in nodes}
    pods = [n for n in nodes if n["kind"] == "Pod"]
    services = [n for n in nodes if n["kind"] == "Service"]
    deployments = [n for n in nodes if n["kind"] in ("Deployment", "StatefulSet", "DaemonSet")]
    ingresses = [n for n in nodes if n["kind"] == "Ingress"]
    configmaps = [n for n in nodes if n["kind"] == "ConfigMap"]
    secrets = [n for n in nodes if n["kind"] == "Secret"]

    # Deployment → Pod (manages)
    for dep in deployments:
        dep_selector = dep["data"].get("selector", {})
        if not dep_selector:
            continue
        for pod in pods:
            pod_labels = pod["data"].get("labels", {})
            if _labels_match(dep_selector, pod_labels):
                edges.append({
                    "id": f"e-{edge_id}",
                    "source": dep["id"],
                    "target": pod["id"],
                    "type": "manages",
                })
                edge_id += 1

    # Service → Pod (selects) or Service → Deployment (selects)
    for svc in services:
        svc_selector = svc["data"].get("selector", {})
        if not svc_selector:
            continue
        matched = False
        # Try matching pods first
        for pod in pods:
            pod_labels = pod["data"].get("labels", {})
            if _labels_match(svc_selector, pod_labels):
                edges.append({
                    "id": f"e-{edge_id}",
                    "source": svc["id"],
                    "target": pod["id"],
                    "type": "selects",
                })
                edge_id += 1
                matched = True
        # If no pod matched, try matching deployments (via template labels)
        if not matched:
            for dep in deployments:
                dep_labels = dep["data"].get("labels", {})
                if _labels_match(svc_selector, dep_labels):
                    edges.append({
                        "id": f"e-{edge_id}",
                        "source": svc["id"],
                        "target": dep["id"],
                        "type": "selects",
                    })
                    edge_id += 1

    # Ingress → Service (routes_to)
    for ing in ingresses:
        for rule in ing["data"].get("rules", []):
            for backend in rule.get("_backends", []):
                svc_name = backend.get("serviceName")
                if not svc_name:
                    continue
                # Find matching service
                for svc in services:
                    if svc["name"] == svc_name and svc["namespace"] == ing["namespace"]:
                        edges.append({
                            "id": f"e-{edge_id}",
                            "source": ing["id"],
                            "target": svc["id"],
                            "type": "routes_to",
                        })
                        edge_id += 1
                        break

    # Pod → ConfigMap (mounts/references)
    for pod in pods:
        for vol in pod["data"].get("volumes", []):
            if vol.get("type") == "configMap":
                cm_name = vol.get("name")
                for cm in configmaps:
                    if cm["name"] == cm_name and cm["namespace"] == pod["namespace"]:
                        edges.append({
                            "id": f"e-{edge_id}",
                            "source": pod["id"],
                            "target": cm["id"],
                            "type": "mounts",
                        })
                        edge_id += 1
                        break

    # Pod → Secret (mounts/references)
    for pod in pods:
        for vol in pod["data"].get("volumes", []):
            if vol.get("type") == "secret":
                secret_name = vol.get("name")
                for sec in secrets:
                    if sec["name"] == secret_name and sec["namespace"] == pod["namespace"]:
                        edges.append({
                            "id": f"e-{edge_id}",
                            "source": pod["id"],
                            "target": sec["id"],
                            "type": "references",
                        })
                        edge_id += 1
                        break

    return edges


def _labels_match(selector: dict, labels: dict) -> bool:
    """Check if all selector key-value pairs exist in labels."""
    if not selector:
        return False
    return all(labels.get(k) == v for k, v in selector.items())
