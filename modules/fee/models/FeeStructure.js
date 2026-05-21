import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    academicSession: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    applicableGrade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    allowInstallments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    availableForDiscount: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "fee_structures",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["schoolId", "applicableClass", "academicSession"],
      },
    ],
  }
);

export default FeeStructure;
