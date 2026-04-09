const EDGE_TYPE_MAP = {
  routes_to: 'traffic',
  manages: 'manages',
  selects: 'selects',
  mounts: 'mounts',
  references: 'mounts',
};

export function transformParsedData(parsedData) {
  if (!parsedData) return { nodes: [], edges: [] };

  const { nodes: rawNodes, edges: rawEdges, namespaces } = parsedData;

  // Build namespace group nodes
  const nsNodes = (namespaces || ['default']).map((ns) => ({
    id: `ns-${ns}`,
    type: 'namespace',
    data: { name: ns },
    position: { x: 0, y: 0 },
    style: { width: 800, height: 500 },
  }));

  // Build resource nodes
  const resourceNodes = rawNodes.map((node, index) => {
    const typeMap = {
      Pod: 'pod',
      Deployment: 'deployment',
      Service: 'service',
      Ingress: 'ingress',
      ConfigMap: 'configmap',
      Secret: 'secret',
    };

    return {
      id: node.id,
      type: typeMap[node.kind] || 'pod',
      data: {
        ...node.data,
        name: node.name,
        kind: node.kind,
        namespace: node.namespace,
        index,
      },
      position: { x: 0, y: 0 },
    };
  });

  // Build edges
  const flowEdges = rawEdges.map((edge, index) => ({
    id: edge.id || `e-${index}`,
    source: edge.source,
    target: edge.target,
    type: EDGE_TYPE_MAP[edge.type] || 'manages',
    animated: edge.type === 'routes_to' || edge.type === 'selects',
    data: {
      label: edge.type?.replace('_', ' '),
      edgeType: edge.type,
    },
  }));

  return {
    nodes: [...nsNodes, ...resourceNodes],
    edges: flowEdges,
  };
}

export function applyValidation(nodes, validationResult) {
  if (!validationResult) return nodes;

  const errorMap = {};
  const warningMap = {};

  validationResult.errors?.forEach((err) => {
    if (!errorMap[err.resource]) errorMap[err.resource] = [];
    errorMap[err.resource].push(err);
  });
  validationResult.warnings?.forEach((warn) => {
    if (!warningMap[warn.resource]) warningMap[warn.resource] = [];
    warningMap[warn.resource].push(warn);
  });

  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      errors: errorMap[node.id] || [],
      warnings: warningMap[node.id] || [],
    },
  }));
}

export function applyNetworkFlowDimming(nodes, edges, active) {
  if (!active) {
    return {
      nodes: nodes.map(n => ({ ...n, data: { ...n.data, dimmed: false } })),
      edges,
    };
  }

  // Find all nodes that are part of network paths (Ingress, Service, Pod connected via routes_to/selects)
  const networkNodeIds = new Set();
  edges.forEach((e) => {
    if (e.data?.edgeType === 'routes_to' || e.data?.edgeType === 'selects') {
      networkNodeIds.add(e.source);
      networkNodeIds.add(e.target);
    }
  });

  return {
    nodes: nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        dimmed: n.type !== 'namespace' && !networkNodeIds.has(n.id),
      },
    })),
    edges,
  };
}
