import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
// For physical device testing, use your computer's IP address
// const API_BASE_URL = 'http://192.168.1.100:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // You can add navigation logic here if needed
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
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
  verifications: any[];
  media: any[];
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
  joinDate: string;
  reportsSubmitted: number;
  verificationsHelped: number;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string, phone?: string) => {
    const response = await api.post('/auth/register', { email, password, name, phone });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  saveAuthData: async (token: string, user: User) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  },

  getAuthData: async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');
    return {
      token,
      user: userData ? JSON.parse(userData) : null,
    };
  },
};

// Incidents API
export const incidentsAPI = {
  getAll: async (): Promise<Incident[]> => {
    const response = await api.get('/incidents');
    return response.data;
  },

  create: async (data: {
    type: string;
    description: string;
    location: string;
    priority?: 'low' | 'medium' | 'high';
    latitude?: number;
    longitude?: number;
  }): Promise<Incident> => {
    const response = await api.post('/incidents', data);
    return response.data;
  },

  verify: async (incidentId: string): Promise<Incident> => {
    const response = await api.patch(`/incidents/${incidentId}/verify`);
    return response.data;
  },
};

// Emergency Contacts API
export const contactsAPI = {
  getAll: async (): Promise<EmergencyContact[]> => {
    const response = await api.get('/contacts');
    return response.data;
  },

  create: async (data: {
    name: string;
    phone: string;
    relationship: string;
    isPrimary?: boolean;
  }): Promise<EmergencyContact> => {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  update: async (contactId: string, data: {
    name?: string;
    phone?: string;
    relationship?: string;
    isPrimary?: boolean;
  }): Promise<EmergencyContact> => {
    const response = await api.put(`/contacts/${contactId}`, data);
    return response.data;
  },

  delete: async (contactId: string): Promise<void> => {
    await api.delete(`/contacts/${contactId}`);
  },
};

// User Profile API
export const profileAPI = {
  get: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data;
  },
};

// Health Check API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 