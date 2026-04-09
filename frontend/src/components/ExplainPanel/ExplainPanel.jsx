import Markdown from 'react-markdown';
import { useAppContext } from '../../context/AppContext';
import './ExplainPanel.css';

export default function ExplainPanel() {
  const { explainText, isExplaining, setExplainPanelOpen } = useAppContext();

  return (
    <div className="explain-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) setExplainPanelOpen(false);
    }}>
      <div className="explain-modal">
        <div className="explain-header">
          <h2>
            <span className={`brain-icon${isExplaining ? ' loading' : ''}`}>🧠</span>
            Architecture Explanation
          </h2>
          <button className="close-btn" onClick={() => setExplainPanelOpen(false)}>×</button>
        </div>
        <div className="explain-body">
          {!explainText && isExplaining ? (
            <div className="explain-empty">
              <div className="brain-big">🧠</div>
              <p>Analyzing your Kubernetes architecture...</p>
            </div>
          ) : (
            <div className="markdown-content">
              <Markdown>{explainText}</Markdown>
              {isExplaining && <span className="explain-cursor" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
