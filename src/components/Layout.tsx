import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ui/ThemeToggle';
import { Brain, Layout as LayoutIcon, Settings, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferences } from '../contexts/PreferencesContext';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorDisplay from './common/ErrorDisplay';

const navItems = [
  { icon: Brain, label: 'Learn', path: '/' },
  { icon: LayoutIcon, label: 'Dashboard', path: '/dashboard' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Layout: React.FC = () => {
  const { 
    preferences: { sidebarOpen },
    isLoading,
    error,
    updatePreferences,
    refresh
  } = usePreferences();

  const toggleSidebar = () => {
    updatePreferences({ sidebarOpen: !sidebarOpen });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay
          error={error}
          message="Failed to load preferences"
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ translateX: -256 }}
            animate={{ translateX: 0 }}
            exit={{ translateX: -256 }}
            transition={{ 
              type: "tween",
              duration: 0.15
            }}
            className="fixed top-0 left-0 h-screen z-30"
          >
            <Sidebar items={navItems} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`flex-1 transition-all duration-150 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-20 h-16 backdrop-blur-md bg-background/80 border-b border-border flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;