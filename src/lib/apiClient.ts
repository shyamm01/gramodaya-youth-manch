import axiosInstance from './axiosInstance';

export { axiosInstance };
export default axiosInstance;

/**
 * Universal Axios-based API Client Methods
 */
export const apiClient = {
  get: <T = any>(url: string, config = {}) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.put<T>(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config = {}) =>
    axiosInstance.delete<T>(url, config).then((res) => res.data),
};

/**
 * Backward-compatible apiFetch powered by axiosInstance
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  const method = (init.method || 'GET').toUpperCase();
  
  let bodyData: any = init.body;
  if (typeof init.body === 'string') {
    try {
      bodyData = JSON.parse(init.body);
    } catch {
      bodyData = init.body;
    }
  }

  try {
    const axiosRes = await axiosInstance({
      url,
      method,
      data: bodyData,
      headers: (init.headers as any) || {},
    });

    return new Response(JSON.stringify(axiosRes.data), {
      status: axiosRes.status,
      statusText: axiosRes.statusText,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || err.message || 'Request failed';
    const status = err.response?.status || 500;
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status,
      statusText: err.response?.statusText || 'Error',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
