import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './CodeEditor';
import { Exercise } from '../../types';
import { CheckCircle, XCircle, ArrowLeft, Loader2, RefreshCw, PlayCircle } from 'lucide-react';
import { executePythonCode } from '../../utils/pythonExecutor';
import { getErrorMessage } from '../../utils/errorHandling';

interface ExerciseViewProps {
  exercise: Exercise;
  onBack: () => void;
  onComplete: (success: boolean) => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  onBack,
  onComplete,
}) => {
  const [output, setOutput] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>(
    'idle'
  );

  const handleRunCode = useCallback(async (code: string) => {
    setStatus('running');
    setOutput('Running code...');

    try {
      const result = await executePythonCode(code);
      
      if (result.error) {
        setOutput(result.error);
        setStatus('error');
        onComplete(false);
        return;
      }

      const expectedOutput = await executePythonCode(exercise.correctAnswer);
      const isCorrect = result.output.trim() === expectedOutput.output.trim();
      
      setOutput(
        isCorrect
          ? ` Perfect! Your output matches the expected result:\n${result.output}`
          : `Your Output:\n${result.output}\n\nExpected Output:\n${expectedOutput.output}`
      );
      
      setStatus(isCorrect ? 'success' : 'error');
      onComplete(isCorrect);
    } catch (error) {
      setOutput(getErrorMessage(error));
      setStatus('error');
      onComplete(false);
    }
  }, [exercise.correctAnswer, onComplete]);

  const statusConfig = {
    idle: {
      icon: PlayCircle,
      color: 'text-muted-foreground',
      bg: 'bg-accent',
      message: 'Ready to run'
    },
    running: {
      icon: Loader2,
      color: 'text-primary',
      bg: 'bg-primary/10',
      message: 'Running code...'
    },
    success: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      message: 'Success!'
    },
    error: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      message: 'Error'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h2 className="text-lg font-semibold">{exercise.topic}</h2>
        </div>

        <motion.div
          animate={{ 
            scale: status === 'success' ? [1, 1.2, 1] : 1,
            rotate: status === 'success' ? [0, 10, 0] : 0
          }}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            text-sm font-medium ${config.color} ${config.bg}
          `}
        >
          <StatusIcon className={`w-4 h-4 ${status === 'running' ? 'animate-spin' : ''}`} />
          <span>{config.message}</span>
        </motion.div>
      </div>

      {/* Question */}
      <div className="p-4 bg-accent/50">
        <h3 className="font-medium mb-2">Problem</h3>
        <p className="text-muted-foreground">{exercise.question}</p>
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <CodeEditor
          initialCode={exercise.initialCode}
          onRun={handleRunCode}
          language="python"
        />
      </div>

      {/* Output */}
      <AnimatePresence mode="wait">
        {output && (
          <motion.div
            key={output}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 font-mono text-sm whitespace-pre-wrap">
              {output}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseView;