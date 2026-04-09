from pydantic import BaseModel
from typing import Optional


class ParseRequest(BaseModel):
    yaml_content: str


class NodeData(BaseModel):
    image: Optional[str] = None
    replicas: Optional[int] = None
    ports: Optional[list] = None
    labels: Optional[dict] = None
    selector: Optional[dict] = None
    serviceType: Optional[str] = None
    rules: Optional[list] = None
    dataKeys: Optional[list] = None
    envVars: Optional[list] = None
    volumes: Optional[list] = None


class GraphNode(BaseModel):
    id: str
    kind: str
    name: str
    namespace: str = "default"
    data: dict = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # routes_to, manages, selects, mounts, references


class ParseResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    namespaces: list[str]


class ValidationIssue(BaseModel):
    resource: str
    message: str
    suggestion: Optional[str] = None


class ValidationResponse(BaseModel):
    errors: list[ValidationIssue]
    warnings: list[ValidationIssue]
