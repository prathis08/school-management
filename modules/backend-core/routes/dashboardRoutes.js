import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics (total classes, students, teachers)
 * @access  Private (Admin, Coordinator, Accountant, Teacher)
 */
router.get(
  "/stats",
  auth,
  authorize(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.TEACHER),
  getDashboardStats
);

export default router;
