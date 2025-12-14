import { Op } from "sequelize";
import FeeStructure from "../models/FeeStructure.js";
import Payment from "../models/Payment.js";
import { Student, Class } from "@school-management/admission";
import {
  FEE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "../constants/feeConstants.js";

class FeeService {
  /**
   * Create fee structure
   * @param {Object} feeData - Fee structure data
   * @param {string} schoolId - School ID
   * @returns {Object} Created fee structure
   */
  async createFeeStructure(feeData, schoolId) {
    const { className, feeType, amount, dueDate, academicYear } = feeData;

    const feeStructure = await FeeStructure.create({
      schoolId: schoolId,
      class_name: className,
      fee_type: feeType,
      amount,
      due_date: dueDate,
      academic_year: academicYear,
    });

    return feeStructure;
  }

  /**
   * Get fee structures for a school
   * @param {string} schoolId - School ID
   * @param {Object} filters - Optional filters (className, academicYear)
   * @returns {Object[]} Array of fee structures
   */
  async getFeeStructures(schoolId, filters = {}) {
    const where = {
      schoolId: schoolId,
      is_active: true,
    };

    if (filters.className) {
      where.class_name = filters.className;
    }

    if (filters.academicYear) {
      where.academic_year = filters.academicYear;
    }

    return await FeeStructure.findAll({
      where,
      order: [
        ["class_name", "ASC"],
        ["fee_type", "ASC"],
      ],
    });
  }

  /**
   * Get fee structure by ID
   * @param {string} feeStructureId - Fee structure ID
   * @param {string} schoolId - School ID
   * @returns {Object|null} Fee structure data
   */
  async getFeeStructureById(feeStructureId, schoolId) {
    return await FeeStructure.findOne({
      where: {
        id: feeStructureId,
        schoolId: schoolId,
        is_active: true,
      },
    });
  }

  /**
   * Update fee structure
   * @param {string} feeStructureId - Fee structure ID
   * @param {Object} updateData - Data to update
   * @param {string} schoolId - School ID
   * @returns {Object} Updated fee structure
   */
  async updateFeeStructure(feeStructureId, updateData, schoolId) {
    const feeStructure = await this.getFeeStructureById(
      feeStructureId,
      schoolId
    );
    if (!feeStructure) {
      throw new Error("Fee structure not found");
    }

    const updateResult = await FeeStructure.update(updateData, {
      where: {
        id: feeStructureId,
        schoolId: schoolId,
      },
    });

    if (updateResult[0] === 0) {
      throw new Error("Fee structure not found or no changes made");
    }

    return await this.getFeeStructureById(feeStructureId, schoolId);
  }

  /**
   * Delete fee structure (soft delete)
   * @param {string} feeStructureId - Fee structure ID
   * @param {string} schoolId - School ID
   * @returns {boolean} Success status
   */
  async deleteFeeStructure(feeStructureId, schoolId) {
    const deleteResult = await FeeStructure.update(
      { is_active: false },
      {
        where: {
          id: feeStructureId,
          schoolId: schoolId,
        },
      }
    );

    if (deleteResult[0] === 0) {
      throw new Error("Fee structure not found");
    }

    return true;
  }

  /**
   * Record fee payment
   * @param {Object} paymentData - Payment data
   * @param {string} schoolId - School ID
   * @returns {Object} Created payment record
   */
  async recordPayment(paymentData, schoolId) {
    const {
      studentId,
      feeStructureId,
      amount,
      paymentMethod,
      transactionId,
      remarks,
    } = paymentData;

    // Verify fee structure exists
    const feeStructure = await this.getFeeStructureById(
      feeStructureId,
      schoolId
    );
    if (!feeStructure) {
      throw new Error("Fee structure not found");
    }

    // Verify student exists
    const student = await Student.findOne({
      where: {
        student_id: studentId,
        schoolId: schoolId,
        is_active: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const payment = await Payment.create({
      schoolId: schoolId,
      student_id: studentId,
      fee_structure_id: feeStructureId,
      amount,
      payment_method: paymentMethod,
      payment_status: PAYMENT_STATUS.COMPLETED,
      transaction_id: transactionId,
      payment_date: new Date(),
      remarks,
    });

    return payment;
  }

  /**
   * Get payments for a school
   * @param {string} schoolId - School ID
   * @param {Object} filters - Optional filters
   * @returns {Object[]} Array of payments with related data
   */
  async getPayments(schoolId, filters = {}) {
    const where = {
      schoolId: schoolId,
    };

    if (filters.studentId) {
      where.student_id = filters.studentId;
    }

    if (filters.paymentStatus) {
      where.payment_status = filters.paymentStatus;
    }

    if (filters.startDate && filters.endDate) {
      where.payment_date = {
        [Op.between]: [filters.startDate, filters.endDate],
      };
    }

    return await Payment.findAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["student_id", "first_name", "last_name"],
        },
        {
          model: FeeStructure,
          as: "feeStructure",
          attributes: ["class_name", "fee_type", "amount"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @param {string} schoolId - School ID
   * @returns {Object|null} Payment data with related information
   */
  async getPaymentById(paymentId, schoolId) {
    return await Payment.findOne({
      where: {
        id: paymentId,
        schoolId: schoolId,
      },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["student_id", "first_name", "last_name"],
        },
        {
          model: FeeStructure,
          as: "feeStructure",
          attributes: ["class_name", "fee_type", "amount", "due_date"],
        },
      ],
    });
  }

  /**
   * Get student fee details (outstanding and paid)
   * @param {string} studentId - Student ID
   * @param {string} schoolId - School ID
   * @param {string} academicYear - Academic year (optional)
   * @returns {Object} Student fee summary
   */
  async getStudentFeeDetails(studentId, schoolId, academicYear) {
    // Get student info
    const student = await Student.findOne({
      where: {
        student_id: studentId,
        schoolId: schoolId,
        is_active: true,
      },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["class_name"],
        },
      ],
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Get applicable fee structures
    const feeWhere = {
      schoolId: schoolId,
      class_name: student.class.class_name,
      is_active: true,
    };

    if (academicYear) {
      feeWhere.academic_year = academicYear;
    }

    const feeStructures = await FeeStructure.findAll({
      where: feeWhere,
    });

    // Get payments made by student
    const paymentWhere = {
      schoolId: schoolId,
      student_id: studentId,
      payment_status: PAYMENT_STATUS.COMPLETED,
    };

    const payments = await Payment.findAll({
      where: paymentWhere,
      include: [
        {
          model: FeeStructure,
          as: "feeStructure",
          where: academicYear ? { academic_year: academicYear } : {},
        },
      ],
    });

    // Calculate outstanding fees
    let totalFees = 0;
    let totalPaid = 0;
    const outstandingFees = [];

    for (const feeStructure of feeStructures) {
      totalFees += feeStructure.amount;

      const paidAmount = payments
        .filter((p) => p.fee_structure_id === feeStructure.id)
        .reduce((sum, p) => sum + p.amount, 0);

      totalPaid += paidAmount;

      const outstanding = feeStructure.amount - paidAmount;
      if (outstanding > 0) {
        outstandingFees.push({
          feeStructure,
          outstanding,
          dueDate: feeStructure.due_date,
        });
      }
    }

    return {
      student: {
        id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        class: student.class.class_name,
      },
      summary: {
        totalFees,
        totalPaid,
        totalOutstanding: totalFees - totalPaid,
      },
      outstandingFees,
      payments,
    };
  }
}

export default new FeeService();
