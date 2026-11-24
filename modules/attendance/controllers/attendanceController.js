import { validationResult } from "express-validator";
import * as attendanceService from "../services/attendanceService.js";

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

export const getClassRoster = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const roster = await attendanceService.getClassRoster(
      req.params.classId,
      schoolId,
      req.query.date,
      req.query.period,
    );
    if (!roster) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    res.json({ success: true, data: roster });
  } catch (err) {
    console.error("getClassRoster error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance roster",
    });
  }
};

export const markAttendance = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const roster = await attendanceService.markAttendance(
      req.body,
      schoolId,
      req.user?.id,
    );
    res.json({ success: true, message: "Attendance saved", data: roster });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Server error while saving attendance",
    });
  }
};

export const getStudentHistory = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const records = await attendanceService.getStudentHistory(
      req.params.studentId,
      schoolId,
      { from: req.query.from, to: req.query.to },
    );
    res.json({ success: true, data: records });
  } catch (err) {
    console.error("getStudentHistory error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance history",
    });
  }
};

export const getSummary = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const summary = await attendanceService.getSummary(schoolId, {
      classId: req.query.classId,
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance summary",
    });
  }
};
