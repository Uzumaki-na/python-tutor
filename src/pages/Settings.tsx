import React from 'react';
import { Bell, Moon, Sun, Book } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl gradient-text">Settings</h1>

      <div className="card divide-y divide-white/10">
        <div className="p-6">
          <h2 className="text-xl gradient-text mb-4">
            Learning Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Book className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium">
                    Daily Learning Goal
                  </p>
                  <p className="text-sm opacity-60">
                    Set your daily exercise target
                  </p>
                </div>
              </div>
              <select className="rounded-lg bg-white/10 border-white/20 focus:border-pink-500 focus:ring-pink-500">
                <option>10 exercises</option>
                <option>15 exercises</option>
                <option>20 exercises</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium">
                    Reminder Notifications
                  </p>
                  <p className="text-sm opacity-60">
                    Get notified about your learning schedule
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 
                              peer-focus:ring-pink-300 rounded-full peer 
                              peer-checked:after:translate-x-full after:content-[''] 
                              after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-5 after:w-5 
                              after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-pink-500" />
                ) : (
                  <Sun className="h-5 w-5 text-pink-500" />
                )}
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm opacity-60">
                    Choose your preferred theme
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="glass-button"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Switch to Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Switch to Dark</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;