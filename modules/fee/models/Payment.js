import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  isValidPaymentMethod,
  isValidPaymentStatus,
} from "../constants/feeConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Payment = sequelize.define(
  "Payment",
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
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "student",
        key: "student_id",
      },
    },
    feeStructureId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "fee_structures",
        key: "fee_structure_id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidMethod(value) {
          if (!isValidPaymentMethod(value)) {
            throw new Error(
              `Invalid payment method. Must be one of: ${Object.values(
                PAYMENT_METHODS
              ).join(", ")}`
            );
          }
        },
      },
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true, // For online payments
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "COMPLETED",
      validate: {
        isValidStatus(value) {
          if (!isValidPaymentStatus(value)) {
            throw new Error(
              `Invalid payment status. Must be one of: ${Object.values(
                PAYMENT_STATUS
              ).join(", ")}`
            );
          }
        },
      },
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId", "student_id"],
      },
      {
        fields: ["receipt_number"],
      },
    ],
  }
);

export default Payment;
