export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Farmland {
  id: string;
  user_id: string;
  name: string;
  area: number;
  crop_type: string;
  boundary_coords: number[][];
  created_at: string;
  updated_at: string;
}

export interface FarmlandCreate {
  name: string;
  area: number;
  crop_type: string;
  boundary_coords: number[][];
}

export interface FarmlandUpdate {
  name?: string;
  area?: number;
  crop_type?: string;
  boundary_coords?: number[][];
}

export interface PathPlanningRequest {
  farmlandId: string;
  swathWidth?: number;
  useDl?: boolean;
}

export interface PathPlanningResponse {
  path: number[][];
  totalDistance: number;
  estimatedTime: number;
}