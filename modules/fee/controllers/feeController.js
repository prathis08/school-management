import { validationResult } from "express-validator";
import FeeService from "../services/FeeService.js";
import {
  FEE_TYPES,
  PAYMENT_METHODS,
  SCHEDULE_TYPES,
  INSTALLMENT_STATUS,
} from "../constants/feeConstants.js";

// Create fee structure
export const createFeeStructure = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const feeStructure = await FeeService.createFeeStructure(
      req.body,
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error creating fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get fee structures
export const getFeeStructures = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const filters = req.query;

    const feeStructures = await FeeService.getFeeStructures(schoolId, filters);

    res.json({
      success: true,
      data: feeStructures,
    });
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get students with fee filters
export const getStudentsWithFees = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { gradeId, feeType, name, studentId } = req.query;

    const filtersForSearch = {
      schoolId,
      gradeId,
      ...(feeType && { feeType }),
      ...(name && { name }),
      ...(studentId && { studentId }),
    };

    const students = await FeeService.getStudentsWithFees(filtersForSearch);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students with fees:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update fee structure
export const updateFeeStructure = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const schoolId = req.user.schoolId;
    const updateData = req.body;

    const updatedFeeStructure = await FeeService.updateFeeStructure(
      id,
      updateData,
      schoolId,
    );

    res.json({
      success: true,
      message: "Fee structure updated successfully",
      data: updatedFeeStructure,
    });
  } catch (error) {
    console.error("Error updating fee structure:", error);

    if (error.message === "Fee structure not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete fee structure
export const deleteFeeStructure = async (req, res) => {
  try {
    const { feeStructureId } = req.params;
    const schoolId = req.user.schoolId;

    await FeeService.deleteFeeStructure(feeStructureId, schoolId);

    res.json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fee structure:", error);

    if (error.message === "Fee structure not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Record payment
export const recordPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const payment = await FeeService.recordPayment(req.body, schoolId);

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId;

    const payments = await FeeService.getPaymentHistory(studentId, schoolId);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Enhanced payment history — covers fee_payments + installment join.
export const getEnhancedPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId;

    const result = await FeeService.getEnhancedPaymentHistory(
      studentId,
      schoolId,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching enhanced payment history:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Generate fee report
export const generateFeeReport = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const filters = req.query;

    const reportData = await FeeService.generateFeeReport(schoolId, filters);

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating fee report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get fee types
export const getFeeTypes = async (req, res) => {
  try {
    // Try to get fee types from database first
    const schoolId = req.schoolId;
    if (schoolId) {
      try {
        const dbFeeTypes = await FeeService.getFeeTypes(schoolId);
        if (dbFeeTypes && dbFeeTypes.length > 0) {
          return res.json({
            success: true,
            data: dbFeeTypes,
            source: "database",
          });
        }
        return res.json({
          success: true,
          data: [],
          message: "No fee types found in database",
        });
      } catch (dbError) {
        console.warn(
          "Database fee types not available, falling back to constants:",
          dbError.message,
        );
      }
    }
  } catch (error) {
    console.error("Error fetching fee types:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = Object.entries(PAYMENT_METHODS).map(
      ([key, value]) => ({
        key,
        value,
        label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " "),
      }),
    );

    res.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= ACADEMIC YEAR MANAGEMENT =============

/**
 * Create academic year
 */
export const createAcademicYear = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const academicYear = await FeeService.createAcademicYear(
      req.body,
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Academic year created successfully",
      data: academicYear,
    });
  } catch (error) {
    console.error("Error creating academic year:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get academic years
 */
export const getAcademicYears = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const academicYears = await FeeService.getAcademicYears(schoolId);

    res.json({
      success: true,
      data: academicYears,
    });
  } catch (error) {
    console.error("Error fetching academic years:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get active academic year
 */
export const getActiveAcademicYear = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const activeYear = await FeeService.getActiveAcademicYear(schoolId);

    if (!activeYear) {
      return res.status(404).json({
        success: false,
        message: "No active academic year found",
      });
    }

    res.json({
      success: true,
      data: activeYear,
    });
  } catch (error) {
    console.error("Error fetching active academic year:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Create fee type
 */
export const createFeeType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const feeType = await FeeService.createFeeType(req.body, schoolId);

    res.status(201).json({
      success: true,
      message: "Fee type created successfully",
      data: feeType,
    });
  } catch (error) {
    console.error("Error creating fee type:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= CLASS FEE MANAGEMENT =============

/**
 * Create class fee structure
 */
export const createClassFeeStructure = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const classFees = await FeeService.createClassFeeStructure(
      req.body,
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Class fee structure created successfully",
      data: classFees,
    });
  } catch (error) {
    console.error("Error creating class fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get class or grade fee structure
 * Supports both /class-fees/:academicYearId/:classId and /grade-fees/:academicYearId/:gradeId
 */
export const getClassFeeStructure = async (req, res) => {
  try {
    const { academicYearId, classId, gradeId } = req.params;
    const classFees = await FeeService.getClassFeeStructure(
      academicYearId,
      classId || null,
      gradeId || null,
    );

    res.json({
      success: true,
      data: classFees,
    });
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= INSTALLMENT SCHEDULE MANAGEMENT =============

/**
 * Create installment schedule
 */
export const createInstallmentSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const createdBy = req.user.userId;

    const scheduleData = {
      ...req.body,
      createdBy,
    };

    const schedule = await FeeService.createInstallmentSchedule(
      scheduleData,
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Installment schedule created successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error creating installment schedule:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Create default quarterly schedule for grade or class
 * Supports both /installment-schedules/default-quarterly/:academicYearId/:targetId?type=grade
 * and /installment-schedules/default-quarterly/:academicYearId/:targetId (default: class)
 */
export const createDefaultQuarterlySchedule = async (req, res) => {
  try {
    const { academicYearId, targetId } = req.params;
    const { type } = req.query; // 'grade' or 'class' (default)
    const schoolId = req.user.schoolId;
    const createdBy = req.user.userId;

    const isGradeLevel = type === "grade";

    const schedule = await FeeService.createDefaultQuarterlySchedule(
      academicYearId,
      targetId,
      schoolId,
      createdBy,
      isGradeLevel,
    );

    res.status(201).json({
      success: true,
      message: `Default quarterly schedule created successfully for ${isGradeLevel ? "grade" : "class"}`,
      data: schedule,
    });
  } catch (error) {
    console.error("Error creating default quarterly schedule:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= STUDENT FEE ASSIGNMENT =============

/**
 * Assign fee schedule to student
 */
export const assignFeeScheduleToStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const assignedBy = req.user.userId;

    const assignmentData = {
      ...req.body,
      assignedBy,
    };

    const assignment = await FeeService.assignFeeScheduleToStudent(
      assignmentData,
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Fee schedule assigned to student successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning fee schedule to student:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get student fee assignment
 */
export const getStudentFeeAssignment = async (req, res) => {
  try {
    const { studentId, academicYearId } = req.params;
    const assignment = await FeeService.getStudentFeeAssignment(
      studentId,
      academicYearId,
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No fee assignment found for this student",
      });
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Error fetching student fee assignment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update student fee assignment (discount only).
 */
export const updateStudentFeeAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const schoolId = req.user.schoolId;
    const { discountPercentage, discountAmount } = req.body || {};

    const assignment = await FeeService.updateStudentFeeAssignment(
      assignmentId,
      schoolId,
      { discountPercentage, discountAmount },
    );

    res.json({
      success: true,
      message: "Assignment updated",
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating fee assignment:", error);
    if (error.message === "Assignment not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= ENHANCED PAYMENT PROCESSING =============

/**
 * Record fee payment with installment tracking
 */
export const recordFeePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const collectedBy = req.user.userId;

    const paymentData = {
      ...req.body,
      collectedBy,
    };

    const payment = await FeeService.recordFeePayment(paymentData, schoolId);

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= STUDENT FEE INFORMATION =============

/**
 * Get student fee summary with installment tracking (includes individual fees)
 */
export const getStudentFeeSummary = async (req, res) => {
  try {
    const { studentId, academicYearId } = req.params;
    const schoolId = req.user?.schoolId;
    const summary = await FeeService.getStudentFeeSummary(
      studentId,
      academicYearId,
      schoolId,
    );

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "No fee information found for this student",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching student fee summary:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get student installments
 */
export const getStudentInstallments = async (req, res) => {
  try {
    const { studentId, academicYearId } = req.params;
    const installments = await FeeService.getStudentInstallments(
      studentId,
      academicYearId,
    );

    res.json({
      success: true,
      data: installments,
    });
  } catch (error) {
    console.error("Error fetching student installments:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= REPORTING AND ANALYTICS =============

/**
 * Get overdue installments
 */
export const getOverdueInstallments = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const filters = req.query;

    const overdueInstallments = await FeeService.getOverdueInstallments(
      schoolId,
      filters,
    );

    res.json({
      success: true,
      data: overdueInstallments,
    });
  } catch (error) {
    console.error("Error fetching overdue installments:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get fee collection report
 */
export const getFeeCollectionReport = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { startDate, endDate, groupBy } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const report = await FeeService.getFeeCollectionReport(
      schoolId,
      startDate,
      endDate,
      { groupBy },
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error generating fee collection report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get fees dashboard statistics
 */
export const getFeesDashboardStats = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { academicYearId } = req.query;

    const stats = await FeeService.getFeesDashboardStats(
      schoolId,
      academicYearId,
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= CONSTANTS ENDPOINTS =============

/**
 * Get schedule types
 */
export const getScheduleTypes = async (req, res) => {
  try {
    const scheduleTypes = Object.entries(SCHEDULE_TYPES).map(
      ([key, value]) => ({
        key,
        value,
        label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " "),
      }),
    );

    res.json({
      success: true,
      data: scheduleTypes,
    });
  } catch (error) {
    console.error("Error fetching schedule types:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get installment statuses
 */
export const getInstallmentStatuses = async (req, res) => {
  try {
    const statuses = Object.entries(INSTALLMENT_STATUS).map(([key, value]) => ({
      key,
      value,
      label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " "),
    }));

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching installment statuses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= ADDITIONAL ACADEMIC YEAR ENDPOINTS =============

/**
 * Update academic year
 */
export const updateAcademicYear = async (req, res) => {
  try {
    const { academicYearId } = req.params;
    const schoolId = req.user.schoolId;

    const updatedYear = await FeeService.updateAcademicYear(
      academicYearId,
      req.body,
      schoolId,
    );

    res.json({
      success: true,
      message: "Academic year updated successfully",
      data: updatedYear,
    });
  } catch (error) {
    console.error("Error updating academic year:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete academic year
 */
export const deleteAcademicYear = async (req, res) => {
  try {
    const { academicYearId } = req.params;
    const schoolId = req.user.schoolId;

    await FeeService.deleteAcademicYear(academicYearId, schoolId);

    res.json({
      success: true,
      message: "Academic year deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting academic year:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Set active academic year
 */
export const setActiveAcademicYear = async (req, res) => {
  try {
    const { academicYearId } = req.params;
    const schoolId = req.user.schoolId;

    const activeYear = await FeeService.setActiveAcademicYear(
      academicYearId,
      schoolId,
    );

    res.json({
      success: true,
      message: "Academic year set as active successfully",
      data: activeYear,
    });
  } catch (error) {
    console.error("Error setting active academic year:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= ADDITIONAL FEE TYPE ENDPOINTS =============

/**
 * Get all fee types
 */
export const getAllFeeTypes = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const feeTypes = await FeeService.getAllFeeTypes(schoolId);

    res.json({
      success: true,
      data: feeTypes,
    });
  } catch (error) {
    console.error("Error fetching fee types:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update fee type
 */
export const updateFeeType = async (req, res) => {
  try {
    const { feeTypeId } = req.params;
    const schoolId = req.user.schoolId;

    const updatedFeeType = await FeeService.updateFeeType(
      feeTypeId,
      req.body,
      schoolId,
    );

    res.json({
      success: true,
      message: "Fee type updated successfully",
      data: updatedFeeType,
    });
  } catch (error) {
    console.error("Error updating fee type:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete fee type
 */
export const deleteFeeType = async (req, res) => {
  try {
    const { feeTypeId } = req.params;
    const schoolId = req.user.schoolId;

    await FeeService.deleteFeeType(feeTypeId, schoolId);

    res.json({
      success: true,
      message: "Fee type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fee type:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= ADDITIONAL SCHEDULE ENDPOINTS =============

/**
 * Create monthly schedule for grade
 */
export const createMonthlySchedule = async (req, res) => {
  try {
    const { academicYearId, gradeId } = req.params;
    const schoolId = req.user.schoolId;
    const createdBy = req.user.userId;

    const schedule = await FeeService.createDefaultMonthlySchedule(
      academicYearId,
      gradeId,
      schoolId,
      createdBy,
    );

    res.status(201).json({
      success: true,
      message: "Monthly schedule created successfully for grade",
      data: schedule,
    });
  } catch (error) {
    console.error("Error creating monthly schedule:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get schedules by grade
 */
export const getSchedulesByGrade = async (req, res) => {
  try {
    const { academicYearId, gradeId } = req.params;
    const schoolId = req.user.schoolId;

    const schedules = await FeeService.getSchedulesByGrade(
      academicYearId,
      gradeId,
      schoolId,
    );

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= GRADE FEE STRUCTURE ENDPOINTS =============

/**
 * Create grade fee structure with installments
 */
export const createGradeFeeStructure = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const createdBy = req.user.userId;

    const feeStructure = await FeeService.createGradeFeeStructure(
      { ...req.body, createdBy },
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Grade fee structure created successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error creating grade fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get grade fee structure with installments
 */
export const getGradeFeeStructure = async (req, res) => {
  try {
    const { academicYearId, gradeId } = req.params;
    const schoolId = req.user.schoolId;

    const feeStructure = await FeeService.getGradeFeeStructure(
      academicYearId,
      gradeId,
      schoolId,
    );

    res.json({
      success: true,
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error fetching grade fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete grade fee structure
 */
export const deleteGradeFeeStructure = async (req, res) => {
  try {
    const { academicYearId, gradeId } = req.params;
    const schoolId = req.user.schoolId;

    await FeeService.deleteGradeFeeStructure(academicYearId, gradeId, schoolId);

    res.json({
      success: true,
      message: "Grade fee structure deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting grade fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= STUDENT INDIVIDUAL FEES =============

/**
 * Create individual fee for a student
 */
export const createStudentIndividualFee = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const createdBy = req.user.userId;

    const fee = await FeeService.createStudentIndividualFee(
      { ...req.body, createdBy },
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Individual fee created successfully",
      data: fee,
    });
  } catch (error) {
    console.error("Error creating student individual fee:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get individual fees for a student
 */
export const getStudentIndividualFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId, status } = req.query;
    const schoolId = req.user.schoolId;

    const fees = await FeeService.getStudentIndividualFees(
      studentId,
      academicYearId,
      status,
      schoolId,
    );

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error("Error fetching student individual fees:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get all individual fees (with filters)
 */
export const getAllIndividualFees = async (req, res) => {
  try {
    const { academicYearId, status, classId, gradeId } = req.query;
    const schoolId = req.user.schoolId;

    const fees = await FeeService.getAllIndividualFees(
      { academicYearId, status, classId, gradeId },
      schoolId,
    );

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error("Error fetching all individual fees:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update individual fee status (mark as paid, waived, cancelled)
 */
export const updateStudentIndividualFee = async (req, res) => {
  try {
    const { individualFeeId } = req.params;
    const schoolId = req.user.schoolId;
    const userId = req.user.userId;

    const fee = await FeeService.updateStudentIndividualFee(
      individualFeeId,
      { ...req.body, updatedBy: userId },
      schoolId,
    );

    res.json({
      success: true,
      message: "Individual fee updated successfully",
      data: fee,
    });
  } catch (error) {
    console.error("Error updating student individual fee:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete individual fee
 */
export const deleteStudentIndividualFee = async (req, res) => {
  try {
    const { individualFeeId } = req.params;
    const schoolId = req.user.schoolId;

    await FeeService.deleteStudentIndividualFee(individualFeeId, schoolId);

    res.json({
      success: true,
      message: "Individual fee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student individual fee:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
