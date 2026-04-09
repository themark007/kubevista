import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [yamlContent, setYamlContent] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkFlowActive, setNetworkFlowActive] = useState(false);
  const [error, setError] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const [explainPanelOpen, setExplainPanelOpen] = useState(false);
  const [explainText, setExplainText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const selectNode = useCallback((node) => {
    setSelectedNode(node);
    setDetailPanelOpen(!!node);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setSelectedNode(null);
    setDetailPanelOpen(false);
  }, []);

  const value = {
    yamlContent, setYamlContent,
    parsedData, setParsedData,
    validationResult, setValidationResult,
    selectedNode, selectNode,
    isLoading, setIsLoading,
    networkFlowActive, setNetworkFlowActive,
    error, setError,
    detailPanelOpen, closeDetailPanel,
    errorPanelOpen, setErrorPanelOpen,
    explainPanelOpen, setExplainPanelOpen,
    explainText, setExplainText,
    isExplaining, setIsExplaining,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
