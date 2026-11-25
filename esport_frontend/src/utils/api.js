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

export const getCurrentUser = () => {
  let userObj = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) userObj = JSON.parse(userStr);
  } catch (e) {}

  let sessionUser = null;
  try {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.user) sessionUser = session.user;
    }
  } catch (e) {}

  if (!sessionUser) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const val = JSON.parse(localStorage.getItem(key));
          if (val?.user) {
            sessionUser = val.user;
            break;
          }
        }
      }
    } catch (e) {}
  }

  if (userObj && sessionUser) {
    return {
      ...sessionUser,
      ...userObj,
      user_metadata: {
        ...(sessionUser.user_metadata || {}),
        ...(userObj.user_metadata || {})
      }
    };
  }
  return userObj || sessionUser || null;
};

export const notifyUserUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-user-updated'));
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user) return '';
  return user.role || user.user_metadata?.role || '';
};

export const isSuperAdminUser = () => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.is_super_admin === true || user.is_super_admin === 'true') return true;
  const role = (user.role || user.user_metadata?.role || '').toLowerCase().trim();
  if (
    role === 'super admin' ||
    role === 'superadmin' ||
    role === 'super administrator' ||
    role === 'super_admin'
  ) {
    return true;
  }
  const username = (
    user.username ||
    user.user_metadata?.username ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('username') : '') ||
    ''
  ).toLowerCase().trim();
  const email = (user.email || '').toLowerCase().trim();
  if (username === 'admin' || email === 'admin@esport.ph') return true;
  return false;
};

export const isTournamentAdminUser = () => {
  const user = getCurrentUser();
  if (!user) return false;
  if (isSuperAdminUser()) return true;
  const role = (user.role || user.user_metadata?.role || '').toLowerCase().trim();
  // Tournament mod and observer explicitly do not have admin access
  if (role.includes('mod') || role.includes('observer')) {
    return false;
  }
  // Tournament Admin, Super Admin, Standard Admin, or general admin
  if (role.includes('admin')) {
    return true;
  }
  return false;
};

export const getUserPermissions = () => {
  const user = getCurrentUser();
  if (!user) return { view: false, edit: false, full: false, manage_folders: false };
  if (isSuperAdminUser()) {
    return { view: true, edit: true, full: true, manage_folders: true };
  }
  const p = user.permissions || {};
  const isFull = Boolean(p.full);
  return {
    view: isFull || Boolean(p.view),
    edit: isFull || Boolean(p.edit),
    full: isFull,
    manage_folders: isFull || Boolean(p.manage_folders),
  };
};

export const canUserEdit = () => {
  return getUserPermissions().edit;
};

export const canUserManageFolders = () => {
  return getUserPermissions().manage_folders;
};

export const canUserFullAccess = () => {
  return getUserPermissions().full;
};

export const canUserView = () => {
  return getUserPermissions().view;
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
    let session = null;
    try {
      const sessionStr = localStorage.getItem('supabase.auth.token');
      session = sessionStr ? JSON.parse(sessionStr) : null;
    } catch (e) {}

    const refreshToken = session?.refresh_token;

    // Never abruptly wipe session or redirect on a single failed read
    if (!refreshToken) {
      console.warn(`[apiFetch] 401 received for ${endpoint}. Session kept active.`);
      return response;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(newToken => {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }).catch(err => {
        console.warn(`[apiFetch] Queued request retry failed for ${endpoint}:`, err);
        return response;
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_URL}/api/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data?.session?.access_token) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
          localStorage.setItem('token', data.session.access_token);
          processQueue(null, data.session.access_token);
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
          return await fetch(url, { ...options, headers });
        }
      }
      processQueue(new Error('Refresh token failed'), null);
      console.warn(`[apiFetch] Refresh attempt failed for ${endpoint}. Session kept active.`);
      return response;
    } catch (err) {
      processQueue(err, null);
      console.warn(`[apiFetch] Refresh network error for ${endpoint}:`, err);
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

export const resolveLogoUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    if (trimmed.includes('localhost:5000')) {
      const path = trimmed.split('localhost:5000')[1];
      return API_URL ? `${API_URL}${path}` : path;
    }
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return API_URL ? `${API_URL}${trimmed}` : trimmed;
  }
  return trimmed;
};
