import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const GradeFees = sequelize.define(
  "GradeFees",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feeStructureId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "grade_fees",
    timestamps: true,
    underscored: true,
  },
);

export default GradeFees;
