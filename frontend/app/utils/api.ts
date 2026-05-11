import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests and check for expiration
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  // Check if token has expired
  if (tokenExpiry) {
    const expiryTime = Number.parseInt(tokenExpiry, 10)
    if (Date.now() > expiryTime) {
      // Token expired, clear auth data and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('tokenExpiry')
      globalThis.location.href = '/login'
      return Promise.reject(new Error('Token expired'))
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getHouseholdById = async (id: string) => {
  const response = await api.get(`/households/${id}`);
  return response.data;
};

export const createHousehold = async (id: any, flatmateNames: string[]) => {
  const response = await api.post('/households', {id, flatmateNames });
  return response.data;
};

export const checkMemberStatus = async () => {
  const response = await api.get('/households/member/status');
  return response.data;
};

