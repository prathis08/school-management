import express from "express";
import {
  auth,
  authorize,
  populateUserHeaders,
  requireFeature,
  DASHBOARD_FEATURES,
} from "@school-management/backend-core";
import { ROLES } from "@school-management/backend-core";
import {
  createFeeStructure,
  getFeeStructures,
  getStudentsWithFees,
  updateFeeStructure,
  deleteFeeStructure,
  recordPayment,
  getPaymentHistory,
  generateFeeReport,
  getFeeTypes,
  getPaymentMethods,
} from "../controllers/feeController.js";

const router = express.Router();

// Fee Structure Management
router.post(
  "/create-fee-structure",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  createFeeStructure
);
router.get(
  "/get-fee-structures",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getFeeStructures
);

router.get(
  "/get-students-with-fees",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getStudentsWithFees
);

router.put(
  "/update-fee-structure/:id",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  updateFeeStructure
);
router.delete(
  "/delete-fee-structure/:feeStructureId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteFeeStructure
);

// Payment Management
router.post(
  "/record-payment",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  recordPayment
);
router.get(
  "/get-payment-history/:studentId",
  auth,
  populateUserHeaders,
  getPaymentHistory
);

// Reports
router.get(
  "/generate-fee-report",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  generateFeeReport
);

// Fee Configuration
router.get(
  "/fee-types",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  getFeeTypes
);

router.get(
  "/payment-methods",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getPaymentMethods
);

export default router;
