import { Handle, Position } from '@xyflow/react';
import { IngressIcon } from '../icons/KubeIcons';
import './nodeStyles.css';

export default function IngressNode({ data, selected }) {
  const status = data.errors?.length ? 'error' : data.warnings?.length ? 'warning' : 'valid';
  return (
    <div className={`kube-node ingress-node${selected ? ' selected' : ''}${data.dimmed ? ' dimmed' : ''}`}
         style={{ animationDelay: `${data.index * 80}ms` }}>
      <Handle type="target" position={Position.Left} />
      <span className={`status-dot ${status}`} />
      <div className="globe-ring" />
      <div className="node-header">
        <IngressIcon size={22} />
        <span className="node-kind-badge">Ingress</span>
      </div>
      <div className="node-name">{data.name}</div>
      {data.rules?.map((rule, i) => (
        <div key={i} className="node-detail">
          <span className="tag">🌐 {rule.host || '*'}{rule.paths?.join(', ')}</span>
        </div>
      ))}
      <div className="external-badge">
        <span>↗ External Access</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
