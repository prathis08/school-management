import { Op } from "sequelize";
import Task from "../models/Task.js";
import TaskComment from "../models/TaskComment.js";
import TaskAttachment from "../models/TaskAttachment.js";
import TaskHistory from "../models/TaskHistory.js";
import { User } from "../../backend-core/models/index.js";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  SORT_OPTIONS,
  SORT_ORDER,
  DEFAULT_PAGINATION,
  TASK_ACTIONS,
} from "../constants/taskConstants.js";

/**
 * Create a new task
 */
export const createTask = async (taskData, schoolId, userId) => {
  const task = await Task.create({
    ...taskData,
    schoolId: schoolId,
    created_by_user_id: userId,
  });

  // Create history entry
  await TaskHistory.create({
    task_id: task.id,
    action: TASK_ACTIONS.CREATED,
    description: "Task created",
    changed_by_user_id: userId,
    schoolId: schoolId,
  });

  return task;
};

/**
 * Get all tasks with filtering and pagination
 */
export const getAllTasks = async (schoolId, options = {}) => {
  const {
    page = DEFAULT_PAGINATION.PAGE,
    limit = DEFAULT_PAGINATION.LIMIT,
    status = "all",
    priority = "all",
    assigned_to = null,
    created_by = null,
    tags = null,
    dueDateFrom = null,
    dueDateTo = null,
    search = null,
    sortBy = SORT_OPTIONS.CREATED_AT,
    sortOrder = SORT_ORDER.DESC,
  } = options;

  // Build where conditions
  const where = {
    schoolId: schoolId,
    is_active: true,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  if (priority && priority !== "all") {
    where.priority = priority;
  }

  if (assigned_to) {
    where.assigned_to_user_id = assigned_to;
  }

  if (created_by) {
    where.created_by_user_id = created_by;
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    where.tags = {
      [Op.overlap]: tags,
    };
  }

  if (dueDateFrom || dueDateTo) {
    where.due_date = {};
    if (dueDateFrom) {
      where.due_date[Op.gte] = dueDateFrom;
    }
    if (dueDateTo) {
      where.due_date[Op.lte] = dueDateTo;
    }
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(
    DEFAULT_PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10))
  );
  const offset = (pageNum - 1) * limitNum;

  const order = [[sortBy, sortOrder]];

  // Include related data
  const include = [
    {
      model: User,
      as: "assignedUser",
      attributes: ["user_id", "first_name", "last_name", "email"],
      required: false,
    },
    {
      model: User,
      as: "createdByUser",
      attributes: ["user_id", "first_name", "last_name", "email"],
    },
  ];

  const { rows: tasks, count: totalTasks } = await Task.findAndCountAll({
    where,
    include,
    order,
    limit: limitNum,
    offset,
    distinct: true,
  });

  const totalPages = Math.ceil(totalTasks / limitNum);
  const hasNext = pageNum < totalPages;
  const hasPrevious = pageNum > 1;

  return {
    tasks,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalTasks,
      hasNext,
      hasPrevious,
    },
  };
};

/**
 * Get task by ID with full details
 */
export const getTaskById = async (taskId, schoolId) => {
  const task = await Task.findOne({
    where: {
      task_id: taskId,
      schoolId: schoolId,
      is_active: true,
    },
    include: [
      {
        model: User,
        as: "assignedUser",
        attributes: ["user_id", "first_name", "last_name", "email"],
        required: false,
      },
      {
        model: User,
        as: "createdByUser",
        attributes: ["user_id", "first_name", "last_name", "email"],
      },
    ],
  });

  return task;
};

/**
 * Update a task
 */
export const updateTask = async (taskId, updateData, schoolId, userId) => {
  const task = await Task.findOne({
    where: {
      task_id: taskId,
      schoolId: schoolId,
      is_active: true,
    },
  });

  if (!task) {
    return null;
  }

  // Set completed_by_user_id if status is changing to completed
  if (
    updateData.status === TASK_STATUS.COMPLETED &&
    task.status !== TASK_STATUS.COMPLETED
  ) {
    updateData.completed_by_user_id = userId;
  }

  await task.update(updateData);

  // Create history entry
  await TaskHistory.create({
    task_id: task.id,
    action: TASK_ACTIONS.UPDATED,
    description: "Task updated",
    changed_by_user_id: userId,
    schoolId: schoolId,
  });

  return task;
};

/**
 * Delete a task (soft delete)
 */
export const deleteTask = async (taskId, schoolId, userId) => {
  const task = await Task.findOne({
    where: {
      task_id: taskId,
      schoolId: schoolId,
      is_active: true,
    },
  });

  if (!task) {
    return false;
  }

  await task.update({
    is_active: false,
    deleted_at: new Date(),
  });

  // Create history entry
  await TaskHistory.create({
    task_id: task.id,
    action: TASK_ACTIONS.DELETED,
    description: "Task deleted",
    changed_by_user_id: userId,
    schoolId: schoolId,
  });

  return true;
};

/**
 * Get task statistics for a school
 */
export const getTaskStatistics = async (schoolId) => {
  const stats = await Task.findAll({
    where: {
      schoolId: schoolId,
      is_active: true,
    },
    attributes: [
      "status",
      "priority",
      [Task.sequelize.fn("COUNT", "*"), "count"],
    ],
    group: ["status", "priority"],
    raw: true,
  });

  // Format statistics
  const summary = {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  stats.forEach((stat) => {
    const count = parseInt(stat.count, 10);
    summary.total += count;

    if (stat.status === TASK_STATUS.PENDING) summary.pending += count;
    else if (stat.status === TASK_STATUS.IN_PROGRESS)
      summary.inProgress += count;
    else if (stat.status === TASK_STATUS.COMPLETED) summary.completed += count;
    else if (stat.status === TASK_STATUS.CANCELLED) summary.cancelled += count;

    if (stat.priority === TASK_PRIORITY.URGENT) summary.urgent += count;
    else if (stat.priority === TASK_PRIORITY.HIGH) summary.high += count;
    else if (stat.priority === TASK_PRIORITY.MEDIUM) summary.medium += count;
    else if (stat.priority === TASK_PRIORITY.LOW) summary.low += count;
  });

  // Get overdue tasks count
  const overdueCount = await Task.count({
    where: {
      schoolId: schoolId,
      is_active: true,
      due_date: {
        [Op.lt]: new Date(),
      },
      status: {
        [Op.notIn]: [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED],
      },
    },
  });

  summary.overdue = overdueCount;

  return summary;
};

/**
 * Add comment to a task
 */
export const addTaskComment = async (taskId, content, schoolId, userId) => {
  const task = await Task.findOne({
    where: {
      task_id: taskId,
      schoolId: schoolId,
      is_active: true,
    },
  });

  if (!task) {
    return null;
  }

  const comment = await TaskComment.create({
    task_id: task.id,
    content,
    created_by_user_id: userId,
    schoolId: schoolId,
  });

  // Create history entry
  await TaskHistory.create({
    task_id: task.id,
    action: TASK_ACTIONS.COMMENT_ADDED,
    description: "Comment added to task",
    changed_by_user_id: userId,
    schoolId: schoolId,
  });

  return comment;
};

/**
 * Add attachment to a task
 */
export const addTaskAttachment = async (
  taskId,
  attachmentData,
  schoolId,
  userId
) => {
  const task = await Task.findOne({
    where: {
      task_id: taskId,
      schoolId: schoolId,
      is_active: true,
    },
  });

  if (!task) {
    return null;
  }

  const attachment = await TaskAttachment.create({
    task_id: task.id,
    ...attachmentData,
    uploaded_by_user_id: userId,
    schoolId: schoolId,
  });

  // Create history entry
  await TaskHistory.create({
    task_id: task.id,
    action: TASK_ACTIONS.ATTACHMENT_ADDED,
    description: `File attached: ${attachmentData.file_name}`,
    changed_by_user_id: userId,
    schoolId: schoolId,
  });

  return attachment;
};
