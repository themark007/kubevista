import { useAppContext } from '../../context/AppContext';
import './ErrorPanel.css';

export default function ErrorPanel() {
  const { validationResult, setErrorPanelOpen } = useAppContext();

  const errors = validationResult?.errors || [];
  const warnings = validationResult?.warnings || [];
  const all = [
    ...errors.map(e => ({ ...e, level: 'error' })),
    ...warnings.map(w => ({ ...w, level: 'warning' })),
  ];

  return (
    <div className="error-panel">
      <div className="error-panel-header">
        <h3>
          🔍 Issues
          {all.length > 0 && (
            <span style={{ color: 'var(--neon-pink)', fontWeight: 400 }}>({all.length})</span>
          )}
        </h3>
        <button className="close-btn" onClick={() => setErrorPanelOpen(false)}>×</button>
      </div>
      <div className="error-panel-body">
        {all.length === 0 ? (
          <div className="error-panel-empty">
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>✅</div>
            No issues detected
          </div>
        ) : (
          all.map((item, i) => (
            <div
              key={i}
              className={`error-card ${item.level}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="error-icon">{item.level === 'error' ? '🔴' : '🟡'}</span>
              <div className="error-content">
                <div className="error-resource">{item.resource}</div>
                <div className="error-message">{item.message}</div>
                {item.suggestion && (
                  <div className="error-suggestion">💡 {item.suggestion}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
