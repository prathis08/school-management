export const EXAM_TYPES = {
  EXAM: "EXAM",
  REGULAR_ASSESSMENT: "REGULAR_ASSESSMENT",
};

export const EXAM_STATUS = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  PUBLISHED: "PUBLISHED",
};

export const RESULT_STATUS = {
  PASS: "PASS",
  FAIL: "FAIL",
  ABSENT: "ABSENT",
};

export const isValidExamType = (type) =>
  Object.values(EXAM_TYPES).includes(type);

export const isValidExamStatus = (status) =>
  Object.values(EXAM_STATUS).includes(status);

export const isValidResultStatus = (status) =>
  Object.values(RESULT_STATUS).includes(status);

export const getExamTypeValues = () => Object.values(EXAM_TYPES);
export const getExamStatusValues = () => Object.values(EXAM_STATUS);
export const getResultStatusValues = () => Object.values(RESULT_STATUS);

/**
 * Map a percentage to a letter grade. Tweak the thresholds in one place.
 * @param {number} percentage
 * @returns {string}
 */
export const gradeFromPercentage = (percentage) => {
  if (percentage == null || Number.isNaN(percentage)) return "-";
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};
