import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "@school-management/backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const AcademicYear = sequelize.define(
  "AcademicYear",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    academicYearId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("ACYEAR"),
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'e.g., "2024-25"',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "April 1st",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "March 31st",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    schoolId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "academic_years",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["schoolId", "isActive"],
        name: "idx_academic_years_school_active",
      },
      {
        fields: ["schoolId", "name"],
        unique: true,
        name: "unique_school_academic_year",
      },
    ],
  },
);

export default AcademicYear;
