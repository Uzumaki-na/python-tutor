import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiError, ApiResponse, PaginatedResponse } from '../api';

interface LoadingState<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  execute: (promise: Promise<T>) => Promise<T>;
  reset: () => void;
  refresh: () => Promise<void>;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string;
}

const cache = new Map<string, { data: any; timestamp: number }>();

export function useLoadingState<T>(
  initialState: T,
  cacheOptions?: CacheOptions
): LoadingState<T> {
  const [data, setData] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const lastPromiseRef = useRef<Promise<T>>();
  const cacheKey = cacheOptions?.key;
  const ttl = cacheOptions?.ttl ?? 5 * 60 * 1000; // 5 minutes default

  // Check cache on mount
  useEffect(() => {
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
      }
    }
  }, [cacheKey, ttl]);

  const execute = useCallback(async (promise: Promise<T>) => {
    // Store the promise to prevent race conditions
    lastPromiseRef.current = promise;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await promise;
      
      // Only update if this is still the latest promise
      if (promise === lastPromiseRef.current) {
        setData(result);
        
        // Update cache if needed
        if (cacheKey) {
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }
      }
      
      return result;
    } catch (e) {
      // Only update error if this is still the latest promise
      if (promise === lastPromiseRef.current) {
        const error = e instanceof ApiError ? e : new Error('An unexpected error occurred');
        setError(error);
        throw error;
      }
      throw e;
    } finally {
      if (promise === lastPromiseRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey]);

  const reset = useCallback(() => {
    setData(initialState);
    setError(null);
    setIsLoading(false);
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [initialState, cacheKey]);

  const refresh = useCallback(async () => {
    if (lastPromiseRef.current) {
      await execute(lastPromiseRef.current);
    }
  }, [execute]);

  return { data, isLoading, error, execute, reset, refresh };
}
