from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from models import ParseRequest
from parser.yaml_parser import parse_yaml, extract_node, extract_implicit_pods
from parser.relationship_engine import build_relationships
from parser.validator import validate_resources
from ai.explain import stream_explanation

import os

load_dotenv()

app = FastAPI(title="KubeVista API", version="1.0.0")

# Build CORS origins: local defaults + any extra origins from CORS_ORIGINS env var
_extra = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
_allowed_origins = ["http://localhost:5173", "http://localhost:3000"] + _extra

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _process_yaml(yaml_content: str):
    """Parse YAML and extract nodes, edges, namespaces."""
    try:
        resources = parse_yaml(yaml_content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not resources:
        raise HTTPException(status_code=400, detail="No valid Kubernetes resources found in YAML")

    # Extract nodes
    nodes = []
    namespaces = set()
    seen_ids = set()

    for res in resources:
        node = extract_node(res)
        if node["id"] not in seen_ids:
            nodes.append(node)
            seen_ids.add(node["id"])
        namespaces.add(node["namespace"])

        # Create implicit pods for Deployments etc.
        implicit_pod = extract_implicit_pods(res, node["namespace"])
        if implicit_pod and implicit_pod["id"] not in seen_ids:
            nodes.append(implicit_pod)
            seen_ids.add(implicit_pod["id"])

    # Build relationships
    edges = build_relationships(nodes, resources)

    return nodes, edges, sorted(namespaces)


@app.post("/api/parse")
async def parse_manifests(req: ParseRequest):
    nodes, edges, namespaces = _process_yaml(req.yaml_content)
    return {
        "nodes": nodes,
        "edges": edges,
        "namespaces": namespaces,
    }


@app.post("/api/validate")
async def validate_manifests(req: ParseRequest):
    nodes, edges, _ = _process_yaml(req.yaml_content)
    result = validate_resources(nodes, edges)
    return result


@app.post("/api/explain")
async def explain_manifests(req: ParseRequest):
    return StreamingResponse(
        stream_explanation(req.yaml_content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
