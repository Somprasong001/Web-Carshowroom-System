const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const getHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ==================== AUTH APIs ====================

export const register = async (email: string, password: string, role: string = 'client') => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, role }),
  });
  return handleResponse(response);
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const getDashboardData = async () => {
  const response = await fetch(`${API_URL}/auth/dashboard`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const getRecentActivity = async () => {
  const response = await fetch(`${API_URL}/auth/recent-activity`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ==================== CAR APIs ====================

export const getCars = async () => {
  const response = await fetch(`${API_URL}/cars`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getCarById = async (id: number) => {
  const response = await fetch(`${API_URL}/cars/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getBrands = async () => {
  const response = await fetch(`${API_URL}/brands`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getYears = async () => {
  const response = await fetch(`${API_URL}/years`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== REVIEW APIs ====================

export const getReviews = async () => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createReview = async (car_id: number, rating: number, comment: string) => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ car_id, rating, comment }),
  });
  return handleResponse(response);
};

export const updateReview = async (id: number, rating: number, comment: string) => {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ rating, comment }),
  });
  return handleResponse(response);
};

export const deleteReview = async (id: number) => {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ==================== BOOKING APIs ====================

export const getMyBookings = async () => {
  const response = await fetch(`${API_URL}/bookings/my-bookings`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const createBooking = async (
  carId: number, 
  bookingDate: string, 
  type: 'test_drive' | 'inquiry', 
  message?: string
) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ carId, bookingDate, type, message }),
  });
  return handleResponse(response);
};

export const deleteBooking = async (id: number) => {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ==================== CONTACT APIs ====================

export const sendContact = async (name: string, email: string, subject: string, message: string, file?: File) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('subject', subject);
  formData.append('message', message);
  if (file) {
    formData.append('file', file);
  }

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse(response);
};

export const getContacts = async () => {
  const response = await fetch(`${API_URL}/contacts`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const replyContact = async (id: number, reply: string) => {
  const response = await fetch(`${API_URL}/contacts/${id}/reply`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ reply }),
  });
  return handleResponse(response);
};

export const deleteContact = async (id: number) => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ==================== REPORT APIs ====================

export const getUserActivity = async () => {
  const response = await fetch(`${API_URL}/reports/user-activity`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const getRegistrationTrends = async () => {
  const response = await fetch(`${API_URL}/reports/registration-trends`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export default {
  // Auth
  register,
  login,
  getDashboardData,
  getRecentActivity,
  
  // Cars
  getCars,
  getCarById,
  getBrands,
  getYears,
  
  // Reviews
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  
  // Bookings
  getMyBookings,
  createBooking,
  deleteBooking,
  
  // Contacts
  sendContact,
  getContacts,
  replyContact,
  deleteContact,
  
  // Reports
  getUserActivity,
  getRegistrationTrends,
};