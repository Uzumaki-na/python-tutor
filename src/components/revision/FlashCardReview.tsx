import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { ReviewQuality } from '../../types';

interface FlashCardReviewProps {
  onReview: (quality: ReviewQuality) => void;
}

const FlashCardReview: React.FC<FlashCardReviewProps> = ({ onReview }) => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onReview('hard')}
        className="p-3 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30"
      >
        <ThumbsDown className="h-5 w-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onReview('medium')}
        className="p-3 rounded-full bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
      >
        <Minus className="h-5 w-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onReview('easy')}
        className="p-3 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500/30"
      >
        <ThumbsUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
};

export default FlashCardReview;