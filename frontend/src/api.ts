// Use environment variable or fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    ...(options.headers || {}) 
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(BASE_URL + path, {
    headers,
    ...options
  });
  if (!res.ok) throw new Error('Request failed');
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: any) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' })
};
