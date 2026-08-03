/**
 * Server Fetch Helper cho Server Components & API Routes
 * Tận dụng khả năng Caching / Revalidation của Next.js (ISR, SSR, SSG)
 */

export interface ServerFetchOptions extends RequestInit {
  revalidate?: number | false; // Revalidate time in seconds
  tags?: string[];             // Cache tags for On-Demand Revalidation (revalidateTag)
}

export async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { revalidate = 60, tags, headers, ...restOptions } = options;

  let baseUrl: string;
  if (typeof window !== 'undefined') {
    // Phía Client (Browser): Dùng relative path /api để đi qua Next.js proxy rewrite (giấu URL backend)
    const clientEnv = process.env.NEXT_PUBLIC_STOREFRONT_API_URL || process.env.NEXT_PUBLIC_API_URL;
    baseUrl = (clientEnv && clientEnv.startsWith('/')) ? clientEnv : '/api';
  } else {
    // Phía Server (Node.js SSR/ISR): Dùng backend URL nội bộ
    const serverEnv = process.env.STOREFRONT_INTERNAL_API_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    baseUrl = (serverEnv && serverEnv.startsWith('http')) ? serverEnv : 'http://localhost:9090/api';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

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
