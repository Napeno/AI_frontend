import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import t from '../locales/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HomePage = () => {
  const { token } = useAuth();
  return (
    <div className="min-h-screen w-full bg-ocean-gradient flex items-center justify-center homepage-container">
      <div className="relative max-w-5xl w-full bg-white/90 dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-2xl homepage-content p-4 sm:p-6 md:p-10">
        {/* Top-right language switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center">
          {/* Seal mascot placeholder - you can replace this with actual GIF later */}
          <div className="seal-container">
            <img src="/image/homepage.png" alt="seal" className=" bg-seablue-500 rounded-full flex items-center justify-center text-5xl md:text-6xl" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2" dangerouslySetInnerHTML={{ __html: `${t('home.title')}` }} />
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">{t('home.subtitle')}</p>
          <p className="text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">{t('home.description')}</p>

          <div className="mt-8 inline-flex items-center justify-center gap-4">
            {!token && (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 md:px-7 md:py-4 rounded-xl bg-seablue-gradient text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seablue-400"
                >
                  {t('home.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-7 py-3 md:px-8 md:py-4 rounded-xl bg-white dark:bg-gray-900 text-seablue-700 dark:text-seablue-300 border-2 border-seablue-200 dark:border-gray-700 font-semibold shadow-lg hover:shadow-xl hover:bg-seablue-50 dark:hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seablue-300"
                >
                  {t('home.register')}
                </Link>
              </>
            )}
            {token && (
              <Link
                to="/chat"
                className="px-7 py-3 md:px-8 md:py-4 rounded-xl bg-seablue-gradient text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seablue-400 flex items-center gap-2"
              >
                {t('home.start')}
              </Link>
            )}
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="step">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('home.steps.step1Title')}</h3>
            <p className="text-lg font-semibold text-seablue-600 dark:text-seablue-300">{t('home.steps.step1Desc')}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('home.steps.step1Text')}</p>
          </div>
          <div className="step">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('home.steps.step2Title')}</h3>
            <p className="text-lg font-semibold text-seablue-600 dark:text-seablue-300">{t('home.steps.step2Desc')}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('home.steps.step2Text')}</p>
          </div>
          <div className="step">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('home.steps.step3Title')}</h3>
            <p className="text-lg font-semibold text-seablue-600 dark:text-seablue-300">{t('home.steps.step3Desc')}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('home.steps.step3Text')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>{t('home.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 