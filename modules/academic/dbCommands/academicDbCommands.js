import { Op } from "sequelize";
import {
  AcademicYear,
  Attendance,
  Class,
  PromotionRule,
  Student,
  StudentEnrollment,
} from "@school-management/backend-core/models/index.js";

/* ---------- Academic years ---------- */

export const findAcademicYear = (academicYearId, schoolId) =>
  AcademicYear.findOne({ where: { academicYearId, schoolId } });

export const findActiveAcademicYear = (schoolId) =>
  AcademicYear.findOne({ where: { schoolId, isActive: true } });

export const listAcademicYears = (schoolId) =>
  AcademicYear.findAll({
    where: { schoolId },
    order: [["start_date", "ASC"]],
  });

export const findNextAcademicYear = (schoolId, afterStartDate) =>
  AcademicYear.findOne({
    where: { schoolId, startDate: { [Op.gt]: afterStartDate } },
    order: [["start_date", "ASC"]],
  });

export const createAcademicYear = (data, schoolId, options = {}) =>
  AcademicYear.create({ ...data, schoolId }, options);

export const deactivateOtherYears = (schoolId, keepId, options = {}) =>
  AcademicYear.update(
    { isActive: false },
    { where: { schoolId, academicYearId: { [Op.ne]: keepId } }, ...options },
  );

/* ---------- Enrollment ---------- */

export const findEnrollments = (schoolId, filters = {}) => {
  const where = { schoolId, isActive: true };
  if (filters.academicYearId) where.academicYearId = filters.academicYearId;
  if (filters.gradeId) where.gradeId = filters.gradeId;
  if (filters.classId) where.classId = filters.classId;
  if (filters.studentId) where.studentId = filters.studentId;
  return StudentEnrollment.findAll({
    where,
    order: [["created_at", "ASC"]],
  });
};

export const findEnrollmentByStudentYear = (
  studentId,
  academicYearId,
  schoolId,
  options = {},
) =>
  StudentEnrollment.findOne({
    where: { studentId, academicYearId, schoolId },
    ...options,
  });

export const findEnrollmentsByStudent = (studentId, schoolId) =>
  StudentEnrollment.findAll({
    where: { studentId, schoolId, isActive: true },
    order: [["created_at", "ASC"]],
  });

export const createEnrollment = (data, schoolId, options = {}) =>
  StudentEnrollment.create({ ...data, schoolId }, options);

/* ---------- Promotion rule ---------- */

export const findPromotionRule = (schoolId) =>
  PromotionRule.findOne({ where: { schoolId } });

export const createPromotionRule = (data, schoolId) =>
  PromotionRule.create({ ...data, schoolId });

/* ---------- Students / classes ---------- */

export const findStudentById = (studentId, schoolId, options = {}) =>
  Student.findOne({ where: { studentId, schoolId, isActive: true }, ...options });

export const findStudentsByGrade = (schoolId, gradeId, classId) => {
  const where = { schoolId, gradeId, isActive: true };
  if (classId) where.classId = classId;
  return Student.findAll({
    where,
    attributes: [
      "studentId",
      "firstName",
      "lastName",
      "name",
      "rollNumber",
      "classId",
      "gradeId",
    ],
    order: [["roll_number", "ASC"]],
  });
};

const gradeSortValue = (gradeId, grade) => {
  const m = String(grade || gradeId || "").match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
};

/**
 * Distinct grades for a school, sorted ascending (numeric where possible).
 * @returns {Promise<Array<{gradeId:string, grade:string}>>}
 */
export const getGradeOrder = async (schoolId) => {
  const rows = await Class.findAll({
    where: { schoolId, isActive: true },
    attributes: ["gradeId", "grade"],
    group: ["grade_id", "grade"],
  });
  const list = rows.map((r) => ({
    gradeId: r.gradeId,
    grade: r.grade || r.gradeId,
  }));
  list.sort(
    (a, b) =>
      gradeSortValue(a.gradeId, a.grade) - gradeSortValue(b.gradeId, b.grade) ||
      String(a.grade).localeCompare(String(b.grade)),
  );
  return list;
};

export const findClassById = (schoolId, classId) =>
  Class.findOne({ where: { schoolId, classId, isActive: true } });

export const findAllClasses = (schoolId) =>
  Class.findAll({
    where: { schoolId, isActive: true },
    attributes: ["classId", "className", "grade", "gradeId", "section"],
  });

export const getFirstClassForGrade = (schoolId, gradeId, options = {}) =>
  Class.findOne({
    where: { schoolId, gradeId, isActive: true },
    order: [["class_name", "ASC"]],
    ...options,
  });

/* ---------- Attendance ---------- */

const attendanceWhere = (schoolId, from, to) => {
  const where = { schoolId, isActive: true };
  if (from || to) {
    where.date = {};
    if (from) where.date[Op.gte] = from;
    if (to) where.date[Op.lte] = to;
  }
  return where;
};

export const findStudentAttendance = (studentId, schoolId, from, to) =>
  Attendance.findAll({
    where: { ...attendanceWhere(schoolId, from, to), studentId },
  });

/** Batched attendance for a set of students (one query). */
export const findAttendanceByStudents = (studentIds, schoolId, from, to) =>
  Attendance.findAll({
    where: {
      ...attendanceWhere(schoolId, from, to),
      studentId: { [Op.in]: studentIds },
    },
  });

export { Op };
