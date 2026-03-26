/**
 * Shared API Client
 * 
 * Standardized fetch wrapper for API interactions.
 */

interface RequestOptions extends RequestInit {
    params?: Record<string, unknown>;
}

export async function apiClient<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;

    let fullUrl = url;
    if (params) {
        const query = new URLSearchParams(
            Object.entries(params)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        ).toString();
        fullUrl = query ? `${url}?${query}` : url;
    }

    const response = await fetch(fullUrl, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API Request Failed');
    }

    return data as T;
}

export const api = {
    get: <T>(url: string, params?: Record<string, unknown>) => apiClient<T>(url, { method: 'GET', params }),
    post: <T>(url: string, body?: unknown) => apiClient<T>(url, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body?: unknown) => apiClient<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(url: string) => apiClient<T>(url, { method: 'DELETE' }),
};
