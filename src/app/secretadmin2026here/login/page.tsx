'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/secretadmin2026here');
    } else {
      setError('Invalid admin authentication key.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 text-center">System Portal</h2>
        <p className="text-xs text-slate-400 text-center mt-1">Protected Admin Gateway</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Secret Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter postgres/admin key..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}