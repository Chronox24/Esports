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

export const getUserAccount = () => {
  try {
    const directIgn = localStorage.getItem('user_ign') || localStorage.getItem('username');
    if (directIgn) return directIgn;
  } catch (e) {}
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u?.user_metadata?.username) return u.user_metadata.username;
      if (u?.user_metadata?.ign) return u.user_metadata.ign;
      if (u?.email) return u.email.split('@')[0];
    }
  } catch (e) {}
  try {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.user?.user_metadata?.username) return session.user.user_metadata.username;
      if (session?.user?.user_metadata?.ign) return session.user.user_metadata.ign;
      if (session?.user?.email) return session.user.email.split('@')[0];
    }
  } catch (e) {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const val = JSON.parse(localStorage.getItem(key));
        if (val?.user?.user_metadata?.username) return val.user.user_metadata.username;
        if (val?.user?.user_metadata?.ign) return val.user.user_metadata.ign;
        if (val?.user?.email) return val.user.email.split('@')[0];
      }
    }
  } catch (e) {}
  return null;
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const account = getUserAccount();
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
  if (account) {
    headers['X-User-Account'] = account;
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
