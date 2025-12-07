import axios from 'axios';
export const api = axios.create({
  baseURL: 'http://localhost:8080/rosterloop/api', // Replace with your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHouseholdById = async (id: string) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createHousehold = async (id: any, flatmateNames: string[]) => {
  const response = await api.post('', {id, flatmateNames });
  return response.data;
};

