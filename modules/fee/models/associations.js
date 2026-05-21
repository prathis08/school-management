/**
 * Model Associations for Enhanced Fee Management System
 *
 * This file defines all relationships between fee management models.
 * Import this after all models are loaded to ensure associations are set up.
 */

import AcademicYear from "./AcademicYear.js";
import FeeType from "./FeeType.js";
import ClassFee from "./ClassFee.js";
import InstallmentSchedule from "./InstallmentSchedule.js";
import Installment from "./Installment.js";
import InstallmentFeeMapping from "./InstallmentFeeMapping.js";
import StudentFeeAssignment from "./StudentFeeAssignment.js";
import FeePayment from "./FeePayment.js";
import StudentInstallmentStatus from "./StudentInstallmentStatus.js";

/**
 * Setup all model associations
 */
export const setupAssociations = () => {
  // ClassFee belongs to FeeType
  ClassFee.belongsTo(FeeType, {
    foreignKey: "feeTypeId",
    targetKey: "feeTypeId",
    as: "feeType",
  });

  // FeeType has many ClassFees
  FeeType.hasMany(ClassFee, {
    foreignKey: "feeTypeId",
    sourceKey: "feeTypeId",
    as: "classFees",
  });

  // ClassFee belongs to AcademicYear
  ClassFee.belongsTo(AcademicYear, {
    foreignKey: "academicYearId",
    targetKey: "academicYearId",
    as: "academicYear",
  });

  // AcademicYear has many ClassFees
  AcademicYear.hasMany(ClassFee, {
    foreignKey: "academicYearId",
    sourceKey: "academicYearId",
    as: "classFees",
  });

  // InstallmentSchedule belongs to AcademicYear
  InstallmentSchedule.belongsTo(AcademicYear, {
    foreignKey: "academicYearId",
    targetKey: "academicYearId",
    as: "academicYear",
  });

  // AcademicYear has many InstallmentSchedules
  AcademicYear.hasMany(InstallmentSchedule, {
    foreignKey: "academicYearId",
    sourceKey: "academicYearId",
    as: "installmentSchedules",
  });

  // InstallmentSchedule has many Installments
  InstallmentSchedule.hasMany(Installment, {
    foreignKey: "scheduleId",
    sourceKey: "scheduleId",
    as: "installments",
  });

  // Installment belongs to InstallmentSchedule
  Installment.belongsTo(InstallmentSchedule, {
    foreignKey: "scheduleId",
    targetKey: "scheduleId",
    as: "schedule",
  });

  // Installment has many InstallmentFeeMappings
  Installment.hasMany(InstallmentFeeMapping, {
    foreignKey: "installmentId",
    sourceKey: "installmentId",
    as: "feeMappings",
  });

  // InstallmentFeeMapping belongs to Installment
  InstallmentFeeMapping.belongsTo(Installment, {
    foreignKey: "installmentId",
    targetKey: "installmentId",
    as: "installment",
  });

  // InstallmentFeeMapping belongs to FeeType
  InstallmentFeeMapping.belongsTo(FeeType, {
    foreignKey: "feeTypeId",
    targetKey: "feeTypeId",
    as: "feeType",
  });

  // FeeType has many InstallmentFeeMappings
  FeeType.hasMany(InstallmentFeeMapping, {
    foreignKey: "feeTypeId",
    sourceKey: "feeTypeId",
    as: "installmentMappings",
  });

  // StudentFeeAssignment belongs to InstallmentSchedule
  StudentFeeAssignment.belongsTo(InstallmentSchedule, {
    foreignKey: "scheduleId",
    targetKey: "scheduleId",
    as: "schedule",
  });

  // InstallmentSchedule has many StudentFeeAssignments
  InstallmentSchedule.hasMany(StudentFeeAssignment, {
    foreignKey: "scheduleId",
    sourceKey: "scheduleId",
    as: "studentAssignments",
  });

  // StudentFeeAssignment belongs to AcademicYear
  StudentFeeAssignment.belongsTo(AcademicYear, {
    foreignKey: "academicYearId",
    targetKey: "academicYearId",
    as: "academicYear",
  });

  // AcademicYear has many StudentFeeAssignments
  AcademicYear.hasMany(StudentFeeAssignment, {
    foreignKey: "academicYearId",
    sourceKey: "academicYearId",
    as: "studentAssignments",
  });

  // StudentFeeAssignment has many FeePayments
  StudentFeeAssignment.hasMany(FeePayment, {
    foreignKey: "assignmentId",
    sourceKey: "assignmentId",
    as: "payments",
  });

  // FeePayment belongs to StudentFeeAssignment
  FeePayment.belongsTo(StudentFeeAssignment, {
    foreignKey: "assignmentId",
    targetKey: "assignmentId",
    as: "assignment",
  });

  // FeePayment belongs to Installment
  FeePayment.belongsTo(Installment, {
    foreignKey: "installmentId",
    targetKey: "installmentId",
    as: "installment",
  });

  // Installment has many FeePayments
  Installment.hasMany(FeePayment, {
    foreignKey: "installmentId",
    sourceKey: "installmentId",
    as: "payments",
  });

  // StudentInstallmentStatus belongs to StudentFeeAssignment
  StudentInstallmentStatus.belongsTo(StudentFeeAssignment, {
    foreignKey: "assignmentId",
    targetKey: "assignmentId",
    as: "assignment",
  });

  // StudentFeeAssignment has many StudentInstallmentStatuses
  StudentFeeAssignment.hasMany(StudentInstallmentStatus, {
    foreignKey: "assignmentId",
    sourceKey: "assignmentId",
    as: "installmentStatuses",
  });

  // StudentInstallmentStatus belongs to Installment
  StudentInstallmentStatus.belongsTo(Installment, {
    foreignKey: "installmentId",
    targetKey: "installmentId",
    as: "installment",
  });

  // Installment has many StudentInstallmentStatuses
  Installment.hasMany(StudentInstallmentStatus, {
    foreignKey: "installmentId",
    sourceKey: "installmentId",
    as: "studentStatuses",
  });

  console.log("✅ Fee management model associations set up successfully");
};

export default setupAssociations;
