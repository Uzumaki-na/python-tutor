import { API_ENDPOINTS } from './config';
import { apiClient } from './client';

export interface UserPreferences {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  codeFont: string;
  fontSize: number;
  autoComplete: boolean;
  notifications: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  sidebarOpen: true,
  codeFont: 'JetBrains Mono',
  fontSize: 14,
  autoComplete: true,
  notifications: true,
};

export const preferencesApi = {
  get: async () => {
    try {
      const response = await apiClient.get<UserPreferences>(API_ENDPOINTS.preferences.get);
      return response.data;
    } catch (error) {
      console.warn('Failed to load preferences, using defaults:', error);
      return defaultPreferences;
    }
  },

  update: async (preferences: Partial<UserPreferences>) => {
    const response = await apiClient.post<UserPreferences>(API_ENDPOINTS.preferences.update, preferences);
    return response.data;
  }
};
