const API_URL = import.meta.env.VITE_API_URL || '';
const getAuthToken = () => {
  try {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.access_token) return session.access_token;
    }
  } catch (e) {
    console.warn("Failed to parse supabase.auth.token from localStorage", e);
  }
  try {
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;
  } catch (e) {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const val = JSON.parse(localStorage.getItem(key));
        if (val?.access_token) return val.access_token;
      }
    }
  } catch (e) {}
  return null;
};
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let response = await fetch(url, {
    ...options,
    headers,
  });
  if (response.status === 401) {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    const refreshToken = session?.refresh_token;

    if (!refreshToken) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('token');
      window.location.href = '/';
      return response;
    }

    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(newToken => {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }).catch(err => {
        return response;
      });
    }

    isRefreshing = true;
    
    return new Promise(async (resolve, reject) => {
      try {
        const refreshRes = await fetch(`${API_URL}/api/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
          localStorage.setItem('token', data.session.access_token);
          
          processQueue(null, data.session.access_token);
          
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
          resolve(await fetch(url, { ...options, headers }));
        } else {
          processQueue(new Error('Refresh token failed'), null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('token');
          window.location.href = '/';
          resolve(response);
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('token');
        window.location.href = '/';
        resolve(response);
      } finally {
        isRefreshing = false;
      }
    });
  }
  return response;
};
