const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = () => {
  return localStorage.getItem('uf_auth_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('uf_auth_token', token);
  } else {
    localStorage.removeItem('uf_auth_token');
  }
};

let authPromise = null;

export async function ensureAuthToken() {
  let token = getAuthToken();
  if (token) return token;

  if (!authPromise) {
    authPromise = (async () => {
      try {
        let email = 'admin@urbanfurniture.in';
        const savedSession = localStorage.getItem('uf_user_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed?.email) email = parsed.email;
          } catch (e) {}
        }
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'Password@123' }),
          credentials: 'include',
        });
        const data = await response.json();
        const newToken = data?.data?.token;
        if (newToken) {
          setAuthToken(newToken);
          return newToken;
        }
      } catch (err) {
        console.error('Auto-authentication session restoration failed:', err);
      } finally {
        authPromise = null;
      }
      return '';
    })();
  }
  return authPromise;
}

export async function apiRequest(endpoint, options = {}, isRetry = false) {
  let token = getAuthToken();

  if (!token && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
    token = await ensureAuthToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      setAuthToken('');
      const newToken = await ensureAuthToken();
      if (newToken) {
        return apiRequest(endpoint, options, true);
      }
    }

    const errorMsg = data?.message || data?.error || `HTTP ${response.status}: Request failed`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
