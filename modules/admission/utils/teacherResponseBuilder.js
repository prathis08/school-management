// Teacher rows reach this formatter from two different query paths: Sequelize
// instances (camelCase attributes) and raw/aliased rows (snake_case columns).
// Read whichever form is present so both the list and detail endpoints work.
const pick = (obj, camelKey, snakeKey) => {
  if (!obj) return null;
  if (obj[camelKey] !== undefined && obj[camelKey] !== null) {
    return obj[camelKey];
  }
  if (obj[snakeKey] !== undefined) return obj[snakeKey];
  return null;
};

const toBool = (value) => (value === undefined ? null : Boolean(value));

const normalizeAddress = (address) => {
  if (address == null) return null;
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode || address.zip,
    ].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return null;
  }
  return null;
};

export const buildTeacherResponse = (teacher) => {
  if (!teacher) return null;

  const data = JSON.parse(JSON.stringify(teacher));
  const user = data.user || {};

  const firstName = pick(user, "firstName", "first_name");
  const lastName = pick(user, "lastName", "last_name");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return {
    teacherId: pick(data, "teacherId", "teacher_id"),
    personalInfo: {
      firstName,
      lastName,
      name: fullName || null,
      email: pick(user, "email", "email"),
      phone: pick(data, "phone", "phone"),
      address: normalizeAddress(pick(data, "address", "address")),
    },
    professionalInfo: {
      department: pick(data, "department", "department"),
      qualification: pick(data, "qualification", "qualification"),
      experience: pick(data, "experience", "experience"),
      dateOfJoining: pick(data, "dateOfJoining", "date_of_joining"),
      salary: pick(data, "salary", "salary"),
    },
    assignments: {
      subjects: (data.subjects || []).map((subject) => ({
        subjectId: pick(subject, "subjectId", "subject_id"),
        subjectName: pick(subject, "subjectName", "subject_name"),
        subjectCode: pick(subject, "subjectCode", "subject_code"),
        department: subject.department || null,
      })),
      managedClasses: (data.managedClasses || []).map((cls) => ({
        classId: pick(cls, "classId", "class_id"),
        className: pick(cls, "className", "class_name"),
        grade: cls.grade,
        section: cls.section,
        room: cls.room || null,
      })),
    },
    status: {
      isActive: toBool(pick(data, "isActive", "is_active")),
    },
    metadata: {
      createdAt: pick(data, "createdAt", "created_at"),
      updatedAt: pick(data, "updatedAt", "updated_at"),
    },
  };
};

export const buildTeachersListResponse = (teachers) => {
  if (!Array.isArray(teachers)) return [];
  return teachers.map((teacher) => buildTeacherResponse(teacher));
};

export const buildTeacherSummaryResponse = (teacher) => {
  if (!teacher) return null;

  const user = teacher.user || {};
  const firstName = pick(user, "firstName", "first_name");
  const lastName = pick(user, "lastName", "last_name");

  return {
    teacherId: pick(teacher, "teacherId", "teacher_id"),
    name: `${firstName || ""} ${lastName || ""}`.trim(),
    email: user.email || null,
    department: pick(teacher, "department", "department"),
    experience: pick(teacher, "experience", "experience"),
    subjectCount: (teacher.subjects || []).length,
    classCount: (teacher.managedClasses || []).length,
    status: {
      isActive: toBool(pick(teacher, "isActive", "is_active")),
    },
  };
};

export const buildTeachersSummariesResponse = (teachers) => {
  if (!Array.isArray(teachers)) return [];
  return teachers.map((teacher) => buildTeacherSummaryResponse(teacher));
};
