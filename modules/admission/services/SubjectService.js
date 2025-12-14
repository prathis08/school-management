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
  deleteByIdAndSchool,
  findByIdentifier,
} from "../dbCommands/genericDbCommands.js";

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
    return await findByIdAndSchool(Subject, subjectId, schoolId, {
      include: [
        {
          model: Teacher,
          as: "teachers",
          attributes: ["teacher_id", "department"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email"],
            },
          ],
        },
        {
          model: Class,
          as: "classes",
          attributes: ["class_name", "grade", "section"],
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
    const { subjectName, subjectCode, description, department, credits, type } =
      subjectData;

    // Check if subject code already exists in this school
    const existingSubject = await findAllBySchool(Subject, schoolId, {
      subject_code: subjectCode,
      is_active: true,
    });

    if (existingSubject.length > 0) {
      throw new Error("Subject code already exists in this school");
    }

    // Create subject
    const subject = await createWithSchool(
      Subject,
      {
        subject_name: subjectName,
        subject_code: subjectCode,
        description,
        department,
        credits,
        type,
      },
      schoolId
    );

    // Return subject with associations
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
    // Check if subject exists
    const existingSubject = await findByIdAndSchool(
      Subject,
      subjectId,
      schoolId
    );
    if (!existingSubject) {
      throw new Error("Subject not found");
    }

    // Check if updating subject code would create conflict
    if (
      updateData.subjectCode &&
      updateData.subjectCode !== existingSubject.subject_code
    ) {
      const codeExists = await findAllBySchool(Subject, schoolId, {
        subject_code: updateData.subjectCode,
        is_active: true,
        id: { $ne: subjectId }, // Exclude current subject
      });

      if (codeExists.length > 0) {
        throw new Error("Subject code already exists in this school");
      }
    }

    // Prepare update data
    const updatePayload = {
      subject_name: updateData.subjectName,
      subject_code: updateData.subjectCode,
      description: updateData.description,
      department: updateData.department,
      credits: updateData.credits,
      type: updateData.type,
    };

    // Remove undefined fields
    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    const updateResult = await updateByIdAndSchool(
      Subject,
      subjectId,
      updatePayload,
      schoolId
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
    // Check if subject exists
    const existingSubject = await findByIdAndSchool(
      Subject,
      subjectId,
      schoolId
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
    const deleteResult = await deleteByIdAndSchool(
      Subject,
      subjectId,
      schoolId
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
    // Find subject
    const subject = await findByIdentifier(Subject, subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify subject belongs to the school
    if (subject.schoolId !== schoolId) {
      throw new Error("Subject does not belong to your school");
    }

    // Find teacher
    const teacher = await findByIdentifier(Teacher, teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Verify teacher belongs to the school
    if (teacher.schoolId !== schoolId) {
      throw new Error("Teacher does not belong to your school");
    }

    // Check if teacher is already assigned to this subject
    const existingAssignment = await subject.hasTeacher(teacher);
    if (existingAssignment) {
      throw new Error("Teacher is already assigned to this subject");
    }

    // Add teacher to subject
    await subject.addTeacher(teacher);

    return true;
  }

  /**
   * Unassign teacher from subject
   * @param {string} subjectId - Subject ID
   * @param {string} teacherId - Teacher ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async unassignTeacherFromSubject(subjectId, teacherId, schoolId) {
    // Find subject
    const subject = await findByIdentifier(Subject, subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify subject belongs to the school
    if (subject.schoolId !== schoolId) {
      throw new Error("Subject does not belong to your school");
    }

    // Find teacher
    const teacher = await findByIdentifier(Teacher, teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Check if teacher is assigned to this subject
    const existingAssignment = await subject.hasTeacher(teacher);
    if (!existingAssignment) {
      throw new Error("Teacher is not assigned to this subject");
    }

    // Remove teacher from subject
    await subject.removeTeacher(teacher);

    return true;
  }
}

export default new SubjectService();
