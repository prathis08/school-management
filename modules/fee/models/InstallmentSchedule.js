import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";
import { SCHEDULE_TYPES } from "../constants/feeConstants.js";

const sequelize = getSequelize();

const InstallmentSchedule = sequelize.define(
  "InstallmentSchedule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    scheduleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("SCHEDULE"),
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment:
        'e.g., "Grade 5 Quarterly", "Class 1A Custom", "John Doe Custom"',
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "NULL if not grade-level",
    },
    classId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "NULL if not class-specific",
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "NULL if not student-specific",
    },
    scheduleType: {
      type: DataTypes.ENUM(...Object.values(SCHEDULE_TYPES)),
      allowNull: false,
      defaultValue: SCHEDULE_TYPES.QUARTERLY,
    },
    totalInstallments: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this is the default schedule for the class",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Admin user who created this schedule",
    },
  },
  {
    tableName: "installment_schedules",
    timestamps: true,
    underscored: true,
    validate: {
      // Either gradeId, classId, OR studentId must be set, but only one
      gradeClassOrStudent() {
        const setCount = [this.gradeId, this.classId, this.studentId].filter(
          Boolean,
        ).length;
        if (setCount !== 1) {
          throw new Error(
            "Exactly one of gradeId, classId, or studentId must be set",
          );
        }
      },
    },
    indexes: [
      {
        fields: ["schoolId", "isActive"],
        name: "idx_installment_schedules_school",
      },
      {
        fields: ["gradeId"],
        name: "idx_installment_schedules_grade",
      },
      {
        fields: ["classId"],
        name: "idx_installment_schedules_class",
      },
      {
        fields: ["studentId"],
        name: "idx_installment_schedules_student",
      },
    ],
  },
);

export default InstallmentSchedule;
