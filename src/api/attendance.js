import request from '@/utils/request'
import attendanceApi from '@/api/attendanceApi.config'

export function getAttendanceScope(config = {}) {
  return request({
    url: attendanceApi.attendanceAuthScope,
    method: 'get',
    isLoading: false,
    successByCode: 200,
    ...config
  })
}

export function queryAttendanceArchivePage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceArchivePage,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveQuotaAccountPage(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveQuotaAccountPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveQuotaAccountDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveQuotaAccountDetail,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveQuotaLedgerPage(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveQuotaLedgerPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveTypeList(config = {}) {
  return request({
    url: attendanceApi.queryLeaveTypeList,
    method: 'get',
    ...config
  })
}

export function generateLeaveQuotaAccount(data, config = {}) {
  return request({
    url: attendanceApi.generateLeaveQuotaAccount,
    method: 'post',
    data,
    ...config
  })
}

export function batchExtendLeaveQuotaAccount(data, config = {}) {
  return request({
    url: attendanceApi.batchExtendLeaveQuotaAccount,
    method: 'post',
    data,
    ...config
  })
}

export function updateLeaveQuotaAccount(data, config = {}) {
  return request({
    url: attendanceApi.updateLeaveQuotaAccount,
    method: 'post',
    data,
    ...config
  })
}

export function deleteLeaveQuotaAccount(data, config = {}) {
  return request({
    url: attendanceApi.deleteLeaveQuotaAccount,
    method: 'post',
    data,
    ...config
  })
}

export function auditLeaveQuotaAccount(data, config = {}) {
  return request({
    url: attendanceApi.auditLeaveQuotaAccount,
    method: 'post',
    data,
    ...config
  })
}

export function reverseAuditLeaveQuotaAccount(data, config = {}) {
  return request({
    url: attendanceApi.reverseAuditLeaveQuotaAccount,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupDetail,
    method: 'post',
    data,
    ...config
  })
}

export function saveAttendanceGroup(data, config = {}) {
  return request({
    url: attendanceApi.saveAttendanceGroup,
    method: 'post',
    data,
    ...config
  })
}

export function saveAttendanceGroupMembers(data, config = {}) {
  return request({
    url: attendanceApi.saveAttendanceGroupMembers,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupDeleteCheck(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupDeleteCheck,
    method: 'post',
    data,
    ...config
  })
}

export function deleteAttendanceGroup(data, config = {}) {
  return request({
    url: attendanceApi.deleteAttendanceGroup,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupMemberCandidatePage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupMemberCandidatePage,
    method: 'post',
    data,
    ...config
  })
}

export function queryUnarchivedAttendanceArchivePage(data, config = {}) {
  return request({
    url: attendanceApi.queryUnarchivedAttendanceArchivePage,
    method: 'post',
    data,
    ...config
  })
}

export function batchCreateAttendanceArchiveByDefault(data, config = {}) {
  return request({
    url: attendanceApi.batchCreateAttendanceArchiveByDefault,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceShiftList(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceShiftList,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceShiftDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceShiftDetail,
    method: 'post',
    data,
    ...config
  })
}

export function queryScheduleHorizontalPage(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleHorizontalPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryScheduleUnscheduledPage(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleUnscheduledPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryScheduleDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleDetail,
    method: 'post',
    data,
    ...config
  })
}

export function submitScheduleDetailUpdate(data, config = {}) {
  return request({
    url: attendanceApi.submitScheduleDetailUpdate,
    method: 'post',
    data,
    ...config
  })
}

export function submitScheduleSwap(data, config = {}) {
  return request({
    url: attendanceApi.submitScheduleSwap,
    method: 'post',
    data,
    ...config
  })
}

export function queryScheduleSwapPage(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleSwapPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryScheduleSwapDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleSwapDetail,
    method: 'post',
    data,
    ...config
  })
}

export function queryScheduleWizardMemberPage(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleWizardMemberPage,
    method: 'post',
    data,
    ...config
  })
}

export function submitScheduleWizard(data, config = {}) {
  return request({
    url: attendanceApi.submitScheduleWizard,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceRotationRuleList(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceRotationRuleList,
    method: 'post',
    data,
    ...config
  })
}
