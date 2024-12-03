import React, { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

interface CodeEditorProps {
  initialCode: string;
  onRun: (code: string) => void;
  language?: 'python' | 'javascript';
  readOnly?: boolean;
}

const languageMap = {
  python: [python()],
  javascript: [javascript()]
};

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode, 
  onRun,
  language = 'python',
  readOnly = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
  }, [initialCode]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1">
        <CodeMirror
          value={code}
          height="100%"
          theme={vscodeDark}
          extensions={languageMap[language]}
          onChange={(value) => setCode(value)}
          readOnly={readOnly}
          className="h-full overflow-hidden rounded-lg border border-border"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
        
        {/* Floating Action Buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.button
              key="copy"
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-1.5 rounded-md backdrop-blur-sm
                transition-colors duration-200
                ${copied 
                  ? 'bg-success/10 text-success hover:bg-success/20' 
                  : 'bg-background/80 text-foreground hover:bg-accent'
                }
              `}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </motion.button>
          </AnimatePresence>

          {!readOnly && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="p-1.5 rounded-md bg-background/80 text-foreground hover:bg-accent backdrop-blur-sm transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onRun(code)}
                className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors duration-200"
              >
                <Play className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;