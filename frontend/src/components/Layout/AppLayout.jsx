import { useAppContext } from '../../context/AppContext';
import Toolbar from './Toolbar';
import YAMLEditor from '../YAMLEditor/YAMLEditor';
import GraphCanvas from '../Graph/GraphCanvas';
import DetailPanel from '../DetailPanel/DetailPanel';
import ErrorPanel from '../ErrorPanel/ErrorPanel';
import ExplainPanel from '../ExplainPanel/ExplainPanel';
import './AppLayout.css';

export default function AppLayout() {
  const { detailPanelOpen, errorPanelOpen, explainPanelOpen } = useAppContext();

  return (
    <div className={`app-layout${detailPanelOpen ? ' detail-open' : ''}`}>
      <div className="toolbar-area">
        <Toolbar />
      </div>

      <div className="editor-area">
        <YAMLEditor />
      </div>

      <div className="graph-area">
        <GraphCanvas />
        {errorPanelOpen && (
          <div className="error-panel-area">
            <ErrorPanel />
          </div>
        )}
      </div>

      {detailPanelOpen && (
        <div className="detail-area">
          <DetailPanel />
        </div>
      )}

      {explainPanelOpen && <ExplainPanel />}
    </div>
  );
}
