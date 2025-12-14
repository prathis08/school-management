// Modular Model Index - Import models from different modules and define cross-module associations

// Backend Core Models
import User from "./User.js";
import Token from "./Token.js";
import School from "./School.js";

// Admission Module Models
import Student from "../../admission/models/Student.js";
import Teacher from "../../admission/models/Teacher.js";
import Class from "../../admission/models/Class.js";
import Subject from "../../admission/models/Subject.js";

// Fee Module Models
import FeeStructure from "../../fee/models/FeeStructure.js";
import Payment from "../../fee/models/Payment.js";

// Transportation Module Models
import Bus from "../../transportation/models/Bus.js";
import Route from "../../transportation/models/Route.js";
import Stop from "../../transportation/models/Stop.js";

// Examination Module Models
import Exam from "../../examination/models/Exam.js";
import Result from "../../examination/models/Result.js";

// Task Management Module Models
import Task from "../../task-management/models/Task.js";
import TaskComment from "../../task-management/models/TaskComment.js";
import TaskAttachment from "../../task-management/models/TaskAttachment.js";
import TaskHistory from "../../task-management/models/TaskHistory.js";

// Define cross-module associations

// User associations (Backend Core ↔ Admission)
User.hasOne(Student, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "studentProfile",
});
User.hasOne(Teacher, {
  foreignKey: "userId",
  sourceKey: "userId",
  as: "teacherProfile",
});
User.hasMany(Token, { foreignKey: "userId", sourceKey: "id", as: "tokens" });

Student.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  as: "user",
});
Teacher.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "userId",
  as: "user",
});
Token.belongsTo(User, { foreignKey: "userId", targetKey: "id", as: "user" });

// Student-Class associations (Admission Module) - using custom IDs
Class.hasMany(Student, {
  foreignKey: "classId",
  sourceKey: "classId",
  as: "students",
});
Student.belongsTo(Class, {
  foreignKey: "classId",
  targetKey: "classId",
  as: "class",
});

// Teacher-Class associations (Class Teacher) - using custom IDs
Class.belongsTo(Teacher, {
  foreignKey: "classTeacherId",
  targetKey: "teacherId",
  as: "classTeacher",
});
Teacher.hasMany(Class, {
  foreignKey: "classTeacherId",
  sourceKey: "teacherId",
  as: "managedClasses",
});

// Many-to-Many: Teacher-Subject associations
Teacher.belongsToMany(Subject, {
  through: "teacher_subject",
  foreignKey: "teacherId",
  sourceKey: "teacherId",
  otherKey: "subjectId",
  targetKey: "subjectId",
  as: "subjects",
});

Subject.belongsToMany(Teacher, {
  through: "teacher_subject",
  foreignKey: "subjectId",
  sourceKey: "subjectId",
  otherKey: "teacherId",
  targetKey: "teacherId",
  as: "teachers",
});

// Note: Class-Subject associations commented out as class_subject table doesn't exist
// If needed, create the junction table first or use a different relationship pattern

// Fee Module associations - using custom IDs
FeeStructure.hasMany(Payment, {
  foreignKey: "feeStructureId",
  sourceKey: "feeStructureId",
  as: "payments",
});
Payment.belongsTo(FeeStructure, {
  foreignKey: "feeStructureId",
  targetKey: "feeStructureId",
  as: "feeStructure",
});

Student.hasMany(Payment, {
  foreignKey: "studentId",
  sourceKey: "studentId",
  as: "payments",
});
Payment.belongsTo(Student, {
  foreignKey: "studentId",
  targetKey: "studentId",
  as: "student",
});

// Transportation Module associations - using custom IDs
// TEMPORARILY COMMENTED OUT - TO BE UPDATED
/*
Bus.hasMany(Route, {
  foreignKey: "busId",
  sourceKey: "busId",
  as: "routes",
});
Route.belongsTo(Bus, {
  foreignKey: "busId",
  targetKey: "busId",
  as: "bus",
});

Route.hasMany(Stop, {
  foreignKey: "routeId",
  sourceKey: "routeId",
  as: "stops",
});
Stop.belongsTo(Route, {
  foreignKey: "routeId",
  targetKey: "routeId",
  as: "route",
});
*/

// Task Management Module associations
User.hasMany(Task, {
  foreignKey: "createdByUserId",
  sourceKey: "userId",
  as: "createdTasks",
});
Task.belongsTo(User, {
  foreignKey: "createdByUserId",
  targetKey: "userId",
  as: "createdByUser",
});

User.hasMany(Task, {
  foreignKey: "assignedToUserId",
  sourceKey: "userId",
  as: "assignedTasks",
});
Task.belongsTo(User, {
  foreignKey: "assignedToUserId",
  targetKey: "userId",
  as: "assignedUser",
});

User.hasMany(Task, {
  foreignKey: "completedByUserId",
  sourceKey: "userId",
  as: "completedTasks",
});
Task.belongsTo(User, {
  foreignKey: "completedByUserId",
  targetKey: "userId",
  as: "completedByUser",
});

// Task Comments associations
Task.hasMany(TaskComment, {
  foreignKey: "taskId",
  sourceKey: "id",
  as: "comments",
});
TaskComment.belongsTo(Task, {
  foreignKey: "taskId",
  targetKey: "id",
  as: "task",
});

User.hasMany(TaskComment, {
  foreignKey: "createdByUserId",
  sourceKey: "userId",
  as: "taskComments",
});
TaskComment.belongsTo(User, {
  foreignKey: "createdByUserId",
  targetKey: "userId",
  as: "createdByUser",
});

// Task Attachments associations
Task.hasMany(TaskAttachment, {
  foreignKey: "taskId",
  sourceKey: "id",
  as: "attachments",
});
TaskAttachment.belongsTo(Task, {
  foreignKey: "taskId",
  targetKey: "id",
  as: "task",
});

User.hasMany(TaskAttachment, {
  foreignKey: "uploadedByUserId",
  sourceKey: "userId",
  as: "uploadedAttachments",
});
TaskAttachment.belongsTo(User, {
  foreignKey: "uploadedByUserId",
  targetKey: "userId",
  as: "uploadedByUser",
});

// Task History associations
Task.hasMany(TaskHistory, {
  foreignKey: "taskId",
  sourceKey: "id",
  as: "history",
});
TaskHistory.belongsTo(Task, {
  foreignKey: "taskId",
  targetKey: "id",
  as: "task",
});

User.hasMany(TaskHistory, {
  foreignKey: "createdByUserId",
  sourceKey: "userId",
  as: "taskHistoryEntries",
});
TaskHistory.belongsTo(User, {
  foreignKey: "createdByUserId",
  targetKey: "userId",
  as: "createdByUser",
});

// Note: Student-Transportation associations commented out as student_stop table doesn't exist
// If needed, create the junction table first or use a different relationship pattern

// Examination Module associations - using custom IDs
// TEMPORARILY COMMENTED OUT - TO BE UPDATED
/*
Subject.hasMany(Exam, {
  foreignKey: "subjectId",
  sourceKey: "subjectId",
  as: "exams",
});
Exam.belongsTo(Subject, {
  foreignKey: "subjectId",
  targetKey: "subjectId",
  as: "subject",
});

Exam.hasMany(Result, {
  foreignKey: "examId",
  sourceKey: "examId",
  as: "results",
});
Result.belongsTo(Exam, {
  foreignKey: "examId",
  targetKey: "examId",
  as: "exam",
});

Student.hasMany(Result, {
  foreignKey: "studentId",
  sourceKey: "studentId",
  as: "results",
});
Result.belongsTo(Student, {
  foreignKey: "studentId",
  targetKey: "studentId",
  as: "student",
});
*/

// Export all models for use across the application
export {
  // Backend Core
  User,
  Token,
  School,

  // Admission Module
  Student,
  Teacher,
  Class,
  Subject,

  // Fee Module
  FeeStructure,
  Payment,

  // Transportation Module
  Bus,
  Route,
  Stop,

  // Examination Module
  Exam,
  Result,

  // Task Management Module
  Task,
  TaskComment,
  TaskAttachment,
  TaskHistory,
};
