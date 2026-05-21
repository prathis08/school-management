import express from "express";
import {
  auth,
  authorize,
  populateUserHeaders,
  requireFeature,
  DASHBOARD_FEATURES,
  ROLES,
} from "@school-management/backend-core";
import {
  startDuesExport,
  getDuesExportStatus,
  downloadDuesExport,
} from "../controllers/feeDuesExportController.js";

const router = express.Router();

// POST /api/fees/export/dues — kick off dues export (entire school or single class)
router.post(
  "/export/dues",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  startDuesExport,
);

// GET /api/fees/export/dues/status/:jobId
router.get(
  "/export/dues/status/:jobId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  getDuesExportStatus,
);

// GET /api/fees/export/dues/download/:jobId
router.get(
  "/export/dues/download/:jobId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  downloadDuesExport,
);

export default router;
