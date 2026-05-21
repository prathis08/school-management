import express from "express";
import { body } from "express-validator";
import {
  getSchool,
  updateSchool,
  getPreferences,
  updatePreferences,
} from "../controllers/settingsController.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

const updateSchoolValidation = [
  body("schoolName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("School name must be between 2 and 255 characters"),
  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),
  body("website")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Invalid website URL"),
  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone must be between 10 and 20 characters"),
];

const updatePreferencesValidation = [
  body("theme")
    .optional()
    .isIn(["light", "dark", "auto"])
    .withMessage("Theme must be light, dark, or auto"),
  body("sidebarStyle")
    .optional()
    .isIn(["expanded", "collapsed", "mini"])
    .withMessage("Sidebar style must be expanded, collapsed, or mini"),
  body("primaryColor")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Primary color must be a valid color string"),
  body("language")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("Language code must be between 2 and 10 characters"),
];

// School info — read by any authenticated user, write by admin only
router.get("/school", auth, getSchool);
router.put(
  "/school",
  auth,
  authorize(ROLES.ADMIN),
  updateSchoolValidation,
  updateSchool,
);

// Per-user appearance preferences
router.get("/preferences", auth, getPreferences);
router.put(
  "/preferences",
  auth,
  updatePreferencesValidation,
  updatePreferences,
);

export default router;
