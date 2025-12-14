import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { ROLES } from "../../backend-core/constants/roles.js";
import {
  GENDER_TYPES,
  isValidGender,
} from "../constants/admissionConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Student = sequelize.define(
  "student",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    classId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "class",
        key: "class_id",
      },
    },
    studentId: {
      type: DataTypes.STRING,
      unique: true,
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rollNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidGender(value) {
          if (!isValidGender(value)) {
            throw new Error(
              `Invalid gender. Must be one of: ${Object.values(
                GENDER_TYPES
              ).join(", ")}`
            );
          }
        },
      },
    },
    parentDetails: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: true,
    },
    guardianDetails: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: true,
    },
    previousSchoolDetails: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: true,
    },
    emergencyContact: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    admissionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
    subjects: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    attendance: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    grades: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    // Keeping fatherName for backward compatibility
    fatherName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
  }
);

export default Student;
