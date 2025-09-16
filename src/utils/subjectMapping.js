// Mapping từ môn học cụ thể sang lĩnh vực khoa học
// Dựa trên cấu trúc từ backend prompts và frontend availableCourses

export const SUBJECT_TO_AREA_MAPPING = {
  // Natural Sciences
  'mathematics': 'natural_sciences',
  'natural_sciences': 'natural_sciences',

  // Social Sciences
  'history': 'social_sciences',
  'geography': 'social_sciences',
  'civics': 'social_sciences',
  'literature': 'social_sciences',
  'foreign_language': 'social_sciences',

  // Standalone subjects
  'english_language': 'english_language'
};

// Tất cả các môn học có thể chọn (thay thế cho việc chọn lĩnh vực + môn học)
export const ALL_AVAILABLE_SUBJECTS = [
  // Natural Sciences
  'mathematics',
  'natural_sciences',

  // Social Sciences
  'history',
  'geography',
  'civics',
  'literature',
  'foreign_language',

  // Standalone
  'english_language'
];

/**
 * Tự động xác định lĩnh vực khoa học từ môn học được chọn
 * @param {string} subject - Môn học được chọn
 * @returns {string} - Lĩnh vực khoa học tương ứng
 */
export const getSubjectArea = (subject) => {
  return SUBJECT_TO_AREA_MAPPING[subject] || 'natural_sciences';
};

/**
 * Kiểm tra xem một môn học có thuộc lĩnh vực natural_sciences không
 * @param {string} subject - Môn học
 * @returns {boolean}
 */
export const isNaturalScience = (subject) => {
  return SUBJECT_TO_AREA_MAPPING[subject] === 'natural_sciences';
};

/**
 * Kiểm tra xem một môn học có thuộc lĩnh vực social_sciences không  
 * @param {string} subject - Môn học
 * @returns {boolean}
 */
export const isSocialScience = (subject) => {
  return SUBJECT_TO_AREA_MAPPING[subject] === 'social_sciences';
};

/**
 * Lấy tất cả môn học thuộc một lĩnh vực cụ thể
 * @param {string} area - Lĩnh vực ('natural_sciences' hoặc 'social_sciences')
 * @returns {string[]} - Danh sách môn học
 */
export const getSubjectsByArea = (area) => {
  return ALL_AVAILABLE_SUBJECTS.filter(subject => 
    SUBJECT_TO_AREA_MAPPING[subject] === area
  );
}; 