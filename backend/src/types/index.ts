import { Request } from 'express';
import { JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

// User interface
export interface User {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  role: 'client' | 'admin';
  created_at?: Date;
  iat?: number;
  exp?: number;
}

// JWT Payload interface
export interface JwtPayload extends JwtPayloadBase {
  id: number;
  email?: string;
  role: 'client' | 'admin';
  iat?: number;
  exp?: number;
}

// Authenticated Request interface
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Custom Request interface (สำหรับ compatibility)
export interface CustomRequest extends Request {
  user?: {
    id: number;
    email?: string;
    role: 'client' | 'admin';
    iat?: number;
    exp?: number;
  };
}

// Car interface
export interface Car {
  id?: number;
  modelId: number;
  year: number;
  price: number;
  description: string;
  imageUrl: string;
  model3dUrl: string;
  status: 'available' | 'sold' | 'reserved';
  color?: string;
  mileage?: number;
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  created_at?: Date;
  updated_at?: Date;
}

// Booking interface
export interface Booking {
  id?: number;
  userId: number;
  carId: number;
  startDate?: Date;
  endDate?: Date;
  bookingDate?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'approved' | 'rejected';
  createdAt?: Date;
  type?: 'test_drive' | 'inquiry';
  message?: string;
}

// Contact interface
export interface Contact {
  id?: number;
  user_id?: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  file_name?: string;
  file_path?: string;
  status?: 'pending' | 'replied';
  timestamp?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Review interface
export interface Review {
  id?: number;
  user_id: number;
  car_id: number;
  rating: number;
  comment: string;
  created_at?: Date;
  updated_at?: Date;
}

// Dashboard Data interface
export interface DashboardData {
  registerData: { date: string; count: number }[];
  loginData: { date: string; count: number }[];
  totalRegisters: number;
  totalLogins: number;
}

// Brand interface
export interface Brand {
  id?: number;
  name: string;
  created_at?: Date;
}

// Model interface
export interface Model {
  id?: number;
  brand_id: number;
  name: string;
  created_at?: Date;
}

// Activity Log interface
export interface ActivityLog {
  id?: number;
  user_id: number;
  action: string;
  details?: string;
  timestamp?: Date;
}

// Report Data interfaces
export interface UserActivityData {
  date: string;
  registrations: number;
  logins: number;
}

export interface RegistrationTrendData {
  month: string;
  count: number;
}