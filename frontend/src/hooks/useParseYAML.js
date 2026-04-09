import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export function useParseYAML() {
  const { setParsedData, setValidationResult, setIsLoading, setError } = useAppContext();

  const parseYAML = useCallback(async (yamlContent) => {
    if (!yamlContent?.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Parse
      const parseRes = await fetch(`${API_BASE}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml_content: yamlContent }),
      });

      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.detail || 'Failed to parse YAML');
      }

      const parsed = await parseRes.json();
      setParsedData(parsed);

      // Validate
      try {
        const valRes = await fetch(`${API_BASE}/api/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yaml_content: yamlContent }),
        });
        if (valRes.ok) {
          const validation = await valRes.json();
          setValidationResult(validation);
        }
      } catch {
        // Validation is non-critical
      }
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  }, [setParsedData, setValidationResult, setIsLoading, setError]);

  return { parseYAML };
}
