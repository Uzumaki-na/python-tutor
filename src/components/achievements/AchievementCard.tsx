import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';

interface AchievementCardProps {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  icon?: React.ReactNode;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  progress,
  maxProgress,
  isUnlocked,
  icon,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-4 backdrop-blur-lg border shadow-lg
                 ${isUnlocked 
                   ? 'bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/20' 
                   : 'bg-gradient-to-br from-gray-500/10 via-gray-600/10 to-gray-700/10 border-gray-500/20'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${isUnlocked ? 'bg-yellow-500/20' : 'bg-gray-500/20'}`}>
          {icon || <Trophy className={`h-6 w-6 ${isUnlocked ? 'text-yellow-500' : 'text-gray-500'}`} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${isUnlocked ? 'text-yellow-500' : 'text-gray-500'}`}>
              {title}
            </h3>
            {!isUnlocked && <Lock className="h-4 w-4 text-gray-400" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{progress} / {maxProgress}</span>
              <span className="text-gray-600">{Math.round((progress / maxProgress) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress / maxProgress) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;