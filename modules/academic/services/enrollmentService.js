import { ENROLLMENT_STATUS } from "../constants/academicConstants.js";
import * as db from "../dbCommands/academicDbCommands.js";

/**
 * Ensure a student has an enrollment row for the given academic year, seeding
 * it from their current class/grade when it doesn't exist yet.
 */
export const ensureEnrollment = async (
  studentId,
  academicYearId,
  schoolId,
  options = {},
) => {
  const existing = await db.findEnrollmentByStudentYear(
    studentId,
    academicYearId,
    schoolId,
    options,
  );
  if (existing) return existing;

  const [student, year] = await Promise.all([
    db.findStudentById(studentId, schoolId),
    db.findAcademicYear(academicYearId, schoolId),
  ]);
  if (!student) throw new Error("Student not found");
  if (!year) throw new Error("Academic year not found");

  const cls = student.classId
    ? await db.findClassById(schoolId, student.classId)
    : null;

  return db.createEnrollment(
    {
      studentId,
      academicYearId,
      academicYearName: year.name,
      classId: student.classId || null,
      className: cls?.className || null,
      gradeId: student.gradeId || cls?.gradeId || null,
      grade: cls?.grade || null,
      status: ENROLLMENT_STATUS.ENROLLED,
    },
    schoolId,
    options,
  );
};

export const listEnrollments = (schoolId, filters = {}) =>
  db.findEnrollments(schoolId, filters);

export const listForStudent = (studentId, schoolId) =>
  db.findEnrollmentsByStudent(studentId, schoolId);

export const createEnrollmentForStudent = (
  studentId,
  academicYearId,
  schoolId,
  extra = {},
) => ensureEnrollment(studentId, academicYearId, schoolId, extra);
