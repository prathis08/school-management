import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import ExcelJS from "exceljs";
import { Op } from "sequelize";
import {
  Student,
  Class,
  User,
} from "@school-management/backend-core/models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local directory used as a stand-in for blob storage during local development.
// In production this whole flow would upload to a blob and persist a URL.
const EXPORTS_DIR = path.resolve(__dirname, "../../../exports");

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// In-memory job tracker. Sufficient for local dev / single-process backend.
const jobs = new Map();

const setJob = (jobId, patch) => {
  const existing = jobs.get(jobId) || {};
  jobs.set(jobId, { ...existing, ...patch, updatedAt: new Date() });
};

export const getJob = (jobId) => jobs.get(jobId) || null;

const formatDate = (value) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const STUDENT_COLUMNS = [
  { header: "Student ID", key: "studentId", width: 18 },
  { header: "Roll Number", key: "rollNumber", width: 14 },
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phone", width: 16 },
  { header: "Gender", key: "gender", width: 10 },
  { header: "Date of Birth", key: "dateOfBirth", width: 14 },
  { header: "Class", key: "className", width: 14 },
  { header: "Grade", key: "grade", width: 12 },
  { header: "Section", key: "section", width: 10 },
  { header: "Status", key: "status", width: 12 },
  { header: "Admission Date", key: "admissionDate", width: 14 },
  { header: "Father's Name", key: "fatherName", width: 22 },
  { header: "Father's Phone", key: "fatherPhone", width: 16 },
  { header: "Mother's Name", key: "motherName", width: 22 },
  { header: "Mother's Phone", key: "motherPhone", width: 16 },
];

const toRow = (student) => {
  const json = typeof student.toJSON === "function" ? student.toJSON() : student;
  return {
    studentId: json.studentId,
    rollNumber: json.rollNumber || "",
    name: json.name || `${json.firstName || ""} ${json.lastName || ""}`.trim(),
    email: json.email || json.user?.email || "",
    phone: json.phone || "",
    gender: json.gender || "",
    dateOfBirth: formatDate(json.dateOfBirth),
    className: json.class?.className || "",
    grade: json.class?.grade || json.grade || "",
    section: json.class?.section || "",
    status: json.status || "",
    admissionDate: formatDate(json.admissionDate),
    fatherName: json.parentDetails?.father?.name || json.fatherName || "",
    fatherPhone: json.parentDetails?.father?.phone || "",
    motherName: json.parentDetails?.mother?.name || "",
    motherPhone: json.parentDetails?.mother?.phone || "",
  };
};

const sanitizeSheetName = (name) => {
  // Excel sheet names: <= 31 chars, no : \ / ? * [ ]
  return (name || "Sheet")
    .replace(/[\\/:*?[\]]/g, " ")
    .trim()
    .slice(0, 31) || "Sheet";
};

const styleHeader = (worksheet) => {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 20;
};

const fetchStudents = async (schoolId, classId) => {
  const where = { schoolId, isActive: true };
  if (classId) where.classId = classId;

  return Student.findAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["classId", "className", "grade", "section"],
      },
    ],
    order: [
      ["classId", "ASC"],
      ["rollNumber", "ASC"],
      ["name", "ASC"],
    ],
  });
};

const buildWorkbook = async ({ schoolId, classId, classLabel }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School Management";
  workbook.created = new Date();

  const students = await fetchStudents(schoolId, classId);

  if (classId) {
    // Single-class export -> one sheet
    const sheetName = sanitizeSheetName(classLabel || "Class");
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = STUDENT_COLUMNS;
    students.map(toRow).forEach((row) => sheet.addRow(row));
    styleHeader(sheet);
  } else {
    // All students -> "All Students" sheet + one sheet per class
    const allSheet = workbook.addWorksheet("All Students");
    allSheet.columns = STUDENT_COLUMNS;
    students.map(toRow).forEach((row) => allSheet.addRow(row));
    styleHeader(allSheet);

    const grouped = new Map();
    for (const student of students) {
      const key = student.class?.className || "Unassigned";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(student);
    }

    const usedNames = new Set(["All Students"]);
    for (const [className, group] of grouped.entries()) {
      let name = sanitizeSheetName(className);
      // Excel disallows duplicate sheet names; suffix if collision.
      let suffix = 1;
      while (usedNames.has(name)) {
        name = sanitizeSheetName(`${className} (${++suffix})`);
      }
      usedNames.add(name);

      const sheet = workbook.addWorksheet(name);
      sheet.columns = STUDENT_COLUMNS;
      group.map(toRow).forEach((row) => sheet.addRow(row));
      styleHeader(sheet);
    }
  }

  return { workbook, count: students.length };
};

const buildFilename = (scope, classLabel) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (scope === "class") {
    const safe = (classLabel || "class").replace(/[^a-zA-Z0-9_-]+/g, "_");
    return `students_${safe}_${stamp}.xlsx`;
  }
  return `students_all_${stamp}.xlsx`;
};

class StudentExportService {
  /**
   * Kick off an export job. Returns the jobId immediately; work runs async.
   */
  startExport({ schoolId, classId, classLabel }) {
    const jobId = randomUUID();
    const scope = classId ? "class" : "all";

    setJob(jobId, {
      jobId,
      status: "pending",
      scope,
      classId: classId || null,
      classLabel: classLabel || null,
      schoolId,
      progress: 0,
      message: "Preparing export...",
      filename: null,
      filePath: null,
      downloadUrl: null,
      error: null,
      createdAt: new Date(),
    });

    // Run in background so the HTTP response can return immediately.
    setImmediate(() => this.#runJob(jobId).catch(() => {}));

    return jobId;
  }

  async #runJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) return;

    try {
      setJob(jobId, {
        status: "processing",
        progress: 15,
        message: "Fetching student data...",
      });

      const { workbook, count } = await buildWorkbook({
        schoolId: job.schoolId,
        classId: job.classId,
        classLabel: job.classLabel,
      });

      setJob(jobId, {
        progress: 65,
        message: `Building Excel sheet for ${count} students...`,
      });

      const filename = buildFilename(job.scope, job.classLabel);
      const filePath = path.join(EXPORTS_DIR, `${jobId}__${filename}`);

      await workbook.xlsx.writeFile(filePath);

      // In production this is where the file would be uploaded to a blob
      // and the returned URL stored on the job. For local dev we expose
      // a download endpoint that streams the file from EXPORTS_DIR.
      setJob(jobId, {
        status: "ready",
        progress: 100,
        message: `Export ready (${count} students).`,
        filename,
        filePath,
        downloadUrl: `/api/students/export/download/${jobId}`,
        recordCount: count,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Student export job failed:", error);
      setJob(jobId, {
        status: "failed",
        message: "Export failed. Please try again.",
        error: error.message,
      });
    }
  }

  getJob(jobId) {
    return getJob(jobId);
  }
}

export default new StudentExportService();
