import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppContext } from '../../context/AppContext';
import { transformParsedData, applyValidation, applyNetworkFlowDimming } from '../../utils/transformResponse';
import { applyDagreLayout } from '../../utils/layoutEngine';

import PodNode from './nodes/PodNode';
import DeploymentNode from './nodes/DeploymentNode';
import ServiceNode from './nodes/ServiceNode';
import IngressNode from './nodes/IngressNode';
import ConfigMapNode from './nodes/ConfigMapNode';
import SecretNode from './nodes/SecretNode';
import NamespaceNode from './nodes/NamespaceNode';
import { TrafficEdge, ManagesEdge, SelectsEdge, MountsEdge } from './edges/CustomEdges';
import { KubeIcon } from './icons/KubeIcons';
import './GraphCanvas.css';

const nodeTypes = {
  pod: PodNode,
  deployment: DeploymentNode,
  service: ServiceNode,
  ingress: IngressNode,
  configmap: ConfigMapNode,
  secret: SecretNode,
  namespace: NamespaceNode,
};

const edgeTypes = {
  traffic: TrafficEdge,
  manages: ManagesEdge,
  selects: SelectsEdge,
  mounts: MountsEdge,
};

export default function GraphCanvas() {
  const {
    parsedData,
    validationResult,
    networkFlowActive,
    selectNode,
    closeDetailPanel,
    error,
  } = useAppContext();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDone, setLayoutDone] = useState(false);

  // Transform and layout when parsedData changes
  useEffect(() => {
    if (!parsedData) {
      setNodes([]);
      setEdges([]);
      setLayoutDone(false);
      return;
    }

    let { nodes: rawNodes, edges: rawEdges } = transformParsedData(parsedData);

    // Apply validation decorations
    rawNodes = applyValidation(rawNodes, validationResult);

    // Apply layout
    const { nodes: laidOut, edges: laidOutEdges } = applyDagreLayout(rawNodes, rawEdges);

    setNodes(laidOut);
    setEdges(laidOutEdges);
    setLayoutDone(true);
  }, [parsedData, validationResult, setNodes, setEdges]);

  // Apply network flow dimming
  useEffect(() => {
    if (!layoutDone) return;
    setNodes((nds) => {
      const { nodes: dimmed } = applyNetworkFlowDimming(nds, edges, networkFlowActive);
      return dimmed;
    });
  }, [networkFlowActive, layoutDone, edges, setNodes]);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'namespace') return;
    selectNode(node);
  }, [selectNode]);

  const onPaneClick = useCallback(() => {
    closeDetailPanel();
  }, [closeDetailPanel]);

  // Empty state
  if (!parsedData && !error) {
    return (
      <div className="graph-empty">
        <KubeIcon className="empty-icon" />
        <h2>Paste YAML to visualize</h2>
        <p>
          Load a sample or paste your Kubernetes YAML in the editor, then click
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or the <strong>Visualize</strong> button.
        </p>
      </div>
    );
  }

  return (
    <div className="graph-canvas-wrapper">
      {error && <div className="graph-error">{error}</div>}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const colors = {
              pod: '#00ff88',
              deployment: '#00d4ff',
              service: '#b527f7',
              ingress: '#ff006e',
              configmap: '#ffbe0b',
              secret: '#ffbe0b',
              namespace: '#4895ef',
            };
            return colors[n.type] || '#666';
          }}
          maskColor="rgba(10, 14, 39, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
