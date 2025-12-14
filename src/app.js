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
} from "../modules/backend-core/index.js";

import {
  studentRoutes,
  teacherRoutes,
  classRoutes,
  subjectRoutes,
} from "../modules/admission/index.js";

import { feeRoutes } from "../modules/fee/index.js";
import { taskRoutes } from "../modules/task-management/index.js";

// Initialize models and associations
import "../modules/backend-core/models/index.js";

const app = express();

// Connect to PostgreSQL
connectDB();

// Initialize token cleanup service
TokenCleanupService.start();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes - Core Module
app.use("/api/auth", authRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Routes - Admission Module
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);

// Routes - Fee Module
app.use("/api/fees", feeRoutes);

// Routes - Task Management Module
app.use("/api/tasks", taskRoutes);

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
      transportation: "Planned",
      examination: "Planned",
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
   🔧 Transportation (Buses, Routes, Stops) - Ready for development
   🔧 Examination (Exams, Results) - Ready for development
  `);
});

export default app;
