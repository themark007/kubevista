import { Handle, Position } from '@xyflow/react';
import { DeploymentIcon } from '../icons/KubeIcons';
import './nodeStyles.css';

export default function DeploymentNode({ data, selected }) {
  const status = data.errors?.length ? 'error' : data.warnings?.length ? 'warning' : 'valid';
  return (
    <div className={`kube-node deployment-node${selected ? ' selected' : ''}${data.dimmed ? ' dimmed' : ''}`}
         style={{ animationDelay: `${data.index * 80}ms` }}>
      <Handle type="target" position={Position.Left} />
      <span className={`status-dot ${status}`} />
      <div className="node-header">
        <DeploymentIcon size={22} />
        <span className="node-kind-badge">Deployment</span>
      </div>
      <div className="node-name">{data.name}</div>
      <div className="node-detail">
        {data.replicas !== undefined && (
          <span className="tag">⬡ {data.replicas} replicas</span>
        )}
        {data.image && <span className="tag">📦 {data.image}</span>}
      </div>
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
