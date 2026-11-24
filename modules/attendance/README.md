# Attendance Module

Student attendance recording and reporting.

## Endpoints (mounted at `/api/attendance`)

- `GET /summary?classId=&from=&to=` — attendance counts for a class or the whole school over a date range
- `GET /class/:classId?date=YYYY-MM-DD` — class roster for a date, merged with existing attendance
- `POST /mark` — bulk mark/update attendance (`{ classId, date, period?, entries: [{ studentId, status, remarks? }] }`)
- `GET /student/:studentId?from=&to=` — a student's attendance history

## Models

- `attendance` — one row per student per date (and optional period). `period` defaults to `FULL_DAY`.

## Statuses

`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
