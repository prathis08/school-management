import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const InstallmentFeeMapping = sequelize.define(
  "InstallmentFeeMapping",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mappingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("MAPPING"),
    },
    installmentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feeTypeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 100.0,
      comment: "What % of annual fee for this type",
      validate: {
        min: 0,
        max: 100,
      },
    },
    fixedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Override with fixed amount if needed",
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "installment_fee_mappings",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["installmentId", "feeTypeId"],
        unique: true,
        name: "unique_installment_fee",
      },
    ],
  },
);

export default InstallmentFeeMapping;
