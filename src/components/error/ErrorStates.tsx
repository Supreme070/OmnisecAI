import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Database, 
  Wifi, 
  WifiOff,
  Server,
  ShieldAlert,
  FileX,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({ 
  title, 
  description, 
  icon, 
  action, 
  secondaryAction 
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-red-500">
            {icon || <AlertTriangle className="h-12 w-12" />}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {(action || secondaryAction) && (
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {action && (
                <Button onClick={action.onClick}>
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button onClick={secondaryAction.onClick} variant="outline">
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Connection Failed"
      description="Unable to connect to the server. Please check your internet connection and try again."
      icon={<WifiOff className="h-12 w-12" />}
      action={{
        label: "Retry",
        onClick: onRetry
      }}
      secondaryAction={{
        label: "Check Connection",
        onClick: () => window.open('https://www.google.com', '_blank')
      }}
    />
  );
}

export function ServerErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Server Error"
      description="The server encountered an error and couldn't complete your request. Please try again later."
      icon={<Server className="h-12 w-12" />}
      action={{
        label: "Try Again",
        onClick: onRetry
      }}
      secondaryAction={{
        label: "Contact Support",
        onClick: () => window.open('mailto:support@omnisecai.com', '_blank')
      }}
    />
  );
}

export function NotFoundState({ 
  title = "Not Found",
  description = "The requested resource could not be found.",
  onGoBack
}: { 
  title?: string;
  description?: string;
  onGoBack?: () => void;
}) {
  return (
    <ErrorState
      title={title}
      description={description}
      icon={<Search className="h-12 w-12" />}
      action={onGoBack ? {
        label: "Go Back",
        onClick: onGoBack
      } : {
        label: "Go to Dashboard",
        onClick: () => window.location.href = '/dashboard'
      }}
    />
  );
}

export function AccessDeniedState({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to view this resource. Please contact your administrator."
      icon={<ShieldAlert className="h-12 w-12" />}
      action={onGoBack ? {
        label: "Go Back",
        onClick: onGoBack
      } : {
        label: "Go to Dashboard",
        onClick: () => window.location.href = '/dashboard'
      }}
      secondaryAction={{
        label: "Contact Admin",
        onClick: () => window.open('mailto:admin@omnisecai.com', '_blank')
      }}
    />
  );
}

export function DataErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Data Load Failed"
      description="Failed to load data from the server. This might be a temporary issue."
      icon={<Database className="h-12 w-12" />}
      action={{
        label: "Retry",
        onClick: onRetry
      }}
    />
  );
}

export function EmptyState({ 
  title, 
  description, 
  icon,
  action 
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 text-slate-400">
          {icon || <FileX className="h-12 w-12" />}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function NoResultsState({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      title="No Results Found"
      description={`No results found for "${searchTerm}". Try adjusting your search criteria.`}
      icon={<Search className="h-12 w-12" />}
      action={{
        label: "Clear Search",
        onClick: onClearSearch
      }}
    />
  );
}

export function NoUsersState({ onInviteUser }: { onInviteUser: () => void }) {
  return (
    <EmptyState
      title="No Users Yet"
      description="Get started by inviting team members to your organization."
      icon={<UserX className="h-12 w-12" />}
      action={{
        label: "Invite Users",
        onClick: onInviteUser
      }}
    />
  );
}

export function NoModelsState({ onUploadModel }: { onUploadModel: () => void }) {
  return (
    <EmptyState
      title="No Models Uploaded"
      description="Upload your first AI model to start monitoring its security and performance."
      icon={<Database className="h-12 w-12" />}
      action={{
        label: "Upload Model",
        onClick: onUploadModel
      }}
    />
  );
}