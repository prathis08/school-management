import { DataTypes } from "sequelize";
import { getSequelize } from "../config/database.js";

const sequelize = getSequelize();

const UserPreferences = sequelize.define(
  "user_preferences",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    theme: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "light",
      validate: {
        isIn: {
          args: [["light", "dark", "auto"]],
          msg: "Theme must be light, dark, or auto",
        },
      },
    },
    primaryColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#3B82F6",
    },
    sidebarStyle: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "expanded",
      validate: {
        isIn: {
          args: [["expanded", "collapsed", "mini"]],
          msg: "Sidebar style must be expanded, collapsed, or mini",
        },
      },
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "en",
    },
  },
  {
    tableName: "user_preferences",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["userId"],
        unique: true,
      },
    ],
  }
);

export default UserPreferences;
