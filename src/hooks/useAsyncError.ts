import { useCallback } from 'react';

/**
 * Hook to handle async errors in React components
 * This allows error boundaries to catch async errors
 */
export function useAsyncError() {
  const throwError = useCallback((error: Error) => {
    // Re-throw the error in a way that React can catch it
    throw error;
  }, []);

  return throwError;
}

/**
 * Wrapper for async operations that need error boundary handling
 */
export function useAsyncOperation() {
  const throwError = useAsyncError();

  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    onError?: (error: Error) => void
  ): Promise<T | undefined> => {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (onError) {
        onError(err);
      } else {
        throwError(err);
      }
      
      return undefined;
    }
  }, [throwError]);

  return executeAsync;
}