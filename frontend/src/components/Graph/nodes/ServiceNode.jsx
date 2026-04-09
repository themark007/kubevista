import { Handle, Position } from '@xyflow/react';
import { ServiceIcon } from '../icons/KubeIcons';
import './nodeStyles.css';

export default function ServiceNode({ data, selected }) {
  const status = data.errors?.length ? 'error' : data.warnings?.length ? 'warning' : 'valid';
  return (
    <div className={`kube-node service-node${selected ? ' selected' : ''}${data.dimmed ? ' dimmed' : ''}`}
         style={{ animationDelay: `${data.index * 80}ms` }}>
      <Handle type="target" position={Position.Left} />
      <span className={`status-dot ${status}`} />
      <div className="node-header">
        <ServiceIcon size={22} />
        <span className="node-kind-badge">Service</span>
      </div>
      <div className="node-name">{data.name}</div>
      <div className="node-detail">
        {data.serviceType && (
          <span className="tag">{data.serviceType}</span>
        )}
      </div>
      {data.ports?.length > 0 && (
        <div className="port-badges">
          {data.ports.map((p, i) => (
            <span key={i} className="port-badge">
              :{p.port}{p.targetPort ? ` → :${p.targetPort}` : ''}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
