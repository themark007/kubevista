import { Handle, Position } from '@xyflow/react';
import { ConfigMapIcon } from '../icons/KubeIcons';
import './nodeStyles.css';

export default function ConfigMapNode({ data, selected }) {
  const status = data.errors?.length ? 'error' : data.warnings?.length ? 'warning' : 'valid';
  return (
    <div className={`kube-node configmap-node${selected ? ' selected' : ''}${data.dimmed ? ' dimmed' : ''}`}
         style={{ animationDelay: `${data.index * 80}ms` }}>
      <Handle type="target" position={Position.Left} />
      <span className={`status-dot ${status}`} />
      <div className="node-header">
        <ConfigMapIcon size={22} />
        <span className="node-kind-badge">ConfigMap</span>
      </div>
      <div className="node-name">{data.name}</div>
      {data.dataKeys?.length > 0 && (
        <div className="node-detail">
          <span className="tag">🗂 {data.dataKeys.length} keys</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
