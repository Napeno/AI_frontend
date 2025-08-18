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
      const res = await fetch('/api/auth/forgot-password', {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-gray-900">Forgot password</h1>
        <p className="text-sm text-gray-600 mt-1">Enter your email to receive the reset link.</p>
        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <button disabled={loading} className="mt-5 w-full bg-indigo-600 text-white rounded-lg px-3 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60">Send reset link</button>
        {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
        {token && (
          <div className="mt-3 text-xs text-gray-500">
            Demo token (for local testing):
            <div className="mt-1 p-2 bg-gray-100 rounded break-all">{token}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordPage; 