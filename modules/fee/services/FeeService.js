import { Op } from "sequelize";
import FeeStructure from "../models/FeeStructure.js";
import Payment from "../models/Payment.js";
import GradeFees from "../models/GradeFees.js";
import { Student, Class } from "@school-management/admission";
import {
  FEE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  SCHEDULE_TYPES,
  INSTALLMENT_STATUS,
  ONE_TIME_FEE_TYPES,
} from "../constants/feeConstants.js";
import { withTransaction } from "@school-management/backend-core/utils/transactionHelper.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";
import * as feeDbCommands from "../dbCommands/feeDbCommands.js";
import { getStudentsWithFeesData } from "../dbCommands/feeDbCommands.js";
import {
  AcademicYear,
  FeeType,
  ClassFee,
  InstallmentSchedule,
  Installment,
  InstallmentFeeMapping,
  StudentFeeAssignment,
  FeePayment,
  StudentInstallmentStatus,
} from "../models/index.js";

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
   * Enhanced payment history — pulls from fee_payments and joins to the
   * specific installment (if any) plus the student record so the UI has
   * everything it needs to render a complete history.
   */
  async getEnhancedPaymentHistory(studentId, schoolId) {
    const [student, payments] = await Promise.all([
      Student.findOne({
        where: { studentId, schoolId },
        attributes: [
          "studentId",
          "firstName",
          "lastName",
          "rollNumber",
          "email",
          "phone",
          "gradeId",
          "classId",
        ],
        include: [
          {
            model: Class,
            as: "class",
            attributes: ["classId", "className", "section", "grade"],
          },
        ],
      }),
      FeePayment.findAll({
        where: { studentId, schoolId },
        include: [
          {
            model: Installment,
            as: "installment",
            attributes: ["installmentId", "name", "installmentNumber", "dueDate"],
            required: false,
          },
        ],
        order: [
          ["paymentDate", "DESC"],
          ["createdAt", "DESC"],
        ],
      }),
    ]);

    if (!student) return null;

    const totalPaid = payments
      .filter((p) => p.status === "COMPLETED" && !p.isRefunded)
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalRefunded = payments
      .filter((p) => p.isRefunded)
      .reduce((sum, p) => sum + parseFloat(p.refundAmount || 0), 0);

    return {
      student,
      payments,
      summary: {
        count: payments.length,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalRefunded: Math.round(totalRefunded * 100) / 100,
      },
    };
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
    const { schoolId } = filtersForSearch;

    // Get active academic year
    const academicYear = await AcademicYear.findOne({
      where: { schoolId, isActive: true },
    });

    if (!academicYear) {
      // No active academic year - return students with empty fee info
      return students.map((student) => ({
        ...student.toJSON(),
        feeInfo: {
          totalFees: 0,
          totalPaid: 0,
          outstandingAmount: 0,
          feeStructure: [],
          installments: [],
          individualFees: [],
          hasAssignment: false,
        },
      }));
    }

    const academicYearId = academicYear.academicYearId;

    const studentsWithFeeInfo = await Promise.all(
      students.map(async (student) => {
        const studentData = student.toJSON();
        const studentId = studentData.studentId;
        const gradeId = studentData.gradeId;
        const classId = studentData.classId;

        // Debug logging
        console.log(
          `[FeeService] Processing student ${studentId}: gradeId=${gradeId}, classId=${classId}, academicYearId=${academicYearId}`,
        );

        // 1. Get fee structure (from ClassFee)
        // Priority: class-specific fees first, then grade-level fees
        let fees = [];

        // Try class-specific fees first
        if (classId) {
          fees = await ClassFee.findAll({
            where: { academicYearId, classId, schoolId },
            include: [
              {
                model: FeeType,
                as: "feeType",
                attributes: [
                  "feeTypeId",
                  "name",
                  "description",
                  "isMandatory",
                  "isOneTime",
                ],
              },
            ],
          });
        }

        // Fall back to grade-level fees if no class-specific fees found
        if (fees.length === 0 && gradeId) {
          fees = await ClassFee.findAll({
            where: { academicYearId, gradeId, schoolId },
            include: [
              {
                model: FeeType,
                as: "feeType",
                attributes: [
                  "feeTypeId",
                  "name",
                  "description",
                  "isMandatory",
                  "isOneTime",
                ],
              },
            ],
          });
        }

        const gradeFees = fees;

        // Calculate total annual fees from grade structure
        const totalAnnualFees = gradeFees.reduce(
          (sum, fee) => sum + parseFloat(fee.annualAmount || 0),
          0,
        );

        // 2. Get student's fee assignment
        const assignment = await StudentFeeAssignment.findOne({
          where: { studentId, academicYearId, schoolId, isActive: true },
          include: [
            {
              model: InstallmentSchedule,
              as: "schedule",
              include: [
                {
                  model: Installment,
                  as: "installments",
                  attributes: [
                    "installmentId",
                    "installmentNumber",
                    "name",
                    "dueDate",
                  ],
                  order: [["installmentNumber", "ASC"]],
                },
              ],
            },
          ],
        });

        // 3. Get installment statuses if assigned
        let installmentStatuses = [];
        let classLevelSchedule = null;

        if (assignment) {
          installmentStatuses = await StudentInstallmentStatus.findAll({
            where: {
              studentId,
              assignmentId: assignment.assignmentId,
              schoolId,
            },
            include: [
              {
                model: Installment,
                as: "installment",
                attributes: [
                  "installmentId",
                  "name",
                  "installmentNumber",
                  "dueDate",
                ],
              },
            ],
            order: [
              [
                { model: Installment, as: "installment" },
                "installmentNumber",
                "ASC",
              ],
            ],
          });
        }

        // 3b. If no installment statuses, look for class/grade level schedule
        if (installmentStatuses.length === 0) {
          console.log(
            `[FeeService] No installment statuses found for student ${studentId}, looking for schedules...`,
          );

          // Try class-level schedule first (if student has classId)
          if (classId) {
            classLevelSchedule = await InstallmentSchedule.findOne({
              where: {
                academicYearId,
                classId,
                schoolId,
              },
              include: [
                {
                  model: Installment,
                  as: "installments",
                  attributes: [
                    "installmentId",
                    "name",
                    "installmentNumber",
                    "dueDate",
                  ],
                  include: [
                    {
                      model: InstallmentFeeMapping,
                      as: "feeMappings",
                      attributes: ["feeTypeId", "percentage", "fixedAmount"],
                    },
                  ],
                },
              ],
            });
            console.log(
              `[FeeService] Class-level schedule query (classId=${classId}): found=${!!classLevelSchedule}, installments=${classLevelSchedule?.installments?.length || 0}`,
            );
          }

          // If not found OR has no installments, try grade-level schedule
          if (
            (!classLevelSchedule || !classLevelSchedule.installments?.length) &&
            gradeId
          ) {
            console.log(
              `[FeeService] Trying grade-level schedule query (gradeId=${gradeId})`,
            );
            classLevelSchedule = await InstallmentSchedule.findOne({
              where: {
                academicYearId,
                gradeId,
                schoolId,
              },
              include: [
                {
                  model: Installment,
                  as: "installments",
                  attributes: [
                    "installmentId",
                    "name",
                    "installmentNumber",
                    "dueDate",
                  ],
                  include: [
                    {
                      model: InstallmentFeeMapping,
                      as: "feeMappings",
                      attributes: ["feeTypeId", "percentage", "fixedAmount"],
                    },
                  ],
                },
              ],
            });
            console.log(
              `[FeeService] Grade-level schedule query (gradeId=${gradeId}): found=${!!classLevelSchedule}, installments=${classLevelSchedule?.installments?.length || 0}`,
            );
          }

          // Debug: if still not found, log all schedules for this academic year
          if (!classLevelSchedule) {
            const allSchedules = await InstallmentSchedule.findAll({
              where: { academicYearId, schoolId },
              attributes: ["scheduleId", "name", "gradeId", "classId"],
            });
            console.log(
              `[FeeService] All schedules for academicYearId=${academicYearId}:`,
              JSON.stringify(allSchedules.map((s) => s.toJSON())),
            );
          }
        }

        // 4. Get individual fees from assignment
        const individualFees =
          assignment?.customFees?.individualFees?.filter(
            (f) => f.status !== "CANCELLED",
          ) || [];

        // Calculate totals
        const totalPaid = installmentStatuses.reduce(
          (sum, status) => sum + parseFloat(status.paidAmount || 0),
          0,
        );

        const individualFeesTotal = individualFees.reduce(
          (sum, fee) =>
            fee.status === "PENDING" ? sum + parseFloat(fee.amount || 0) : sum,
          0,
        );

        // Use totalAnnualFees from fee structure as base
        // Only use assignment.finalAnnualAmount if it's a positive value (discount applied)
        const finalAmount =
          assignment && assignment.finalAnnualAmount > 0
            ? parseFloat(assignment.finalAnnualAmount)
            : totalAnnualFees;
        const outstandingAmount = finalAmount - totalPaid + individualFeesTotal;

        // Format installments with status
        let formattedInstallments = [];

        if (installmentStatuses.length > 0) {
          // Use student-specific installment statuses
          formattedInstallments = installmentStatuses.map((status) => ({
            installmentId: status.installmentId,
            name:
              status.installment?.name ||
              `Installment ${status.installmentNumber || ""}`,
            installmentNumber: status.installment?.installmentNumber,
            dueDate: status.dueDate,
            dueAmount: parseFloat(status.dueAmount || 0),
            paidAmount: parseFloat(status.paidAmount || 0),
            balanceAmount: parseFloat(status.balanceAmount || 0),
            status: status.status,
            paidDate: status.paidDate,
            daysOverdue: status.daysOverdue || 0,
          }));
        } else if (
          classLevelSchedule &&
          classLevelSchedule.installments &&
          classLevelSchedule.installments.length > 0
        ) {
          // Use class/grade level schedule installments (no payments yet)
          // Sort by installment number first
          const sortedInstallments = [...classLevelSchedule.installments].sort(
            (a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0),
          );

          formattedInstallments = sortedInstallments.map((inst) => {
            // Calculate amount for this installment based on fee mappings
            let dueAmount = 0;
            if (inst.feeMappings && inst.feeMappings.length > 0) {
              inst.feeMappings.forEach((mapping) => {
                if (mapping.fixedAmount) {
                  dueAmount += parseFloat(mapping.fixedAmount);
                } else if (mapping.percentage) {
                  // Find the fee type amount and calculate percentage
                  const fee = gradeFees.find(
                    (f) => f.feeTypeId === mapping.feeTypeId,
                  );
                  if (fee) {
                    dueAmount +=
                      (parseFloat(fee.annualAmount || 0) *
                        parseFloat(mapping.percentage)) /
                      100;
                  }
                }
              });
            } else {
              // Default: divide total equally among installments
              dueAmount = totalAnnualFees / (sortedInstallments.length || 1);
            }

            return {
              installmentId: inst.installmentId,
              name: inst.name || `Installment ${inst.installmentNumber}`,
              installmentNumber: inst.installmentNumber,
              dueDate: inst.dueDate,
              dueAmount: parseFloat(dueAmount.toFixed(2)),
              paidAmount: 0,
              balanceAmount: parseFloat(dueAmount.toFixed(2)),
              status: "PENDING",
              paidDate: null,
              daysOverdue:
                inst.dueDate && new Date(inst.dueDate) < new Date()
                  ? Math.floor(
                      (new Date() - new Date(inst.dueDate)) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 0,
            };
          });
        }

        // Format fee structure
        const feeStructure = gradeFees.map((fee) => ({
          classFeeId: fee.classFeeId,
          feeTypeId: fee.feeTypeId,
          feeTypeName: fee.feeType?.name || "Unknown",
          annualAmount: parseFloat(fee.annualAmount || 0),
          isMandatory: fee.isMandatory,
          isOneTime: fee.feeType?.isOneTime || false,
        }));

        return {
          ...studentData,
          feeInfo: {
            assignmentId: assignment?.assignmentId || null,
            academicYearId,
            academicYearName: academicYear.name,
            totalFees: finalAmount,
            totalPaid,
            outstandingAmount,
            discountPercentage: assignment?.discountPercentage || 0,
            discountAmount: assignment?.discountAmount || 0,
            feeStructure,
            installments: formattedInstallments,
            scheduleType:
              assignment?.schedule?.scheduleType ||
              classLevelSchedule?.scheduleType ||
              null,
            scheduleName:
              assignment?.schedule?.name || classLevelSchedule?.name || null,
            individualFees: individualFees.map((f) => ({
              ...f,
              feeTypeName:
                feeStructure.find((fs) => fs.feeTypeId === f.feeTypeId)
                  ?.feeTypeName || "Other",
            })),
            hasAssignment: !!assignment,
          },
        };
      }),
    );

    return studentsWithFeeInfo;
  }

  // ============= ACADEMIC YEAR MANAGEMENT =============

  /**
   * Create a new academic year
   */
  async createAcademicYear(academicYearData, schoolId) {
    const { name, startDate, endDate, isActive } = academicYearData;

    // If setting as active, deactivate others
    if (isActive) {
      await AcademicYear.update({ isActive: false }, { where: { schoolId } });
    }

    return await AcademicYear.create({
      name,
      startDate,
      endDate,
      isActive: isActive || false,
      schoolId,
    });
  }

  /**
   *Update academic year
   */
  async updateAcademicYear(academicYearId, updateData, schoolId) {
    const academicYear = await AcademicYear.findOne({
      where: { academicYearId, schoolId },
    });

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    // If setting as active, deactivate others
    if (updateData.isActive) {
      await AcademicYear.update(
        { isActive: false },
        { where: { schoolId, academicYearId: { [Op.ne]: academicYearId } } },
      );
    }

    await academicYear.update(updateData);
    return academicYear;
  }

  /**
   * Delete academic year
   */
  async deleteAcademicYear(academicYearId, schoolId) {
    const academicYear = await AcademicYear.findOne({
      where: { academicYearId, schoolId },
    });

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    // Check if it's the active year
    if (academicYear.isActive) {
      throw new Error("Cannot delete the active academic year");
    }

    await academicYear.destroy();
    return true;
  }

  /**
   * Set active academic year
   */
  async setActiveAcademicYear(academicYearId, schoolId) {
    const academicYear = await AcademicYear.findOne({
      where: { academicYearId, schoolId },
    });

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    // Deactivate all others
    await AcademicYear.update({ isActive: false }, { where: { schoolId } });

    // Set this one as active
    await academicYear.update({ isActive: true });
    return academicYear;
  }

  /**
   * Get academic years for a school
   */
  async getAcademicYears(schoolId) {
    return await feeDbCommands.getAcademicYears(schoolId);
  }

  /**
   * Get active academic year
   */
  async getActiveAcademicYear(schoolId) {
    return await feeDbCommands.getActiveAcademicYear(schoolId);
  }

  // ============= FEE TYPE MANAGEMENT =============

  /**
   * Create fee type
   */
  async createFeeType(feeTypeData, schoolId) {
    const { name, description, isMandatory, isOneTime } = feeTypeData;

    return await FeeType.create({
      name,
      description,
      isMandatory: isMandatory || false,
      isOneTime: isOneTime || false,
      schoolId,
    });
  }

  /**
   * Get all fee types for a school
   */
  async getAllFeeTypes(schoolId) {
    return await FeeType.findAll({
      where: { schoolId, isActive: true },
      order: [["name", "ASC"]],
    });
  }

  /**
   * Get fee types for a school
   */
  async getFeeTypes(schoolId) {
    return await feeDbCommands.getFeeTypes(schoolId, {
      isActive: true,
    });
  }

  /**
   * Update fee type
   */
  async updateFeeType(feeTypeId, updateData, schoolId) {
    const feeType = await FeeType.findOne({
      where: { feeTypeId, schoolId },
    });

    if (!feeType) {
      throw new Error("Fee type not found");
    }

    await feeType.update(updateData);
    return feeType;
  }

  /**
   * Delete fee type
   */
  async deleteFeeType(feeTypeId, schoolId) {
    const feeType = await FeeType.findOne({
      where: { feeTypeId, schoolId },
    });

    if (!feeType) {
      throw new Error("Fee type not found");
    }

    // Soft delete by setting isActive to false
    await feeType.update({ isActive: false });
    return true;
  }

  // ============= CLASS FEE MANAGEMENT =============

  /**
   * Create grade-level or class-specific fee structure for an academic year
   * @param {Object} classFeeData - Fee structure data
   * @param {string} classFeeData.academicYearId - Academic year ID
   * @param {string} classFeeData.gradeId - Grade ID (for grade-level fees, mutually exclusive with classId)
   * @param {string} classFeeData.classId - Class ID (for class-specific fees, mutually exclusive with gradeId)
   * @param {Array} classFeeData.feeStructure - Array of { feeTypeId, annualAmount, isMandatory }
   */
  async createClassFeeStructure(classFeeData, schoolId) {
    const {
      academicYearId,
      gradeId,
      classId,
      feeStructure, // Array of { feeTypeId, annualAmount, isMandatory }
    } = classFeeData;

    // Validate that exactly one of gradeId or classId is provided
    if ((gradeId && classId) || (!gradeId && !classId)) {
      throw new Error("Must provide exactly one of gradeId or classId");
    }

    return await withTransaction(async (transaction) => {
      const createdFees = [];

      for (const feeItem of feeStructure) {
        const classFee = await ClassFee.create(
          {
            academicYearId,
            gradeId: gradeId || null,
            classId: classId || null,
            feeTypeId: feeItem.feeTypeId,
            annualAmount: feeItem.annualAmount,
            isMandatory: feeItem.isMandatory || true,
            schoolId,
          },
          { transaction },
        );

        createdFees.push(classFee);
      }

      return createdFees;
    });
  }

  /**
   * Get fee structure for a grade or class
   * Priority: class-specific fees override grade-level fees
   * @param {string} academicYearId - Academic year ID
   * @param {string} classId - Class ID (optional)
   * @param {string} gradeId - Grade ID (optional)
   */
  async getClassFeeStructure(academicYearId, classId = null, gradeId = null) {
    // If classId provided, get class-specific fees first
    if (classId) {
      const classFees = await feeDbCommands.getClassFees(
        academicYearId,
        classId,
      );
      if (classFees.length > 0) {
        return classFees;
      }
    }

    // Fall back to grade-level fees or if only gradeId provided
    if (gradeId) {
      return await feeDbCommands.getGradeFees(academicYearId, gradeId);
    }

    // If classId provided but no fees found, try to get gradeId and fetch grade-level fees
    if (classId && !gradeId) {
      // This would require looking up the class to get its gradeId
      // For now, return empty if no class-specific fees found
      return [];
    }

    return [];
  }

  // ============= INSTALLMENT SCHEDULE MANAGEMENT =============

  /**
   * Create installment schedule for a grade, class, or student
   * @param {Object} scheduleData - Schedule configuration
   * @param {string} scheduleData.gradeId - Grade ID (for grade-level, mutually exclusive)
   * @param {string} scheduleData.classId - Class ID (for class-specific, mutually exclusive)
   * @param {string} scheduleData.studentId - Student ID (for student-specific, mutually exclusive)
   */
  async createInstallmentSchedule(scheduleData, schoolId) {
    const {
      academicYearId,
      name,
      gradeId,
      classId,
      studentId, // Optional for student-specific schedules
      scheduleType,
      installments, // Array of installment details
      createdBy,
    } = scheduleData;

    // Validate that exactly one of gradeId, classId, or studentId is provided
    const setCount = [gradeId, classId, studentId].filter(Boolean).length;
    if (setCount !== 1) {
      throw new Error(
        "Must provide exactly one of gradeId, classId, or studentId",
      );
    }

    return await withTransaction(async (transaction) => {
      // Create the schedule
      const schedule = await InstallmentSchedule.create(
        {
          academicYearId,
          name,
          gradeId: gradeId || null,
          classId: classId || null,
          studentId: studentId || null,
          scheduleType: scheduleType || SCHEDULE_TYPES.QUARTERLY,
          totalInstallments: installments.length,
          schoolId,
          createdBy,
        },
        { transaction },
      );

      // Create installments
      const createdInstallments = [];
      for (let i = 0; i < installments.length; i++) {
        const installmentData = installments[i];

        const installment = await Installment.create(
          {
            scheduleId: schedule.scheduleId,
            installmentNumber: i + 1,
            name: installmentData.name,
            dueDate: installmentData.dueDate,
            schoolId,
          },
          { transaction },
        );

        // Create fee mappings for this installment
        const mappings = [];
        for (const feeMapping of installmentData.feeMappings) {
          const mapping = await InstallmentFeeMapping.create(
            {
              installmentId: installment.installmentId,
              feeTypeId: feeMapping.feeTypeId,
              percentage: feeMapping.percentage || 100.0,
              fixedAmount: feeMapping.fixedAmount || null,
              schoolId,
            },
            { transaction },
          );

          mappings.push(mapping);
        }

        createdInstallments.push({
          ...installment.toJSON(),
          feeMappings: mappings,
        });
      }

      return {
        schedule: schedule.toJSON(),
        installments: createdInstallments,
      };
    });
  }

  /**
   * Create default quarterly schedule for a grade or class
   * @param {string} academicYearId - Academic year ID
   * @param {string} gradeId - Grade ID (optional, for grade-level schedule)
   * @param {string} classId - Class ID (optional, for class-specific schedule)
   */
  async createDefaultQuarterlySchedule(
    academicYearId,
    targetId, // Can be gradeId or classId
    schoolId,
    createdBy,
    isGradeLevel = false, // Flag to indicate if targetId is gradeId
  ) {
    const academicYear = await AcademicYear.findOne({
      where: { academicYearId, schoolId },
    });

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    // Determine if we're creating grade-level or class-specific schedule
    const gradeId = isGradeLevel ? targetId : null;
    const classId = !isGradeLevel ? targetId : null;

    // Look up the grade name for display
    let gradeName = gradeId;
    if (isGradeLevel && gradeId) {
      const classWithGrade = await Class.findOne({
        where: { gradeId, schoolId },
        attributes: ["grade"],
      });
      if (classWithGrade) {
        gradeName = classWithGrade.grade;
      }
    }

    // Get fee structure (either grade-level or class-specific)
    const fees = isGradeLevel
      ? await feeDbCommands.getGradeFees(academicYearId, gradeId)
      : await this.getClassFeeStructure(academicYearId, classId);

    if (fees.length === 0) {
      throw new Error(
        `No fee structure found for this ${isGradeLevel ? "grade" : "class"}`,
      );
    }

    // Create quarterly installments
    const installments = [
      {
        name: "Q1 2024-25",
        dueDate: "2024-07-15",
        feeMappings: this.generateQuarterlyFeeMappings(fees, 1),
      },
      {
        name: "Q2 2024-25",
        dueDate: "2024-10-15",
        feeMappings: this.generateQuarterlyFeeMappings(fees, 2),
      },
      {
        name: "Q3 2024-25",
        dueDate: "2025-01-15",
        feeMappings: this.generateQuarterlyFeeMappings(fees, 3),
      },
      {
        name: "Q4 2024-25",
        dueDate: "2025-03-15",
        feeMappings: this.generateQuarterlyFeeMappings(fees, 4),
      },
    ];

    const scheduleData = {
      academicYearId,
      name: isGradeLevel
        ? `Grade ${gradeName} Quarterly Payment`
        : `Class ${classId} Quarterly Payment`,
      gradeId,
      classId,
      scheduleType: SCHEDULE_TYPES.QUARTERLY,
      installments,
      createdBy,
    };

    return await this.createInstallmentSchedule(scheduleData, schoolId);
  }

  /**
   * Generate quarterly fee mappings based on fee types
   */
  generateQuarterlyFeeMappings(classFees, quarter) {
    const mappings = [];

    classFees.forEach((classFee) => {
      const feeTypeId = classFee.feeTypeId;
      const feeTypeName = classFee.feeType?.name;

      // Default percentage distribution
      let percentage = 25.0; // 25% per quarter by default

      // Special handling for one-time fees
      if (ONE_TIME_FEE_TYPES.includes(feeTypeName?.toUpperCase())) {
        percentage = quarter === 1 ? 100.0 : 0.0; // Only in first quarter
      }
      // Special handling for specific fee types
      else if (feeTypeName === "FINE") {
        percentage = quarter === 3 ? 100.0 : 0.0; // Typically collected in Q3
      } else if (feeTypeName === "EXAM") {
        percentage = quarter === 2 || quarter === 4 ? 50.0 : 0.0; // Split between Q2 and Q4
      } else if (feeTypeName === "SPORTS") {
        percentage = quarter === 2 || quarter === 4 ? 50.0 : 0.0; // Split between Q2 and Q4
      }

      if (percentage > 0) {
        mappings.push({
          feeTypeId,
          percentage,
        });
      }
    });

    return mappings;
  }

  // ============= STUDENT FEE ASSIGNMENT =============

  /**
   * Assign fee schedule to student
   */
  async assignFeeScheduleToStudent(assignmentData, schoolId) {
    const {
      studentId,
      academicYearId,
      scheduleId,
      customFees,
      discountPercentage = 0,
      discountAmount = 0,
      assignedBy,
    } = assignmentData;

    return await withTransaction(async (transaction) => {
      // Calculate total annual amount
      const totalAmount = await this.calculateStudentTotalAnnualAmount(
        studentId,
        academicYearId,
        customFees,
      );

      const finalAmount =
        totalAmount - discountAmount - (totalAmount * discountPercentage) / 100;

      // Create assignment
      const assignment = await StudentFeeAssignment.create(
        {
          studentId,
          academicYearId,
          scheduleId,
          customFees,
          totalAnnualAmount: totalAmount,
          discountPercentage,
          discountAmount,
          finalAnnualAmount: finalAmount,
          schoolId,
          assignedBy,
        },
        { transaction },
      );

      // Create installment statuses
      await feeDbCommands.createInstallmentStatusesForAssignment(
        assignment.assignmentId,
        transaction,
      );

      return assignment;
    });
  }

  /**
   * Calculate student's total annual amount
   */
  async calculateStudentTotalAnnualAmount(
    studentId,
    academicYearId,
    customFees = null,
  ) {
    // This would need to be implemented based on your student-class relationship
    // For now, returning a placeholder
    const baseAmount = customFees?.totalAmount || 100000; // ₹1,00,000 as example
    return baseAmount;
  }

  /**
   * Get student fee assignment
   */
  async getStudentFeeAssignment(studentId, academicYearId) {
    return await StudentFeeAssignment.findOne({
      where: {
        studentId,
        academicYearId,
        isActive: true,
      },
    });
  }

  /**
   * Update an assignment's discount fields (and recompute finalAnnualAmount).
   * Only discount-related fields are honored to keep the surface narrow.
   */
  async updateStudentFeeAssignment(assignmentId, schoolId, updates = {}) {
    const assignment = await StudentFeeAssignment.findOne({
      where: { assignmentId, schoolId, isActive: true },
    });
    if (!assignment) throw new Error("Assignment not found");

    const total = parseFloat(assignment.totalAnnualAmount || 0);
    const nextPercentage =
      updates.discountPercentage !== undefined
        ? Math.max(0, Math.min(100, parseFloat(updates.discountPercentage) || 0))
        : parseFloat(assignment.discountPercentage || 0);
    const nextAmount =
      updates.discountAmount !== undefined
        ? Math.max(0, parseFloat(updates.discountAmount) || 0)
        : parseFloat(assignment.discountAmount || 0);

    const finalAmount = Math.max(
      0,
      Math.round(
        (total - nextAmount - (total * nextPercentage) / 100) * 100,
      ) / 100,
    );

    await assignment.update({
      discountPercentage: nextPercentage,
      discountAmount: Math.round(nextAmount * 100) / 100,
      finalAnnualAmount: finalAmount,
    });

    return assignment;
  }

  // ============= ENHANCED PAYMENT PROCESSING =============

  /**
   * Resolve the schedule that applies to a student (class first, then grade).
   */
  async _findScheduleForStudent({ student, academicYearId, schoolId, transaction }) {
    let schedule = null;
    if (student.classId) {
      schedule = await InstallmentSchedule.findOne({
        where: { academicYearId, classId: student.classId, schoolId, isActive: true },
        transaction,
      });
    }
    if (!schedule && student.gradeId) {
      schedule = await InstallmentSchedule.findOne({
        where: { academicYearId, gradeId: student.gradeId, schoolId, isActive: true },
        transaction,
      });
    }
    return schedule;
  }

  /**
   * Resolve the fee structure that applies (class-specific first, then grade).
   */
  async _findClassFeesForStudent({ student, academicYearId, schoolId, transaction }) {
    let classFees = [];
    if (student.classId) {
      classFees = await ClassFee.findAll({
        where: { academicYearId, classId: student.classId, schoolId },
        transaction,
      });
    }
    if (classFees.length === 0 && student.gradeId) {
      classFees = await ClassFee.findAll({
        where: { academicYearId, gradeId: student.gradeId, schoolId },
        transaction,
      });
    }
    return classFees;
  }

  /**
   * Materialize student_installment_status rows for an assignment by walking
   * the schedule + installment_fee_mappings + class_fees. After creating fresh
   * rows, replay any historical fee_payments oldest-first so prior payments
   * aren't lost when statuses are backfilled retroactively.
   */
  async _materializeInstallmentStatuses({
    assignment,
    schedule,
    classFees,
    schoolId,
    transaction,
  }) {
    const installments = await Installment.findAll({
      where: { scheduleId: schedule.scheduleId, isActive: true },
      include: [
        {
          model: InstallmentFeeMapping,
          as: "feeMappings",
          attributes: ["feeTypeId", "percentage", "fixedAmount"],
        },
      ],
      order: [["installmentNumber", "ASC"]],
      transaction,
    });

    const totalAnnualAmount = classFees.reduce(
      (sum, fee) => sum + parseFloat(fee.annualAmount || 0),
      0,
    );
    const fallbackPerInstallment =
      installments.length > 0 ? totalAnnualAmount / installments.length : 0;

    const created = [];
    for (const inst of installments) {
      let dueAmount = 0;
      const mappings = inst.feeMappings || [];
      if (mappings.length > 0) {
        for (const mapping of mappings) {
          if (mapping.fixedAmount) {
            dueAmount += parseFloat(mapping.fixedAmount);
          } else if (mapping.percentage) {
            const fee = classFees.find((f) => f.feeTypeId === mapping.feeTypeId);
            if (fee) {
              dueAmount +=
                (parseFloat(fee.annualAmount || 0) *
                  parseFloat(mapping.percentage)) /
                100;
            }
          }
        }
      } else {
        dueAmount = fallbackPerInstallment;
      }

      const rounded = Math.round(dueAmount * 100) / 100;
      const row = await StudentInstallmentStatus.create(
        {
          studentId: assignment.studentId,
          installmentId: inst.installmentId,
          assignmentId: assignment.assignmentId,
          dueAmount: rounded,
          balanceAmount: rounded,
          paidAmount: 0,
          status: "PENDING",
          dueDate: inst.dueDate,
          schoolId,
        },
        { transaction },
      );
      created.push(row);
    }

    // Replay any pre-existing payments against the newly created statuses
    // so historical payments don't disappear when we backfill.
    const priorPayments = await FeePayment.findAll({
      where: {
        studentId: assignment.studentId,
        assignmentId: assignment.assignmentId,
        schoolId,
        status: "COMPLETED",
      },
      transaction,
    });
    // Effective reduction = cash amount + discount granted (matches the live flow).
    let priorTotal = priorPayments.reduce(
      (sum, p) =>
        sum +
        parseFloat(p.amount || 0) +
        parseFloat(p.discountApplied || 0),
      0,
    );

    if (priorTotal > 0) {
      // Apply oldest-first by due date.
      const sorted = [...created].sort((a, b) =>
        String(a.dueDate).localeCompare(String(b.dueDate)),
      );
      for (const status of sorted) {
        if (priorTotal <= 0) break;
        const balance = parseFloat(status.balanceAmount);
        if (balance <= 0) continue;
        const applied = Math.min(priorTotal, balance);
        const newPaid = parseFloat(status.paidAmount) + applied;
        const newBalance = Math.max(0, parseFloat(status.dueAmount) - newPaid);
        const newStatus =
          newBalance <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : status.status;
        await status.update(
          {
            paidAmount: Math.round(newPaid * 100) / 100,
            balanceAmount: Math.round(newBalance * 100) / 100,
            status: newStatus,
            paidDate: newStatus === "PAID" ? new Date() : status.paidDate,
          },
          { transaction },
        );
        priorTotal -= applied;
      }
    }

    return created;
  }

  /**
   * Make sure the student has a usable StudentFeeAssignment + matching
   * StudentInstallmentStatus rows. Handles three states:
   *   1. No assignment yet — create it from the active year's schedule.
   *   2. Assignment exists but schedule_id is empty — attach a schedule.
   *   3. Assignment + schedule exist but installment_status rows are missing —
   *      backfill them and replay prior fee_payments.
   */
  async _ensureStudentAssignment({ studentId, schoolId, assignedBy, transaction }) {
    const academicYear = await AcademicYear.findOne({
      where: { schoolId, isActive: true },
      transaction,
    });
    if (!academicYear) {
      throw new Error(
        "No active academic year configured. Cannot record payment.",
      );
    }
    const academicYearId = academicYear.academicYearId;

    const student = await Student.findOne({
      where: { studentId, schoolId },
      transaction,
    });
    if (!student) throw new Error("Student not found");

    let assignment = await StudentFeeAssignment.findOne({
      where: { studentId, academicYearId, schoolId, isActive: true },
      transaction,
    });

    const schedule = await this._findScheduleForStudent({
      student,
      academicYearId,
      schoolId,
      transaction,
    });
    if (!schedule) {
      throw new Error(
        "No fee schedule configured for this student's class or grade. Configure a schedule before recording payments.",
      );
    }

    const classFees = await this._findClassFeesForStudent({
      student,
      academicYearId,
      schoolId,
      transaction,
    });
    const totalAnnualAmount = classFees.reduce(
      (sum, fee) => sum + parseFloat(fee.annualAmount || 0),
      0,
    );

    if (!assignment) {
      assignment = await StudentFeeAssignment.create(
        {
          studentId,
          academicYearId,
          scheduleId: schedule.scheduleId,
          totalAnnualAmount,
          finalAnnualAmount: totalAnnualAmount,
          schoolId,
          assignedBy,
        },
        { transaction },
      );
    } else if (
      !assignment.scheduleId ||
      Number(assignment.totalAnnualAmount || 0) === 0
    ) {
      // Pre-existing "individual fees only" assignment row. Attach a schedule
      // and totals so the rest of the fee flow works against it.
      await assignment.update(
        {
          scheduleId: assignment.scheduleId || schedule.scheduleId,
          totalAnnualAmount:
            Number(assignment.totalAnnualAmount || 0) === 0
              ? totalAnnualAmount
              : assignment.totalAnnualAmount,
          finalAnnualAmount:
            Number(assignment.finalAnnualAmount || 0) === 0
              ? totalAnnualAmount
              : assignment.finalAnnualAmount,
        },
        { transaction },
      );
    }

    const existingStatusCount = await StudentInstallmentStatus.count({
      where: { studentId, assignmentId: assignment.assignmentId, schoolId },
      transaction,
    });
    if (existingStatusCount === 0) {
      await this._materializeInstallmentStatuses({
        assignment,
        schedule,
        classFees,
        schoolId,
        transaction,
      });
    }

    return assignment;
  }

  /**
   * Record fee payment with installment tracking.
   *
   * Accepts:
   *   installmentIds: string[]  preferred — explicit list to mark paid
   *   installmentId : string    legacy single id (still honored)
   * If neither is given (Full / Custom payment), the amount is distributed
   * over pending installments oldest-first.
   */
  async recordFeePayment(paymentData, schoolId) {
    const {
      studentId,
      installmentId,
      installmentIds,
      amount,
      paymentMethod,
      paymentDate,
      paymentType,
      lateFeeAmount = 0,
      discountApplied = 0,
      notes,
      collectedBy,
    } = paymentData;

    const cashAmount = parseFloat(amount);
    const discount = parseFloat(discountApplied) || 0;
    if (!Number.isFinite(cashAmount) || cashAmount < 0) {
      throw new Error("Amount must be a non-negative number");
    }
    if (discount < 0) {
      throw new Error("Discount cannot be negative");
    }
    // Total amount applied to installment balances = cash collected + discount granted.
    // We store cashAmount on FeePayment.amount and discount on FeePayment.discountApplied
    // so receipts/reports stay accurate, but balances reduce by the full effective amount.
    const totalAmount = cashAmount + discount;
    if (totalAmount <= 0) {
      throw new Error("Either an amount or a discount must be provided");
    }

    return await withTransaction(async (transaction) => {
      // Resolve / auto-create the assignment.
      const assignment = await this._ensureStudentAssignment({
        studentId,
        schoolId,
        assignedBy: collectedBy,
        transaction,
      });

      // Decide which installments this payment applies to.
      let targetInstallmentIds = Array.isArray(installmentIds)
        ? [...installmentIds]
        : [];
      if (targetInstallmentIds.length === 0 && installmentId) {
        targetInstallmentIds = [installmentId];
      }

      let targetStatuses = [];
      if (targetInstallmentIds.length > 0) {
        targetStatuses = await StudentInstallmentStatus.findAll({
          where: {
            studentId,
            installmentId: { [Op.in]: targetInstallmentIds },
            schoolId,
          },
          transaction,
        });
        // Preserve the order requested by the caller.
        const order = new Map(targetInstallmentIds.map((id, i) => [id, i]));
        targetStatuses.sort(
          (a, b) =>
            (order.get(a.installmentId) ?? 0) -
            (order.get(b.installmentId) ?? 0),
        );
      } else {
        // Distribute oldest-first across anything still owing.
        targetStatuses = await StudentInstallmentStatus.findAll({
          where: {
            studentId,
            schoolId,
            status: { [Op.notIn]: ["PAID", "CANCELLED"] },
            balanceAmount: { [Op.gt]: 0 },
          },
          order: [["dueDate", "ASC"]],
          transaction,
        });
      }

      // Generate one receipt number for the whole transaction.
      const receiptNumber = `RCP${Date.now()}`;

      // Apply the payment across the targeted statuses.
      let remaining = totalAmount;
      const updatedStatuses = [];
      for (const status of targetStatuses) {
        if (remaining <= 0) break;
        const balance = parseFloat(status.balanceAmount);
        if (balance <= 0) continue;
        const applied = Math.min(remaining, balance);
        const newPaid = parseFloat(status.paidAmount) + applied;
        const newBalance = Math.max(0, parseFloat(status.dueAmount) - newPaid);
        const newStatus =
          newBalance <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : status.status;
        await status.update(
          {
            paidAmount: Math.round(newPaid * 100) / 100,
            balanceAmount: Math.round(newBalance * 100) / 100,
            status: newStatus,
            paidDate: newStatus === "PAID" ? new Date() : status.paidDate,
          },
          { transaction },
        );
        updatedStatuses.push({
          installmentId: status.installmentId,
          applied: Math.round(applied * 100) / 100,
          newStatus,
        });
        remaining -= applied;
      }

      // The fee_payments table stores at most one installment_id; record the
      // first one we touched (or null if this was an advance with nothing
      // outstanding). The truth about per-installment paid/balance lives in
      // student_installment_status which we just updated above.
      const primaryInstallmentId = updatedStatuses[0]?.installmentId || null;

      const payment = await FeePayment.create(
        {
          studentId,
          assignmentId: assignment.assignmentId,
          installmentId: primaryInstallmentId,
          academicYearId: assignment.academicYearId,
          amount: cashAmount,
          paymentMethod,
          paymentDate,
          receiptNumber,
          paymentType:
            paymentType ||
            (updatedStatuses.length > 1 ? "PARTIAL" : "INSTALLMENT"),
          lateFeeAmount,
          discountApplied: discount,
          notes,
          schoolId,
          collectedBy,
        },
        { transaction },
      );

      return {
        ...payment.toJSON(),
        installmentsApplied: updatedStatuses,
        unappliedAmount: Math.round(remaining * 100) / 100,
      };
    });
  }

  // ============= REPORTING AND ANALYTICS =============

  /**
   * Get student fee summary with installment tracking (includes individual fees)
   */
  async getStudentFeeSummary(studentId, academicYearId, schoolId = null) {
    const baseSummary = await feeDbCommands.getStudentFeeSummary(
      studentId,
      academicYearId,
    );

    // Get individual fees if schoolId is provided
    if (schoolId) {
      const assignment = await StudentFeeAssignment.findOne({
        where: { studentId, academicYearId, schoolId, isActive: true },
      });

      if (assignment?.customFees?.individualFees) {
        const individualFees = assignment.customFees.individualFees.filter(
          (f) => f.status !== "CANCELLED",
        );

        const pendingIndividual = individualFees.filter(
          (f) => f.status === "PENDING",
        );
        const paidIndividual = individualFees.filter(
          (f) => f.status === "PAID",
        );

        const pendingAmount = pendingIndividual.reduce(
          (sum, f) => sum + parseFloat(f.amount),
          0,
        );
        const paidAmount = paidIndividual.reduce(
          (sum, f) => sum + parseFloat(f.amount),
          0,
        );

        return {
          ...baseSummary,
          individualFees: {
            pending: pendingAmount,
            paid: paidAmount,
            total: pendingAmount + paidAmount,
            count: individualFees.length,
            items: individualFees,
          },
          grandTotal:
            (baseSummary?.totalAmount || 0) + pendingAmount + paidAmount,
          grandTotalPending: (baseSummary?.pendingAmount || 0) + pendingAmount,
        };
      }
    }

    return baseSummary;
  }

  /**
   * Get student installment details
   */
  async getStudentInstallments(studentId, academicYearId) {
    return await feeDbCommands.calculateStudentInstallmentAmounts(
      studentId,
      academicYearId,
    );
  }

  /**
   * Get overdue installments
   */
  async getOverdueInstallments(schoolId, filters = {}) {
    return await feeDbCommands.getOverdueInstallments(schoolId, filters);
  }

  /**
   * Get fee collection report
   */
  async getFeeCollectionReport(schoolId, startDate, endDate, options = {}) {
    return await feeDbCommands.getFeeCollectionSummary(
      schoolId,
      startDate,
      endDate,
      options,
    );
  }

  /**
   * Get dashboard statistics
   */
  async getFeesDashboardStats(schoolId, academicYearId) {
    const [totalStudents, totalCollected, pendingAmount, overdueCount] =
      await Promise.all([
        StudentFeeAssignment.count({
          where: { schoolId, academicYearId, isActive: true },
        }),
        FeePayment.sum("amount", {
          where: { schoolId, academicYearId, status: PAYMENT_STATUS.COMPLETED },
        }),
        StudentInstallmentStatus.sum("balanceAmount", {
          where: { schoolId, status: INSTALLMENT_STATUS.PENDING },
        }),
        StudentInstallmentStatus.count({
          where: { schoolId, status: INSTALLMENT_STATUS.OVERDUE },
        }),
      ]);

    return {
      totalStudents: totalStudents || 0,
      totalCollected: totalCollected || 0,
      pendingAmount: pendingAmount || 0,
      overdueCount: overdueCount || 0,
    };
  }

  // ============= ADDITIONAL SCHEDULE METHODS =============

  /**
   * Create default monthly schedule for grade
   */
  async createDefaultMonthlySchedule(
    academicYearId,
    gradeId,
    schoolId,
    createdBy,
  ) {
    const academicYear = await AcademicYear.findOne({
      where: { academicYearId, schoolId },
    });

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    // Look up the grade name for display
    let gradeName = gradeId;
    const classWithGrade = await Class.findOne({
      where: { gradeId, schoolId },
      attributes: ["grade"],
    });
    if (classWithGrade) {
      gradeName = classWithGrade.grade;
    }

    // Get grade-level fees
    const fees = await feeDbCommands.getGradeFees(academicYearId, gradeId);

    if (fees.length === 0) {
      throw new Error("No fee structure found for this grade");
    }

    // Create monthly installments (April to March)
    const months = [
      { name: "April 2024", dueDate: "2024-04-15" },
      { name: "May 2024", dueDate: "2024-05-15" },
      { name: "June 2024", dueDate: "2024-06-15" },
      { name: "July 2024", dueDate: "2024-07-15" },
      { name: "August 2024", dueDate: "2024-08-15" },
      { name: "September 2024", dueDate: "2024-09-15" },
      { name: "October 2024", dueDate: "2024-10-15" },
      { name: "November 2024", dueDate: "2024-11-15" },
      { name: "December 2024", dueDate: "2024-12-15" },
      { name: "January 2025", dueDate: "2025-01-15" },
      { name: "February 2025", dueDate: "2025-02-15" },
      { name: "March 2025", dueDate: "2025-03-15" },
    ];

    const installments = months.map((month, index) => ({
      name: month.name,
      dueDate: month.dueDate,
      feeMappings: this.generateMonthlyFeeMappings(fees, index + 1),
    }));

    const scheduleData = {
      academicYearId,
      name: `Grade ${gradeName} Monthly Payment`,
      gradeId,
      scheduleType: SCHEDULE_TYPES.MONTHLY,
      installments,
      createdBy,
    };

    return await this.createInstallmentSchedule(scheduleData, schoolId);
  }

  /**
   * Generate monthly fee mappings based on fee types
   */
  generateMonthlyFeeMappings(classFees, month) {
    const mappings = [];

    classFees.forEach((classFee) => {
      const feeTypeId = classFee.feeTypeId;
      const feeTypeName = classFee.feeType?.name;

      // Default percentage distribution (1/12 per month)
      let percentage = 8.33; // ~1/12 of annual fee

      // Special handling for one-time fees
      if (ONE_TIME_FEE_TYPES.includes(feeTypeName?.toUpperCase())) {
        percentage = month === 1 ? 100.0 : 0.0; // Only in first month (April)
      }
      // Special handling for exam fees (typically in quarters)
      else if (feeTypeName === "EXAM") {
        percentage = [7, 10, 1, 3].includes(month) ? 25.0 : 0.0; // Oct, Jan, Apr, June
      }

      if (percentage > 0) {
        mappings.push({
          feeTypeId,
          percentage,
        });
      }
    });

    return mappings;
  }

  /**
   * Get schedules by grade
   */
  async getSchedulesByGrade(academicYearId, gradeId, schoolId) {
    const schedules = await InstallmentSchedule.findAll({
      where: {
        academicYearId,
        gradeId,
        schoolId,
        isActive: true,
      },
      include: [
        {
          model: Installment,
          as: "installments",
          include: [
            {
              model: InstallmentFeeMapping,
              as: "feeMappings",
              include: [
                {
                  model: FeeType,
                  as: "feeType",
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        [
          { model: Installment, as: "installments" },
          "installmentNumber",
          "ASC",
        ],
      ],
    });

    return schedules;
  }

  // ============= GRADE FEE STRUCTURE METHODS =============

  /**
   * Create grade fee structure with installments
   * This method creates a complete fee structure for a grade including:
   * 1. Class fees for each fee type
   * 2. Installment schedule
   * 3. Fee mappings for each installment
   */
  async createGradeFeeStructure(feeStructureData, schoolId) {
    const {
      academicYearId,
      gradeId,
      scheduleId,
      feeStructure: feeStructureInput, // Array of { feeTypeId, annualAmount, installmentAmounts: {1: amount, 2: amount, ...} }
      feeStructures, // Alternative field name
      createdBy,
    } = feeStructureData;

    // Support both feeStructure and feeStructures field names
    const feeStructure = feeStructureInput || feeStructures;

    if (!feeStructure || feeStructure.length === 0) {
      throw new Error("Fee structure data is required");
    }

    return await withTransaction(async (transaction) => {
      // 1. Create class fees for each fee type
      const classFeeData = {
        academicYearId,
        gradeId,
        feeStructure: feeStructure.map((fee) => ({
          feeTypeId: fee.feeTypeId,
          annualAmount: fee.annualAmount || fee.amount, // Support both field names
          isMandatory: fee.isMandatory || true,
        })),
      };

      const classFees = await this.createClassFeeStructure(
        classFeeData,
        schoolId,
      );

      // 2. Update installment fee mappings if installmentAmounts are provided
      if (feeStructure.some((fee) => fee.installmentAmounts)) {
        const schedule = await InstallmentSchedule.findOne({
          where: { scheduleId, schoolId },
          include: [
            {
              model: Installment,
              as: "installments",
            },
          ],
          transaction,
        });

        if (!schedule) {
          throw new Error("Installment schedule not found");
        }

        // Update fee mappings for each installment
        for (const fee of feeStructure) {
          if (fee.installmentAmounts) {
            for (const [installmentNum, amount] of Object.entries(
              fee.installmentAmounts,
            )) {
              const installment = schedule.installments.find(
                (inst) => inst.installmentNumber === parseInt(installmentNum),
              );

              if (installment) {
                // Create or update mapping
                await InstallmentFeeMapping.upsert(
                  {
                    installmentId: installment.installmentId,
                    feeTypeId: fee.feeTypeId,
                    fixedAmount: amount,
                    percentage: null,
                    schoolId,
                  },
                  { transaction },
                );
              }
            }
          }
        }
      }

      return {
        classFees,
        message:
          "Grade fee structure created successfully with installment mappings",
      };
    });
  }

  /**
   * Get grade fee structure with installments
   */
  async getGradeFeeStructure(academicYearId, gradeId, schoolId) {
    // Get class fees for the grade
    const classFees = await ClassFee.findAll({
      where: {
        academicYearId,
        gradeId,
        schoolId,
      },
      include: [
        {
          model: FeeType,
          as: "feeType",
        },
      ],
    });

    // Get installment schedules for the grade
    const schedules = await this.getSchedulesByGrade(
      academicYearId,
      gradeId,
      schoolId,
    );

    return {
      classFees,
      schedules,
    };
  }

  /**
   * Delete grade fee structure
   */
  async deleteGradeFeeStructure(academicYearId, gradeId, schoolId) {
    return await withTransaction(async (transaction) => {
      // Delete class fees
      await ClassFee.destroy({
        where: {
          academicYearId,
          gradeId,
          schoolId,
        },
        transaction,
      });

      // Soft delete installment schedules
      await InstallmentSchedule.update(
        { isActive: false },
        {
          where: {
            academicYearId,
            gradeId,
            schoolId,
          },
          transaction,
          validate: false, // Skip model validation since we're only updating isActive
        },
      );

      return {
        success: true,
        message: "Grade fee structure deleted successfully",
      };
    });
  }

  // ============= STUDENT INDIVIDUAL FEES =============
  // Stored in StudentFeeAssignment.customFees.individualFees

  /**
   * Get or create student fee assignment for storing individual fees
   */
  async getOrCreateStudentAssignment(studentId, academicYearId, schoolId) {
    let assignment = await StudentFeeAssignment.findOne({
      where: { studentId, academicYearId, schoolId, isActive: true },
    });

    if (!assignment) {
      // Create assignment for individual fees only (no schedule required)
      assignment = await StudentFeeAssignment.create({
        studentId,
        academicYearId,
        schoolId,
        scheduleId: null,
        totalAnnualAmount: 0,
        finalAnnualAmount: 0,
        customFees: { overrides: [], individualFees: [] },
      });
    } else if (!assignment.customFees) {
      // Initialize customFees if it doesn't exist
      assignment.customFees = { overrides: [], individualFees: [] };
      await assignment.save();
    } else if (!assignment.customFees.individualFees) {
      // Initialize individualFees array if it doesn't exist
      assignment.customFees = {
        ...assignment.customFees,
        individualFees: [],
      };
      await assignment.save();
    }

    return assignment;
  }

  /**
   * Create individual fee for a student (stored in customFees.individualFees)
   */
  async createStudentIndividualFee(feeData, schoolId) {
    const {
      studentId,
      academicYearId,
      feeTypeId,
      amount,
      description,
      dueDate,
      createdBy,
    } = feeData;

    // Validate student exists
    const student = await Student.findOne({
      where: { studentId, schoolId },
    });
    if (!student) {
      throw new Error("Student not found");
    }

    // Validate fee type exists
    const feeType = await FeeType.findOne({
      where: { feeTypeId, schoolId },
    });
    if (!feeType) {
      throw new Error("Fee type not found");
    }

    // Get or create assignment
    const assignment = await this.getOrCreateStudentAssignment(
      studentId,
      academicYearId,
      schoolId,
    );

    // Create individual fee entry
    const individualFee = {
      id: generateCustomIdWithPrefix("INDFEE"),
      feeTypeId,
      amount: parseFloat(amount),
      description: description || null,
      dueDate,
      status: "PENDING",
      createdBy,
      createdAt: new Date().toISOString(),
      paidDate: null,
      waivedBy: null,
      waiverReason: null,
    };

    // Add to customFees.individualFees
    const customFees = JSON.parse(
      JSON.stringify(
        assignment.customFees || {
          overrides: [],
          individualFees: [],
        },
      ),
    );
    customFees.individualFees = customFees.individualFees || [];
    customFees.individualFees.push(individualFee);

    // Use direct update to ensure JSONB gets saved
    await StudentFeeAssignment.update(
      { customFees },
      { where: { assignmentId: assignment.assignmentId } },
    );

    return {
      ...individualFee,
      studentId,
      academicYearId,
      schoolId,
      assignmentId: assignment.assignmentId,
    };
  }

  /**
   * Get individual fees for a student
   */
  async getStudentIndividualFees(studentId, academicYearId, status, schoolId) {
    const assignment = await StudentFeeAssignment.findOne({
      where: { studentId, academicYearId, schoolId, isActive: true },
    });

    if (!assignment || !assignment.customFees?.individualFees) {
      return [];
    }

    let fees = assignment.customFees.individualFees.filter(
      (f) => f.status !== "CANCELLED",
    );

    // Filter by status if provided
    if (status) {
      fees = fees.filter((f) => f.status === status);
    }

    // Enrich with fee type names
    const feeTypeIds = [...new Set(fees.map((f) => f.feeTypeId))];
    const feeTypes = await FeeType.findAll({
      where: { feeTypeId: feeTypeIds },
    });
    const feeTypeMap = new Map(feeTypes.map((ft) => [ft.feeTypeId, ft]));

    return fees.map((fee) => ({
      ...fee,
      individualFeeId: fee.id,
      studentId,
      academicYearId,
      schoolId,
      feeType: feeTypeMap.get(fee.feeTypeId),
    }));
  }

  /**
   * Get all individual fees with filters (across all students)
   */
  async getAllIndividualFees(filters, schoolId) {
    const { academicYearId, status, classId, gradeId } = filters;

    // Build base query
    const where = { schoolId, isActive: true };
    if (academicYearId) where.academicYearId = academicYearId;

    // If filtering by class or grade, get students first
    if (classId || gradeId) {
      const studentWhere = { schoolId };
      if (classId) studentWhere.classId = classId;
      if (gradeId) studentWhere.gradeId = gradeId;

      const students = await Student.findAll({
        where: studentWhere,
        attributes: ["studentId"],
      });
      const studentIds = students.map((s) => s.studentId);
      where.studentId = { [Op.in]: studentIds };
    }

    // Get all assignments with individual fees
    const assignments = await StudentFeeAssignment.findAll({ where });

    // Extract all individual fees
    const allFees = [];
    const studentIds = new Set();

    for (const assignment of assignments) {
      const individualFees = assignment.customFees?.individualFees || [];
      for (const fee of individualFees) {
        if (fee.status === "CANCELLED") continue;
        if (status && fee.status !== status) continue;

        allFees.push({
          ...fee,
          individualFeeId: fee.id,
          studentId: assignment.studentId,
          academicYearId: assignment.academicYearId,
          schoolId,
          assignmentId: assignment.assignmentId,
        });
        studentIds.add(assignment.studentId);
      }
    }

    // Enrich with fee type and student info
    const feeTypeIds = [...new Set(allFees.map((f) => f.feeTypeId))];
    const [feeTypes, students] = await Promise.all([
      FeeType.findAll({ where: { feeTypeId: feeTypeIds } }),
      Student.findAll({
        where: { studentId: [...studentIds] },
        include: [{ model: Class, as: "class" }],
      }),
    ]);

    const feeTypeMap = new Map(feeTypes.map((ft) => [ft.feeTypeId, ft]));
    const studentMap = new Map(students.map((s) => [s.studentId, s]));

    return allFees
      .map((fee) => ({
        ...fee,
        feeType: feeTypeMap.get(fee.feeTypeId),
        student: studentMap.get(fee.studentId),
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  /**
   * Update individual fee (status, amount, etc.)
   */
  async updateStudentIndividualFee(individualFeeId, updateData, schoolId) {
    const { status, waiverReason, updatedBy, amount, description, dueDate } =
      updateData;

    // Find the assignment containing this fee
    const assignments = await StudentFeeAssignment.findAll({
      where: { schoolId, isActive: true },
    });

    let targetAssignment = null;
    let targetFeeIndex = -1;

    for (const assignment of assignments) {
      const individualFees = assignment.customFees?.individualFees || [];
      const index = individualFees.findIndex((f) => f.id === individualFeeId);
      if (index !== -1) {
        targetAssignment = assignment;
        targetFeeIndex = index;
        break;
      }
    }

    if (!targetAssignment || targetFeeIndex === -1) {
      throw new Error("Individual fee not found");
    }

    // Update the fee (deep clone to avoid reference issues)
    const customFees = JSON.parse(JSON.stringify(targetAssignment.customFees));
    const fee = { ...customFees.individualFees[targetFeeIndex] };

    if (status) {
      fee.status = status;
      if (status === "PAID") {
        fee.paidDate = new Date().toISOString();
      } else if (status === "WAIVED") {
        fee.waivedBy = updatedBy;
        fee.waiverReason = waiverReason;
      }
    }
    if (amount !== undefined) fee.amount = parseFloat(amount);
    if (description !== undefined) fee.description = description;
    if (dueDate !== undefined) fee.dueDate = dueDate;
    fee.updatedAt = new Date().toISOString();

    customFees.individualFees[targetFeeIndex] = fee;

    // Use direct update to ensure JSONB gets saved
    await StudentFeeAssignment.update(
      { customFees },
      { where: { assignmentId: targetAssignment.assignmentId } },
    );

    return {
      ...fee,
      individualFeeId: fee.id,
      studentId: targetAssignment.studentId,
      academicYearId: targetAssignment.academicYearId,
      schoolId,
    };
  }

  /**
   * Delete individual fee (soft delete - mark as CANCELLED)
   */
  async deleteStudentIndividualFee(individualFeeId, schoolId) {
    return this.updateStudentIndividualFee(
      individualFeeId,
      { status: "CANCELLED" },
      schoolId,
    );
  }

  /**
   * Get student total fees including individual fees
   */
  async getStudentTotalFeesWithIndividual(studentId, academicYearId, schoolId) {
    const assignment = await StudentFeeAssignment.findOne({
      where: { studentId, academicYearId, schoolId, isActive: true },
    });

    if (!assignment) {
      return {
        regularFees: 0,
        individualFees: 0,
        totalFees: 0,
        pendingIndividualFees: [],
      };
    }

    // Regular fees from schedule
    const regularFees = parseFloat(assignment.finalAnnualAmount) || 0;

    // Individual fees
    const individualFeesList = assignment.customFees?.individualFees || [];
    const pendingIndividualFees = individualFeesList.filter(
      (f) => f.status === "PENDING",
    );
    const individualFeesTotal = pendingIndividualFees.reduce(
      (sum, f) => sum + parseFloat(f.amount),
      0,
    );

    return {
      regularFees,
      individualFees: individualFeesTotal,
      totalFees: regularFees + individualFeesTotal,
      pendingIndividualFees,
    };
  }
}

export default new FeeService();
