import userDataDbCommands from "../dbCommands/userDataDbCommands.js";
import { User } from "../models/index.js";

class UserDataService {
  /**
   * Get user profile by user ID
   * @param {string} userId - User ID
   * @param {string} schoolId - School ID for security
   * @returns {Object} User profile
   */
  async getUserProfile(userId, schoolId) {
    try {
      const user = await userDataDbCommands.findUserById(userId, schoolId);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Get user profile error:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {string} schoolId - School ID for security
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUserProfile(userId, schoolId, updateData) {
    try {
      // Validate user exists and belongs to school
      const user = await userDataDbCommands.findUserById(userId, schoolId);

      if (!user) {
        throw new Error("User not found");
      }

      // Don't allow updating certain fields
      const restrictedFields = [
        "id",
        "userId",
        "password",
        "role",
        "schoolId",
        "createdAt",
        "updatedAt",
      ];
      restrictedFields.forEach((field) => delete updateData[field]);

      // Update user
      const updatedUser = await userDataDbCommands.updateUser(
        userId,
        schoolId,
        updateData,
      );

      return updatedUser;
    } catch (error) {
      console.error("Update user profile error:", error);
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} schoolId - School ID for security
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  async updatePassword(userId, schoolId, currentPassword, newPassword) {
    try {
      const user = await User.findOne({
        where: { id: userId, schoolId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      // Update password (will be hashed by model hook)
      await user.update({ password: newPassword });

      return true;
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @param {string} schoolId - School ID
   * @param {Object} filters - Filter options
   * @returns {Array} List of users
   */
  async getAllUsers(schoolId, filters = {}) {
    try {
      const users = await userDataDbCommands.findAllUsers(schoolId, filters);
      return users;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  }
}

export default new UserDataService();
