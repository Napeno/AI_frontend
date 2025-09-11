import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import t from '../locales/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HomePage = () => {
  const { token } = useAuth();
  return (
    <div className="min-h-screen w-full bg-ocean-gradient flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-5xl w-full bg-white/90 dark:bg-gray-800/80 backdrop-blur rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
        {/* Top-right language switcher */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center">
          {/* Seal mascot placeholder - you can replace this with actual GIF later */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-6 sm:mb-8 bg-seablue-gradient rounded-full shadow-xl animate-float flex items-center justify-center">
            <img src="/image/homepage.png" alt="seal" className=" bg-seablue-500 rounded-full flex items-center justify-center text-5xl md:text-6xl" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 sm:mb-4" dangerouslySetInnerHTML={{ __html: `${t('home.title')}` }} />
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">{t('home.subtitle')}</p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-2">{t('home.description')}</p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {!token && (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-4 rounded-xl bg-seablue-gradient text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seablue-400 text-center"
                >
                  {t('home.login')}
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-4 rounded-xl bg-white dark:bg-gray-900 text-seablue-700 dark:text-seablue-300 border-2 border-seablue-200 dark:border-gray-700 font-semibold shadow-lg hover:shadow-xl hover:bg-seablue-50 dark:hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seablue-300 text-center"
                >
                  {t('home.register')}
                </Link>
              </>
            )}
            {token && (
              <Link
                to="/chat"
                className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-4 rounded-xl bg-seablue-gradient text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seablue-400 flex items-center justify-center gap-2"
              >
                {t('home.start')}
              </Link>
            )}
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