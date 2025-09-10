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
    <div className="min-h-screen w-full bg-ocean-gradient flex items-center justify-center p-4 md:p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-3xl shadow-2xl auth-form-mobile md:p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🦭</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
            {mode === 'login' ? 'Welcome back to SealEdu!' : 'Join SealEdu'}
          </h1>
          <p className="text-sm text-seablue-600 dark:text-gray-400 mt-2">
            {mode === 'login' ? 'Sign in to continue learning with your seal friend!' : 'Start your learning journey with us!'}
          </p>
        </div>

        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border-2 border-seablue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" placeholder="Your name" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border-2 border-seablue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" placeholder="you@example.com" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border-2 border-seablue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" placeholder="••••••••" required />
        </div>

        {error && <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 p-3 rounded-lg">{error}</div>}

        <div className="mb-6">
          <button disabled={loading} className="w-full bg-seablue-gradient text-white rounded-xl px-4 py-3 font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none">
            {loading ? 'Please wait...' : (mode === 'login' ? '🦭 Login' : '🦭 Register')}
          </button>
        </div>

        <div className="text-center">
          <button type="button" onClick={()=>setMode(mode === 'login' ? 'register' : 'login')} className="text-seablue-600 hover:text-seablue-700 text-sm font-medium">
            {mode === 'login' ? 'New to SealEdu? Create account' : 'Already have an account? Login'}
          </button>
        </div>

        {mode === 'login' && (
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-seablue-500 hover:text-seablue-600 text-sm">Forgot password?</Link>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center bg-seablue-50 p-3 rounded-lg">
          🌊 Tip: Use your school email for faster account recovery and better learning recommendations!
        </div>
      </form>
    </div>
  );
};

export default AuthForm; 