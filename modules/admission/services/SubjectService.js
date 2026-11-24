import { Op } from "sequelize";
import {
  Subject,
  Teacher,
  User,
  Class,
} from "@school-management/backend-core/models/index.js";
import {
  findByIdAndSchool,
  findAllBySchool,
  countBySchool,
  createWithSchool,
  updateByIdAndSchool,
  updateByCustomIdAndSchool,
  deleteByIdAndSchool,
  findByIdentifier,
  findByIdentifierAndSchool,
} from "../dbCommands/genericDbCommands.js";
import { withTransaction } from "@school-management/backend-core/utils/transactionHelper.js";

class SubjectService {
  /**
   * Get all subjects for a school
   * @param {string} schoolId - School ID
   * @returns {Object[]} Array of subjects with teachers
   */
  async getAllSubjects(schoolId) {
    return await findAllBySchool(
      Subject,
      schoolId,
      { is_active: true },
      {
        include: [
          {
            model: Teacher,
            as: "teachers",
            attributes: ["teacher_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["first_name", "last_name", "email", "schoolId"],
              },
            ],
          },
        ],
        order: [["subject_name", "ASC"]],
      }
    );
  }

  /**
   * Get subject by ID
   * @param {string} subjectId - Subject ID
   * @param {string} schoolId - School ID
   * @returns {Object|null} Subject data with relationships
   */
  async getSubjectById(subjectId, schoolId) {
    return await findByIdentifierAndSchool(
      Subject,
      subjectId,
      schoolId,
      "subjectId",
      {
      include: [
        {
          model: Teacher,
          as: "teachers",
          attributes: ["teacherId", "department"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: Class,
          as: "classes",
          attributes: ["classId", "className", "grade", "section"],
        },
      ],
    });
  }

  /**
   * Create a new subject
   * @param {Object} subjectData - Subject data
   * @param {string} schoolId - School ID
   * @returns {Object} Created subject data
   */
  async createSubject(subjectData, schoolId) {
    const { subjectName, subjectCode, description, department, credits, syllabus } =
      subjectData;

    const existingSubject = await findAllBySchool(Subject, schoolId, {
      subjectCode,
      isActive: true,
    });

    if (existingSubject.length > 0) {
      throw new Error("Subject code already exists in this school");
    }

    const subject = await createWithSchool(
      Subject,
      {
        subjectName,
        subjectCode,
        description,
        department,
        credits,
        syllabus,
      },
      schoolId,
    );

    return await this.getSubjectById(subject.id, schoolId);
  }

  /**
   * Update subject by ID
   * @param {string} subjectId - Subject ID
   * @param {Object} updateData - Data to update
   * @param {string} schoolId - School ID
   * @returns {Object} Updated subject data
   */
  async updateSubject(subjectId, updateData, schoolId) {
    // Check if subject exists (accepts the custom subjectId, school-scoped)
    const existingSubject = await findByIdentifierAndSchool(
      Subject,
      subjectId,
      schoolId,
      "subjectId"
    );
    if (!existingSubject) {
      throw new Error("Subject not found");
    }

    if (
      updateData.subjectCode &&
      updateData.subjectCode !== existingSubject.subjectCode
    ) {
      const codeExists = await findAllBySchool(Subject, schoolId, {
        subjectCode: updateData.subjectCode,
        isActive: true,
        subjectId: { [Op.ne]: subjectId },
      });

      if (codeExists.length > 0) {
        throw new Error("Subject code already exists in this school");
      }
    }

    const updatePayload = {
      subjectName: updateData.subjectName,
      subjectCode: updateData.subjectCode,
      description: updateData.description,
      department: updateData.department,
      credits: updateData.credits,
      syllabus: updateData.syllabus,
    };

    // Remove undefined fields
    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    const updateResult = await updateByCustomIdAndSchool(
      Subject,
      updatePayload,
      subjectId,
      schoolId,
      "subjectId"
    );

    if (updateResult[0] === 0) {
      throw new Error("Subject not found or no changes made");
    }

    // Return updated subject
    return await this.getSubjectById(subjectId, schoolId);
  }

  /**
   * Delete subject by ID (soft delete)
   * @param {string} subjectId - Subject ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async deleteSubject(subjectId, schoolId) {
    // Check if subject exists (accepts the custom subjectId, school-scoped)
    const existingSubject = await findByIdentifierAndSchool(
      Subject,
      subjectId,
      schoolId,
      "subjectId"
    );
    if (!existingSubject) {
      throw new Error("Subject not found");
    }

    // Check if subject has active teachers assigned
    const teachersCount = await existingSubject.countTeachers();
    if (teachersCount > 0) {
      throw new Error(
        `Cannot delete subject. It has ${teachersCount} teachers assigned. Please unassign teachers first.`
      );
    }

    // Soft delete
    const deleteResult = await updateByCustomIdAndSchool(
      Subject,
      { isActive: false },
      subjectId,
      schoolId,
      "subjectId"
    );

    if (deleteResult[0] === 0) {
      throw new Error("Subject not found or already deleted");
    }

    return true;
  }

  /**
   * Assign teacher to subject
   * @param {string} subjectId - Subject ID
   * @param {string} teacherId - Teacher ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async assignTeacherToSubject(subjectId, teacherId, schoolId) {
    return await withTransaction(async (transaction) => {
      // Find subject
      const subject = await findByIdentifier(Subject, subjectId, {
        transaction,
      });
      if (!subject) {
        throw new Error("Subject not found");
      }

      // Verify subject belongs to the school
      if (subject.schoolId !== schoolId) {
        throw new Error("Subject does not belong to your school");
      }

      // Find teacher
      const teacher = await findByIdentifier(Teacher, teacherId, {
        transaction,
      });
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Verify teacher belongs to the school
      if (teacher.schoolId !== schoolId) {
        throw new Error("Teacher does not belong to your school");
      }

      // Check if teacher is already assigned to this subject
      const existingAssignment = await subject.hasTeacher(teacher, {
        transaction,
      });
      if (existingAssignment) {
        throw new Error("Teacher is already assigned to this subject");
      }

      // Add teacher to subject
      await subject.addTeacher(teacher, { transaction });

      return true;
    });
  }

  /**
   * Unassign teacher from subject
   * @param {string} subjectId - Subject ID
   * @param {string} teacherId - Teacher ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async unassignTeacherFromSubject(subjectId, teacherId, schoolId) {
    return await withTransaction(async (transaction) => {
      // Find subject
      const subject = await findByIdentifier(Subject, subjectId, {
        transaction,
      });
      if (!subject) {
        throw new Error("Subject not found");
      }

      // Verify subject belongs to the school
      if (subject.schoolId !== schoolId) {
        throw new Error("Subject does not belong to your school");
      }

      // Find teacher
      const teacher = await findByIdentifier(Teacher, teacherId, {
        transaction,
      });
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Check if teacher is assigned to this subject
      const existingAssignment = await subject.hasTeacher(teacher, {
        transaction,
      });
      if (!existingAssignment) {
        throw new Error("Teacher is not assigned to this subject");
      }

      // Remove teacher from subject
      await subject.removeTeacher(teacher, { transaction });

      return true;
    });
  }
}

export default new SubjectService();
