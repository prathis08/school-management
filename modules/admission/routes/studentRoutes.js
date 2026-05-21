import express from "express";
const router = express.Router();
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentStatusOptions,
} from "../controllers/studentController.js";
import { validateStudentCreation } from "@school-management/backend-core/middleware/validation.js";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";
import studentExportRoutes from "./studentExportRoutes.js";

// Mount export sub-routes (POST /export, GET /export/status/:jobId, GET /export/download/:jobId)
router.use("/", studentExportRoutes);

// @route   GET /api/students/search
// @desc    Search students by name or ID
// @access  Private (Admin, Teacher)
router.get(
  "/search",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  searchStudents,
);

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get(
  "/get-all-students",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  getAllStudents,
);

// @route   GET /api/students/get-student-by-id/:id
// @desc    Get student by ID
// @access  Private
router.get("/get-student-by-id/:id", auth, populateUserHeaders, getStudentById);

// @route   GET /api/students/get-status-options
// @desc    Get student status options
// @access  Private
router.get(
  "/get-status-options",
  auth,
  populateUserHeaders,
  getStudentStatusOptions,
);

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin)
router.post(
  "/create-student",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  validateStudentCreation,
  createStudent,
);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put(
  "/update-student-by-id/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  updateStudent,
);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete(
  "/delete-student-by-id/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteStudent,
);

export default router;
