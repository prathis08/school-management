import { Op } from "sequelize";
import {
  Attendance,
  Class,
  Student,
} from "@school-management/backend-core/models/index.js";

/* ---------- Class roster ---------- */

export const findClassById = (classId, schoolId) =>
  Class.findOne({ where: { classId, schoolId, isActive: true } });

export const findStudentsByClass = (classId, schoolId) =>
  Student.findAll({
    where: { classId, schoolId, isActive: true },
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

/* ---------- Attendance records ---------- */

export const findAttendanceByClassDate = (classId, schoolId, date) =>
  Attendance.findAll({
    where: { classId, schoolId, date, isActive: true },
  });

export const findAttendanceByStudent = (studentId, schoolId, filters = {}) => {
  const where = { studentId, schoolId, isActive: true };
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date[Op.gte] = filters.from;
    if (filters.to) where.date[Op.lte] = filters.to;
  }
  return Attendance.findAll({
    where,
    order: [["date", "DESC"]],
  });
};

export const findAttendanceByRange = (schoolId, filters = {}) => {
  const where = { schoolId, isActive: true };
  if (filters.classId) where.classId = filters.classId;
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date[Op.gte] = filters.from;
    if (filters.to) where.date[Op.lte] = filters.to;
  }
  return Attendance.findAll({ where });
};

/**
 * Insert or update attendance rows. The unique constraint on
 * (student_id, date, period) is what makes this an upsert.
 */
export const upsertAttendance = (rows) =>
  Attendance.bulkCreate(rows, {
    updateOnDuplicate: ["status", "remarks", "markedByUserId", "updated_at"],
    conflictAttributes: ["studentId", "date", "period"],
  });

export { Op };
