/**
 * Teacher Response Builder
 * Builds concrete response objects for teacher data
 */

/**
 * Build teacher response object for API responses
 * @param {Object} teacher - Raw teacher data from database
 * @returns {Object} - Formatted teacher response object
 */
export const buildTeacherResponse = (teacher) => {
  if (!teacher) {
    return null;
  }

  return {
    id: teacher.teacher_id, // Use custom teacher_id as the primary identifier
    teacherId: teacher.teacher_id,
    personalInfo: {
      firstName: teacher.user?.first_name || null,
      lastName: teacher.user?.last_name || null,
      email: teacher.user?.email || null,
      phone: teacher.phone || null,
    },
    professionalInfo: {
      department: teacher.department,
      qualification: teacher.qualification,
      experience: teacher.experience,
      dateOfJoining: teacher.date_of_joining,
      salary: teacher.salary,
    },
    assignments: {
      subjects:
        teacher.subjects?.map((subject) => ({
          subjectName: subject.subject_name,
          subjectCode: subject.subject_code,
          department: subject.department || null,
        })) || [],
      managedClasses:
        teacher.managedClasses?.map((cls) => ({
          className: cls.class_name,
          grade: cls.grade,
          section: cls.section,
          room: cls.room || null,
        })) || [],
    },
    status: {
      isActive: teacher.is_active,
    },
    metadata: {
      createdAt: teacher.created_at,
      updatedAt: teacher.updated_at,
    },
  };
};

/**
 * Build teacher list response for multiple teachers
 * @param {Array} teachers - Array of raw teacher data from database
 * @returns {Array} - Array of formatted teacher response objects
 */
export const buildTeachersListResponse = (teachers) => {
  if (!Array.isArray(teachers)) {
    return [];
  }

  return teachers.map((teacher) => buildTeacherResponse(teacher));
};

/**
 * Build teacher summary response (minimal data for lists)
 * @param {Object} teacher - Raw teacher data from database
 * @returns {Object} - Formatted teacher summary object
 */
export const buildTeacherSummaryResponse = (teacher) => {
  if (!teacher) {
    return null;
  }

  return {
    id: teacher.teacher_id,
    teacherId: teacher.teacher_id,
    name: `${teacher.user?.first_name || ""} ${
      teacher.user?.last_name || ""
    }`.trim(),
    email: teacher.user?.email || null,
    department: teacher.department,
    experience: teacher.experience,
    subjectCount: teacher.subjects?.length || 0,
    classCount: teacher.managedClasses?.length || 0,
    status: {
      isActive: teacher.is_active,
    },
  };
};

/**
 * Build teacher summaries list response for multiple teachers (minimal data)
 * @param {Array} teachers - Array of raw teacher data from database
 * @returns {Array} - Array of formatted teacher summary objects
 */
export const buildTeachersSummariesResponse = (teachers) => {
  if (!Array.isArray(teachers)) {
    return [];
  }

  return teachers.map((teacher) => buildTeacherSummaryResponse(teacher));
};
