/**
 * Server Fetch Helper cho Server Components & API Routes
 * Tận dụng khả năng Caching / Revalidation của Next.js (ISR, SSR, SSG)
 */

const getServerApiBaseUrl = () => {
  const envUrl = process.env.STOREFRONT_INTERNAL_API_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const API_BASE_URL = getServerApiBaseUrl();

export interface ServerFetchOptions extends RequestInit {
  revalidate?: number | false; // Revalidate time in seconds
  tags?: string[];             // Cache tags for On-Demand Revalidation (revalidateTag)
}

export async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { revalidate = 60, tags, headers, ...restOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      next: {
        revalidate,
        tags,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error: errorData.message || `API error (${res.status}): ${res.statusText}`,
        status: res.status,
      };
    }

    const data: T = await res.json();
    return { data, status: res.status };
  } catch (err: any) {
    console.error(`[ServerFetch Error] ${endpoint}:`, err);
    return {
      error: err.message || 'Lỗi kết nối máy chủ.',
      status: 500,
    };
  }
}
