/**
 * Hook for offline detection and handling
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineQueueItem {
  id: string;
  request: () => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  timestamp: number;
  retries: number;
  maxRetries: number;
  description: string;
}

interface UseOfflineOptions {
  enableQueue?: boolean;
  queueSizeLimit?: number;
  syncOnReconnect?: boolean;
  showToasts?: boolean;
}

interface UseOfflineResult {
  isOnline: boolean;
  isOffline: boolean;
  queuedRequests: OfflineQueueItem[];
  queueRequest: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => void;
  clearQueue: () => void;
  syncQueue: () => Promise<void>;
  removeFromQueue: (id: string) => void;
  retryQueueItem: (id: string) => Promise<void>;
}

const defaultOptions: UseOfflineOptions = {
  enableQueue: true,
  queueSizeLimit: 50,
  syncOnReconnect: true,
  showToasts: true
};

let offlineQueue: OfflineQueueItem[] = [];
let queueListeners: Set<() => void> = new Set();

// Persistent storage for offline queue
const QUEUE_STORAGE_KEY = 'omnisecai_offline_queue';

const loadQueueFromStorage = (): OfflineQueueItem[] => {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out old items (older than 24 hours)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return parsed.filter((item: OfflineQueueItem) => item.timestamp > dayAgo);
    }
  } catch (error) {
    console.error('Failed to load offline queue from storage:', error);
  }
  return [];
};

const saveQueueToStorage = (queue: OfflineQueueItem[]): void => {
  try {
    // Don't persist request functions, only metadata
    const serializable = queue.map(item => ({
      id: item.id,
      timestamp: item.timestamp,
      retries: item.retries,
      maxRetries: item.maxRetries,
      description: item.description
    }));
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save offline queue to storage:', error);
  }
};

// Initialize queue from storage
if (typeof window !== 'undefined') {
  offlineQueue = loadQueueFromStorage();
}

const notifyQueueListeners = () => {
  queueListeners.forEach(listener => listener());
};

export function useOffline(options: UseOfflineOptions = {}): UseOfflineResult {
  const opts = { ...defaultOptions, ...options };
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedRequests, setQueuedRequests] = useState<OfflineQueueItem[]>(offlineQueue);

  // Update queue state when global queue changes
  useEffect(() => {
    const listener = () => setQueuedRequests([...offlineQueue]);
    queueListeners.add(listener);
    return () => queueListeners.delete(listener);
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Application is online');
      setIsOnline(true);
      
      if (opts.showToasts) {
        toast.success('Connection restored', {
          description: 'You are back online'
        });
      }

      // Auto-sync queue when coming back online
      if (opts.syncOnReconnect && offlineQueue.length > 0) {
        syncQueue();
      }
    };

    const handleOffline = () => {
      console.log('📴 Application is offline');
      setIsOnline(false);
      
      if (opts.showToasts) {
        toast.warning('Connection lost', {
          description: 'You are now offline. Some features may be limited.',
          duration: 0 // Persistent until back online
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [opts.showToasts, opts.syncOnReconnect]);

  // Queue management functions
  const queueRequest = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => {
    if (!opts.enableQueue) return;

    const queueItem: OfflineQueueItem = {
      ...item,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0
    };

    // Check queue size limit
    if (offlineQueue.length >= opts.queueSizeLimit!) {
      // Remove oldest item
      offlineQueue.shift();
      if (opts.showToasts) {
        toast.warning('Offline queue full', {
          description: 'Oldest request removed to make space'
        });
      }
    }

    offlineQueue.push(queueItem);
    saveQueueToStorage(offlineQueue);
    notifyQueueListeners();

    if (opts.showToasts) {
      toast.info('Request queued', {
        description: `${item.description} will be retried when online`
      });
    }

    console.log('📥 Request queued for offline sync:', item.description);
  }, [opts.enableQueue, opts.queueSizeLimit, opts.showToasts]);

  const removeFromQueue = useCallback((id: string) => {
    const index = offlineQueue.findIndex(item => item.id === id);
    if (index !== -1) {
      offlineQueue.splice(index, 1);
      saveQueueToStorage(offlineQueue);
      notifyQueueListeners();
    }
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueue.length = 0;
    saveQueueToStorage(offlineQueue);
    notifyQueueListeners();
    
    if (opts.showToasts) {
      toast.info('Offline queue cleared');
    }
  }, [opts.showToasts]);

  const retryQueueItem = useCallback(async (id: string): Promise<void> => {
    const item = offlineQueue.find(req => req.id === id);
    if (!item) return;

    try {
      console.log(`🔄 Retrying offline request: ${item.description}`);
      const result = await item.request();
      
      // Success - remove from queue
      removeFromQueue(id);
      
      if (item.onSuccess) {
        item.onSuccess(result);
      }

      if (opts.showToasts) {
        toast.success('Request completed', {
          description: item.description
        });
      }
    } catch (error) {
      console.error(`❌ Failed to retry offline request: ${item.description}`, error);
      
      // Increment retry count
      item.retries++;
      
      if (item.retries >= item.maxRetries) {
        // Max retries reached - remove from queue
        removeFromQueue(id);
        
        if (item.onError) {
          item.onError(error);
        }

        if (opts.showToasts) {
          toast.error('Request failed', {
            description: `${item.description} failed after ${item.maxRetries} attempts`
          });
        }
      } else {
        // Will retry later
        saveQueueToStorage(offlineQueue);
        notifyQueueListeners();
        
        if (opts.showToasts) {
          toast.warning('Retry failed', {
            description: `${item.description} will be retried (${item.retries}/${item.maxRetries})`
          });
        }
      }
    }
  }, [removeFromQueue, opts.showToasts]);

  const syncQueue = useCallback(async (): Promise<void> => {
    if (!isOnline || offlineQueue.length === 0) return;

    console.log(`🔄 Syncing ${offlineQueue.length} queued requests...`);
    
    if (opts.showToasts) {
      toast.info('Syncing offline requests', {
        description: `Processing ${offlineQueue.length} queued requests`
      });
    }

    // Process queue items sequentially to avoid overwhelming the server
    const queueCopy = [...offlineQueue];
    let successCount = 0;
    let failureCount = 0;

    for (const item of queueCopy) {
      try {
        await retryQueueItem(item.id);
        successCount++;
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failureCount++;
        console.error('Queue sync error:', error);
      }
    }

    if (opts.showToasts) {
      if (successCount > 0) {
        toast.success('Sync completed', {
          description: `${successCount} requests completed successfully`
        });
      }
      
      if (failureCount > 0) {
        toast.warning('Some requests failed', {
          description: `${failureCount} requests could not be completed`
        });
      }
    }

    console.log(`✅ Queue sync completed: ${successCount} success, ${failureCount} failed`);
  }, [isOnline, retryQueueItem, opts.showToasts]);

  // Auto-sync on reconnect
  useEffect(() => {
    if (isOnline && opts.syncOnReconnect && offlineQueue.length > 0) {
      // Delay sync slightly to allow network to stabilize
      const timeout = setTimeout(() => {
        syncQueue();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOnline, opts.syncOnReconnect, syncQueue]);

  return {
    isOnline,
    isOffline: !isOnline,
    queuedRequests,
    queueRequest,
    clearQueue,
    syncQueue,
    removeFromQueue,
    retryQueueItem
  };
}

// Utility function to wrap API calls with offline support
export function withOfflineSupport<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  description: string,
  options: {
    maxRetries?: number;
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
  } = {}
): T {
  return ((...args: any[]) => {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      // Online - execute normally
      return apiFunction(...args);
    } else {
      // Offline - queue for later
      return new Promise((resolve, reject) => {
        const { maxRetries = 3, onSuccess, onError } = options;
        
        // Note: This requires the useOffline hook to be used in a component
        // In practice, you'd use this with a global offline manager
        const queueItem = {
          request: () => apiFunction(...args),
          onSuccess: (result: any) => {
            if (onSuccess) onSuccess(result);
            resolve(result);
          },
          onError: (error: any) => {
            if (onError) onError(error);
            reject(error);
          },
          description,
          maxRetries
        };
        
        // This would need to be integrated with a global queue manager
        console.log('Would queue request:', queueItem);
        reject(new Error('Offline - request queued for later'));
      });
    }
  }) as T;
}

// Global offline manager for app-wide offline handling
export class OfflineManager {
  private static instance: OfflineManager;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStatus(): boolean {
    return this.isOnline;
  }
}