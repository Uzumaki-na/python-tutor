import { FlashCard, ReviewQuality } from '../types';
import { API_ENDPOINTS } from './config';
import { apiClient } from './client';

export const flashcardApi = {
  // Get all flashcards
  getAll: async () => {
    const response = await apiClient.get<FlashCard[]>(API_ENDPOINTS.flashcards.base);
    return response.data;
  },

  // Get flashcards due for review
  getDue: async () => {
    const response = await apiClient.get<FlashCard[]>(`${API_ENDPOINTS.flashcards.base}/due`);
    return response.data;
  },

  // Generate flashcards from PDF
  generate: async (pdfPath: string) => {
    const response = await apiClient.post<FlashCard[]>(API_ENDPOINTS.flashcards.generate, { pdf_path: pdfPath });
    return response.data;
  },

  // Submit flashcard review
  submitReview: async (cardId: string, quality: ReviewQuality) => {
    const response = await apiClient.post<FlashCard>(`${API_ENDPOINTS.flashcards.review}/${cardId}`, { quality });
    return response.data;
  },

  // Get review statistics
  getStats: async () => {
    const response = await apiClient.get<{
      totalCards: number;
      dueCards: number;
      masteredCards: number;
      averageStrength: number;
    }>(`${API_ENDPOINTS.flashcards.base}/stats`);
    return response.data;
  }
};
