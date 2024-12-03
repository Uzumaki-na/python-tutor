import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { ReviewQuality } from '../../types';
import FlashCardReview from './FlashCardReview';
import { useTheme } from '../../contexts/ThemeContext';

interface FlashCardProps {
  question: string;
  answer: string;
  category: string;
  onNext: () => void;
  onReview: (quality: ReviewQuality) => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  question,
  answer,
  category,
  onNext,
  onReview,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { theme } = useTheme();

  const handleReview = (quality: ReviewQuality) => {
    onReview(quality);
    setIsFlipped(false);
    onNext();
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className={`relative w-full h-[400px] cursor-pointer`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div 
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="h-full rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 
                        backdrop-blur-lg border border-white/20 p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-pink-500" />
              <span className="text-sm font-medium text-gray-400">{category}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-center gradient-text">{question}</p>
            </div>
            <p className="text-sm text-center text-gray-400 mt-4">Click to reveal answer</p>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 
                        backdrop-blur-lg border border-white/20 p-8 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-xl text-center font-medium px-6 py-4 rounded-lg ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
                style={{
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  textShadow: theme === 'dark'
                    ? '0 1px 2px rgba(0,0,0,0.2)'
                    : 'none'
                }}
              >{answer}</p>
            </div>
            <FlashCardReview onReview={handleReview} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlashCard;