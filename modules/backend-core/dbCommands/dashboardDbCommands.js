import { Student, Teacher, Class } from "../models/index.js";

/**
 * Get dashboard statistics for a school
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Dashboard statistics
 */
export const getDashboardStats = async (schoolId) => {
  try {
    // Get total active students count
    const totalStudents = await Student.count({
      where: {
        schoolId: schoolId,
        is_active: true,
      },
    });

    // Get total active teachers count
    const totalTeachers = await Teacher.count({
      where: {
        schoolId: schoolId,
        is_active: true,
      },
    });

    // Get total active classes count
    const totalClasses = await Class.count({
      where: {
        schoolId: schoolId,
        is_active: true,
      },
    });

    return {
      totalClasses,
      totalStudents,
      totalTeachers,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};
