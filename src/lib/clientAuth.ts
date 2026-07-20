export interface StoredAdminInfo {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('adminToken');
  return token?.trim() ? token.trim() : null;
}

export function setStoredAdminAuth(token: string, account: StoredAdminInfo) {
  if (typeof window === 'undefined') {
    console.log('[clientAuth] Skipping setStoredAdminAuth - server-side context');
    return;
  }

  try {
    if (token) {
      localStorage.setItem('adminToken', token);
    }

    const adminData = {
      id: account.id || '',
      email: account.email || '',
      name: account.name || account.email || 'Admin',
      role: account.role || 'admin',
    };

    localStorage.setItem('adminInfo', JSON.stringify(adminData));
    localStorage.setItem('lastLoginSuccess', Date.now().toString());
    
    console.log('[clientAuth] Admin auth stored successfully:', {
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
    });
  } catch (error) {
    console.error('[clientAuth] Failed to store admin auth:', error);
  }
}

export function getStoredAdminInfo(): StoredAdminInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const info = localStorage.getItem('adminInfo');
    if (!info) {
      return null;
    }

    const parsed = JSON.parse(info) as StoredAdminInfo;
    return parsed;
  } catch (error) {
    console.error('[clientAuth] Failed to retrieve admin info:', error);
    return null;
  }
}

export function clearStoredAdminAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');
  localStorage.removeItem('lastLoginSuccess');
  localStorage.removeItem('loginAttempts');
}

export function getAdminDisplayLabel(): string {
  try {
    const info = getStoredAdminInfo();
    if (!info) {
      return 'My Account';
    }
    const label = info.email || info.name || 'My Account';
    console.log('[clientAuth] Admin display label:', label);
    return label;
  } catch (error) {
    console.error('[clientAuth] Error getting display label:', error);
    return 'My Account';
  }
}
