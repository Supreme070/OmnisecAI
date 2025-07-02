/**
 * Demo component showcasing comprehensive error handling features
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  WifiOff, 
  Server, 
  Clock,
  Bug,
  Shield,
  Database,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRetryableApi, useRetryableQuery } from '@/hooks/useRetryableApi';
import { useOffline } from '@/hooks/useOffline';
import { useError, useErrorHandler } from '@/contexts/ErrorContext';
import { 
  ErrorFallback, 
  NetworkErrorFallback, 
  ApiErrorFallback, 
  LoadingErrorFallback,
  CompactErrorFallback,
  InlineErrorFallback
} from '@/components/error/ErrorFallback';
import { threatsApi } from '@/lib/api';

export default function ErrorHandlingDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string>('overview');
  const { isOnline, queuedRequests, queueRequest, syncQueue, clearQueue } = useOffline();
  const { errors, errorCounts, clearAllErrors } = useError();
  const { handleError, handleApiError } = useErrorHandler();

  // Retryable API example
  const {
    execute: fetchThreats,
    isLoading: isLoadingThreats,
    error: threatsError,
    retryCount: threatsRetryCount,
    retry: retryThreats
  } = useRetryableApi(
    () => threatsApi.getThreats(),
    'demo_threats',
    {
      maxRetries: 3,
      retryDelay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retrying threats fetch (attempt ${attempt}):`, error);
      }
    }
  );

  // Query with circuit breaker
  const {
    execute: fetchDashboard,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    isCircuitOpen
  } = useRetryableApi(
    () => threatsApi.getDashboard(),
    'demo_dashboard'
  );

  const demoSections = [
    { id: 'overview', label: 'Overview', icon: AlertTriangle },
    { id: 'retryable', label: 'Retryable APIs', icon: RefreshCw },
    { id: 'offline', label: 'Offline Support', icon: WifiOff },
    { id: 'fallbacks', label: 'Error Fallbacks', icon: Bug },
    { id: 'circuit', label: 'Circuit Breaker', icon: Shield },
    { id: 'context', label: 'Error Context', icon: Database }
  ];

  const simulateErrors = {
    networkError: () => {
      const error = new Error('Network request failed');
      error.name = 'NetworkError';
      handleError(error, 'demo_network', 'high');
    },
    
    serverError: () => {
      handleApiError({
        response: { status: 500, data: { message: 'Internal server error' } }
      }, 'demo_server');
    },
    
    authError: () => {
      handleApiError({
        response: { status: 401, data: { message: 'Authentication failed' } }
      }, 'auth');
    },
    
    validationError: () => {
      handleApiError({
        response: { status: 422, data: { message: 'Validation failed: Invalid email format' } }
      }, 'validation');
    },
    
    timeoutError: () => {
      const error = new Error('Request timeout');
      error.name = 'TimeoutError';
      handleError(error, 'demo_timeout', 'medium');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Offline</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCounts.unresolved}</div>
            <div className="text-xs text-slate-500">
              {errorCounts.bySeverity.critical} critical, {errorCounts.bySeverity.high} high
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offline Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queuedRequests.length}</div>
            <div className="text-xs text-slate-500">Pending requests</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Error Simulation</CardTitle>
          <CardDescription>
            Test different error scenarios to see the error handling in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={simulateErrors.networkError}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Network className="h-4 w-4" />
              <span>Network Error</span>
            </Button>
            
            <Button 
              onClick={simulateErrors.serverError}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Server className="h-4 w-4" />
              <span>Server Error</span>
            </Button>
            
            <Button 
              onClick={simulateErrors.authError}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Auth Error</span>
            </Button>
            
            <Button 
              onClick={simulateErrors.validationError}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Validation Error</span>
            </Button>
            
            <Button 
              onClick={simulateErrors.timeoutError}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Timeout Error</span>
            </Button>
            
            <Button 
              onClick={clearAllErrors}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Errors</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRetryableAPIs = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Retry Mechanisms</CardTitle>
          <CardDescription>
            Automatic retry with exponential backoff and circuit breaker patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Threats API (with retry)</span>
              <div className="flex items-center space-x-2">
                {threatsRetryCount > 0 && (
                  <Badge variant="secondary">
                    Attempt {threatsRetryCount}/3
                  </Badge>
                )}
                <Button 
                  onClick={() => fetchThreats()}
                  disabled={isLoadingThreats}
                  size="sm"
                >
                  {isLoadingThreats ? 'Loading...' : 'Fetch Threats'}
                </Button>
              </div>
            </div>
            
            {threatsError && (
              <ApiErrorFallback 
                error={threatsError}
                onRetry={retryThreats}
                retryCount={threatsRetryCount}
                isRetrying={isLoadingThreats}
              />
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Dashboard API (with circuit breaker)</span>
              <div className="flex items-center space-x-2">
                {isCircuitOpen && (
                  <Badge variant="destructive">Circuit Open</Badge>
                )}
                <Button 
                  onClick={() => fetchDashboard()}
                  disabled={isLoadingDashboard || isCircuitOpen}
                  size="sm"
                >
                  {isLoadingDashboard ? 'Loading...' : 'Fetch Dashboard'}
                </Button>
              </div>
            </div>
            
            {dashboardError && (
              <InlineErrorFallback 
                error={dashboardError}
                onRetry={() => fetchDashboard()}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOfflineSupport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Offline Queue Management</CardTitle>
          <CardDescription>
            Requests are automatically queued when offline and synced when connection returns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Queued Requests: {queuedRequests.length}</span>
            <div className="space-x-2">
              <Button 
                onClick={() => queueRequest({
                  request: () => threatsApi.getThreats(),
                  description: 'Fetch threats data',
                  maxRetries: 3
                })}
                size="sm"
                variant="outline"
              >
                Queue Request
              </Button>
              <Button 
                onClick={syncQueue}
                disabled={!isOnline || queuedRequests.length === 0}
                size="sm"
              >
                Sync Queue
              </Button>
              <Button 
                onClick={clearQueue}
                disabled={queuedRequests.length === 0}
                size="sm"
                variant="destructive"
              >
                Clear Queue
              </Button>
            </div>
          </div>

          {queuedRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Queued Requests:</h4>
              {queuedRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm">{request.description}</span>
                  <Badge variant="secondary">
                    {request.retries}/{request.maxRetries}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderErrorFallbacks = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Fallback Components</CardTitle>
          <CardDescription>
            Different error displays for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Network Error Fallback</h4>
            <NetworkErrorFallback onRetry={() => console.log('Retry clicked')} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Loading Error Fallback</h4>
            <LoadingErrorFallback onRetry={() => console.log('Retry clicked')} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Compact Error Fallback</h4>
            <div className="grid grid-cols-3 gap-4">
              <CompactErrorFallback 
                error={new Error('Small error')}
                size="sm"
                onRetry={() => console.log('Retry small')}
              />
              <CompactErrorFallback 
                error={new Error('Medium error')}
                size="md"
                onRetry={() => console.log('Retry medium')}
              />
              <CompactErrorFallback 
                error={new Error('Large error')}
                size="lg"
                onRetry={() => console.log('Retry large')}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Inline Error Fallback</h4>
            <InlineErrorFallback 
              error={new Error('Form validation failed')}
              onRetry={() => console.log('Retry inline')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedDemo) {
      case 'retryable': return renderRetryableAPIs();
      case 'offline': return renderOfflineSupport();
      case 'fallbacks': return renderErrorFallbacks();
      case 'circuit': return <div>Circuit breaker demo coming soon...</div>;
      case 'context': return <div>Error context demo coming soon...</div>;
      default: return renderOverview();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Handling Demo</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive error handling, retry mechanisms, offline support, and user-friendly error displays
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="space-y-2">
          {demoSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                onClick={() => setSelectedDemo(section.id)}
                variant={selectedDemo === section.id ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={selectedDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}