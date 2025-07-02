import { useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  logError?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Hook for centralized error handling throughout the application
 */
export function useErrorHandler() {
  const { error: showErrorToast } = useToast();

  const handleError = useCallback((
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = 'Error',
      logError = true,
      onError
    } = options;

    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Log error to console in development
    if (logError && process.env.NODE_ENV === 'development') {
      console.error('Error handled:', errorObj);
    }

    // Log to external service in production
    if (logError && process.env.NODE_ENV === 'production') {
      // TODO: Implement external error logging service
      // logErrorToService(errorObj);
    }

    // Show toast notification
    if (showToast) {
      showErrorToast(toastTitle, getErrorMessage(errorObj));
    }

    // Call custom error handler
    if (onError) {
      onError(errorObj);
    }

    return errorObj;
  }, [showErrorToast]);

  return handleError;
}

/**
 * Extract user-friendly error message from error object
 */
function getErrorMessage(error: Error): string {
  // Handle specific error types
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return 'Authentication failed. Please log in again.';
  }

  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  if (error.message.includes('404') || error.message.includes('Not Found')) {
    return 'The requested resource was not found.';
  }

  if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
    return 'Server error. Please try again later.';
  }

  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Return the original message if it's user-friendly, otherwise a generic message
  return error.message && error.message.length < 100 
    ? error.message 
    : 'An unexpected error occurred. Please try again.';
}

/**
 * Hook for handling API errors specifically
 */
export function useApiErrorHandler() {
  const handleError = useErrorHandler();

  const handleApiError = useCallback((error: any) => {
    let errorMessage = 'An error occurred while communicating with the server.';
    let errorTitle = 'API Error';

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorTitle = 'Bad Request';
          errorMessage = data?.message || 'Invalid request data.';
          break;
        case 401:
          errorTitle = 'Authentication Required';
          errorMessage = 'Please log in to continue.';
          break;
        case 403:
          errorTitle = 'Access Denied';
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorTitle = 'Not Found';
          errorMessage = 'The requested resource was not found.';
          break;
        case 429:
          errorTitle = 'Too Many Requests';
          errorMessage = 'Please wait before trying again.';
          break;
        case 500:
          errorTitle = 'Server Error';
          errorMessage = 'The server encountered an error. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Server returned status ${status}.`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorTitle = 'Network Error';
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || 'An unexpected error occurred.';
    }

    return handleError(new Error(errorMessage), {
      toastTitle: errorTitle,
      logError: true
    });
  }, [handleError]);

  return handleApiError;
}