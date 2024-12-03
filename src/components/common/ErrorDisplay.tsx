import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../../utils/errorHandling';

interface ErrorDisplayProps {
  error: Error;
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  message = 'Something went wrong',
  onRetry 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col items-center justify-center p-6 space-y-4 text-center"
    >
      <AlertCircle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-semibold">{message}</h2>
      <p className="text-gray-600 dark:text-gray-400">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorDisplay;
