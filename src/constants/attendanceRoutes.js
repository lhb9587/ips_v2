/** 考勤模块路由 name 集合，供 permission、embedLayout 等共用。 */
export const attendanceRouteNameSet = new Set([
  'attendance-management',
  'attendance-management-root',
  'leave-quota-management',
  'leave-quota-management-root',
  'leave-quota-management-ledger',
  'leave-management',
  'overtime-management',
  'supplement-management',
  'supplement-management-root',
  'supplement-missing-check',
  'attendance-profile',
  'attendance-profile-history',
  'attendance-record',
  'attendance-summary',
  'attendance-calculation',
  'attendance-result-summary',
  'leave-report-summary',
  'comp-off-detail',
  'attendance-group',
  'schedule-list',
  'schedule-list-index',
  'schedule-swap-list',
  'schedule-wizard',
  'my-attendance',
  'my-attendance-calendar',
  'my-punch-record',
  'my-leave-application',
  'my-leave-list',
  'my-leave-detail',
  'my-overtime-application',
  'my-overtime-list',
  'my-overtime-detail',
  'my-supplement-application',
  'my-supplement-list',
  'my-supplement-detail',
  'approval-center',
])

export function isAttendanceRoute(route) {
  if (attendanceRouteNameSet.has(route.name)) {
    return true
  }
  return route.path?.startsWith('/hrm/my-attendance')
}
