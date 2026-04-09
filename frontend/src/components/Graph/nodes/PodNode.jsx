import { Handle, Position } from '@xyflow/react';
import { PodIcon } from '../icons/KubeIcons';
import './nodeStyles.css';

export default function PodNode({ data, selected }) {
  const status = data.errors?.length ? 'error' : data.warnings?.length ? 'warning' : 'valid';
  return (
    <div className={`kube-node pod-node${selected ? ' selected' : ''}${data.dimmed ? ' dimmed' : ''}`}
         style={{ animationDelay: `${data.index * 80}ms` }}>
      <Handle type="target" position={Position.Left} />
      <span className={`status-dot ${status}`} />
      <div className="node-header">
        <PodIcon size={22} />
        <span className="node-kind-badge">Pod</span>
      </div>
      <div className="node-name">{data.name}</div>
      {data.image && (
        <div className="node-detail">
          <span className="tag">📦 {data.image}</span>
        </div>
      )}
      {data.ports?.length > 0 && (
        <div className="port-badges">
          {data.ports.map((p, i) => (
            <span key={i} className="port-badge">:{p}</span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
