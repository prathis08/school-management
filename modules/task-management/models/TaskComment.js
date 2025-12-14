import { DataTypes } from "sequelize";
import { sequelize } from "../../backend-core/config/database.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const TaskComment = sequelize.define(
  "TaskComment",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    commentId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      defaultValue: () => generateCustomIdWithPrefix("COMMENT"),
    },
    taskId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Comment content cannot be empty",
        },
        len: {
          args: [1, 2000],
          msg: "Comment must be between 1 and 2000 characters",
        },
      },
    },
    createdByUserId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "users",
        key: "userId",
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
    tableName: "task_comments",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    paranoid: false,
    indexes: [
      { fields: ["taskId"] },
      { fields: ["createdByUserId"] },
      { fields: ["schoolId"] },
      { fields: ["isActive"] },
    ],
  }
);

// Instance methods
TaskComment.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.deletedAt;
  return values;
};

export default TaskComment;
