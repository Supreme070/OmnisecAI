import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ToastNotification, Toast } from '@/components/notifications/ToastNotification';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  // Convenience methods
  success: (title: string, description?: string, action?: Toast['action']) => void;
  error: (title: string, description?: string, action?: Toast['action']) => void;
  warning: (title: string, description?: string, action?: Toast['action']) => void;
  info: (title: string, description?: string, action?: Toast['action']) => void;
  security: (title: string, description?: string, action?: Toast['action']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, description?: string, action?: Toast['action']) => {
    addToast({ type: 'success', title, description, action });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, action?: Toast['action']) => {
    addToast({ type: 'error', title, description, action, persistent: true });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, action?: Toast['action']) => {
    addToast({ type: 'warning', title, description, action });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, action?: Toast['action']) => {
    addToast({ type: 'info', title, description, action });
  }, [addToast]);

  const security = useCallback((title: string, description?: string, action?: Toast['action']) => {
    addToast({ 
      type: 'security', 
      title, 
      description, 
      action, 
      persistent: true,
      duration: 10000 
    });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    security,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>,
    document.body
  );
}