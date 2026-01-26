import { Op } from "sequelize";
import FeeStructure from "../models/FeeStructure.js";
import Payment from "../models/Payment.js";
import GradeFees from "../models/GradeFees.js";
import { Student, Class } from "@school-management/admission";
import {
  FEE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "../constants/feeConstants.js";
import { withTransaction } from "@school-management/backend-core/utils/transactionHelper.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";
import { getStudentsWithFeesData } from "../dbCommands/feeDbCommands.js";

class FeeService {
  /**
   * Create fee structure
   * @param {Object} feeData - Fee structure data
   * @param {string} schoolId - School ID
   * @returns {Object} Created fee structure
   */
  async createFeeStructure(feeData, schoolId) {
    const {
      title,
      amount,
      academicSession,
      applicableGrade,
      feeType,
      description,
      allowInstallments,
      availableForDiscount,
      dueDate,
      isActive,
      createdDate,
    } = feeData;

    // Validate fee type
    if (feeType && !Object.values(FEE_TYPES).includes(feeType)) {
      throw new Error(
        `Invalid fee type. Must be one of: ${Object.values(FEE_TYPES).join(
          ", ",
        )}`,
      );
    }

    const feeStructureId = generateCustomIdWithPrefix("FEESTRUCTURE");

    // Use transaction to ensure both fee structure and class fees are created atomically
    return await withTransaction(async (transaction) => {
      // Create the fee structure
      const feeStructure = await FeeStructure.create(
        {
          feeStructureId,
          title,
          amount,
          academicSession,
          applicableGrade,
          feeType,
          description,
          allowInstallments,
          availableForDiscount,
          dueDate,
          isActive,
          createdDate,
          schoolId,
        },
        { transaction },
      );

      // Create entries in class_fees table
      // applicableGrade can be a single gradeId or an array of gradeIds
      const gradeIds = Array.isArray(applicableGrade)
        ? applicableGrade
        : [applicableGrade];

      if (gradeIds.length > 0 && gradeIds[0]) {
        const classFeeEntries = gradeIds.map((gradeId) => ({
          schoolId,
          feeStructureId,
          gradeId,
          createdDate: new Date(),
        }));

        await GradeFees.bulkCreate(classFeeEntries, { transaction });
      }

      return feeStructure;
    });
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
        feeStructureId: feeStructureId,
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
      schoolId,
    );
    if (!feeStructure) {
      throw new Error("Fee structure not found");
    }

    const updateResult = await FeeStructure.update(updateData, {
      where: {
        feeStructureId: feeStructureId,
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
      { isActive: false },
      {
        where: {
          feeStructureId: feeStructureId,
          schoolId: schoolId,
        },
      },
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

    // Use transaction to ensure atomic operation (verify + create payment)
    return await withTransaction(async (transaction) => {
      // Verify fee structure exists
      const feeStructure = await FeeStructure.findOne({
        where: {
          id: feeStructureId,
          schoolId: schoolId,
          is_active: true,
        },
        transaction,
      });

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
        transaction,
      });

      if (!student) {
        throw new Error("Student not found");
      }

      const payment = await Payment.create(
        {
          schoolId: schoolId,
          student_id: studentId,
          fee_structure_id: feeStructureId,
          amount,
          payment_method: paymentMethod,
          payment_status: PAYMENT_STATUS.COMPLETED,
          transaction_id: transactionId,
          payment_date: new Date(),
          remarks,
        },
        { transaction },
      );

      return payment;
    });
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

  /**
   * Get payment history for a student
   * @param {string} studentId - Student ID
   * @param {string} schoolId - School ID
   * @returns {Array} Payment history
   */
  async getPaymentHistory(studentId, schoolId) {
    const payments = await Payment.findAll({
      where: { student_id: studentId, schoolId },
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

    return payments;
  }

  /**
   * Generate fee report
   * @param {string} schoolId - School ID
   * @param {Object} filters - Report filters
   * @returns {Object} Fee report data
   */
  async generateFeeReport(schoolId, filters = {}) {
    const { startDate, endDate, className } = filters;

    const whereClause = { schoolId };
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
      0,
    );

    return {
      payments,
      summary: {
        totalPayments: payments.length,
        totalAmount,
      },
    };
  }

  /**
   * Get students with fee filters
   * @param {Object} filters - Filter criteria
   * @param {string} filters.schoolId - School ID
   * @param {string} filters.classId - Grade ID (mapped from gradeId parameter, optional)
   * @param {string} filters.feeType - Fee type (optional)
   * @param {string} filters.name - Student name (optional)
   * @returns {Array} Students with their fee information
   */
  async getStudentsWithFees(filtersForSearch) {
    const students = await getStudentsWithFeesData(filtersForSearch);

    const studentsWithFeeInfo = await Promise.all(
      students.map(async (student) => {
        const studentData = student.toJSON();
        let classFeeStructures = [];
        if (!classFeeStructures.length && studentData.gradeId) {
          // Get fee structures for this class through GradeFees junction table
          const classFees = await GradeFees.findAll({
            where: {
              gradeId: studentData.gradeId,
              schoolId: filtersForSearch.schoolId,
            },
            include: [
              {
                model: FeeStructure,
                as: "feeStructure",
                where: {
                  isActive: true,
                  ...(filtersForSearch.feeType && {
                    feeType: filtersForSearch.feeType,
                  }),
                },
                attributes: [
                  "feeStructureId",
                  "title",
                  "amount",
                  "feeType",
                  "academicSession",
                  "dueDate",
                  "isActive",
                ],
              },
            ],
          });

          console.log(`Found ${classFees.length} class fee entries`);

          classFeeStructures = classFees
            .map((classFee) => classFee.feeStructure)
            .filter(Boolean); // Filter out any null/undefined fee structures
        }

        // Calculate total fees for the student based on class fee structures
        const totalFees = classFeeStructures.reduce((sum, feeStructure) => {
          return sum + parseFloat(feeStructure.amount || 0);
        }, 0);

        // Calculate total payments made
        const totalPaid =
          studentData.payments?.reduce((sum, payment) => {
            return payment.status === PAYMENT_STATUS.COMPLETED
              ? sum + parseFloat(payment.amount || 0)
              : sum;
          }, 0) || 0;

        // Calculate outstanding amount
        const outstandingAmount = totalFees - totalPaid;

        console.log(studentData);

        return {
          ...studentData,
          feeInfo: {
            totalFees,
            totalPaid,
            outstandingAmount,
            feeStructures: classFeeStructures,
            paymentHistory: studentData.payments || [],
          },
        };
      }),
    );

    return studentsWithFeeInfo;
  }
}

export default new FeeService();
