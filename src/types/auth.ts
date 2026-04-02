export interface User {
  id: string;
  nama_lengkap: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ErrorResponse {
  message: string;
  success: boolean;
}
