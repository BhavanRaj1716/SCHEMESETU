/**
 * API Client — single integration point between frontend and backend.
 *
 * Set NEXT_PUBLIC_API_URL in .env.local to point at the real backend.
 * When the env var is absent, the client falls back to mock data handlers
 * so UI development can continue without a running backend.
 *
 * NEVER import mock data directly in feature code — always go through a service,
 * which calls this client. That way swapping to the real backend requires
 * changes only here and in the service files.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? null;

export const IS_MOCK_MODE = API_BASE === null;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  /** Query params appended to the URL */
  params?: Record<string, string | number | boolean | undefined | null>;
}

interface ErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

type AuthTokenProvider = () => string | null | undefined;
let authTokenProvider: AuthTokenProvider | null = null;

export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Core fetch wrapper. Throws ApiError on non-2xx responses.
 * Only called when NEXT_PUBLIC_API_URL is set (i.e. real backend mode).
 */
export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  if (!API_BASE) {
    throw new Error(
      `apiRequest called in mock mode. Path: ${path}. ` +
        'Set NEXT_PUBLIC_API_URL to enable real backend calls.'
    );
  }

  const { method = 'GET', body, params } = options;
  const token = authTokenProvider?.();

  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text || res.statusText || `Request failed with status ${res.status}`;
    try {
      const parsed = JSON.parse(text) as ErrorEnvelope;
      if (parsed?.error?.message) message = parsed.error.message;
    } catch {
      // keep fallback message
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<TResponse>;
}
