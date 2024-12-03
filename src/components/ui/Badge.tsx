import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Badge: React.FC<BadgeProps> = ({ text, variant = 'default' }) => {
  const variants = {
    default: 'from-blue-500 to-purple-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    error: 'from-red-500 to-pink-500',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                 bg-gradient-to-r ${variants[variant]} text-white shadow-lg`}
    >
      {text}
    </motion.span>
  );
};

export default Badge;