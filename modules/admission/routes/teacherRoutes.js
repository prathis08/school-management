import express from "express";
const router = express.Router();
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherNames,
} from "../controllers/teacherController.js";
import { validateTeacherCreation } from "@school-management/backend-core/middleware/validation.js";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get(
  "/get-all-teachers",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  getAllTeachers
);

// @route   GET /api/teachers/names
// @desc    Get teacher names only
// @access  Private (Admin)
router.get(
  "/get-teacher-names",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACCOUNTANT),
  getTeacherNames
);

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private
router.get("/get-teacher-by-id/:id", auth, populateUserHeaders, getTeacherById);

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin)
router.post(
  "/create-teacher",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  validateTeacherCreation,
  createTeacher
);

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin)
router.put(
  "/update-teacher-by-id/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  updateTeacher
);

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin)
router.delete(
  "/delete-teacher-by-id/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteTeacher
);

export default router;
