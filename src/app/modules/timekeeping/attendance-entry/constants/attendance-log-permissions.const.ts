// The permission each attendance log source needs to be edited or removed -- mirrors
// AttendanceLogSourcePolicy in hrms-api. A source not listed (biometric, mobile, geofence,
// portal, other) can't be changed by anyone.
export const ATTENDANCE_LOG_PERMISSIONS: Record<
  string,
  { edit: string; delete: string }
> = {
  MANUAL: {
    edit: "Attendance Manual Entry:Edit",
    delete: "Attendance Manual Entry:Delete",
  },
  UPLOADED: {
    edit: "Upload Attendance:Edit",
    delete: "Upload Attendance:Delete",
  },
  SYNC: {
    edit: "Sync Attendance:Edit",
    delete: "Sync Attendance:Delete",
  },
};

// Drilling into the edited/removed logs of an upload (Upload Attendance > Upload History).
export const VIEW_UPLOAD_BATCH_PERMISSION = "Upload Attendance:View";

// Deleting a whole attendance file upload (Upload Attendance > Upload History).
export const DELETE_UPLOAD_BATCH_PERMISSION = "Upload Attendance:Delete";

// Sources whose original is kept when a user edits or removes the log, so it can be restored
// and a re-upload / device re-sync doesn't bring it back.
export const ORIGINAL_KEPT_SOURCES = ["UPLOADED", "SYNC"];
