import express from "express";
import { body } from "express-validator";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getUserById,
  updateUserById,
  getAllUsers,
} from "../controllers/userDataController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

// Routes accessible to all authenticated users
router.get("/", auth, getMyProfile);
router.put("/", auth, updateProfileValidation, updateMyProfile);
router.put("/password", auth, changePasswordValidation, changePassword);

// Admin routes (these could have role-based middleware added)
router.get("/users/all", auth, getAllUsers);
router.get("/:userId", auth, getUserById);
router.put("/:userId", auth, updateProfileValidation, updateUserById);

export default router;
