import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
  className?: string;
}

const difficultyConfig = {
  beginner: {
    colors: 'from-green-500/20 to-emerald-500/20 text-emerald-500',
    icon: Zap,
    label: 'Beginner Friendly'
  },
  intermediate: {
    colors: 'from-blue-500/20 to-indigo-500/20 text-indigo-500',
    icon: Clock,
    label: 'Intermediate'
  },
  advanced: {
    colors: 'from-purple-500/20 to-pink-500/20 text-pink-500',
    icon: Zap,
    label: 'Advanced'
  },
} as const;

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onClick,
  className = ''
}) => {
  const config = difficultyConfig[exercise.difficulty];
  const DifficultyIcon = config.icon;

  return (
    <motion.button
      onClick={() => onClick(exercise)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full text-left p-6 rounded-xl bg-card
        border border-border hover:border-border-hover
        transition-colors shadow-sm hover:shadow
        focus:outline-none focus:ring-2 focus:ring-primary/50
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-lg">{exercise.topic}</h3>
          <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
            text-xs font-medium bg-gradient-to-r ${config.colors}
          `}>
            <DifficultyIcon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </div>
        </div>
        
        <motion.div
          initial={false}
          animate={{ 
            scale: exercise.masteryLevel >= 0.8 ? [1, 1.2, 1] : 1,
            rotate: exercise.masteryLevel >= 0.8 ? [0, 10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {exercise.masteryLevel >= 0.8 ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <XCircle className="w-6 h-6 text-muted" />
          )}
        </motion.div>
      </div>

      {/* Question Preview */}
      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
        {exercise.question}
      </p>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 bg-accent rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${exercise.masteryLevel * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${config.colors}`}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            Mastery
          </span>
          <span className={`font-medium ${config.colors}`}>
            {Math.round(exercise.masteryLevel * 100)}%
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default ExerciseCard;