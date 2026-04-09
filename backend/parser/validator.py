def validate_resources(nodes: list[dict], edges: list[dict]) -> dict:
    """Detect common K8s configuration errors and warnings."""
    errors = []
    warnings = []

    pods = [n for n in nodes if n["kind"] == "Pod"]
    services = [n for n in nodes if n["kind"] == "Service"]
    ingresses = [n for n in nodes if n["kind"] == "Ingress"]

    # Check: Service selector matches no pods
    for svc in services:
        selector = svc["data"].get("selector", {})
        if not selector:
            warnings.append({
                "resource": svc["id"],
                "message": f"Service '{svc['name']}' has no selector defined",
                "suggestion": "Add a selector to match your pod labels",
            })
            continue
        matched = False
        for pod in pods:
            pod_labels = pod["data"].get("labels", {})
            if all(pod_labels.get(k) == v for k, v in selector.items()):
                matched = True
                break
        if not matched:
            errors.append({
                "resource": svc["id"],
                "message": f"Service '{svc['name']}' selector {selector} matches no pods",
                "suggestion": "Ensure pod labels match the service selector",
            })

    # Check: Service port → container port mismatch
    for svc in services:
        svc_ports = svc["data"].get("ports", [])
        selector = svc["data"].get("selector", {})
        for pod in pods:
            pod_labels = pod["data"].get("labels", {})
            if not all(pod_labels.get(k) == v for k, v in selector.items()):
                continue
            pod_ports = set(pod["data"].get("ports", []))
            for sp in svc_ports:
                target_port = sp.get("targetPort")
                if target_port and target_port not in pod_ports:
                    # targetPort could be a string (port name) or int
                    if isinstance(target_port, int):
                        warnings.append({
                            "resource": svc["id"],
                            "message": f"Service '{svc['name']}' targetPort {target_port} not found in pod container ports {list(pod_ports)}",
                            "suggestion": f"Change targetPort to one of: {list(pod_ports)}",
                        })

    # Check: Ingress references non-existent service
    svc_names = {(s["name"], s["namespace"]) for s in services}
    for ing in ingresses:
        for rule in ing["data"].get("rules", []):
            for backend in rule.get("_backends", []):
                svc_name = backend.get("serviceName")
                if svc_name and (svc_name, ing["namespace"]) not in svc_names:
                    errors.append({
                        "resource": ing["id"],
                        "message": f"Ingress '{ing['name']}' references service '{svc_name}' which does not exist",
                        "suggestion": f"Create a Service named '{svc_name}' or fix the ingress backend reference",
                    })

    # Check: Pod with no ports defined
    for pod in pods:
        if not pod["data"].get("ports"):
            warnings.append({
                "resource": pod["id"],
                "message": f"Pod '{pod['name']}' has no container ports defined",
                "suggestion": "Define containerPort in your pod spec for services to route traffic",
            })

    return {
        "errors": errors,
        "warnings": warnings,
    }
