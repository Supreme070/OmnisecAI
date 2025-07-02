/**
 * Preload script for OmnisecAI Desktop
 * Provides secure bridge between main and renderer processes
 */
import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface for type safety
export interface ElectronAPI {
  // App control
  app: {
    getVersion: () => Promise<string>;
    quit: () => Promise<void>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
  };

  // Window control
  window: {
    show: () => Promise<void>;
    hide: () => Promise<void>;
    isVisible: () => Promise<boolean>;
  };

  // Settings management
  settings: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  // Theme management
  theme: {
    get: () => Promise<string>;
    set: (theme: 'system' | 'light' | 'dark') => Promise<void>;
  };

  // File system operations
  file: {
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
  };

  // Shell operations
  shell: {
    openExternal: (url: string) => Promise<void>;
    showItemInFolder: (path: string) => Promise<void>;
  };

  // Notifications
  notification: {
    show: (options: any) => Promise<void>;
  };

  // Event listeners
  on: (channel: string, listener: (...args: any[]) => void) => void;
  off: (channel: string, listener: (...args: any[]) => void) => void;
  once: (channel: string, listener: (...args: any[]) => void) => void;

  // Event emitters
  emit: (channel: string, ...args: any[]) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // App control
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),
  },

  // Window control
  window: {
    show: () => ipcRenderer.invoke('window:show'),
    hide: () => ipcRenderer.invoke('window:hide'),
    isVisible: () => ipcRenderer.invoke('window:isVisible'),
  },

  // Settings management
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('settings:delete', key),
  },

  // Theme management
  theme: {
    get: () => ipcRenderer.invoke('theme:get'),
    set: (theme: 'system' | 'light' | 'dark') => ipcRenderer.invoke('theme:set', theme),
  },

  // File system operations
  file: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('file:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('file:showSaveDialog', options),
  },

  // Shell operations
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    showItemInFolder: (path: string) => ipcRenderer.invoke('shell:showItemInFolder', path),
  },

  // Notifications
  notification: {
    show: (options: any) => ipcRenderer.invoke('notification:show', options),
  },

  // Event listeners
  on: (channel: string, listener: (...args: any[]) => void) => {
    // Validate allowed channels for security
    const validChannels = [
      'navigate-to',
      'notification-clicked',
      'notification-action',
      'power-suspend',
      'power-resume',
      'power-ac-connected',
      'power-battery',
      'power-event',
      'power-status',
      'power-optimize',
      'system-suspend',
      'system-resume',
      'screen-lock',
      'screen-unlock',
      'system-shutdown',
      'power-save-enabled',
      'power-save-disabled',
      'theme-changed',
      'app-update-available',
      'app-update-downloaded',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, listener);
    } else {
      console.warn(`Attempt to listen to invalid channel: ${channel}`);
    }
  },

  off: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.off(channel, listener);
  },

  once: (channel: string, listener: (...args: any[]) => void) => {
    const validChannels = [
      'navigate-to',
      'notification-clicked',
      'notification-action',
      'power-suspend',
      'power-resume',
      'power-ac-connected',
      'power-battery',
      'power-event',
      'power-status',
      'power-optimize',
      'system-suspend',
      'system-resume',
      'screen-lock',
      'screen-unlock',
      'system-shutdown',
      'power-save-enabled',
      'power-save-disabled',
      'theme-changed',
      'app-update-available',
      'app-update-downloaded',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, listener);
    } else {
      console.warn(`Attempt to listen once to invalid channel: ${channel}`);
    }
  },

  // Event emitters (for sending data to main process)
  emit: (channel: string, ...args: any[]) => {
    // Validate allowed channels for security
    const validChannels = [
      'renderer-ready',
      'user-activity',
      'settings-changed',
      'theme-preference-changed',
      'notification-dismissed',
      'error-report',
      'analytics-event',
      'security-event',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(`Attempt to emit to invalid channel: ${channel}`);
    }
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Also expose a simplified version for backwards compatibility
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      // Only allow specific invoke channels
      const allowedInvokeChannels = [
        'app:getVersion',
        'app:quit',
        'app:minimize',
        'app:maximize',
        'window:show',
        'window:hide',
        'window:isVisible',
        'settings:get',
        'settings:set',
        'settings:delete',
        'theme:get',
        'theme:set',
        'file:showOpenDialog',
        'file:showSaveDialog',
        'shell:openExternal',
        'shell:showItemInFolder',
        'notification:show',
      ];

      if (allowedInvokeChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      } else {
        console.warn(`Attempt to invoke invalid channel: ${channel}`);
        return Promise.reject(new Error(`Invalid channel: ${channel}`));
      }
    },
    
    on: electronAPI.on,
    off: electronAPI.off,
    once: electronAPI.once,
    send: electronAPI.emit,
  },
});

// Expose version information
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

// Additional security: Remove any Node.js globals that might have leaked
delete (window as any).global;
delete (window as any).process;
delete (window as any).Buffer;

// Log that preload script has loaded
console.log('OmnisecAI Desktop preload script loaded successfully');

// Type declaration for global access
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        off: (channel: string, listener: (...args: any[]) => void) => void;
        once: (channel: string, listener: (...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
      };
    };
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
    };
  }
}