import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import PDFManager from '../components/PDFManager';
import ExerciseList from '../components/ExerciseList';
import { motion } from 'framer-motion';
import ExerciseCard from '../components/exercises/ExerciseCard';
import ExerciseView from '../components/exercises/ExerciseView';
import TopicCard from '../components/learning/TopicCard';
import LearningPath from '../components/learning/LearningPath';
import CodePlayground from '../components/playground/CodePlayground';
import { useExerciseSystem } from '../hooks/useExerciseSystem';
import { getErrorMessage } from '../utils/errorHandling';
import ErrorDisplay from '../components/common/ErrorDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, Code, Bug, Brain, Sparkles, ArrowRight } from 'lucide-react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      duration: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.15 }
  }
};

const Learn: React.FC = () => {
  const {
    exercises,
    currentExercise,
    setCurrentExercise,
    handleExerciseComplete,
    getDueExercises,
    generateNewExercise,
    availableTopics,
    isLoading,
    error,
    refresh
  } = useExerciseSystem();

  const [showPlayground, setShowPlayground] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dueExercises = getDueExercises();

  const handleExerciseSuccess = useCallback(async (success: boolean) => {
    if (!currentExercise) return;
    
    try {
      await handleExerciseComplete(currentExercise.id, success);
      // Optionally show success message
    } catch (error) {
      console.error('Failed to complete exercise:', getErrorMessage(error));
      // Show error message to user
    }
  }, [currentExercise, handleExerciseComplete]);

  const handleGenerateExercise = useCallback(async (topic: string) => {
    try {
      const exercise = await generateNewExercise(topic, 'beginner');
      setCurrentExercise(exercise);
    } catch (error) {
      console.error('Failed to generate exercise:', getErrorMessage(error));
      // Show error message to user
    }
  }, [generateNewExercise, setCurrentExercise]);

  const tabs = [
    { name: 'Learning Materials', component: <PDFManager /> },
    { name: 'Exercises', component: <ExerciseList /> },
    { name: 'Learning Progress', component: (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-8"
      >
        {/* Learning Progress Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Your Learning Progress
          </h2>
          <LearningPath exercises={exercises} />
        </section>

        {/* Due Exercises Section */}
        {dueExercises.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Ready to Practice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {dueExercises.map(exercise => (
                  <motion.div
                    key={exercise.id}
                    variants={itemVariants}
                    layout
                  >
                    <ExerciseCard
                      exercise={exercise}
                      onClick={() => setCurrentExercise(exercise)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Topics Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {availableTopics.map(topic => (
                <motion.div
                  key={topic}
                  variants={itemVariants}
                  layout
                >
                  <TopicCard
                    topic={topic}
                    isSelected={selectedTopic === topic}
                    onClick={() => {
                      setSelectedTopic(topic);
                      handleGenerateExercise(topic);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Code Playground Toggle */}
        <section className="fixed bottom-6 right-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlayground(!showPlayground)}
            className="bg-primary text-white p-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <Code className="w-6 h-6" />
            {showPlayground ? 'Hide Playground' : 'Open Playground'}
          </motion.button>
        </section>

        {/* Code Playground */}
        <AnimatePresence>
          {showPlayground && (
            <CodePlayground onClose={() => setShowPlayground(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    ) },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorDisplay 
          error={error} 
          onRetry={refresh}
          message="Failed to load exercises" 
        />
      </div>
    );
  }

  if (currentExercise) {
    return (
      <ExerciseView
        exercise={currentExercise}
        onComplete={handleExerciseSuccess}
        onBack={() => setCurrentExercise(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Learn Python
        </h1>

        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-6">
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'rounded-xl bg-white p-3',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.component}
                </motion.div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </motion.div>
    </div>
  );
};

export default Learn;