import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

// 中断请求-->
import axios from 'axios'
var cancelObjc = {}
export function cancelrequest(cancelUrl) {
  if (cancelUrl === 'all') {
    for (const key in cancelObjc) {
      if ( key in cancelObjc) {
        if (cancelObjc[key]) {
          cancelObjc[key].cancel()
          delete cancelObjc[key]
        }
      }
    }
  } else {
    if (cancelObjc[cancelUrl]) {
      cancelObjc[cancelUrl].cancel()
      delete cancelObjc[cancelUrl]
    }
  }
}

// <--中断请求
export function fetchList(data) {
  return request({
    url: serviceApi.queryBillListUrl,
    method: 'post',
    cancelToken: new axios.CancelToken(cancel => { // 需中断请求必须以函数名为key存入cancel
      cancelObjc['fetchList'] = {
        cancel
      }
    }),
    data
  })
}
export function menusUrl(data) {
  return request({
    url: serviceApi.menusUrl,
    method: 'post',
    data
  })
}
export function statsUrl(data) {
  return request({
    url: serviceApi.statsUrl,
    method: 'post',
    data
  })
}
export function getAllPanels(data) {
  return request({
    url: serviceApi.getAllPanels,
    method: 'post',
    data
  })
}
export function hideShowUserPanel(data) {
  return request({
    url: serviceApi.hideShowUserPanel,
    method: 'post',
    data
  })
}
export function getChartData(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.getChartData,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryFilterConfig(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.queryConfigFilter,
    method: 'post',
    data
  })
}
export function addFilterScheme(data){
  data = panelIdInspect(data)
  return request({
    url: serviceApi.addFilterScheme,
    method: 'post',
    data,
    isLoading: false
  })
}
export function getFilterScheme(data){
  data = panelIdInspect(data)
  return request({
    url: serviceApi.getFilterScheme,
    method: 'post',
    data,
    isLoading: false
  })
}
export function deleteFilterScheme(data){
  data = panelIdInspect(data)
  return request({
    url: serviceApi.deleteFilterScheme,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryFilter(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.queryFilter1,
    method: 'post',
    data
  })
}
export function configFilter(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.configFilter1,
    method: 'post',
    data
  })
}
export function selectColumn(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.getStatisticsProperty,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryPreference(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.getPropertyPreference,
    method: 'post',
    data,
    isLoading: false
  })
}
export function delPreference(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.deletePropertyPreference,
    method: 'post',
    data
  })
}
export function savePreference(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.savePropertyPreference,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryChartDateItems(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.queryChartDateItems,
    method: 'post',
    data,
    isLoading: false
  })
}
export function exportChartDataItems(data) {
  data = panelIdInspect(data)
  return request({
    url: serviceApi.exportChartDataItems,
    method: 'post',
    data
  })
}
export function exportChartPDF(data) {
  return request({
    url: serviceApi.exportChartPDF,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export function exportNewChartPPt(data) {
  return request({
    url: serviceApi.exportNewChartPPt,
    method: 'post',
    data
  })
}
export function exportChartPPt(data) {
  return request({
    url: serviceApi.exportChartPPt,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export function queryCustomList(data) {
  return request({
    url: serviceApi.queryCustomList,
    method: 'post',
    data
  })
}
export function createAndModify(data) {
  return request({
    url: serviceApi.createAndModify,
    method: 'post',
    data
  })
}

// 针对自定义图表下钻处理
function panelIdInspect(data) {
  if ('panelId' in data) {
    data.panelId = data.panelId > 10000 ? data.panelId - 10000 : data.panelId
  }
  return data
}

// 合伙人周报
export function queryReportList(data) {
  return request({
    url: serviceApi.queryReportList,
    method: 'post',
    data
  })
}
// 合伙人周报
export function queryReportDetail(data) {
  return request({
    url: serviceApi.queryReportDetail,
    method: 'post',
    data
  })
}
// 快讯
export function queryWeekReportDoc(data) {
  return request({
    url: serviceApi.queryWeekReportDoc,
    method: 'post',
    data
  })
}
// 快讯
export function createWeekReportDoc(data) {
  return request({
    url: serviceApi.createWeekReportDoc,
    method: 'post',
    data
  })
}
// 手动打分
export function manualScoring(data) {
  return request({
    url: serviceApi.manualScoring,
    method: 'post',
    data
  })
}

// 律所绩效
export function queryJixiao(data) {
  return request({
    url: serviceApi.queryJixiao,
    method: 'post',
    data
  })
}
export function queryJixiaoRule(data) {
  return request({
    url: serviceApi.queryJixiaoRule,
    method: 'post',
    data
  })
}
export function modifyJixiaoRule(data) {
  return request({
    url: serviceApi.modifyJixiaoRule,
    method: 'post',
    data
  })
}

export function queryCaidingList(data) {
  return request({
    url: serviceApi.queryCaidingList,
    method: 'post',
    data
  })
}
export function createCaiding(data) {
  return request({
    url: serviceApi.createCaiding,
    method: 'post',
    data
  })
}
export function updateCaiding(data) {
  return request({
    url: serviceApi.updateCaiding,
    method: 'post',
    data
  })
}
export function delCaiding(data) {
  return request({
    url: serviceApi.delCaiding,
    method: 'post',
    data
  })
}
export function queryRongyuList(data) {
  return request({
    url: serviceApi.queryRongyuList,
    method: 'post',
    data
  })
}
export function createRongyu(data) {
  return request({
    url: serviceApi.createRongyu,
    method: 'post',
    data
  })
}
export function updateRongyu(data) {
  return request({
    url: serviceApi.updateRongyu,
    method: 'post',
    data
  })
}
export function delRongyu(data) {
  return request({
    url: serviceApi.delRongyu,
    method: 'post',
    data
  })
}
export function queryNeibuGuanliList(data) {
  return request({
    url: serviceApi.queryNeibuGuanliList,
    method: 'post',
    data
  })
}
export function queryNeibuGuanliInfo(data) {
  return request({
    url: serviceApi.queryNeibuGuanliInfo,
    method: 'post',
    data
  })
}
export function createNeibuGuanli(data) {
  return request({
    url: serviceApi.createNeibuGuanli,
    method: 'post',
    data
  })
}
export function updateNeibuGuanli(data) {
  return request({
    url: serviceApi.updateNeibuGuanli,
    method: 'post',
    data
  })
}
export function delNeibuGuanli(data) {
  return request({
    url: serviceApi.delNeibuGuanli,
    method: 'post',
    data
  })
}
export function queryRenliList(data) {
  return request({
    url: serviceApi.queryRenliList,
    method: 'post',
    data
  })
}
export function createRenli(data) {
  return request({
    url: serviceApi.createRenli,
    method: 'post',
    data
  })
}
export function updateRenli(data) {
  return request({
    url: serviceApi.updateRenli,
    method: 'post',
    data
  })
}
export function delRenli(data) {
  return request({
    url: serviceApi.delRenli,
    method: 'post',
    data
  })
}
export function queryXuanchuanList(data) {
  return request({
    url: serviceApi.queryXuanchuanList,
    method: 'post',
    data
  })
}
export function createXuanchuan(data) {
  return request({
    url: serviceApi.createXuanchuan,
    method: 'post',
    data
  })
}
export function updateXuanchuan(data) {
  return request({
    url: serviceApi.updateXuanchuan,
    method: 'post',
    data
  })
}
export function delXuanchuan(data) {
  return request({
    url: serviceApi.delXuanchuan,
    method: 'post',
    data
  })
}
export function queryWorkbenchModule(data) {
  return request({
    url: serviceApi.queryWorkbenchModule,
    method: 'post',
    data
  })
}
export function queryWorkbenchConfig(data) {
  return request({
    url: serviceApi.queryWorkbenchConfig,
    method: 'post',
    data
  })
}
export function saveWorkbenchConfig(data) {
  return request({
    url: serviceApi.saveWorkbenchConfig,
    method: 'post',
    data
  })
}
export function getSumForWorkbench(data) {
  return request({
    url: serviceApi.getSumForWorkbench,
    method: 'post',
    data
  })
}

export function queryCustomerCard(data) {
  return request({
    url: serviceApi.queryCustomerCard,
    method: 'post',
    data
  })
}

export function queryCustomerInfo(data) {
  return request({
    url: serviceApi.queryCustomerInfo,
    method: 'post',
    data
  })
}

export function queryCustomerMap(data) {
  return request({
    url: serviceApi.queryCustomerMap,
    method: 'post',
    data
  })
}

export function deriveSYTable(data) {
  return request({
    url: serviceApi.deriveSYTable,
    method: 'post',
    data
  })
}

export function queryImportantMatters(data) {
  return request({
    url: serviceApi.queryImportantMatters,
    method: 'post',
    data
  })
}

export function settingsNoticeRead(data) {
  return request({
    url: serviceApi.settingsNoticeRead,
    method: 'post',
    data
  })
}

export function queryNoticeImpl(data) {
  return request({
    url: serviceApi.queryNoticeImpl,
    method: 'post',
    data
  })
}

export function queryCaseNotice(data) {
  return request({
    url: serviceApi.queryCaseNotice,
    method: 'post',
    data
  })
}

export function queryCustNotice(data) {
  return request({
    url: serviceApi.queryCustNotice,
    method: 'post',
    data
  })
}

export function querySubscribeRange(data) {
  return request({
    url: serviceApi.querySubscribeRange,
    method: 'post',
    data
  })
}

export function settingsSubscribeRange(data) {
  return request({
    url: serviceApi.settingsSubscribeRange,
    method: 'post',
    data
  })
}
export function settingsSubscribe(data) {
  return request({
    url: serviceApi.settingsSubscribe,
    method: 'post',
    data
  })
}
export function querySubscribe(data) {
  return request({
    url: serviceApi.querySubscribe,
    method: 'post',
    data
  })
}
export function deriveDJDTable(data) {
  return request({
    url: serviceApi.deriveDJDTable,
    method: 'post',
    data
  })
}
export function queryFollowCasesByUserId(data) {
  return request({
    url: serviceApi.queryFollowCasesByUserId,
    method: 'post',
    data
  })
}
export function queryImportantCasesByUserId(data) {
  return request({
    url: serviceApi.queryImportantCasesByUserId,
    method: 'post',
    data
  })
}



