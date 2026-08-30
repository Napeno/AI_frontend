import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import t from '../locales/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HomePage = () => {
  const { token } = useAuth();
  return (
    <div className="squirrel-home squirrel-hero min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-5xl w-full squirrel-card backdrop-blur rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
        {/* Top-right language switcher */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center">
          {/* Squirrel mascot placeholder - you can replace this with actual GIF later */}
          <div className="squirrel-mascot-ring w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-6 sm:mb-8 rounded-full shadow-xl animate-float flex items-center justify-center">
            <img src="/avatar.png" alt="Sóc ThinkBridge" className="h-[88%] w-[88%] object-contain" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-seablue-900 dark:text-white tracking-tight mb-3 sm:mb-4" dangerouslySetInnerHTML={{ __html: `${t('home.title')}` }} />
          <p className="text-lg sm:text-xl text-seablue-700 dark:text-gray-300 mb-3 sm:mb-4">{t('home.subtitle')}</p>
          <p className="text-sm sm:text-base text-seablue-700/90 dark:text-gray-300 max-w-4xl mx-auto px-2">{t('home.description')}</p>

          <div className={`mt-6 sm:mt-8 grid grid-cols-1 ${token ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} items-stretch gap-3 sm:gap-4`}>
            {!token && (
              <>
                <Link
                  to="/login"
                  className="flex h-16 w-full items-center justify-center rounded-xl bg-seablue-500 px-6 text-center font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-seablue-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-seablue-300 sm:px-7"
                >
                  {t('home.login')}
                </Link>
                <Link
                  to="/register"
                  className="flex h-16 w-full items-center justify-center rounded-xl bg-seablue-600 px-6 text-center font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-seablue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-seablue-300 sm:px-7"
                >
                  {t('home.register')}
                </Link>
              </>
            )}
            {token && (
              <Link
                to="/chat"
                className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-seablue-500 px-6 text-center font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-seablue-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-seablue-300 sm:px-7"
              >
                {t('home.start')}
              </Link>
            )}
            <Link to="/game" className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-seablue-500 text-lg font-bold text-white shadow-[0_8px_15px_rgba(25,79,64,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-seablue-600 hover:shadow-[0_12px_20px_rgba(25,79,64,0.3)]">
              <span>📝</span> Làm khảo sát
            </Link>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-8">
          <div className="text-center sm:text-left p-2 sm:p-4 bg-seablue-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">{t('home.steps.step1Title')}</h3>
            <p className="text-xs sm:text-lg font-semibold text-seablue-600 dark:text-seablue-300 mb-1">{t('home.steps.step1Desc')}</p>
            <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">{t('home.steps.step1Text')}</p>
          </div>
          <div className="text-center sm:text-left p-2 sm:p-4 bg-seablue-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">{t('home.steps.step2Title')}</h3>
            <p className="text-xs sm:text-lg font-semibold text-seablue-600 dark:text-seablue-300 mb-1">{t('home.steps.step2Desc')}</p>
            <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">{t('home.steps.step2Text')}</p>
          </div>
          <div className="text-center sm:text-left p-2 sm:p-4 bg-seablue-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">{t('home.steps.step3Title')}</h3>
            <p className="text-xs sm:text-lg font-semibold text-seablue-600 dark:text-seablue-300 mb-1">{t('home.steps.step3Desc')}</p>
            <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">{t('home.steps.step3Text')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 sm:mt-12 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
          <p>{t('home.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 
