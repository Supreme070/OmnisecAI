/**
 * Global error context for application-wide error management
 */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface ErrorInfo {
  id: string;
  error: Error;
  context?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isResolved: boolean;
  userAgent?: string;
  url?: string;
  userId?: string;
}

interface ErrorState {
  errors: ErrorInfo[];
  globalError: ErrorInfo | null;
  isOnline: boolean;
  errorCounts: {
    total: number;
    unresolved: number;
    bySeverity: Record<string, number>;
  };
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<ErrorInfo, 'id' | 'timestamp'> }
  | { type: 'RESOLVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: ErrorInfo | null }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'LOAD_ERRORS'; payload: ErrorInfo[] };

interface ErrorContextValue extends ErrorState {
  addError: (error: Error, context?: string, severity?: ErrorInfo['severity']) => string;
  resolveError: (id: string) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  setGlobalError: (error: ErrorInfo | null) => void;
  getErrorById: (id: string) => ErrorInfo | undefined;
  getErrorsByContext: (context: string) => ErrorInfo[];
  getUnresolvedErrors: () => ErrorInfo[];
  reportError: (error: Error, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

const initialState: ErrorState = {
  errors: [],
  globalError: null,
  isOnline: navigator.onLine,
  errorCounts: {
    total: 0,
    unresolved: 0,
    bySeverity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }
  }
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newError: ErrorInfo = {
        ...action.payload,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };

      const newErrors = [newError, ...state.errors.slice(0, 99)]; // Keep latest 100 errors
      
      return {
        ...state,
        errors: newErrors,
        errorCounts: calculateErrorCounts(newErrors)
      };
    }

    case 'RESOLVE_ERROR': {
      const newErrors = state.errors.map(error =>
        error.id === action.payload ? { ...error, isResolved: true } : error
      );
      
      return {
        ...state,
        errors: newErrors,
        errorCounts: calculateErrorCounts(newErrors)
      };
    }

    case 'CLEAR_ERROR': {
      const newErrors = state.errors.filter(error => error.id !== action.payload);
      
      return {
        ...state,
        errors: newErrors,
        globalError: state.globalError?.id === action.payload ? null : state.globalError,
        errorCounts: calculateErrorCounts(newErrors)
      };
    }

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: [],
        globalError: null,
        errorCounts: {
          total: 0,
          unresolved: 0,
          bySeverity: {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
          }
        }
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload
      };

    case 'LOAD_ERRORS':
      return {
        ...state,
        errors: action.payload,
        errorCounts: calculateErrorCounts(action.payload)
      };

    default:
      return state;
  }
}

function calculateErrorCounts(errors: ErrorInfo[]) {
  const unresolved = errors.filter(e => !e.isResolved);
  
  return {
    total: errors.length,
    unresolved: unresolved.length,
    bySeverity: {
      low: unresolved.filter(e => e.severity === 'low').length,
      medium: unresolved.filter(e => e.severity === 'medium').length,
      high: unresolved.filter(e => e.severity === 'high').length,
      critical: unresolved.filter(e => e.severity === 'critical').length
    }
  };
}

// Error severity determination
function determineErrorSeverity(error: Error, context?: string): ErrorInfo['severity'] {
  const message = error.message.toLowerCase();
  
  // Critical errors
  if (
    message.includes('authentication') ||
    message.includes('security') ||
    message.includes('unauthorized') ||
    message.includes('critical') ||
    context === 'auth'
  ) {
    return 'critical';
  }
  
  // High severity errors
  if (
    message.includes('server error') ||
    message.includes('500') ||
    message.includes('database') ||
    message.includes('payment') ||
    context === 'payment' ||
    context === 'database'
  ) {
    return 'high';
  }
  
  // Medium severity errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('validation') ||
    message.includes('400') ||
    message.includes('404')
  ) {
    return 'medium';
  }
  
  return 'low';
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Load errors from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnisecai_errors');
      if (stored) {
        const errors = JSON.parse(stored);
        // Filter out old errors (older than 24 hours)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const validErrors = errors.filter((error: ErrorInfo) => error.timestamp > dayAgo);
        dispatch({ type: 'LOAD_ERRORS', payload: validErrors });
      }
    } catch (error) {
      console.error('Failed to load errors from storage:', error);
    }
  }, []);

  // Persist errors to localStorage
  useEffect(() => {
    try {
      // Only store latest 50 errors and their metadata (not full error objects)
      const errorsToStore = state.errors.slice(0, 50).map(error => ({
        id: error.id,
        error: {
          name: error.error.name,
          message: error.error.message,
          stack: error.error.stack
        },
        context: error.context,
        timestamp: error.timestamp,
        severity: error.severity,
        isResolved: error.isResolved,
        userAgent: error.userAgent,
        url: error.url,
        userId: error.userId
      }));
      
      localStorage.setItem('omnisecai_errors', JSON.stringify(errorsToStore));
    } catch (error) {
      console.error('Failed to persist errors to storage:', error);
    }
  }, [state.errors]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      addError(error, 'unhandled_promise', 'high');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const addError = useCallback((
    error: Error, 
    context?: string, 
    severity?: ErrorInfo['severity']
  ): string => {
    const errorSeverity = severity || determineErrorSeverity(error, context);
    
    const errorInfo = {
      error,
      context: context || 'unknown',
      severity: errorSeverity,
      isResolved: false,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: 'current_user' // TODO: Get from auth context
    };

    dispatch({ type: 'ADD_ERROR', payload: errorInfo });

    // Show toast for high/critical errors
    if (errorSeverity === 'critical' || errorSeverity === 'high') {
      toast.error(`${errorSeverity.toUpperCase()}: ${error.message}`, {
        duration: errorSeverity === 'critical' ? 0 : 10000
      });
    }

    // Set as global error for critical errors
    if (errorSeverity === 'critical') {
      const newError = { ...errorInfo, id: Date.now().toString(), timestamp: Date.now() };
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: newError });
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      reportErrorToService(errorInfo);
    }

    return Date.now().toString();
  }, []);

  const resolveError = useCallback((id: string) => {
    dispatch({ type: 'RESOLVE_ERROR', payload: id });
  }, []);

  const clearError = useCallback((id: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: id });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  const setGlobalError = useCallback((error: ErrorInfo | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  }, []);

  const getErrorById = useCallback((id: string) => {
    return state.errors.find(error => error.id === id);
  }, [state.errors]);

  const getErrorsByContext = useCallback((context: string) => {
    return state.errors.filter(error => error.context === context);
  }, [state.errors]);

  const getUnresolvedErrors = useCallback(() => {
    return state.errors.filter(error => !error.isResolved);
  }, [state.errors]);

  const reportError = useCallback((error: Error, context?: string) => {
    console.error(`Error reported [${context || 'unknown'}]:`, error);
    addError(error, context);
  }, [addError]);

  const value: ErrorContextValue = {
    ...state,
    addError,
    resolveError,
    clearError,
    clearAllErrors,
    setGlobalError,
    getErrorById,
    getErrorsByContext,
    getUnresolvedErrors,
    reportError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// Error boundary component that integrates with the error context
export function ErrorContextBoundary({ children }: { children: React.ReactNode }) {
  const { addError } = useError();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addError(new Error(event.message), 'global', 'high');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [addError]);

  return <>{children}</>;
}

// Utility function to report errors to external service
async function reportErrorToService(errorInfo: Omit<ErrorInfo, 'id' | 'timestamp'>) {
  try {
    // TODO: Implement external error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    console.log('Would report error to external service:', {
      error: {
        name: errorInfo.error.name,
        message: errorInfo.error.message,
        stack: errorInfo.error.stack
      },
      context: errorInfo.context,
      severity: errorInfo.severity,
      userAgent: errorInfo.userAgent,
      url: errorInfo.url,
      userId: errorInfo.userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to report error to external service:', error);
  }
}

// Hook to use error context with simplified API
export function useErrorHandler() {
  const { addError, reportError } = useError();

  const handleError = useCallback((
    error: Error | string,
    context?: string,
    severity?: ErrorInfo['severity']
  ) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return addError(errorObj, context, severity);
  }, [addError]);

  const handleApiError = useCallback((error: any, context?: string) => {
    let errorMessage = 'An API error occurred';
    let errorContext = context || 'api';
    let severity: ErrorInfo['severity'] = 'medium';

    if (error.response) {
      const status = error.response.status;
      errorMessage = error.response.data?.message || `HTTP ${status} Error`;
      
      if (status >= 500) {
        severity = 'high';
      } else if (status === 401 || status === 403) {
        severity = 'critical';
        errorContext = 'auth';
      }
    } else if (error.request) {
      errorMessage = 'Network error - unable to reach server';
      severity = 'high';
      errorContext = 'network';
    }

    const errorObj = new Error(errorMessage);
    return addError(errorObj, errorContext, severity);
  }, [addError]);

  return {
    handleError,
    handleApiError,
    reportError
  };
}