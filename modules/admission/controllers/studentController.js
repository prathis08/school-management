import { validationResult } from "express-validator";
import StudentService from "../services/StudentService.js";
import { getStudentStatusValues } from "../constants/admissionConstants.js";

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getAllStudents = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      gradeId: req.query.gradeId,
    };

    const result = await StudentService.getAllStudents(schoolId, options);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching students",
    });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const student = await StudentService.getStudentById(
      req.params.id,
      schoolId,
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get student by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student",
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
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

    // Get schoolId from middleware
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const createdStudent = await StudentService.createStudent(
      req.body,
      schoolId,
    );

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: createdStudent,
    });
  } catch (error) {
    console.error("Create student error:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating student",
    });
  }
};

// @desc    Update student by ID
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Get schoolId from middleware
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const studentId = req.params.id;
    const updatedStudent = await StudentService.updateStudent(
      studentId,
      req.body,
      schoolId,
    );

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update student error:", error);
    if (error.message === "Student not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating student",
    });
  }
};

// @desc    Delete student by ID
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
  try {
    // Get schoolId from middleware
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const studentId = req.params.id;
    await StudentService.deleteStudent(studentId, schoolId);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    if (error.message === "Student not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting student",
    });
  }
};

// @desc    Search students by name or ID
// @route   GET /api/students/search
// @access  Private (Admin, Teacher)
const searchStudents = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 3 characters",
      });
    }

    const students = await StudentService.searchStudents(q, schoolId);

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching students",
    });
  }
};

// @desc    Get student status options
// @route   GET /api/students/get-status-options
// @access  Private
const getStudentStatusOptions = async (req, res) => {
  try {
    const statuses = getStudentStatusValues();

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Get student status options error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student status options",
    });
  }
};

export {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentStatusOptions,
};
