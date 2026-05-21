import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const FeeType = sequelize.define(
  "FeeType",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    feeTypeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("FEETYPE"),
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isMandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this fee type is mandatory for all students",
    },
    isOneTime: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this is a one-time fee like admission",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "fee_types",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["schoolId", "isActive"],
        name: "idx_fee_types_school_active",
      },
      {
        fields: ["schoolId", "name"],
        unique: true,
        name: "unique_school_fee_type",
      },
    ],
  },
);

export default FeeType;
