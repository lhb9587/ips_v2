// 绩效评估模块 API 配置
const PA_URL = '/ip_dashboard_performance/interface/performance-assessment'

const URL_Tem = {
  
  // 个人绩效接口
  getYears: PA_URL + '/years',
  getPersonalInfo: PA_URL + '/personal-info',
  getHardMetrics: PA_URL + '/hard-metrics',
  getSoftMetrics: PA_URL + '/soft-metrics',
  
  // 软性指标接口
  createSoftMetricRecord: PA_URL + '/soft-metrics/records',
  updateSoftMetricRecord: PA_URL + '/soft-metrics/records',
  deleteSoftMetricRecord: PA_URL + '/soft-metrics/records',
  getSoftMetricEditPermission: PA_URL + '/soft-metrics/edit-permission',
  querySoftMetricRecords: PA_URL + '/soft-metrics/queryRecords',
  addSoftMetricRecords: PA_URL + '/soft-metrics/addRecords',
  updateSoftMetricRecords: PA_URL + '/soft-metrics/upRecords',
  deleteSoftMetricRecords: PA_URL + '/soft-metrics/delRecords',
  
  // 个人总结接口
  getSummary: PA_URL + '/summary',
  querySummary: PA_URL + '/querySummary',
  addSummary: PA_URL + '/addSummary',
  upSummary: PA_URL + '/upSummary',
  
  // 打分接口
  querySoftmetrics: PA_URL + '/querSoftmetrics',
  addSoftmetrics: PA_URL + '/addSoftmetrics',
  upSoftmetrics: PA_URL + '/upSoftmetrics',
  
  // 合伙人分析接口
  getPartnerOverview: PA_URL + '/partner/overview',
  getPartnerRadar: PA_URL + '/partner/radar',
  getPartnerRanking: PA_URL + '/partner/ranking',
  getPartnerTable: PA_URL + '/partner/table',
  queryDepartment: PA_URL + '/queryDepartment',
  
  // 公共筛选接口
  getCommonFilters: PA_URL + '/common/filters',

  // 团队评估接口
  getTeamFilters: PA_URL + '/team/filters',
  getTeamData: PA_URL + '/team/data',
  getTeamCompareGroups: PA_URL + '/team/compare-groups',
  
  // 悬浮框详细信息接口
  getPopoverDetail: PA_URL + '/popover/detail',
  getPerformanceRecords: PA_URL + '/popover/performance-records',
}

module.exports = URL_Tem
