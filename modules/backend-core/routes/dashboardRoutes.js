import express from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getAttendanceOverview,
  getPerformance,
} from "../controllers/dashboardController.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics (total classes, students, teachers)
 * @access  Private (Admin, Coordinator, Accountant, Teacher)
 */
const STAFF = authorize(
  ROLES.ADMIN,
  ROLES.COORDINATOR,
  ROLES.ACCOUNTANT,
  ROLES.TEACHER,
);

router.get("/stats", auth, STAFF, getDashboardStats);
router.get("/recent-activity", auth, STAFF, getRecentActivity);
router.get("/attendance-overview", auth, STAFF, getAttendanceOverview);
router.get("/performance", auth, STAFF, getPerformance);

export default router;
