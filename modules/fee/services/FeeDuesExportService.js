import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import ExcelJS from "exceljs";
import { Class } from "@school-management/admission";
import FeeService from "./FeeService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local stand-in for blob storage during local development.
const EXPORTS_DIR = path.resolve(__dirname, "../../../exports");

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

const jobs = new Map();

const setJob = (jobId, patch) => {
  const existing = jobs.get(jobId) || {};
  jobs.set(jobId, { ...existing, ...patch, updatedAt: new Date() });
};

const getJob = (jobId) => jobs.get(jobId) || null;

const formatDate = (value) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const DUE_COLUMNS = [
  { header: "Student ID", key: "studentId", width: 18 },
  { header: "Roll Number", key: "rollNumber", width: 14 },
  { header: "Student Name", key: "studentName", width: 26 },
  { header: "Class", key: "className", width: 14 },
  { header: "Section", key: "section", width: 10 },
  { header: "Installment", key: "installmentName", width: 22 },
  { header: "Due Date", key: "dueDate", width: 14 },
  { header: "Days Overdue", key: "daysOverdue", width: 14 },
  { header: "Due Amount", key: "dueAmount", width: 14 },
  { header: "Paid Amount", key: "paidAmount", width: 14 },
  { header: "Balance", key: "balanceAmount", width: 14 },
  { header: "Status", key: "status", width: 12 },
  { header: "Assignment", key: "assignmentState", width: 14 },
];

const sanitizeSheetName = (name) =>
  ((name || "Sheet").replace(/[\\/:*?[\]]/g, " ").trim().slice(0, 31) ||
    "Sheet");

const styleHeader = (worksheet) => {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFDC2626" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 20;
};

const isOpenInstallment = (status) =>
  status !== "PAID" && status !== "CANCELLED";

/**
 * Pivot the dashboard's per-student fee summary into one row per outstanding
 * installment. Falls back through grade-level schedules just like the dashboard,
 * so students who haven't been formally assigned a fee schedule still show up
 * if their grade/class has fees configured.
 */
const buildRows = async ({ schoolId, classId }) => {
  const studentsWithFees = await FeeService.getStudentsWithFees({
    schoolId,
    classId: classId || undefined,
  });

  // Bulk-fetch class info so we can label rows with className / section.
  const classes = await Class.findAll({
    where: { schoolId },
    attributes: ["classId", "className", "section"],
  });
  const classMap = new Map(
    classes.map((c) => [c.classId, { className: c.className, section: c.section }]),
  );

  const rows = [];
  for (const student of studentsWithFees) {
    const studentName =
      student.name ||
      `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const classInfo = classMap.get(student.classId) || {};

    const installments = student.feeInfo?.installments || [];
    for (const inst of installments) {
      const balance = toNumber(inst.balanceAmount);
      if (balance <= 0) continue;
      if (!isOpenInstallment(inst.status)) continue;

      rows.push({
        studentId: student.studentId,
        rollNumber: student.rollNumber || "",
        studentName,
        className: classInfo.className || "Unassigned",
        section: classInfo.section || "",
        installmentName: inst.name || `Installment ${inst.installmentNumber || ""}`,
        dueDate: formatDate(inst.dueDate),
        daysOverdue: toNumber(inst.daysOverdue),
        dueAmount: toNumber(inst.dueAmount),
        paidAmount: toNumber(inst.paidAmount),
        balanceAmount: balance,
        status: inst.status || "PENDING",
        assignmentState: student.feeInfo?.hasAssignment
          ? "Assigned"
          : "Unassigned",
      });
    }

    // Pending individual fees — they don't live in the installment list.
    const individualFees = student.feeInfo?.individualFees || [];
    for (const fee of individualFees) {
      if (fee.status !== "PENDING") continue;
      const amount = toNumber(fee.amount);
      if (amount <= 0) continue;

      rows.push({
        studentId: student.studentId,
        rollNumber: student.rollNumber || "",
        studentName,
        className: classInfo.className || "Unassigned",
        section: classInfo.section || "",
        installmentName: fee.feeTypeName || fee.title || "Individual Fee",
        dueDate: formatDate(fee.dueDate),
        daysOverdue: 0,
        dueAmount: amount,
        paidAmount: 0,
        balanceAmount: amount,
        status: "PENDING",
        assignmentState: "Individual",
      });
    }
  }

  // Stable order: class → student → due date.
  rows.sort((a, b) => {
    if (a.className !== b.className) return a.className.localeCompare(b.className);
    if (a.studentName !== b.studentName)
      return a.studentName.localeCompare(b.studentName);
    return (a.dueDate || "").localeCompare(b.dueDate || "");
  });

  return rows;
};

const addTotalsRow = (sheet, rows) => {
  if (rows.length === 0) return;
  const totals = rows.reduce(
    (acc, r) => {
      acc.dueAmount += r.dueAmount;
      acc.paidAmount += r.paidAmount;
      acc.balanceAmount += r.balanceAmount;
      return acc;
    },
    { dueAmount: 0, paidAmount: 0, balanceAmount: 0 },
  );
  const totalRow = sheet.addRow({
    studentName: `Totals (${rows.length} record${rows.length === 1 ? "" : "s"})`,
    dueAmount: totals.dueAmount,
    paidAmount: totals.paidAmount,
    balanceAmount: totals.balanceAmount,
  });
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFEE2E2" },
  };
};

const buildWorkbook = async ({ schoolId, classId, classLabel }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School Management";
  workbook.created = new Date();

  const rows = await buildRows({ schoolId, classId });

  if (classId) {
    const sheet = workbook.addWorksheet(
      sanitizeSheetName(classLabel || "Dues"),
    );
    sheet.columns = DUE_COLUMNS;
    rows.forEach((row) => sheet.addRow(row));
    styleHeader(sheet);
    addTotalsRow(sheet, rows);
  } else {
    const allSheet = workbook.addWorksheet("All Dues");
    allSheet.columns = DUE_COLUMNS;
    rows.forEach((row) => allSheet.addRow(row));
    styleHeader(allSheet);
    addTotalsRow(allSheet, rows);

    const grouped = new Map();
    for (const row of rows) {
      const key = row.className || "Unassigned";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    }

    const used = new Set(["All Dues"]);
    for (const [className, group] of grouped.entries()) {
      let name = sanitizeSheetName(className);
      let suffix = 1;
      while (used.has(name)) {
        name = sanitizeSheetName(`${className} (${++suffix})`);
      }
      used.add(name);
      const sheet = workbook.addWorksheet(name);
      sheet.columns = DUE_COLUMNS;
      group.forEach((row) => sheet.addRow(row));
      styleHeader(sheet);
      addTotalsRow(sheet, group);
    }
  }

  return { workbook, count: rows.length };
};

const buildFilename = (scope, classLabel) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (scope === "class") {
    const safe = (classLabel || "class").replace(/[^a-zA-Z0-9_-]+/g, "_");
    return `dues_${safe}_${stamp}.xlsx`;
  }
  return `dues_school_${stamp}.xlsx`;
};

class FeeDuesExportService {
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
      message: "Preparing dues export...",
      filename: null,
      filePath: null,
      downloadUrl: null,
      recordCount: null,
      error: null,
      createdAt: new Date(),
    });

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
        message: "Fetching dues data...",
      });

      const { workbook, count } = await buildWorkbook({
        schoolId: job.schoolId,
        classId: job.classId,
        classLabel: job.classLabel,
      });

      setJob(jobId, {
        progress: 65,
        message: `Building Excel sheet for ${count} dues record${count === 1 ? "" : "s"}...`,
      });

      const filename = buildFilename(job.scope, job.classLabel);
      const filePath = path.join(EXPORTS_DIR, `${jobId}__${filename}`);

      await workbook.xlsx.writeFile(filePath);

      setJob(jobId, {
        status: "ready",
        progress: 100,
        message: `Dues export ready (${count} record${count === 1 ? "" : "s"}).`,
        filename,
        filePath,
        downloadUrl: `/api/fees/export/dues/download/${jobId}`,
        recordCount: count,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Fee dues export job failed:", error);
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

export default new FeeDuesExportService();
