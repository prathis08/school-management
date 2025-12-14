import { getDashboardStats } from "../dbCommands/dashboardDbCommands.js";

class DashboardService {
  /**
   * Get dashboard statistics for a school
   * @param {string} schoolId - School identifier
   * @returns {Promise<object>} - Dashboard statistics
   */
  async getStats(schoolId) {
    if (!schoolId) {
      throw new Error("School ID is required");
    }

    try {
      const stats = await getDashboardStats(schoolId);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("DashboardService - Error getting stats:", error);
      throw new Error("Failed to retrieve dashboard statistics");
    }
  }
}

export default new DashboardService();
