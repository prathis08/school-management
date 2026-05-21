import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Installment = sequelize.define(
  "Installment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    installmentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("INSTALLMENT"),
    },
    scheduleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Sequential number within the schedule (1, 2, 3, etc.)",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g., "Q1 2024", "July Payment"',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "installments",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["scheduleId", "dueDate"],
        name: "idx_installments_schedule_due_date",
      },
      {
        fields: ["scheduleId", "installmentNumber"],
        unique: true,
        name: "unique_installment",
      },
    ],
  },
);

export default Installment;
