import {
  RESULT_STATUS,
  gradeFromPercentage,
} from "../../examination/constants/examinationConstants.js";
import { ATTENDANCE_STATUS } from "../../attendance/constants/attendanceConstants.js";
import {
  PROMOTION_DECISION,
  PROMOTION_OUTCOME_ON_FAIL,
} from "../constants/academicConstants.js";

const round2 = (value) => Number(Number(value).toFixed(2));

/**
 * Aggregate exam results into a promotion summary.
 * @param {Array<{subjects:Array}>} exams
 */
export const summarizeResults = (exams) => {
  let obtained = 0;
  let max = 0;
  let failed = 0;
  let absent = 0;

  for (const exam of exams || []) {
    for (const subject of exam.subjects || []) {
      const subjectMax = Number(subject.examSubject?.maxMarks) || 0;
      max += subjectMax;
      if (subject.status === RESULT_STATUS.ABSENT) {
        absent += 1;
      } else {
        obtained += Number(subject.marksObtained) || 0;
      }
      if (subject.status === RESULT_STATUS.FAIL) failed += 1;
    }
  }

  const percentage = max > 0 ? round2((obtained / max) * 100) : 0;
  return {
    obtained: round2(obtained),
    max: round2(max),
    failedSubjects: failed,
    absentSubjects: absent,
    percentage,
    grade: gradeFromPercentage(percentage),
    hasResults: max > 0,
  };
};

/**
 * Percentage of days marked PRESENT or LATE. No records => 100 so an
 * untracked year doesn't block promotion.
 */
export const attendancePercentage = (records) => {
  if (!records || records.length === 0) return 100;
  const attended = records.filter(
    (record) =>
      record.status === ATTENDANCE_STATUS.PRESENT ||
      record.status === ATTENDANCE_STATUS.LATE,
  ).length;
  return round2((attended / records.length) * 100);
};

/**
 * Apply promotion rules and return { decision, conditional, reasons }.
 */
export const evaluate = (rule, summary, attendance, isTopGrade) => {
  if (!summary.hasResults) {
    return {
      decision: PROMOTION_DECISION.NO_RESULTS,
      conditional: false,
      reasons: ["No exam results recorded for this academic year"],
    };
  }

  const reasons = [];
  let passed = true;

  if (summary.percentage < Number(rule.minOverallPercentage)) {
    passed = false;
    reasons.push(
      `Overall ${summary.percentage}% is below the ${rule.minOverallPercentage}% minimum`,
    );
  }
  if (rule.mustPassAllSubjects && summary.failedSubjects > 0) {
    passed = false;
    reasons.push(`${summary.failedSubjects} subject(s) failed (must pass all)`);
  }
  if (
    !rule.mustPassAllSubjects &&
    summary.failedSubjects > Number(rule.maxFailedSubjects)
  ) {
    passed = false;
    reasons.push(
      `${summary.failedSubjects} failed subject(s) exceeds allowed ${rule.maxFailedSubjects}`,
    );
  }
  if (attendance < Number(rule.minAttendancePercentage)) {
    passed = false;
    reasons.push(
      `Attendance ${attendance}% is below the ${rule.minAttendancePercentage}% minimum`,
    );
  }

  if (passed) {
    return {
      decision: isTopGrade
        ? PROMOTION_DECISION.GRADUATE
        : PROMOTION_DECISION.PROMOTE,
      conditional: false,
      reasons: [],
    };
  }

  if (
    String(rule.outcomeOnFail).toUpperCase() ===
    PROMOTION_OUTCOME_ON_FAIL.CONDITIONAL
  ) {
    return {
      decision: PROMOTION_DECISION.PROMOTE,
      conditional: true,
      reasons,
    };
  }

  return {
    decision: PROMOTION_DECISION.RETAIN,
    conditional: false,
    reasons,
  };
};
