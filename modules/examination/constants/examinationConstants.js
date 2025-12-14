export const EXAM_TYPES = {
  UNIT_TEST: "UNIT_TEST",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  ANNUAL: "ANNUAL",
  ENTRANCE: "ENTRANCE",
  OTHER: "OTHER",
};

export const RESULT_STATUS = {
  PASS: "PASS",
  FAIL: "FAIL",
  ABSENT: "ABSENT",
};

// Validation functions
export const isValidExamType = (type) => {
  return Object.values(EXAM_TYPES).includes(type);
};

export const isValidResultStatus = (status) => {
  return Object.values(RESULT_STATUS).includes(status);
};

// Get all values as arrays for validation
export const getExamTypeValues = () => Object.values(EXAM_TYPES);
export const getResultStatusValues = () => Object.values(RESULT_STATUS);
