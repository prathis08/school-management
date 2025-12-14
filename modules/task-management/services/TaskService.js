import {
  createTask as createTaskDb,
  getAllTasks as getAllTasksDb,
  getTaskById as getTaskByIdDb,
  updateTask as updateTaskDb,
  deleteTask as deleteTaskDb,
  getTaskStatistics as getTaskStatisticsDb,
  addTaskComment as addTaskCommentDb,
  addTaskAttachment as addTaskAttachmentDb,
} from "../dbCommands/taskDbCommands.js";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  VALIDATION,
} from "../constants/taskConstants.js";

class TaskService {
  /**
   * Create a new task
   */
  async createTask(taskData, schoolId, userId) {
    try {
      this.validateTaskData(taskData);

      if (taskData.due_date) {
        const dueDate = new Date(taskData.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          throw new Error("Due date cannot be in the past");
        }
      }

      const task = await createTaskDb(taskData, schoolId, userId);

      return {
        success: true,
        message: "Task created successfully",
        data: task,
      };
    } catch (error) {
      console.error("TaskService - Error creating task:", error);
      throw new Error(error.message || "Failed to create task");
    }
  }

  /**
   * Get all tasks with filtering and pagination
   */
  async getAllTasks(schoolId, queryParams) {
    try {
      const result = await getAllTasksDb(schoolId, queryParams);
      const statistics = await getTaskStatisticsDb(schoolId);

      return {
        success: true,
        message: "Tasks retrieved successfully",
        data: {
          tasks: result.tasks,
          pagination: result.pagination,
          summary: {
            total: statistics.total,
            pending: statistics.pending,
            inProgress: statistics.inProgress,
            completed: statistics.completed,
          },
        },
      };
    } catch (error) {
      console.error("TaskService - Error getting tasks:", error);
      throw new Error("Failed to retrieve tasks");
    }
  }

  /**
   * Get task by ID with full details
   */
  async getTaskById(taskId, schoolId) {
    try {
      if (!taskId) {
        throw new Error("Task ID is required");
      }

      const task = await getTaskByIdDb(taskId, schoolId);

      if (!task) {
        throw new Error("Task not found");
      }

      const relatedTasks = await this.findRelatedTasks(task, schoolId);

      return {
        success: true,
        message: "Task details retrieved successfully",
        data: {
          ...task.toJSON(),
          relatedTasks,
        },
      };
    } catch (error) {
      console.error("TaskService - Error getting task by ID:", error);
      throw new Error(error.message || "Failed to retrieve task details");
    }
  }

  /**
   * Update a task
   */
  async updateTask(taskId, updateData, schoolId, userId) {
    try {
      if (!taskId) {
        throw new Error("Task ID is required");
      }

      this.validateTaskUpdateData(updateData);

      if (updateData.due_date) {
        const dueDate = new Date(updateData.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          throw new Error("Due date cannot be in the past");
        }
      }

      const task = await updateTaskDb(taskId, updateData, schoolId, userId);

      if (!task) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Task updated successfully",
        data: task,
      };
    } catch (error) {
      console.error("TaskService - Error updating task:", error);
      throw new Error(error.message || "Failed to update task");
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId, schoolId, userId) {
    try {
      if (!taskId) {
        throw new Error("Task ID is required");
      }

      const success = await deleteTaskDb(taskId, schoolId, userId);

      if (!success) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Task deleted successfully",
        data: {
          deletedTaskId: taskId,
          deletedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("TaskService - Error deleting task:", error);
      throw new Error(error.message || "Failed to delete task");
    }
  }

  /**
   * Add comment to a task
   */
  async addComment(taskId, content, schoolId, userId) {
    try {
      if (!taskId) {
        throw new Error("Task ID is required");
      }

      if (!content || content.trim().length === 0) {
        throw new Error("Comment content is required");
      }

      if (content.length > 2000) {
        throw new Error("Comment content cannot exceed 2000 characters");
      }

      const comment = await addTaskCommentDb(
        taskId,
        content.trim(),
        schoolId,
        userId
      );

      if (!comment) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Comment added successfully",
        data: comment,
      };
    } catch (error) {
      console.error("TaskService - Error adding comment:", error);
      throw new Error(error.message || "Failed to add comment");
    }
  }

  /**
   * Get task statistics
   */
  async getStatistics(schoolId) {
    try {
      const statistics = await getTaskStatisticsDb(schoolId);

      return {
        success: true,
        message: "Task statistics retrieved successfully",
        data: statistics,
      };
    } catch (error) {
      console.error("TaskService - Error getting statistics:", error);
      throw new Error("Failed to retrieve task statistics");
    }
  }

  /**
   * Find related tasks
   */
  async findRelatedTasks(task, schoolId) {
    try {
      const relatedTasks = await getAllTasksDb(schoolId, {
        tags: task.tags && task.tags.length > 0 ? task.tags.slice(0, 2) : null,
        limit: 5,
        sortBy: "due_date",
        sortOrder: "ASC",
      });

      return relatedTasks.tasks
        .filter((t) => t.task_id !== task.task_id)
        .map((t) => ({
          id: t.task_id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
        }));
    } catch (error) {
      console.error("TaskService - Error finding related tasks:", error);
      return [];
    }
  }

  /**
   * Validate task data
   */
  validateTaskData(taskData) {
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (taskData.title.length > VALIDATION.TITLE_MAX_LENGTH) {
      throw new Error(
        `Title cannot exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`
      );
    }

    if (
      taskData.description &&
      taskData.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH
    ) {
      throw new Error(
        `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`
      );
    }

    if (
      taskData.priority &&
      !Object.values(TASK_PRIORITY).includes(taskData.priority)
    ) {
      throw new Error("Invalid priority value");
    }

    if (
      taskData.status &&
      !Object.values(TASK_STATUS).includes(taskData.status)
    ) {
      throw new Error("Invalid status value");
    }
  }

  /**
   * Validate task update data
   */
  validateTaskUpdateData(updateData) {
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim().length === 0) {
        throw new Error("Title cannot be empty");
      }
      if (updateData.title.length > VALIDATION.TITLE_MAX_LENGTH) {
        throw new Error(
          `Title cannot exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`
        );
      }
    }

    if (
      updateData.description &&
      updateData.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH
    ) {
      throw new Error(
        `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`
      );
    }

    if (
      updateData.priority &&
      !Object.values(TASK_PRIORITY).includes(updateData.priority)
    ) {
      throw new Error("Invalid priority value");
    }

    if (
      updateData.status &&
      !Object.values(TASK_STATUS).includes(updateData.status)
    ) {
      throw new Error("Invalid status value");
    }
  }
}

export default new TaskService();
