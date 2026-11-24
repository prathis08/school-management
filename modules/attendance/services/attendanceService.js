import { ATTENDANCE_STATUS, DEFAULT_PERIOD } from "../constants/attendanceConstants.js";
import * as db from "../dbCommands/attendanceDbCommands.js";

const today = () => new Date().toISOString().slice(0, 10);

const buildRecordMap = (records, period = DEFAULT_PERIOD) => {
  const map = new Map();
  for (const record of records) {
    if (record.period !== period) continue;
    map.set(record.studentId, record);
  }
  return map;
};

/**
 * Return the class roster for a date, merging each student with their existing
 * attendance. Students with no record remain UNMARKED (status null) so a save
 * can never accidentally mark absentees present.
 */
export const getClassRoster = async (classId, schoolId, date, period) => {
  const cls = await db.findClassById(classId, schoolId);
  if (!cls) return null;

  const effectiveDate = date || today();
  const effectivePeriod = period || DEFAULT_PERIOD;

  const [students, records] = await Promise.all([
    db.findStudentsByClass(classId, schoolId),
    db.findAttendanceByClassDate(classId, schoolId, effectiveDate),
  ]);

  const byStudent = buildRecordMap(records, effectivePeriod);

  const roster = students.map((student) => {
    const record = byStudent.get(student.studentId);
    const json = student.toJSON ? student.toJSON() : { ...student };
    return {
      ...json,
      stdId: student.studentId,
      marked: Boolean(record),
      status: record ? record.status : null,
      remarks: record ? record.remarks || "" : "",
      attendanceId: record ? record.attendanceId : null,
    };
  });

  return {
    class: cls,
    date: effectiveDate,
    period: effectivePeriod,
    students: roster,
  };
};

/**
 * Bulk mark attendance for a class on a date. Each entry is upserted by
 * (studentId, date, period), so re-submitting the roster updates existing rows.
 */
export const markAttendance = async (payload, schoolId, markedByUserId) => {
  const { classId, date, entries, period } = payload;

  const cls = await db.findClassById(classId, schoolId);
  if (!cls) throw new Error("Class not found");

  const students = await db.findStudentsByClass(classId, schoolId);
  const validStudentIds = new Set(students.map((s) => s.studentId));

  const invalid = entries
    .map((entry) => entry.studentId)
    .filter((studentId) => !validStudentIds.has(studentId));
  if (invalid.length > 0) {
    throw new Error(
      `Students not enrolled in this class: ${invalid.join(", ")}`,
    );
  }

  const effectiveDate = date || today();
  const effectivePeriod = period || DEFAULT_PERIOD;

  const rows = entries.map((entry) => ({
    schoolId,
    studentId: entry.studentId,
    classId,
    gradeId: cls.gradeId || null,
    date: effectiveDate,
    period: effectivePeriod,
    status: entry.status,
    remarks: entry.remarks || null,
    markedByUserId: markedByUserId || null,
  }));

  await db.upsertAttendance(rows);

  return getClassRoster(classId, schoolId, effectiveDate, effectivePeriod);
};

export const getStudentHistory = (studentId, schoolId, filters = {}) =>
  db.findAttendanceByStudent(studentId, schoolId, filters);

/**
 * Aggregate attendance counts for a class (or whole school) over a date range.
 */
export const getSummary = async (schoolId, filters = {}) => {
  const records = await db.findAttendanceByRange(schoolId, filters);

  const counts = {
    [ATTENDANCE_STATUS.PRESENT]: 0,
    [ATTENDANCE_STATUS.ABSENT]: 0,
    [ATTENDANCE_STATUS.LATE]: 0,
    [ATTENDANCE_STATUS.EXCUSED]: 0,
  };

  for (const record of records) {
    if (counts[record.status] !== undefined) counts[record.status] += 1;
  }

  const total = records.length;
  const attended = counts.PRESENT + counts.LATE;
  const percentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

  return {
    total,
    ...counts,
    percentage,
    classId: filters.classId || null,
    from: filters.from || null,
    to: filters.to || null,
  };
};

export { today };
