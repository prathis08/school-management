import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import AuthService from "../services/AuthService.js";
import { User, Token } from "../models/index.js";
import { ROLES } from "../constants/roles.js";
import { Student, Teacher, Class, Subject } from "../models/index.js";

// Generate JWT token and save to database
const generateToken = async (userId, req = null) => {
  return await AuthService.generateToken(userId, req);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          schoolId: result.user.schoolId,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const result = await AuthService.login(email, password, req);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          schoolId: result.user.schoolId,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
        schoolId: req.user.schoolId, // Ensure user belongs to same school
      },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = {
      user,
    };

    // Get role-specific data within the same school
    if (user.role === ROLES.STUDENT) {
      const student = await Student.findOne({
        where: {
          user_id: user.id,
          schoolId: user.schoolId,
        },
        include: [{ model: Class, as: "class" }],
      });
      profile.studentInfo = student;
    } else if (user.role === ROLES.TEACHER) {
      const teacher = await Teacher.findOne({
        where: {
          user_id: user.id,
          schoolId: user.schoolId,
        },
        include: [
          { model: Subject, as: "subjects" },
          { model: Class, as: "managedClasses" },
        ],
      });
      profile.teacherInfo = teacher;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// @desc    Logout user (revoke current token)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Get the token from the request (added by auth middleware)
    const tokenRecord = req.tokenRecord;

    if (tokenRecord) {
      // Revoke the current token
      await tokenRecord.update({ is_revoked: true });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// @desc    Logout from all devices (revoke all user tokens)
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    // Revoke all tokens for the user
    await Token.revokeUserTokens(userId);

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout from all devices",
    });
  }
};

// @desc    Get active sessions
// @route   GET /api/auth/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTokenId = req.tokenRecord?.id;

    const sessions = await Token.findAll({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: {
          [Token.sequelize.Sequelize.Op.gt]: new Date(),
        },
      },
      attributes: [
        "id",
        "device_info",
        "ip_address",
        "user_agent",
        "created_at",
        "expires_at",
      ],
      order: [["created_at", "DESC"]],
    });

    // Mark current session
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session.toJSON(),
      isCurrent: session.id === currentTokenId,
    }));

    res.status(200).json({
      success: true,
      data: {
        sessions: sessionsWithCurrent,
        totalSessions: sessions.length,
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sessions",
    });
  }
};

// @desc    Revoke a specific session
// @route   DELETE /api/auth/sessions/:sessionId
// @access  Private
const revokeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.sessionId;
    const currentTokenId = req.tokenRecord?.id;

    // Prevent revoking current session
    if (sessionId === currentTokenId) {
      return res.status(400).json({
        success: false,
        message: "Cannot revoke current session. Use logout instead.",
      });
    }

    const token = await Token.findOne({
      where: {
        id: sessionId,
        user_id: userId,
        is_revoked: false,
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Session not found or already revoked",
      });
    }

    await token.update({ is_revoked: true });

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while revoking session",
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token)
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await AuthService.refreshAccessToken(refreshToken, req);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Failed to refresh token",
    });
  }
};

export {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  getSessions,
  revokeSession,
};
