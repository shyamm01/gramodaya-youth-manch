import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import axiosInstance from '@/src/lib/axiosInstance';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: AxiosRequestConfig['params'];
}

export interface AxiosBaseQueryError {
  status?: number;
  message: string;
}

/**
 * RTK Query talks to our API through the same axios instance the rest of the
 * app uses, rather than through fetchBaseQuery.
 *
 * That instance already carries the request interceptor that attaches the JWT
 * from localStorage and the x-member-mobile header. Using fetchBaseQuery here
 * would mean re-implementing that auth wiring a second time — which is exactly
 * the drift that left AppContext's bare fetch() calls answering 401 while the
 * education module's apiClient calls worked.
 */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (err: any) {
      return {
        error: {
          status: err?.response?.status,
          message: err?.response?.data?.error || err?.message || 'Request failed',
        },
      };
    }
  };
