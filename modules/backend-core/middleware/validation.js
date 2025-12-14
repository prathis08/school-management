import { body } from "express-validator";
import { ROLES } from "../constants/roles.js";

// User registration validation
const validateUserRegistration = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  // body("password")
  //   .isLength({ min: 6 })
  //   .withMessage("Password must be at least 6 characters long")
  //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  //   .withMessage(
  //     "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  //   ),

  body("role")
    .isIn([
      ROLES.TEACHER,
      ROLES.STUDENT,
      ROLES.COORDINATOR,
      ROLES.ACCOUNTANT,
      ROLES.ADMIN,
    ])
    .withMessage("Role must be teacher or student"),

  body("schoolId")
    .trim()
    .notEmpty()
    .withMessage("School ID is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("School ID must contain only alphanumeric characters"),
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

const validateStudentCreation = [
  ...validateUserRegistration,

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),

  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
];

// Teacher creation validation
const validateTeacherCreation = [
  ...validateUserRegistration,

  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Employee ID must be between 3 and 20 characters"),

  body("department").trim().notEmpty().withMessage("Department is required"),

  // body("qualification")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Qualification is required"),

  // body("experience")
  //   .isInt({ min: 0 })
  //   .withMessage("Experience must be a non-negative number"),

  body("dateOfJoining")
    .isISO8601()
    .withMessage("Please provide a valid date of joining"),

  // body("salary")
  //   .isFloat({ min: 0 })
  //   .withMessage("Salary must be a positive number"),
];

// Class creation validation
const validateClassCreation = [
  body("className")
    .trim()
    .notEmpty()
    .withMessage("Class name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Class name must be between 2 and 50 characters"),

  body("schoolId")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("School ID must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("School ID must contain only alphanumeric characters"),

  body("grade").trim().notEmpty().withMessage("Grade is required"),

  body("section").trim().notEmpty().withMessage("Section is required"),

  body("maxStudents")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Max students must be between 1 and 100"),
];

// Subject creation validation
const validateSubjectCreation = [
  body("subjectName")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Subject name must be between 2 and 100 characters"),

  body("subjectCode")
    .trim()
    .notEmpty()
    .withMessage("Subject code is required")
    .isLength({ min: 2, max: 10 })
    .withMessage("Subject code must be between 2 and 10 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage(
      "Subject code must contain only uppercase letters and numbers"
    ),

  body("schoolId")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("School ID must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("School ID must contain only alphanumeric characters"),

  body("credits")
    .isInt({ min: 1, max: 10 })
    .withMessage("Credits must be between 1 and 10"),

  body("department").trim().notEmpty().withMessage("Department is required"),
];

export {
  validateUserRegistration,
  validateUserLogin,
  validateStudentCreation,
  validateTeacherCreation,
  validateClassCreation,
  validateSubjectCreation,
};
