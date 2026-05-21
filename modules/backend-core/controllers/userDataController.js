import { validationResult } from "express-validator";
import userDataService from "../services/userDataService.js";

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;

    const user = await userDataService.getUserProfile(userId, schoolId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching profile",
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const schoolId = req.user.schoolId;

    const updatedUser = await userDataService.updateUserProfile(
      userId,
      schoolId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating profile",
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const schoolId = req.user.schoolId;
    const { currentPassword, newPassword } = req.body;

    await userDataService.updatePassword(
      userId,
      schoolId,
      currentPassword,
      newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error.message.includes("incorrect")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/profile/:userId
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const schoolId = req.user.schoolId;

    const user = await userDataService.getUserProfile(userId, schoolId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

// @desc    Update user by ID (admin only)
// @route   PUT /api/profile/:userId
// @access  Private (Admin)
const updateUserById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const schoolId = req.user.schoolId;

    const updatedUser = await userDataService.updateUserProfile(
      userId,
      schoolId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/profile/users/all
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const filters = {
      role: req.query.role,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
    };

    const users = await userDataService.getAllUsers(schoolId, filters);

    res.status(200).json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

export {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getUserById,
  updateUserById,
  getAllUsers,
};
