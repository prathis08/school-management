import { User } from "@school-management/backend-core/models/index.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
import { getSequelize } from "@school-management/backend-core/config/database.js";
import { Op } from "sequelize";
import {
  getAllStudents as getAllStudentsDb,
  getStudentById as getStudentByIdDb,
  getStudentByNameAndFather as getStudentByNameAndFatherDb,
  createStudent as createStudentDb,
  updateStudent as updateStudentDb,
  deleteStudent as deleteStudentDb,
} from "../dbCommands/studentsDbCommands.js";
import { generateCustomIdWithPrefix } from "@school-management//backend-core/utils/customIdGenerator.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";

class StudentService {
  /**
   * Get all students with pagination
   * @param {string} schoolId - School ID
   * @param {Object} options - Query options (page, limit)
   * @returns {Object} Students data with pagination info
   */
  async getAllStudents(schoolId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const offset = (page - 1) * limit;
    const gradeId = options.gradeId || undefined;

    const students = await getAllStudentsDb(schoolId, {
      offset,
      limit,
      gradeId,
    });

    // Count total for pagination (simple approach - get all and count)
    const allStudents = await getAllStudentsDb(schoolId, { gradeId });
    const count = allStudents.length;

    return {
      students,
      pagination: {
        current: page,
        pages: Math.ceil(count / limit),
        total: count,
      },
    };
  }

  /**
   * Get student by ID
   * @param {string} studentId - Student ID
   * @param {string} schoolId - School ID
   * @returns {Object|null} Student data
   */
  async getStudentById(studentId, schoolId) {
    const student = await getStudentByIdDb(studentId, schoolId);
    if (!student) {
      throw new Error("Student not found");
    }
    console.log(JSON.stringify(student));
    return student;
  }

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @param {string} schoolId - School ID
   * @returns {Object} Created student data
   */
  async createStudent(studentData, schoolId) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const {
        firstName,
        lastName,
        email,
        password,
        studentId,
        dateOfBirth,
        gender,
        address,
        phone,
        grade,
        classId,
        gradeId,
        admissionDate,
        status,
        fatherName,
        fatherPhone,
        fatherEmail,
        fatherOccupation,
        motherName,
        motherPhone,
        motherEmail,
        motherOccupation,
        guardianName,
        guardianPhone,
        guardianEmail,
        guardianRelation,
        guardianAddress,
        previousSchoolName,
        previousSchoolLastGrade,
        previousSchoolAddress,
        previousSchoolBoard,
        reasonForLeaving,
        subjects,
        staffRelation,
      } = studentData;

      // Normalize staffRelation. When isStaffWard is false (or missing), store
      // an empty object so the field is consistent and queryable.
      const normalizedStaffRelation =
        staffRelation && staffRelation.isStaffWard
          ? {
              isStaffWard: true,
              staffId: staffRelation.staffId || null,
              staffName: staffRelation.staffName || null,
              relation: staffRelation.relation || null,
            }
          : {};

      // Check if student with same name and father name already exists
      if (fatherName && firstName && lastName) {
        const existingStudent = await getStudentByNameAndFatherDb(
          firstName,
          lastName,
          fatherName,
          schoolId,
        );
        if (existingStudent) {
          throw new Error(
            "A student with this name and father's name already exists in this school",
          );
        }
      }

      // Create user first
      const user = await User.create(
        {
          firstName: firstName,
          lastName: lastName,
          email,
          password,
          role: ROLES.STUDENT,
          schoolId: schoolId,
        },
        { transaction },
      );

      // Create student
      const student = await createStudentDb(
        {
          userId: user.id,
          studentId: generateCustomIdWithPrefix("STUDENT"),
          name: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
          email,
          dateOfBirth: dateOfBirth,
          gender,
          address:
            typeof address === "string" ? { street: address } : address || {},
          phone,
          grade,
          classId: classId,
          gradeId: gradeId,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          status: status || "Active",
          fatherName: fatherName,
          parentDetails: {
            father: {
              name: fatherName,
              phone: fatherPhone,
              email: fatherEmail,
              occupation: fatherOccupation,
            },
            mother: {
              name: motherName,
              phone: motherPhone,
              email: motherEmail,
              occupation: motherOccupation,
            },
          },
          guardianDetails: {
            name: guardianName,
            phone: guardianPhone,
            email: guardianEmail,
            relation: guardianRelation,
            address: guardianAddress,
          },
          previousSchoolDetails: {
            name: previousSchoolName,
            lastGrade: previousSchoolLastGrade,
            address: previousSchoolAddress,
            board: previousSchoolBoard,
            reasonForLeaving: reasonForLeaving,
          },
          emergencyContact: {
            primary: {
              name: fatherName,
              phone: fatherPhone,
              relation: "Father",
            },
            secondary: {
              name: motherName,
              phone: motherPhone,
              relation: "Mother",
            },
          },
          subjects:
            typeof subjects === "string"
              ? { selectedSubjects: subjects }
              : subjects || {},
          staffRelation: normalizedStaffRelation,
        },
        schoolId,
        { transaction },
      );

      // Commit transaction
      await transaction.commit();

      // Return student with user data
      return await getStudentByIdDb(student.studentId, schoolId);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update student by ID
   * @param {string} studentId - Student ID
   * @param {Object} updateData - Data to update
   * @param {string} schoolId - School ID
   * @returns {Object} Updated student data
   */
  async updateStudent(studentId, updateData, schoolId) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      // Find student first
      const student = await getStudentByIdDb(studentId, schoolId);
      if (!student) {
        throw new Error("Student not found");
      }

      // Update student fields (exclude user-related fields)
      const studentUpdateData = { ...updateData };
      delete studentUpdateData.firstName;
      delete studentUpdateData.lastName;
      delete studentUpdateData.email;
      delete studentUpdateData.password;

      // Normalize staffRelation the same way as createStudent so the field
      // never carries stale staffId/relation when the toggle is off.
      if (Object.prototype.hasOwnProperty.call(studentUpdateData, "staffRelation")) {
        const sr = studentUpdateData.staffRelation;
        studentUpdateData.staffRelation =
          sr && sr.isStaffWard
            ? {
                isStaffWard: true,
                staffId: sr.staffId || null,
                staffName: sr.staffName || null,
                relation: sr.relation || null,
              }
            : {};
      }

      await updateStudentDb(studentId, studentUpdateData, schoolId, {
        transaction,
      });

      // Update user fields if provided
      if (updateData.firstName || updateData.lastName || updateData.email) {
        const user = await User.findOne({
          where: {
            id: student.userId,
            schoolId: schoolId,
          },
        });
        if (user) {
          const userUpdateData = {};
          if (updateData.firstName)
            userUpdateData.firstName = updateData.firstName;
          if (updateData.lastName)
            userUpdateData.lastName = updateData.lastName;
          if (updateData.email) userUpdateData.email = updateData.email;
          await User.update(userUpdateData, {
            where: {
              id: student.userId,
              schoolId: schoolId,
            },
            transaction,
          });
        }
      }

      // Commit transaction
      await transaction.commit();

      // Return updated student
      return await getStudentByIdDb(studentId, schoolId);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete student by ID (soft delete)
   * @param {string} studentId - Student ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async deleteStudent(studentId, schoolId) {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      // Find student first
      const student = await getStudentByIdDb(studentId, schoolId);
      if (!student) {
        throw new Error("Student not found");
      }

      // Soft delete student
      await deleteStudentDb(studentId, schoolId, { transaction });

      // Also deactivate user account
      await User.update(
        { isActive: false },
        {
          where: {
            id: student.userId,
            schoolId: schoolId,
          },
          transaction,
        },
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
   * Search students by name or ID
   * @param {string} query - Search query
   * @param {string} schoolId - School ID
   * @returns {Array} Matching students
   */
  async searchStudents(query, schoolId) {
    const searchTerm = `%${query.toLowerCase()}%`;

    const students = await Student.findAll({
      where: {
        schoolId,
        [Op.or]: [
          { firstName: { [Op.iLike]: searchTerm } },
          { lastName: { [Op.iLike]: searchTerm } },
          { studentId: { [Op.iLike]: searchTerm } },
          { admissionNumber: { [Op.iLike]: searchTerm } },
        ],
      },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["classId", "className", "section"],
        },
      ],
      attributes: [
        "studentId",
        "firstName",
        "lastName",
        "admissionNumber",
        "classId",
        "gradeId",
      ],
      limit: 15,
      order: [
        ["first_name", "ASC"],
        ["last_name", "ASC"],
      ],
    });

    return students;
  }
}

export default new StudentService();
