import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const StudentFeeAssignment = sequelize.define(
  "StudentFeeAssignment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignmentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("ASSIGNMENT"),
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scheduleId: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null for individual-fees-only assignments
      comment: "Optional if only storing individual fees",
    },
    customFees: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: { overrides: [], individualFees: [] },
      comment: "Store fee overrides and individual student fees (fines, etc.)",
    },
    totalAnnualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Can be null for individual-fees-only
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    finalAnnualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Can be null for individual-fees-only
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "student_fee_assignments",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["studentId", "academicYearId"],
        unique: true,
        name: "unique_student_assignment",
      },
      {
        fields: ["studentId", "academicYearId"],
        name: "idx_student_assignments_student_year",
      },
    ],
  },
);

export default StudentFeeAssignment;
