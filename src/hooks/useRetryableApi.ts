/**
 * Hook for API calls with retry mechanisms and circuit breaker pattern
 */
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxRetriesReached?: (error: any) => void;
}

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
}

interface UseRetryableApiState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  isCircuitOpen: boolean;
}

interface UseRetryableApiResult<T> extends UseRetryableApiState {
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  cancel: () => void;
}

// Circuit breaker state management
const circuitBreakers = new Map<string, {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  resetTimer?: NodeJS.Timeout;
}>();

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  retryCondition: (error) => {
    // Retry on network errors, 5xx errors, and timeout errors
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'ECONNABORTED' ||
      error.code === 'NETWORK_ERROR'
    );
  }
};

const defaultCircuitBreakerOptions: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 300000 // 5 minutes
};

export function useRetryableApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  circuitBreakerKey?: string,
  retryOptions: RetryOptions = {},
  circuitBreakerOptions: CircuitBreakerOptions = {}
): UseRetryableApiResult<T> {
  const options = { ...defaultRetryOptions, ...retryOptions };
  const cbOptions = { ...defaultCircuitBreakerOptions, ...circuitBreakerOptions };
  
  const [state, setState] = useState<UseRetryableApiState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    isCircuitOpen: false
  });

  const lastArgsRef = useRef<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Circuit breaker logic
  const checkCircuitBreaker = useCallback((key: string): boolean => {
    if (!key) return false;
    
    const breaker = circuitBreakers.get(key);
    if (!breaker) return false;

    const now = Date.now();
    
    switch (breaker.state) {
      case 'open':
        if (now - breaker.lastFailure > cbOptions.resetTimeout!) {
          breaker.state = 'half-open';
          return false;
        }
        return true;
      case 'half-open':
        return false;
      default:
        return false;
    }
  }, [cbOptions.resetTimeout]);

  const updateCircuitBreaker = useCallback((key: string, success: boolean) => {
    if (!key) return;

    const now = Date.now();
    let breaker = circuitBreakers.get(key);
    
    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailure: 0,
        state: 'closed'
      };
      circuitBreakers.set(key, breaker);
    }

    if (success) {
      breaker.failures = 0;
      breaker.state = 'closed';
      if (breaker.resetTimer) {
        clearTimeout(breaker.resetTimer);
        breaker.resetTimer = undefined;
      }
    } else {
      breaker.failures++;
      breaker.lastFailure = now;
      
      if (breaker.failures >= cbOptions.failureThreshold!) {
        breaker.state = 'open';
        breaker.resetTimer = setTimeout(() => {
          if (circuitBreakers.has(key)) {
            breaker!.state = 'half-open';
          }
        }, cbOptions.resetTimeout);
        
        toast.error('Service temporarily unavailable', {
          description: 'Multiple failures detected. Please try again later.'
        });
      }
    }

    setState(prev => ({
      ...prev,
      isCircuitOpen: breaker!.state === 'open'
    }));
  }, [cbOptions.failureThreshold, cbOptions.resetTimeout]);

  const executeWithRetry = useCallback(async (...args: any[]): Promise<T | null> => {
    // Check circuit breaker
    if (circuitBreakerKey && checkCircuitBreaker(circuitBreakerKey)) {
      setState(prev => ({ ...prev, isCircuitOpen: true }));
      throw new Error('Circuit breaker is open - service temporarily unavailable');
    }

    lastArgsRef.current = args;
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: 0
    }));

    let lastError: any = null;

    for (let attempt = 0; attempt <= options.maxRetries!; attempt++) {
      try {
        // Add abort signal to the request if supported
        const result = await apiFunction(...args);
        
        // Success - update circuit breaker
        if (circuitBreakerKey) {
          updateCircuitBreaker(circuitBreakerKey, true);
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          retryCount: attempt
        }));

        return result;
      } catch (error: any) {
        lastError = error;

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          setState(prev => ({ ...prev, isLoading: false }));
          return null;
        }

        // Update retry count
        setState(prev => ({ ...prev, retryCount: attempt }));

        // Check if we should retry
        const shouldRetry = 
          attempt < options.maxRetries! && 
          options.retryCondition!(error);

        if (!shouldRetry) {
          break;
        }

        // Call retry callback
        if (options.onRetry) {
          options.onRetry(attempt + 1, error);
        }

        // Calculate delay
        const delay = options.exponentialBackoff
          ? options.retryDelay! * Math.pow(2, attempt)
          : options.retryDelay!;

        // Show retry toast
        if (attempt < options.maxRetries!) {
          toast.info(`Retrying request (${attempt + 1}/${options.maxRetries})`, {
            description: `Retrying in ${delay / 1000} seconds...`,
            duration: delay
          });
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    if (circuitBreakerKey) {
      updateCircuitBreaker(circuitBreakerKey, false);
    }

    if (options.onMaxRetriesReached) {
      options.onMaxRetriesReached(lastError);
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      error: lastError,
      retryCount: options.maxRetries!
    }));

    throw lastError;
  }, [
    apiFunction,
    circuitBreakerKey,
    options,
    checkCircuitBreaker,
    updateCircuitBreaker
  ]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgsRef.current) {
      return executeWithRetry(...lastArgsRef.current);
    }
    throw new Error('No previous request to retry');
  }, [executeWithRetry]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      isCircuitOpen: false
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  return {
    ...state,
    execute: executeWithRetry,
    retry,
    reset,
    cancel
  };
}

// Specialized hooks for common API patterns
export function useRetryableQuery<T = any>(
  queryFn: () => Promise<T>,
  queryKey: string,
  options?: RetryOptions
) {
  return useRetryableApi(queryFn, `query_${queryKey}`, options);
}

export function useRetryableMutation<T = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<T>,
  mutationKey: string,
  options?: RetryOptions
) {
  return useRetryableApi(mutationFn, `mutation_${mutationKey}`, {
    maxRetries: 1, // Mutations typically shouldn't be retried as aggressively
    ...options
  });
}

// Utility for clearing all circuit breakers (useful for testing)
export function clearAllCircuitBreakers() {
  circuitBreakers.forEach(breaker => {
    if (breaker.resetTimer) {
      clearTimeout(breaker.resetTimer);
    }
  });
  circuitBreakers.clear();
}

// Get circuit breaker status
export function getCircuitBreakerStatus(key: string) {
  const breaker = circuitBreakers.get(key);
  return breaker ? {
    state: breaker.state,
    failures: breaker.failures,
    lastFailure: breaker.lastFailure
  } : null;
}