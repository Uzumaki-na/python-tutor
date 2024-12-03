import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../api/exercises';
import { Exercise } from '../types/exercise';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [solution, setSolution] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const exerciseList = await exerciseAPI.getExercises();
      setExercises(exerciseList);
    } catch (error) {
      showToast('Error loading exercises', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!selectedExercise) return;

    try {
      await exerciseAPI.submitSolution(selectedExercise.id, solution);
      showToast('Solution submitted successfully!', 'success');
      setSelectedExercise(null);
      setSolution('');
      loadExercises(); // Refresh the list
    } catch (error) {
      showToast('Error submitting solution', 'error');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Exercises</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{exercise.topic}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Type: {exercise.type}
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExercise(exercise);
                      }}
                    >
                      Start Exercise
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Exercise Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">{selectedExercise.topic}</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="whitespace-pre-wrap">
                    {selectedExercise.content}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Solution
                  </label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    className="w-full h-40 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your solution here..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedExercise(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitSolution}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {exercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No exercises available. Upload some PDFs to generate exercises!
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
