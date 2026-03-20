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
  farmland_id: string;
  swath_width?: number;
  use_dl?: boolean;
}

export interface PathPlanningResponse {
  farmland_id: string;
  waypoints: number[][];
  total_distance: number;
  estimated_time: number;
  turn_count?: number;
  use_dl_optimization?: boolean;
  generated_at?: string;
}

export interface AllFarmlandsPathRequest {
  swath_width?: number;
  use_dl?: boolean;
  farmland_ids?: string[];
  merge_farmlands?: boolean;
}

export interface SingleFarmlandPath {
  farmland_id: string;
  farmland_name: string;
  waypoints: number[][];
  total_distance: number;
  estimated_time: number;
  turn_count?: number;
}

export interface AllFarmlandsPathResponse {
  farmlands: SingleFarmlandPath[];
  total_distance: number;
  total_estimated_time: number;
  total_turn_count: number;
  use_dl_optimization: boolean;
  generated_at?: string;
  // 合并模式下的额外字段
  merged_path?: number[][];
  farmland_boundaries?: Array<{
    farmland_id: string;
    farmland_name: string;
    coords: number[][];
    center: number[];
  }>;
  view_bounds?: {
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
    center_x: number;
    center_y: number;
  };
}
