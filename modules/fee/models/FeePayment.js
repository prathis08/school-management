import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_TYPES,
} from "../constants/feeConstants.js";

const sequelize = getSequelize();

const FeePayment = sequelize.define(
  "FeePayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("PAYMENT"),
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignmentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    installmentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "NULL for advance/partial payments",
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHODS)),
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.COMPLETED,
    },
    paymentType: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_TYPES)),
      defaultValue: PAYMENT_TYPES.INSTALLMENT,
    },
    lateFeeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    discountApplied: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    collectedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifiedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isRefunded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    refundDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "fee_payments",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["studentId", "academicYearId"],
        name: "idx_fee_payments_student_year",
      },
      {
        fields: ["paymentDate"],
        name: "idx_fee_payments_payment_date",
      },
    ],
  },
);

export default FeePayment;
