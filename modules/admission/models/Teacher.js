import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { ROLES } from "../../backend-core/constants/roles.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Teacher = sequelize.define(
  "teacher",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "users",
        key: "userId",
      },
    },
    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("TEACHER"),
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
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    dateOfJoining: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
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

export default Teacher;
