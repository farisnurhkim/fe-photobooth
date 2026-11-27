import axiosInstance from './axios';
import { PackagesResponse, Package, CreatePackageDTO, UpdatePackageDTO } from '@/types/package';
import { ISchedule } from '@/types/schedule';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  bookingCount: number;
  bookingGrowth: number;
  revenueTrend: { day: string; current: number; previous: number }[];
  bookingMix: { paket: string; count: number; percentage: number }[];
  bookingDensity: { dayOfWeek: string; isoDay: number; time: string; count: number }[];
  upcomingSessions?: BookingItem[];
}

export interface FullAnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  avgBookingValue: number;
  avgBookingValueGrowth: number;
  conversionRate: number;
  conversionRateGrowth: number;
  revenueTrends: { date: string; value: number }[];
  packageDistribution: { name: string; value: number }[];
  scheduleEfficiency: { time: string; data: { day: string; time: string; count: number }[] }[];
  cancellationAnalysis: { reason: string; count: number; percentage: number }[];
}

export interface BookingItem {
  _id: string;
  kode_booking: string;
  status_booking: string;
  createdAt: string;
  user_id: {
    _id: string;
    nama_lengkap: string;
    email: string;
  };
  package_id: {
    _id: string;
    nama_paket: string;
    harga: number;
  };
  schedule_date_id: {
    _id: string;
    date: string;
    slots: {
      _id: string;
      start_time: string;
      end_time: string;
      status: string;
    }[];
  };
  schedule_slot_ids: string[];
  payment: {
    metode_bayar: string;
    status_bayar: string;
    order_id_midtrans?: string;
  };
}

export interface BookingsResponse {
  success: boolean;
  data: BookingItem[];
  currentPage: number;
  totalPages: number;
  totalData: number;
}

async function apiFetch<T>(
  endpoint: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

export async function getDashboardAnalytics(token?: string, range: number = 30): Promise<{ success: boolean; data: AnalyticsData }> {
  if (token) {
    return apiFetch(`/dashboard/analytics?range=${range}`, token);
  }
  const response = await axiosInstance.get(`/dashboard/analytics?range=${range}`);
  return response.data;
}

export async function getFullAnalytics(token?: string, range: number = 30): Promise<{ success: boolean; data: FullAnalyticsData }> {
  if (token) {
    return apiFetch(`/dashboard/analytics/full?range=${range}`, token);
  }
  const response = await axiosInstance.get(`/dashboard/analytics/full?range=${range}`);
  return response.data;
}

export async function getAdminBookings(
  token?: string,
  page = 1,
  limit = 5,
  status?: string,
  startDate?: string,
  endDate?: string,
  search?: string
): Promise<BookingsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status && status !== 'All') params.set('status', status);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (search) params.set('search', search);

  if (token) {
    return apiFetch(`/bookings?${params.toString()}`, token);
  }
  
  const response = await axiosInstance.get(`/bookings?${params.toString()}`);
  return response.data;
}

export async function updateBookingStatus(id: string, status: string): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.patch(`/bookings/${id}/status`, { status_booking: status });
  return response.data;
}

export async function cancelBooking(id: string, reason: string): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.post(`/bookings/${id}/cancel`, { alasan_batal: reason });
  return response.data;
}

// Package API Functions
export async function getAdminPackages(
  page = 1,
  limit = 10,
  type?: string,
  search?: string,
  sort?: string,
  order?: 'asc' | 'desc'
): Promise<PackagesResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type && type !== 'all') params.set('type', type.toLowerCase());
  if (search) params.set('q', search);
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);
  
  const response = await axiosInstance.get(`/packages?${params.toString()}`);
  return response.data;
}


export async function createAdminPackage(data: CreatePackageDTO): Promise<{ success: boolean; data: Package }> {
  const response = await axiosInstance.post('/packages', data);
  return response.data;
}

export async function updateAdminPackage(id: string, data: UpdatePackageDTO): Promise<{ success: boolean; data: Package }> {
  const response = await axiosInstance.put(`/packages/${id}`, data);
  return response.data;
}

export async function deleteAdminPackage(id: string): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.delete(`/packages/${id}`);
  return response.data;
}

// Media Upload API
export async function uploadSingleMedia(file: File): Promise<{ success: boolean; data: { url: string; public_id: string } }> {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axiosInstance.post('/media/upload-single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteMedia(fileUrl: string): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.post('/media/delete', { fileUrl });
  return response.data;
}

// Schedule API Functions
export async function getAdminSchedules(date?: string): Promise<{ success: boolean; data: ISchedule[] }> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const response = await axiosInstance.get(`/schedules/admin?${params.toString()}`);
  return response.data;
}

export async function createAdminSchedule(data: Partial<ISchedule>): Promise<{ success: boolean; data: ISchedule }> {
  const response = await axiosInstance.post('/schedules', data);
  return response.data;
}

export async function updateAdminSchedule(id: string, data: Partial<ISchedule>): Promise<{ success: boolean; data: ISchedule }> {
  const response = await axiosInstance.put(`/schedules/${id}`, data);
  return response.data;
}

export async function deleteAdminSchedule(id: string): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.delete(`/schedules/${id}`);
  return response.data;
}

// Public API Functions
export async function getPublicAvailableSchedules(date?: string): Promise<{ success: boolean; data: ISchedule[] }> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const response = await axiosInstance.get(`/schedules/available?${params.toString()}`);
  return response.data;
}
