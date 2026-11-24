import express from "express";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
import * as academicController from "../controllers/academicController.js";
import {
  validateCreateEnrollment,
  validateEnrollmentList,
  validateStudentParam,
  validatePromotionRule,
  validatePreview,
  validateRun,
} from "../validators/academicValidators.js";

const router = express.Router();

const ADMIN_OR_TEACHER = authorize(
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.COORDINATOR,
);
// Staff only. Students must not enumerate peers' enrollment history.
const ANY_AUTHED = authorize(
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.ACCOUNTANT,
);

router.use(auth, populateUserHeaders);

/* ---------- Enrollment history ---------- */
router.get(
  "/enrollments",
  validateEnrollmentList,
  ANY_AUTHED,
  academicController.listEnrollments,
);

router.get(
  "/enrollments/student/:studentId",
  validateStudentParam,
  ANY_AUTHED,
  academicController.getStudentEnrollments,
);

router.post(
  "/enrollments",
  ADMIN_OR_TEACHER,
  validateCreateEnrollment,
  academicController.createEnrollment,
);

/* ---------- Promotion settings ---------- */
router.get("/promotion-rule", ANY_AUTHED, academicController.getPromotionRule);
router.put(
  "/promotion-rule",
  authorize(ROLES.ADMIN),
  validatePromotionRule,
  academicController.updatePromotionRule,
);

/* ---------- Promotions ---------- */
router.get(
  "/promotions/preview",
  ADMIN_OR_TEACHER,
  validatePreview,
  academicController.previewPromotions,
);

router.post(
  "/promotions/run",
  authorize(ROLES.ADMIN),
  validateRun,
  academicController.runPromotions,
);

export default router;
