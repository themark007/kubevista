import Dagre from '@dagrejs/dagre';

export function applyDagreLayout(nodes, edges, direction = 'LR') {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  // Separate namespace (group) nodes and regular nodes
  const namespaceNodes = nodes.filter(n => n.type === 'namespace');
  const regularNodes = nodes.filter(n => n.type !== 'namespace');

  // Add regular nodes to dagre
  regularNodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.measured?.width || 220,
      height: node.measured?.height || 100,
    });
  });

  // Add edges
  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  Dagre.layout(g);

  // Position regular nodes
  const positionedNodes = regularNodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - (node.measured?.width || 220) / 2,
        y: pos.y - (node.measured?.height || 100) / 2,
      },
    };
  });

  // Calculate namespace bounds and position them
  const namespaceBounds = {};
  positionedNodes.forEach((node) => {
    const ns = node.data?.namespace || 'default';
    if (!namespaceBounds[ns]) {
      namespaceBounds[ns] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    }
    const b = namespaceBounds[ns];
    const w = node.measured?.width || 220;
    const h = node.measured?.height || 100;
    b.minX = Math.min(b.minX, node.position.x);
    b.minY = Math.min(b.minY, node.position.y);
    b.maxX = Math.max(b.maxX, node.position.x + w);
    b.maxY = Math.max(b.maxY, node.position.y + h);
  });

  const padding = 40;
  const headerHeight = 40;

  const positionedNamespaces = namespaceNodes.map((ns) => {
    const bounds = namespaceBounds[ns.data.name];
    if (!bounds || bounds.minX === Infinity) {
      return { ...ns, position: { x: 0, y: 0 }, style: { width: 300, height: 200 } };
    }
    return {
      ...ns,
      position: {
        x: bounds.minX - padding,
        y: bounds.minY - padding - headerHeight,
      },
      style: {
        width: bounds.maxX - bounds.minX + padding * 2,
        height: bounds.maxY - bounds.minY + padding * 2 + headerHeight,
      },
    };
  });

  return {
    nodes: [...positionedNamespaces, ...positionedNodes],
    edges,
  };
}
