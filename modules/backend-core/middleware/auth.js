import jwt from "jsonwebtoken";
import { User, Token } from "../models/index.js";
import { getAccessToken } from "../utils/cookieHelper.js";
import { ROLES } from "../constants/roles.js";

// Endpoints a user may still call while they must change their password.
const PASSWORD_CHANGE_ALLOWED_PATHS = new Set([
  "/api/profile",
  "/api/profile/password",
  "/api/auth/get-user-profile",
  "/api/auth/logout-user",
  "/api/auth/logout-all-devices",
  "/api/features/get-dashboard-config",
  "/api/health",
]);

// Endpoints a student may call when the student dashboard is disabled.
const STUDENT_ALLOWED_PATHS = new Set([
  "/api/profile",
  "/api/profile/password",
  "/api/auth/get-user-profile",
  "/api/auth/logout-user",
  "/api/auth/logout-all-devices",
]);

const auth = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Accept either an Authorization: Bearer header (API clients) or the
    // httpOnly access cookie (browser).
    const token = getAccessToken(req);

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists in database and is valid
    const tokenRecord = await Token.findValidToken(token);

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid or has been revoked",
      });
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid - user not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const requestPath = (req.originalUrl || "").split("?")[0];

    if (
      user.mustChangePassword &&
      !PASSWORD_CHANGE_ALLOWED_PATHS.has(requestPath)
    ) {
      return res.status(403).json({
        success: false,
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "You must change your password before continuing",
      });
    }

    const studentDashboardEnabled =
      process.env.ALLOW_STUDENT_DASHBOARD === "true";
    if (
      user.role === ROLES.STUDENT &&
      !studentDashboardEnabled &&
      !STUDENT_ALLOWED_PATHS.has(requestPath)
    ) {
      return res.status(403).json({
        success: false,
        code: "STUDENT_DASHBOARD_DISABLED",
        message: "Student access to the dashboard is disabled",
      });
    }

    req.user = user;
    req.tokenRecord = tokenRecord; // Store token record for potential use in controllers
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    // Provide specific error messages based on error type
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        error: error.message,
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED",
        hint: "Use the refresh token endpoint to get a new access token",
      });
    } else if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Token not active yet",
      });
    }

    res.status(401).json({
      success: false,
      message: "Token verification failed",
      error: error.message,
    });
  }
};

export default auth;
