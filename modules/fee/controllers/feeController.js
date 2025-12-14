import { validationResult } from "express-validator";
import { Op } from "sequelize";
import FeeStructure from "../models/FeeStructure.js";
import Payment from "../models/Payment.js";
import { Student } from "@school-management/admission";
import {
  FEE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "../constants/feeConstants.js";

// Create fee structure
export const createFeeStructure = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { className, feeType, amount, dueDate, academicYear } = req.body;
    const schoolId = req.user.schoolId;

    const feeStructure = await FeeStructure.create({
      schoolId: schoolId,
      class_name: className,
      fee_type: feeType,
      amount,
      due_date: dueDate,
      academic_year: academicYear,
    });

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
    const { className, academicYear, feeType } = req.query;

    const whereClause = { schoolId: schoolId, is_active: true };
    if (className) whereClause.class_name = className;
    if (academicYear) whereClause.academic_year = academicYear;
    if (feeType) whereClause.fee_type = feeType;

    const feeStructures = await FeeStructure.findAll({
      where: whereClause,
      order: [
        ["class_name", "ASC"],
        ["fee_type", "ASC"],
      ],
    });

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

// Update fee structure
export const updateFeeStructure = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const schoolId = req.user.schoolId;
    const updated_ata = req.body;

    const [updatedRows] = await FeeStructure.update(updated_ata, {
      where: { id, schoolId: schoolId },
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    const updatedFeeStructure = await FeeStructure.findByPk(id);

    res.json({
      success: true,
      message: "Fee structure updated successfully",
      data: updatedFeeStructure,
    });
  } catch (error) {
    console.error("Error updating fee structure:", error);
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
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const deletedRows = await FeeStructure.update(
      { is_active: false },
      { where: { id, schoolId: schoolId } }
    );

    if (deletedRows[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    res.json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fee structure:", error);
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

    const {
      studentId,
      feeStructureId,
      amount,
      paymentMethod,
      transactionId,
      remarks,
    } = req.body;
    const schoolId = req.user.schoolId;

    // Generate receipt number
    const receiptNumber = `RCP-${schoolId}-${Date.now()}`;

    const payment = await Payment.create({
      schoolId: schoolId,
      student_id: studentId,
      fee_structure_id: feeStructureId,
      amount,
      payment_method: paymentMethod,
      receipt_number: receiptNumber,
      transaction_id: transactionId,
      remarks,
    });

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

    const payments = await Payment.findAll({
      where: { student_id: studentId, schoolId: schoolId },
      include: [
        {
          model: FeeStructure,
          as: "feeStructure",
        },
        {
          model: Student,
          as: "student",
          attributes: ["first_name", "last_name", "roll_number"],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

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
    const { startDate, endDate, className } = req.query;

    const whereClause = { schoolId: schoolId };
    if (startDate && endDate) {
      whereClause.payment_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [
        {
          model: FeeStructure,
          as: "feeStructure",
          where: className ? { class_name: className } : {},
        },
        {
          model: Student,
          as: "student",
          attributes: ["firstName", "lastName", "rollNumber"],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    const totalAmount = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount),
      0
    );

    res.json({
      success: true,
      data: {
        payments,
        summary: {
          totalPayments: payments.length,
          totalAmount,
        },
      },
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
