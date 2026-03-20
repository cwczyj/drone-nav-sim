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
  AllFarmlandsPathRequest,
  AllFarmlandsPathResponse,
} from '../types';

// 从环境变量获取配置，只需在 .env 文件中修改端口号
const API_PORT = import.meta.env.VITE_API_PORT || '8001';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://localhost:${API_PORT}`;

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

  generateAll: (data: AllFarmlandsPathRequest) =>
    apiClient.post<AllFarmlandsPathResponse>('/api/path-planning/generate-all', data),
};

export default apiClient;