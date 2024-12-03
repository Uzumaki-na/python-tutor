export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'code-completion' | 'debugging' | 'practical';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  lastReviewed?: Date;
  nextReview?: Date;
  masteryLevel: number;
}

export interface UserProgress {
  topic: string;
  masteryLevel: number;
  exercisesCompleted: number;
  lastActivity: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  topics: string[];
  difficulty: string;
  progress: number;
}

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  category: string;
  interval?: number;
  nextReview?: string;
  easeFactor?: number;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  mastered: boolean;
  examples?: string[];
  relatedTopics?: string[];
}

export type ReviewQuality = 'easy' | 'medium' | 'hard';