import {
  User,
  Teacher,
  Subject,
  Class,
} from "@school-management/backend-core/models/index.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
import { getSequelize } from "@school-management/backend-core/config/database.js";
import {
  getAllTeachers as getAllTeachersDb,
  getTeacherById as getTeacherByIdDb,
  createTeacher as createTeacherDb,
  updateTeacher as updateTeacherDb,
  deleteTeacher as deleteTeacherDb,
  getTeacherNames as getTeacherNamesDb,
} from "../dbCommands/teachersDbCommands.js";
import {
  findAllBySchool,
  findByIdAndSchool,
  createWithSchool,
  findByIdentifier,
  findByIdentifierAndSchool,
} from "../dbCommands/genericDbCommands.js";
import {
  buildTeachersListResponse,
  buildTeacherResponse,
  buildTeachersSummariesResponse,
} from "../utils/teacherResponseBuilder.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

class TeacherService {
  /**
   * Get all teachers with pagination
   * @param {string} schoolId - School ID
   * @param {Object} options - Query options (page, limit, summary)
   * @returns {Object} Teachers data with pagination info
   */
  async getAllTeachers(schoolId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const offset = (page - 1) * limit;
    const summary = options.summary === "true";

    const teachers = await getAllTeachersDb(schoolId, {
      offset,
      limit,
    });

    // Count total for pagination
    const allTeachers = await getAllTeachersDb(schoolId);
    const count = allTeachers.length;

    // Build appropriate response based on summary flag
    const formattedTeachers = summary
      ? buildTeachersSummariesResponse(teachers)
      : buildTeachersListResponse(teachers);

    return {
      teachers: formattedTeachers,
      pagination: {
        current: page,
        pages: Math.ceil(count / limit),
        total: count,
      },
    };
  }

  /**
   * Get teacher by ID
   * @param {string} teacherId - Teacher ID
   * @param {string} schoolId - School ID
   * @returns {Object|null} Formatted teacher data
   */
  async getTeacherById(teacherId, schoolId) {
    const teacher = await findByIdentifierAndSchool(
      Teacher,
      teacherId,
      schoolId,
      "teacherId", // Custom ID field name
      {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName", "email", "schoolId"],
          },
          {
            model: Subject,
            as: "subjects",
            attributes: ["subject_name", "subject_code", "department"],
          },
          {
            model: Class,
            as: "managedClasses",
            attributes: ["class_name", "grade", "section", "room"],
          },
        ],
      }
    );

    if (!teacher) {
      return null;
    }

    // Build formatted response
    return buildTeacherResponse(teacher);
  }

  /**
   * Create a new teacher
   * @param {Object} teacherData - Teacher data
   * @param {string} schoolId - School ID
   * @returns {Object} Created teacher data
   */
  async createTeacher(teacherData, schoolId) {
    const {
      firstName,
      lastName,
      email,
      department,
      qualification,
      experience,
      dateOfJoining,
      phone,
      address,
      subjects,
      classes,
    } = teacherData;

    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const employeeId = generateCustomIdWithPrefix("TEACHER");

      // Check if user with email already exists in this school
      const existingUser = await findAllBySchool(User, schoolId, { email });
      if (existingUser.length > 0) {
        throw new Error("User with this email already exists in this school");
      }

      // Check if employee ID already exists in this school
      const existingTeacher = await findAllBySchool(Teacher, schoolId, {
        teacherId: employeeId,
      });
      if (existingTeacher.length > 0) {
        throw new Error("Employee ID already exists in this school");
      }

      // Create user first with schoolId
      const defaultPassword = "ChangeMe123!";
      const password = defaultPassword; // In real scenario, hash the password
      const user = await User.create(
        {
          firstName: firstName,
          lastName: lastName,
          email,
          password,
          role: ROLES.TEACHER,
          schoolId: schoolId,
        },
        { transaction }
      );

      // Create teacher with schoolId
      const teacher = await Teacher.create(
        {
          userId: user.userId,
          teacherId: employeeId,
          department,
          qualification,
          experience,
          dateOfJoining: dateOfJoining,
          phone,
          address,
          schoolId: schoolId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Fetch teacher with user data for response
      const createdTeacher = await findByIdentifierAndSchool(
        Teacher,
        teacher.teacherId,
        schoolId,
        "teacherId",
        {
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName", "email", "schoolId"],
            },
          ],
        }
      );

      // Build formatted response
      return buildTeacherResponse(createdTeacher);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update teacher by ID
   * @param {string} teacherId - Teacher ID
   * @param {Object} updateData - Data to update
   * @param {string} schoolId - School ID
   * @returns {Object} Updated teacher data
   */
  async updateTeacher(teacherId, updateData, schoolId) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const teacher = await findByIdentifier(Teacher, teacherId);
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Check if schoolId already exists (if provided and different from current)
      if (updateData.schoolId && updateData.schoolId !== teacher.schoolId) {
        const existingSchoolId = await Teacher.findOne({
          where: { schoolId: updateData.schoolId },
        });
        if (existingSchoolId) {
          throw new Error("School ID already exists");
        }
      }

      // Update teacher fields
      const teacherUpdateData = { ...updateData };
      delete teacherUpdateData.firstName;
      delete teacherUpdateData.lastName;
      delete teacherUpdateData.email;

      await teacher.update(teacherUpdateData, { transaction });

      // Update user fields if provided
      if (
        updateData.firstName ||
        updateData.lastName ||
        updateData.email ||
        updateData.schoolId
      ) {
        const user = await User.findOne({ where: { userId: teacher.userId } });
        const userUpdateData = {};
        if (updateData.firstName)
          userUpdateData.firstName = updateData.firstName;
        if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
        if (updateData.email) userUpdateData.email = updateData.email;
        if (updateData.schoolId) userUpdateData.schoolId = updateData.schoolId;
        await user.update(userUpdateData, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      // Fetch updated teacher with associations
      const updatedTeacher = await Teacher.findByPk(teacher.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName", "email"],
          },
          {
            model: Subject,
            as: "subjects",
            attributes: ["subject_name", "subject_code"],
          },
          {
            model: Class,
            as: "managedClasses",
            attributes: ["class_name", "grade", "section"],
          },
        ],
      });

      // Build formatted response
      return buildTeacherResponse(updatedTeacher);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete teacher by ID (soft delete)
   * @param {string} teacherId - Teacher ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async deleteTeacher(teacherId, schoolId) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const teacher = await findByIdentifier(Teacher, teacherId);
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Soft delete - mark as inactive
      await teacher.update({ is_active: false }, { transaction });

      // Also deactivate user account
      await User.update(
        { isActive: false },
        { where: { userId: teacher.userId }, transaction }
      );

      // Commit transaction
      await transaction.commit();
      return true;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get only the names of all teachers for a school
   * @param {string} schoolId - School ID
   * @returns {Array} Array of teacher names with IDs
   */
  async getTeacherNames(schoolId) {
    const teachers = await getTeacherNamesDb(schoolId);

    return teachers.map((teacher) => ({
      teacherId: teacher.teacherId,
      fullName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
    }));
  }
}

export default new TeacherService();
