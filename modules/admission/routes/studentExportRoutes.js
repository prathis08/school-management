import express from "express";
import {
  startStudentExport,
  getStudentExportStatus,
  downloadStudentExport,
} from "../controllers/studentExportController.js";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";

const router = express.Router();

// POST /api/students/export — kick off an export job
router.post(
  "/export",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  startStudentExport,
);

// GET /api/students/export/status/:jobId — poll job status
router.get(
  "/export/status/:jobId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  getStudentExportStatus,
);

// GET /api/students/export/download/:jobId — download generated file
router.get(
  "/export/download/:jobId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  downloadStudentExport,
);

export default router;
