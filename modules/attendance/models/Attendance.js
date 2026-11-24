import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  ATTENDANCE_STATUS,
  DEFAULT_PERIOD,
  isValidAttendanceStatus,
} from "../constants/attendanceConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

/**
 * One student's attendance for a given date (and optional period). A row with
 * period = "FULL_DAY" is day-level attendance. Marking the same
 * (student, date, period) again upserts the existing row.
 */
const Attendance = sequelize.define(
  "attendance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attendanceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("ATTENDANCE"),
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
    classId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: DEFAULT_PERIOD,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ATTENDANCE_STATUS.PRESENT,
      validate: {
        isValidStatus(value) {
          if (!isValidAttendanceStatus(value)) {
            throw new Error(
              `Invalid attendance status. Must be one of: ${Object.values(
                ATTENDANCE_STATUS,
              ).join(", ")}`,
            );
          }
        },
      },
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    markedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "attendance",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["school_id", "class_id", "date"] },
      { fields: ["school_id", "student_id", "date"] },
      { unique: true, fields: ["student_id", "date", "period"] },
    ],
  },
);

Attendance.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.id;
  return values;
};

export default Attendance;
