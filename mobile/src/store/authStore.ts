/**
 * Authentication store for OmnisecAI Mobile
 * Manages user authentication state and operations
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';
import { authApi, apiClient } from '@/services/api';
import { STORAGE_KEYS } from '@/constants';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationSlug?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  error: string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      biometricEnabled: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ email, password });
          const { token, refresh_token, user } = response.data;

          // Set tokens in API client
          apiClient.setTokens(token, refresh_token);

          // Store tokens securely
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

          set({
            user,
            token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('✅ Login successful');
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(userData);
          console.log('✅ Registration successful:', response.data);
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('❌ Registration failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Attempt to logout on server
          await authApi.logout();
        } catch (error) {
          console.error('❌ Server logout failed:', error);
          // Continue with local logout even if server logout fails
        }

        // Clear tokens from API client
        apiClient.clearTokens();

        // Clear stored data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          biometricEnabled: false,
          error: null,
        });

        console.log('✅ Logout successful');
      },

      refreshUser: async () => {
        const { token } = get();
        
        if (!token) {
          console.log('⚠️ No token available for user refresh');
          return;
        }

        try {
          const response = await authApi.getCurrentUser();
          const user = response.data.user;

          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

          set({ user });
          console.log('✅ User data refreshed');
        } catch (error: any) {
          console.error('❌ Failed to refresh user data:', error);
          
          // If token is invalid, logout
          if (error.code === 'AUTH_ERROR') {
            get().logout();
          }
        }
      },

      enableBiometric: async () => {
        try {
          // This will be implemented with react-native-biometrics
          await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
          set({ biometricEnabled: true });
          console.log('✅ Biometric authentication enabled');
        } catch (error) {
          console.error('❌ Failed to enable biometric:', error);
          throw error;
        }
      },

      disableBiometric: async () => {
        try {
          await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
          set({ biometricEnabled: false });
          console.log('✅ Biometric authentication disabled');
        } catch (error) {
          console.error('❌ Failed to disable biometric:', error);
          throw error;
        }
      },

      authenticateWithBiometric: async () => {
        try {
          // This will be implemented with react-native-biometrics
          // For now, return true as placeholder
          console.log('🔐 Biometric authentication attempted');
          return true;
        } catch (error) {
          console.error('❌ Biometric authentication failed:', error);
          return false;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false });
          console.log('✅ Password reset email sent');
        } catch (error: any) {
          console.error('❌ Forgot password failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to send reset email',
          });
          throw error;
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.resetPassword(token, password);
          set({ isLoading: false });
          console.log('✅ Password reset successful');
        } catch (error: any) {
          console.error('❌ Password reset failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Password reset failed',
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.verifyEmail(token);
          set({ isLoading: false });
          console.log('✅ Email verification successful');
          
          // Refresh user data to update verification status
          get().refreshUser();
        } catch (error: any) {
          console.error('❌ Email verification failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Email verification failed',
          });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Failed to rehydrate auth store:', error);
        } else if (state?.token) {
          // Restore tokens in API client
          apiClient.setTokens(state.token, state.refreshToken || '');
          console.log('✅ Auth store rehydrated');
        }
      },
    }
  )
);

// Initialize store on app start
export const initializeAuthStore = async () => {
  try {
    // Check for stored biometric preference
    const biometricEnabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    
    if (biometricEnabled === 'true') {
      useAuthStore.setState({ biometricEnabled: true });
    }

    console.log('✅ Auth store initialized');
  } catch (error) {
    console.error('❌ Failed to initialize auth store:', error);
  }
};