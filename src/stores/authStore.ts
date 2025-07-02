import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, tokenManager } from '@/lib/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'security_analyst' | 'developer' | 'viewer';
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  mfaEnabled: boolean;
  lastLogin?: string;
  settings?: any;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    organizationSlug?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.login(credentials);
          
          if (response.success && response.data) {
            const { token, user } = response.data;
            
            // Store token
            tokenManager.setToken(token);
            
            // Update state
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success(`Welcome back, ${user.firstName}!`);
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } catch (error: any) {
          console.error('Login error:', error);
          
          const message = error.response?.data?.error || error.message || 'Login failed';
          toast.error(message);
          
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.register(userData);
          
          if (response.success) {
            toast.success('Registration successful! Please log in.');
            set({ isLoading: false });
          } else {
            throw new Error(response.error || 'Registration failed');
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          
          const message = error.response?.data?.error || error.message || 'Registration failed';
          toast.error(message);
          
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Call logout API to invalidate server-side session
          await authApi.logout();
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with client-side cleanup even if API fails
        }
        
        // Clear client-side state
        tokenManager.removeToken();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        toast.success('You have been logged out');
      },

      getCurrentUser: async () => {
        const token = tokenManager.getToken();
        if (!token) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });
        
        try {
          const response = await authApi.getCurrentUser();
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            // Invalid token, clear auth
            get().clearAuth();
          }
        } catch (error: any) {
          console.error('Get current user error:', error);
          
          // If unauthorized, clear auth
          if (error.response?.status === 401) {
            get().clearAuth();
          } else {
            set({ isLoading: false, isInitialized: true });
          }
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      clearAuth: () => {
        tokenManager.removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      },

      initialize: async () => {
        const token = tokenManager.getToken();
        if (token) {
          await get().getCurrentUser();
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'omnisecai-auth-storage',
      partialize: (state) => ({
        // Only persist user data, not loading states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateUser: store.updateUser,
    initialize: store.initialize,
  };
};

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);