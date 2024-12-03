import { API_BASE_URL, DEFAULT_HEADERS, ApiError } from './config';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const defaultOptions: RequestInit = {
  credentials: 'include',
  headers: {
    ...DEFAULT_HEADERS,
    'Content-Type': 'application/json',
  },
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    // Handle rate limit specifically
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new ApiError(
        'Rate limit exceeded. Please try again later.',
        429,
        { retryAfter: retryAfter ? parseInt(retryAfter) : 60 }
      );
    }
    
    throw new ApiError(
      error.message || 'An error occurred',
      response.status,
      error
    );
  }
  return response.json();
}

async function retryableRequest<T>(
  requestFn: () => Promise<Response>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: any;
  let delay = INITIAL_RETRY_DELAY;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await requestFn();
      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error;
      
      if (error instanceof ApiError) {
        // Don't retry on client errors (except rate limits)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
        
        // Handle rate limit with specific delay
        if (error.status === 429) {
          const retryAfter = error.data?.retryAfter || 60;
          console.warn(`Rate limit hit. Waiting ${retryAfter} seconds before retry...`);
          await sleep(retryAfter * 1000);
          continue;
        }
      }
      
      if (i === retries) {
        throw lastError;
      }
      
      // Exponential backoff for other errors
      await sleep(delay);
      delay *= 2;
    }
  }
  
  throw lastError;
}

export const apiClient = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return retryableRequest<T>(() => 
      fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        method: 'GET',
      })
    );
  },

  post: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
    return retryableRequest<T>(() => 
      fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
  },

  put: async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
    return retryableRequest<T>(() => 
      fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
  },

  delete: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return retryableRequest<T>(() => 
      fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        method: 'DELETE',
      })
    );
  }
};
