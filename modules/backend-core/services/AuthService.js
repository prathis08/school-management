import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import {
  User,
  Student,
  Teacher,
  Class,
  Subject,
  Token,
} from "@school-management/backend-core/models/index.js";
import {
  ROLES,
  TOKEN_TYPES,
} from "@school-management/backend-core/constants/roles.js";

class AuthService {
  /**
   * Generate JWT token and save to database
   * @param {string} userId - User ID
   * @param {Object} req - Request object (optional)
   * @returns {string} Generated JWT token
   */
  async generateToken(userId, req = null) {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      throw new Error("JWT configuration error");
    }

    if (!process.env.JWT_EXPIRE) {
      console.warn("JWT_EXPIRE not set, defaulting to 1d");
    }

    const expiresIn = process.env.JWT_EXPIRE || "1d";
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn,
    });

    // Calculate expiration date
    const expiresAt = new Date();
    const expiresInMs = expiresIn.includes("d")
      ? parseInt(expiresIn) * 24 * 60 * 60 * 1000
      : expiresIn.includes("h")
      ? parseInt(expiresIn) * 60 * 60 * 1000
      : expiresIn.includes("m")
      ? parseInt(expiresIn) * 60 * 1000
      : 24 * 60 * 60 * 1000; // default to 1 day

    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    // Extract device info from request if available
    const deviceInfo = req
      ? {
          userAgent: req.get("User-Agent"),
          acceptLanguage: req.get("Accept-Language"),
          acceptEncoding: req.get("Accept-Encoding"),
        }
      : null;

    // Save token to database
    await Token.create({
      token,
      userId: userId,
      type: "access",
      expiresAt: expiresAt,
      deviceInfo: deviceInfo,
      ipAddress: req ? req.ip || req.connection.remoteAddress : null,
      userAgent: req ? req.get("User-Agent") : null,
    });

    return token;
  }

  /**
   * Generate refresh token and save to database
   * @param {string} userId - User ID
   * @param {Object} req - Request object (optional)
   * @returns {string} Generated refresh token
   */
  async generateRefreshToken(userId, req = null) {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      throw new Error("JWT configuration error");
    }

    const refreshExpire = process.env.JWT_REFRESH_EXPIRE || "7d";
    const refreshToken = jwt.sign(
      { userId, type: "refresh" },
      process.env.JWT_SECRET,
      {
        expiresIn: refreshExpire,
      }
    );

    // Calculate expiration date for refresh token
    const expiresAt = new Date();
    const expiresInMs = refreshExpire.includes("d")
      ? parseInt(refreshExpire) * 24 * 60 * 60 * 1000
      : refreshExpire.includes("h")
      ? parseInt(refreshExpire) * 60 * 60 * 1000
      : refreshExpire.includes("m")
      ? parseInt(refreshExpire) * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000; // default to 7 days

    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    // Extract device info from request if available
    const deviceInfo = req
      ? {
          userAgent: req.get("User-Agent"),
          acceptLanguage: req.get("Accept-Language"),
          acceptEncoding: req.get("Accept-Encoding"),
        }
      : null;

    // Save refresh token to database
    await Token.create({
      token: refreshToken,
      userId: userId,
      type: "refresh",
      expiresAt: expiresAt,
      deviceInfo: deviceInfo,
      ipAddress: req ? req.ip || req.connection.remoteAddress : null,
      userAgent: req ? req.get("User-Agent") : null,
    });

    return refreshToken;
  }

  /**
   * Generate both access and refresh tokens
   * @param {string} userId - User ID
   * @param {Object} req - Request object (optional)
   * @returns {Object} Object containing both tokens
   */
  async generateTokens(userId, req = null) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(userId, req),
      this.generateRefreshToken(userId, req),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user with token and profile
   */
  async register(userData) {
    const { schoolId, firstName, lastName, email, password, role } = userData;

    // Check if user already exists by email AND schoolId combination
    const existingUserByEmail = await User.findOne({
      where: {
        email,
        schoolId: schoolId,
      },
    });

    if (existingUserByEmail) {
      throw new Error(
        "User with this email and school ID combination already exists"
      );
    }

    // Create user
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email,
      password,
      role,
      schoolId: schoolId,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Get user profile data
    const profile = await this.getUserProfile(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: profile,
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} req - Request object
   * @returns {Object} User with token and profile
   */
  async login(email, password, req) {
    // Find user by email and ensure they're active
    const user = await User.findOne({
      where: {
        email,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, req);

    // Get user profile data
    const profile = await this.getUserProfile(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: profile,
    };
  }

  /**
   * Get user profile with role-specific data
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Student,
          as: "studentProfile",
          include: [
            {
              model: Class,
              as: "class",
              attributes: ["class_name", "grade", "section"],
            },
          ],
        },
        {
          model: Teacher,
          as: "teacherProfile",
          include: [
            {
              model: Subject,
              as: "subjects",
              attributes: ["subject_name", "subject_code"],
            },
            {
              model: Class,
              as: "managedClasses",
              attributes: ["class_name", "grade", "section"],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Logout user (invalidate single session)
   * @param {string} token - JWT token to invalidate
   * @returns {boolean} Success status
   */
  async logout(token) {
    const deletedCount = await Token.destroy({
      where: { token },
    });

    return deletedCount > 0;
  }

  /**
   * Logout all sessions for a user
   * @param {string} userId - User ID
   * @returns {number} Number of sessions invalidated
   */
  async logoutAll(userId) {
    const deletedCount = await Token.destroy({
      where: { userId: userId },
    });

    return deletedCount;
  }

  /**
   * Get all active sessions for a user
   * @param {string} userId - User ID
   * @returns {Object[]} Array of active sessions
   */
  async getUserSessions(userId) {
    const sessions = await Token.findAll({
      where: {
        userId: userId,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      attributes: [
        "id",
        "type",
        "expiresAt",
        "deviceInfo",
        "ipAddress",
        "userAgent",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return sessions.map((session) => ({
      id: session.id,
      type: session.type,
      expiresAt: session.expiresAt,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      isCurrent: false, // Will be determined in controller
    }));
  }

  /**
   * Revoke a specific session
   * @param {string} sessionId - Session ID to revoke
   * @param {string} userId - User ID (for security)
   * @returns {boolean} Success status
   */
  async revokeSession(sessionId, userId) {
    const deletedCount = await Token.destroy({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (deletedCount === 0) {
      throw new Error("Session not found or does not belong to user");
    }

    return true;
  }

  /**
   * Validate and get user from token
   * @param {string} token - JWT token
   * @returns {Object} User data if valid
   */
  async validateToken(token) {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token exists in database and is not expired
      const tokenRecord = await Token.findOne({
        where: {
          token,
          userId: decoded.userId,
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!tokenRecord) {
        throw new Error("Token not found or expired");
      }

      // Get user
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @param {Object} req - Request object (optional)
   * @returns {Object} New access and refresh tokens
   */
  async refreshAccessToken(refreshToken, req = null) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Ensure this is a refresh token
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // Check if refresh token exists in database and is not expired
      const tokenRecord = await Token.findOne({
        where: {
          token: refreshToken,
          userId: decoded.userId,
          type: "refresh",
          isRevoked: false,
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!tokenRecord) {
        throw new Error("Refresh token not found, expired, or revoked");
      }

      // Get user
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      // Revoke old refresh token
      await tokenRecord.update({ isRevoked: true });

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, req);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          schoolId: user.schoolId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new Error("Invalid or expired refresh token");
      }
      throw error;
    }
  }
}

export default new AuthService();
