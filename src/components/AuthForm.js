import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AuthForm = ({ initialMode = 'login' }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auth failed');
      }
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 backdrop-blur rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-200">
          {mode === 'login' ? 'Welcome back' : 'Create your student account'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {mode === 'login' ? 'Sign in to continue learning.' : 'It’s free and only takes a minute.'}
        </p>

        {mode === 'register' && (
          <div className="mt-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="Your name" />
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="you@example.com" required />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="••••••••" required />
        </div>

        {error && <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

        <div className="mt-5 flex items-center gap-3">
          <button disabled={loading} className="flex-1 bg-indigo-600 text-white rounded-lg px-3 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60">
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
          </button>
          <button type="button" onClick={()=>setMode(mode === 'login' ? 'register' : 'login')} className="flex-1 bg-white text-indigo-700 border border-indigo-200 rounded-lg px-3 py-2 font-medium hover:bg-indigo-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            {mode === 'login' ? 'Create account' : 'Have an account? Login'}
          </button>
        </div>

        {mode === 'login' && (
          <div className="mt-3 text-right text-sm">
            <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400">Forgot password?</Link>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Tip: Use your school email for faster account recovery.
        </div>
      </form>
    </div>
  );
};

export default AuthForm; 