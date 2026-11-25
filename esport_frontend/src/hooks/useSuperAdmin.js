import { useState, useEffect } from 'react';
import { apiFetch, getCurrentUser, isSuperAdminUser, notifyUserUpdated } from '../utils/api';

/**
 * Returns reactive Super Admin status, staying synced with auth events
 * and verifying with /api/me if localStorage lacks an explicit flag.
 */
export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => isSuperAdminUser());

  useEffect(() => {
    const syncFromStorage = () => {
      setIsSuperAdmin(isSuperAdminUser());
    };

    window.addEventListener('auth-user-updated', syncFromStorage);
    window.addEventListener('storage', syncFromStorage);

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.is_super_admin === undefined) {
      apiFetch('/api/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && (data.role || data.is_super_admin !== undefined)) {
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...savedUser, ...data }));
            setIsSuperAdmin(isSuperAdminUser());
            notifyUserUpdated();
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('auth-user-updated', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  return isSuperAdmin;
}
