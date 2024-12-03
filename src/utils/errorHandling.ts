import { ApiError, ApiErrorResponse } from '../api';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.data && typeof error.data === 'object') {
      const errorData = error.data as ApiErrorResponse;
      
      // Check for field-specific errors
      if (errorData.errors) {
        const firstError = Object.values(errorData.errors)[0]?.[0];
        if (firstError) return firstError;
      }
      
      // Fall back to general message
      if (errorData.message) return errorData.message;
    }
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.toLowerCase().includes('network error')
  );
}

export function isAuthenticationError(error: unknown): boolean {
  return error instanceof ApiError && (
    error.status === 401 || error.status === 403
  );
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 422;
}

export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (error instanceof ApiError && error.data?.errors) {
    return error.data.errors;
  }
  return {};
}
