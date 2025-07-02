import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download,
  Search,
  Filter,
  Database,
  Users,
  BarChart3
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Loading components
import { 
  LoadingSpinner, 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader 
} from '@/components/loading/LoadingSpinner';
import { 
  DashboardSkeleton, 
  MetricCardSkeleton, 
  ChartSkeleton 
} from '@/components/loading/DashboardSkeleton';
import { 
  TableSkeleton, 
  DataTableSkeleton, 
  SimpleTableSkeleton 
} from '@/components/loading/TableSkeleton';
import { 
  FormSkeleton, 
  LoginFormSkeleton, 
  SettingsFormSkeleton 
} from '@/components/loading/FormSkeleton';
import { 
  PageLoadingState,
  CardLoadingState,
  ListLoadingState,
  ChartLoadingState,
  SearchLoadingState,
  FilterLoadingState,
  DataLoadingState,
  TableLoadingState,
  UploadLoadingState,
  ProcessingLoadingState
} from '@/components/loading/LoadingStates';

// Error components
import { ErrorBoundary, DashboardErrorBoundary, ChartErrorBoundary } from '@/components/error/ErrorBoundary';
import { 
  ErrorState,
  NetworkErrorState,
  ServerErrorState,
  NotFoundState,
  AccessDeniedState,
  DataErrorState,
  EmptyState,
  NoResultsState,
  NoUsersState,
  NoModelsState
} from '@/components/error/ErrorStates';

export default function LoadingDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('spinners');
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const resetUpload = () => {
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Error boundary test component
  const ErrorTest = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('This is a test error for the error boundary demo');
    }
    return <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">Component working normally</div>;
  };

  const [shouldThrowError, setShouldThrowError] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Loading States & Error Handling Demo
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive demonstration of loading states, skeletons, and error boundaries
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowFullPageLoader(true)}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Full Page Loader
            </Button>
          </div>
        </div>

        {/* Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="spinners">Loading Spinners</TabsTrigger>
            <TabsTrigger value="skeletons">Skeleton States</TabsTrigger>
            <TabsTrigger value="states">Loading States</TabsTrigger>
            <TabsTrigger value="errors">Error Handling</TabsTrigger>
          </TabsList>

          {/* Loading Spinners Tab */}
          <TabsContent value="spinners" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spinner Variants */}
              <Card>
                <CardHeader>
                  <CardTitle>Spinner Variants</CardTitle>
                  <CardDescription>Different loading spinner types and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Default Spinner</h4>
                      <div className="flex items-center space-x-4">
                        <LoadingSpinner size="sm" />
                        <LoadingSpinner size="md" />
                        <LoadingSpinner size="lg" />
                        <LoadingSpinner size="xl" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Dots Variant</h4>
                      <div className="flex items-center space-x-4">
                        <LoadingSpinner variant="dots" size="sm" />
                        <LoadingSpinner variant="dots" size="md" />
                        <LoadingSpinner variant="dots" size="lg" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Pulse Variant</h4>
                      <div className="flex items-center space-x-4">
                        <LoadingSpinner variant="pulse" size="sm" />
                        <LoadingSpinner variant="pulse" size="md" />
                        <LoadingSpinner variant="pulse" size="lg" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Security Variant</h4>
                      <div className="flex items-center space-x-4">
                        <LoadingSpinner variant="security" size="sm" />
                        <LoadingSpinner variant="security" size="md" />
                        <LoadingSpinner variant="security" size="lg" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spinner with Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Spinners with Text</CardTitle>
                  <CardDescription>Loading indicators with descriptive text</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LoadingSpinner size="md" text="Loading dashboard..." />
                  <LoadingSpinner variant="dots" size="md" text="Processing data..." />
                  <LoadingSpinner variant="security" size="md" text="Scanning for threats..." />
                  <InlineLoader text="Fetching user data..." />
                  
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-medium">Button Loading States</h4>
                    <div className="flex space-x-3">
                      <Button disabled>
                        <ButtonLoader size="sm" />
                        Saving...
                      </Button>
                      <Button variant="outline" disabled>
                        <ButtonLoader size="sm" />
                        Processing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Skeleton States Tab */}
          <TabsContent value="skeletons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dashboard Skeletons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dashboard Skeletons</h3>
                <MetricCardSkeleton />
                <ChartSkeleton />
              </div>

              {/* Table Skeletons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Table Skeletons</h3>
                <SimpleTableSkeleton />
              </div>
            </div>

            {/* Form Skeletons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Form Skeletons</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LoginFormSkeleton />
                <FormSkeleton fields={4} layout="horizontal" />
              </div>
            </div>

            {/* Full Dashboard Skeleton */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Full Dashboard Skeleton</h3>
              <Card>
                <CardContent className="p-4">
                  <DashboardSkeleton />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loading States Tab */}
          <TabsContent value="states" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search & Filter States */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Search & Filter States
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SearchLoadingState />
                  <FilterLoadingState />
                </CardContent>
              </Card>

              {/* Data Loading States */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Data Loading States
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DataLoadingState message="Loading analytics..." />
                  <ListLoadingState items={3} />
                </CardContent>
              </Card>
            </div>

            {/* Upload & Processing States */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Upload States
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2 mb-4">
                    <Button 
                      onClick={simulateUpload} 
                      disabled={isUploading}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Upload
                    </Button>
                    <Button 
                      onClick={resetUpload} 
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <UploadLoadingState progress={uploadProgress} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Processing States
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProcessingLoadingState 
                    title="Analyzing Model"
                    description="Running security analysis and performance tests..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Complex Loading States */}
            <Card>
              <CardHeader>
                <CardTitle>Complex Loading States</CardTitle>
                <CardDescription>Full component loading patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <TableLoadingState />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Handling Tab */}
          <TabsContent value="errors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Error Boundary Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Error Boundary Demo</CardTitle>
                  <CardDescription>Test React error boundary functionality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setShouldThrowError(!shouldThrowError)}
                    variant={shouldThrowError ? "destructive" : "default"}
                  >
                    {shouldThrowError ? "Reset Component" : "Trigger Error"}
                  </Button>
                  
                  <ErrorBoundary>
                    <ErrorTest shouldThrow={shouldThrowError} />
                  </ErrorBoundary>
                </CardContent>
              </Card>

              {/* Chart Error Boundary */}
              <Card>
                <CardHeader>
                  <CardTitle>Specialized Error Boundaries</CardTitle>
                  <CardDescription>Context-specific error handling</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartErrorBoundary>
                    <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                      <p className="text-slate-600 dark:text-slate-400">Chart component (working)</p>
                    </div>
                  </ChartErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Error States */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Error States</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NetworkErrorState onRetry={() => console.log('Retry clicked')} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Server Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ServerErrorState onRetry={() => console.log('Retry clicked')} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Not Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotFoundState onGoBack={() => console.log('Go back clicked')} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AccessDeniedState onGoBack={() => console.log('Go back clicked')} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Empty States */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Empty States</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>No Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NoUsersState onInviteUser={() => console.log('Invite user clicked')} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>No Models</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NoModelsState onUploadModel={() => console.log('Upload model clicked')} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>No Search Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NoResultsState 
                      searchTerm="security vulnerabilities"
                      onClearSearch={() => console.log('Clear search clicked')} 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Load Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataErrorState onRetry={() => console.log('Retry clicked')} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Full Page Loader Overlay */}
        {showFullPageLoader && (
          <FullPageLoader text="Initializing security dashboard..." />
        )}
      </div>

      {/* Auto-hide full page loader */}
      {showFullPageLoader && setTimeout(() => setShowFullPageLoader(false), 3000)}
    </DashboardLayout>
  );
}