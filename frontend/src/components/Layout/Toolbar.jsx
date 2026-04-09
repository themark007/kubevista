import { useAppContext } from '../../context/AppContext';
import { useParseYAML } from '../../hooks/useParseYAML';
import { useExplainYAML } from '../../hooks/useExplainYAML';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { SAMPLE_MICROSERVICE } from '../../data/sampleManifests';
import { KubeIcon } from '../Graph/icons/KubeIcons';
import './Toolbar.css';

export default function Toolbar() {
  const {
    yamlContent, setYamlContent,
    isLoading, networkFlowActive, setNetworkFlowActive,
    validationResult, errorPanelOpen, setErrorPanelOpen,
    setExplainPanelOpen, isExplaining,
  } = useAppContext();

  const { parseYAML } = useParseYAML();
  const { explainYAML } = useExplainYAML();
  useKeyboardShortcuts();

  const errorCount = validationResult
    ? validationResult.errors.length + validationResult.warnings.length
    : 0;

  return (
    <div className="toolbar">
      <div className="toolbar-brand">
        <KubeIcon className="logo" />
        <h1>KubeVista</h1>
      </div>

      <div className="toolbar-divider" />

      <button
        className="toolbar-btn"
        onClick={() => setYamlContent(SAMPLE_MICROSERVICE)}
        title="Load sample K8s manifest"
      >
        <span className="icon">📋</span>
        Sample
      </button>

      <button
        className={`toolbar-btn primary${yamlContent.trim() ? ' pulsing' : ''}`}
        onClick={() => parseYAML(yamlContent)}
        disabled={isLoading || !yamlContent.trim()}
        title="Visualize YAML (Ctrl+Enter)"
      >
        {isLoading ? (
          <span className="toolbar-loading">
            <span className="spinner" />
            Parsing...
          </span>
        ) : (
          <>
            <span className="icon">▶</span>
            Visualize
          </>
        )}
      </button>

      <div className="toolbar-divider" />

      <button
        className={`toolbar-btn${networkFlowActive ? ' active' : ''}`}
        onClick={() => setNetworkFlowActive(!networkFlowActive)}
        title="Toggle network flow visualization"
      >
        <span className="icon">⚡</span>
        Network Flow
      </button>

      <button
        className={`toolbar-btn${errorPanelOpen ? ' active' : ''}`}
        onClick={() => setErrorPanelOpen(!errorPanelOpen)}
        title="Toggle error panel"
      >
        <span className="icon">🔍</span>
        Errors
        {errorCount > 0 && <span className="error-badge">{errorCount}</span>}
      </button>

      <button
        className="toolbar-btn explain"
        onClick={() => {
          setExplainPanelOpen(true);
          explainYAML(yamlContent);
        }}
        disabled={isExplaining || !yamlContent.trim()}
        title="AI Explain (Ctrl+E)"
      >
        <span className="icon">🧠</span>
        {isExplaining ? 'Explaining...' : 'Explain'}
      </button>

      <div className="toolbar-spacer" />

      {networkFlowActive && (
        <div className="speed-control">
          <span>Speed</span>
          <input type="range" min="0.5" max="3" step="0.25" defaultValue="1" />
        </div>
      )}
    </div>
  );
}
