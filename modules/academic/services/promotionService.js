import { getSequelize } from "../../backend-core/config/database.js";
import { getStudentReportCards } from "../../examination/services/examService.js";
import {
  DEFAULT_PROMOTION_RULE,
  ENROLLMENT_STATUS,
  PROMOTION_DECISION,
} from "../constants/academicConstants.js";
import * as db from "../dbCommands/academicDbCommands.js";
import {
  summarizeResults,
  attendancePercentage,
  evaluate,
} from "../utils/promotionMath.js";

/* ---------- Rule ---------- */

export const getRule = async (schoolId) => {
  const rule = await db.findPromotionRule(schoolId);
  if (rule) return rule.toJSON();
  return { ...DEFAULT_PROMOTION_RULE };
};

export const saveRule = async (schoolId, payload) => {
  const data = {
    minOverallPercentage:
      payload.minOverallPercentage ?? DEFAULT_PROMOTION_RULE.minOverallPercentage,
    mustPassAllSubjects:
      payload.mustPassAllSubjects ?? DEFAULT_PROMOTION_RULE.mustPassAllSubjects,
    maxFailedSubjects:
      payload.maxFailedSubjects ?? DEFAULT_PROMOTION_RULE.maxFailedSubjects,
    minAttendancePercentage:
      payload.minAttendancePercentage ??
      DEFAULT_PROMOTION_RULE.minAttendancePercentage,
    outcomeOnFail:
      payload.outcomeOnFail || DEFAULT_PROMOTION_RULE.outcomeOnFail,
  };

  const existing = await db.findPromotionRule(schoolId);
  if (existing) {
    await existing.update(data);
    return existing.toJSON();
  }
  const created = await db.createPromotionRule(data, schoolId);
  return created.toJSON();
};

/* ---------- Preview ---------- */

export const computePreview = async (
  schoolId,
  { academicYearId, gradeId, classId },
) => {
  const year = await db.findAcademicYear(academicYearId, schoolId);
  if (!year) throw new Error("Academic year not found");

  const rule = await getRule(schoolId);
  const grades = await db.getGradeOrder(schoolId);
  const currentIndex = grades.findIndex((g) => g.gradeId === gradeId);
  const isTopGrade =
    currentIndex >= 0 && currentIndex === grades.length - 1;
  const nextGrade =
    currentIndex >= 0 && !isTopGrade ? grades[currentIndex + 1] : null;
  const nextClass = nextGrade
    ? await db.getFirstClassForGrade(schoolId, nextGrade.gradeId)
    : null;
  const suggestedTargetYear = await db.findNextAcademicYear(
    schoolId,
    year.startDate,
  );

  // Exams may store the academic year as "2026", "2026-27" or "2026-2027".
  // Accept every equivalent form so results are not missed.
  const startYear = new Date(year.startDate).getFullYear();
  const yearNameVariants = Array.from(
    new Set(
      [
        year.name,
        String(startYear),
        `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
        `${startYear}-${startYear + 1}`,
      ].filter(Boolean),
    ),
  );

  const students = await db.findStudentsByGrade(schoolId, gradeId, classId);
  const studentIds = students.map((student) => student.studentId);

  // Batched fetches — avoids 2 queries per student.
  const [cardsByStudent, attendanceRecords, allClasses] = await Promise.all([
    getStudentReportCards(studentIds, schoolId, {
      academicYearId: year.academicYearId,
      academicYearNames: yearNameVariants,
    }),
    db.findAttendanceByStudents(
      studentIds,
      schoolId,
      year.startDate,
      year.endDate,
    ),
    db.findAllClasses(schoolId),
  ]);

  const attendanceByStudent = new Map();
  for (const record of attendanceRecords) {
    if (!attendanceByStudent.has(record.studentId)) {
      attendanceByStudent.set(record.studentId, []);
    }
    attendanceByStudent.get(record.studentId).push(record);
  }

  const classById = new Map(
    allClasses.map((cls) => [cls.classId, cls]),
  );
  const nextGradeClasses = nextGrade
    ? allClasses.filter((cls) => cls.gradeId === nextGrade.gradeId)
    : [];

  const items = [];
  for (const student of students) {
    const exams = cardsByStudent.get(student.studentId) || [];
    const summary = summarizeResults(exams);
    const attendance = attendancePercentage(
      attendanceByStudent.get(student.studentId) || [],
    );
    const verdict = evaluate(rule, summary, attendance, isTopGrade);

    const json = student.toJSON();
    const currentClass = json.classId ? classById.get(json.classId) : null;

    // Prefer the next-grade class with the same section as the student's
    // current class; fall back to the first class in the next grade.
    const matchedNextClass =
      nextGradeClasses.find(
        (cls) => currentClass?.section && cls.section === currentClass.section,
      ) ||
      nextGradeClasses[0] ||
      null;

    const isPromote = verdict.decision === PROMOTION_DECISION.PROMOTE;
    const isRetain = verdict.decision === PROMOTION_DECISION.RETAIN;

    items.push({
      studentId: student.studentId,
      name:
        json.name ||
        `${json.firstName || ""} ${json.lastName || ""}`.trim() ||
        student.studentId,
      rollNumber: json.rollNumber || null,
      classId: json.classId || null,
      gradeId: json.gradeId || null,
      currentSection: currentClass?.section || null,
      nextClassId: isPromote
        ? matchedNextClass?.classId || null
        : isRetain
          ? json.classId || null
          : null,
      nextClassName: isPromote
        ? matchedNextClass?.className || null
        : isRetain
          ? currentClass?.className || null
          : null,
      ...summary,
      attendancePercentage: attendance,
      ...verdict,
    });
  }

  const counts = {
    total: items.length,
    promote: items.filter((i) => i.decision === PROMOTION_DECISION.PROMOTE)
      .length,
    retain: items.filter((i) => i.decision === PROMOTION_DECISION.RETAIN).length,
    graduate: items.filter((i) => i.decision === PROMOTION_DECISION.GRADUATE)
      .length,
    noResults: items.filter((i) => i.decision === PROMOTION_DECISION.NO_RESULTS)
      .length,
    conditional: items.filter((i) => i.conditional).length,
  };

  return {
    academicYear: {
      academicYearId: year.academicYearId,
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
      isActive: year.isActive,
    },
    gradeId,
    grade: grades[currentIndex]?.grade || gradeId,
    isTopGrade,
    nextGrade: nextGrade
      ? { gradeId: nextGrade.gradeId, grade: nextGrade.grade }
      : null,
    nextClass: nextClass
      ? { classId: nextClass.classId, className: nextClass.className }
      : null,
    suggestedTargetYear: suggestedTargetYear
      ? {
          academicYearId: suggestedTargetYear.academicYearId,
          name: suggestedTargetYear.name,
        }
      : null,
    rule,
    counts,
    students: items,
  };
};

/* ---------- Run ---------- */

const nextYearName = (name, startDate) => {
  const match = String(name || "").match(/^(\d{4})\s*[-/]\s*(\d{2,4})$/);
  if (match) {
    const first = Number(match[1]) + 1;
    const second =
      match[2].length === 4
        ? String(first + 1)
        : String((first + 1) % 100).padStart(2, "0");
    return `${first}-${second}`;
  }
  const d = new Date(startDate);
  return `${d.getFullYear() + 1}-${String(d.getFullYear() + 2).slice(2)}`;
};

const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

const ensureNextAcademicYear = async (schoolId, currentYear, t) => {
  const existing = await db.findNextAcademicYear(schoolId, currentYear.startDate);
  if (existing) return existing;

  const start = new Date(currentYear.startDate);
  start.setFullYear(start.getFullYear() + 1);
  const end = new Date(currentYear.endDate);
  end.setFullYear(end.getFullYear() + 1);

  const created = await db.createAcademicYear(
    {
      name: nextYearName(currentYear.name, currentYear.startDate),
      startDate: isoDate(start),
      endDate: isoDate(end),
      isActive: true,
    },
    schoolId,
    { transaction: t },
  );
  await db.deactivateOtherYears(schoolId, created.academicYearId, {
    transaction: t,
  });
  return created;
};

const upsertEnrollment = async (
  studentId,
  academicYearId,
  academicYearName,
  data,
  schoolId,
  t,
) => {
  const existing = await db.findEnrollmentByStudentYear(
    studentId,
    academicYearId,
    schoolId,
    { transaction: t },
  );
  if (existing) {
    await existing.update({ ...data, academicYearName }, { transaction: t });
    return existing;
  }
  return db.createEnrollment(
    { studentId, academicYearId, academicYearName, ...data },
    schoolId,
    { transaction: t },
  );
};

export const runPromotion = async (schoolId, payload, userId) => {
  const { academicYearId, gradeId, classId, targetAcademicYearId } = payload;
  const includeNoResults = Boolean(payload.includeNoResults);

  const previewData = await computePreview(schoolId, {
    academicYearId,
    gradeId,
    classId,
  });

  const needsNextYear = previewData.students.some(
    (s) =>
      s.decision === PROMOTION_DECISION.PROMOTE ||
      s.decision === PROMOTION_DECISION.RETAIN,
  );

  const sequelize = getSequelize();
  return sequelize.transaction(async (t) => {
    const currentYear = await db.findAcademicYear(academicYearId, schoolId);

    let targetYear = null;
    if (targetAcademicYearId) {
      targetYear = await db.findAcademicYear(targetAcademicYearId, schoolId);
      if (!targetYear) throw new Error("Target academic year not found");
    } else if (needsNextYear) {
      targetYear = await ensureNextAcademicYear(schoolId, currentYear, t);
    }

    const results = [];

    for (const student of previewData.students) {
      if (
        student.decision === PROMOTION_DECISION.NO_RESULTS &&
        !includeNoResults
      ) {
        results.push({
          studentId: student.studentId,
          decision: student.decision,
          skipped: true,
        });
        continue;
      }

      const common = {
        finalPercentage: student.percentage,
        finalGrade: student.grade,
        decidedByUserId: userId || null,
      };

      if (student.decision === PROMOTION_DECISION.GRADUATE) {
        await upsertEnrollment(
          student.studentId,
          currentYear.academicYearId,
          currentYear.name,
          {
            ...common,
            classId: student.classId,
            gradeId: student.gradeId,
            status: ENROLLMENT_STATUS.GRADUATED,
            remarks: "Graduated",
          },
          schoolId,
          t,
        );
        const dbStudent = await db.findStudentById(student.studentId, schoolId, {
          transaction: t,
        });
        if (dbStudent) {
          await dbStudent.update({ status: "Graduated" }, { transaction: t });
        }
        results.push({
          studentId: student.studentId,
          decision: student.decision,
        });
        continue;
      }

      const isPromote = student.decision === PROMOTION_DECISION.PROMOTE;
      const currentStatus = isPromote
        ? ENROLLMENT_STATUS.PROMOTED
        : ENROLLMENT_STATUS.RETAINED;

      await upsertEnrollment(
        student.studentId,
        currentYear.academicYearId,
        currentYear.name,
        {
          ...common,
          classId: student.classId,
          gradeId: student.gradeId,
          status: currentStatus,
          remarks: student.conditional
            ? "Conditional promotion"
            : student.reasons.join("; ") || null,
        },
        schoolId,
        t,
      );

      const targetClassId = isPromote
        ? student.nextClassId || null
        : student.classId;
      const targetGradeId = isPromote
        ? previewData.nextGrade?.gradeId || student.gradeId
        : student.gradeId;

      await upsertEnrollment(
        student.studentId,
        targetYear.academicYearId,
        targetYear.name,
        {
          classId: targetClassId,
          gradeId: targetGradeId,
          status: ENROLLMENT_STATUS.ENROLLED,
        },
        schoolId,
        t,
      );

      const dbStudent = await db.findStudentById(student.studentId, schoolId, {
        transaction: t,
      });
      if (dbStudent) {
        await dbStudent.update(
          {
            classId: targetClassId,
            gradeId: targetGradeId,
            status: "Active",
          },
          { transaction: t },
        );
      }

      results.push({
        studentId: student.studentId,
        decision: student.decision,
        conditional: student.conditional,
        targetClassId,
        targetGradeId,
      });
    }

    return {
      targetAcademicYear: targetYear
        ? {
            academicYearId: targetYear.academicYearId,
            name: targetYear.name,
          }
        : null,
      counts: previewData.counts,
      results,
    };
  });
};
