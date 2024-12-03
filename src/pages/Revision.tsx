import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Zap, AlertCircle, History } from 'lucide-react';
import FlashCard from '../components/revision/FlashCard';
import KeyConcepts from '../components/revision/KeyConcepts';
import { FlashCard as FlashCardType, ReviewQuality, Concept } from '../types';
import { FlashcardSpacedRepetition } from '../services/spacedRepetitionFlashcards';

const Revision: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'concepts' | 'history'>('flashcards');
  const [srs] = useState(() => new FlashcardSpacedRepetition());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [dueCards, setDueCards] = useState<FlashCardType[]>([]);
  const [viewedHistory, setViewedHistory] = useState<FlashCardType[]>(() => {
    const saved = localStorage.getItem('flashcardHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const flashcards: FlashCardType[] = [
    {
      id: '1',
      question: "What is a Python decorator?",
      answer: "A decorator is a design pattern that allows you to modify the functionality of a function by wrapping it in another function.",
      category: "Advanced Concepts"
    },
    {
      id: '2',
      question: "Explain list comprehension in Python",
      answer: "List comprehension is a concise way to create lists using a single line of code. It consists of brackets containing an expression followed by a for clause, then zero or more for or if clauses.",
      category: "Core Concepts"
    },
    {
      id: '3',
      question: "What are Python generators?",
      answer: "Generators are functions that return an iterator that yields one item at a time. They use the yield keyword and are memory efficient for handling large datasets.",
      category: "Advanced Concepts"
    },
    {
      id: '4',
      question: "What is the Global Interpreter Lock (GIL)?",
      answer: "The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once. This lock is necessary mainly because CPython's memory management is not thread-safe.",
      category: "Advanced Concepts"
    },
    {
      id: '5',
      question: "Explain Python's garbage collection",
      answer: "Python uses reference counting for memory management, along with a generational garbage collector that handles circular references. Objects with no references are automatically deallocated.",
      category: "Memory Management"
    },
    {
      id: '6',
      question: "What are metaclasses in Python?",
      answer: "Metaclasses are classes for classes. They allow you to customize class creation, enabling you to add or modify methods, attributes, or perform validation when a class is defined.",
      category: "Advanced Concepts"
    },
    {
      id: '7',
      question: "Explain async/await in Python",
      answer: "async/await is Python's syntax for writing asynchronous code. async defines a coroutine function, while await is used to wait for an asynchronous operation to complete without blocking the event loop.",
      category: "Asynchronous Programming"
    },
    {
      id: '8',
      question: "What are Python descriptors?",
      answer: "Descriptors are objects that define how attribute access is intercepted using __get__, __set__, or __delete__ methods. They're the mechanism behind properties, methods, and class methods.",
      category: "Advanced Concepts"
    },
    {
      id: '9',
      question: "Explain Python's MRO (Method Resolution Order)",
      answer: "MRO is the order in which Python searches for methods and attributes in a class hierarchy. Python uses the C3 linearization algorithm to determine the order, which ensures a consistent and logical inheritance pattern.",
      category: "Object-Oriented Programming"
    },
    {
      id: '10',
      question: "What are context managers in Python?",
      answer: "Context managers are objects that implement __enter__ and __exit__ methods, used with the 'with' statement to ensure proper handling of resources (like file handles or network connections).",
      category: "Resource Management"
    }
  ];

  const concepts: Concept[] = [
    {
      id: '1',
      title: 'List Comprehensions',
      description: 'A concise way to create lists based on existing lists or iterables.',
      importance: 'high',
      mastered: true,
      examples: [
        '[x**2 for x in range(10)]',
        '[x for x in range(100) if x % 2 == 0]'
      ]
    },
    {
      id: '2',
      title: 'Decorators',
      description: 'Functions that modify the behavior of other functions.',
      importance: 'medium',
      mastered: false,
      examples: [
        '@property',
        '@staticmethod'
      ]
    },
    {
      id: '3',
      title: 'Context Managers',
      description: 'Objects that manage resource allocation and deallocation.',
      importance: 'high',
      mastered: false,
      examples: [
        'with open("file.txt") as f:',
        'class MyContextManager:'
      ]
    }
  ];

  useEffect(() => {
    // Initialize flashcards in SRS system
    flashcards.forEach(card => srs.addCard(card));
    setDueCards(srs.getDueCards());
  }, []);

  useEffect(() => {
    localStorage.setItem('flashcardHistory', JSON.stringify(viewedHistory));
  }, [viewedHistory]);

  const handleCardReview = (quality: ReviewQuality) => {
    const currentCard = dueCards[currentCardIndex];
    srs.updateCard(currentCard.id, quality);
    
    // Add to history
    setViewedHistory(prev => {
      const newHistory = [currentCard, ...prev].slice(0, 50); // Keep last 50 cards
      return newHistory;
    });
    
    // Update due cards
    setDueCards(srs.getDueCards());
    
    // Move to next card or reset if at end
    if (currentCardIndex >= dueCards.length - 1) {
      setCurrentCardIndex(0);
    } else {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl gradient-text"
        >
          Revision Hub
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-blue-500/20 px-4 py-2 rounded-xl"
        >
          <Brain className="h-5 w-5 text-pink-500 animate-pulse" />
          <span className="gradient-text">
            {dueCards.length} cards due for review
          </span>
        </motion.div>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('flashcards')}
          className={`glass-button ${
            activeTab === 'flashcards' ? '' : 'glass-button-secondary'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Flashcards</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('concepts')}
          className={`glass-button ${
            activeTab === 'concepts' ? '' : 'glass-button-secondary'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Key Concepts</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('history')}
          className={`glass-button ${
            activeTab === 'history' ? '' : 'glass-button-secondary'
          }`}
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </motion.button>
      </div>

      {activeTab === 'flashcards' ? (
        dueCards.length > 0 ? (
          <FlashCard
            {...dueCards[currentCardIndex]}
            onNext={() => setCurrentCardIndex((prev) => 
              (prev + 1) % dueCards.length
            )}
            onReview={handleCardReview}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl gradient-text mb-2">All Caught Up!</h3>
            <p className="text-gray-400">
              No cards due for review. Check back later!
            </p>
          </motion.div>
        )
      ) : activeTab === 'history' ? (
        <div className="space-y-6">
          <h2 className="text-xl gradient-text">Recently Viewed Cards</h2>
          {viewedHistory.length > 0 ? (
            <div className="grid gap-4">
              {viewedHistory.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      <Brain className="h-4 w-4 text-pink-500" />
                    </div>
                    <span className="text-sm text-gray-400">{card.category}</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{card.question}</h3>
                  <p className="text-gray-400">{card.answer}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <History className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl gradient-text mb-2">No History Yet</h3>
              <p className="text-gray-400">
                Start reviewing flashcards to build your history!
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        <KeyConcepts concepts={concepts} />
      )}
    </div>
  );
};

export default Revision;