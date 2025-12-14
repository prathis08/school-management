import { DataTypes } from "sequelize";
import { getSequelize } from "../config/database.js";

const sequelize = getSequelize();

const School = sequelize.define(
  "schools",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    schoolId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "School ID cannot be empty" },
        len: {
          args: [1, 255],
          msg: "School ID must be between 1 and 255 characters",
        },
      },
    },
    schoolName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "School name is required" },
        len: {
          args: [2, 255],
          msg: "School name must be between 2 and 255 characters",
        },
      },
    },
    schoolCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "School code is required" },
        len: {
          args: [2, 50],
          msg: "School code must be between 2 and 50 characters",
        },
      },
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [10, 20],
          msg: "Phone number must be between 10 and 20 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: { msg: "Please provide a valid email" },
      },
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: { msg: "Please provide a valid website URL" },
      },
    },
    principalName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    principalPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [10, 20],
          msg: "Principal phone number must be between 10 and 20 characters",
        },
      },
    },
    principalEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: { msg: "Please provide a valid principal email" },
      },
    },
    establishedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1800],
          msg: "Established year must be after 1800",
        },
        max: {
          args: [new Date().getFullYear()],
          msg: "Established year cannot be in the future",
        },
      },
    },
    schoolType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Primary, Secondary, Higher Secondary, etc.",
    },
    board: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "CBSE, ICSE, State Board, etc.",
    },
    affiliationNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "schools",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId"],
      },
      {
        fields: ["schoolCode"],
      },
      {
        fields: ["schoolName"],
      },
    ],
  }
);

export default School;
