import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  ENROLLMENT_STATUS,
  isValidEnrollmentStatus,
} from "../constants/academicConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

/**
 * A student's enrollment for one academic year: which class/grade they were in,
 * and the outcome (promoted / retained / graduated). This is the per-year
 * history — Student.classId/gradeId only tracks the *current* placement.
 */
const StudentEnrollment = sequelize.define(
  "student_enrollment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollmentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("ENROLL"),
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "student", key: "student_id" },
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "academic_years", key: "academic_year_id" },
    },
    academicYearName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    classId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    className: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ENROLLMENT_STATUS.ENROLLED,
      validate: {
        isValidStatus(value) {
          if (!isValidEnrollmentStatus(value)) {
            throw new Error(
              `Invalid enrollment status. Must be one of: ${Object.values(
                ENROLLMENT_STATUS,
              ).join(", ")}`,
            );
          }
        },
      },
    },
    finalPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    finalGrade: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decidedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "student_enrollments",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["school_id", "academic_year_id", "grade_id"] },
      { fields: ["school_id", "student_id"] },
      {
        unique: true,
        fields: ["student_id", "academic_year_id"],
        name: "student_enrollments_student_year_unique",
      },
    ],
  },
);

StudentEnrollment.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.id;
  return values;
};

export default StudentEnrollment;
