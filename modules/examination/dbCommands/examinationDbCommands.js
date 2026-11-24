import { Op } from "sequelize";
import {
  Exam,
  ExamSubject,
  Result,
  Student,
  User,
  Subject,
} from "@school-management/backend-core/models/index.js";
import {
  findAllBySchool,
  findByCustomIdAndSchool,
  createWithSchool,
  updateByCustomIdAndSchool,
} from "../../admission/dbCommands/genericDbCommands.js";

const examInclude = [
  {
    model: ExamSubject,
    as: "examSubjects",
    where: { isActive: true },
    required: false,
    include: [
      {
        model: Subject,
        as: "subject",
        attributes: ["subjectId", "subjectName", "subjectCode"],
      },
    ],
  },
];

/* ---------- Exam ---------- */

export const listExams = (schoolId, filters = {}) => {
  const where = { isActive: true };
  if (filters.gradeId) where.gradeId = filters.gradeId;
  if (filters.academicYear) where.academicYear = filters.academicYear;
  if (filters.examType) where.examType = filters.examType;
  if (filters.status) where.status = filters.status;
  return findAllBySchool(Exam, schoolId, where, {
    include: examInclude,
    order: [["created_at", "DESC"]],
  });
};

export const findExamByCustomId = (examId, schoolId) =>
  findByCustomIdAndSchool(Exam, examId, schoolId, "examId", {
    include: examInclude,
  });

export const createExam = (data, schoolId, options = {}) =>
  createWithSchool(Exam, data, schoolId, options);

export const updateExam = (examId, data, schoolId) =>
  updateByCustomIdAndSchool(Exam, data, examId, schoolId, "examId");

export const softDeleteExam = (examId, schoolId) =>
  updateByCustomIdAndSchool(
    Exam,
    { isActive: false },
    examId,
    schoolId,
    "examId",
  );

/* ---------- ExamSubject ---------- */

export const bulkCreateExamSubjects = (rows, options = {}) =>
  ExamSubject.bulkCreate(rows, options);

export const findExamSubjectsByExamId = (examId, schoolId) =>
  ExamSubject.findAll({
    where: { examId, schoolId, isActive: true },
    include: [
      {
        model: Subject,
        as: "subject",
        attributes: ["subjectId", "subjectName", "subjectCode"],
      },
    ],
    order: [["exam_date", "ASC"]],
  });

export const updateExamSubject = (examSubjectId, data, schoolId) =>
  ExamSubject.update(data, { where: { examSubjectId, schoolId } });

export const softDeleteExamSubject = (examSubjectId, schoolId) =>
  ExamSubject.update(
    { isActive: false },
    { where: { examSubjectId, schoolId } },
  );

/* ---------- Results ---------- */

export const upsertResults = async (rows) => {
  // The unique constraint `results_exam_subject_student_unique` is what makes
  // this an upsert — without `conflictAttributes` Sequelize would default the
  // ON CONFLICT target to the primary key (`id` UUID), which never collides
  // because every row gets a fresh UUID at INSERT time.
  return Result.bulkCreate(rows, {
    updateOnDuplicate: [
      "marksObtained",
      "percentage",
      "grade",
      "status",
      "remarks",
      "isPublished",
      "updated_at",
    ],
    conflictAttributes: ["examSubjectId", "studentId"],
  });
};

export const findResultsByExam = (examId, schoolId) =>
  Result.findAll({
    where: { examId, schoolId },
    include: [
      {
        model: ExamSubject,
        as: "examSubject",
        include: [
          {
            model: Subject,
            as: "subject",
            attributes: ["subjectId", "subjectName", "subjectCode"],
          },
        ],
      },
    ],
  });

// Match the academic year flexibly: by linked id, by exact name, or by any
// equivalent name form (e.g. "2026", "2026-27", "2026-2027").
const buildExamYearWhere = (schoolId, filters = {}) => {
  const examWhere = { schoolId, isActive: true };

  const yearMatches = [];
  if (filters.academicYear) {
    yearMatches.push({ academicYear: filters.academicYear });
  }
  if (Array.isArray(filters.academicYearNames)) {
    for (const name of filters.academicYearNames) {
      if (name) yearMatches.push({ academicYear: name });
    }
  }
  if (filters.academicYearId) {
    yearMatches.push({ academicYearId: filters.academicYearId });
  }
  if (yearMatches.length > 0) examWhere[Op.or] = yearMatches;

  return examWhere;
};

const resultIncludes = (examWhere) => [
  {
    model: Exam,
    as: "exam",
    where: examWhere,
    attributes: ["examId", "examName", "examType", "academicYear", "status"],
  },
  {
    model: ExamSubject,
    as: "examSubject",
    attributes: ["examSubjectId", "examDate", "maxMarks", "passingMarks"],
    include: [
      {
        model: Subject,
        as: "subject",
        attributes: ["subjectId", "subjectName", "subjectCode"],
      },
    ],
  },
];

export const findResultsByStudent = (studentId, schoolId, filters = {}) => {
  const examWhere = buildExamYearWhere(schoolId, filters);
  return Result.findAll({
    where: { studentId, schoolId },
    include: resultIncludes(examWhere),
    order: [[{ model: Exam, as: "exam" }, "academic_year", "DESC"]],
  });
};

/**
 * Batched version for promotion: one query for many students.
 */
export const findResultsByStudents = (studentIds, schoolId, filters = {}) => {
  const examWhere = buildExamYearWhere(schoolId, filters);
  return Result.findAll({
    where: { studentId: { [Op.in]: studentIds }, schoolId },
    include: resultIncludes(examWhere),
    order: [
      ["student_id", "ASC"],
      [{ model: Exam, as: "exam" }, "academic_year", "DESC"],
    ],
  });
};

export const findStudentsByGrade = (gradeId, schoolId) =>
  Student.findAll({
    where: { gradeId, schoolId, isActive: true },
    attributes: [
      "studentId",
      "firstName",
      "lastName",
      "rollNumber",
      "classId",
    ],
    order: [["roll_number", "ASC"]],
  });

export const findStudentByCustomId = (studentId, schoolId) =>
  Student.findOne({
    where: { studentId, schoolId, isActive: true },
    include: [{ model: User, as: "user", attributes: ["email"] }],
  });

/** Re-export Op for service-layer convenience. */
export { Op };
