import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";
import { INSTALLMENT_STATUS } from "../constants/feeConstants.js";

const sequelize = getSequelize();

const StudentInstallmentStatus = sequelize.define(
  "StudentInstallmentStatus",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    statusId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("STATUS"),
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    installmentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignmentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    balanceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(INSTALLMENT_STATUS)),
      defaultValue: INSTALLMENT_STATUS.PENDING,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    paidDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lateFeeApplicable: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    daysOverdue: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "student_installment_status",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["studentId"],
        name: "idx_student_installment_status_student",
      },
      {
        fields: ["dueDate"],
        name: "idx_student_installment_status_due_date",
      },
      {
        fields: ["status", "dueDate"],
        name: "idx_student_installment_status_overdue",
      },
      {
        fields: ["studentId", "installmentId"],
        unique: true,
        name: "unique_student_installment",
      },
    ],
  },
);

export default StudentInstallmentStatus;
