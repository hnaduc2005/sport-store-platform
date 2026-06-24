export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | undefined;

  if (typeof window !== 'undefined') {
    try {
      token = JSON.parse(window.localStorage.getItem('sport_store_session') ?? 'null')?.accessToken;
    } catch {
      token = undefined;
    }
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.statusText}`;

    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (payload.message) {
        message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
      }
    } catch {
      // Keep the default HTTP status text.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  let token: string | undefined;

  if (typeof window !== 'undefined') {
    try {
      token = JSON.parse(window.localStorage.getItem('sport_store_session') ?? 'null')?.accessToken;
    } catch {
      token = undefined;
    }
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.statusText}`;

    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (payload.message) {
        message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
      }
    } catch {
      // Keep the default HTTP status text.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function queryString(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== false) {
      query.set(key, String(value));
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}
