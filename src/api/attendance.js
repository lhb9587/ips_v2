import request from '@/utils/request'
import attendanceApi from '@/api/attendanceApi.config'
import { getToken } from '@/utils/auth'

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

export function queryAttendanceArchiveDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceArchiveDetail,
    method: 'post',
    data,
    ...config
  })
}

export function updateAttendanceArchive(data, config = {}) {
  return request({
    url: attendanceApi.updateAttendanceArchive,
    method: 'post',
    data,
    ...config
  })
}

export function deleteAttendanceArchive(data, config = {}) {
  return request({
    url: attendanceApi.deleteAttendanceArchive,
    method: 'post',
    data,
    ...config
  })
}

export function changeAttendanceArchiveStatus(data, config = {}) {
  return request({
    url: attendanceApi.changeAttendanceArchiveStatus,
    method: 'post',
    data,
    ...config
  })
}

export function batchAssignAttendanceArchive(data, config = {}) {
  return request({
    url: attendanceApi.batchAssignAttendanceArchive,
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

export function queryAttendanceArchiveHistoryPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceArchiveHistoryPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendancePunchRecordPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendancePunchRecordPage,
    method: 'post',
    data,
    ...config
  })
}

export function downloadAttendancePunchRecordImportTemplate(data, config = {}) {
  return request({
    url: attendanceApi.downloadAttendancePunchRecordImportTemplate,
    method: 'post',
    data,
    ...config
  })
}

export function importAttendancePunchRecord(data, config = {}) {
  return request({
    url: attendanceApi.importAttendancePunchRecord,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

export function queryAttendanceRecordPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceRecordPage,
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

export function queryScheduleVerticalPage(data, config = {}) {
  return request({
    url: attendanceApi.queryScheduleVerticalPage,
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

export function submitScheduleTimeRevision(data, config = {}) {
  return request({
    url: attendanceApi.submitScheduleTimeRevision,
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

export function queryAttendanceCalendarMonth(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalendarMonth,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalendarDayDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalendarDayDetail,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalcParams(data = {}, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalcParams,
    method: 'post',
    data,
    ...config
  })
}

export function initAttendanceCalcCycleState(data, config = {}) {
  return request({
    url: attendanceApi.initAttendanceCalcCycleState,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalcNotCalculatedPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalcNotCalculatedPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalcPendingPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalcPendingPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalcCalculatedPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalcCalculatedPage,
    method: 'post',
    data,
    ...config
  })
}

export function calculateAllAttendanceCalc(data, config = {}) {
  return request({
    url: attendanceApi.calculateAllAttendanceCalc,
    method: 'post',
    data,
    ...config
  })
}

export function calculateSelectedAttendanceCalc(data, config = {}) {
  return request({
    url: attendanceApi.calculateSelectedAttendanceCalc,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalcTaskPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalcTaskPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceCalcResultDetailPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceCalcResultDetailPage,
    method: 'post',
    data,
    ...config
  })
}

export function exportAttendanceCalcResult(data, config = {}) {
  return request({
    url: attendanceApi.exportAttendanceCalcResult,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceResultSummaryPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceResultSummaryPage,
    method: 'post',
    data,
    ...config
  })
}

export function exportAttendanceResultSummary(data, config = {}) {
  return request({
    url: attendanceApi.exportAttendanceResultSummary,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveReportSummaryPage(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveReportSummaryPage,
    method: 'post',
    data,
    ...config
  })
}

export function exportLeaveReportSummary(data, config = {}) {
  return request({
    url: attendanceApi.exportLeaveReportSummary,
    method: 'post',
    data,
    ...config
  })
}

export function queryCompOffDetailPage(data, config = {}) {
  return request({
    url: attendanceApi.queryCompOffDetailPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveRequestAdminPage(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveRequestAdminPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveRequestAdminDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveRequestAdminDetail,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveRequestSelfInit(data = {}, config = {}) {
  return request({
    url: attendanceApi.queryLeaveRequestSelfInit,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveRequestSelfCalcDuration(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveRequestSelfCalcDuration,
    method: 'post',
    data,
    ...config
  })
}

export function saveLeaveRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.saveLeaveRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveRequestSelfPage(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveRequestSelfPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryLeaveRequestSelfDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryLeaveRequestSelfDetail,
    method: 'post',
    data,
    ...config
  })
}

export function deleteLeaveRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.deleteLeaveRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function abandonLeaveRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.abandonLeaveRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function uploadCommonAttachment(data, config = {}) {
  return request({
    url: attendanceApi.uploadCommonAttachment,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params: {
      tokenID: getToken()
    },
    ...config
  })
}

export function directPassLeaveRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.directPassLeaveRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function reverseApproveLeaveRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.reverseApproveLeaveRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function abandonLeaveRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.abandonLeaveRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function exportLeaveRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.exportLeaveRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function queryOvertimeRequestAdminPage(data, config = {}) {
  return request({
    url: attendanceApi.queryOvertimeRequestAdminPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryOvertimeRequestAdminDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryOvertimeRequestAdminDetail,
    method: 'post',
    data,
    ...config
  })
}

export function directPassOvertimeRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.directPassOvertimeRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function reverseApproveOvertimeRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.reverseApproveOvertimeRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function abandonOvertimeRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.abandonOvertimeRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function exportOvertimeRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.exportOvertimeRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function queryOvertimeRequestSelfInit(data, config = {}) {
  return request({
    url: attendanceApi.queryOvertimeRequestSelfInit,
    method: 'post',
    data,
    ...config
  })
}

export function queryOvertimeRequestSelfCalcDuration(data, config = {}) {
  return request({
    url: attendanceApi.queryOvertimeRequestSelfCalcDuration,
    method: 'post',
    data,
    ...config
  })
}

export function saveOvertimeRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.saveOvertimeRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function queryOvertimeRequestSelfPage(data, config = {}) {
  return request({
    url: attendanceApi.queryOvertimeRequestSelfPage,
    method: 'post',
    data,
    ...config
  })
}

export function deleteOvertimeRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.deleteOvertimeRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function abandonOvertimeRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.abandonOvertimeRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function querySupplementRequestSelfInit(data = {}, config = {}) {
  return request({
    url: attendanceApi.querySupplementRequestSelfInit,
    method: 'post',
    data,
    ...config
  })
}

export function saveSupplementRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.saveSupplementRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function querySupplementRequestSelfPage(data, config = {}) {
  return request({
    url: attendanceApi.querySupplementRequestSelfPage,
    method: 'post',
    data,
    ...config
  })
}

export function querySupplementRequestAdminDetail(data, config = {}) {
  return request({
    url: attendanceApi.querySupplementRequestAdminDetail,
    method: 'post',
    data,
    ...config
  })
}

export function deleteSupplementRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.deleteSupplementRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function abandonSupplementRequestSelf(data, config = {}) {
  return request({
    url: attendanceApi.abandonSupplementRequestSelf,
    method: 'post',
    data,
    ...config
  })
}

export function querySupplementRequestAdminPage(data, config = {}) {
  return request({
    url: attendanceApi.querySupplementRequestAdminPage,
    method: 'post',
    data,
    ...config
  })
}

export function directPassSupplementRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.directPassSupplementRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function reverseApproveSupplementRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.reverseApproveSupplementRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function abandonSupplementRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.abandonSupplementRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function exportSupplementRequestAdmin(data, config = {}) {
  return request({
    url: attendanceApi.exportSupplementRequestAdmin,
    method: 'post',
    data,
    ...config
  })
}

export function queryApprovalCenterPage(data, config = {}) {
  return request({
    url: attendanceApi.queryApprovalCenterPage,
    method: 'post',
    data,
    ...config
  })
}

export function approveApprovalTask(data, config = {}) {
  return request({
    url: attendanceApi.approveApprovalTask,
    method: 'post',
    data,
    ...config
  })
}

export function rejectApprovalTask(data, config = {}) {
  return request({
    url: attendanceApi.rejectApprovalTask,
    method: 'post',
    data,
    ...config
  })
}
