/**
 * Error fallback components for different types of errors
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Wifi, 
  WifiOff,
  Clock,
  Shield,
  AlertCircle,
  XCircle,
  Server,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BaseErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  onReset?: () => void;
  onGoHome?: () => void;
}

// Generic error fallback
export function ErrorFallback({ 
  error, 
  onRetry, 
  onReset, 
  onGoHome 
}: BaseErrorFallbackProps) {
  const handleReload = () => window.location.reload();
  const handleGoHome = () => window.location.href = '/dashboard';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. We apologize for the inconvenience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                Error Details (Development Mode)
              </h4>
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-auto max-h-40">
                {error.toString()}
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {onReset && (
              <Button onClick={onReset} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button onClick={handleReload} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Button onClick={onGoHome || handleGoHome} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Network error fallback
export function NetworkErrorFallback({ onRetry }: { onRetry?: () => void }) {
  const isOnline = navigator.onLine;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-96 p-4"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isOnline ? (
              <Server className="h-12 w-12 text-red-500" />
            ) : (
              <WifiOff className="h-12 w-12 text-yellow-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {isOnline ? 'Server Unreachable' : 'You\'re Offline'}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? 'Unable to connect to the server. Please check your connection or try again later.'
              : 'Please check your internet connection and try again.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            {isOnline ? (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <XCircle className="h-3 w-3" />
                <span>Server Error</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </Badge>
            )}
          </div>
          
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// API error fallback with retry mechanism
export function ApiErrorFallback({ 
  error, 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3,
  isRetrying = false 
}: BaseErrorFallbackProps & {
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
}) {
  const getErrorIcon = () => {
    if (error?.message.includes('timeout')) return Clock;
    if (error?.message.includes('network')) return WifiOff;
    if (error?.message.includes('auth')) return Shield;
    return AlertCircle;
  };

  const getErrorTitle = () => {
    if (error?.message.includes('timeout')) return 'Request Timeout';
    if (error?.message.includes('network')) return 'Network Error';
    if (error?.message.includes('auth')) return 'Authentication Error';
    return 'API Error';
  };

  const ErrorIcon = getErrorIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-64 p-4"
    >
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <ErrorIcon className="h-10 w-10 text-red-500" />
          </div>
          <CardTitle className="text-lg">{getErrorTitle()}</CardTitle>
          <CardDescription>
            {error?.message || 'An error occurred while communicating with the server.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {retryCount > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Attempt {retryCount} of {maxRetries}</span>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {onRetry && !isRetrying && retryCount < maxRetries && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {isRetrying && (
              <Button disabled className="w-full">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </Button>
            )}
            
            {retryCount >= maxRetries && (
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                <p>Maximum retry attempts reached</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
                  Reload Page
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading error fallback (for when data fails to load)
export function LoadingErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-32 p-4"
    >
      <div className="text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Failed to load data
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Something went wrong while loading this content
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Chart error fallback
export function ChartErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center h-48 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
      <div className="text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Chart failed to load
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unable to render chart data
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="ghost">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

// Compact error display for cards and small components
export function CompactErrorFallback({ 
  error, 
  onRetry, 
  size = 'md' 
}: BaseErrorFallbackProps & { 
  size?: 'sm' | 'md' | 'lg' 
}) {
  const sizeClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700`}>
      <div className="text-center space-y-2">
        <AlertCircle className={`${iconSizes[size]} text-red-500 mx-auto`} />
        <div>
          <p className="text-xs font-medium text-slate-900 dark:text-white">
            Error
          </p>
          {size !== 'sm' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-32 truncate">
              {error?.message || 'Something went wrong'}
            </p>
          )}
        </div>
        {onRetry && size !== 'sm' && (
          <Button onClick={onRetry} size="sm" variant="ghost" className="h-6 px-2 text-xs">
            <RefreshCw className="h-2 w-2 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

// Inline error for form fields and inputs
export function InlineErrorFallback({ 
  error, 
  onRetry 
}: BaseErrorFallbackProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm">
      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-red-700 dark:text-red-300 flex-1">
        {error?.message || 'An error occurred'}
      </span>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="ghost" className="h-6 w-6 p-0">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}