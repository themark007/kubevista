import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export function useExplainYAML() {
  const { setExplainText, setIsExplaining } = useAppContext();

  const explainYAML = useCallback(async (yamlContent) => {
    if (!yamlContent?.trim()) return;

    setIsExplaining(true);
    setExplainText('');

    try {
      const res = await fetch(`${API_BASE}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml_content: yamlContent }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to explain' }));
        setExplainText(`Error: ${err.detail || 'Failed to get explanation'}`);
        setIsExplaining(false);
        return;
      }

      // Stream SSE response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                setExplainText((prev) => prev + content);
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (err) {
      setExplainText(`Error: ${err.message}`);
    } finally {
      setIsExplaining(false);
    }
  }, [setExplainText, setIsExplaining]);

  return { explainYAML };
}
