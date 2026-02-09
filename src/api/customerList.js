import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'

export function queryIndustryTag(data) {
  return request({
    url: ipServiceApi.queryIndustryTag,
    method: 'post',
    data
  })
}
export function queryHehuoren(data) {
  return request({
    url: ipServiceApi.queryHehuoren,
    method: 'post',
    data
  })
}
export function delCustContactDoc(data) {
  return request({
    url: serviceApi.delCustContactDoc,
    method: 'post',
    data
  })
}
export function mergeCustomer(data) {
  return request({
    url: serviceApi.mergeCustomer,
    method: 'post',
    data
  })
}
export function getBusinessUser(data) {
  return request({
    url: serviceApi.getBusinessUser,
    method: 'post',
    data
  })
}
export function stopCustomerContact(data) {
  return request({
    url: serviceApi.stopCustomerContact,
    method: 'post',
    data
  })
}
export function delColAgencyInfo(data) {
  return request({
    url: serviceApi.delColAgencyInfo,
    method: 'post',
    data
  })
}
export function updateCasePinpai(data) {
  return request({
    url: serviceApi.updateCasePinpai,
    method: 'post',
    data
  })
}
export function delCustomerPinpai(data) {
  return request({
    url: serviceApi.delCustomerPinpai,
    method: 'post',
    data
  })
}
export function updateCustomerPinpai(data) {
  return request({
    url: serviceApi.updateCustomerPinpai,
    method: 'post',
    data
  })
}
export function addCustomerPinpai(data) {
  return request({
    url: serviceApi.addCustomerPinpai,
    method: 'post',
    data
  })
}
export function saveCustomerPinpai(data) {
  return request({
    url: serviceApi.saveCustomerPinpai,
    method: 'post',
    data
  })
}
export function queryCustomerPinpai(data) {
  return request({
    url: serviceApi.queryCustomerPinpai,
    method: 'post',
    data
  })
}
export function addColAgencyInfo(data) {
  return request({
    url: serviceApi.addColAgencyInfo,
    method: 'post',
    data
  })
}
export function updateColAgencyInfo(data) {
  return request({
    url: serviceApi.updateColAgencyInfo,
    method: 'post',
    data
  })
}
export function queryColAgencyInfo(data) {
  return request({
    url: serviceApi.queryColAgencyInfo,
    method: 'post',
    data
  })
}
export function queryColAgency(data) {
  return request({
    url: serviceApi.queryColAgency,
    method: 'post',
    data
  })
}
export function queryColAgencyList(data) {
  return request({
    url: serviceApi.queryColAgencyList,
    method: 'post',
    data
  })
}
export function queryColAgencyItemList(data) {
  return request({
    url: serviceApi.queryColAgencyItemList,
    method: 'post',
    data
  })
}
export function exportColAgencyItemList(data) {
  return request({
    url: serviceApi.exportColAgencyItemList,
    method: 'post',
    data
  })
}
export function queryBillStyle(data) {
  return request({
    url: serviceApi.queryBillStyle,
    method: 'post',
    data
  })
}
export function fetchList(data,config = {}) {
  return request({
    url: serviceApi.queryCustomerList,
    method: 'post',
    data,
    ...config
  })
}
export function queryShuomingshu(data) {
  return request({
    url: ipServiceApi.queryShuomingshu,
    method: 'post',
    data,
    isLoading: false
  })
}
export function delCustomer(data) {
  return request({
    url: serviceApi.delCustomer,
    method: 'post',
    data
  })
}
export function addCustomer(data) {
  return request({
    url: serviceApi.addCustomer,
    method: 'post',
    data
  })
}
export function deleteCustomerIcon(data) {
  return request({
    url: serviceApi.deleteCustomerIcon,
    method: 'post',
    data
  })
}
export function deleteCustomerContactIcon(data) {
  return request({
    url: serviceApi.deleteCustomerContactIcon,
    method: 'post',
    data
  })
}
export function querycustSelectClass(data) {
  return request({
    url: serviceApi.querycustSelectClass,
    method: 'get',
    params: data
  })
}
export function queryBillAndCase(data) {
  return request({
    url: serviceApi.queryBillAndCase,
    method: 'post',
    params: data,
    isLoading: true
  })
}
export function queryTotalBillAndCase(data) {
  return request({
    url: serviceApi.queryTotalBillAndCase,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryBillGroupbyCaseType(data) {
  return request({
    url: serviceApi.queryBillGroupbyCaseType,
    method: 'post',
    params: data,
    isLoading: true
  })
}
export function queryBillGroupbyDomain(data) {
  return request({
    url: serviceApi.queryBillGroupbyDomain,
    method: 'post',
    params: data,
    isLoading: true
  })
}
export function queryCustGroup(data) {
  return request({
    url: serviceApi.queryCustGroup,
    method: 'post',
    params: data
  })
}
export function delCustomerFenpei(data) {
  return request({
    url: serviceApi.delCustomerFenpei,
    method: 'post',
    params: data
  })
}
export function addFenpeiForResponsible(data) {
  return request({
    url: serviceApi.addFenpeiForResponsible,
    method: 'post',
    params: data
  })
}
export function getAllPanelsUrl(data) {
  return request({
    url: serviceApi.getAllPanelsUrl,
    method: 'post',
    data: data
  })
}
export function delCustomerStatisticsPanelConfig(data) {
  return request({
    url: serviceApi.delCustomerStatisticsPanelConfig,
    method: 'post',
    data: data
  })
}
export function getChartDataUrl(data) {
  return request({
    url: serviceApi.getChartDataUrl,
    method: 'post',
    data: data,
    isLoading: false
  })
}
export function addCustomerStatisticsPanelConfig(data) {
  return request({
    url: serviceApi.addCustomerStatisticsPanelConfig,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function queryWarningList(data) {
  return request({
    url: serviceApi.queryWarningList,
    method: 'post',
    data: data,
  })
}
export function addCustomerJituan(data) {
  return request({
    url: serviceApi.addCustomerJituan,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function queryCustomerJituanById(data) {
  return request({
    url: serviceApi.queryCustomerJituanById,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function delCustomerJituan(data) {
  return request({
    url: serviceApi.delCustomerJituan,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function updateCustomerJituanById(data) {
  return request({
    url: serviceApi.updateCustomerJituanById,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function queryNewCustYejiDetail(data) {
  return request({
    url: serviceApi.queryNewCustYejiDetail,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function getInfoData(data) {
  return request({
    url: serviceApi.getInfoData,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function getPropertyPreferenceUrl(data) {
  return request({
    url: serviceApi.getPropertyPreferenceUrl,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function queryFilterConfigUrl(data) {
  return request({
    url: serviceApi.queryFilterConfigUrl,
    method: 'post',
    data: data,
    isLoading: false
  })
}
export function configFilterUrl(data) {
  return request({
    url: serviceApi.configFilterUrl,
    method: 'post',
    data: data,
    isLoading: false
  })
}
export function queryFilterUrl(data) {
  return request({
    url: serviceApi.queryFilterUrl,
    method: 'post',
    data: data,
    isLoading: false
  })
}
export function queryPanelTab(data) {
  return request({
    url: serviceApi.queryPanelTab,
    method: 'post',
    data: data,
    isLoading: false
  })
}
export function getAllgraph(data) {
  return request({
    url: serviceApi.getAllgraph,
    method: 'post',
    data: data,
    isLoading: false
  })
}
export function queryCustomerStatisticsPanel(data) {
  return request({
    url: serviceApi.queryCustomerStatisticsPanel,
    method: 'post',
    data: data,
    isLoading: true
  })
}
export function hideShowUserPanelUrl(data) {
  return request({
    url: serviceApi.hideShowUserPanelUrl,
    method: 'post',
    data: data
  })
}
export function queryDetailByUserId(data) {
  return request({
    url: serviceApi.queryDetailByUserId,
    method: 'post',
    data
  })
}
export function saveFenpeiForResponsible(data) {
  return request({
    url: serviceApi.saveFenpeiForResponsible,
    method: 'post',
    data
  })
}
export function queryTongjiForResponsible(data) {
  return request({
    url: serviceApi.queryTongjiForResponsible,
    method: 'post',
    data
  })
}
export function updateFenpeiForResponsible(data) {
  return request({
    url: serviceApi.updateFenpeiForResponsible,
    method: 'post',
    data
  })
}
export function delFenpeiForResponsible(data) {
  return request({
    url: serviceApi.delFenpeiForResponsible,
    method: 'post',
    data
  })
}
export function queryFenpeiForResponsible(data) {
  return request({
    url: serviceApi.queryFenpeiForResponsible,
    method: 'post',
    data
  })
}
export function queryPerformanceDetailByWkgId(data) {
  return request({
    url: serviceApi.queryPerformanceDetailByWkgId,
    method: 'post',
    data
  })
}
export function updateCustomerFenpeiById(data) {
  return request({
    url: serviceApi.updateCustomerFenpeiById,
    method: 'post',
    data
  })
}
export function queryPerformanceByWkgId(data) {
  return request({
    url: serviceApi.queryPerformanceByWkgId,
    method: 'post',
    data: data
  })
}
export function addCustomerFenpei(data) {
  return request({
    url: serviceApi.addCustomerFenpei,
    method: 'post',
    params: data
  })
}
export function saveCustomerFenpei(data) {
  return request({
    url: serviceApi.saveCustomerFenpei,
    method: 'post',
    data: data
  })
}
export function saveCustomerYuce(data) {
  return request({
    url: serviceApi.saveCustomerYuce,
    method: 'post',
    data: data
  })
}
export function queryResopnseDomainList(data) {
  return request({
    url: serviceApi.queryResopnseDomainList,
    method: 'post',
    data: data
  })
}
export function queryCustomerFenzhiLianxiByCustfzId(data) {
  return request({
    url: serviceApi.queryCustomerFenzhiLianxiByCustfzId,
    method: 'post',
    data: data
  })
}
export function saveCustomerFenzhi(data) {
  return request({
    url: serviceApi.saveCustomerFenzhi,
    method: 'post',
    data: data
  })
}
export function queryDomainList(data) {
  return request({
    url: serviceApi.queryDomainList,
    method: 'post',
    data: data
  })
}
export function queryCustomerFenpei(data) {
  return request({
    url: serviceApi.queryCustomerFenpei,
    method: 'get',
    params: data
  })
}
export function queryFiliale(data) {
  return request({
    url: serviceApi.queryFiliale,
    method: 'get',
    params: data
  })
}
export function queryCustomerNameId(data) {
  return request({
    url: serviceApi.queryCustomerNameId,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryIncomeByYear(data) {
  return request({
    url: serviceApi.queryIncomeByYear,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryExpectIncomeByMonth(data) {
  return request({
    url: serviceApi.queryExpectIncomeByMonth,
    method: 'get',
    params: data
  })
}
export function queryIncomeByMonth(data) {
  return request({
    url: serviceApi.queryIncomeByMonth,
    method: 'get',
    params: data
  })
}
export function queryGroupIncomeByMonth(data) {
  return request({
    url: serviceApi.queryGroupIncomeByMonth,
    method: 'get',
    params: data
  })
}

export function queryGroupExpectIncomeByMonth(data) {
  return request({
    url: serviceApi.queryGroupExpectIncomeByMonth,
    method: 'get',
    params: data
  })
}
export function queryGroupIncomeByYear(data) {
  return request({
    url: serviceApi.queryGroupIncomeByYear,
    method: 'get',
    params: data
  })
}
export function CustomerExamineUrl(data) {
  return request({
    url: serviceApi.CustomerExamineUrl,
    method: 'get',
    params: data
  })
}
export function queryAppInfoUrl(data) {
  return request({
    url: serviceApi.queryAppInfoUrl,
    method: 'post',
    data
  })
}
export function queryOtherCustomerListUrl(data) {
  return request({
    url: serviceApi.queryOtherCustomerListUrl,
    method: 'post',
    data
  })
}
export function queryAgencyContactListUrl(data) {
  return request({
    url: serviceApi.queryAgencyContactListUrl,
    method: 'post',
    data
  })
}
export function selecttrademarkUrl(data) {
  return request({
    url: serviceApi.selecttrademarkUrl,
    method: 'post',
    data
  })
}
export function topCustomerRequirement(data) {
  return request({
    url: serviceApi.topCustomerRequirement,
    method: 'post',
    data
  })
}
export function queryCustomerRequirementBycustIdUrl(data) {
  return request({
    url: serviceApi.queryCustomerRequirementBycustIdUrl,
    method: 'post',
    data
  })
}
export function tmdetailsearUrl(data) {
  return request({
    url: serviceApi.tmdetailsearUrl,
    method: 'post',
    data
  })
}
export function searchTmUrl(data) {
  return request({
    url: serviceApi.searchTmUrl,
    method: 'post',
    data
  })
}
export function queryChargeItemUrl(data) {
  return request({
    url: serviceApi.queryChargeItemUrl,
    method: 'post',
    data
  })
}
export function tmdetailUrl(data) {
  return request({
    url: serviceApi.tmdetailUrl,
    method: 'post',
    data
  })
}
export function querytmchangeUrl(data) {
  return request({
    url: serviceApi.querytmchangeUrl,
    method: 'post',
    data
  })
}
export function querytmxuzhanUrl(data) {
  return request({
    url: serviceApi.querytmxuzhanUrl,
    method: 'post',
    data
  })
}
export function searchtmdataUrl(data) {
  return request({
    url: serviceApi.searchtmdataUrl,
    method: 'post',
    data
  })
}
export function queryUserByPermissionId(data) {
  return request({
    url: serviceApi.queryUserByPermissionId,
    method: 'get',
    params: data
  })
}
export function queryCountry(data) {
  return request({
    url: serviceApi.queryCountry,
    method: 'get',
    params: data
  })
}
export function queryCustomerContactCustIdUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactCustIdUrl,
    method: 'get',
    params: data
  })
}
export function addCustomerAddrUrl(data) {
  return request({
    url: serviceApi.addCustomerAddrUrl,
    method: 'post',
    data
  })
}
export function queryCustomerAddrAll(data) {
  return request({
    url: serviceApi.queryCustomerAddrAll,
    method: 'post',
    data
  })
}
export function updateCustomerAddrUrl(data) {
  return request({
    url: serviceApi.updateCustomerAddrUrl,
    method: 'post',
    data
  })
}
export function delCustomerAddrUrl(data) {
  return request({
    url: serviceApi.delCustomerAddrUrl,
    method: 'post',
    data
  })
}
export function addCustomerContactUrl(data) {
  return request({
    url: serviceApi.addCustomerContactUrl,
    method: 'post',
    data
  })
}
export function updateCustomerContacturl(data) {
  return request({
    url: serviceApi.updateCustomerContacturl,
    method: 'post',
    data
  })
}
export function delCustomerContacturl(data) {
  return request({
    url: serviceApi.delCustomerContacturl,
    method: 'post',
    data
  })
}
export function queryCustomersUrl(data) {
  return request({
    url: serviceApi.queryCustomersUrl,
    method: 'post',
    data
  })
}
export function queryCustContactAllUrl(data) {
  return request({
    url: serviceApi.queryCustContactAllUrl,
    method: 'post',
    data
  })
}
export function queryUserNamesUrl(data) {
  return request({
    url: serviceApi.queryUserNamesUrl,
    method: 'post',
    data
  })
}
export function addActivityUrl(data) {
  return request({
    url: serviceApi.addActivityUrl,
    method: 'post',
    data
  })
}
export function delActivity(data) {
  return request({
    url: serviceApi.delActivity,
    method: 'post',
    data
  })
}
export function queryCustomerContactAgencyUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactAgencyUrl,
    method: 'post',
    data
  })
}
export function updateCustomerContactAgencyUrl(data) {
  return request({
    url: serviceApi.updateCustomerContactAgencyUrl,
    method: 'post',
    data
  })
}
export function delCustomerContactAgencyUrl(data) {
  return request({
    url: serviceApi.delCustomerContactAgencyUrl,
    method: 'post',
    data
  })
}
export function addCustomerContactAgencyUrl(data) {
  return request({
    url: serviceApi.addCustomerContactAgencyUrl,
    method: 'post',
    data
  })
}
export function queryActivityOneUrl(data) {
  return request({
    url: serviceApi.queryActivityOneUrl,
    method: 'post',
    data
  })
}
export function queryCustomerRequirementUrl(data) {
  return request({
    url: serviceApi.queryCustomerRequirementUrl,
    method: 'post',
    data
  })
}
export function queryAgencyContactUrl(data) {
  return request({
    url: serviceApi.queryAgencyContactUrl,
    method: 'post',
    data
  })
}
export function updateActivityUrl(data) {
  return request({
    url: serviceApi.updateActivityUrl,
    method: 'post',
    data
  })
}
export function queryCustomerAddrListUrl(data) {
  return request({
    url: serviceApi.queryCustomerAddrListUrl,
    method: 'post',
    data
  })
}
export function queryCaseTypeUrl(data) {
  return request({
    url: serviceApi.queryCaseTypeUrl,
    method: 'post',
    data
  })
}
export function queryCaseType(data) {
  return request({
    url: serviceApi.queryCaseType,
    method: 'post',
    data
  })
}
export function querywfUserNameUrl(data) {
  return request({
    url: serviceApi.querywfUserNameUrl,
    method: 'post',
    data
  })
}
export function allocationCustomerUrl(data) {
  return request({
    url: serviceApi.allocationCustomerUrl,
    method: 'post',
    data
  })
}
export function delAgencyContactUrl(data) {
  return request({
    url: serviceApi.delAgencyContactUrl,
    method: 'post',
    data
  })
}
export function updateAgencyContactUrl(data) {
  return request({
    url: serviceApi.updateAgencyContactUrl,
    method: 'post',
    data
  })
}
export function queryCustomerAddrUrl(data) {
  return request({
    url: serviceApi.queryCustomerAddrUrl,
    method: 'post',
    data
  })
}

export function queryCustomerReqTypeUrl(data) {
  return request({
    url: serviceApi.queryCustomerReqTypeUrl,
    method: 'get',
    params: data
  })
}
export function queryregCaseTypeUrl(data) {
  return request({
    url: serviceApi.queryregCaseTypeUrl,
    method: 'get',
    params: data
  })
}
export function queryCurrencyUrl(data) {
  return request({
    url: serviceApi.queryCurrencyUrl,
    method: 'get',
    params: data
  })
}
export function queryPayAcountUrl(data) {
  return request({
    url: serviceApi.queryPayAcountUrl,
    method: 'get',
    params: data
  })
}
export function addCustomerRequirementUrl(data) {
  return request({
    url: serviceApi.addCustomerRequirementUrl,
    method: 'post',
    data
  })
}
export function updateCustomerRequirementUrl(data) {
  return request({
    url: serviceApi.updateCustomerRequirementUrl,
    method: 'post',
    data
  })
}
export function delCustomerRequirementUrl(data) {
  return request({
    url: serviceApi.delCustomerRequirementUrl,
    method: 'post',
    data
  })
}
export function queryActivityListflUrl(data) {
  return request({
    url: serviceApi.queryActivityListflUrl,
    method: 'get',
    params: data
  })
}
export function queryCustomerNameIdUrl(data) {
  return request({
    url: serviceApi.queryCustomerNameIdUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryCountryUrl(data) {
  return request({
    url: serviceApi.queryCountryUrl,
    method: 'get',
    params: data
  })
}
export function queryIndustryUrl(data) {
  return request({
    url: serviceApi.queryIndustryUrl,
    method: 'get',
    params: data
  })
}
export function queryCustomerUrl(data) {
  return request({
    url: serviceApi.queryCustomerUrl,
    method: 'post',
    data
  })
}
export function queryCustomerByBillorCase(data) {
  return request({
    url: serviceApi.queryCustomerByBillorCase,
    method: 'post',
    data,
    loading:false
  })
}
export function queryCustomerYuceByCustId(data) {
  return request({
    url: serviceApi.queryCustomerYuceByCustId,
    method: 'post',
    data
  })
}
export function addCustomerYuce(data) {
  return request({
    url: serviceApi.addCustomerYuce,
    method: 'post',
    data
  })
}
export function updateCustomerYuceByCustId(data) {
  return request({
    url: serviceApi.updateCustomerYuceByCustId,
    method: 'post',
    data
  })
}
export function queryCustomerYuceById(data) {
  return request({
    url: serviceApi.queryCustomerYuceById,
    method: 'post',
    data
  })
}
export function updateCustomerYuceById(data) {
  return request({
    url: serviceApi.updateCustomerYuceById,
    method: 'post',
    data,
    isLoading: false
  })
}
export function delCustomerYuce(data) {
  return request({
    url: serviceApi.delCustomerYuce,
    method: 'post',
    data
  })
}
export function updateCustomerFenzhiById(data) {
  return request({
    url: serviceApi.updateCustomerFenzhiById,
    method: 'post',
    data
  })
}
export function delCustomerFenzhi(data) {
  return request({
    url: serviceApi.delCustomerFenzhi,
    method: 'post',
    data
  })
}
export function queryCustomerFenzhiById(data) {
  return request({
    url: serviceApi.queryCustomerFenzhiById,
    method: 'post',
    data
  })
}
export function addCustomerFenzhi(data) {
  return request({
    url: serviceApi.addCustomerFenzhi,
    method: 'post',
    data
  })
}
export function queryhuodongList(data) {
  return request({
    url: serviceApi.queryhuodongList,
    method: 'post',
    data
  })
}
export function queryCustInfo(data) {
  return request({
    url: serviceApi.queryCustInfo,
    method: 'post',
    data
  })
}
export function updateCustomerFenzhiLianxiById(data) {
  return request({
    url: serviceApi.updateCustomerFenzhiLianxiById,
    method: 'post',
    data
  })
}
export function queryCustomerFenpeiRecord(data) {
  return request({
    url: serviceApi.queryCustomerFenpeiRecord,
    method: 'post',
    data
  })
}
export function queryFenpeiRecordForResponsible(data) {
  return request({
    url: serviceApi.queryFenpeiRecordForResponsible,
    method: 'post',
    data
  })
}
export function queryResponsibleVersion(data) {
  return request({
    url: serviceApi.queryResponsibleVersion,
    method: 'post',
    data
  })
}
export function queryCustomerFenpeiVersion(data) {
  return request({
    url: serviceApi.queryCustomerFenpeiVersion,
    method: 'post',
    data
  })
}
export function delCustomerFenzhiLianxi(data) {
  return request({
    url: serviceApi.delCustomerFenzhiLianxi,
    method: 'post',
    data
  })
}
export function addCustomerFenzhiLianxi(data) {
  return request({
    url: serviceApi.addCustomerFenzhiLianxi,
    method: 'post',
    data
  })
}
export function queryCustomerFenzhiByCustId(data) {
  return request({
    url: serviceApi.queryCustomerFenzhiByCustId,
    method: 'post',
    data
  })
}
export function updateCustomerJiagouById(data) {
  return request({
    url: serviceApi.updateCustomerJiagouById,
    method: 'post',
    data
  })
}
export function delCustomerJiagou(data) {
  return request({
    url: serviceApi.delCustomerJiagou,
    method: 'post',
    data
  })
}
export function queryCustomerJiagouById(data) {
  return request({
    url: serviceApi.queryCustomerJiagouById,
    method: 'post',
    data
  })
}
export function addCustomerJiagou(data) {
  return request({
    url: serviceApi.addCustomerJiagou,
    method: 'post',
    data
  })
}
export function queryCustTree(data) {
  return request({
    url: serviceApi.queryCustTree,
    method: 'post',
    data
  })
}
export function queryConflicterListByCustId(data) {
  return request({
    url: serviceApi.queryConflicterListByCustId,
    method: 'post',
    data
  })
}
export function queryPerformanceDetailByUserId(data) {
  return request({
    url: serviceApi.queryPerformanceDetailByUserId,
    method: 'post',
    data
  })
}
export function queryUserPerformance(data) {
  return request({
    url: serviceApi.queryUserPerformance,
    method: 'post',
    data
  })
}
export function queryCustomerTask(data) {
  return request({
    url: serviceApi.queryCustomerTask,
    method: 'post',
    data
  })
}
export function customerSubmit(data) {
  return request({
    url: serviceApi.customerSubmit,
    method: 'post',
    data
  })
}
export function downloadMonitorResultExcel(data) {
  return request({
    url: serviceApi.downloadMonitorResultExcel,
    method: 'post',
    data
  })
}
export function queryMonitorResult(data) {
  return request({
    url: serviceApi.queryMonitorResult,
    method: 'post',
    data
  })
}
export function customerExamine(data) {
  return request({
    url: serviceApi.customerExamine,
    method: 'post',
    data
  })
}
export function getLogInfo(data) {
  return request({
    url: serviceApi.getLogInfo,
    method: 'post',
    data
  })
}
export function queryConflicterListByCustIdNew(data) {
  return request({
    url: serviceApi.queryConflicterListByCustIdNew,
    method: 'post',
    data
  })
}
export function queryCustomerJituanList(data) {
  return request({
    url: serviceApi.queryCustomerJituanList,
    method: 'post',
    data
  })
}
export function addCustomerConflicterNew(data) {
  return request({
    url: serviceApi.addCustomerConflicterNew,
    method: 'post',
    data
  })
}
export function updateCustomerConflicterNew(data) {
  return request({
    url: serviceApi.updateCustomerConflicterNew,
    method: 'post',
    data
  })
}
export function queryCustomerIndustry(data) {
  return request({
    url: serviceApi.queryCustomerIndustry,
    method: 'post',
    data
  })
}
export function updateCustomerIndustry(data) {
  return request({
    url: serviceApi.updateCustomerIndustry,
    method: 'post',
    data
  })
}
export function delCustomerIndustry(data) {
  return request({
    url: serviceApi.delCustomerIndustry,
    method: 'post',
    data
  })
}
export function addCustomerIndustry(data) {
  return request({
    url: serviceApi.addCustomerIndustry,
    method: 'post',
    data
  })
}
export function queryCustKuaijieCounts(data) {
  return request({
    url: serviceApi.queryCustKuaijieCounts,
    method: 'post',
    data,
    isLoading: false
  })
}
export function addCustomerConflicter(data) {
  return request({
    url: serviceApi.addCustomerConflicter,
    method: 'post',
    data
  })
}
export function delCustomerConflicter(data) {
  return request({
    url: serviceApi.delCustomerConflicter,
    method: 'post',
    data
  })
}
export function queryCustomerAssociate(data) {
  return request({
    url: serviceApi.queryCustomerAssociate,
    method: 'post',
    data
  })
}
export function delCustomerAssociate(data) {
  return request({
    url: serviceApi.delCustomerAssociate,
    method: 'post',
    data
  })
}
export function updateCustomerAssociate(data) {
  return request({
    url: serviceApi.updateCustomerAssociate,
    method: 'post',
    data
  })
}
export function addCustomerAssociate(data) {
  return request({
    url: serviceApi.addCustomerAssociate,
    method: 'post',
    data
  })
}
export function queryCustStatistics(data) {
  return request({
    url: serviceApi.queryCustStatistics,
    method: 'post',
    data
  })
}
export function queryWarningStatistics(data) {
  return request({
    url: serviceApi.queryWarningStatistics,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCustAndFenzhiInfo(data) {
  return request({
    url: serviceApi.queryCustAndFenzhiInfo,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCustContactTree(data) {
  return request({
    url: serviceApi.queryCustContactTree,
    method: 'post',
    data
  })
}
export function updateCustomerNew(data) {
  return request({
    url: serviceApi.updateCustomerNew,
    method: 'post',
    data
  })
}
export function updateCustomerUrl(data) {
  return request({
    url: serviceApi.updateCustomerUrl,
    method: 'post',
    data
  })
}
export function updateLevelUrl(data) {
  return request({
    url: serviceApi.updateLevelUrl,
    method: 'post',
    data
  })
}
export function queryCustomerContactListUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactListUrl,
    method: 'post',
    data
  })
}
export function queryCustomerContactUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactUrl,
    method: 'post',
    data
  })
}
export function queryActivityListUrl(data) {
  return request({
    url: serviceApi.queryActivityListUrl,
    method: 'post',
    data
  })
}
export function queryCaseByUserUrl(data) {
  return request({
    url: serviceApi.queryCaseByUserUrl,
    method: 'post',
    data
  })
}
export function queryCustomerConflicterUrl(data) {
  return request({
    url: serviceApi.queryCustomerConflicterUrl,
    method: 'post',
    data
  })
}
export function delConflicterUrl(data) {
  return request({
    url: serviceApi.delConflicterUrl,
    method: 'post',
    data
  })
}
export function updateCustomerConflicterUrl(data) {
  return request({
    url: serviceApi.updateCustomerConflicterUrl,
    method: 'post',
    data
  })
}
export function addConflicterUrl(data) {
  return request({
    url: serviceApi.addConflicterUrl,
    method: 'post',
    data
  })
}
export function addBankaccountUrl(data) {
  return request({
    url: serviceApi.addBankaccountUrl,
    method: 'post',
    data
  })
}
export function updateBankaccountUrl(data) {
  return request({
    url: serviceApi.updateBankaccountUrl,
    method: 'post',
    data
  })
}
export function delBankaccountUrl(data) {
  return request({
    url: serviceApi.delBankaccountUrl,
    method: 'post',
    data
  })
}
export function querylyctListUrl(data) {
  return request({
    url: serviceApi.querylyctListUrl,
    method: 'post',
    data
  })
}
export function tmdetailUrl3(data) {
  return request({
    url: serviceApi.tmdetailUrl3,
    method: 'post',
    data
  })
}
export function delCustomerReqDoc(data) {
  return request({
    url: serviceApi.delCustomerReqDoc,
    method: 'post',
    data
  })
}
export function delActivityFile(data) {
  return request({
    url: ipServiceApi.delActivityFile,
    method: 'post',
    data
  })
}
export function delCustomerFile(data) {
  return request({
    url: serviceApi.delCustomerFile,
    method: 'post',
    data
  })
}
export function deleteMaterial(data) {
  return request({
    url: serviceApi.deleteMaterial,
    method: 'post',
    data
  })
}
export function queryZuoyeren(data) {
  return request({
    url: serviceApi.queryZuoyeren,
    method: 'post',
    data
  })
}
export function queryNewCustYeji(data) {
  return request({
    url: serviceApi.queryNewCustYeji,
    method: 'post',
    data
  })
}
export function queryDataForOneUser(data) {
  return request({
    url: serviceApi.queryDataForOneUser,
    method: 'post',
    data
  })
}
export function queryCustDetail(data) {
  return request({
    url: serviceApi.queryCustDetail,
    method: 'post',
    data
  })
}
export function queryContactByName(data) {
  return request({
    url: serviceApi.queryContactByName,
    method: 'post',
    data
  })
}
export function queryBusinessAreaUrl(data) {
  return request({
    url: serviceApi.queryBusinessAreaUrl,
    method: 'post',
    data
  })
}
export function queryIncomeByYearAndMonth(data) {
  return request({
    url: serviceApi.queryIncomeByYearAndMonth,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryCollaborationAll(data) {
  return request({
    url: serviceApi.queryCollaborationAll,
    method: 'post',
    data,
    isLoading:false
  })
}
export function getMatterList(data) {
  return request({
    url: serviceApi.getMatterList,
    method: 'post',
    data,
    isLoading:false
  })
}
export function createMatter(data) {
  return request({
    url: serviceApi.createMatter,
    method: 'post',
    data,
    isLoading:false
  })
}
export function updateMatter(data) {
  return request({
    url: serviceApi.updateMatter,
    method: 'post',
    data,
    isLoading:false
  })
}
export function deleteMatter(data) {
  return request({
    url: serviceApi.deleteMatter,
    method: 'post',
    data,
    isLoading:false
  })
}
export function getEventList(data) {
  return request({
    url: serviceApi.getEventList,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryCustEventDetail(data) {
  return request({
    url: serviceApi.queryCustEventDetail,
    method: 'post',
    data,
    isLoading:false
  })
}
export function getCompanyName(data) {
  return request({
    url: serviceApi.getCompanyName,
    method: 'post',
    data,
    isLoading:false
  })
}
export function createEvent(data) {
  return request({
    url: serviceApi.createEvent,
    method: 'post',
    data,
    isLoading:false
  })
}
export function updateEvent(data) {
  return request({
    url: serviceApi.updateEvent,
    method: 'post',
    data,
    isLoading:false
  })
}
export function deleteEvent(data) {
  return request({
    url: serviceApi.deleteEvent,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryCustCoverPage(data) {
  return request({
    url: serviceApi.queryCustCoverPage,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryCustomerListNew(data,config = {}) {
  return request({
    url: serviceApi.queryCustomerListNew,
    method: 'post',
    data,
    ...config
  })
}
export function addUserFollowCust(data) {
  return request({
    url: serviceApi.addUserFollowCust,
    method: 'post',
    data,
  })
}
export function delUserFollowCust(data) {
  return request({
    url: serviceApi.delUserFollowCust,
    method: 'post',
    data,
  })
}
export function addUserCustSort(data) {
  return request({
    url: serviceApi.addUserCustSort,
    method: 'post',
    data,
  })
}
