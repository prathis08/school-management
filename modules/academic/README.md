# Academic Module

Per-academic-year enrollment history and student promotion (grade progression) driven by exam results and attendance.

## Endpoints (mounted at `/api/academic`)

- `GET /enrollments?academicYearId=&gradeId=&classId=&studentId=` — list enrollments
- `GET /enrollments/student/:studentId` — a student's year-by-year history
- `POST /enrollments` — ensure an enrollment row exists (`{ studentId, academicYearId }`)
- `GET /promotion-rule` — current promotion/exam settings
- `PUT /promotion-rule` — update settings (admin)
- `GET /promotions/preview?academicYearId=&gradeId=&classId=` — per-student outcome preview
- `POST /promotions/run` — apply promotions (`{ academicYearId, gradeId, classId?, targetAcademicYearId?, includeNoResults? }`)

## Models

- `student_enrollments` — one row per student per academic year (class, grade, status, final %).
- `promotion_rules` — one settings row per school.

## Promotion logic

A student is promoted when all configured thresholds pass; otherwise the configured failure outcome (RETAIN or CONDITIONAL) applies. Promoting writes the next-year enrollment and moves the student's current class/grade; the source-year enrollment records the outcome so nothing is lost.
