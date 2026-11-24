import express from "express";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
import * as examController from "../controllers/examController.js";
import {
  validateCreateExam,
  validateUpdateExam,
  validateListExams,
  validateSubmitMarks,
  validateReportCardParams,
} from "../validators/examValidators.js";

const router = express.Router();

const ADMIN_OR_TEACHER = authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.COORDINATOR);
// Staff only. Student self-access (own results/report card) is intentionally
// not enabled here yet — it requires an ownership check, not just a role.
const ANY_AUTHED = authorize(
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.ACCOUNTANT,
);

// Common middleware stack for every route in this module
router.use(auth, populateUserHeaders);

/* ---------- Exam CRUD ---------- */
router.get("/", validateListExams, ANY_AUTHED, examController.listExams);

router.post("/", ADMIN_OR_TEACHER, validateCreateExam, examController.createExam);

router.get("/:examId", ANY_AUTHED, examController.getExam);

router.put(
  "/:examId",
  ADMIN_OR_TEACHER,
  validateUpdateExam,
  examController.updateExam,
);

router.delete(
  "/:examId",
  authorize(ROLES.ADMIN),
  examController.deleteExam,
);

/* ---------- Students enrolled in an exam's grade ---------- */
router.get(
  "/:examId/students",
  ADMIN_OR_TEACHER,
  examController.getStudentsForExam,
);

/* ---------- Marks entry ---------- */
router.post(
  "/:examId/subjects/:examSubjectId/marks",
  ADMIN_OR_TEACHER,
  validateSubmitMarks,
  examController.submitMarks,
);

router.get("/:examId/results", ANY_AUTHED, examController.getResults);

/* ---------- Report card ---------- */
router.get(
  "/students/:studentId/report-card",
  ANY_AUTHED,
  validateReportCardParams,
  examController.getReportCard,
);

export default router;
