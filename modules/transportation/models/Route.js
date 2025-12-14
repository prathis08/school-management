import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Route = sequelize.define(
  "Route",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    route_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("ROUTE"),
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "schools",
        key: "schoolId",
      },
    },
    route_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bus_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "buses",
        key: "bus_id",
      },
    },
    start_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    distance: {
      type: DataTypes.DECIMAL(5, 2), // in kilometers
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "routes",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId", "bus_id"],
      },
    ],
  }
);

export default Route;
