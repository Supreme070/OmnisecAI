import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X,
  Shield,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'security';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || 5000;

  useEffect(() => {
    if (toast.persistent) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          setIsVisible(false);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration, toast.persistent]);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, 300); // Wait for animation to complete

      return () => clearTimeout(timer);
    }
  }, [isVisible, toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      case 'security':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getProgressBarClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'security':
        return 'bg-red-600';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={`
            relative max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto overflow-hidden
            ${getBackgroundClass()}
          `}
        >
          {/* Progress bar */}
          {!toast.persistent && (
            <div className="absolute top-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full">
              <div 
                className={`h-full transition-all duration-100 ease-linear ${getProgressBarClass()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                    {toast.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {toast.type === 'security' && (
                      <Badge variant="destructive" className="text-xs">
                        Security
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-slate-600"
                      onClick={() => setIsVisible(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {toast.description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {toast.description}
                  </p>
                )}

                {toast.action && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.action?.onClick();
                        setIsVisible(false);
                      }}
                      className="text-xs"
                    >
                      {toast.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}