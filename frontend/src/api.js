const BASE_URL = 'http://localhost:4000';

async function request(path, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = { 
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
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' })
};
