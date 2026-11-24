import { validationResult } from "express-validator";
import * as examService from "../services/examService.js";

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

// Exams may store a year as "2026", "2026-27" or "2026-2027". Expand a given
// year name into equivalent forms so result lookups match regardless of format.
const expandYearNames = (name) => {
  if (!name) return undefined;
  const match = String(name).match(/(\d{4})/);
  const names = [name];
  if (match) {
    const start = Number(match[1]);
    names.push(
      String(start),
      `${start}-${String((start + 1) % 100).padStart(2, "0")}`,
      `${start}-${start + 1}`,
    );
  }
  return Array.from(new Set(names));
};

/* ---------- Exams ---------- */

export const createExam = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const exam = await examService.createExamWithSubjects(
      req.body,
      schoolId,
      req.user?.id,
    );
    res.status(201).json({
      success: true,
      message: "Exam created",
      data: exam,
    });
  } catch (err) {
    console.error("createExam error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error while creating exam",
    });
  }
};

export const listExams = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const exams = await examService.listExams(schoolId, req.query);
    res.json({ success: true, data: exams, total: exams.length });
  } catch (err) {
    console.error("listExams error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching exams",
    });
  }
};

export const getExam = async (req, res) => {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const exam = await examService.getExam(req.params.examId, schoolId);
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.json({ success: true, data: exam });
  } catch (err) {
    console.error("getExam error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching exam" });
  }
};

export const updateExam = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const exam = await examService.updateExam(
      req.params.examId,
      req.body,
      schoolId,
    );
    res.json({ success: true, message: "Exam updated", data: exam });
  } catch (err) {
    console.error("updateExam error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating exam" });
  }
};

export const deleteExam = async (req, res) => {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    await examService.deleteExam(req.params.examId, schoolId);
    res.json({ success: true, message: "Exam deleted" });
  } catch (err) {
    console.error("deleteExam error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting exam" });
  }
};

/* ---------- Students for an exam ---------- */

export const getStudentsForExam = async (req, res) => {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const result = await examService.getStudentsForExam(
      req.params.examId,
      schoolId,
    );
    if (!result.exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.json({
      success: true,
      data: { exam: result.exam, students: result.students },
    });
  } catch (err) {
    console.error("getStudentsForExam error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching students" });
  }
};

/* ---------- Marks ---------- */

export const submitMarks = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const results = await examService.submitMarks(
      req.params.examId,
      req.params.examSubjectId,
      req.body.entries,
      schoolId,
    );
    res.json({ success: true, message: "Marks saved", data: results });
  } catch (err) {
    console.error("submitMarks error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Server error while saving marks",
    });
  }
};

export const getResults = async (req, res) => {
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const results = await examService.getResultsForExam(
      req.params.examId,
      schoolId,
    );
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("getResults error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching results",
    });
  }
};

/* ---------- Report card ---------- */

export const getReportCard = async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const schoolId = requireSchoolId(req, res);
  if (!schoolId) return;
  try {
    const card = await examService.getStudentReportCard(
      req.params.studentId,
      schoolId,
      {
        academicYear: req.query.academicYear,
        academicYearNames: expandYearNames(req.query.academicYear),
      },
    );
    if (!card) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: card });
  } catch (err) {
    console.error("getReportCard error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while building report card",
    });
  }
};
