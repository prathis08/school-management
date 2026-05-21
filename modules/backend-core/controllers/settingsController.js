import { validationResult } from "express-validator";
import settingsService from "../services/settingsService.js";

// @desc    Get current user's school information
// @route   GET /api/settings/school
// @access  Private
const getSchool = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a school",
      });
    }
    const school = await settingsService.getSchoolBySchoolId(schoolId);
    return res.status(200).json({ success: true, data: school });
  } catch (error) {
    console.error("Get school error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching school",
    });
  }
};

// @desc    Update current user's school information
// @route   PUT /api/settings/school
// @access  Private (Admin)
const updateSchool = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a school",
      });
    }

    const school = await settingsService.updateSchoolBySchoolId(
      schoolId,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "School updated successfully",
      data: school,
    });
  } catch (error) {
    console.error("Update school error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating school",
    });
  }
};

// @desc    Get current user's appearance preferences
// @route   GET /api/settings/preferences
// @access  Private
const getPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    const prefs = await settingsService.getUserPreferences(userId);
    return res.status(200).json({ success: true, data: prefs });
  } catch (error) {
    console.error("Get preferences error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching preferences",
    });
  }
};

// @desc    Update current user's appearance preferences
// @route   PUT /api/settings/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user?.id;
    const prefs = await settingsService.updateUserPreferences(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: prefs,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating preferences",
    });
  }
};

export { getSchool, updateSchool, getPreferences, updatePreferences };
