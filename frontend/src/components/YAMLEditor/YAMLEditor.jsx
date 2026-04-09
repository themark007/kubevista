import { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useAppContext } from '../../context/AppContext';
import './YAMLEditor.css';

export default function YAMLEditor() {
  const { yamlContent, setYamlContent } = useAppContext();
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef(null);

  const handleChange = useCallback((value) => {
    setYamlContent(value || '');
    setIsTyping(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  }, [setYamlContent]);

  const handleMount = useCallback((editor) => {
    editor.updateOptions({
      fontSize: 13,
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 12 },
      renderLineHighlight: 'gutter',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
    });
  }, []);

  return (
    <div className="yaml-editor-wrapper">
      <div className="yaml-editor-header">
        <div className="title">
          <span className={`dot ${yamlContent.trim() ? 'has-content' : 'empty'}`} />
          YAML Editor
        </div>
        <span>{yamlContent.split('\n').length} lines</span>
      </div>
      <div className={`yaml-editor-container${isTyping ? ' typing' : ''}`}>
        <Editor
          height="100%"
          language="yaml"
          theme="vs-dark"
          value={yamlContent}
          onChange={handleChange}
          onMount={handleMount}
          options={{
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
