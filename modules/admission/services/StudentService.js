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
import { generateTemporaryPassword } from "../../backend-core/utils/passwordGenerator.js";
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

    // Count without loading every row into memory.
    const count = await Student.count({
      where: {
        schoolId,
        isActive: true,
        ...(gradeId ? { gradeId } : {}),
      },
    });

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

      // Emails are globally unique.
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // Create user first with a unique temporary password (returned once).
      const temporaryPassword = generateTemporaryPassword();
      const user = await User.create(
        {
          firstName: firstName,
          lastName: lastName,
          email,
          password: temporaryPassword,
          role: ROLES.STUDENT,
          schoolId: schoolId,
          mustChangePassword: true,
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

      // Return student with user data + the temporary password (shown once).
      const created = await getStudentByIdDb(student.studentId, schoolId);
      return {
        ...(created?.toJSON ? created.toJSON() : created),
        temporaryPassword,
      };
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

      // Normalize the shapes the UI sends into canonical columns.
      const input = { ...updateData };

      const className = input.class || input.className;
      let resolvedClass = null;
      if (className) {
        resolvedClass = await Class.findOne({
          where: { schoolId, className, isActive: true },
        });
        if (resolvedClass) {
          input.classId = resolvedClass.classId;
          input.gradeId = resolvedClass.gradeId;
        }
      }
      if (input.classId && !input.gradeId) {
        const cls =
          resolvedClass ||
          (await Class.findOne({
            where: { schoolId, classId: input.classId, isActive: true },
          }));
        if (cls) input.gradeId = cls.gradeId;
      }
      if (!input.gradeId && input.grade) {
        const cls = await Class.findOne({
          where: { schoolId, grade: input.grade, isActive: true },
        });
        if (cls) input.gradeId = cls.gradeId;
      }

      const hasGuardianFields = [
        "guardianName",
        "guardianPhone",
        "guardianEmail",
        "guardianRelation",
        "guardianAddress",
      ].some((key) => Object.prototype.hasOwnProperty.call(input, key));
      if (hasGuardianFields) {
        input.guardianDetails = {
          ...(student.guardianDetails || {}),
          ...(input.guardianName !== undefined
            ? { name: input.guardianName }
            : {}),
          ...(input.guardianPhone !== undefined
            ? { phone: input.guardianPhone }
            : {}),
          ...(input.guardianEmail !== undefined
            ? { email: input.guardianEmail }
            : {}),
          ...(input.guardianRelation !== undefined
            ? { relation: input.guardianRelation }
            : {}),
          ...(input.guardianAddress !== undefined
            ? { address: input.guardianAddress }
            : {}),
        };
      }

      if (input.previousSchool) {
        input.previousSchoolDetails = {
          ...(student.previousSchoolDetails || {}),
          ...input.previousSchool,
        };
      }

      // Only these student columns may be changed via the API. Identity and
      // tenancy fields (studentId, userId, schoolId, isActive) are ignored.
      const ALLOWED_STUDENT_FIELDS = [
        "admissionNumber",
        "classId",
        "gradeId",
        "rollNumber",
        "dateOfBirth",
        "gender",
        "parentDetails",
        "guardianDetails",
        "previousSchoolDetails",
        "emergencyContact",
        "address",
        "admissionDate",
        "enrollmentDate",
        "status",
        "subjects",
        "attendance",
        "grades",
        "fatherName",
        "staffRelation",
        "phone",
      ];
      const studentUpdateData = {};
      for (const field of ALLOWED_STUDENT_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(input, field)) {
          studentUpdateData[field] = input[field];
        }
      }

      // Keep the denormalized `name` in sync when names are edited.
      if (
        updateData.firstName !== undefined ||
        updateData.lastName !== undefined
      ) {
        const first = updateData.firstName ?? student.firstName;
        const last = updateData.lastName ?? student.lastName;
        studentUpdateData.name = `${first || ""} ${last || ""}`.trim();
      }

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
   * Reset a student's password to a fresh temporary password (admin action).
   * @param {string} studentId
   * @param {string} schoolId
   * @returns {{studentId:string, temporaryPassword:string}}
   */
  async resetStudentPassword(studentId, schoolId) {
    const student = await getStudentByIdDb(studentId, schoolId);
    if (!student) {
      throw new Error("Student not found");
    }

    const user = await User.findOne({
      where: { id: student.userId, schoolId },
    });
    if (!user) {
      throw new Error("Student user not found");
    }

    const temporaryPassword = generateTemporaryPassword();
    await user.update({
      password: temporaryPassword,
      mustChangePassword: true,
    });

    return { studentId: student.studentId, temporaryPassword };
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
