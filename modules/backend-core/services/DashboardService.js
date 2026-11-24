import { getDashboardStats } from "../dbCommands/dashboardDbCommands.js";
import Attendance from "../../attendance/models/Attendance.js";
import {
  ATTENDANCE_STATUS,
} from "../../attendance/constants/attendanceConstants.js";

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

  /**
   * Today's attendance overview for the dashboard.
   */
  async getAttendanceOverview(schoolId) {
    const date = new Date().toISOString().slice(0, 10);
    const records = await Attendance.findAll({
      where: { schoolId, date, isActive: true },
    });

    const counts = {
      [ATTENDANCE_STATUS.PRESENT]: 0,
      [ATTENDANCE_STATUS.ABSENT]: 0,
      [ATTENDANCE_STATUS.LATE]: 0,
      [ATTENDANCE_STATUS.EXCUSED]: 0,
    };
    for (const record of records) {
      if (counts[record.status] !== undefined) counts[record.status] += 1;
    }
    const total = records.length;
    const attended = counts.PRESENT + counts.LATE;

    return {
      date,
      total,
      present: counts.PRESENT,
      absent: counts.ABSENT,
      late: counts.LATE,
      excused: counts.EXCUSED,
      percentage: total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0,
    };
  }

  /**
   * Recent activity feed. Returns an empty list until a dedicated activity
   * log exists; the UI renders an empty state for an empty array.
   */
  async getRecentActivity() {
    return [];
  }

  /**
   * Performance series. Returns an empty list until grade analytics exist;
   * the UI renders an empty state for an empty array.
   */
  async getPerformance() {
    return [];
  }
}

export default new DashboardService();
