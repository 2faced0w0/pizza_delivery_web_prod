import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';

const baseURL: string = (import.meta as any).env?.VITE_API_URL || '/';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    if (token) {
      const headers: AxiosRequestHeaders = (config.headers ?? {}) as AxiosRequestHeaders;
      headers['Authorization'] = `Bearer ${token}`;
      config.headers = headers;
    }
    return config;
  } catch {
    return config;
  }
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    const data: any = error.response?.data;
    const message = (data && (data.error?.message || data.message)) || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);