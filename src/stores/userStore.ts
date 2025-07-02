import { create } from 'zustand';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'security_analyst' | 'developer' | 'viewer';
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email: boolean;
      push: boolean;
      security_alerts: boolean;
      weekly_reports: boolean;
    };
    dashboard?: {
      default_view: string;
      refresh_interval: number;
      widgets: string[];
    };
  };
}

export interface OrganizationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserState {
  // Current user profile
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  
  // Organization users (for admin/managers)
  organizationUsers: OrganizationUser[];
  isLoadingUsers: boolean;
  usersError: string | null;
  totalUsers: number;
  
  // Settings & preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      security_alerts: boolean;
      weekly_reports: boolean;
    };
  };
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  
  fetchOrganizationUsers: () => Promise<void>;
  
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
  updateNotificationSettings: (notifications: Partial<UserState['preferences']['notifications']>) => void;
  
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  profile: null,
  isLoadingProfile: false,
  profileError: null,
  
  organizationUsers: [],
  isLoadingUsers: false,
  usersError: null,
  totalUsers: 0,
  
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: true,
      push: true,
      security_alerts: true,
      weekly_reports: true,
    },
  },

  // Actions
  fetchProfile: async () => {
    set({ isLoadingProfile: true, profileError: null });
    
    try {
      const response = await usersApi.getProfile();
      
      if (response.success && response.data) {
        const profile = response.data.user;
        
        set({
          profile,
          isLoadingProfile: false,
        });
        
        // Update preferences from profile settings
        if (profile.settings) {
          const currentPrefs = get().preferences;
          set({
            preferences: {
              ...currentPrefs,
              theme: profile.settings.theme || currentPrefs.theme,
              notifications: {
                ...currentPrefs.notifications,
                ...profile.settings.notifications,
              },
            },
          });
        }
      } else {
        throw new Error(response.error || 'Failed to fetch profile');
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      set({
        profileError: error.message || 'Failed to fetch profile',
        isLoadingProfile: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoadingProfile: true, profileError: null });
    
    try {
      const response = await usersApi.updateProfile(data);
      
      if (response.success && response.data) {
        set({
          profile: response.data.user,
          isLoadingProfile: false,
        });
        
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to update profile';
      
      set({
        profileError: message,
        isLoadingProfile: false,
      });
      
      toast.error(message);
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      const response = await usersApi.changePassword(data);
      
      if (response.success) {
        toast.success('Password changed successfully');
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to change password';
      
      toast.error(message);
      throw error;
    }
  },

  fetchOrganizationUsers: async () => {
    set({ isLoadingUsers: true, usersError: null });
    
    try {
      const response = await usersApi.getUsers();
      
      if (response.success && response.data) {
        set({
          organizationUsers: response.data.users,
          totalUsers: response.data.total,
          isLoadingUsers: false,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Users fetch error:', error);
      set({
        usersError: error.message || 'Failed to fetch users',
        isLoadingUsers: false,
      });
    }
  },

  updatePreferences: (newPreferences) => {
    const currentPrefs = get().preferences;
    set({
      preferences: { ...currentPrefs, ...newPreferences },
    });
  },

  updateNotificationSettings: (notifications) => {
    const currentPrefs = get().preferences;
    set({
      preferences: {
        ...currentPrefs,
        notifications: { ...currentPrefs.notifications, ...notifications },
      },
    });
  },

  clearUserData: () => {
    set({
      profile: null,
      organizationUsers: [],
      totalUsers: 0,
      isLoadingProfile: false,
      isLoadingUsers: false,
      profileError: null,
      usersError: null,
    });
  },
}));

// Selectors
export const useUserProfile = () => useUserStore((state) => ({
  profile: state.profile,
  isLoading: state.isLoadingProfile,
  error: state.profileError,
  updateProfile: state.updateProfile,
  changePassword: state.changePassword,
}));

export const useOrganizationUsers = () => useUserStore((state) => ({
  users: state.organizationUsers,
  total: state.totalUsers,
  isLoading: state.isLoadingUsers,
  error: state.usersError,
  fetchUsers: state.fetchOrganizationUsers,
}));

export const useUserPreferences = () => useUserStore((state) => ({
  preferences: state.preferences,
  updatePreferences: state.updatePreferences,
  updateNotificationSettings: state.updateNotificationSettings,
}));