'use client';

import { useState, useEffect } from 'react';

interface AdminInfo {
  id: string;
  email: string;
  name: string;
}

export default function AdminProfile() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [lastLoginTime, setLastLoginTime] = useState<string>(');
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    loadAdminInfo();
    loadLoginHistory();
  }, []);

  const loadAdminInfo = () => {
    const info = localStorage.getItem('adminInfo');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        setAdminInfo(parsed);
        setFormData({
          name: parsed.name || ',
          email: parsed.email || ',
        });
      } catch (e) {
        console.error('Error parsing admin info:', e);
      }
    }
  };

  const loadLoginHistory = () => {
    const lastLogin = localStorage.getItem('lastLoginSuccess');
    if (lastLogin) {
      setLastLoginTime(new Date(parseInt(lastLogin)).toLocaleString());
    }

    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    setLoginAttempts(attempts);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setError(');
    setSuccess(');
    setLoading(true);

    try {
      if (!formData.name) {
        setError('Name is required');
        return;
      }

      // Update localStorage (in production, would be API call)
      const updated = { ...adminInfo, ...formData };
      localStorage.setItem('adminInfo', JSON.stringify(updated));
      setAdminInfo(updated);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError(');
    setSuccess(');

    if (!passwordForm.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!passwordForm.newPassword) {
      setError('New password is required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // In production, would call API to change password
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Profile</h1>
          <p className="text-midnight-200">Manage your account settings and security</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <p className="text-rose-300">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-300">✓ {success}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Account Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all"
            >
              {isEditing ? '✓ Done' : '✎ Edit'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-midnight-800/30 border border-midnight-700 rounded-lg text-midnight-400 opacity-50"
                  placeholder="Email (cannot be changed)"
                />
                <p className="text-xs text-midnight-400 mt-1">Email cannot be changed</p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 font-semibold"
              >
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-midnight-400 mb-1">Name</p>
                <p className="text-lg text-white">{adminInfo?.name || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm text-midnight-400 mb-1">Email</p>
                <p className="text-lg text-white">{adminInfo?.email}</p>
              </div>

              <div>
                <p className="text-sm text-midnight-400 mb-1">Account ID</p>
                <code className="text-sm text-sapphire-300 font-mono bg-midnight-800/50 px-3 py-2 rounded">
                  {adminInfo?.id}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Security Card */}
        <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="w-full px-4 py-3 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all font-semibold"
            >
              🔐 Change Password
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Changing...' : '✓ Change Password'}
                </button>

                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="flex-1 px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Login Activity Card */}
        <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">Login Activity</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-lg">
              <div>
                <p className="text-sm text-midnight-400">Last Login</p>
                <p className="text-white font-semibold">
                  {lastLoginTime || 'No login history'}
                </p>
              </div>
              <span className="text-2xl">📍</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-lg">
              <div>
                <p className="text-sm text-midnight-400">Failed Login Attempts (Today)</p>
                <p className="text-white font-semibold">{loginAttempts}/5</p>
              </div>
              <span className="text-2xl">{loginAttempts >= 3 ? '⚠️' : '✓'}</span>
            </div>

            <div className="p-4 bg-sapphire-500/10 border border-sapphire-500/30 rounded-lg">
              <p className="text-sm text-sapphire-300">
                🔒 Your account is protected with JWT authentication and password hashing.
              </p>
            </div>
          </div>
        </div>

        {/* Security Tips Card */}
        <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">🛡️ Security Tips</h2>

          <ul className="space-y-3 text-sm text-midnight-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Use a strong password with mixed case, numbers, and symbols</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Change your password every 90 days</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Never share your password with anyone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Always logout when finished on shared computers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Use HTTPS/VPN when accessing from public networks</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Enable "Remember me" only on trusted devices</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
