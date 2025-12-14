// Task Management Module - Main exports

// Controllers
export {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./controllers/taskController.js";

// Routes
export { default as taskRoutes } from "./routes/taskRoutes.js";

// Models
export { default as Task } from "./models/Task.js";

// Services
export { default as TaskService } from "./services/TaskService.js";
