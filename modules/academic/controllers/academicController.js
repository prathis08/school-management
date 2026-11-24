import { validationResult } from "express-validator";
import * as enrollmentService from "../services/enrollmentService.js";
import * as promotionService from "../services/promotionService.js";

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
    return true;
  }
  return false;
};

const requireSchoolId = (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    res.status(400).json({ success: false, message: "School ID is required" });
    return null;
  }
  return schoolId;
};

/* ---------- Enrollments ---------- */

export const listEnrollments = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const enrollments = await enrollmentService.listEnrollments(schoolId, {
      academicYearId: req.query.academicYearId,
      gradeId: req.query.gradeId,
      classId: req.query.classId,
      studentId: req.query.studentId,
    });
    res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error("listEnrollments error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrollments",
    });
  }
};

export const getStudentEnrollments = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const enrollments = await enrollmentService.listForStudent(
      req.params.studentId,
      schoolId,
    );
    res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error("getStudentEnrollments error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student enrollments",
    });
  }
};

export const createEnrollment = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const enrollment = await enrollmentService.ensureEnrollment(
      req.body.studentId,
      req.body.academicYearId,
      schoolId,
    );
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    console.error("createEnrollment error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Server error while creating enrollment",
    });
  }
};

/* ---------- Promotion rule ---------- */

export const getPromotionRule = async (req, res) => {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const rule = await promotionService.getRule(schoolId);
    res.json({ success: true, data: rule });
  } catch (err) {
    console.error("getPromotionRule error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching promotion rule",
    });
  }
};

export const updatePromotionRule = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const rule = await promotionService.saveRule(schoolId, req.body);
    res.json({ success: true, message: "Settings saved", data: rule });
  } catch (err) {
    console.error("updatePromotionRule error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Server error while saving promotion rule",
    });
  }
};

/* ---------- Promotions ---------- */

export const previewPromotions = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const preview = await promotionService.computePreview(schoolId, {
      academicYearId: req.query.academicYearId,
      gradeId: req.query.gradeId,
      classId: req.query.classId,
    });
    res.json({ success: true, data: preview });
  } catch (err) {
    console.error("previewPromotions error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Server error while building promotion preview",
    });
  }
};

export const runPromotions = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const result = await promotionService.runPromotion(
      schoolId,
      req.body,
      req.user?.id,
    );
    res.json({ success: true, message: "Promotion completed", data: result });
  } catch (err) {
    console.error("runPromotions error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Server error while running promotion",
    });
  }
};
