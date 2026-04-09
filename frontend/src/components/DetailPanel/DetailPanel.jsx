import { useAppContext } from '../../context/AppContext';
import { ResourceIcon } from '../Graph/icons/KubeIcons';
import './DetailPanel.css';

const KIND_COLORS = {
  Pod: { bg: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)' },
  Deployment: { bg: 'rgba(0,212,255,0.1)', color: 'var(--neon-cyan)' },
  Service: { bg: 'rgba(181,39,247,0.1)', color: 'var(--neon-purple)' },
  Ingress: { bg: 'rgba(255,0,110,0.1)', color: 'var(--neon-pink)' },
  ConfigMap: { bg: 'rgba(255,190,11,0.1)', color: 'var(--neon-gold)' },
  Secret: { bg: 'rgba(255,190,11,0.1)', color: 'var(--neon-gold)' },
};

export default function DetailPanel() {
  const { selectedNode, closeDetailPanel } = useAppContext();

  if (!selectedNode) return null;

  const { data } = selectedNode;
  const kind = data.kind;
  const kindColor = KIND_COLORS[kind] || { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <div className="header-left">
          <ResourceIcon kind={kind} size={24} />
          <div>
            <span
              className="resource-kind"
              style={{ background: kindColor.bg, color: kindColor.color }}
            >
              {kind}
            </span>
            <div className="resource-name">{data.name}</div>
          </div>
        </div>
        <button className="close-btn" onClick={closeDetailPanel} title="Close (Esc)">×</button>
      </div>

      <div className="detail-panel-body">
        {/* Namespace */}
        {data.namespace && (
          <div className="detail-section">
            <div className="detail-section-title">Namespace</div>
            <div className="detail-value">{data.namespace}</div>
          </div>
        )}

        {/* Image (Pod/Deployment) */}
        {data.image && (
          <div className="detail-section">
            <div className="detail-section-title">Container Image</div>
            <div className="detail-value">{data.image}</div>
          </div>
        )}

        {/* Replicas (Deployment) */}
        {data.replicas !== undefined && (
          <div className="detail-section">
            <div className="detail-section-title">Replicas</div>
            <div className="detail-value">{data.replicas}</div>
          </div>
        )}

        {/* Service Type */}
        {data.serviceType && (
          <div className="detail-section">
            <div className="detail-section-title">Service Type</div>
            <div className="detail-value">{data.serviceType}</div>
          </div>
        )}

        {/* Ports */}
        {data.ports?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Ports</div>
            <div className="port-list">
              {data.ports.map((p, i) => (
                <div key={i} className="port-item">
                  {typeof p === 'object' ? (
                    <>
                      <span className="port-number">{p.port}</span>
                      {p.targetPort && (
                        <>
                          <span className="port-arrow">→</span>
                          <span className="port-number">{p.targetPort}</span>
                        </>
                      )}
                      {p.protocol && <span style={{ color: 'var(--text-muted)' }}>({p.protocol})</span>}
                    </>
                  ) : (
                    <span className="port-number">{p}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        {data.labels && Object.keys(data.labels).length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Labels</div>
            <div className="label-list">
              {Object.entries(data.labels).map(([k, v], i) => (
                <span key={i} className="label-pill">
                  <span className="label-key">{k}:</span>{v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selector (Service) */}
        {data.selector && Object.keys(data.selector).length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Selector</div>
            <div className="label-list">
              {Object.entries(data.selector).map(([k, v], i) => (
                <span key={i} className="label-pill">
                  <span className="label-key">{k}:</span>{v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingress Rules */}
        {data.rules?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Routing Rules</div>
            {data.rules.map((rule, i) => (
              <div key={i} className="ingress-rule">
                <div className="rule-host">🌐 {rule.host || '*'}</div>
                {rule.paths?.map((p, j) => (
                  <div key={j} className="rule-path">{p}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Data Keys (ConfigMap/Secret) */}
        {data.dataKeys?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">{kind === 'Secret' ? 'Secret Keys' : 'Data Keys'}</div>
            <div className="data-key-list">
              {data.dataKeys.map((key, i) => (
                <div key={i} className="data-key-item" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="key-name">{typeof key === 'object' ? key.key : key}</span>
                  {typeof key === 'object' && key.value && (
                    <span className="key-value">{kind === 'Secret' ? '••••••••' : key.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {data.errors?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title" style={{ color: 'var(--neon-pink)' }}>⚠ Errors</div>
            {data.errors.map((err, i) => (
              <div key={i} className="detail-value" style={{ borderColor: 'rgba(255,0,110,0.3)', marginBottom: 6 }}>
                {err.message}
                {err.suggestion && (
                  <div style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--neon-green)' }}>
                    💡 {err.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button className="highlight-deps-btn">
          ✨ Highlight Dependencies
        </button>
      </div>
    </div>
  );
}
