// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5002/api', // your backend URL
});

// Add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Handle token errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && [401, 403].includes(err.response.status)) {
      localStorage.removeItem('token');

      // Redirect to central login page instead of current app
      window.location.href = 'http://localhost:5173/login';
    }
    return Promise.reject(err);
  }
);


export default API;
