import {
  Teacher,
  User,
  Subject,
  Class,
} from "@school-management/backend-core/models/index.js";

/**
 * Get all teachers for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of teachers
 */
export const getAllTeachers = async (schoolId, options = {}) => {
  const defaultOptions = {
    attributes: [
      "id",
      "teacher_id",
      "department",
      "qualification",
      "experience",
      "date_of_joining",
      "salary",
      "phone",
      "address",
      "is_active",
      "created_at",
      "updated_at",
    ],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "first_name", "last_name", "email", "schoolId"],
      },
      {
        model: Subject,
        as: "subjects",
        attributes: ["subject_name", "subject_code", "department"],
        through: { attributes: [] },
      },
      {
        model: Class,
        as: "managedClasses",
        attributes: ["class_name", "grade", "section", "room"],
      },
    ],
    order: [["created_at", "DESC"]],
    ...options,
  };

  return await Teacher.findAll({
    where: {
      schoolId: schoolId,
      is_active: true,
    },
    ...defaultOptions,
  });
};

/**
 * Get a single teacher by teacherId (custom ID only)
 * @param {string} teacherId - Custom teacherId (e.g., TEACHER1726412345678901)
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Teacher object or null
 */
export const getTeacherById = async (teacherId, schoolId, options = {}) => {
  if (!teacherId) {
    throw new Error("Teacher identifier is missing");
  }

  const defaultOptions = {
    attributes: [
      "id",
      "teacher_id",
      "department",
      "qualification",
      "experience",
      "date_of_joining",
      "salary",
      "phone",
      "address",
      "is_active",
      "created_at",
      "updated_at",
    ],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["first_name", "last_name", "email", "schoolId"],
      },
      {
        model: Subject,
        as: "subjects",
        attributes: ["subject_name", "subject_code", "department"],
        through: { attributes: [] },
      },
      {
        model: Class,
        as: "managedClasses",
        attributes: ["class_name", "grade", "section", "room"],
      },
    ],
    ...options,
  };

  return await Teacher.findOne({
    where: {
      schoolId: schoolId,
      teacher_id: teacherId,
    },
    ...defaultOptions,
  });
};

/**
 * Create a new teacher
 * @param {object} teacherData - Teacher data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created teacher object
 */
export const createTeacher = async (teacherData, schoolId) => {
  return await Teacher.create({
    ...teacherData,
    schoolId: schoolId,
  });
};

/**
 * Update teacher by teacherId (custom ID only)
 * @param {string} teacherId - Custom teacherId (e.g., TEACHER1726412345678901)
 * @param {object} updateData - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateTeacher = async (teacherId, updateData, schoolId) => {
  if (!teacherId) {
    throw new Error("Teacher identifier is missing");
  }

  return await Teacher.update(updateData, {
    where: {
      schoolId: schoolId,
      teacher_id: teacherId,
    },
  });
};

/**
 * Delete teacher (mark as inactive) by teacherId (custom ID only)
 * @param {string} teacherId - Custom teacherId (e.g., TEACHER1726412345678901)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteTeacher = async (teacherId, schoolId) => {
  if (!teacherId) {
    throw new Error("Teacher identifier is missing");
  }

  return await Teacher.update(
    { is_active: false },
    {
      where: {
        schoolId: schoolId,
        teacher_id: teacherId,
      },
    }
  );
};

/**
 * Get all teacher names for a school
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Array of teacher names
 */
export const getTeacherNames = async (schoolId) => {
  return await Teacher.findAll({
    attributes: ["teacherId"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName"],
      },
    ],
    where: {
      schoolId: schoolId,
      is_active: true,
    },
    order: [
      [{ model: User, as: "user" }, "firstName", "ASC"],
      [{ model: User, as: "user" }, "lastName", "ASC"],
    ],
  });
};
