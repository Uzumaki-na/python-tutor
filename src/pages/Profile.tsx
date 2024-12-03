import React from 'react';
import { motion } from 'framer-motion';
import { User, Award, BookOpen } from 'lucide-react';
import ProfileStats from '../components/profile/ProfileStats';
import SkillTree from '../components/profile/SkillTree';
import AchievementCard from '../components/achievements/AchievementCard';

const Profile: React.FC = () => {
  const stats = {
    streak: 12,
    totalTime: '34.5 hrs',
    exercisesCompleted: 247,
    averageScore: 85,
  };

  const achievements = [
    {
      title: 'Python Pioneer',
      description: 'Complete your first 10 Python exercises',
      progress: 10,
      maxProgress: 10,
      isUnlocked: true,
    },
    {
      title: 'Code Warrior',
      description: 'Maintain a 7-day learning streak',
      progress: 5,
      maxProgress: 7,
      isUnlocked: false,
    },
    {
      title: 'Algorithm Ace',
      description: 'Score 100% on 5 algorithm challenges',
      progress: 3,
      maxProgress: 5,
      isUnlocked: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl gradient-text"
        >
          Your Profile
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-blue-500/20 px-4 py-2 rounded-xl"
        >
          <User className="h-5 w-5 text-pink-500" />
          <span className="gradient-text">Taanya</span>
        </motion.div>
      </div>

      <ProfileStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl gradient-text">Achievements</h2>
          </div>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.title}
                {...achievement}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl gradient-text">Skill Tree</h2>
          </div>
          <SkillTree />
        </div>
      </div>
    </div>
  );
};

export default Profile;