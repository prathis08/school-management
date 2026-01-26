import { validationResult } from "express-validator";
import FeeService from "../services/FeeService.js";
import { FEE_TYPES, PAYMENT_METHODS } from "../constants/feeConstants.js";

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
    const { gradeId, feeType, name } = req.query;

    const filtersForSearch = {
      schoolId,
      gradeId,
      ...(feeType && { feeType }),
      ...(name && { name }),
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
    const feeTypes = Object.entries(FEE_TYPES).map(([key, value]) => ({
      key,
      value,
      label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " "),
    }));

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
