import {
  Class,
  Teacher,
  Student,
  User,
} from "@school-management/backend-core/models/index.js";
import {
  findAllBySchool,
  findByCustomIdAndSchool,
  createWithSchool,
  updateByCustomIdAndSchool,
} from "./genericDbCommands.js";

/**
 * Get all classes for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of classes
 */
export const getAllClasses = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Teacher,
        as: "classTeacher",
        attributes: ["teacher_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
        ],
      },
      {
        model: Student,
        as: "students",
        attributes: ["id", "student_id"],
        required: false,
      },
    ],
    order: [
      ["grade", "ASC"],
      ["section", "ASC"],
    ],
    ...options,
  };

  return await findAllBySchool(
    Class,
    schoolId,
    { is_active: true },
    defaultOptions
  );
};

/**
 * Get a single class by classId (custom ID only)
 * @param {string} classId - Custom classId (e.g., CLASS1726412345678901)
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Class object or null
 */
export const getClassById = async (classId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Teacher,
        as: "classTeacher",
        attributes: ["teacher_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
        ],
      },
      {
        model: Student,
        as: "students",
        attributes: ["student_id"],
        required: false,
      },
    ],
    ...options,
  };

  return await findByCustomIdAndSchool(
    Class,
    classId,
    schoolId,
    "class_id",
    defaultOptions
  );
};

/**
 * Create a new class
 * @param {object} classData - Class data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created class object
 */
export const createClass = async (classData, schoolId) => {
  return await createWithSchool(Class, classData, schoolId);
};

/**
 * Update class by classId (custom ID only)
 * @param {string} classId - Custom classId (e.g., CLASS1726412345678901)
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateClass = async (classId, updated_ata, schoolId) => {
  return await updateByCustomIdAndSchool(
    Class,
    updated_ata,
    classId,
    schoolId,
    "class_id"
  );
};

/**
 * Delete class (mark as inactive) by classId (custom ID only)
 * @param {string} classId - Custom classId (e.g., CLASS1726412345678901)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteClass = async (classId, schoolId) => {
  return await updateByCustomIdAndSchool(
    Class,
    { is_active: false },
    classId,
    schoolId,
    "class_id"
  );
};

/**
 * Get grades and class lists for a school
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Array of grades with their classes
 */
export const getGradesAndClasses = async (schoolId) => {
  return await Class.findAll({
    attributes: ["class_id", "class_name", "grade", "section"],
    where: {
      schoolId: schoolId,
      is_active: true,
    },
    order: [
      ["grade", "ASC"],
      ["section", "ASC"],
    ],
  });
};
