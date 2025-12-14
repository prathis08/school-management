import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelize } from "../config/database.js";
import { ROLES, isValidRole } from "../constants/roles.js";
import { generateCustomIdWithPrefix } from "../utils/customIdGenerator.js";

const sequelize = getSequelize();

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("USER"),
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name is required" },
        len: {
          args: [2, 50],
          msg: "First name must be between 2 and 50 characters",
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Last name is required" },
        len: {
          args: [2, 50],
          msg: "Last name must be between 2 and 50 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Please provide a valid email" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6], msg: "Password must be at least 6 characters long" },
      },
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidRole(value) {
          if (!isValidRole(value)) {
            throw new Error(
              `Invalid role. Must be one of: ${Object.values(ROLES).join(", ")}`
            );
          }
        },
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
          );
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(
            user.password,
            parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
          );
        }
      },
    },
  }
);

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
User.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

export default User;
