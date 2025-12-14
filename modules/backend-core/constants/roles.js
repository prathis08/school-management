export const ROLES = {
  ADMIN: "admin",
  COORDINATOR: "coordinator",
  ACCOUNTANT: "accountant",
  TEACHER: "teacher",
  STUDENT: "student",
};

export const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
};

// Validation functions
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

export const isValidTokenType = (type) => {
  return Object.values(TOKEN_TYPES).includes(type);
};

// Get all values as arrays for validation
export const getRoleValues = () => Object.values(ROLES);
export const getTokenTypeValues = () => Object.values(TOKEN_TYPES);
