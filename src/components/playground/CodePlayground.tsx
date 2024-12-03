import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, RefreshCw, Code as CodeIcon } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { executePythonCode } from '../../utils/pythonExecutor';

const CodePlayground: React.FC = () => {
  const [code, setCode] = useState<string>('# Write your Python code here\nprint("Hello, World!")');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const result = await executePythonCode(code);
      setOutput(result.error || result.output);
    } catch (error) {
      setOutput(error.message);
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode('# Write your Python code here\nprint("Hello, World!")');
    setOutput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CodeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl gradient-text">Code Playground</h2>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="glass-button-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunCode}
            disabled={isRunning}
            className="glass-button"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative">
          <CodeMirror
            value={code}
            height="400px"
            theme="dark"
            extensions={[python()]}
            onChange={(value) => setCode(value)}
            className="rounded-xl overflow-hidden border border-white/20 shadow-lg"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 
                   backdrop-blur-lg border border-white/20 p-4 h-[400px] overflow-auto"
        >
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Output</h3>
          <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {output || 'Run your code to see the output here...'}
          </pre>
        </motion.div>
      </div>
    </div>
  );
};

export default CodePlayground;