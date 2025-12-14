import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { FEE_TYPES, isValidFeeType } from "../constants/feeConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const FeeStructure = sequelize.define(
  "FeeStructure",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    feeStructureId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("FEESTRUCTURE"),
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "schools",
        key: "schoolId",
      },
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feeType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isValidType(value) {
          if (!isValidFeeType(value)) {
            throw new Error(
              `Invalid fee type. Must be one of: ${Object.values(
                FEE_TYPES
              ).join(", ")}`
            );
          }
        },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "fee_structures",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["schoolId", "class_name", "academic_year"],
      },
    ],
  }
);

export default FeeStructure;
