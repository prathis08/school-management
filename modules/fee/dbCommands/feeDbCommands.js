import { Op } from "sequelize";
import {
  FeeStructure,
  Payment,
  Student,
  User,
  Class,
  GradeFees,
} from "@school-management/backend-core/models/index.js";
import {
  findAllBySchool,
  findByCustomIdAndSchool,
  createWithSchool,
  updateByCustomIdAndSchool,
} from "../../admission/dbCommands/genericDbCommands.js";
import { PAYMENT_STATUS } from "../constants/feeConstants.js";
import ClassService from "@school-management/admission/services/ClassService.js";

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
  const { schoolId, gradeId, classId, feeType, name } = filters;

  const whereConditions = {
    schoolId,
  };

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
    ],
    order: [["firstName", "ASC"]],
  });
};
