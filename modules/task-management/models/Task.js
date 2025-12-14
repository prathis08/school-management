import { DataTypes } from "sequelize";
import { sequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  VALIDATION,
} from "../constants/taskConstants.js";

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    taskId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      defaultValue: () => generateCustomIdWithPrefix("TASK"),
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title cannot be empty",
        },
        len: {
          args: [1, VALIDATION.TITLE_MAX_LENGTH],
          msg: `Title must be between 1 and ${VALIDATION.TITLE_MAX_LENGTH} characters`,
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, VALIDATION.DESCRIPTION_MAX_LENGTH],
          msg: `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
        },
      },
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Due date must be a valid date",
        },
      },
    },
    dueTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: TASK_PRIORITY.MEDIUM,
      validate: {
        isIn: {
          args: [Object.values(TASK_PRIORITY)],
          msg: "Priority must be one of: low, medium, high, urgent",
        },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: TASK_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(TASK_STATUS)],
          msg: "Status must be one of: pending, in-progress, completed, cancelled",
        },
      },
    },
    assignedToUserId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    createdByUserId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    completedByUserId: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    estimatedHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Estimated hours cannot be negative",
        },
      },
    },
    actualHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Actual hours cannot be negative",
        },
      },
    },
    progressPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Progress percentage cannot be negative",
        },
        max: {
          args: [100],
          msg: "Progress percentage cannot exceed 100",
        },
      },
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidTags(value) {
          if (value && Array.isArray(value)) {
            if (value.length > VALIDATION.MAX_TAGS_PER_TASK) {
              throw new Error(
                `Cannot have more than ${VALIDATION.MAX_TAGS_PER_TASK} tags`
              );
            }
            for (const tag of value) {
              if (
                typeof tag !== "string" ||
                tag.length > VALIDATION.TAG_MAX_LENGTH
              ) {
                throw new Error(
                  `Each tag must be a string with max ${VALIDATION.TAG_MAX_LENGTH} characters`
                );
              }
            }
          }
        },
      },
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    paranoid: false,
    hooks: {
      beforeUpdate: (task, options) => {
        // Auto-set completedAt when status changes to completed
        if (
          task.status === TASK_STATUS.COMPLETED &&
          task._previousDataValues.status !== TASK_STATUS.COMPLETED
        ) {
          task.completedAt = new Date();
          task.progressPercentage = 100;
        } else if (
          task.status !== TASK_STATUS.COMPLETED &&
          task._previousDataValues.status === TASK_STATUS.COMPLETED
        ) {
          task.completedAt = null;
          task.completedByUserId = null;
        }
      },
    },
    indexes: [
      { fields: ["schoolId"] },
      { fields: ["status"] },
      { fields: ["priority"] },
      { fields: ["assigned_to_user_id"] },
      { fields: ["created_by_user_id"] },
      { fields: ["due_date"] },
      { fields: ["is_active"] },
      { fields: ["tags"], using: "gin" },
    ],
  }
);

// Instance methods
Task.prototype.toJSON = function () {
  const values = { ...this.get() };
  // Don't expose internal fields
  delete values.deleted_at;
  return values;
};

// Static methods
Task.findActiveBySchool = function (schoolId, options = {}) {
  return this.findAll({
    where: {
      schoolId: schoolId,
      is_active: true,
      ...options.where,
    },
    ...options,
  });
};

Task.findByTaskIdAndSchool = function (taskId, schoolId, options = {}) {
  return this.findOne({
    where: {
      task_id: taskId,
      schoolId: schoolId,
      is_active: true,
      ...options.where,
    },
    ...options,
  });
};

Task.getStatsBySchool = function (schoolId) {
  return this.findAll({
    where: {
      schoolId: schoolId,
      is_active: true,
    },
    attributes: ["status", "priority", [sequelize.fn("COUNT", "*"), "count"]],
    group: ["status", "priority"],
    raw: true,
  });
};

export default Task;
