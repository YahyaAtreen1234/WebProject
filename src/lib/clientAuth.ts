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
    return;
  }

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
  console.log('Admin auth stored:', { email: adminData.email, name: adminData.name });
}

export function getStoredAdminInfo(): StoredAdminInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const info = localStorage.getItem('adminInfo');
  if (!info) {
    return null;
  }

  try {
    return JSON.parse(info) as StoredAdminInfo;
  } catch {
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
  const info = getStoredAdminInfo();
  if (!info) return 'My Account';
  return info.email || info.name || 'My Account';
}
