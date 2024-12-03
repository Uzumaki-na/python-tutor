import React, { createContext, useContext, useEffect } from 'react';
import { UserPreferences, preferencesApi } from '../api/preferences';
import { useLoadingState } from '../hooks/useLoadingState';

interface PreferencesContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  sidebarOpen: true,
  codeFont: 'JetBrains Mono',
  fontSize: 14,
  autoComplete: true,
  notifications: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const {
    data: preferences,
    isLoading,
    error,
    execute,
    refresh
  } = useLoadingState<UserPreferences>(defaultPreferences, {
    key: 'preferences',
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  });

  useEffect(() => {
    execute(preferencesApi.get());
  }, [execute]);

  // Apply theme whenever it changes
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', preferences.theme === 'light');
  }, [preferences.theme]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const updated = await execute(preferencesApi.update({
      ...preferences,
      ...updates
    }));
    
    // Apply immediate visual updates for specific preferences
    if (updates.theme) {
      document.documentElement.classList.toggle('light-theme', updates.theme === 'light');
    }
    
    return updated;
  };

  const value = {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refresh
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
