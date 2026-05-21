export const GENDER_TYPES = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

// Validation function
export const isValidGender = (gender) => {
  return Object.values(GENDER_TYPES).includes(gender);
};

// Get all values as array for validation
export const getGenderValues = () => Object.values(GENDER_TYPES);

// Student Status Types
export const STUDENT_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  GRADUATED: "Graduated",
};

// Validation function for student status
export const isValidStudentStatus = (status) => {
  return Object.values(STUDENT_STATUS).includes(status);
};

// Get all student status values as array
export const getStudentStatusValues = () => Object.values(STUDENT_STATUS);
