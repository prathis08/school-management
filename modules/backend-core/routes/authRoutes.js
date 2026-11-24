import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  getSessions,
  revokeSession,
} from "../controllers/authController.js";
import {
  validateUserRegistration,
  validateUserLogin,
} from "@school-management/backend-core/middleware/validation.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import populateUserHeaders from "../middleware/populateUserHeaders.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// @route   POST /api/auth/register-user
// @desc    Create a user inside the caller's school
// @access  Private (Admin only) — public self-registration is disabled so an
//          unauthenticated user cannot choose a role or schoolId.
router.post(
  "/register-user",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  validateUserRegistration,
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login-user", validateUserLogin, login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (requires refresh token)
router.post("/refresh-token", refreshToken);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/get-user-profile", auth, getProfile);

// @route   POST /api/auth/logout
// @desc    Logout current session
// @access  Private
router.post("/logout-user", auth, logout);

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post("/logout-all-devices", auth, logoutAll);

// @route   GET /api/auth/sessions
// @desc    Get active sessions
// @access  Private
router.get("/get-active-sessions", auth, getSessions);

// @route   DELETE /api/auth/sessions/:sessionId
// @desc    Revoke a specific session
// @access  Private
router.delete("/revoke-session/:sessionId", auth, revokeSession);

export default router;
