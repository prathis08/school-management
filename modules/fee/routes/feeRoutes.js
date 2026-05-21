import express from "express";
import { body, param, query } from "express-validator";
import {
  auth,
  authorize,
  populateUserHeaders,
  requireFeature,
  DASHBOARD_FEATURES,
} from "@school-management/backend-core";
import { ROLES } from "@school-management/backend-core";
import {
  // Legacy endpoints
  createFeeStructure,
  getFeeStructures,
  getStudentsWithFees,
  updateFeeStructure,
  deleteFeeStructure,
  recordPayment,
  getPaymentHistory,
  getEnhancedPaymentHistory,
  generateFeeReport,
  getFeeTypes,
  getPaymentMethods,
  // Academic Year Management
  createAcademicYear,
  getAcademicYears,
  getActiveAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  setActiveAcademicYear,
  // Fee Type Management
  createFeeType,
  getAllFeeTypes,
  updateFeeType,
  deleteFeeType,
  // Class Fee Management
  createClassFeeStructure,
  getClassFeeStructure,
  // Installment Management
  createInstallmentSchedule,
  createDefaultQuarterlySchedule,
  createMonthlySchedule,
  getSchedulesByGrade,
  // Student Fee Assignment
  assignFeeScheduleToStudent,
  getStudentFeeAssignment,
  updateStudentFeeAssignment,
  // Enhanced Payments
  recordFeePayment,
  // Student Information
  getStudentFeeSummary,
  getStudentInstallments,
  // Reports
  getOverdueInstallments,
  getFeeCollectionReport,
  getFeesDashboardStats,
  // Constants
  getScheduleTypes,
  getInstallmentStatuses,
  // Grade Fee Structure
  createGradeFeeStructure,
  getGradeFeeStructure,
  deleteGradeFeeStructure,
  // Student Individual Fees
  createStudentIndividualFee,
  getStudentIndividualFees,
  getAllIndividualFees,
  updateStudentIndividualFee,
  deleteStudentIndividualFee,
} from "../controllers/feeController.js";
import feeDuesExportRoutes from "./feeDuesExportRoutes.js";

const router = express.Router();

// Mount dues export sub-routes (POST /export/dues, GET /export/dues/status/:jobId, GET /export/dues/download/:jobId)
router.use("/", feeDuesExportRoutes);

// Fee Structure Management
router.post(
  "/create-fee-structure",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  createFeeStructure,
);
router.get(
  "/get-fee-structures",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getFeeStructures,
);

router.get(
  "/get-students-with-fees",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getStudentsWithFees,
);

router.put(
  "/update-fee-structure/:id",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  updateFeeStructure,
);
router.delete(
  "/delete-fee-structure/:feeStructureId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteFeeStructure,
);

// Payment Management
router.post(
  "/record-payment",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  recordPayment,
);
router.get(
  "/get-payment-history/:studentId",
  auth,
  populateUserHeaders,
  getPaymentHistory,
);

// Enhanced payment history — pulls from the fee_payments table.
router.get(
  "/payment-history/:studentId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getEnhancedPaymentHistory,
);

// Reports
router.get(
  "/generate-fee-report",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  generateFeeReport,
);

// Fee Configuration
router.get(
  "/fee-types",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  getFeeTypes,
);

router.get(
  "/payment-methods",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getPaymentMethods,
);

// ============= ACADEMIC YEAR ROUTES =============

router.post(
  "/academic-years",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  [
    body("name").notEmpty().withMessage("Academic year name is required"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
    body("isActive").optional().isBoolean(),
  ],
  createAcademicYear,
);

router.get(
  "/academic-years",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getAcademicYears,
);

router.get(
  "/academic-years/active",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getActiveAcademicYear,
);

router.put(
  "/academic-years/:academicYearId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  updateAcademicYear,
);

router.delete(
  "/academic-years/:academicYearId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteAcademicYear,
);

router.put(
  "/academic-years/:academicYearId/set-active",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  setActiveAcademicYear,
);

// ============= FEE TYPE ROUTES =============

router.post(
  "/fee-types",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  [
    body("name").notEmpty().withMessage("Fee type name is required"),
    body("description").optional().isLength({ max: 500 }),
    body("isMandatory").optional().isBoolean(),
    body("isOneTime").optional().isBoolean(),
  ],
  createFeeType,
);

router.get(
  "/fee-types",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getAllFeeTypes,
);

router.put(
  "/fee-types/:feeTypeId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  updateFeeType,
);

router.delete(
  "/fee-types/:feeTypeId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteFeeType,
);

// ============= CLASS FEE ROUTES =============

// Create class-specific or grade-level fee structure
router.post(
  "/class-fees",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    body("academicYearId")
      .notEmpty()
      .withMessage("Academic year ID is required"),
    body("classId")
      .optional()
      .custom((value, { req }) => {
        // Either classId or gradeId must be present, but not both
        if (!value && !req.body.gradeId) {
          throw new Error("Either classId or gradeId must be provided");
        }
        if (value && req.body.gradeId) {
          throw new Error("Cannot provide both classId and gradeId");
        }
        return true;
      }),
    body("gradeId")
      .optional()
      .custom((value, { req }) => {
        if (!value && !req.body.classId) {
          throw new Error("Either classId or gradeId must be provided");
        }
        if (value && req.body.classId) {
          throw new Error("Cannot provide both classId and gradeId");
        }
        return true;
      }),
    body("feeStructure")
      .isArray({ min: 1 })
      .withMessage("Fee structure must be a non-empty array"),
    body("feeStructure.*.feeTypeId").notEmpty(),
    body("feeStructure.*.annualAmount").isNumeric(),
  ],
  createClassFeeStructure,
);

// Get class-specific fee structure
router.get(
  "/class-fees/:academicYearId/:classId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("academicYearId").notEmpty(), param("classId").notEmpty()],
  getClassFeeStructure,
);

// Get grade-level fee structure
router.get(
  "/grade-fees/:academicYearId/:gradeId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("academicYearId").notEmpty(), param("gradeId").notEmpty()],
  getClassFeeStructure,
);

// ============= INSTALLMENT SCHEDULE ROUTES =============

router.post(
  "/installment-schedules",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    body("academicYearId").notEmpty(),
    body("name").notEmpty(),
    body("scheduleType").isIn([
      "MONTHLY",
      "QUARTERLY",
      "HALF_YEARLY",
      "YEARLY",
      "CUSTOM",
    ]),
    body("installments").isArray({ min: 1 }),
    // Validate that exactly one of gradeId, classId, or studentId is provided
    body("gradeId")
      .optional()
      .custom((value, { req }) => {
        const setCount = [
          req.body.gradeId,
          req.body.classId,
          req.body.studentId,
        ].filter(Boolean).length;
        if (setCount !== 1) {
          throw new Error(
            "Must provide exactly one of gradeId, classId, or studentId",
          );
        }
        return true;
      }),
  ],
  createInstallmentSchedule,
);

// Create default quarterly schedule for class or grade
// Use query parameter ?type=grade for grade-level, default is class
router.post(
  "/installment-schedules/default-quarterly/:academicYearId/:targetId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    param("academicYearId").notEmpty(),
    param("targetId")
      .notEmpty()
      .withMessage("Target ID (gradeId or classId) is required"),
  ],
  createDefaultQuarterlySchedule,
);

// Create default monthly schedule for grade
router.post(
  "/installment-schedules/default-monthly/:academicYearId/:gradeId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    param("academicYearId").notEmpty(),
    param("gradeId").notEmpty().withMessage("Grade ID is required"),
  ],
  createMonthlySchedule,
);

// Get schedules by grade
router.get(
  "/installment-schedules/:academicYearId/:gradeId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("academicYearId").notEmpty(), param("gradeId").notEmpty()],
  getSchedulesByGrade,
);

// ============= STUDENT FEE ASSIGNMENT ROUTES =============

router.post(
  "/student-assignments",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    body("studentId").notEmpty(),
    body("academicYearId").notEmpty(),
    body("scheduleId").notEmpty(),
    body("discountPercentage").optional().isNumeric(),
    body("discountAmount").optional().isNumeric(),
  ],
  assignFeeScheduleToStudent,
);

router.get(
  "/student-assignments/:studentId/:academicYearId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("studentId").notEmpty(), param("academicYearId").notEmpty()],
  getStudentFeeAssignment,
);

router.put(
  "/student-assignments/:assignmentId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    param("assignmentId").notEmpty(),
    body("discountPercentage").optional().isFloat({ min: 0, max: 100 }),
    body("discountAmount").optional().isFloat({ min: 0 }),
  ],
  updateStudentFeeAssignment,
);

// ============= ENHANCED PAYMENT ROUTES =============

router.post(
  "/payments",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    body("studentId").notEmpty(),
    body("assignmentId").optional({ nullable: true, checkFalsy: true }),
    body("installmentIds").optional().isArray(),
    body("amount").isNumeric(),
    body("discountApplied").optional().isFloat({ min: 0 }),
    body("lateFeeAmount").optional().isFloat({ min: 0 }),
    body("paymentMethod").isIn([
      "CASH",
      "CHEQUE",
      "BANK_TRANSFER",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "ONLINE",
      "UPI",
      "WALLET",
    ]),
    body("paymentDate").isISO8601(),
  ],
  recordFeePayment,
);

// ============= STUDENT FEE INFORMATION ROUTES =============

router.get(
  "/students/:studentId/:academicYearId/summary",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("studentId").notEmpty(), param("academicYearId").notEmpty()],
  getStudentFeeSummary,
);

router.get(
  "/students/:studentId/:academicYearId/installments",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("studentId").notEmpty(), param("academicYearId").notEmpty()],
  getStudentInstallments,
);

// ============= ENHANCED REPORTING ROUTES =============

router.get(
  "/reports/overdue",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    query("limit").optional().isInt({ min: 1, max: 1000 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  getOverdueInstallments,
);

router.get(
  "/reports/collection",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    query("startDate").isISO8601(),
    query("endDate").isISO8601(),
    query("groupBy").optional().isIn(["day", "week", "month"]),
  ],
  getFeeCollectionReport,
);

router.get(
  "/dashboard/stats",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [query("academicYearId").optional().notEmpty()],
  getFeesDashboardStats,
);

// ============= GRADE FEE STRUCTURE ROUTES =============

router.post(
  "/grade-fees",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [
    body("academicYearId")
      .notEmpty()
      .withMessage("Academic year ID is required"),
    body("gradeId").notEmpty().withMessage("Grade ID is required"),
    body("scheduleId").optional(),
    body("feeStructure")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Fee structure must be a non-empty array"),
    body("feeStructures")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Fee structures must be a non-empty array"),
  ],
  createGradeFeeStructure,
);

router.get(
  "/grade-fees/:academicYearId/:gradeId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("academicYearId").notEmpty(), param("gradeId").notEmpty()],
  getGradeFeeStructure,
);

router.delete(
  "/grade-fees/:academicYearId/:gradeId",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  [param("academicYearId").notEmpty(), param("gradeId").notEmpty()],
  deleteGradeFeeStructure,
);

// ============= CONSTANTS ROUTES =============

router.get(
  "/constants/schedule-types",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  getScheduleTypes,
);

router.get(
  "/constants/installment-statuses",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  getInstallmentStatuses,
);

// ============= STUDENT INDIVIDUAL FEES ROUTES =============

/**
 * @route POST /api/fees/individual-fees
 * @desc Create individual fee for a student (e.g., fines, punishment fees)
 */
router.post(
  "/individual-fees",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [
    body("studentId").notEmpty().withMessage("Student ID is required"),
    body("academicYearId")
      .notEmpty()
      .withMessage("Academic Year ID is required"),
    body("feeTypeId").notEmpty().withMessage("Fee Type ID is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("dueDate").notEmpty().withMessage("Due date is required"),
  ],
  createStudentIndividualFee,
);

/**
 * @route GET /api/fees/individual-fees
 * @desc Get all individual fees (with filters)
 */
router.get(
  "/individual-fees",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getAllIndividualFees,
);

/**
 * @route GET /api/fees/individual-fees/student/:studentId
 * @desc Get individual fees for a specific student
 */
router.get(
  "/individual-fees/student/:studentId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER),
  [param("studentId").notEmpty()],
  getStudentIndividualFees,
);

/**
 * @route PUT /api/fees/individual-fees/:individualFeeId
 * @desc Update individual fee (status, amount, etc.)
 */
router.put(
  "/individual-fees/:individualFeeId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [param("individualFeeId").notEmpty()],
  updateStudentIndividualFee,
);

/**
 * @route DELETE /api/fees/individual-fees/:individualFeeId
 * @desc Delete (cancel) individual fee
 */
router.delete(
  "/individual-fees/:individualFeeId",
  auth,
  populateUserHeaders,
  requireFeature(DASHBOARD_FEATURES.FEES),
  authorize(ROLES.ADMIN, ROLES.ACCOUNTANT),
  [param("individualFeeId").notEmpty()],
  deleteStudentIndividualFee,
);

export default router;
