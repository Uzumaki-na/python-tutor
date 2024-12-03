// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  exercises: {
    base: '/exercises',
    generate: '/exercises/generate',
    submit: (id: string) => `/exercises/${id}/submit`,
    progress: '/exercises/progress',
  },
  pdf: {
    upload: '/pdf/upload',
    list: '/pdf/list',
    delete: (path: string) => `/pdf/${encodeURIComponent(path)}`,
  },
  flashcards: {
    base: '/flashcards',
    generate: '/flashcards/generate',
    review: '/flashcards/review',
  },
  preferences: {
    base: '/preferences',
    get: '/preferences',
    update: '/preferences/update',
  }
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 60000,
  defaultRetryAfter: 60,
} as const;

// Default Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// Error Classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isRateLimit(error: any): error is ApiError {
    return error instanceof ApiError && error.status === 429;
  }
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// Error Response Types
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Upload Types
export interface UploadResponse {
  success: boolean;
  filePath: string;
  message?: string;
}

// Exercise Types
export interface ExerciseFilters {
  topic?: string;
  difficulty?: string;
  completed?: boolean;
}

export interface GenerateExerciseParams {
  pdf_path?: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}
