import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Subject = sequelize.define(
  "subject",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subjectId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("SUBJECT"),
    },
    subjectName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subjectCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUppercase: true,
        isAlphanumeric: true,
      },
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      validate: {
        notEmpty: { msg: "School ID cannot be empty if provided" },
        len: {
          args: [1, 50],
          msg: "School ID must be between 1 and 50 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    syllabus: {
      type: DataTypes.TEXT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
  }
);

export default Subject;
