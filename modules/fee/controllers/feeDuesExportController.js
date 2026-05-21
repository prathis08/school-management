import fs from "fs";
import FeeDuesExportService from "../services/FeeDuesExportService.js";

const sanitizeJob = (job) => {
  if (!job) return null;
  const { filePath, ...safe } = job;
  return safe;
};

export const startDuesExport = async (req, res) => {
  try {
    const schoolId = req.schoolId || req.user?.schoolId;
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

    const jobId = FeeDuesExportService.startExport({
      schoolId,
      classId: scope === "class" ? classId : null,
      classLabel: scope === "class" ? classLabel : null,
    });

    return res.status(202).json({
      success: true,
      message: "Dues export started",
      data: sanitizeJob(FeeDuesExportService.getJob(jobId)),
    });
  } catch (error) {
    console.error("Start dues export error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while starting export",
    });
  }
};

export const getDuesExportStatus = async (req, res) => {
  try {
    const job = FeeDuesExportService.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Export job not found",
      });
    }

    const reqSchoolId = req.schoolId || req.user?.schoolId;
    if (job.schoolId && reqSchoolId && job.schoolId !== reqSchoolId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeJob(job),
    });
  } catch (error) {
    console.error("Get dues export status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching export status",
    });
  }
};

export const downloadDuesExport = async (req, res) => {
  try {
    const job = FeeDuesExportService.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Export job not found",
      });
    }

    const reqSchoolId = req.schoolId || req.user?.schoolId;
    if (job.schoolId && reqSchoolId && job.schoolId !== reqSchoolId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
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
    console.error("Download dues export error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while downloading export",
    });
  }
};
