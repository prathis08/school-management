import { Op } from "sequelize";
import { randomUUID } from "crypto";
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

import { generateTemporaryPassword } from "../../backend-core/utils/passwordGenerator.js";

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

    const teachers = await getAllTeachersDb(schoolId, {
      offset,
      limit,
    });

    // Count total for pagination
    const allTeachers = await getAllTeachersDb(schoolId);
    const count = allTeachers.length;

    // Build appropriate response based on summary flag
    const formattedTeachers = buildTeachersListResponse(teachers);
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
            attributes: ["subjectId", "subjectName", "subjectCode", "department"],
          },
          {
            model: Class,
            as: "managedClasses",
            attributes: ["classId", "className", "grade", "section", "room"],
          },
        ],
      },
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

      // Emails are globally unique.
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // Check if employee ID already exists in this school
      const existingTeacher = await findAllBySchool(Teacher, schoolId, {
        teacherId: employeeId,
      });
      if (existingTeacher.length > 0) {
        throw new Error("Employee ID already exists in this school");
      }

      // Create user first with schoolId. Each teacher gets a unique temporary
      // password (returned once to the admin) — never a shared default.
      const temporaryPassword = generateTemporaryPassword();
      const user = await User.create(
        {
          firstName: firstName,
          lastName: lastName,
          email,
          password: temporaryPassword,
          role: ROLES.TEACHER,
          schoolId: schoolId,
          mustChangePassword: true,
        },
        { transaction },
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
        { transaction },
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
        },
      );

      // Build formatted response. The temporary password is returned exactly
      // once so the admin can hand it to the teacher.
      return {
        ...buildTeacherResponse(createdTeacher),
        temporaryPassword,
      };
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
      // Scope the lookup to the caller's school (tenant isolation).
      const teacher = await findByIdentifierAndSchool(
        Teacher,
        teacherId,
        schoolId,
        "teacherId",
      );
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      const { subjectIds, classIds } = updateData;

      // Only these teacher columns may be changed via the API. Everything else
      // (schoolId, teacherId, userId, isActive, …) is ignored.
      const ALLOWED_FIELDS = [
        "department",
        "qualification",
        "experience",
        "dateOfJoining",
        "phone",
        "address",
        "salary",
      ];
      const teacherUpdateData = {};
      for (const field of ALLOWED_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          teacherUpdateData[field] = updateData[field];
        }
      }

      await teacher.update(teacherUpdateData, { transaction });

      // Update user fields if provided
      if (updateData.firstName || updateData.lastName || updateData.email) {
        const user = await User.findOne({
          where: { userId: teacher.userId, schoolId },
        });
        if (user) {
          const userUpdateData = {};
          if (updateData.firstName)
            userUpdateData.firstName = updateData.firstName;
          if (updateData.lastName)
            userUpdateData.lastName = updateData.lastName;
          if (updateData.email) userUpdateData.email = updateData.email;
          await user.update(userUpdateData, { transaction });
        }
      }

      // Sync subject assignments (teacher_subject join table)
      if (Array.isArray(subjectIds)) {
        await sequelize.query(
          "DELETE FROM teacher_subject WHERE teacher_id = :teacherId",
          {
            replacements: { teacherId: teacher.teacherId },
            transaction,
          },
        );

        if (subjectIds.length > 0) {
          const subjects = await Subject.findAll({
            where: {
              schoolId,
              subjectId: { [Op.in]: subjectIds },
              isActive: true,
            },
            transaction,
          });

          for (const subject of subjects) {
            await sequelize.query(
              `INSERT INTO teacher_subject
                 (id, teacher_id, subject_id, school_id, is_active, created_at, updated_at)
               VALUES
                 (:id, :teacherId, :subjectId, :schoolId, true, NOW(), NOW())`,
              {
                replacements: {
                  id: randomUUID(),
                  teacherId: teacher.teacherId,
                  subjectId: subject.subjectId,
                  schoolId,
                },
                transaction,
              },
            );
          }
        }
      }

      // Sync managed classes (sets/clears Class.classTeacherId)
      if (Array.isArray(classIds)) {
        await Class.update(
          { classTeacherId: null },
          {
            where: {
              schoolId,
              classTeacherId: teacher.teacherId,
              ...(classIds.length ? { classId: { [Op.notIn]: classIds } } : {}),
            },
            transaction,
          },
        );

        if (classIds.length > 0) {
          await Class.update(
            { classTeacherId: teacher.teacherId },
            {
              where: { schoolId, classId: { [Op.in]: classIds } },
              transaction,
            },
          );
        }
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
            attributes: ["subjectId", "subjectName", "subjectCode"],
          },
          {
            model: Class,
            as: "managedClasses",
            attributes: ["classId", "className", "grade", "section"],
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
      const teacher = await findByIdentifierAndSchool(
        Teacher,
        teacherId,
        schoolId,
        "teacherId",
      );
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Soft delete - mark as inactive
      await teacher.update({ isActive: false }, { transaction });

      // Also deactivate user account (scoped to the same school)
      await User.update(
        { isActive: false },
        { where: { userId: teacher.userId, schoolId }, transaction },
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
   * Reset a teacher's password to a fresh temporary password (admin action).
   * @param {string} teacherId
   * @param {string} schoolId
   * @returns {{teacherId:string, temporaryPassword:string}}
   */
  async resetTeacherPassword(teacherId, schoolId) {
    const teacher = await findByIdentifierAndSchool(
      Teacher,
      teacherId,
      schoolId,
      "teacherId",
    );
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const user = await User.findOne({
      where: { userId: teacher.userId, schoolId },
    });
    if (!user) {
      throw new Error("Teacher user not found");
    }

    const temporaryPassword = generateTemporaryPassword();
    await user.update({
      password: temporaryPassword,
      mustChangePassword: true,
    });

    return { teacherId: teacher.teacherId, temporaryPassword };
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
