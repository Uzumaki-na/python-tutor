import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferences } from '../contexts/PreferencesContext';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SidebarProps {
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const { preferences: { theme } } = usePreferences();

  return (
    <motion.div 
      className="w-64 h-screen bg-card border-r border-border"
      initial={false}
    >
      <div className="px-4 py-6 h-full flex flex-col">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "tween", duration: 0.1 }}
          className="mb-8"
        >
          <Link 
            to="/" 
            className="flex items-center gap-3 text-xl font-semibold text-primary"
          >
            <div className="relative w-8 h-8">
              <img 
                src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="Taanya's Python"
                className="w-full h-full"
              />
            </div>
            <span>Taanya's Python</span>
          </Link>
        </motion.div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-accent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={`w-5 h-5 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`} 
                  />
                  <span className={`${
                    isActive ? 'font-medium' : ''
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Version */}
        <div className="px-3 py-4 text-xs text-muted-foreground">
          Version {import.meta.env.VITE_APP_VERSION}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;