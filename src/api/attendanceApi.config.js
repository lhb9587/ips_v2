const ATTENDANCE_URL = '/ip_attendance'

const attendanceApi = {
  attendanceAuthScope: `${ATTENDANCE_URL}/api/auth/scope`,
  queryAttendanceArchivePage: `${ATTENDANCE_URL}/api/attendance/archive/page`,
  queryAttendanceGroupPage: `${ATTENDANCE_URL}/api/attendance/group/page`,
  queryAttendanceGroupDetail: `${ATTENDANCE_URL}/api/attendance/group/detail`,
  saveAttendanceGroup: `${ATTENDANCE_URL}/api/attendance/group/save`,
  queryAttendanceGroupDeleteCheck: `${ATTENDANCE_URL}/api/attendance/group/delete-check`,
  deleteAttendanceGroup: `${ATTENDANCE_URL}/api/attendance/group/delete`,
  queryAttendanceGroupMemberCandidatePage: `${ATTENDANCE_URL}/api/attendance/group/member/candidate/page`,
  queryAttendanceArchiveDetail: `${ATTENDANCE_URL}/api/attendance/archive/detail`,
  createAttendanceArchive: `${ATTENDANCE_URL}/api/attendance/archive/create`,
  updateAttendanceArchive: `${ATTENDANCE_URL}/api/attendance/archive/update`,
  deleteAttendanceArchive: `${ATTENDANCE_URL}/api/attendance/archive/delete`,
  changeAttendanceArchiveStatus: `${ATTENDANCE_URL}/api/attendance/archive/change-status`,
  queryUnarchivedAttendanceArchivePage: `${ATTENDANCE_URL}/api/attendance/archive/unarchived/page`,
  batchAssignAttendanceArchive: `${ATTENDANCE_URL}/api/attendance/archive/batch-assign`,
  batchCreateAttendanceArchiveByDefault: `${ATTENDANCE_URL}/api/attendance/archive/batch-create-by-default`,
  queryAttendanceArchiveHistoryPage: `${ATTENDANCE_URL}/api/attendance/archive/history/page`,
}

export default attendanceApi
