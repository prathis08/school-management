import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  EXAM_TYPES,
  isValidExamType,
} from "../constants/examinationConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Exam = sequelize.define(
  "Exam",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("EXAM"),
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exam_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exam_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidType(value) {
          if (!isValidExamType(value)) {
            throw new Error(
              `Invalid exam type. Must be one of: ${Object.values(
                EXAM_TYPES
              ).join(", ")}`
            );
          }
        },
      },
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "subject",
        key: "subject_id",
      },
    },
    exam_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passing_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "exams",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId", "class_name", "academic_year"],
      },
    ],
  }
);

export default Exam;
