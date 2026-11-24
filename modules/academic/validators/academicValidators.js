import { body, param, query } from "express-validator";
import { PROMOTION_OUTCOME_ON_FAIL_VALUES } from "../constants/academicConstants.js";

export const validateCreateEnrollment = [
  body("studentId").trim().notEmpty().withMessage("studentId is required"),
  body("academicYearId")
    .trim()
    .notEmpty()
    .withMessage("academicYearId is required"),
];

export const validateEnrollmentList = [
  query("academicYearId").optional().isString(),
  query("gradeId").optional().isString(),
  query("classId").optional().isString(),
  query("studentId").optional().isString(),
];

export const validateStudentParam = [param("studentId").trim().notEmpty()];

export const validatePromotionRule = [
  body("minOverallPercentage").optional().isFloat({ min: 0, max: 100 }),
  body("mustPassAllSubjects").optional().isBoolean(),
  body("maxFailedSubjects").optional().isInt({ min: 0 }),
  body("minAttendancePercentage").optional().isFloat({ min: 0, max: 100 }),
  body("outcomeOnFail")
    .optional()
    .isIn(PROMOTION_OUTCOME_ON_FAIL_VALUES)
    .withMessage(
      `outcomeOnFail must be one of: ${PROMOTION_OUTCOME_ON_FAIL_VALUES.join(", ")}`,
    ),
];

export const validatePreview = [
  query("academicYearId")
    .trim()
    .notEmpty()
    .withMessage("academicYearId is required"),
  query("gradeId").trim().notEmpty().withMessage("gradeId is required"),
  query("classId").optional().isString(),
];

export const validateRun = [
  body("academicYearId")
    .trim()
    .notEmpty()
    .withMessage("academicYearId is required"),
  body("gradeId").trim().notEmpty().withMessage("gradeId is required"),
  body("classId").optional({ nullable: true }).isString(),
  body("targetAcademicYearId").optional({ nullable: true }).isString(),
  body("includeNoResults").optional().isBoolean(),
];
