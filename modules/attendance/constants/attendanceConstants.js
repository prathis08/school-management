export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
};

export const ATTENDANCE_STATUS_VALUES = Object.values(ATTENDANCE_STATUS);

// A row with period "FULL_DAY" represents day-level attendance. Period-wise
// attendance can store a specific period label (e.g. "P1").
export const DEFAULT_PERIOD = "FULL_DAY";

export const isValidAttendanceStatus = (status) =>
  ATTENDANCE_STATUS_VALUES.includes(status);
