import express from "express";
const router = express.Router();
import classController from "../controllers/classController.js";
import { validateClassCreation } from "@school-management/backend-core/middleware/validation.js";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";

const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  getGradesAndClasses,
  getGradesOptions,
} = classController;

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get("/get-all-classes", auth, populateUserHeaders, getAllClasses);

// @route   GET /api/classes/grades-and-classes
// @desc    Get grades and class list
// @access  Private
router.get(
  "/grades-and-classes",
  auth,
  populateUserHeaders,
  getGradesAndClasses
);

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get("/get-class-by-id/:id", auth, populateUserHeaders, getClassById);

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin)
router.post(
  "/create-new-class",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  validateClassCreation,
  createClass
);

router.get("/get-grades-options", auth, populateUserHeaders, getGradesOptions);

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin)
router.put(
  "/update-class/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  updateClass
);

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin)
router.delete(
  "/delete-class/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteClass
);

// @route   POST /api/classes/:id/students
// @desc    Add student to class
// @access  Private (Admin)
router.post(
  "/add-student-to-class/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  addStudentToClass
);

export default router;
