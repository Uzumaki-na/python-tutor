import React from 'react';
import { motion } from 'framer-motion';
import { Book, Star } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressRing from '../ui/ProgressRing';

interface TopicCardProps {
  topic: string;
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exerciseCount: number;
  onClick: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  progress,
  difficulty,
  exerciseCount,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 
                 p-6 backdrop-blur-lg border border-white/20 shadow-xl cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 
                    rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-2">{topic}</h3>
            <Badge text={difficulty} variant={
              difficulty === 'beginner' ? 'success' :
              difficulty === 'intermediate' ? 'warning' : 'error'
            } />
          </div>
          <ProgressRing progress={progress} />
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4 text-pink-500" />
            <span className="text-sm text-gray-600">{exerciseCount} exercises</span>
          </div>
          {progress >= 80 && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
              <span className="text-sm text-gray-600">Mastered!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicCard;