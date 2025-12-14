import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  RESULT_STATUS,
  isValidResultStatus,
} from "../constants/examinationConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Result = sequelize.define(
  "Result",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    result_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("RESULT"),
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "exams",
        key: "exam_id",
      },
    },
    student_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "student",
        key: "student_id",
      },
    },
    marks_obtained: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidStatus(value) {
          if (!isValidResultStatus(value)) {
            throw new Error(
              `Invalid result status. Must be one of: ${Object.values(
                RESULT_STATUS
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
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "results",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId", "exam_id", "student_id"],
      },
      {
        unique: true,
        fields: ["exam_id", "student_id"],
      },
    ],
  }
);

export default Result;
