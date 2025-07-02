/**
 * API service for OmnisecAI Mobile
 * Handles all HTTP requests to the backend API
 */
import { API_CONFIG, ERROR_CODES } from '@/constants';
import { ApiResponse, PaginatedResponse, RequestConfig } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retries = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    this.initializeTokens();
  }

  private async initializeTokens() {
    try {
      this.token = await AsyncStorage.getItem('omnisecai_auth_token');
      this.refreshToken = await AsyncStorage.getItem('omnisecai_refresh_token');
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
    }
  }

  public setTokens(token: string, refreshToken?: string) {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  public clearTokens() {
    this.token = null;
    this.refreshToken = null;
  }

  private async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  private async makeRequest<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    // Check network connectivity
    if (!(await this.isOnline())) {
      throw {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'No internet connection',
        offline: true,
        retryable: true,
      };
    }

    const url = `${this.baseURL}${config.url}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      'X-Platform': 'mobile',
      'X-App-Version': '1.0.0',
      ...config.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const requestOptions: RequestInit = {
      method: config.method,
      headers,
      body: config.data ? JSON.stringify(config.data) : undefined,
    };

    let lastError: any;

    // Retry logic
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        console.log(`📱 API Request [${attempt + 1}/${this.retries + 1}]: ${config.method} ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`📱 API Response: ${response.status} ${response.statusText}`);

        // Handle authentication errors
        if (response.status === 401 && this.refreshToken && attempt === 0) {
          console.log('🔄 Attempting token refresh...');
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            // Update authorization header and retry
            headers.Authorization = `Bearer ${this.token}`;
            continue;
          } else {
            throw {
              code: ERROR_CODES.AUTH_ERROR,
              message: 'Authentication failed',
              reason: 'token_expired',
            };
          }
        }

        const responseData = await response.json();

        if (!response.ok) {
          throw {
            code: ERROR_CODES.SERVER_ERROR,
            message: responseData.message || `HTTP ${response.status}`,
            status: response.status,
            data: responseData,
          };
        }

        return responseData;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ API Error [${attempt + 1}/${this.retries + 1}]:`, error);

        // Don't retry on authentication or client errors
        if (error.code === ERROR_CODES.AUTH_ERROR || 
            (error.status && error.status >= 400 && error.status < 500)) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === this.retries) {
          break;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
      }
    }

    throw lastError;
  }

  private async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.token = data.data.token;
      
      if (data.data.refresh_token) {
        this.refreshToken = data.data.refresh_token;
      }

      // Update stored tokens
      await AsyncStorage.setItem('omnisecai_auth_token', this.token!);
      if (data.data.refresh_token) {
        await AsyncStorage.setItem('omnisecai_refresh_token', data.data.refresh_token);
      }

      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearTokens();
      await AsyncStorage.multiRemove(['omnisecai_auth_token', 'omnisecai_refresh_token']);
      return false;
    }
  }

  // Generic HTTP methods
  public async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.makeRequest<T>({
      method: 'GET',
      url: url + queryString,
    });
  }

  public async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'POST',
      url,
      data,
    });
  }

  public async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  public async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'PATCH',
      url,
      data,
    });
  }

  public async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'DELETE',
      url,
    });
  }

  // File upload method
  public async upload<T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    if (!(await this.isOnline())) {
      throw {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'No internet connection',
        offline: true,
        retryable: true,
      };
    }

    const fullUrl = `${this.baseURL}${url}`;
    const headers: Record<string, string> = {
      'X-Request-ID': `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      'X-Platform': 'mobile',
      'X-App-Version': '1.0.0',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw {
          code: ERROR_CODES.SERVER_ERROR,
          message: responseData.message || `HTTP ${response.status}`,
          status: response.status,
          data: responseData,
        };
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Upload Error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// API endpoint modules
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ token: string; refresh_token: string; user: any }>('/auth/login', credentials),
  
  register: (userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    organizationSlug?: string 
  }) =>
    apiClient.post<{ user: any }>('/auth/register', userData),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getCurrentUser: () =>
    apiClient.get<{ user: any }>('/auth/me'),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post<{ token: string; refresh_token?: string }>('/auth/refresh', { 
      refresh_token: refreshToken 
    }),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }),
  
  generateMFASecret: () =>
    apiClient.post<{ secret: string; qrCode: string }>('/auth/mfa/generate'),
  
  enableMFA: (data: { secret: string; token: string }) =>
    apiClient.post('/auth/mfa/enable', data),
  
  verifyMFA: (data: { token: string }) =>
    apiClient.post('/auth/mfa/verify', data),
};

export const dashboardApi = {
  getMetrics: () =>
    apiClient.get('/threats/dashboard'),
  
  getSystemHealth: () =>
    apiClient.get('/health'),
};

export const threatsApi = {
  getThreats: (params?: { 
    page?: number; 
    limit?: number; 
    q?: string; 
    severity?: string; 
    status?: string; 
  }) =>
    apiClient.get<PaginatedResponse>('/threats', params),
  
  getThreat: (id: string) =>
    apiClient.get<{ threat: any }>(`/threats/${id}`),
  
  updateThreatStatus: (id: string, data: { status: string; resolutionNotes?: string }) =>
    apiClient.put<{ threat: any }>(`/threats/${id}/status`, data),
  
  reportThreat: (data: {
    threatType: string;
    description: string;
    severity?: string;
    indicators: Record<string, any>;
  }) =>
    apiClient.post<{ threat: any }>('/threats/report', data),
};

export const modelsApi = {
  getModels: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string; 
  }) =>
    apiClient.get<PaginatedResponse>('/models', params),
  
  getModel: (id: string) =>
    apiClient.get<{ model: any }>(`/models/${id}`),
  
  uploadModel: (formData: FormData, onProgress?: (progress: number) => void) =>
    apiClient.upload<{ model: any; scan: any }>('/models/upload', formData, onProgress),
  
  deleteModel: (id: string) =>
    apiClient.delete(`/models/${id}`),
  
  getModelScans: (modelId: string) =>
    apiClient.get<{ scans: any[] }>(`/models/${modelId}/scans`),
};

export const scansApi = {
  getScans: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
  }) =>
    apiClient.get<PaginatedResponse>('/scanning', params),
  
  getScan: (id: string) =>
    apiClient.get<{ scan: any }>(`/scanning/${id}`),
  
  createScan: (data: { modelId: string; scanType?: string }) =>
    apiClient.post<{ scan: any }>('/scanning', data),
  
  cancelScan: (id: string) =>
    apiClient.post(`/scanning/${id}/cancel`),
  
  retryScan: (id: string) =>
    apiClient.post<{ scan: any }>(`/scanning/${id}/retry`),
};

export const notificationsApi = {
  getNotifications: (params?: { 
    page?: number; 
    limit?: number; 
    unreadOnly?: boolean; 
  }) =>
    apiClient.get<PaginatedResponse>('/notifications', params),
  
  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),
  
  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
  
  updatePushToken: (token: string) =>
    apiClient.post('/notifications/push-token', { token }),
};

export const userApi = {
  getProfile: () =>
    apiClient.get<{ user: any }>('/users/profile'),
  
  updateProfile: (data: any) =>
    apiClient.put<{ user: any }>('/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/users/change-password', data),
};