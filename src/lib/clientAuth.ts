/**
 * "Remember me" support.
 *
 * Tokens always live in localStorage because every consumer in the app reads
 * them from there. To make an unticked "Remember me" actually expire, the login
 * is flagged ephemeral and a marker is dropped in sessionStorage — which the
 * browser discards when it closes but keeps across refreshes and navigation.
 * On the next launch the marker is gone, so the flagged token is pruned.
 *
 * Logins that never set the flag (the older login pages) stay persistent.
 */
const EPHEMERAL_KEY = 'authEphemeral';
const SESSION_MARKER = 'authSessionActive';

export function setAuthPersistence(remember: boolean) {
  if (typeof window === 'undefined') return;

  try {
    if (remember) {
      localStorage.removeItem(EPHEMERAL_KEY);
    } else {
      localStorage.setItem(EPHEMERAL_KEY, '1');
    }
    sessionStorage.setItem(SESSION_MARKER, '1');
  } catch (error) {
    console.error('[clientAuth] Failed to record auth persistence:', error);
  }
}

/**
 * Drops an ephemeral login left over from a previous browser session, then
 * marks the current session. Safe to call on every page load.
 */
export function pruneEphemeralAuth() {
  if (typeof window === 'undefined') return;

  try {
    const isEphemeral = localStorage.getItem(EPHEMERAL_KEY) === '1';
    const sameSession = sessionStorage.getItem(SESSION_MARKER) === '1';

    if (isEphemeral && !sameSession) {
      ['userToken', 'userInfo', 'adminToken', 'adminInfo'].forEach((key) =>
        localStorage.removeItem(key)
      );
      localStorage.removeItem(EPHEMERAL_KEY);
    }

    sessionStorage.setItem(SESSION_MARKER, '1');
  } catch (error) {
    console.error('[clientAuth] Failed to prune ephemeral auth:', error);
  }
}

/**
 * The customer JWT. Login writes it as "userToken"; several components used to
 * read a "user_token" key that is never written, so every authenticated
 * feature they gated (compare, wishlist, custom orders, support tickets)
 * behaved as if the visitor were signed out.
 */
export function getStoredUserToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('userToken');
  return token?.trim() ? token.trim() : null;
}

/** Fired after the compare list changes so the header badge can refresh. */
export const COMPARE_CHANGED_EVENT = 'compareChanged';

export function notifyCompareChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COMPARE_CHANGED_EVENT));
}

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

    // Dispatch custom event to notify other components (same-tab updates)
    try {
      const event = new CustomEvent('adminAuthChanged', { detail: adminData });
      window.dispatchEvent(event);
      console.log('[clientAuth] Dispatched adminAuthChanged event');
    } catch (error) {
      console.error('[clientAuth] Failed to dispatch event:', error);
    }
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
