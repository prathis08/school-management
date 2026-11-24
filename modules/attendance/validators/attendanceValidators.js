import { body, param, query } from "express-validator";
import { ATTENDANCE_STATUS_VALUES } from "../constants/attendanceConstants.js";

const isoDate = (field, location = body) =>
  location(field)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(`${field} must be an ISO date (YYYY-MM-DD)`);

export const validateRoster = [
  param("classId").trim().notEmpty().withMessage("classId is required"),
  isoDate("date", query),
  query("period").optional().isString(),
];

export const validateMarkAttendance = [
  body("classId").trim().notEmpty().withMessage("classId is required"),
  body("date")
    .isISO8601()
    .withMessage("date must be an ISO date (YYYY-MM-DD)"),
  body("period").optional().isString(),
  body("entries")
    .isArray({ min: 1 })
    .withMessage("entries must be a non-empty array"),
  body("entries.*.studentId")
    .trim()
    .notEmpty()
    .withMessage("studentId is required for each entry"),
  body("entries.*.status")
    .isIn(ATTENDANCE_STATUS_VALUES)
    .withMessage(`status must be one of: ${ATTENDANCE_STATUS_VALUES.join(", ")}`),
  body("entries.*.remarks").optional({ nullable: true }).isString(),
];

export const validateStudentHistory = [
  param("studentId").trim().notEmpty(),
  isoDate("from", query),
  isoDate("to", query),
];

export const validateSummary = [
  query("classId").optional().isString(),
  isoDate("from", query),
  isoDate("to", query),
];
