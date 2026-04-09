import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParseYAML } from './useParseYAML';
import { useExplainYAML } from './useExplainYAML';

export function useKeyboardShortcuts() {
  const {
    yamlContent,
    closeDetailPanel,
    setErrorPanelOpen,
    setExplainPanelOpen,
  } = useAppContext();

  const { parseYAML } = useParseYAML();
  const { explainYAML } = useExplainYAML();

  useEffect(() => {
    const handler = (e) => {
      // Ctrl/Cmd + Enter = Visualize
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        parseYAML(yamlContent);
      }
      // Ctrl/Cmd + E = Explain
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setExplainPanelOpen(true);
        explainYAML(yamlContent);
      }
      // Escape = close panels
      if (e.key === 'Escape') {
        closeDetailPanel();
        setErrorPanelOpen(false);
        setExplainPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [yamlContent, parseYAML, explainYAML, closeDetailPanel, setErrorPanelOpen, setExplainPanelOpen]);
}
