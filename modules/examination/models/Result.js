import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  RESULT_STATUS,
  isValidResultStatus,
} from "../constants/examinationConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

/**
 * A student's mark for one ExamSubject. Persisted on bulk marks-entry
 * (upsert by examSubjectId + studentId).
 */
const Result = sequelize.define(
  "result",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    resultId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("RESULT"),
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    examId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "exams", key: "exam_id" },
    },
    examSubjectId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "exam_subjects", key: "exam_subject_id" },
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "student", key: "student_id" },
    },
    marksObtained: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: RESULT_STATUS.PASS,
      validate: {
        isValidStatus(value) {
          if (!isValidResultStatus(value)) {
            throw new Error(
              `Invalid result status. Must be one of: ${Object.values(RESULT_STATUS).join(", ")}`,
            );
          }
        },
      },
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "results",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["school_id", "exam_id"] },
      { fields: ["school_id", "student_id"] },
      { unique: true, fields: ["exam_subject_id", "student_id"] },
    ],
  },
);

Result.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.id;
  return values;
};

export default Result;
