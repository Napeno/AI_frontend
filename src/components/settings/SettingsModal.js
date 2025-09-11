import React, { useRef } from 'react';
import t from '../../locales/i18n';
import SettingsSidebar from './SettingsSidebar';
import GeneralSettings from './GeneralSettings';
import AccountSettings from './AccountSettings';

const SettingsModal = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const modalRef = useRef();

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'account':
        return <AccountSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[92vw] sm:w-full sm:max-w-2xl md:max-w-4xl h-[85vh] sm:h-[70vh] flex flex-col md:flex-row relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto dark:bg-gray-800">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 