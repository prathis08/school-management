import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  EXAM_TYPES,
  EXAM_STATUS,
  isValidExamType,
  isValidExamStatus,
} from "../constants/examinationConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

/**
 * Exam header. One exam belongs to a grade and contains many ExamSubject rows
 * (each with its own subject + date + max marks). Marks live on Result rows
 * keyed by examSubjectId + studentId.
 */
const Exam = sequelize.define(
  "exam",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    examId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("EXAM"),
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    examName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    examType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidType(value) {
          if (!isValidExamType(value)) {
            throw new Error(
              `Invalid exam type. Must be one of: ${Object.values(EXAM_TYPES).join(", ")}`,
            );
          }
        },
      },
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    classId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    className: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: EXAM_STATUS.DRAFT,
      validate: {
        isValidStatus(value) {
          if (!isValidExamStatus(value)) {
            throw new Error(
              `Invalid exam status. Must be one of: ${Object.values(EXAM_STATUS).join(", ")}`,
            );
          }
        },
      },
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "exams",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["school_id", "grade_id", "academic_year"] },
      { fields: ["school_id", "exam_type"] },
    ],
  },
);

Exam.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.id;
  return values;
};

export default Exam;
