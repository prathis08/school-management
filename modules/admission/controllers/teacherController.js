import { validationResult } from "express-validator";
import TeacherService from "../services/TeacherService.js";

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin)
const getAllTeachers = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      summary: req.query.summary,
    };

    const result = await TeacherService.getAllTeachers(schoolId, options);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get all teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teachers",
    });
  }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private
const getTeacherById = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const teacher = await TeacherService.getTeacherById(
      req.params.id,
      schoolId
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Get teacher by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher",
    });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
const createTeacher = async (req, res) => {
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

    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const createdTeacher = await TeacherService.createTeacher(
      req.body,
      schoolId
    );

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: createdTeacher,
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating teacher",
    });
  }
};

// @desc    Update teacher by ID or schoolId
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
const updateTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const updatedTeacher = await TeacherService.updateTeacher(
      req.params.id,
      req.body,
      schoolId
    );

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Update teacher error:", error);
    if (error.message === "Teacher not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating teacher",
    });
  }
};

// @desc    Delete teacher by ID or schoolId
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deleteTeacher = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    await TeacherService.deleteTeacher(req.params.id, schoolId);

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Delete teacher error:", error);
    if (error.message === "Teacher not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting teacher",
    });
  }
};

// @desc    Get teacher names only
// @route   GET /api/teachers/names
// @access  Private (Admin)
const getTeacherNames = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const teacherNames = await TeacherService.getTeacherNames(schoolId);

    res.status(200).json({
      success: true,
      data: {
        teachers: teacherNames,
        count: teacherNames.length,
      },
    });
  } catch (error) {
    console.error("Get teacher names error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher names",
    });
  }
};

export {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherNames,
};
