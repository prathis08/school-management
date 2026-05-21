import { Op } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  Student,
  User,
  Class,
} from "@school-management/backend-core/models/index.js";
import {
  FeeStructure,
  Payment,
  GradeFees,
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
import {
  findAllBySchool,
  findByCustomIdAndSchool,
  createWithSchool,
  updateByCustomIdAndSchool,
} from "../../admission/dbCommands/genericDbCommands.js";
import { PAYMENT_STATUS } from "../constants/feeConstants.js";
import ClassService from "@school-management/admission/services/ClassService.js";

const sequelize = getSequelize();

/**
 * Get all fee structures for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of fee structures
 */
export const getAllFeeStructures = async (schoolId, options = {}) => {
  const defaultOptions = {
    order: [["created_at", "DESC"]],
    ...options,
  };

  return await findAllBySchool(
    FeeStructure,
    schoolId,
    { isActive: true },
    defaultOptions,
  );
};

/**
 * Get a single fee structure by feeStructureId (custom ID only)
 * @param {string} feeStructureId - Custom feeStructureId (e.g., FEESTRUCTURE1726412345678901)
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Fee structure object or null
 */
export const getFeeStructureById = async (
  feeStructureId,
  schoolId,
  options = {},
) => {
  return await findByCustomIdAndSchool(
    FeeStructure,
    feeStructureId,
    schoolId,
    "feeStructureId",
    options,
  );
};

/**
 * Create a new fee structure
 * @param {object} feeStructureData - Fee structure data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created fee structure object
 */
export const createFeeStructure = async (feeStructureData, schoolId) => {
  return await createWithSchool(FeeStructure, feeStructureData, schoolId);
};

/**
 * Update fee structure by feeStructureId (custom ID only)
 * @param {string} feeStructureId - Custom feeStructureId (e.g., FEESTRUCTURE1726412345678901)
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateFeeStructure = async (
  feeStructureId,
  updated_ata,
  schoolId,
) => {
  return await updateByCustomIdAndSchool(
    FeeStructure,
    updated_ata,
    feeStructureId,
    schoolId,
    "feeStructureId",
  );
};

/**
 * Delete fee structure (mark as inactive) by feeStructureId (custom ID only)
 * @param {string} feeStructureId - Custom feeStructureId (e.g., FEESTRUCTURE1726412345678901)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteFeeStructure = async (feeStructureId, schoolId) => {
  return await updateByCustomIdAndSchool(
    FeeStructure,
    { isActive: false },
    feeStructureId,
    schoolId,
    "feeStructureId",
  );
};

/**
 * Get all payments for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of payments
 */
export const getAllPayments = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Student,
        as: "student",
        attributes: ["studentId"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    ...options,
  };

  return await findAllBySchool(Payment, schoolId, {}, defaultOptions);
};

/**
 * Get a single payment by paymentId (custom ID only)
 * @param {string} paymentId - Custom paymentId (e.g., PAYMENT1726412345678901)
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Payment object or null
 */
export const getPaymentById = async (paymentId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Student,
        as: "student",
        attributes: ["studentId"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName"],
          },
        ],
      },
    ],
    ...options,
  };

  return await findByCustomIdAndSchool(
    Payment,
    paymentId,
    schoolId,
    "paymentId",
    defaultOptions,
  );
};

/**
 * Create a new payment
 * @param {object} paymentData - Payment data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created payment object
 */
export const createPayment = async (paymentData, schoolId) => {
  return await createWithSchool(Payment, paymentData, schoolId);
};

/**
 * Update payment by paymentId (custom ID only)
 * @param {string} paymentId - Custom paymentId (e.g., PAYMENT1726412345678901)
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updatePayment = async (paymentId, updated_ata, schoolId) => {
  return await updateByCustomIdAndSchool(
    Payment,
    updated_ata,
    paymentId,
    schoolId,
    "paymentId",
  );
};

/**
 * Delete payment by paymentId (custom ID only)
 * @param {string} paymentId - Custom paymentId (e.g., PAYMENT1726412345678901)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deletePayment = async (paymentId, schoolId) => {
  return await updateByCustomIdAndSchool(
    Payment,
    { status: "cancelled" },
    paymentId,
    schoolId,
    "paymentId",
  );
};

export const getStudentsWithFeesData = async (filters) => {
  const { schoolId, gradeId, classId, feeType, name, studentId } = filters;

  const whereConditions = {
    schoolId,
  };

  // Add studentId filter if provided (for fetching single student)
  if (studentId) {
    whereConditions.studentId = studentId;
  }

  // Add student name filter if provided
  if (name) {
    whereConditions[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${name}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${name}%`,
        },
      },
      {
        [Op.and]: [
          {
            firstName: {
              [Op.iLike]: `%${name.split(" ")[0]}%`,
            },
          },
          {
            lastName: {
              [Op.iLike]: `%${name.split(" ")[1] || ""}%`,
            },
          },
        ],
      },
    ];
  }

  // Add class filter if provided
  if (gradeId) {
    whereConditions.gradeId = gradeId;
  }
  if (classId) {
    whereConditions.classId = classId;
  }

  return await Student.findAll({
    where: whereConditions,
    attributes: [
      "studentId",
      "firstName",
      "lastName",
      "email",
      "phone",
      "gradeId",
      "classId",
      "enrollmentDate",
      "isActive",
      "staffRelation",
    ],
    order: [["firstName", "ASC"]],
  });
};

// ============ Enhanced Fee Methods (migrated from enhancedFeeDbCommands) ============

/**
 * Get active academic year for a school
 */
export const getActiveAcademicYear = async (schoolId) => {
  return await AcademicYear.findOne({
    where: {
      schoolId,
      isActive: true,
    },
  });
};

/**
 * Get all academic years for a school
 */
export const getAcademicYears = async (schoolId, options = {}) => {
  const where = { schoolId };

  if (options.isActive !== undefined) {
    where.isActive = options.isActive;
  }

  return await AcademicYear.findAll({
    where,
    order: [["startDate", "DESC"]],
  });
};

/**
 * Get fee types for a school
 */
export const getFeeTypes = async (schoolId, options = {}) => {
  const where = { schoolId };

  if (options.isActive !== undefined) {
    where.isActive = options.isActive;
  }

  if (options.isMandatory !== undefined) {
    where.isMandatory = options.isMandatory;
  }

  return await FeeType.findAll({
    where,
    order: [["name", "ASC"]],
  });
};

/**
 * Get class fees for a specific academic year and class
 */
export const getClassFees = async (academicYearId, classId) => {
  return await ClassFee.findAll({
    where: {
      academicYearId,
      classId,
      gradeId: null, // Class-specific fees only
    },
    include: [
      {
        model: FeeType,
        as: "feeType",
        attributes: ["name", "description", "isMandatory", "isOneTime"],
      },
    ],
    order: [["feeType", "name", "ASC"]],
  });
};

/**
 * Get grade-level fees for a specific academic year and grade
 */
export const getGradeFees = async (academicYearId, gradeId) => {
  return await ClassFee.findAll({
    where: {
      academicYearId,
      gradeId,
      classId: null, // Grade-level fees only
    },
    include: [
      {
        model: FeeType,
        as: "feeType",
        attributes: [
          "id",
          "feeTypeId",
          "name",
          "description",
          "isMandatory",
          "isOneTime",
        ],
      },
    ],
    order: [["feeType", "name", "ASC"]],
  });
};

/**
 * Get installment schedule with installments and fee mappings
 */
export const getInstallmentScheduleDetails = async (scheduleId) => {
  return await InstallmentSchedule.findOne({
    where: { scheduleId },
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
                attributes: ["name", "description", "isMandatory", "isOneTime"],
              },
            ],
          },
        ],
        order: [["installmentNumber", "ASC"]],
      },
    ],
  });
};

/**
 * Calculate student's installment amounts
 */
export const calculateStudentInstallmentAmounts = async (
  studentId,
  academicYearId,
) => {
  const query = `
    WITH student_schedule AS (
      SELECT sfa.*, iss.schedule_id, iss.name as schedule_name
      FROM student_fee_assignments sfa
      JOIN installment_schedules iss ON sfa.schedule_id = iss.schedule_id
      WHERE sfa.student_id = :studentId 
        AND sfa.academic_year_id = :academicYearId
        AND sfa.is_active = true
    ),
    class_fees_data AS (
      SELECT cf.*, ft.name as fee_type_name, ft.is_one_time
      FROM class_fees cf
      JOIN fee_types ft ON cf.fee_type_id = ft.fee_type_id
      JOIN student_fee_assignments sfa ON cf.academic_year_id = sfa.academic_year_id
      WHERE sfa.student_id = :studentId 
        AND sfa.academic_year_id = :academicYearId
    ),
    installment_calculations AS (
      SELECT 
        i.installment_id,
        i.installment_number,
        i.name as installment_name,
        i.due_date,
        ifm.fee_type_id,
        cfd.fee_type_name,
        cfd.annual_amount,
        ifm.percentage,
        ifm.fixed_amount,
        COALESCE(ifm.fixed_amount, (cfd.annual_amount * ifm.percentage / 100)) as installment_amount
      FROM student_schedule ss
      JOIN installments i ON ss.schedule_id = i.schedule_id
      JOIN installment_fee_mappings ifm ON i.installment_id = ifm.installment_id
      JOIN class_fees_data cfd ON ifm.fee_type_id = cfd.fee_type_id
      WHERE i.is_active = true
      ORDER BY i.installment_number, cfd.fee_type_name
    )
    SELECT 
      installment_id,
      installment_number,
      installment_name,
      due_date,
      SUM(installment_amount) as total_installment_amount,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'feeTypeId', fee_type_id,
          'feeTypeName', fee_type_name,
          'annualAmount', annual_amount,
          'percentage', percentage,
          'fixedAmount', fixed_amount,
          'installmentAmount', installment_amount
        )
      ) as fee_breakdown
    FROM installment_calculations
    GROUP BY installment_id, installment_number, installment_name, due_date
    ORDER BY installment_number;
  `;

  const [results] = await sequelize.query(query, {
    replacements: { studentId, academicYearId },
  });

  return results;
};

/**
 * Get student's fee summary
 */
export const getStudentFeeSummary = async (studentId, academicYearId) => {
  const query = `
    WITH student_assignment AS (
      SELECT * FROM student_fee_assignments 
      WHERE student_id = :studentId 
        AND academic_year_id = :academicYearId
        AND is_active = true
    ),
    payment_summary AS (
      SELECT 
        COALESCE(SUM(amount), 0) as total_paid,
        COALESCE(SUM(late_fee_amount), 0) as total_late_fees,
        COALESCE(SUM(discount_applied), 0) as total_discounts
      FROM fee_payments
      WHERE student_id = :studentId 
        AND academic_year_id = :academicYearId
        AND status = 'COMPLETED'
    ),
    installment_status_summary AS (
      SELECT 
        COUNT(*) as total_installments,
        COUNT(*) FILTER (WHERE status = 'PAID') as paid_installments,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_installments,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_installments,
        COALESCE(SUM(due_amount), 0) as total_due_amount,
        COALESCE(SUM(paid_amount), 0) as total_paid_amount,
        COALESCE(SUM(balance_amount), 0) as total_balance_amount
      FROM student_installment_status
      WHERE student_id = :studentId
    )
    SELECT 
      sa.*,
      ps.*,
      iss.*,
      (sa.final_annual_amount - ps.total_paid) as remaining_balance
    FROM student_assignment sa
    CROSS JOIN payment_summary ps
    CROSS JOIN installment_status_summary iss;
  `;

  const [results] = await sequelize.query(query, {
    replacements: { studentId, academicYearId },
  });

  return results[0] || null;
};

/**
 * Get overdue installments for a school
 */
export const getOverdueInstallments = async (schoolId, options = {}) => {
  const { limit = 100, offset = 0, classId, gradeId } = options;

  const query = `
    SELECT 
      sis.*,
      s.name as student_name,
      s.roll_number,
      c.class_name,
      c.section,
      i.name as installment_name,
      i.due_date,
      (CURRENT_DATE - i.due_date) as days_overdue
    FROM student_installment_status sis
    JOIN students s ON sis.student_id = s.student_id
    JOIN classes c ON s.class_id = c.class_id
    JOIN installments i ON sis.installment_id = i.installment_id
    WHERE sis.school_id = :schoolId
      AND sis.status = 'OVERDUE'
      AND sis.balance_amount > 0
      ${classId ? "AND s.class_id = :classId" : ""}
      ${gradeId ? "AND s.grade_id = :gradeId" : ""}
    ORDER BY i.due_date ASC, s.name ASC
    LIMIT :limit OFFSET :offset;
  `;

  const [results] = await sequelize.query(query, {
    replacements: { schoolId, classId, gradeId, limit, offset },
  });

  return results;
};

/**
 * Get fee collection summary for a date range
 */
export const getFeeCollectionSummary = async (
  schoolId,
  startDate,
  endDate,
  options = {},
) => {
  const { groupBy = "day" } = options; // 'day', 'week', 'month'

  let dateFormat;
  switch (groupBy) {
    case "week":
      dateFormat = "DATE_TRUNC('week', payment_date)";
      break;
    case "month":
      dateFormat = "DATE_TRUNC('month', payment_date)";
      break;
    default:
      dateFormat = "payment_date";
  }

  const query = `
    SELECT 
      ${dateFormat} as period,
      COUNT(*) as total_transactions,
      SUM(amount) as total_amount,
      SUM(late_fee_amount) as total_late_fees,
      SUM(discount_applied) as total_discounts,
      COUNT(DISTINCT student_id) as unique_students,
      AVG(amount) as average_amount,
      payment_method,
      payment_type
    FROM fee_payments
    WHERE school_id = :schoolId
      AND payment_date BETWEEN :startDate AND :endDate
      AND status = 'COMPLETED'
    GROUP BY ${dateFormat}, payment_method, payment_type
    ORDER BY period DESC, payment_method, payment_type;
  `;

  const [results] = await sequelize.query(query, {
    replacements: { schoolId, startDate, endDate },
  });

  return results;
};

/**
 * Update student installment status after payment
 */
export const updateInstallmentStatusAfterPayment = async (
  paymentData,
  transaction = null,
) => {
  const { studentId, installmentId, amount } = paymentData;

  const status = await StudentInstallmentStatus.findOne({
    where: { studentId, installmentId },
    transaction,
  });

  if (status) {
    const newPaidAmount = parseFloat(status.paidAmount) + parseFloat(amount);
    const newBalanceAmount = parseFloat(status.dueAmount) - newPaidAmount;

    let newStatus;
    if (newBalanceAmount <= 0) {
      newStatus = "PAID";
    } else if (newPaidAmount > 0) {
      newStatus = "PARTIAL";
    } else {
      newStatus = status.status;
    }

    await status.update(
      {
        paidAmount: newPaidAmount,
        balanceAmount: Math.max(0, newBalanceAmount),
        status: newStatus,
        paidDate: newStatus === "PAID" ? new Date() : status.paidDate,
      },
      { transaction },
    );

    return status;
  }

  return null;
};

/**
 * Create installment statuses for a student assignment
 */
export const createInstallmentStatusesForAssignment = async (
  assignmentId,
  transaction = null,
) => {
  const query = `
    INSERT INTO student_installment_status (
      status_id, student_id, installment_id, assignment_id, 
      due_amount, balance_amount, due_date, school_id
    )
    SELECT 
      'STATUS' || LPAD(nextval('status_sequence')::text, 8, '0'),
      sfa.student_id,
      calc.installment_id,
      sfa.assignment_id,
      calc.total_installment_amount,
      calc.total_installment_amount,
      calc.due_date,
      sfa.school_id
    FROM student_fee_assignments sfa
    CROSS JOIN LATERAL (
      SELECT 
        i.installment_id,
        i.due_date,
        SUM(COALESCE(ifm.fixed_amount, (cf.annual_amount * ifm.percentage / 100))) as total_installment_amount
      FROM installments i
      JOIN installment_fee_mappings ifm ON i.installment_id = ifm.installment_id
      JOIN class_fees cf ON ifm.fee_type_id = cf.fee_type_id AND cf.academic_year_id = sfa.academic_year_id
      JOIN students s ON sfa.student_id = s.student_id AND cf.class_id = s.class_id
      WHERE i.schedule_id = sfa.schedule_id
        AND i.is_active = true
      GROUP BY i.installment_id, i.due_date
    ) calc
    WHERE sfa.assignment_id = :assignmentId;
  `;

  await sequelize.query(query, {
    replacements: { assignmentId },
    transaction,
  });
};
