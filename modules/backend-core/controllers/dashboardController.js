import DashboardService from "../services/DashboardService.js";

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private
 * @description Get dashboard statistics including total classes, students, and teachers
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get school ID from authenticated user
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID not found in user context",
      });
    }

    // Get dashboard statistics
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
