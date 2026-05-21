import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const ClassFee = sequelize.define(
  "ClassFee",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    classFeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("CLASSFEE"),
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gradeId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "NULL if class-specific, set if grade-level fees",
    },
    classId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "NULL if grade-level, set if class-specific fees",
    },
    feeTypeId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "References FeeType.feeTypeId (custom string ID)",
    },
    annualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Total annual amount for this fee type",
    },
    isMandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "class_fees",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["academicYearId"],
        name: "idx_class_fees_academic_year",
      },
      {
        fields: ["classId"],
        name: "idx_class_fees_class_id",
      },
      {
        fields: ["academicYearId", "classId", "gradeId", "feeTypeId"],
        unique: true,
        name: "unique_class_fee",
      },
      {
        fields: ["gradeId"],
        name: "idx_class_fees_grade_id",
      },
    ],
  },
);

export default ClassFee;
