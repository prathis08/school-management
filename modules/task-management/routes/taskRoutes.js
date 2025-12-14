import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getStatistics,
} from "../controllers/taskController.js";
import auth from "../../backend-core/middleware/auth.js";
import authorize from "../../backend-core/middleware/authorize.js";
import populateUserHeaders from "../../backend-core/middleware/populateUserHeaders.js";
import { ROLES } from "../../backend-core/constants/roles.js";

const router = express.Router();

// Apply authentication and user header population to all routes
router.use(auth);
router.use(populateUserHeaders);

/**
 * @route   GET /api/tasks/statistics
 * @desc    Get task statistics for the school
 * @access  Private (Admin, Coordinator)
 * @note    Must come before /:id routes to avoid conflicts
 */
router.get(
  "/statistics",
  authorize(ROLES.ADMIN, ROLES.COORDINATOR),
  getStatistics
);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (Admin, Coordinator, Accountant, Teacher)
 */
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.TEACHER),
  createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering and pagination
 * @access  Private (All authenticated users can view tasks)
 */
router.get(
  "/",
  authorize(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACCOUNTANT,
    ROLES.TEACHER,
    ROLES.STUDENT
  ),
  getAllTasks
);

/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get task details by ID
 * @access  Private (All authenticated users can view task details)
 */
router.get(
  "/:taskId",
  authorize(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACCOUNTANT,
    ROLES.TEACHER,
    ROLES.STUDENT
  ),
  getTaskById
);

/**
 * @route   PUT /api/tasks/:taskId
 * @desc    Update a task
 * @access  Private (Admin, Coordinator, Accountant, Teacher)
 * @note    Users can only update tasks they created or are assigned to
 */
router.put(
  "/:taskId",
  authorize(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.TEACHER),
  updateTask
);

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete a task (soft delete)
 * @access  Private (Admin, Coordinator)
 * @note    Only admins and coordinators can delete tasks
 */
router.delete(
  "/:taskId",
  authorize(ROLES.ADMIN, ROLES.COORDINATOR),
  deleteTask
);

/**
 * @route   POST /api/tasks/:taskId/comments
 * @desc    Add a comment to a task
 * @access  Private (All authenticated users can comment)
 */
router.post(
  "/:taskId/comments",
  authorize(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACCOUNTANT,
    ROLES.TEACHER,
    ROLES.STUDENT
  ),
  addComment
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error("Task routes error:", error);

  // Handle validation errors
  if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Handle unique constraint errors
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
      error: error.message,
    });
  }

  // Handle foreign key constraint errors
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference to related resource",
      error: "One or more referenced resources do not exist",
    });
  }

  // Handle generic errors
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default router;
