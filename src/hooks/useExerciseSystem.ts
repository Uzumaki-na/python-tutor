import { useState, useEffect, useCallback } from 'react';
import { Exercise, ExerciseProgress } from '../types';
import { exerciseAPI } from '../api/exercises';
import { useLoadingState } from './useLoadingState';
import { getErrorMessage } from '../utils/errorHandling';
import { ApiResponse, PaginatedResponse } from '../api';

interface ExerciseSystemState {
  currentExercise: Exercise | null;
  exercises: Exercise[];
  isLoading: boolean;
  error: Error | null;
  handleExerciseComplete: (exerciseId: string, wasCorrect: boolean) => Promise<void>;
  getDueExercises: () => Exercise[];
  generateNewExercise: (topic: string, difficulty: Exercise['difficulty']) => Promise<Exercise>;
  setCurrentExercise: (exercise: Exercise | null) => void;
  availableTopics: string[];
  refresh: () => Promise<void>;
}

export function useExerciseSystem(): ExerciseSystemState {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  
  const { 
    data: exercises,
    isLoading,
    error,
    execute: loadExercises,
    refresh
  } = useLoadingState<Exercise[]>([], {
    key: 'exercises',
    ttl: 5 * 60 * 1000 // 5 minutes cache
  });

  // Load exercises on mount
  useEffect(() => {
    loadExercises(exerciseAPI.getExercises())
      .catch(error => {
        console.error('Failed to load exercises:', getErrorMessage(error));
      });
  }, [loadExercises]);

  const handleExerciseComplete = useCallback(async (exerciseId: string, wasCorrect: boolean) => {
    if (!currentExercise) return;

    try {
      await exerciseAPI.submitSolution(exerciseId, wasCorrect.toString());
      await refresh();
    } catch (error) {
      console.error('Failed to complete exercise:', getErrorMessage(error));
    }
  }, [currentExercise, refresh]);

  const getDueExercises = useCallback(() => {
    return exercises.filter(exercise => {
      // Add your due exercise logic here
      return true; // For now, return all exercises
    });
  }, [exercises]);

  const generateNewExercise = useCallback(async (topic: string, difficulty: Exercise['difficulty']) => {
    const response = await exerciseAPI.generateExercises({
      topic,
      difficulty,
      count: 1
    });
    
    if (response.length > 0) {
      await refresh();
      return response[0];
    }
    throw new Error('No exercise generated');
  }, [refresh]);

  // Get unique topics from exercises
  const availableTopics = [...new Set(exercises.map(ex => ex.topic))];

  return {
    currentExercise,
    exercises,
    isLoading,
    error,
    handleExerciseComplete,
    getDueExercises,
    generateNewExercise,
    setCurrentExercise,
    availableTopics,
    refresh
  };
}