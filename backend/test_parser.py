from parser.yaml_parser import parse_yaml, extract_node, extract_implicit_pods
from parser.relationship_engine import build_relationships

yaml_test = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
"""

resources = parse_yaml(yaml_test)
print(f"Parsed {len(resources)} resources")
nodes = []
for r in resources:
    n = extract_node(r)
    nodes.append(n)
    ip = extract_implicit_pods(r, n["namespace"])
    if ip:
        nodes.append(ip)
print(f"Nodes: {len(nodes)}")
for n in nodes:
    print(f"  {n['id']}")
edges = build_relationships(nodes, resources)
print(f"Edges: {len(edges)}")
for e in edges:
    print(f"  {e['source']} --{e['type']}--> {e['target']}")
