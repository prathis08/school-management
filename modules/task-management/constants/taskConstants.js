// Task Management Constants

export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const TASK_ACTIONS = {
  CREATED: "created",
  UPDATED: "updated",
  ASSIGNED: "assigned",
  UNASSIGNED: "unassigned",
  STATUS_CHANGED: "status_changed",
  PRIORITY_CHANGED: "priority_changed",
  DUE_DATE_CHANGED: "due_date_changed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  COMMENT_ADDED: "comment_added",
  ATTACHMENT_ADDED: "attachment_added",
  ATTACHMENT_REMOVED: "attachment_removed",
};

export const SORT_OPTIONS = {
  CREATED_AT: "created_at",
  DUE_DATE: "due_date",
  PRIORITY: "priority",
  STATUS: "status",
  TITLE: "title",
  UPDATED_AT: "updated_at",
};

export const SORT_ORDER = {
  ASC: "ASC",
  DESC: "DESC",
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

// Validation constants
export const VALIDATION = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 5000,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS_PER_TASK: 10,
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
  ],
};
