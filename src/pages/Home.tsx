import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Sparkles, 
  Star, 
  Zap, 
  TrendingUp, 
  Heart,
  Coffee
} from 'lucide-react';

const Home: React.FC = () => {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRandomMotivationalQuote = () => {
    const quotes = [
      "Every expert was once a beginner. You've got this! 💫",
      "Small progress is still progress. Keep going! ✨",
      "Your future self will thank you for studying today! 🌟",
      "Learning to code is like having a superpower! ⚡",
      "You're doing amazing! Take it one line at a time. 💝"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl gradient-text font-bold">
          {getTimeBasedGreeting()}, Taanya! 
        </h1>
        <p className="text-lg text-gray-400">
          {getRandomMotivationalQuote()}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-pink-500/20">
            <Star className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Streak</p>
            <p className="text-2xl gradient-text font-bold">3 Days</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Zap className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Topics Mastered</p>
            <p className="text-2xl gradient-text font-bold">12</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <TrendingUp className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Weekly Progress</p>
            <p className="text-2xl gradient-text font-bold">85%</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/20">
            <Heart className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Focus Minutes</p>
            <p className="text-2xl gradient-text font-bold">45</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Link to="/revision" className="card p-6 hover:scale-[1.02] transition-transform">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <Brain className="h-8 w-8 text-pink-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 gradient-text">Continue Flashcards</h3>
              <p className="text-gray-400 mb-4">Review your Python concepts with spaced repetition</p>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span className="text-gray-400">5 cards due for review</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/" className="card p-6 hover:scale-[1.02] transition-transform">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 gradient-text">Continue Learning</h3>
              <p className="text-gray-400 mb-4">Jump back into your Python learning journey</p>
              <div className="flex items-center gap-2 text-sm">
                <Coffee className="h-4 w-4 text-blue-500" />
                <span className="text-gray-400">Next: Advanced Functions</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Today's Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-semibold mb-6 gradient-text">Today's Goals</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-pink-500"></div>
            <span className="flex-1 text-gray-400">Complete 2 Python exercises</span>
            <span className="text-sm text-pink-500">1/2</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <span className="flex-1 text-gray-400">Review flashcards</span>
            <span className="text-sm text-purple-500">5 left</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="flex-1 text-gray-400">Practice coding for 30 minutes</span>
            <span className="text-sm text-blue-500">15 mins</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
