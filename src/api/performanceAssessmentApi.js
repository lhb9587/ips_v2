import request from '@/utils/request'
import performanceAssessmentApi from '@/api/performanceAssessment.config.js'
/**
 * 绩效评估模块 API 服务
 */
// ==================== 个人绩效接口 ====================

/**
 * 获取可查看的年份列表
 * @param {Object} params - { userId?: string }
 */
export function getYears(params = {}) {
  return request({
    url: performanceAssessmentApi.getYears,
    method: 'post',
    data: params
  })
}

/**
 * 获取个人信息
 * @param {Object} params - { userId?: string, year?: number }
 */
export function getPersonalInfo(params = {}) {
  return request({
    url: performanceAssessmentApi.getPersonalInfo,
    method: 'post',
    data: params
  })
}

/**
 * 获取硬性指标数据
 * @param {Object} params - { userId?: string, year: number, type?: string }
 * @param {string} params.type - 卡片类型（可选），不传则返回账单金额、客户开发人、客户协调人的聚合数据
 */
export function getHardMetrics(params) {
  return request({
    url: performanceAssessmentApi.getHardMetrics,
    method: 'post',
    data: params
  })
}

/**
 * 获取软性指标数据
 * @param {Object} params - { userId?: string, year: number }
 */
export function getSoftMetrics(params) {
  return request({
    url: performanceAssessmentApi.getSoftMetrics,
    method: 'post',
    data: params
  })
}

// ==================== 软性指标接口 ====================

/**
 * 新增软性指标记录
 * @param {Object} data - { userId?: string, year: number, key: string, type?: string, content: string }
 */
export function createSoftMetricRecord(data) {
  return request({
    url: performanceAssessmentApi.createSoftMetricRecord,
    method: 'post',
    data
  })
}

/**
 * 更新软性指标记录
 * @param {string} recordId - 记录ID
 * @param {Object} data - { type?: string, content: string }
 */
export function updateSoftMetricRecord(recordId, data) {
  return request({
    url: performanceAssessmentApi.updateSoftMetricRecord.replace('{recordId}', recordId),
    method: 'post',
    data: { ...data, recordId }
  })
}

/**
 * 删除软性指标记录
 * @param {string} recordId - 记录ID
 */
export function deleteSoftMetricRecord(recordId) {
  return request({
    url: performanceAssessmentApi.deleteSoftMetricRecord.replace('{recordId}', recordId),
    method: 'post',
    data: { recordId }
  })
}

/**
 * 获取软性指标编辑权限或打分权限
 * @param {Object} params - { year: number, type?: number }
 * @param {number} params.type - 权限类型：1-软性指标编辑权限，2-打分权限
 */
export function getSoftMetricEditPermission(params) {
  return request({
    url: performanceAssessmentApi.getSoftMetricEditPermission,
    method: 'post',
    data: params,
    // 权限检查接口不显示错误 message
    showErrorMessage: false
  }).catch(error => {
    // 捕获错误但不抛出，返回一个失败的结果，不显示 message
    console.error('权限检查接口调用失败:', error);
    return Promise.resolve({
      success: false,
      message: error?.message || '权限检查失败',
      data: null
    });
  })
}

/**
 * 新增软性指标记录
 * @param {Object} data - { year: number, key: string, type: string, content: string, occurredDate?: string }
 */
export function addSoftMetricRecords(data) {
  return request({
    url: performanceAssessmentApi.addSoftMetricRecords,
    method: 'post',
    data
  })
}

/**
 * 更新软性指标记录
 * @param {Object} data - { id: string, year: number, key: string, type: string, content: string, occurredDate?: string }
 */
export function updateSoftMetricRecords(data) {
  return request({
    url: performanceAssessmentApi.updateSoftMetricRecords,
    method: 'post',
    data
  })
}

/**
 * 删除软性指标记录
 * @param {Object} data - { id: string }
 */
export function deleteSoftMetricRecords(data) {
  return request({
    url: performanceAssessmentApi.deleteSoftMetricRecords,
    method: 'post',
    data
  })
}

/**
 * 查询软性指标记录
 * @param {Object} params - { year: number, key: string, pageNo?: number, pageSize?: number }
 */
export function querySoftMetricRecords(params) {
  return request({
    url: performanceAssessmentApi.querySoftMetricRecords,
    method: 'post',
    data: params
  })
}

// ==================== 个人总结接口 ====================

/**
 * 获取个人总结
 * @param {Object} params - { userId?: string, year: number }
 */
export function getSummary(params) {
  return request({
    url: performanceAssessmentApi.getSummary,
    method: 'post',
    data: params
  })
}

/**
 * 查询个人总结
 * @param {Object} params - { year: number, userId?: string }
 */
export function querySummary(params) {
  return request({
    url: performanceAssessmentApi.querySummary,
    method: 'post',
    data: params
  })
}

/**
 * 新增个人总结
 * @param {Object} data - { year: number, plan?: string, suggestion?: string, other?: string }
 */
export function addSummary(data) {
  return request({
    url: performanceAssessmentApi.addSummary,
    method: 'post',
    data
  })
}

/**
 * 更新个人总结
 * @param {Object} data - { id: number, year: number, plan?: string, suggestion?: string, other?: string }
 */
export function upSummary(data) {
  return request({
    url: performanceAssessmentApi.upSummary,
    method: 'post',
    data
  })
}

// ==================== 打分接口 ====================
/**
 * 查询软性指标打分数据
 * @param {Object} params - { userId: string|number, year: number }
 * @returns {Promise} 返回打分数据，如果 data 为 null 则表示没有值，所有分数为 0
 */
export function querySoftmetrics(params) {
  return request({
    url: performanceAssessmentApi.querySoftmetrics,
    method: 'post',
    data: params
  })
}

/**
 * 保存软性指标打分
 * @param {Object} data - { userId: string|number, year: number, praise: number, team: number, outreach: number, publicity: number, company: number, department: number }
 */
export function addSoftmetrics(data) {
  return request({
    url: performanceAssessmentApi.addSoftmetrics,
    method: 'post',
    data
  })
}

/**
 * 更新软性指标打分
 * @param {Object} data - { id: string|number, userId: string|number, year: number, praise: number, team: number, outreach: number, publicity: number, company: number, department: number }
 */
export function upSoftmetrics(data) {
  return request({
    url: performanceAssessmentApi.upSoftmetrics,
    method: 'post',
    data
  })
}

// ==================== 合伙人分析接口 ====================

/**
 * 获取合伙人概览数据
 * @param {Object} params - { year: number, type?: string }
 * @param {string} params.type - 数据类型：'totalPartners' | 'totalRevenue' | 'totalcases' | 'avgAppearances'
 */
export function getPartnerOverview(params) {
  return request({
    url: performanceAssessmentApi.getPartnerOverview,
    method: 'post',
    data: params
  })
}

/**
 * 获取雷达图数据
 * @param {Object} params - { year: number, IndicatorsType: 'hard' | 'soft', department: string, partnerIds: string[] }
 */
export function getPartnerRadar(params) {
  return request({
    url: performanceAssessmentApi.getPartnerRadar,
    method: 'post',
    data: params
  })
}

/**
 * 获取部门和人员数据（用于雷达图筛选）
 * @param {Object} params - { year?: number }
 * @returns {Promise<{ success: boolean, data: { departments: Array<{ department: string, partners: Array<{ userId: string, name: string }> }> } }>}
 */
export function queryDepartment(params = {}) {
  return request({
    url: performanceAssessmentApi.queryDepartment,
    method: 'post',
    data: params
  })
}

/**
 * 获取排行数据
 * @param {Object} params - { year: number, type: 'revenue' | 'score' | 'appearances' }
 */
export function getPartnerRanking(params) {
  return request({
    url: performanceAssessmentApi.getPartnerRanking,
    method: 'post',
    data: params
  })
}

/**
 * 获取详细数据对比
 * @param {Object} params - { year: number, role: 'developer' | 'coordinator' | 'owner' | 'group' | 'undertaker' }
 */
/**
 * 获取详细数据对比表格
 * @param {Object} params - { year: number, role: 'developer' | 'coordinator' | 'owner' | 'group' | 'undertake' }
 */
export function getPartnerTable(params) {
  return request({
    url: performanceAssessmentApi.getPartnerTable,
    method: 'post',
    data: params
  })
}

// ==================== 团队评估接口 ====================

/**
 * 获取公共筛选条件选项
 * @param {Object} params - { year?: number }
 */
export function getCommonFilters(params = {}) {
  return request({
    url: performanceAssessmentApi.getCommonFilters,
    method: 'post',
    data: params
  })
}


/**
 * 获取筛选条件选项
 * @param {Object} params - { year?: number }
 */
export function getTeamFilters(params = {}) {
  return request({
    url: performanceAssessmentApi.getTeamFilters,
    method: 'post',
    data: params
  })
}

/**
 * 获取团队评估数据
 * @param {Object} params - { year: number, region?: string, department?: string, position?: string, field?: string }
 */
export function getTeamData(params) {
  return request({
    url: performanceAssessmentApi.getTeamData,
    method: 'post',
    data: params
  })
}

/**
 * 获取对比维度分组
 */
export function getTeamCompareGroups() {
  return request({
    url: performanceAssessmentApi.getTeamCompareGroups,
    method: 'post',
    data: {}
  })
}

// ==================== 悬浮框详细信息接口 ====================

/**
 * 获取悬浮框详细信息
 * @param {Object} params - { userId?: string, year: number, type: string, moduleType?: string, itemKey?: string }
 */
export function getPopoverDetail(params) {
  return request({
    url: performanceAssessmentApi.getPopoverDetail,
    method: 'post',
    data: params
  })
}

/**
 * 获取绩效分打分记录
 * @param {Object} params - { userId: string|number, year: number }
 */
export function getPerformanceRecords(params) {
  return request({
    url: performanceAssessmentApi.getPerformanceRecords,
    method: 'post',
    data: params
  })
}
