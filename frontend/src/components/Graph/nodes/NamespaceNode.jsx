import { NamespaceIcon } from '../icons/KubeIcons';
import './nodeStyles.css';

export default function NamespaceNode({ data }) {
  return (
    <div className="namespace-node">
      <div className="ns-label">
        <NamespaceIcon size={16} />
        <span>namespace: {data.name}</span>
      </div>
    </div>
  );
}
