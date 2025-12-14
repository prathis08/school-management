import { validationResult } from "express-validator";
import ClassService from "../services/ClassService.js";

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
const getAllClasses = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const classes = await ClassService.getAllClasses(schoolId);

    res.status(200).json({
      success: true,
      data: classes,
      total: classes.length,
    });
  } catch (error) {
    console.error("Get all classes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching classes",
    });
  }
};

// @desc    Get class by ID or schoolId
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const classData = await ClassService.getClassById(req.params.id, schoolId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Get class by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching class",
    });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
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

    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const createdClass = await ClassService.createClass(req.body, schoolId);

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: createdClass,
    });
  } catch (error) {
    console.error("Create class error:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating class",
    });
  }
};

// @desc    Update class by ID or schoolId
// @route   PUT /api/classes/:id
// @access  Private (Admin)
const updateClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const updatedClass = await ClassService.updateClass(
      req.params.id,
      req.body,
      schoolId
    );

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Update class error:", error);
    if (error.message === "Class not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error.message.includes("already exists") ||
      error.message.includes("no changes made")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating class",
    });
  }
};

// @desc    Delete class by ID or schoolId
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
const deleteClass = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    await ClassService.deleteClass(req.params.id, schoolId);

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    if (
      error.message === "Class not found" ||
      error.message.includes("already deleted")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("Cannot delete class")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting class",
    });
  }
};

// @desc    Add student to class
// @route   POST /api/classes/:id/students
// @access  Private (Admin)
const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body; // studentId can be UUID or custom ID
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const result = await ClassService.addStudentToClass(
      req.params.id,
      studentId,
      schoolId
    );

    res.status(200).json({
      success: true,
      message: `Student successfully added to ${result.className}`,
      data: result,
    });
  } catch (error) {
    console.error("Add student to class error:", error);
    if (
      error.message === "Class not found" ||
      error.message === "Student not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error.message.includes("does not belong") ||
      error.message.includes("maximum capacity") ||
      error.message.includes("already") ||
      error.message.includes("enrolled")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while adding student to class",
    });
  }
};

// @desc    Get grades and classes list
// @route   GET /api/classes/grades-and-classes
// @access  Private
const getGradesAndClasses = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const gradesData = await ClassService.getGradesAndClasses(schoolId);

    res.status(200).json({
      success: true,
      data: gradesData,
    });
  } catch (error) {
    console.error("Get grades and classes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching grades and classes",
    });
  }
};

const getGradesOptions = async (req, res) => {
  const grades = [
    "Pre-Primary",
    "Primary",
    "LKG",
    "UKG",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ];
  return res.status(200).json({
    success: true,
    data: grades,
  });
};

export default {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  getGradesAndClasses,
  getGradesOptions,
};
