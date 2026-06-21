import axios from 'axios';

//const API_BASE_URL = 'https://localhost:7175/api';
const API_BASE_URL = 'http://localhost:5048/api';
//const API_BASE_URL = 'https://localhost/api';


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-Tenant-Id': 'tenant-1',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('tenantId');

  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  return config;
});