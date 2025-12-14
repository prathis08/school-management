import { Op } from "sequelize";
import {
  Class,
  Teacher,
  User,
  Subject,
  Student,
} from "@school-management/backend-core/models/index.js";
import {
  getAllClasses as getClassesFromDB,
  getClassById as getClassByIdFromDB,
  createClass as createClassInDB,
  updateClass as updateClassInDB,
  deleteClass as deleteClassInDB,
  getGradesAndClasses as getGradesAndClassesFromDB,
} from "../dbCommands/classesDbCommands.js";
import { findByIdentifier } from "../dbCommands/genericDbCommands.js";

class ClassService {
  /**
   * Get all classes for a school
   * @param {string} schoolId - School ID
   * @returns {Object[]} Array of classes
   */
  async getAllClasses(schoolId) {
    const classes = await getClassesFromDB(schoolId, {
      include: [
        {
          model: Teacher,
          as: "classTeacher",
          attributes: ["teacher_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email", "schoolId"],
            },
          ],
        },
        {
          model: Student,
          as: "students",
          attributes: ["student_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email", "schoolId"],
            },
          ],
        },
      ],
      order: [
        ["grade", "ASC"],
        ["section", "ASC"],
        ["class_name", "ASC"],
      ],
    });

    // Sort classes logically: by grade (numeric), then by section (alphabetic)
    return classes.sort((a, b) => {
      // First sort by grade (convert to number for proper numeric sorting)
      const gradeA = parseInt(a.grade) || 0;
      const gradeB = parseInt(b.grade) || 0;

      if (gradeA !== gradeB) {
        return gradeA - gradeB;
      }

      // If grades are the same, sort by section alphabetically
      if (a.section && b.section) {
        return a.section.localeCompare(b.section);
      }

      // Finally, sort by class name if sections are the same
      return a.class_name.localeCompare(b.class_name);
    });
  }

  /**
   * Get class by ID
   * @param {string} classId - Class ID
   * @param {string} schoolId - School ID
   * @returns {Object|null} Class data
   */
  async getClassById(classId, schoolId) {
    const classData = await getClassByIdFromDB(classId, schoolId, {
      include: [
        {
          model: Teacher,
          as: "classTeacher",
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
          model: Student,
          as: "students",
          attributes: ["student_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email"],
            },
          ],
        },
      ],
    });

    if (!classData) {
      return null;
    }

    // Sort students by name for better presentation
    if (classData.students && classData.students.length > 0) {
      classData.students.sort((a, b) => {
        const nameA = `${a.user?.first_name || ""} ${
          a.user?.last_name || ""
        }`.trim();
        const nameB = `${b.user?.first_name || ""} ${
          b.user?.last_name || ""
        }`.trim();
        return nameA.localeCompare(nameB);
      });
    }

    return classData;
  }

  /**
   * Create a new class
   * @param {Object} classData - Class data
   * @param {string} schoolId - School ID
   * @returns {Object} Created class data
   */
  async createClass(classData, schoolId) {
    const {
      className,
      grade,
      section,
      classTeacher,
      subjects,
      maxStudents,
      room,
      schedule,
    } = classData;

    // Check if class name already exists for this school
    const existingClass = await Class.findOne({
      where: {
        class_name: className,
        schoolId: schoolId,
        is_active: true,
      },
    });
    if (existingClass) {
      throw new Error("Class name already exists in this school");
    }

    // Check if grade-section combination already exists for this school
    if (grade && section) {
      const existingGradeSection = await Class.findOne({
        where: {
          grade,
          section,
          schoolId: schoolId,
          is_active: true,
        },
      });
      if (existingGradeSection) {
        throw new Error(
          "Grade-Section combination already exists in this school"
        );
      }
    }

    // Create class data object
    const newClassData = {
      class_name: className,
      grade,
      section,
      class_teacher_id: classTeacher,
      max_students: maxStudents,
      room,
      schedule,
    };

    // Create class
    const newClass = await createClassInDB(newClassData, schoolId);

    // Fetch created class with associations for response
    return await Class.findByPk(newClass.id, {
      include: [
        {
          model: Teacher,
          as: "classTeacher",
          attributes: ["teacher_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email"],
            },
          ],
        },
      ],
    });
  }

  /**
   * Update class by ID
   * @param {string} classId - Class ID
   * @param {Object} updateData - Data to update
   * @param {string} schoolId - School ID
   * @returns {Object} Updated class data
   */
  async updateClass(classId, updateData, schoolId) {
    // First check if class exists
    const existingClass = await getClassByIdFromDB(classId, schoolId);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    // Check for conflicts if updating className
    if (
      updateData.className &&
      updateData.className !== existingClass.class_name
    ) {
      const classNameExists = await Class.findOne({
        where: {
          class_name: updateData.className,
          schoolId: schoolId,
          is_active: true,
          id: { [Op.ne]: existingClass.id }, // Exclude current class
        },
      });
      if (classNameExists) {
        throw new Error("Class name already exists in this school");
      }
    }

    // Check for grade-section conflicts
    if (
      (updateData.grade || updateData.section) &&
      (updateData.grade !== existingClass.grade ||
        updateData.section !== existingClass.section)
    ) {
      const grade = updateData.grade || existingClass.grade;
      const section = updateData.section || existingClass.section;

      const gradeSectionExists = await Class.findOne({
        where: {
          grade,
          section,
          schoolId: schoolId,
          is_active: true,
          id: { [Op.ne]: existingClass.id }, // Exclude current class
        },
      });
      if (gradeSectionExists) {
        throw new Error(
          "Grade-Section combination already exists in this school"
        );
      }
    }

    // Update class
    const updateResult = await updateClassInDB(classId, updateData, schoolId);

    if (updateResult[0] === 0) {
      throw new Error("Class not found or no changes made");
    }

    // Fetch updated class with associations
    return await getClassByIdFromDB(classId, schoolId, {
      include: [
        {
          model: Teacher,
          as: "classTeacher",
          attributes: ["teacher_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email"],
            },
          ],
        },
      ],
    });
  }

  /**
   * Delete class by ID (soft delete)
   * @param {string} classId - Class ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async deleteClass(classId, schoolId) {
    // Check if class exists before deleting
    const existingClass = await getClassByIdFromDB(classId, schoolId);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    // Check if class has active students
    const activeStudents = await Student.count({
      where: {
        class_id: existingClass.id,
        is_active: true,
      },
    });

    if (activeStudents > 0) {
      throw new Error(
        `Cannot delete class. It has ${activeStudents} active students. Please move students to other classes first.`
      );
    }

    // Soft delete class
    const deleteResult = await deleteClassInDB(classId, schoolId);

    if (deleteResult[0] === 0) {
      throw new Error("Class not found or already deleted");
    }

    return true;
  }

  /**
   * Add student to class
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID
   * @param {string} schoolId - School ID
   * @returns {Object} Success message with class info
   */
  async addStudentToClass(classId, studentId, schoolId) {
    // Get class data
    const classData = await getClassByIdFromDB(classId, schoolId);
    if (!classData) {
      throw new Error("Class not found");
    }

    // Find student by either UUID or custom ID
    const student = await findByIdentifier(Student, studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Verify student belongs to the same school
    if (student.schoolId !== schoolId) {
      throw new Error("Student does not belong to your school");
    }

    // Get current student count in class
    const currentStudents = await Student.count({
      where: { class_id: classData.id, is_active: true },
    });

    // Check if class is at capacity
    if (classData.max_students && currentStudents >= classData.max_students) {
      throw new Error(
        `Class is at maximum capacity (${classData.max_students} students)`
      );
    }

    // Check if student is already in this class
    if (student.class_id === classData.id) {
      throw new Error("Student is already in this class");
    }

    // Check if student is in another active class
    if (student.class_id) {
      const currentClass = await Class.findByPk(student.class_id, {
        attributes: ["class_name", "grade", "section"],
      });
      if (currentClass) {
        throw new Error(
          `Student is already enrolled in ${currentClass.class_name} (Grade ${currentClass.grade}-${currentClass.section})`
        );
      }
    }

    // Add student to class
    await student.update({ class_id: classData.id });

    return {
      studentId: student.student_id,
      className: classData.class_name,
      grade: classData.grade,
      section: classData.section,
    };
  }

  /**
   * Get grades and class lists for a school
   * @param {string} schoolId - School ID
   * @returns {Object} Organized data by grades
   */
  async getGradesAndClasses(schoolId) {
    const classes = await getGradesAndClassesFromDB(schoolId);

    // Group classes by grade
    const gradeMap = {};

    classes.forEach((classItem) => {
      const grade = classItem.grade;

      if (!gradeMap[grade]) {
        gradeMap[grade] = {
          grade: grade,
          classes: [],
        };
      }

      gradeMap[grade].classes.push({
        class_id: classItem.class_id,
        class_name: classItem.class_name,
        section: classItem.section,
      });
    });

    // Convert to array and sort by grade
    const grades = Object.values(gradeMap).sort((a, b) => {
      // Handle numeric grades
      const gradeA = parseInt(a.grade) || a.grade;
      const gradeB = parseInt(b.grade) || b.grade;

      if (typeof gradeA === "number" && typeof gradeB === "number") {
        return gradeA - gradeB;
      }

      return a.grade.localeCompare(b.grade);
    });

    return {
      grades,
      totalGrades: grades.length,
      totalClasses: classes.length,
    };
  }
}

export default new ClassService();
