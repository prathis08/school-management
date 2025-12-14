import {
  User,
  Teacher,
  Subject,
  Class,
} from "@school-management/backend-core/models/index.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
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
      "teacher_id", // Custom ID field name
      {
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
      password,
      employeeId,
      department,
      qualification,
      experience,
      dateOfJoining,
      salary,
      phone,
      address,
      subjects,
      classes,
    } = teacherData;

    // Check if user with email already exists in this school
    const existingUser = await findAllBySchool(User, schoolId, { email });
    if (existingUser.length > 0) {
      throw new Error("User with this email already exists in this school");
    }

    // Check if employee ID already exists in this school
    const existingTeacher = await findAllBySchool(Teacher, schoolId, {
      teacher_id: employeeId,
    });
    if (existingTeacher.length > 0) {
      throw new Error("Employee ID already exists in this school");
    }

    // Create user first with schoolId
    const user = await createWithSchool(
      User,
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: ROLES.TEACHER,
      },
      schoolId
    );

    // Create teacher with schoolId
    const teacher = await createWithSchool(
      Teacher,
      {
        user_id: user.id,
        teacher_id: employeeId,
        department,
        qualification,
        experience,
        date_of_joining: dateOfJoining,
        salary,
        phone,
        address,
      },
      schoolId
    );

    // Fetch teacher with user data for response
    const createdTeacher = await findByIdentifierAndSchool(
      Teacher,
      teacher.id,
      schoolId,
      "teacher_id",
      {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name", "email", "schoolId"],
          },
        ],
      }
    );

    // Build formatted response
    return buildTeacherResponse(createdTeacher);
  }

  /**
   * Update teacher by ID
   * @param {string} teacherId - Teacher ID
   * @param {Object} updateData - Data to update
   * @param {string} schoolId - School ID
   * @returns {Object} Updated teacher data
   */
  async updateTeacher(teacherId, updateData, schoolId) {
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

    await teacher.update(teacherUpdateData);

    // Update user fields if provided
    if (
      updateData.firstName ||
      updateData.lastName ||
      updateData.email ||
      updateData.schoolId
    ) {
      const user = await User.findByPk(teacher.user_id);
      const userUpdateData = {};
      if (updateData.firstName)
        userUpdateData.first_name = updateData.firstName;
      if (updateData.lastName) userUpdateData.last_name = updateData.lastName;
      if (updateData.email) userUpdateData.email = updateData.email;
      if (updateData.schoolId) userUpdateData.schoolId = updateData.schoolId;
      await user.update(userUpdateData);
    }

    // Fetch updated teacher with associations
    const updatedTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "email"],
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
  }

  /**
   * Delete teacher by ID (soft delete)
   * @param {string} teacherId - Teacher ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async deleteTeacher(teacherId, schoolId) {
    const teacher = await findByIdentifier(Teacher, teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Soft delete - mark as inactive
    await teacher.update({ is_active: false });

    // Also deactivate user account
    await User.update({ is_active: false }, { where: { id: teacher.user_id } });

    return true;
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
