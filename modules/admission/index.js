export {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./controllers/studentController.js";

export {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "./controllers/teacherController.js";

export { default as classController } from "./controllers/classController.js";
export { default as subjectController } from "./controllers/subjectController.js";

// Routes
export { default as studentRoutes } from "./routes/studentRoutes.js";
export { default as teacherRoutes } from "./routes/teacherRoutes.js";
export { default as classRoutes } from "./routes/classRoutes.js";
export { default as subjectRoutes } from "./routes/subjectRoutes.js";

// Models
export { default as Student } from "./models/Student.js";
export { default as Teacher } from "./models/Teacher.js";
export { default as Class } from "./models/Class.js";
export { default as Subject } from "./models/Subject.js";
