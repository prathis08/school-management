import cron from "node-cron";
import { Token } from "../models/index.js";

class TokenCleanupService {
  static isRunning = false;

  /**
   * Start the token cleanup service
   * Runs every hour to clean up expired tokens
   */
  static start() {
    if (this.isRunning) {
      console.log("Token cleanup service is already running");
      return;
    }

    console.log("Starting token cleanup service...");

    // Run cleanup every hour
    cron.schedule("0 * * * *", async () => {
      await this.cleanupExpiredTokens();
    });

    // Also run cleanup on startup
    this.cleanupExpiredTokens();

    this.isRunning = true;
    console.log("Token cleanup service started successfully");
  }

  /**
   * Stop the token cleanup service
   */
  static stop() {
    this.isRunning = false;
    console.log("Token cleanup service stopped");
  }

  /**
   * Clean up expired tokens from the database
   */
  static async cleanupExpiredTokens() {
    try {
      console.log("Running token cleanup...");
      const deletedCount = await Token.cleanupExpiredTokens();

      if (deletedCount > 0) {
        console.log(
          `Token cleanup completed: ${deletedCount} expired tokens removed`
        );
      } else {
        console.log("Token cleanup completed: No expired tokens found");
      }

      return deletedCount;
    } catch (error) {
      console.error("Error during token cleanup:", error);
      throw error;
    }
  }

  /**
   * Clean up tokens for a specific user (useful for account deletion)
   */
  static async cleanupUserTokens(userId) {
    try {
      console.log(`Cleaning up tokens for user: ${userId}`);
      const deletedCount = await Token.destroy({
        where: { userId },
      });

      console.log(`Removed ${deletedCount} tokens for user ${userId}`);
      return deletedCount;
    } catch (error) {
      console.error(`Error cleaning up tokens for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get token statistics
   */
  static async getTokenStats() {
    try {
      const totalTokens = await Token.count();
      const activeTokens = await Token.count({
        where: {
          isRevoked: false,
          expiresAt: {
            [Token.sequelize.Sequelize.Op.gt]: new Date(),
          },
        },
      });
      const expiredTokens = await Token.count({
        where: {
          expiresAt: {
            [Token.sequelize.Sequelize.Op.lt]: new Date(),
          },
        },
      });
      const revokedTokens = await Token.count({
        where: { isRevoked: true },
      });

      return {
        total: totalTokens,
        active: activeTokens,
        expired: expiredTokens,
        revoked: revokedTokens,
      };
    } catch (error) {
      console.error("Error getting token statistics:", error);
      throw error;
    }
  }
}

export default TokenCleanupService;
