import { UserProgress, LearningPath } from '../types';
import { API_ENDPOINTS } from './config';
import { apiClient } from './client';

export const progressApi = {
  getOverall: () => 
    apiClient.get<{
      totalExercises: number;
      completedExercises: number;
      averageMastery: number;
      streak: number;
      lastActivity: Date;
    }>(API_ENDPOINTS.exercises.progress),
  
  getByTopic: (topic: string) => 
    apiClient.get<UserProgress>(`${API_ENDPOINTS.exercises.progress}/topic/${encodeURIComponent(topic)}`),
  
  getLearningPaths: () => 
    apiClient.get<LearningPath[]>(`${API_ENDPOINTS.exercises.progress}/paths`),
  
  updateLearningPath: (pathId: string, progress: number) =>
    apiClient.post<LearningPath>(`${API_ENDPOINTS.exercises.progress}/paths/${pathId}`, { progress }),
  
  getDailyStats: () =>
    apiClient.get<{
      exercisesCompleted: number;
      timeSpent: number;
      masteryGained: number;
      date: Date;
    }[]>(`${API_ENDPOINTS.exercises.progress}/daily`),
};
