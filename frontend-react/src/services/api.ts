import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  Farmland,
  FarmlandCreate,
  FarmlandUpdate,
  PathPlanningRequest,
  PathPlanningResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (!error.response) {
      error.message = '网络连接失败，请检查网络或稍后重试';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: RegisterRequest) =>
    apiClient.post<{ message: string; user_id: string }>('/api/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/api/auth/login', data),

  logout: () => apiClient.post<{ message: string }>('/api/auth/logout'),

  getMe: () => apiClient.get<User>('/api/auth/me'),
};

export const farmlandAPI = {
  getAll: () => apiClient.get<Farmland[]>('/api/farmlands'),

  getById: (id: string) => apiClient.get<Farmland>(`/api/farmlands/${id}`),

  create: (data: FarmlandCreate) =>
    apiClient.post<Farmland>('/api/farmlands', data),

  update: (id: string, data: FarmlandUpdate) =>
    apiClient.put<Farmland>(`/api/farmlands/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/farmlands/${id}`),
};

export const pathPlanningAPI = {
  generate: (data: PathPlanningRequest) =>
    apiClient.post<PathPlanningResponse>('/api/path-planning/generate', data),
};

export default apiClient;