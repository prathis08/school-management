import { DataTypes } from "sequelize";
import { sequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";
import { FILE_UPLOAD } from "../constants/taskConstants.js";

const TaskAttachment = sequelize.define(
  "TaskAttachment",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    attachmentId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      defaultValue: () => generateCustomIdWithPrefix("ATTACH"),
    },
    taskId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "File name cannot be empty",
        },
      },
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "File path cannot be empty",
        },
      },
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "File size must be greater than 0",
        },
        max: {
          args: [FILE_UPLOAD.MAX_FILE_SIZE],
          msg: `File size cannot exceed ${
            FILE_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
      },
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isIn: {
          args: [FILE_UPLOAD.ALLOWED_TYPES],
          msg: "File type not allowed",
        },
      },
    },
    uploadedByUserId: {
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
    tableName: "task_attachments",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    underscored: true, // This makes Sequelize use snake_case for field names
    indexes: [
      { fields: ["task_id"] },
      { fields: ["uploaded_by_user_id"] },
      { fields: ["schoolId"] },
      { fields: ["is_active"] },
    ],
  }
);

// Add uploadedAt field manually
TaskAttachment.rawAttributes.uploadedAt = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
};

// Instance methods
TaskAttachment.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.deletedAt;
  return values;
};

export default TaskAttachment;
