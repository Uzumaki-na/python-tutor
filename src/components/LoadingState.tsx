import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<Props> = ({ 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <motion.div
        className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        {message}
      </p>
    </div>
  );
};
