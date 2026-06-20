'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

const AVAILABLE_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access, manage users, settings, all features',
    permissions: ['all'],
    color: 'bg-rose-600',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage orders, deliveries, tracking, reports, staff accounts',
    permissions: ['orders', 'deliveries', 'tracking', 'reports', 'users_read'],
    color: 'bg-sapphire-600',
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'View and manage orders, deliveries, and tracking',
    permissions: ['orders', 'deliveries', 'tracking'],
    color: 'bg-amethyst-600',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'View-only access to orders and reports',
    permissions: ['orders_read', 'reports_read'],
    color: 'bg-emerald-600',
  },
];

const ALL_PERMISSIONS = [
  { id: 'orders', label: '📦 Manage Orders', description: 'Create, edit, delete orders' },
  { id: 'orders_read', label: '📦 View Orders', description: 'View orders only' },
  { id: 'deliveries', label: '🚚 Manage Deliveries', description: 'Create, update shipments' },
  { id: 'tracking', label: '📍 Update Tracking', description: 'Update tracking status' },
  { id: 'reports', label: '📊 Generate Reports', description: 'Create and view reports' },
  { id: 'reports_read', label: '📊 View Reports', description: 'View reports only' },
  { id: 'users_read', label: '👥 View Users', description: 'View user list' },
  { id: 'users_manage', label: '👥 Manage Users', description: 'Create, edit, delete users' },
  { id: 'settings', label: '⚙️ System Settings', description: 'Modify system settings' },
  { id: 'billing', label: '💳 Billing', description: 'Manage billing and invoices' },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@stonesland.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: '2026-01-01',
      lastLogin: '2026-06-14',
      permissions: ['all'],
    },
    {
      id: '2',
      email: 'manager@stonesland.com',
      name: 'Store Manager',
      role: 'manager',
      status: 'active',
      createdAt: '2026-02-01',
      lastLogin: '2026-06-13',
      permissions: ['orders', 'deliveries', 'tracking', 'reports', 'users_read'],
    },
  ]);

  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'viewer' as const,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const getRoleDetails = (roleId: string) => {
    return AVAILABLE_ROLES.find(r => r.id === roleId);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.name) return;

    const role = getRoleDetails(newUser.role);
    const user: User = {
      id: Math.random().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      permissions: role?.permissions || [],
    };

    setUsers([...users, user]);
    setNewUser({ email: '', name: '', role: 'viewer' });
    setShowNewUser(false);
  };

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    const role = getRoleDetails(newRole);
    setUsers(
      users.map(u =>
        u.id === userId
          ? { ...u, role: newRole as any, permissions: role?.permissions || [] }
          : u
      )
    );
  };

  const handleUpdateUserStatus = (userId: string, newStatus: string) => {
    setUsers(
      users.map(u =>
        u.id === userId ? { ...u, status: newStatus as any } : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(
    u =>
      (filterRole === 'all' || u.role === filterRole) &&
      (u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-midnight-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
            <p className="text-midnight-200">Manage user accounts and assign permissions</p>
          </div>
          <button
            onClick={() => setShowNewUser(true)}
            className="px-6 py-3 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 font-semibold transition-all"
          >
            ➕ Add New User
          </button>
        </div>

        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {AVAILABLE_ROLES.map(role => (
            <div
              key={role.id}
              className="card-glass backdrop-blur-md p-6 rounded-2xl border border-sapphire-500/20"
            >
              <div className={`${role.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white font-bold`}>
                {role.name[0]}
              </div>
              <h3 className="font-bold text-white mb-2">{role.name}</h3>
              <p className="text-sm text-midnight-300 mb-3">{role.description}</p>
              <p className="text-xs text-sapphire-300 font-semibold">
                {users.filter(u => u.role === role.id).length} user{users.filter(u => u.role === role.id).length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Users</h2>

              {/* Filters */}
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                >
                  <option value="all">All Roles</option>
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sapphire-500/20">
                      <th className="px-4 py-3 text-left text-sm font-bold text-white">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-white">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-white">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-white">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-midnight-700 hover:bg-midnight-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-4 py-3 text-white font-semibold">{user.name}</td>
                        <td className="px-4 py-3 text-midnight-300 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-sapphire-500/20 text-sapphire-300 rounded-full text-xs font-bold">
                            {getRoleDetails(user.role)?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : user.status === 'pending'
                                ? 'bg-orange-500/20 text-orange-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                            className="text-sapphire-300 hover:text-sapphire-200 font-semibold text-sm"
                          >
                            Edit →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-midnight-400">
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* User Details / New User Form */}
          <div>
            {showNewUser ? (
              <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
                <h3 className="text-xl font-bold text-white mb-6">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                      placeholder="john@stonesland.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                    >
                      {AVAILABLE_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 font-semibold transition-all"
                  >
                    ✓ Create User
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNewUser(false)}
                    className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 transition-all"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : selectedUser ? (
              <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
                <h3 className="text-xl font-bold text-white mb-6">User Details</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-midnight-400">Name</p>
                    <p className="text-lg text-white font-semibold">{selectedUser.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-midnight-400">Email</p>
                    <p className="text-lg text-white font-semibold">{selectedUser.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-midnight-400 mb-2">Role</p>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => handleUpdateUserRole(selectedUser.id, e.target.value)}
                      className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                    >
                      {AVAILABLE_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm text-midnight-400 mb-2">Status</p>
                    <select
                      value={selectedUser.status}
                      onChange={(e) => handleUpdateUserStatus(selectedUser.id, e.target.value)}
                      className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-sm text-midnight-400 mb-2">Permissions</p>
                    <div className="space-y-2">
                      {selectedUser.permissions.includes('all') ? (
                        <div className="px-3 py-2 bg-sapphire-500/20 text-sapphire-300 rounded-lg text-sm">
                          ✓ All Permissions
                        </div>
                      ) : (
                        selectedUser.permissions.map(perm => {
                          const permDetails = ALL_PERMISSIONS.find(p => p.id === perm);
                          return (
                            <div key={perm} className="px-3 py-2 bg-midnight-800/50 text-midnight-300 rounded-lg text-sm border border-sapphire-500/20">
                              ✓ {permDetails?.label || perm}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <p className="text-xs text-midnight-400">
                      Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                    {selectedUser.lastLogin && (
                      <p className="text-xs text-midnight-400">
                        Last Login: {new Date(selectedUser.lastLogin).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="w-full px-4 py-3 bg-rose-600/20 border border-rose-500/40 text-rose-300 rounded-lg hover:bg-rose-600/30 font-semibold transition-all mt-6"
                  >
                    🗑️ Delete User
                  </button>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20">
                <h3 className="text-xl font-bold text-white mb-6">Permissions Guide</h3>
                <div className="space-y-3">
                  {ALL_PERMISSIONS.map(perm => (
                    <div key={perm.id}>
                      <p className="font-semibold text-white text-sm">{perm.label}</p>
                      <p className="text-xs text-midnight-400">{perm.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
