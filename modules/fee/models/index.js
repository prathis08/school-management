// Import all models first
import AcademicYear from "./AcademicYear.js";
import FeeType from "./FeeType.js";
import ClassFee from "./ClassFee.js";
import InstallmentSchedule from "./InstallmentSchedule.js";
import Installment from "./Installment.js";
import InstallmentFeeMapping from "./InstallmentFeeMapping.js";
import StudentFeeAssignment from "./StudentFeeAssignment.js";
import FeePayment from "./FeePayment.js";
import StudentInstallmentStatus from "./StudentInstallmentStatus.js";
import FeeStructure from "./FeeStructure.js";
import Payment from "./Payment.js";
import GradeFees from "./GradeFees.js";
import ClassFees from "./ClassFees.js";
// StudentIndividualFee is deprecated - individual fees are stored in StudentFeeAssignment.customFees.individualFees

// Setup associations
import setupAssociations from "./associations.js";
setupAssociations();

// Export all models
export {
  AcademicYear,
  FeeType,
  ClassFee,
  InstallmentSchedule,
  Installment,
  InstallmentFeeMapping,
  StudentFeeAssignment,
  FeePayment,
  StudentInstallmentStatus,
  FeeStructure,
  Payment,
  GradeFees,
  ClassFees,
};
