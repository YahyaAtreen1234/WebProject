'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResponse('Testing...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@minerals.local',
          password: 'admin123',
        }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));
        setResponse(prev => prev + '\n\n✅ Token saved to localStorage');
      }
    } catch (error) {
      setResponse(String(error));
    } finally {
      setLoading(false);
    }
  };

  const checkStorage = () => {
    const token = localStorage.getItem('adminToken');
    const info = localStorage.getItem('adminInfo');
    setResponse(`
Token: ${token ? token.substring(0, 50) + '...' : 'NOT FOUND'}
Info: ${info ? info : 'NOT FOUND'}
    `);
  };

  const clearStorage = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setResponse('✅ Storage cleared');
  };

  return (
    <div className="min-h-screen bg-midnight-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔧 Debug Page</h1>

        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Testing...' : 'Test Login API'}
          </button>

          <button
            onClick={checkStorage}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Check localStorage
          </button>

          <button
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear localStorage
          </button>
        </div>

        <pre className="mt-8 p-4 bg-midnight-800 text-green-400 rounded overflow-auto max-h-96">
          {response}
        </pre>
      </div>
    </div>
  );
}
