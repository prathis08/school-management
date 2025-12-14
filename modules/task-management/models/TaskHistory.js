import { DataTypes } from "sequelize";
import { sequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";
import { TASK_ACTIONS } from "../constants/taskConstants.js";

const TaskHistory = sequelize.define(
  "TaskHistory",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    historyId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      defaultValue: () => generateCustomIdWithPrefix("HIST"),
    },
    taskId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TASK_ACTIONS)],
          msg: "Invalid action type",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Description cannot be empty",
        },
      },
    },
    oldValue: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdByUserId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "schools",
        key: "schoolId",
      },
    },
  },
  {
    tableName: "task_history",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    underscored: true, // This makes Sequelize use snake_case for field names
    indexes: [
      { fields: ["task_id"] },
      { fields: ["action"] },
      { fields: ["created_by_user_id"] },
      { fields: ["schoolId"] },
    ],
  }
);

// Add createdAt field manually
TaskHistory.rawAttributes.createdAt = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
};

// Static methods
TaskHistory.createEntry = function (
  taskId,
  action,
  description,
  oldValue = null,
  newValue = null,
  userId,
  schoolId
) {
  return this.create({
    taskId: taskId,
    action,
    description,
    oldValue: oldValue,
    newValue: newValue,
    createdByUserId: userId,
    schoolId: schoolId,
  });
};

export default TaskHistory;
