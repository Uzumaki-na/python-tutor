import { Exercise } from '../types';

const TOPICS = [
  'Variables and Data Types',
  'Control Flow',
  'Functions',
  'Lists and Tuples',
  'Dictionaries',
  'Sets',
  'List Comprehensions',
  'Error Handling',
  'File I/O',
  'Object-Oriented Programming',
] as const;

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export class ExerciseGenerator {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  generateExercise(topic: string, difficulty: typeof DIFFICULTIES[number]): Exercise {
    const exercises: Record<string, Exercise[]> = {
      'List Comprehensions': [
        {
          id: this.generateId(),
          type: 'code-completion',
          difficulty: 'beginner',
          topic: 'List Comprehensions',
          question: 'Create a list comprehension that generates squares of even numbers from 1 to 10',
          correctAnswer: 'numbers = [x**2 for x in range(1, 11) if x % 2 == 0]\nprint(numbers)',
          explanation: 'List comprehensions provide a concise way to create lists based on existing lists or iterables.',
          masteryLevel: 0,
        },
        {
          id: this.generateId(),
          type: 'code-completion',
          difficulty: 'intermediate',
          topic: 'List Comprehensions',
          question: 'Create a list comprehension that flattens a list of lists',
          correctAnswer: 'nested = [[1, 2], [3, 4], [5, 6]]\nflat = [num for sublist in nested for num in sublist]\nprint(flat)',
          explanation: 'Nested list comprehensions can be used to flatten multi-dimensional lists.',
          masteryLevel: 0,
        },
      ],
      'Error Handling': [
        {
          id: this.generateId(),
          type: 'debugging',
          difficulty: 'beginner',
          topic: 'Error Handling',
          question: 'Fix the try-except block to properly handle division by zero',
          correctAnswer: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(f"Error: {e}")',
          explanation: 'Proper error handling is crucial for writing robust Python programs.',
          masteryLevel: 0,
        },
      ],
    };

    const topicExercises = exercises[topic] || [];
    const difficultyExercises = topicExercises.filter(e => e.difficulty === difficulty);
    
    if (difficultyExercises.length === 0) {
      // Return a default exercise if none found for the topic/difficulty
      return {
        id: this.generateId(),
        type: 'code-completion',
        difficulty,
        topic,
        question: `Write a Python program related to ${topic}`,
        correctAnswer: '# Sample solution\nprint("Hello, World!")',
        explanation: `This is a practice exercise for ${topic}`,
        masteryLevel: 0,
      };
    }

    return {
      ...difficultyExercises[Math.floor(Math.random() * difficultyExercises.length)],
      id: this.generateId(), // Ensure unique ID
    };
  }

  getAvailableTopics(): typeof TOPICS[number][] {
    return [...TOPICS];
  }

  getDifficulties(): typeof DIFFICULTIES[number][] {
    return [...DIFFICULTIES];
  }
}