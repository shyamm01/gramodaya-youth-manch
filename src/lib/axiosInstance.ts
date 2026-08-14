import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Centralized Axios Instance configured with JWT Auth & Cookie credentials
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  timeout: 20000,
  withCredentials: true, // Send and receive HTTP-Only cookies (gym_auth_token)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── 1. REQUEST INTERCEPTOR: Inject JWT Bearer Token ──
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gym_token');
      if (token && !config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const memberMobile = localStorage.getItem('gym_member_mobile');
      if (memberMobile && !config.headers['x-member-mobile']) {
        config.headers['x-member-mobile'] = memberMobile;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ── 2. RESPONSE INTERCEPTOR: Error Normalization ──
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    // If 401 Unauthorized in browser, handle clearing invalid tokens if needed
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Allow caller to handle redirection or re-authentication
    }
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Network or server request failed';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
