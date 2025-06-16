import axios, { AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Enhanced request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for caching
      config.metadata = { startTime: new Date() };
      
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`API Request: ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      // Token expired - clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      // You can dispatch a Redux action here to update auth state
      // store.dispatch(logoutUser());
    }
    
    // Enhanced error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'false_alarm';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  reportedBy: string;
  reporter: User;
  verifications: Verification[];
  media: Media[];
}

export interface Verification {
  id: string;
  incidentId: string;
  verifiedBy: string;
  verifiedAt: string;
  verifier: User;
}

export interface Media {
  id: string;
  incidentId: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinDate: string;
  reportsSubmitted: number;
  verificationsHelped: number;
  lastActive: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth API with better error handling
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Login failed' : 'Login failed');
    }
  },

  register: async (email: string, password: string, name: string, phone?: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await api.post('/auth/register', { email, password, name, phone });
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Registration failed' : 'Registration failed');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
  },

  saveAuthData: async (token: string, user: User): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('userData', JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  },

  getAuthData: async (): Promise<{ token: string | null; user: User | null }> => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userData'),
      ]);
      
      return {
        token,
        user: userData ? JSON.parse(userData) : null,
      };
    } catch (error) {
      console.error('Failed to get auth data:', error);
      return { token: null, user: null };
    }
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Token refresh failed' : 'Token refresh failed');
    }
  },
};

// Enhanced Incidents API
export const incidentsAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; priority?: string }): Promise<PaginatedResponse<Incident>> => {
    try {
      const response = await api.get('/incidents', { params });
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to fetch incidents' : 'Failed to fetch incidents');
    }
  },

  getById: async (id: string): Promise<Incident> => {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to fetch incident' : 'Failed to fetch incident');
    }
  },

  create: async (data: {
    type: string;
    description: string;
    location: string;
    priority?: 'low' | 'medium' | 'high';
    latitude?: number;
    longitude?: number;
    media?: File[];
  }): Promise<Incident> => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'media' && Array.isArray(value)) {
          value.forEach((file, index) => {
            formData.append(`media[${index}]`, file);
          });
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await api.post('/incidents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to create incident' : 'Failed to create incident');
    }
  },

  verify: async (incidentId: string): Promise<Incident> => {
    try {
      const response = await api.patch(`/incidents/${incidentId}/verify`);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to verify incident' : 'Failed to verify incident');
    }
  },

  update: async (incidentId: string, data: Partial<Incident>): Promise<Incident> => {
    try {
      const response = await api.put(`/incidents/${incidentId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to update incident' : 'Failed to update incident');
    }
  },
};

// Enhanced Emergency Contacts API
export const contactsAPI = {
  getAll: async (): Promise<EmergencyContact[]> => {
    try {
      const response = await api.get('/contacts');
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to fetch contacts' : 'Failed to fetch contacts');
    }
  },

  create: async (data: {
    name: string;
    phone: string;
    relationship: string;
    isPrimary?: boolean;
  }): Promise<EmergencyContact> => {
    try {
      const response = await api.post('/contacts', data);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to create contact' : 'Failed to create contact');
    }
  },

  update: async (contactId: string, data: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    try {
      const response = await api.put(`/contacts/${contactId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to update contact' : 'Failed to update contact');
    }
  },

  delete: async (contactId: string): Promise<void> => {
    try {
      await api.delete(`/contacts/${contactId}`);
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to delete contact' : 'Failed to delete contact');
    }
  },
};

// Enhanced User Profile API
export const profileAPI = {
  get: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to fetch profile' : 'Failed to fetch profile');
    }
  },

  update: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to update profile' : 'Failed to update profile');
    }
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Failed to upload avatar' : 'Failed to upload avatar');
    }
  },
};

// Health Check API
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string; version: string }> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(error instanceof AxiosError ? error.response?.data?.error || 'Health check failed' : 'Health check failed');
    }
  },
};

export default api; 