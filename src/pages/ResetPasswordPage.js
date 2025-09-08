import React, { useState } from 'react';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('Password reset successfully. You can now log in.');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-gray-900">Reset password</h1>
        <p className="text-sm text-gray-600 mt-1">Paste the token from your email and set a new password.</p>

        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">Reset token</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={token} onChange={(e)=>setToken(e.target.value)} placeholder="paste your token" required />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">New password</label>
          <input type="password" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        <button disabled={loading} className="mt-5 w-full bg-indigo-600 text-white rounded-lg px-3 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60">Reset password</button>
        {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
      </form>
    </div>
  );
};

export default ResetPasswordPage; 