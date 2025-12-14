import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

const Class = sequelize.define(
  "class",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    classId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("CLASS"),
    },
    classTeacherId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "teacher",
        key: "teacher_id",
      },
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxStudents: {
      type: DataTypes.INTEGER,
    },
    room: {
      type: DataTypes.STRING,
    },
    schedule: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
  }
);

export default Class;
