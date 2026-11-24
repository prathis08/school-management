import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

// Import from modules
import {
  connectDB,
  errorHandler,
  notFound,
  TokenCleanupService,
  authRoutes,
  featureRoutes,
  dashboardRoutes,
  userDataRoutes,
  settingsRoutes,
} from "../modules/backend-core/index.js";

import {
  studentRoutes,
  teacherRoutes,
  classRoutes,
  subjectRoutes,
} from "../modules/admission/index.js";

import { feeRoutes } from "../modules/fee/index.js";
import { taskRoutes } from "../modules/task-management/index.js";
import { examRoutes } from "../modules/examination/index.js";
import { attendanceRoutes } from "../modules/attendance/index.js";
import { academicRoutes } from "../modules/academic/index.js";
import {
  apiLimiter,
  authLimiter,
} from "../modules/backend-core/middleware/rateLimiter.js";

// Initialize models and associations
import "../modules/backend-core/models/index.js";

const app = express();

// Connect to PostgreSQL
connectDB();

// Initialize token cleanup service
TokenCleanupService.start();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// CORS: only known frontend origins may call the API from a browser.
// Set CORS_ORIGINS to a comma-separated list in production.
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) send no Origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (auth endpoints are stricter).
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Routes - Core Module
app.use("/api/auth", authRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", userDataRoutes);
app.use("/api/settings", settingsRoutes);

// Routes - Admission Module
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);

// Routes - Fee Module
app.use("/api/fees", feeRoutes);

// Routes - Task Management Module
app.use("/api/tasks", taskRoutes);

// Routes - Examination Module
app.use("/api/exams", examRoutes);

// Routes - Attendance Module
app.use("/api/attendance", attendanceRoutes);

// Routes - Academic Module (enrollment history + promotion)
app.use("/api/academic", academicRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "School Management API is running (Modular Architecture)",
    timestamp: new Date().toISOString(),
    modules: {
      "backend-core": "Active",
      admission: "Active",
      fee: "Active",
      "task-management": "Active",
      examination: "Active",
      attendance: "Active",
      academic: "Active",
      transportation: "Planned",
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 50501;

app.listen(PORT, () => {
  console.log(`
🚀 School Management API (Modular) is running on port ${PORT}
📚 Modules:
   ✅ Backend Core (Auth, Middleware, Utils)
   ✅ Admission (Students, Teachers, Classes, Subjects)
   ✅ Fee Management (Fee Structures, Payments)
   ✅ Task Management (Tasks, Comments, Attachments, History)
   ✅ Examination (Exams, ExamSubjects, Results, Report Cards)
   ✅ Attendance (Student Attendance, Roster, Reports)
   ✅ Academic (Enrollment History, Promotion)
   🔧 Transportation (Buses, Routes, Stops) - Ready for development
  `);
});

export default app;
