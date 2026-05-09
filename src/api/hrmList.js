import request from '@/utils/request'
import ipServiceApi from '@/api/ipServiceApi.config.js'

export function queryTalentPersonList(data,config={}) {
  return request({
    url: ipServiceApi.queryTalentPersonList,
    method: 'post',
    data,
    ...config
  })
}

export function queryTalentPersonListNoPermission(data) {
  return request({
    url: ipServiceApi.queryTalentPersonListNoPermission,
    method: 'post',
    data
  })
}

export function queryPositions(data) {
  return request({
    url: ipServiceApi.queryPositions,
    method: 'post',
    data
  })
}

export function queryPersonAll(data) {
  return request({
    url: ipServiceApi.queryPersonAll,
    method: 'post',
    data
  })
}

export function queryPositionAll(data) {
  return request({
    url: ipServiceApi.queryPositionAll,
    method: 'post',
    data
  })
}

export function queryOrganizations(data) {
  return request({
    url: ipServiceApi.queryOrganizations,
    method: 'post',
    data
  })
}

export function queryOrganizationsChild(data) {
  return request({
    url: ipServiceApi.queryOrganizationsChild,
    method: 'post',
    data
  })
}

export function queryAttendanceArchivePage(data, config = {}) {
  return request({
    url: ipServiceApi.queryAttendanceArchivePage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupPage(data, config = {}) {
  return request({
    url: ipServiceApi.queryAttendanceGroupPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryUnarchivedAttendanceArchivePage(data, config = {}) {
  return request({
    url: ipServiceApi.queryUnarchivedAttendanceArchivePage,
    method: 'post',
    data,
    ...config
  })
}

export function batchCreateAttendanceArchiveByDefault(data, config = {}) {
  return request({
    url: ipServiceApi.batchCreateAttendanceArchiveByDefault,
    method: 'post',
    data,
    ...config
  })
}

export function queryUnAuditModifyRecordNum(data) {
  return request({
    url: ipServiceApi.queryUnAuditModifyRecordNum,
    method: 'post',
    data
  })
}

export function queryAuditList(data) {
  return request({
    url: ipServiceApi.queryModifyRecords,
    method: 'post',
    data
  })
}

export function auditModifyRecord(data) {
  return request({
    url: ipServiceApi.auditModifyRecord,
    method: 'post',
    data
  })
}

export function queryTalentPersonInfo(talentCode,config) {
  return request({
    url: ipServiceApi.queryTalentPersonInfo,
    method: 'post',
    data: { talentCode },
    ...config
  })
}

export function talentCreatematerialUrl(data) {
  return request({
    url: ipServiceApi.talentCreatematerialUrl,
    method: 'post',
    data
  })
}

export function delectTalentMaterial(data) {
  return request({
    url: ipServiceApi.delectTalentMaterial,
    method: 'post',
    data
  })
}

export function upsertTalentPersonInfo(data) {
  return request({
    url: ipServiceApi.upsertTalentPersonInfo,
    method: 'post',
    data
  })
}

export function deleteEvaluateMaterial(data) {
  return request({
    url: ipServiceApi.deleteEvaluateMaterial,
    method: 'post',
    data
  })
}

export function queryPermissionAll(data) {
  return request({
    url: ipServiceApi.queryPermissionAll,
    method: 'post',
    data
  })
}

export function queryPersonPermissions(userId) {
  return request({
    url: ipServiceApi.queryPersonPermissions,
    method: 'post',
    data:{userId}
  })
}

export function updatePersonPermission(data) {
  return request({
    url: ipServiceApi.updatePersonPermission,
    method: 'post',
    data
  })
}

export function updatePersonDeptPermission(data) {
  return request({
    url: ipServiceApi.updatePersonDeptPermission,
    method: 'post',
    data
  })
}

export function exportPersonListToExcel(data) {
  return request({
    url: ipServiceApi.exportPersonListToExcel,
    method: 'post',
    data
  })
}

export function statisticsTalentPersonAll(data) {
  return request({
    url: ipServiceApi.statisticsTalentPersonAll,
    method: 'post',
    data
  })
}

export function statisticsTalentPersonByBusiness(data) {
  return request({
    url: ipServiceApi.statisticsTalentPersonByBusiness,
    method: 'post',
    data
  })
}

export function statisticsTalentPersonForPatent(data) {
  return request({
    url: ipServiceApi.statisticsTalentPersonForPatent,
    method: 'post',
    data
  })
}

export function statisticsNewTalentPerson(data) {
  return request({
    url: ipServiceApi.statisticsNewTalentPerson,
    method: 'post',
    data
  })
}

export function statisticsQuitTalentPerson(data) {
  return request({
    url: ipServiceApi.statisticsQuitTalentPerson,
    method: 'post',
    data
  })
}

export function statisticsQuitTalentPersonByBusiness(data) {
  return request({
    url: ipServiceApi.statisticsQuitTalentPersonByBusiness,
    method: 'post',
    data
  })
}

export function talentClearCache(data) {
  return request({
    url: ipServiceApi.talentClearCache,
    method: 'post',
    data
  })
}
export function updatePersonSummary(data) {
  return request({
    url: ipServiceApi.updatePersonSummary,
    method: 'post',
    data
  })
}
export function exportPersonInfoListToExcel(data) {
  return request({
    url: ipServiceApi.exportPersonInfoListToExcel,
    method: 'post',
    data
  })
}
export function queryPersonPerformanceTemp(data) {
  return request({
    url: ipServiceApi.queryPersonPerformanceTemp,
    method: 'post',
    data
  })
}
export function upsertPersonPerformance(data) {
  return request({
    url: ipServiceApi.upsertPersonPerformance,
    method: 'post',
    data
  })
}
export function upsertPersonPerformanceTemp(data) {
  return request({
    url: ipServiceApi.upsertPersonPerformanceTemp,
    method: 'post',
    data
  })
}
export function deletePersonMaterial(data) {
  return request({
    url: ipServiceApi.deletePersonMaterial,
    method: 'post',
    data
  })
}
export function exportTalentPersonPerformance(data) {
  return request({
    url: ipServiceApi.exportTalentPersonPerformance,
    method: 'post',
    data
  })
}
export function queryPersonPerformanceCompare(data) {
  return request({
    url: ipServiceApi.queryPersonPerformanceCompare,
    method: 'post',
    data
  })
}
//查询审批流程项目列表
export function queryPersonApproveTypes(data) {
  return request({
    url: ipServiceApi.queryPersonApproveTypes,
    method: 'post',
    data
  })
}
//查询审批流程列表
export function queryPersonApproveList(data) {
  return request({
    url: ipServiceApi.queryPersonApproveList,
    method: 'post',
    data
  })
}
//查询审批流程信息
export function queryApproveProcess(data) {
  return request({
    url: ipServiceApi.queryApproveProcess,
    method: 'post',
    data
  })
}
//起草审批流程并创建审批项目
export function createApproveProcess(data) {
  return request({
    url: ipServiceApi.createApproveProcess,
    method: 'post',
    data
  })
}
//编辑审批流程并创建审批项目
export function saveApproveProcess(data) {
  return request({
    url: ipServiceApi.saveApproveProcess,
    method: 'post',
    data
  })
}
//删除审批流程
export function deletePersonApprove(data) {
  return request({
    url: ipServiceApi.deletePersonApprove,
    method: 'post',
    data
  })
}
//撤销审批流程
export function revokeApproveProcess(data) {
  return request({
    url: ipServiceApi.revokeApproveProcess,
    method: 'post',
    data
  })
}
//根据审批流程Id查询审批流程
export function queryApproveTaskRecord(data) {
  return request({
    url: ipServiceApi.queryApproveTaskRecord,
    method: 'post',
    data
  })
}
// 审批流程接口
export function auditPersonApprove(data) {
  return request({
    url: ipServiceApi.auditPersonApprove,
    method: 'post',
    data
  })
}
// 加签审批流程
export function countersignPersonApprove(data) {
  return request({
    url: ipServiceApi.countersignPersonApprove,
    method: 'post',
    data
  })
}
// 薪酬统计
export function querySalaryTongji(data) {
  return request({
    url: ipServiceApi.querySalaryTongji,
    method: 'post',
    data
  })
}
export function salaryTongjiDeriveList(data) {
  return request({
    url: ipServiceApi.salaryTongjiDeriveList,
    method: 'post',
    data
  })
}

// 月工资
export function queryTalentPersonSalaryInfo(data) {
  return request({
    url: ipServiceApi.queryTalentPersonSalaryInfo,
    method: 'post',
    data
  })
}
export function updateTalentPersonSalaryInfo(data) {
  return request({
    url: ipServiceApi.updateTalentPersonSalaryInfo,
    method: 'post',
    data
  })
}
export function deleteTalentPersonSalaryInfo(data) {
  return request({
    url: ipServiceApi.deleteTalentPersonSalaryInfo,
    method: 'post',
    data
  })
}
// 年终奖相关接口
export function queryTalentBonusInfo(data) {
  return request({
    url: ipServiceApi.queryTalentBonusInfo,
    method: 'post',
    data
  })
}
export function updateTalentBonusInfo(data) {
  return request({
    url: ipServiceApi.updateTalentBonusInfo,
    method: 'post',
    data
  })
}
export function deleteTalentBonusInfo(data) {
  return request({
    url: ipServiceApi.deleteTalentBonusInfo,
    method: 'post',
    data
  })
}
export function createPersonBonus(data) {
  return request({
    url: ipServiceApi.createPersonBonus,
    method: 'post',
    data
  })
}
// 年中奖相关接口
export function queryTalentWinningBonusInfo(data) {
  return request({
    url: ipServiceApi.queryTalentWinningBonusInfo,
    method: 'post',
    data
  })
}
export function updateTalentWinningBonusInfo(data) {
  return request({
    url: ipServiceApi.updateTalentWinningBonusInfo,
    method: 'post',
    data
  })
}
export function deleteTalentWinningBonusInfo(data) {
  return request({
    url: ipServiceApi.deleteTalentWinningBonusInfo,
    method: 'post',
    data
  })
}
// 备注信息相关接口
export function queryTalentPersonExtInfo(data) {
  return request({
    url: ipServiceApi.queryTalentPersonExtInfo,
    method: 'post',
    data
  })
}
export function updateTalentPersonExtInfo(data) {
  return request({
    url: ipServiceApi.updateTalentPersonExtInfo,
    method: 'post',
    data
  })
}
export function deleteTalentPersonExtInfo(data) {
  return request({
    url: ipServiceApi.deleteTalentPersonExtInfo,
    method: 'post',
    data
  })
}
// 合伙人奖金相关接口
export function queryPartnerBonusInfo(data) {
  return request({
    url: ipServiceApi.queryPartnerBonusInfo,
    method: 'post',
    data
  })
}
export function updatePartnerBonusInfo(data) {
  return request({
    url: ipServiceApi.updatePartnerBonusInfo,
    method: 'post',
    data
  })
}
export function deletePartnerBonusInfo(data) {
  return request({
    url: ipServiceApi.deletePartnerBonusInfo,
    method: 'post',
    data
  })
}
