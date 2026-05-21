import fs from "fs";
import StudentExportService from "../services/StudentExportService.js";

const sanitizeJob = (job) => {
  if (!job) return null;
  // Don't leak server-side filesystem paths.
  const { filePath, ...safe } = job;
  return safe;
};

export const startStudentExport = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const { scope = "all", classId, classLabel } = req.body || {};

    if (scope === "class" && !classId) {
      return res.status(400).json({
        success: false,
        message: "classId is required when scope is 'class'",
      });
    }

    const jobId = StudentExportService.startExport({
      schoolId,
      classId: scope === "class" ? classId : null,
      classLabel: scope === "class" ? classLabel : null,
    });

    return res.status(202).json({
      success: true,
      message: "Export started",
      data: sanitizeJob(StudentExportService.getJob(jobId)),
    });
  } catch (error) {
    console.error("Start student export error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while starting export",
    });
  }
};

export const getStudentExportStatus = async (req, res) => {
  try {
    const job = StudentExportService.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Export job not found",
      });
    }

    if (job.schoolId && req.schoolId && job.schoolId !== req.schoolId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeJob(job),
    });
  } catch (error) {
    console.error("Get export status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching export status",
    });
  }
};

export const downloadStudentExport = async (req, res) => {
  try {
    const job = StudentExportService.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Export job not found",
      });
    }

    if (job.schoolId && req.schoolId && job.schoolId !== req.schoolId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (job.status !== "ready" || !job.filePath) {
      return res.status(409).json({
        success: false,
        message: `Export is not ready (status: ${job.status})`,
      });
    }

    if (!fs.existsSync(job.filePath)) {
      return res.status(410).json({
        success: false,
        message: "Export file is no longer available",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${job.filename}"`,
    );
    return res.sendFile(job.filePath);
  } catch (error) {
    console.error("Download export error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while downloading export",
    });
  }
};
