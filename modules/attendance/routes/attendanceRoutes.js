import express from "express";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
import * as attendanceController from "../controllers/attendanceController.js";
import {
  validateRoster,
  validateMarkAttendance,
  validateStudentHistory,
  validateSummary,
} from "../validators/attendanceValidators.js";

const router = express.Router();

const ADMIN_OR_TEACHER = authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.COORDINATOR);
// Staff only. Students must not read peers' attendance.
const ANY_AUTHED = authorize(
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.COORDINATOR,
);

router.use(auth, populateUserHeaders);

// Summary for a class (or whole school) over a date range
router.get("/summary", validateSummary, ANY_AUTHED, attendanceController.getSummary);

// Class roster for a date, merged with existing attendance
router.get(
  "/class/:classId",
  validateRoster,
  ANY_AUTHED,
  attendanceController.getClassRoster,
);

// Bulk mark / update attendance
router.post(
  "/mark",
  ADMIN_OR_TEACHER,
  validateMarkAttendance,
  attendanceController.markAttendance,
);

// A single student's attendance history
router.get(
  "/student/:studentId",
  validateStudentHistory,
  ANY_AUTHED,
  attendanceController.getStudentHistory,
);

export default router;
