import axios, { AxiosHeaders } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const headers = config.headers ?? new AxiosHeaders();
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return 'Invalid credentials';
    }

    const data = error.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const messageObject = data as Record<string, unknown>;
      if (typeof messageObject.message === 'string') {
        return messageObject.message;
      }
      if (typeof messageObject.error === 'string') {
        return messageObject.error;
      }
      if (typeof messageObject.detail === 'string') {
        return messageObject.detail;
      }
    }
  }

  return 'Request failed';
}

export default api;