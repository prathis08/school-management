import { validationResult } from "express-validator";
import SubjectService from "../services/SubjectService.js";
// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getAllSubjects = async (req, res) => {
  try {
    // Get schoolId from authenticated user
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const subjects = await SubjectService.getAllSubjects(schoolId);

    res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error("Get all subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subjects",
    });
  }
};

// @desc    Get subject by ID or schoolId
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const subject = await SubjectService.getSubjectById(
      req.params.id,
      schoolId
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Get subject by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subject",
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
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

    const createdSubject = await SubjectService.createSubject(
      req.body,
      schoolId
    );

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: createdSubject,
    });
  } catch (error) {
    console.error("Create subject error:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating subject",
    });
  }
};

// @desc    Update subject by ID or schoolId
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
const updateSubject = async (req, res) => {
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

    const updatedSubject = await SubjectService.updateSubject(
      req.params.id,
      req.body,
      schoolId
    );

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    if (error.message === "Subject not found") {
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
      message: "Server error while updating subject",
    });
  }
};

// @desc    Delete subject by ID or schoolId
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    await SubjectService.deleteSubject(req.params.id, schoolId);

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject error:", error);
    if (
      error.message === "Subject not found" ||
      error.message.includes("already deleted")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("Cannot delete subject")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting subject",
    });
  }
};

// @desc    Assign teacher to subject
// @route   POST /api/subjects/:id/teachers
// @access  Private (Admin)
const assignTeacherToSubject = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    await SubjectService.assignTeacherToSubject(
      req.params.id,
      teacherId,
      schoolId
    );

    res.status(200).json({
      success: true,
      message: "Teacher assigned to subject successfully",
    });
  } catch (error) {
    console.error("Assign teacher to subject error:", error);
    if (
      error.message === "Subject not found" ||
      error.message === "Teacher not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error.message.includes("does not belong") ||
      error.message.includes("already assigned")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while assigning teacher to subject",
    });
  }
};

export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacherToSubject,
};
