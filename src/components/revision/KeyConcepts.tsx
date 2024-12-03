import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, CheckCircle } from 'lucide-react';

interface Concept {
  id: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  mastered: boolean;
}

interface KeyConceptsProps {
  concepts: Concept[];
  onConceptClick: (concept: Concept) => void;
}

const KeyConcepts: React.FC<KeyConceptsProps> = ({ concepts, onConceptClick }) => {
  const importanceColors = {
    high: 'from-pink-500/20 to-red-500/20',
    medium: 'from-blue-500/20 to-purple-500/20',
    low: 'from-green-500/20 to-emerald-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl gradient-text">Key Concepts</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, index) => (
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onConceptClick(concept)}
            className={`relative overflow-hidden rounded-xl cursor-pointer
                      bg-gradient-to-br ${importanceColors[concept.importance]}
                      backdrop-blur-lg border border-white/20 p-6 hover:shadow-lg
                      transition-all duration-300`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold gradient-text">{concept.title}</h3>
              {concept.mastered ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Star className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-gray-400 text-sm">{concept.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default KeyConcepts;