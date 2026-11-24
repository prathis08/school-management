import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

/**
 * One subject within an Exam — carries the per-subject schedule and marking
 * scheme. Created in bulk when an exam is created, edited inline thereafter.
 */
const ExamSubject = sequelize.define(
  "exam_subject",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    examSubjectId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("EXSUB"),
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
    subjectId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "subject", key: "subject_id" },
    },
    examDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    maxMarks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    passingMarks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "exam_subjects",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["school_id", "exam_id"] },
      { unique: true, fields: ["exam_id", "subject_id"] },
    ],
  },
);

ExamSubject.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.id;
  return values;
};

export default ExamSubject;
