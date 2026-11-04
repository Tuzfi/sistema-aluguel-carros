import type { ErroApi } from '../types';

export class ApiError extends Error {
  status: number;
  codigo?: string;
  campos?: Record<string, string>;

  constructor(status: number, mensagem: string, codigo?: string, campos?: Record<string, string>) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }
}

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.token;
      return csrfToken || '';
    }
  } catch (err) {
    console.warn('Falha ao obter CSRF token:', err);
  }
  return '';
}

export function resetCsrfToken(): void {
  csrfToken = null;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-TOKEN'] = token;
    }
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) {
    return null as unknown as T;
  }

  let data: any = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      resetCsrfToken();
      window.dispatchEvent(new Event('viacar:unauthorized'));
    }
    const errData: ErroApi = data || {
      codigo: `HTTP_${res.status}`,
      mensagem: res.statusText || 'Erro na requisição ao servidor',
    };
    throw new ApiError(
      res.status,
      errData.mensagem || `Erro ${res.status}`,
      errData.codigo,
      errData.campos
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: any) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: any) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
