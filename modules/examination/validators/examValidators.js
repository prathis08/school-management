import { body, param, query } from "express-validator";
import {
  getExamTypeValues,
  getExamStatusValues,
  getResultStatusValues,
} from "../constants/examinationConstants.js";

export const validateCreateExam = [
  body("examName")
    .trim()
    .notEmpty()
    .withMessage("Exam name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Exam name must be 2-150 chars"),

  body("examType")
    .isIn(getExamTypeValues())
    .withMessage(`examType must be one of: ${getExamTypeValues().join(", ")}`),

  body("gradeId").trim().notEmpty().withMessage("gradeId is required"),

  body("grade").trim().notEmpty().withMessage("grade name is required"),

  body("classId").optional({ nullable: true }).isString(),

  body("className").optional({ nullable: true }).isString(),

  body("academicYear")
    .trim()
    .notEmpty()
    .withMessage("academicYear is required"),

  body("academicYearId").optional({ nullable: true }).isString(),

  body("status")
    .optional()
    .isIn(getExamStatusValues())
    .withMessage(`status must be one of: ${getExamStatusValues().join(", ")}`),

  body("instructions").optional().isString(),

  body("subjects")
    .isArray({ min: 1 })
    .withMessage("subjects must be a non-empty array"),

  body("subjects.*.subjectId")
    .trim()
    .notEmpty()
    .withMessage("subjectId is required for each subject"),

  body("subjects.*.examDate")
    .isISO8601()
    .withMessage("examDate must be an ISO date (YYYY-MM-DD)"),

  body("subjects.*.maxMarks")
    .isFloat({ gt: 0 })
    .withMessage("maxMarks must be a positive number"),

  body("subjects.*.passingMarks")
    .isFloat({ min: 0 })
    .withMessage("passingMarks must be >= 0")
    .custom((value, { req, path }) => {
      // path looks like "subjects[3].passingMarks"
      const idx = Number(path.match(/\[(\d+)\]/)?.[1]);
      const subject = req.body.subjects?.[idx];
      if (subject && Number(value) > Number(subject.maxMarks)) {
        throw new Error("passingMarks cannot exceed maxMarks");
      }
      return true;
    }),

  body("subjects.*.startTime")
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage("startTime must be HH:MM"),

  body("subjects.*.endTime")
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage("endTime must be HH:MM"),
];

export const validateUpdateExam = [
  param("examId").trim().notEmpty(),
  body("examName").optional().isLength({ min: 2, max: 150 }),
  body("examType").optional().isIn(getExamTypeValues()),
  body("status").optional().isIn(getExamStatusValues()),
  body("instructions").optional().isString(),
];

export const validateListExams = [
  query("gradeId").optional().isString(),
  query("academicYear").optional().isString(),
  query("examType").optional().isIn(getExamTypeValues()),
  query("status").optional().isIn(getExamStatusValues()),
];

export const validateSubmitMarks = [
  param("examId").trim().notEmpty(),
  param("examSubjectId").trim().notEmpty(),
  body("entries")
    .isArray({ min: 1 })
    .withMessage("entries must be a non-empty array"),
  body("entries.*.studentId").trim().notEmpty(),
  body("entries.*.marksObtained")
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  body("entries.*.status").optional().isIn(getResultStatusValues()),
  body("entries.*.remarks").optional().isString(),
];

export const validateReportCardParams = [
  param("studentId").trim().notEmpty(),
  query("academicYear").optional().isString(),
];
