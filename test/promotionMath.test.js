import test from "node:test";
import assert from "node:assert/strict";
import {
  summarizeResults,
  attendancePercentage,
  evaluate,
} from "../modules/academic/utils/promotionMath.js";

const subject = (maxMarks, marksObtained, status = "PASS") => ({
  examSubject: { maxMarks },
  marksObtained,
  status,
});

const examsWith = (subjects) => [{ subjects }];

const rule = (overrides = {}) => ({
  minOverallPercentage: 40,
  mustPassAllSubjects: true,
  maxFailedSubjects: 0,
  minAttendancePercentage: 0,
  outcomeOnFail: "RETAIN",
  ...overrides,
});

test("summarizeResults computes totals and grade", () => {
  const summary = summarizeResults(
    examsWith([subject(100, 80), subject(100, 90)]),
  );
  assert.equal(summary.obtained, 170);
  assert.equal(summary.max, 200);
  assert.equal(summary.percentage, 85);
  assert.equal(summary.failedSubjects, 0);
  assert.equal(summary.hasResults, true);
});

test("summarizeResults handles failures and absences", () => {
  const summary = summarizeResults(
    examsWith([
      subject(100, 30, "FAIL"),
      subject(100, null, "ABSENT"),
    ]),
  );
  assert.equal(summary.obtained, 30);
  assert.equal(summary.max, 200);
  assert.equal(summary.failedSubjects, 1);
  assert.equal(summary.absentSubjects, 1);
  assert.equal(summary.percentage, 15);
});

test("summarizeResults marks no-results when nothing was entered", () => {
  const summary = summarizeResults([]);
  assert.equal(summary.hasResults, false);
  assert.equal(summary.percentage, 0);
});

test("attendancePercentage counts present and late as attended", () => {
  const pct = attendancePercentage([
    { status: "PRESENT" },
    { status: "PRESENT" },
    { status: "PRESENT" },
    { status: "LATE" },
    { status: "ABSENT" },
  ]);
  assert.equal(pct, 80);
  assert.equal(attendancePercentage([]), 100);
});

test("evaluate promotes when rules pass (non-top grade)", () => {
  const summary = summarizeResults(examsWith([subject(100, 70)]));
  const verdict = evaluate(rule(), summary, 100, false);
  assert.equal(verdict.decision, "PROMOTE");
  assert.equal(verdict.conditional, false);
});

test("evaluate graduates at the top grade", () => {
  const summary = summarizeResults(examsWith([subject(100, 70)]));
  const verdict = evaluate(rule(), summary, 100, true);
  assert.equal(verdict.decision, "GRADUATE");
});

test("evaluate retains when a subject fails (must pass all)", () => {
  const summary = summarizeResults(
    examsWith([subject(100, 90), subject(100, 20, "FAIL")]),
  );
  const verdict = evaluate(rule(), summary, 100, false);
  assert.equal(verdict.decision, "RETAIN");
  assert.ok(verdict.reasons.length > 0);
});

test("evaluate allows a failed subject when configured", () => {
  const summary = summarizeResults(
    examsWith([subject(100, 90), subject(100, 20, "FAIL")]),
  );
  const verdict = evaluate(
    rule({ mustPassAllSubjects: false, maxFailedSubjects: 1 }),
    summary,
    100,
    false,
  );
  assert.equal(verdict.decision, "PROMOTE");
});

test("evaluate blocks on low attendance", () => {
  const summary = summarizeResults(examsWith([subject(100, 90)]));
  const verdict = evaluate(
    rule({ minAttendancePercentage: 75 }),
    summary,
    50,
    false,
  );
  assert.equal(verdict.decision, "RETAIN");
  assert.match(verdict.reasons.join(" "), /Attendance/);
});

test("evaluate can return conditional promotion", () => {
  const summary = summarizeResults(examsWith([subject(100, 90)]));
  const verdict = evaluate(
    rule({ minOverallPercentage: 95, outcomeOnFail: "CONDITIONAL" }),
    summary,
    100,
    false,
  );
  assert.equal(verdict.decision, "PROMOTE");
  assert.equal(verdict.conditional, true);
});

test("evaluate returns NO_RESULTS when there are no results", () => {
  const verdict = evaluate(rule(), summarizeResults([]), 100, false);
  assert.equal(verdict.decision, "NO_RESULTS");
});
