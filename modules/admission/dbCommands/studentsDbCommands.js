import {
  Student,
  User,
  Class,
} from "@school-management/backend-core/models/index.js";

export const getAllStudents = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email", "schoolId"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["className", "grade", "section"],
      },
    ],
    order: [["createdAt", "DESC"]],
    ...options,
  };

  return await Student.findAll({
    where: {
      schoolId: schoolId,
      isActive: true,
    },
    ...defaultOptions,
  });
};

export const getStudentById = async (studentId, schoolId, options = {}) => {
  if (!studentId) {
    throw new Error("Student identifier is missing");
  }

  const defaultOptions = {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email", "schoolId"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["className", "grade", "section"],
      },
    ],
    ...options,
  };

  return await Student.findOne({
    where: {
      schoolId: schoolId,
      studentId: studentId,
    },
    ...defaultOptions,
  });
};

export const getStudentByNameAndFather = async (
  firstName,
  lastName,
  fatherName,
  schoolId
) => {
  if (!firstName || !lastName || !fatherName) {
    throw new Error("Student name and father's name are required");
  }

  return await Student.findOne({
    where: {
      schoolId: schoolId,
      fatherName: fatherName,
    },
    include: [
      {
        model: User,
        as: "user",
        where: {
          firstName: firstName,
          lastName: lastName,
          schoolId: schoolId,
        },
        attributes: ["firstName", "lastName", "email"],
      },
    ],
  });
};

export const createStudent = async (studentData, schoolId) => {
  return await Student.create({
    ...studentData,
    schoolId: schoolId,
  });
};

export const updateStudent = async (studentId, updateData, schoolId) => {
  if (!studentId) {
    throw new Error("Student identifier is missing");
  }

  return await Student.update(updateData, {
    where: {
      schoolId: schoolId,
      studentId: studentId,
    },
  });
};

export const deleteStudent = async (studentId, schoolId) => {
  if (!studentId) {
    throw new Error("Student identifier is missing");
  }

  return await Student.update(
    { isActive: false },
    {
      where: {
        schoolId: schoolId,
        studentId: studentId,
      },
    }
  );
};
