import TaskService from "../services/TaskService.js";
import { ROLES } from "../../backend-core/constants/roles.js";

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const { schoolId, user_id, role } = req.user;
    const taskData = req.body;

    // Ensure schoolId is set
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Set assigned_to to creator if not specified and role allows
    if (!taskData.assigned_to) {
      taskData.assigned_to = user_id;
    }

    const result = await TaskService.createTask(taskData, schoolId, user_id);

    return res.status(201).json(result);
  } catch (error) {
    console.error("createTask error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all tasks with filtering and pagination
 */
export const getAllTasks = async (req, res) => {
  try {
    const { schoolId, user_id, role } = req.user;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Filter by user for non-admin roles
    let queryParams = { ...req.query };
    if (role === ROLES.TEACHER || role === ROLES.STUDENT) {
      queryParams.assigned_to = user_id;
    }

    const result = await TaskService.getAllTasks(schoolId, queryParams);

    return res.status(200).json(result);
  } catch (error) {
    console.error("getAllTasks error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (req, res) => {
  try {
    const { schoolId, user_id, role } = req.user;
    const { taskId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const result = await TaskService.getTaskById(taskId, schoolId);

    // Check if user has permission to view this task
    if (role === ROLES.TEACHER || role === ROLES.STUDENT) {
      if (
        result.data.assigned_to !== user_id &&
        result.data.created_by !== user_id
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("getTaskById error:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a task
 */
export const updateTask = async (req, res) => {
  try {
    const { schoolId, user_id, role } = req.user;
    const { taskId } = req.params;
    const updateData = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Check if user has permission to update this task
    if (role === ROLES.TEACHER || role === ROLES.STUDENT) {
      // First get the task to check ownership
      try {
        const existingTask = await TaskService.getTaskById(taskId, schoolId);
        if (
          existingTask.data.assigned_to !== user_id &&
          existingTask.data.created_by !== user_id
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
    }

    const result = await TaskService.updateTask(
      taskId,
      updateData,
      schoolId,
      user_id
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("updateTask error:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res) => {
  try {
    const { schoolId, user_id, role } = req.user;
    const { taskId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Only admin and coordinator can delete tasks
    if (role !== ROLES.ADMIN && role !== ROLES.COORDINATOR) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const result = await TaskService.deleteTask(taskId, schoolId, user_id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("deleteTask error:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add comment to a task
 */
export const addComment = async (req, res) => {
  try {
    const { schoolId, user_id, role } = req.user;
    const { taskId } = req.params;
    const { content } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Check if user has permission to comment on this task
    if (role === ROLES.TEACHER || role === ROLES.STUDENT) {
      try {
        const existingTask = await TaskService.getTaskById(taskId, schoolId);
        if (
          existingTask.data.assigned_to !== user_id &&
          existingTask.data.created_by !== user_id
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
    }

    const result = await TaskService.addComment(
      taskId,
      content,
      schoolId,
      user_id
    );

    return res.status(201).json(result);
  } catch (error) {
    console.error("addComment error:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get task statistics
 */
export const getStatistics = async (req, res) => {
  try {
    const { schoolId, role } = req.user;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Only admin and coordinator can view statistics
    if (role !== ROLES.ADMIN && role !== ROLES.COORDINATOR) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const result = await TaskService.getStatistics(schoolId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("getStatistics error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
