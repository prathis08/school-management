import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Stop = sequelize.define(
  "Stop",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stop_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("STOP"),
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "schools",
        key: "schoolId",
      },
    },
    route_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "routes",
        key: "route_id",
      },
    },
    stop_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stop_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pickup_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    drop_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    stop_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "stops",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId", "route_id"],
      },
    ],
  }
);

export default Stop;
