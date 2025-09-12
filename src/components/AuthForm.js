import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import t from '../locales/i18n';

const AuthForm = ({ initialMode = 'login' }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
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
        body: JSON.stringify(mode === 'login' ? { username, password } : { name, username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auth failed');
      }
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-ocean-gradient flex items-center justify-center px-4 py-6 sm:p-6 safari-transform-fix">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-200">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.join')}
          </h1>
          <p className="text-xs sm:text-sm text-seablue-600 dark:text-gray-400 mt-2">
            {mode === 'login' ? t('auth.signInContinue') : t('auth.startJourney')}
          </p>
        </div>

        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">{t('auth.name')}</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border-2 border-seablue-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" placeholder={t('auth.yourName')} />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">{t('auth.username')}</label>
          <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full border-2 border-seablue-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" placeholder="your_username" required />
        </div>

        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">{t('auth.password')}</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border-2 border-seablue-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" placeholder="••••••••" required />
        </div>

        {error && <div className="mb-4 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}

        <div className="mb-6">
          <button disabled={loading} className="w-full bg-seablue-gradient text-white rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none flex items-center justify-center">
            {loading ? t('auth.pleaseWait') : (mode === 'login' ? t('auth.login') : t('auth.register'))}
          </button>
        </div>

        <div className="text-center">
          <button type="button" onClick={()=>setMode(mode === 'login' ? 'register' : 'login')} className="text-seablue-600 hover:text-seablue-700 text-xs sm:text-sm font-medium">
            {mode === 'login' ? t('auth.newToSealEdu') : t('auth.alreadyHaveAccount')}
          </button>
        </div>


        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center bg-seablue-50 dark:bg-gray-700/50 p-3 rounded-lg">
          {t('auth.tip')}
        </div>
      </form>
    </div>
  );
};

export default AuthForm; 