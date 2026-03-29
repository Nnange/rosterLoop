import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/rosterloop/api', // Replace with your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
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

