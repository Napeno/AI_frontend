import React, { useState } from 'react';
import t from '../../locales/i18n';

const Welcome = ({ onStart }) => {
  const [educationLevel, setEducationLevel] = useState('middle');
  const [subjectArea, setSubjectArea] = useState('natural_sciences');
  const [course, setCourse] = useState('');

  // Define available courses for each subject area
  const availableCourses = {
    'natural_sciences': ['mathematics', 'physics', 'chemistry', 'biology'],
    'social_sciences': ['history', 'geography', 'civics', 'literature', 'foreign_language'],
    'mathematics': ['mathematics'],
    'english_language': ['english_language']
  };

  // Reset course when subject area changes
  React.useEffect(() => {
    const courses = availableCourses[subjectArea] || [];
    setCourse(courses.length === 1 ? courses[0] : '');
  }, [subjectArea]);

  const handleStart = () => {
    onStart({ educationLevel, subjectArea, course: course || null });
  };

  return (
    <div className="text-center text-gray-600 dark:text-gray-400 flex flex-col items-center justify-center h-full relative">
      {/* Background overlay for better text visibility */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg"></div>
      
      {/* Content with higher z-index */}
      <div className="relative z-10 p-8">
        <div className="mb-6">
          <img src="/image/seal-new-chat.png" alt="seal" className="w-40 h-54 flex items-center justify-center mx-auto mb-4 animate-float" />
        </div>
        <p className="text-lg mb-2 font-bold text-gray-900 dark:text-gray-200">{t('newChatModal.title')}</p>
        <p className="text-base mb-4 text-gray-700 dark:text-gray-300">{t('newChatModal.description')}</p>
        
        <div className="w-full max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebar.educationLevel')}</label>
          <select 
            value={educationLevel} 
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="elementary">{t('levels.elementary')}</option>
            <option value="middle">{t('levels.middle')}</option>
            <option value="high">{t('levels.high')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebar.subjectArea')}</label>
          <select 
            value={subjectArea} 
            onChange={(e) => setSubjectArea(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="natural_sciences">{t('subjects.naturalSciences')}</option>
            <option value="social_sciences">{t('subjects.socialSciences')}</option>
          </select>
        </div>
        
        {/* Course selection - only show if subject area has multiple courses */}
        {availableCourses[subjectArea] && availableCourses[subjectArea].length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {subjectArea === 'natural_sciences' ? 'Môn học Khoa học Tự nhiên' : 'Môn học Khoa học Xã hội'}
            </label>
            <select 
              value={course} 
              onChange={(e) => setCourse(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="">-- Chọn môn học cụ thể --</option>
              {availableCourses[subjectArea].map(courseId => (
                <option key={courseId} value={courseId}>
                  {t(`courses.${courseId === 'foreign_language' ? 'foreignLanguage' : courseId}`)}
                </option>
              ))}
            </select>
          </div>
        )}
        </div>

        <div className="mt-6">
          <button 
            onClick={handleStart}
            className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-700"
          >
            {t('newChatModal.start')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 