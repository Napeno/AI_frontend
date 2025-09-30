import React, { useState } from 'react';
import t from '../../locales/i18n';
import { ALL_AVAILABLE_SUBJECTS, getSubjectArea } from '../../utils/subjectMapping';

const NewChatModal = ({ isOpen, onClose, onStartChat }) => {
  const [educationLevel, setEducationLevel] = useState('middle');
  const [subject, setSubject] = useState('mathematics'); // Chọn trực tiếp môn học

  if (!isOpen) return null;

  const handleStart = () => {
    // Tự động xác định lĩnh vực từ môn học được chọn
    const subjectArea = getSubjectArea(subject);
    onStartChat({ 
      educationLevel, 
      subjectArea,
      course: subject 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('newChatModal.title')}</h2>
        <p className="text-gray-600 mb-6">{t('newChatModal.description')}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('sidebar.educationLevel')}</label>
            <select 
              value={educationLevel} 
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="elementary">{t('levels.elementary')}</option>
              <option value="middle">{t('levels.middle')}</option>
              <option value="high">{t('levels.high')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {ALL_AVAILABLE_SUBJECTS.map(subjectId => (
                <option key={subjectId} value={subjectId}>
                  {t(`courses.${subjectId === 'foreign_language' ? 'foreignLanguage' : subjectId}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 font-medium hover:bg-gray-300"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleStart}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700"
          >
            {t('newChatModal.start')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal; 