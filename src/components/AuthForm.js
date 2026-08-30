import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { post } from '../utils/apiClient';
import t from '../locales/i18n';
import { useTheme } from '../context/ThemeContext';

const AuthForm = ({ initialMode = 'login' }) => {
  const { login } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);



  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await post(`/auth/${mode === 'login' ? 'login' : 'register'}`, 
        mode === 'login' ? { username, password } : { name, username, password }
      );
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(mode === 'login' ? 'Tên đăng nhập hoặc mật khẩu không đúng' : (data.error || 'Auth failed'));
        }
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
    <div className="squirrel-hero min-h-screen w-full flex items-center justify-center px-4 py-6 sm:p-6 safari-transform-fix">
      <form onSubmit={onSubmit} className="squirrel-card relative w-full max-w-md backdrop-blur rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
        <button type="button" onClick={() => changeTheme(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Chuyển light mode' : 'Chuyển dark mode'} className="absolute right-4 top-4 rounded-xl bg-seablue-50 px-2 py-1 text-base text-seablue-700 hover:bg-seablue-100 dark:bg-orange-950 dark:text-seablue-200">
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="text-center mb-6 sm:mb-8">
          <img src="/avatar.png" alt="Sóc ThinkBridge" className="squirrel-mascot-ring mx-auto mb-3 h-12 w-12 rounded-full object-contain shadow-lg sm:h-16 sm:w-16" />
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
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              className="w-full border-2 border-seablue-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-seablue-400 focus:border-seablue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors" 
              placeholder="••••••••" 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 rounded-lg flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

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
