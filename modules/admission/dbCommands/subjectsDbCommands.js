import {
  Subject,
  Teacher,
  User,
} from "@school-management/backend-core/models/index.js";

/**
 * Get all subjects for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of subjects
 */
export const getAllSubjects = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Teacher,
        as: "teachers",
        attributes: ["teacher_id"],
        through: { attributes: [] },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
        ],
      },
    ],
    order: [["subject_name", "ASC"]],
    ...options,
  };

  return await Subject.findAll({
    where: {
      schoolId: schoolId,
      is_active: true,
    },
    ...defaultOptions,
  });
};

/**
 * Get a single subject by subjectId (custom ID only)
 * @param {string} subjectId - Custom subjectId (e.g., SUBJECT1726412345678901)
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Subject object or null
 */
export const getSubjectById = async (subjectId, schoolId, options = {}) => {
  if (!subjectId) {
    throw new Error("Subject identifier is missing");
  }

  const defaultOptions = {
    include: [
      {
        model: Teacher,
        as: "teachers",
        attributes: ["teacher_id"],
        through: { attributes: [] },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
        ],
      },
    ],
    ...options,
  };

  return await Subject.findOne({
    where: {
      schoolId: schoolId,
      subject_id: subjectId,
    },
    ...defaultOptions,
  });
};

/**
 * Create a new subject
 * @param {object} subjectData - Subject data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created subject object
 */
export const createSubject = async (subjectData, schoolId) => {
  return await Subject.create({
    ...subjectData,
    schoolId: schoolId,
  });
};

/**
 * Update subject by subjectId (custom ID only)
 * @param {string} subjectId - Custom subjectId (e.g., SUBJECT1726412345678901)
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateSubject = async (subjectId, updated_ata, schoolId) => {
  if (!subjectId) {
    throw new Error("Subject identifier is missing");
  }

  return await Subject.update(updated_ata, {
    where: {
      schoolId: schoolId,
      subject_id: subjectId,
    },
  });
};

/**
 * Delete subject (mark as inactive) by subjectId (custom ID only)
 * @param {string} subjectId - Custom subjectId (e.g., SUBJECT1726412345678901)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteSubject = async (subjectId, schoolId) => {
  if (!subjectId) {
    throw new Error("Subject identifier is missing");
  }

  return await Subject.update(
    { is_active: false },
    {
      where: {
        schoolId: schoolId,
        subject_id: subjectId,
      },
    }
  );
};
