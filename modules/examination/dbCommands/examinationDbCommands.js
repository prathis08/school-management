import {
  Exam,
  Result,
  Student,
  User,
  Subject,
} from "@school-management/backend-core/models/index.js";

import {
  findAllBySchool,
  findByIdAndSchool,
  createWithSchool,
  updateByIdAndSchool,
} from "../../admission/dbCommands/genericDbCommands.js";

/**
 * Get all exams for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of exams
 */
export const getAllExams = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Subject,
        as: "subject",
        attributes: ["subject_name", "subject_code"],
      },
    ],
    order: [["exam_date", "DESC"]],
    ...options,
  };

  return await findAllBySchool(
    Exam,
    schoolId,
    { is_active: true },
    defaultOptions
  );
};

/**
 * Get a single exam by ID
 * @param {string} examId - Exam UUID
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Exam object or null
 */
export const getExamById = async (examId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Subject,
        as: "subject",
        attributes: ["subject_name", "subject_code"],
      },
      {
        model: Result,
        as: "results",
        attributes: ["marks_obtained", "grade", "remarks"],
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["student_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["first_name", "last_name"],
              },
            ],
          },
        ],
      },
    ],
    ...options,
  };

  return await findByIdAndSchool(Exam, examId, schoolId, defaultOptions);
};

/**
 * Create a new exam
 * @param {object} examData - Exam data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created exam object
 */
export const createExam = async (examData, schoolId) => {
  return await createWithSchool(Exam, examData, schoolId);
};

/**
 * Update exam by ID
 * @param {string} examId - Exam UUID
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateExam = async (examId, updated_ata, schoolId) => {
  return await updateByIdAndSchool(Exam, updated_ata, examId, schoolId);
};

/**
 * Delete exam (mark as inactive)
 * @param {string} examId - Exam UUID
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteExam = async (examId, schoolId) => {
  return await updateByIdAndSchool(
    Exam,
    { is_active: false },
    examId,
    schoolId
  );
};

/**
 * Get all results for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of results
 */
export const getAllResults = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Student,
        as: "student",
        attributes: ["student_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
        ],
      },
      {
        model: Exam,
        as: "exam",
        attributes: ["exam_name", "exam_date"],
        include: [
          {
            model: Subject,
            as: "subject",
            attributes: ["subject_name", "subject_code"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    ...options,
  };

  return await findAllBySchool(Result, schoolId, {}, defaultOptions);
};

/**
 * Get a single result by ID
 * @param {string} resultId - Result UUID
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Result object or null
 */
export const getResultById = async (resultId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Student,
        as: "student",
        attributes: ["student_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
        ],
      },
      {
        model: Exam,
        as: "exam",
        attributes: ["exam_name", "exam_date"],
        include: [
          {
            model: Subject,
            as: "subject",
            attributes: ["subject_name", "subject_code"],
          },
        ],
      },
    ],
    ...options,
  };

  return await findByIdAndSchool(Result, resultId, schoolId, defaultOptions);
};

/**
 * Create a new result
 * @param {object} resultData - Result data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created result object
 */
export const createResult = async (resultData, schoolId) => {
  return await createWithSchool(Result, resultData, schoolId);
};

/**
 * Update result by ID
 * @param {string} resultId - Result UUID
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateResult = async (resultId, updated_ata, schoolId) => {
  return await updateByIdAndSchool(Result, updated_ata, resultId, schoolId);
};

/**
 * Delete result
 * @param {string} resultId - Result UUID
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteResult = async (resultId, schoolId) => {
  return await updateByIdAndSchool(
    Result,
    { is_deleted: true },
    resultId,
    schoolId
  );
};
