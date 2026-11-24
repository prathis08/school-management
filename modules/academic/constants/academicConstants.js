export const ENROLLMENT_STATUS = {
  ENROLLED: "ENROLLED",
  PROMOTED: "PROMOTED",
  RETAINED: "RETAINED",
  GRADUATED: "GRADUATED",
  TRANSFERRED: "TRANSFERRED",
};

export const ENROLLMENT_STATUS_VALUES = Object.values(ENROLLMENT_STATUS);

export const PROMOTION_DECISION = {
  PROMOTE: "PROMOTE",
  RETAIN: "RETAIN",
  GRADUATE: "GRADUATE",
  NO_RESULTS: "NO_RESULTS",
};

export const PROMOTION_OUTCOME_ON_FAIL = {
  RETAIN: "RETAIN",
  CONDITIONAL: "CONDITIONAL",
};

export const PROMOTION_OUTCOME_ON_FAIL_VALUES = Object.values(
  PROMOTION_OUTCOME_ON_FAIL,
);

export const DEFAULT_PROMOTION_RULE = {
  minOverallPercentage: 40,
  mustPassAllSubjects: true,
  maxFailedSubjects: 0,
  minAttendancePercentage: 0,
  outcomeOnFail: PROMOTION_OUTCOME_ON_FAIL.RETAIN,
};

export const isValidEnrollmentStatus = (value) =>
  ENROLLMENT_STATUS_VALUES.includes(value);

export const isValidPromotionOutcome = (value) =>
  PROMOTION_OUTCOME_ON_FAIL_VALUES.includes(value);
