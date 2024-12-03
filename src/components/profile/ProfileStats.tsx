import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Trophy, Zap } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    streak: number;
    totalTime: string;
    exercisesCompleted: number;
    averageScore: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: Target,
      label: 'Current Streak',
      value: `${stats.streak} days`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: stats.totalTime,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Trophy,
      label: 'Exercises',
      value: stats.exercisesCompleted,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
    },
    {
      icon: Zap,
      label: 'Avg. Score',
      value: `${stats.averageScore}%`,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 
                   backdrop-blur-lg border border-white/20 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-lg font-semibold gradient-text">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProfileStats;