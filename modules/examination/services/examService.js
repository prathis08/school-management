import { getSequelize } from "../../backend-core/config/database.js";
import {
  RESULT_STATUS,
  EXAM_STATUS,
  gradeFromPercentage,
} from "../constants/examinationConstants.js";
import * as db from "../dbCommands/examinationDbCommands.js";

/**
 * Create an exam header + its subject rows in one transaction.
 *
 * @param {Object} payload
 * @param {string} payload.examName
 * @param {"EXAM"|"REGULAR_ASSESSMENT"} payload.examType
 * @param {string} payload.gradeId
 * @param {string} payload.academicYear
 * @param {string} [payload.instructions]
 * @param {Array<{subjectId:string, examDate:string, startTime?:string,
 *                endTime?:string, maxMarks:number, passingMarks:number}>} payload.subjects
 * @param {string} schoolId
 * @param {string} [createdByUserId]
 */
export const createExamWithSubjects = async (
  payload,
  schoolId,
  createdByUserId,
) => {
  const sequelize = getSequelize();

  // Insert exam + subjects inside one transaction so they're atomic.
  // The follow-up SELECT must run AFTER commit — otherwise it executes outside
  // the transaction's visibility and returns null on most isolation levels.
  const createdExamId = await sequelize.transaction(async (t) => {
    const exam = await db.createExam(
      {
        examName: payload.examName,
        examType: payload.examType,
        gradeId: payload.gradeId,
        grade: payload.grade,
        classId: payload.classId || null,
        className: payload.className || null,
        academicYear: payload.academicYear,
        academicYearId: payload.academicYearId || null,
        instructions: payload.instructions || null,
        status: payload.status || EXAM_STATUS.SCHEDULED,
        createdByUserId: createdByUserId || null,
      },
      schoolId,
      { transaction: t },
    );

    const rows = payload.subjects.map((s) => ({
      schoolId,
      examId: exam.examId,
      subjectId: s.subjectId,
      examDate: s.examDate,
      startTime: s.startTime || null,
      endTime: s.endTime || null,
      maxMarks: s.maxMarks,
      passingMarks: s.passingMarks,
    }));

    if (rows.length > 0) {
      await db.bulkCreateExamSubjects(rows, { transaction: t });
    }

    return exam.examId;
  });

  return db.findExamByCustomId(createdExamId, schoolId);
};

export const listExams = (schoolId, filters) => db.listExams(schoolId, filters);

export const getExam = (examId, schoolId) =>
  db.findExamByCustomId(examId, schoolId);

export const updateExam = async (examId, data, schoolId) => {
  await db.updateExam(examId, data, schoolId);
  return db.findExamByCustomId(examId, schoolId);
};

export const deleteExam = (examId, schoolId) =>
  db.softDeleteExam(examId, schoolId);

/* ---------- Students for an exam ---------- */

export const getStudentsForExam = async (examId, schoolId) => {
  const exam = await db.findExamByCustomId(examId, schoolId);
  if (!exam) return { exam: null, students: [] };
  const students = await db.findStudentsByGrade(exam.gradeId, schoolId);
  return { exam, students };
};

/* ---------- Marks entry ---------- */

const computeDerived = (marksObtained, maxMarks, passingMarks) => {
  if (marksObtained == null || marksObtained === "") {
    return { percentage: null, grade: null, status: RESULT_STATUS.ABSENT };
  }
  const marks = Number(marksObtained);
  const max = Number(maxMarks);
  const pass = Number(passingMarks);
  const percentage = max > 0 ? Number(((marks / max) * 100).toFixed(2)) : 0;
  return {
    percentage,
    grade: gradeFromPercentage(percentage),
    status: marks >= pass ? RESULT_STATUS.PASS : RESULT_STATUS.FAIL,
  };
};

/**
 * Bulk-submit marks for one exam-subject.
 *
 * @param {string} examId
 * @param {string} examSubjectId
 * @param {Array<{studentId:string, marksObtained?:number|null,
 *                status?:"PASS"|"FAIL"|"ABSENT", remarks?:string}>} entries
 * @param {string} schoolId
 */
export const submitMarks = async (
  examId,
  examSubjectId,
  entries,
  schoolId,
) => {
  const exam = await db.findExamByCustomId(examId, schoolId);
  if (!exam) throw new Error("Exam not found");

  const examSubject = (exam.examSubjects || []).find(
    (es) => es.examSubjectId === examSubjectId,
  );
  if (!examSubject) throw new Error("Subject not part of this exam");

  const rows = entries.map((entry) => {
    const derived =
      entry.status === RESULT_STATUS.ABSENT
        ? {
            percentage: null,
            grade: null,
            status: RESULT_STATUS.ABSENT,
          }
        : computeDerived(
            entry.marksObtained,
            examSubject.maxMarks,
            examSubject.passingMarks,
          );
    return {
      schoolId,
      examId,
      examSubjectId,
      studentId: entry.studentId,
      marksObtained:
        derived.status === RESULT_STATUS.ABSENT ? null : entry.marksObtained,
      percentage: derived.percentage,
      grade: derived.grade,
      status: entry.status || derived.status,
      remarks: entry.remarks || null,
    };
  });

  await db.upsertResults(rows);
  return db.findResultsByExam(examId, schoolId);
};

export const getResultsForExam = (examId, schoolId) =>
  db.findResultsByExam(examId, schoolId);

/* ---------- Report card ---------- */

const buildExamsFromResults = (results) => {
  const byExamId = new Map();
  for (const result of results) {
    const exam = result.exam;
    if (!exam) continue;
    if (!byExamId.has(exam.examId)) {
      byExamId.set(exam.examId, { exam, subjects: [] });
    }
    byExamId.get(exam.examId).subjects.push(result);
  }

  return Array.from(byExamId.values()).map(({ exam, subjects }) => {
    let obtained = 0;
    let max = 0;
    let anyFail = false;
    let anyAbsent = false;
    for (const subject of subjects) {
      const marks = Number(subject.marksObtained) || 0;
      const subjectMax = Number(subject.examSubject?.maxMarks) || 0;
      obtained += subject.status === RESULT_STATUS.ABSENT ? 0 : marks;
      max += subjectMax;
      if (subject.status === RESULT_STATUS.FAIL) anyFail = true;
      if (subject.status === RESULT_STATUS.ABSENT) anyAbsent = true;
    }
    const percentage =
      max > 0 ? Number(((obtained / max) * 100).toFixed(2)) : 0;
    const overallStatus = anyFail
      ? RESULT_STATUS.FAIL
      : anyAbsent
        ? RESULT_STATUS.ABSENT
        : RESULT_STATUS.PASS;
    return {
      exam,
      subjects,
      totals: {
        obtained,
        max,
        percentage,
        grade: gradeFromPercentage(percentage),
        overallStatus,
      },
    };
  });
};

/**
 * Build a student's report card grouped by exam.
 * Returns { student, exams: [{ exam, subjects: [{ ...result }],
 *           totals: { obtained, max, percentage, grade, overallStatus } }] }
 */
export const getStudentReportCard = async (
  studentId,
  schoolId,
  filters = {},
) => {
  const student = await db.findStudentByCustomId(studentId, schoolId);
  if (!student) return null;

  const results = await db.findResultsByStudent(studentId, schoolId, filters);
  return { student, exams: buildExamsFromResults(results) };
};

/**
 * Batched report cards for a list of students (one results query).
 * @returns {Promise<Map<string, Array>>} studentId -> exams[]
 */
export const getStudentReportCards = async (
  studentIds,
  schoolId,
  filters = {},
) => {
  const map = new Map();
  if (!studentIds || studentIds.length === 0) return map;

  const results = await db.findResultsByStudents(
    studentIds,
    schoolId,
    filters,
  );

  const byStudent = new Map();
  for (const result of results) {
    if (!byStudent.has(result.studentId)) byStudent.set(result.studentId, []);
    byStudent.get(result.studentId).push(result);
  }

  for (const studentId of studentIds) {
    map.set(studentId, buildExamsFromResults(byStudent.get(studentId) || []));
  }
  return map;
};
