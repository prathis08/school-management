import { User } from "../models/index.js";

const userDataDbCommands = {
  /**
   * Find user by ID and schoolId
   * @param {string} userId - User ID (UUID or custom ID)
   * @param {string} schoolId - School ID for security
   * @returns {Object|null} User object without password
   */
  async findUserById(userId, schoolId) {
    try {
      const user = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { id: userId },
            { userId: userId },
          ],
          schoolId: schoolId,
        },
        attributes: { exclude: ["password"] },
      });

      return user;
    } catch (error) {
      console.error("Find user by ID error:", error);
      throw error;
    }
  },

  /**
   * Update user data
   * @param {string} userId - User ID
   * @param {string} schoolId - School ID for security
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUser(userId, schoolId, updateData) {
    try {
      const user = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { id: userId },
            { userId: userId },
          ],
          schoolId: schoolId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      await user.update(updateData);

      // Return user without password
      const updatedUser = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ["password"] },
      });

      return updatedUser;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  /**
   * Find all users in a school
   * @param {string} schoolId - School ID
   * @param {Object} filters - Filter options (role, isActive, etc.)
   * @returns {Array} List of users
   */
  async findAllUsers(schoolId, filters = {}) {
    try {
      const whereClause = { schoolId };

      if (filters.role) {
        whereClause.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });

      return users;
    } catch (error) {
      console.error("Find all users error:", error);
      throw error;
    }
  },
};

export default userDataDbCommands;
