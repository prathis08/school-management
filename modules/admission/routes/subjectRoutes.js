import express from "express";
const router = express.Router();
import subjectController from "../controllers/subjectController.js";
import { validateSubjectCreation } from "@school-management/backend-core/middleware/validation.js";
import auth from "@school-management/backend-core/middleware/auth.js";
import populateUserHeaders from "@school-management/backend-core/middleware/populateUserHeaders.js";
import authorize from "@school-management/backend-core/middleware/authorize.js";
import { ROLES } from "@school-management/backend-core/constants/roles.js";

const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacherToSubject,
} = subjectController;

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get("/get-all-subjects", auth, populateUserHeaders, getAllSubjects);

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get("/get-subject-by-id/:id", auth, populateUserHeaders, getSubjectById);

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin)
router.post(
  "/create-subject",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  validateSubjectCreation,
  createSubject
);

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin)
router.put(
  "/update-subject-by-id/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  updateSubject
);

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (Admin)
router.delete(
  "/delete-subject-by-id/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  deleteSubject
);

// @route   POST /api/subjects/:id/teachers
// @desc    Assign teacher to subject
// @access  Private (Admin)
router.post(
  "/assign-teacher-to-subject/:id",
  auth,
  populateUserHeaders,
  authorize(ROLES.ADMIN),
  assignTeacherToSubject
);

export default router;
