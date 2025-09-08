import React, { useState } from 'react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    setToken('');
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('If an account exists, a reset email has been sent.');
      if (data.resetToken) setToken(data.resetToken); // demo only
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white dark:bg-gray-800 backdrop-blur rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-200">Forgot password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter your email to receive the reset link.</p>
        <div className="mt-4">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <button disabled={loading} className="mt-5 w-full bg-indigo-600 text-white rounded-lg px-3 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60">Send reset link</button>
        {status && <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">{status}</div>}
        {token && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Demo token (for local testing):
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded break-all">{token}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordPage; 