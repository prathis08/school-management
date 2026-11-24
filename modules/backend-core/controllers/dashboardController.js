import DashboardService from "../services/DashboardService.js";

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private
 * @description Get dashboard statistics including total classes, students, and teachers
 */
const requireSchool = (req, res) => {
  const schoolId = req.user.schoolId;
  if (!schoolId) {
    res.status(400).json({
      success: false,
      message: "School ID not found in user context",
    });
    return null;
  }
  return schoolId;
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;

    const result = await DashboardService.getStats(schoolId);

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getDashboardStats controller:", error);
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;

    const data = await DashboardService.getRecentActivity(schoolId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getRecentActivity controller:", error);
    next(error);
  }
};

export const getAttendanceOverview = async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;

    const data = await DashboardService.getAttendanceOverview(schoolId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getAttendanceOverview controller:", error);
    next(error);
  }
};

export const getPerformance = async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;

    const data = await DashboardService.getPerformance(schoolId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getPerformance controller:", error);
    next(error);
  }
};
