import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';

interface LearningPathProps {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
  onStart: () => void;
}

const LearningPath: React.FC<LearningPathProps> = ({
  title,
  description,
  difficulty,
  duration,
  progress,
  onStart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 
                 p-8 backdrop-blur-lg border border-white/20 shadow-xl"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                    rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          <h2 className="text-2xl font-bold gradient-text">{title}</h2>
        </div>
        
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="flex items-center gap-4 mb-6">
          <Badge text={difficulty} variant={
            difficulty === 'beginner' ? 'success' :
            difficulty === 'intermediate' ? 'warning' : 'error'
          } />
          <span className="text-sm text-gray-600">{duration}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 
                     text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPath;