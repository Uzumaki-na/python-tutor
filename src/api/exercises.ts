import { apiClient } from './client';
import { Exercise, ExerciseProgress } from '../types/exercise';

export interface ExerciseFilters {
  topic?: string;
  difficulty?: string;
  completed?: boolean;
}

export const exerciseAPI = {
  // Get all exercises
  getExercises: async (filters?: ExerciseFilters) => {
    const response = await apiClient.get<Exercise[]>('/exercises', { params: filters });
    return response.data;
  },

  // Get a specific exercise
  getExercise: async (id: string) => {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`);
    return response.data;
  },

  // Submit an exercise solution
  submitSolution: async (id: string, solution: string) => {
    const response = await apiClient.post<ExerciseProgress>(`/exercises/${id}/submit`, { solution });
    return response.data;
  },

  // Get exercise progress
  getProgress: async () => {
    const response = await apiClient.get<ExerciseProgress[]>('/exercises/progress');
    return response.data;
  },

  // Generate new exercises
  generateExercises: async (params: {
    pdf_path?: string;
    topic?: string;
    difficulty?: string;
    count?: number;
  }) => {
    const response = await apiClient.post<Exercise[]>('/exercises/generate', params);
    return response.data;
  },
};
