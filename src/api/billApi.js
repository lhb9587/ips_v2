import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'
// 中断请求-->
import axios from 'axios'
var cancelObjc = {}
export function cancelrequest(cancelUrl) {
  if (cancelUrl === 'all') {
    for (const key in cancelObjc) {
        if (cancelObjc[key]) {
          cancelObjc[key].cancel()
          delete cancelObjc[key]
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
export function fetchList(data,config={}) {
  return request({
    url: serviceApi.queryBillListUrl,
    method: 'post',
    ...config,
    cancelToken: new axios.CancelToken(cancel => { // 需中断请求必须以函数名为key存入cancel
      cancelObjc['fetchList'] = {
        cancel
      }
    }),
    data
  })
}
export function uploadPayReceipt(data, cb) {
  return request({
    url: serviceApi.uploadPayReceipt,
    method: 'post',
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb&&cb(a)
    },
    data
  })
}
export function hxWorkHoursToBill(data) {
  return request({
    url: serviceApi.hxWorkHoursToBill,
    method: 'post',
    data
  })
}
export function queryRecentBillList(data) {
  return request({
    url: serviceApi.queryRecentBillList,
    method: 'post',
    data
  })
}
export function queryCaseListByBillId(data) {
  return request({
    url: serviceApi.queryCaseListByBillId,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryCaseBillList(data) {
  return request({
    url: serviceApi.queryCaseBillList,
    method: 'post',
    data
  })
}
export function exportCaseSurplusList(data) {
  return request({
    url: serviceApi.exportCaseSurplusList,
    method: 'post',
    data
  })
}
export function queryCaseSurplusList(data) {
  return request({
    url: serviceApi.queryCaseSurplusList,
    method: 'post',
    data
  })
}
export function queryCurrencyHistoryList(data) {
  return request({
    url: serviceApi.queryCurrencyHistoryList,
    method: 'post',
    data
  })
}
export function queryCurrencyHistoryById(data) {
  return request({
    url: serviceApi.queryCurrencyHistoryById,
    method: 'post',
    data
  })
}
export function updateCurrencyHistory(data) {
  return request({
    url: serviceApi.updateCurrencyHistory,
    method: 'post',
    data
  })
}
export function addCurrencyHistory(data) {
  return request({
    url: serviceApi.addCurrencyHistory,
    method: 'post',
    data
  })
}
export function delCurrencyHistoryById(data) {
  return request({
    url: serviceApi.delCurrencyHistoryById,
    method: 'post',
    data
  })
}
export function queryLevel(data) {
  return request({
    url: serviceApi.queryLevel,
    method: 'post',
    data
  })
}
export function modifyDunning(data) {
  return request({
    url: serviceApi.modifyDunning,
    method: 'post',
    data
  })
}
export function queryDunningList(data) {
  return request({
    url: serviceApi.queryDunningList,
    method: 'post',
    data
  })
}
export function deleteDunning(data) {
  return request({
    url: serviceApi.deleteDunning,
    method: 'post',
    data
  })
}
export function createDunning(data) {
  return request({
    url: serviceApi.createDunning,
    method: 'post',
    data
  })
}
export function queryCustContactEmailByCustId(data) {
  return request({
    url: serviceApi.queryCustContactEmailByCustId,
    method: 'post',
    data
  })
}
export function queryTemplate(data) {
  return request({
    url: serviceApi.queryTemplate,
    method: 'post',
    data
  })
}
export function createDunningSetting(data) {
  return request({
    url: serviceApi.createDunningSetting,
    method: 'post',
    data
  })
}
export function deleteteLevel(data) {
  return request({
    url: serviceApi.deleteteLevel,
    method: 'post',
    data
  })
}
export function modifyLevel(data) {
  return request({
    url: serviceApi.modifyLevel,
    method: 'post',
    data
  })
}
export function updateLevel(data) {
  return request({
    url: serviceApi.updateLevel,
    method: 'post',
    data
  })
}
export function queryDMemo(data) {
  return request({
    url: serviceApi.queryDMemo,
    method: 'post',
    data
  })
}
export function deleteDMemo(data) {
  return request({
    url: serviceApi.deleteDMemo,
    method: 'post',
    data
  })
}
export function modifyDMemo(data) {
  return request({
    url: serviceApi.modifyDMemo,
    method: 'post',
    data
  })
}
export function createDMemo(data) {
  return request({
    url: serviceApi.createDMemo,
    method: 'post',
    data
  })
}
export function queryUnpaidBillByCustId(data) {
  return request({
    url: serviceApi.queryUnpaidBillByCustId,
    method: 'post',
    data
  })
}
export function queryDebtCustomer(data) {
  return request({
    url: serviceApi.queryDebtCustomer,
    method: 'post',
    data
  })
}
export function modifyBillBatch(data) {
  return request({
    url: serviceApi.modifyBillBatch,
    method: 'post',
    data
  })
}
export function modifyBillBalanceBatch(data) {
  return request({
    url: serviceApi.modifyBillBalanceBatch,
    method: 'post',
    data
  })
}
export function modifyBillBadDebtBatch(data) {
  return request({
    url: serviceApi.modifyBillBadDebtBatch,
    method: 'post',
    data
  })
}
export function copyOfferPrice(data) {
  return request({
    url: serviceApi.copyOfferPrice,
    method: 'post',
    data
  })
}
export function queryOfferPriceRules(data) {
  return request({
    url: serviceApi.queryOfferPriceRules,
    method: 'post',
    data
  })
}
export function createOfferPrice(data) {
  return request({
    url: serviceApi.createOfferPrice,
    method: 'post',
    data
  })
}
export function modifyOfferPrice(data) {
  return request({
    url: serviceApi.modifyOfferPrice,
    method: 'post',
    data
  })
}
export function modifyOfferCurrency(data) {
  return request({
    url: serviceApi.modifyOfferCurrency,
    method: 'post',
    data
  })
}
export function createOfferCurrency(data) {
  return request({
    url: serviceApi.createOfferCurrency,
    method: 'post',
    data
  })
}
export function queryOfferCurrency(data) {
  return request({
    url: serviceApi.queryOfferCurrency,
    method: 'post',
    data
  })
}
export function batchModifyPriceSortNo(data) {
  return request({
    url: serviceApi.batchModifyPriceSortNo,
    method: 'post',
    data
  })
}
export function queryOfferPrice(data) {
  return request({
    url: serviceApi.queryOfferPrice,
    method: 'post',
    data
  })
}
export function deleteOfferPrice(data) {
  return request({
    url: serviceApi.deleteOfferPrice,
    method: 'post',
    data
  })
}
export function queryOfferPriceSome(data) {
  return request({
    url: serviceApi.queryOfferPriceSome,
    method: 'post',
    data
  })
}
export function modifyOfferPriceSome(data) {
  return request({
    url: serviceApi.modifyOfferPriceSome,
    method: 'post',
    data
  })
}
export function queryOfferCountries(data) {
  return request({
    url: serviceApi.queryOfferCountries,
    method: 'post',
    data
  })
}
export function getShowRefno(data) {
  return request({
    url: serviceApi.getShowRefno,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createPayment(data) {
  return request({
    url: serviceApi.createPayment,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryPayAccountByPermission(data) {
  return request({
    url: serviceApi.queryPayAccountByPermission,
    method: 'post',
    data,
    isLoading: true
  })
}
export function submit(data) {
  return request({
    url: serviceApi.submit,
    method: 'post',
    data,
    isLoading: true
  })
}
export function endorse(data) {
  return request({
    url: serviceApi.endorse,
    method: 'post',
    data,
    isLoading: true
  })
}
export function doPaymentTask(data) {
  return request({
    url: serviceApi.doPaymentTask,
    method: 'post',
    data,
    isLoading: true
  })
}
export function pay(data) {
  return request({
    url: serviceApi.pay,
    method: 'post',
    data,
    isLoading: true
  })
}
export function checkTasker(data) {
  return request({
    url: serviceApi.checkTasker,
    method: 'post',
    data,
    isLoading: true
  })
}
export function previewPayment(data) {
  return request({
    url: serviceApi.previewPayment,
    method: 'post',
    data,
    isLoading: true
  })
}
export function deletePayment(data) {
  return request({
    url: serviceApi.deletePayment,
    method: 'post',
    data,
    isLoading: true
  })
}
export function modifyPayment(data) {
  return request({
    url: serviceApi.modifyPayment,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryPaymentById(data) {
  return request({
    url: serviceApi.queryPaymentById,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryPaymentDetailList(data) {
  return request({
    url: serviceApi.queryPaymentDetailList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryPaymentList(data) {
  return request({
    url: serviceApi.queryPaymentList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function importOfferCust(data) {
  return request({
    url: serviceApi.importOfferCust,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryOfferCust(data) {
  return request({
    url: serviceApi.queryOfferCust,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryCountryCn(data) {
  return request({
    url: serviceApi.queryCountryCn,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createOfferCust(data) {
  return request({
    url: serviceApi.createOfferCust,
    method: 'post',
    data,
    isLoading: false
  })
}
export function modifyOfferCust(data) {
  return request({
    url: serviceApi.modifyOfferCust,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createTemplateOffer(data) {
  return request({
    url: serviceApi.createTemplateOffer,
    method: 'post',
    data,
    isLoading: true
  })
}
export function calculateOffer(data) {
  return request({
    url: serviceApi.calculateOffer,
    method: 'post',
    data,
    isLoading: false
  })
}
export function deleteOfferCust(data) {
  return request({
    url: serviceApi.deleteOfferCust,
    method: 'post',
    data,
    isLoading: false
  })
}
export function modifyOfferPriceM(data) {
  return request({
    url: serviceApi.modifyOfferPriceM,
    method: 'post',
    data
  })
}
export function queryOfferPriceM(data) {
  return request({
    url: serviceApi.queryOfferPriceM,
    method: 'post',
    data
  })
}
export function queryAgentUser(data) {
  return request({
    url: serviceApi.queryAgentUser,
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
export function createFee(data) {
  return request({
    url: serviceApi.createFee,
    method: 'post',
    data
  })
}
export function createPayExcel(data) {
  return request({
    url: serviceApi.createPayExcel,
    method: 'post',
    data
  })
}
export function queryPatentPayCurrency(data) {
  return request({
    url: serviceApi.queryPatentPayCurrency,
    method: 'post',
    data
  })
}
export function modifyPatentPayCurrency(data) {
  return request({
    url: serviceApi.modifyPatentPayCurrency,
    method: 'post',
    data
  })
}

export function deletePatentPayList(data) {
  return request({
    url: serviceApi.deletePatentPayList,
    method: 'post',
    data
  })
}

export function modifyPatentPayList(data) {
  return request({
    url: serviceApi.modifyPatentPayList,
    method: 'post',
    data
  })
}

export function createPatentPayList(data) {
  return request({
    url: serviceApi.createPatentPayList,
    method: 'post',
    data
  })
}

export function getPayListNo(data) {
  return request({
    url: serviceApi.getPayListNo,
    method: 'post',
    data
  })
}
export function queryPayList(data) {
  return request({
    url: serviceApi.queryPayList,
    method: 'post',
    data
  })
}
export function queryOfficialBillRecordList(data) {
  return request({
    url: serviceApi.queryOfficialBillRecordList,
    method: 'post',
    data
  })
}
export function queryCustomerNameIdUrl(data) {
  return request({
    url: serviceApi.queryCustomerNameIdUrl,
    method: 'post',
    data
  })
}
export function querySingleBillUrl(data) {
  return request({
    url: serviceApi.querySingleBillUrl,
    method: 'post',
    data
  })
}
export function createSumBillNoUrl(data) {
  return request({
    url: serviceApi.createSumBillNoUrl,
    method: 'post',
    data
  })
}
export function checkIsSameCustUrl(data) {
  return request({
    url: serviceApi.checkIsSameCustUrl,
    method: 'post',
    data
  })
}
export function updateBillDateAndBelongToDateUrl(data) {
  return request({
    url: serviceApi.updateBillDateAndBelongToDateUrl,
    method: 'post',
    data
  })
}
export function queryBillTemplateUrl(data) {
  return request({
    url: serviceApi.queryBillTemplateUrl,
    method: 'post',
    data
  })
}
export function querySpecialTemplates(data) {
  return request({
    url: serviceApi.querySpecialTemplates,
    method: 'post',
    data
  })
}
export function queryAbroadBillTemplate(data) {
  return request({
    url: serviceApi.queryAbroadBillTemplate,
    method: 'post',
    data
  })
}
export function createSpecialTemplate(data) {
  return request({
    url: serviceApi.createSpecialTemplate,
    method: 'post',
    data
  })
}
export function createBillTemplateUrl(data) {
  return request({
    url: serviceApi.createBillTemplateUrl,
    method: 'post',
    data
  })
}
export function updateBillRemarksUrl(data) {
  return request({
    url: serviceApi.updateBillRemarksUrl,
    method: 'post',
    data
  })
}
export function queryWorkgroupUrl(data) {
  return request({
    url: serviceApi.queryWorkgroupUrl,
    method: 'post',
    data
  })
}
export function querydotaskBillUrl(data) {
  return request({
    url: serviceApi.querydotaskBillUrl,
    method: 'post',
    data
  })
}
export function querywfUserNameUrl(data) {
  return request({
    url: serviceApi.querywfUserNameUrl,
    method: 'post',
    data,
    isLoading: false
  })
}
export function batchdoBillTaskUrl(data) {
  return request({
    url: serviceApi.batchdoBillTaskUrl,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryBillRecordcdUrl(data) {
  return request({
    url: serviceApi.queryBillRecordcdUrl,
    method: 'post',
    data
  })
}
export function updateBillInternalUrl(data) {
  return request({
    url: serviceApi.updateBillInternalUrl,
    method: 'post',
    data
  })
}
export function queryAllUrl(data) {
  return request({
    url: serviceApi.queryAllUrl,
    method: 'post',
    data
  })
}
export function queryBillRecordUrl(data) {
  return request({
    url: serviceApi.queryBillRecordUrl,
    method: 'post',
    data
  })
}
export function writeOffBillRecordUrl(data) {
  return request({
    url: serviceApi.writeOffBillRecordUrl,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryPayAcountUrl(data) {
  return request({
    url: serviceApi.queryPayAcountUrl,
    method: 'post',
    data
  })
}
export function queryBillUrl(data,config) {
  return request({
    url: serviceApi.queryBillUrl,
    method: 'post',
    data,
    ...config
  })
}
export function queryBillByBillNo(data) {
  return request({
    url: serviceApi.queryBillByBillNo,
    method: 'post',
    data
  })
}
export function queryCurrencyUrl(data) {
  return request({
    url: serviceApi.queryCurrencyUrl,
    method: 'post',
    data
  })
}

export function queryChargeItemBynameCnUrl(data) {
  return request({
    url: serviceApi.queryChargeItemBynameCnUrl,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBillInternalUrl(data) {
  return request({
    url: serviceApi.queryBillInternalUrl,
    method: 'post',
    data,
    isLoading: true
  })
}
export function writeOffBillRecordnbUrl(data) {
  return request({
    url: serviceApi.writeOffBillRecordnbUrl,
    method: 'post',
    data
  })
}
export function deleteBillInternalUrl(data) {
  return request({
    url: serviceApi.deleteBillInternalUrl,
    method: 'post',
    data
  })
}
export function billSubmitUrl(data) {
  return request({
    url: serviceApi.billSubmitUrl,
    method: 'post',
    data
  })
}
export function queryWkgId(data) {
  return request({
    url: serviceApi.queryWkgId,
    method: 'post',
    data
  })
}
export function queryZZWorkGroupUrl(data) {
  return request({
    url: serviceApi.queryZZWorkGroupUrl,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBillInternalTaskListUrl(data) {
  return request({
    url: serviceApi.queryBillInternalTaskListUrl,
    method: 'post',
    data
  })
}
export function updateBillRecordUrl(data) {
  return request({
    url: serviceApi.updateBillRecordUrl,
    method: 'post',
    data
  })
}
export function doBillInternalTaskUrl(data) {
  return request({
    url: serviceApi.doBillInternalTaskUrl,
    method: 'post',
    data
  })
}
export function queryBillInternalListUrl(data) {
  return request({
    url: serviceApi.queryBillInternalListUrl,
    method: 'post',
    cancelToken: new axios.CancelToken(cancel => { // 需中断请求必须以函数名为key存入cancel
      cancelObjc['queryBillInternalListUrl'] = {
        cancel
      }
    }),
    data,
    isLoading: true
  })
}
export function billRecorddeleteUrl(data) {
  return request({
    url: serviceApi.billRecorddeleteUrl,
    method: 'post',
    data
  })
}
export function saveBillRecord(data) {
  return request({
    url: serviceApi.saveBillRecord,
    method: 'post',
    data
  })
}
export function queryBillRecordListUrl(data) {
  return request({
    url: serviceApi.queryBillRecordListUrl,
    method: 'post',
    data
  })
}
export function singleSubmitBillInternalUrl(data) {
  return request({
    url: serviceApi.singleSubmitBillInternalUrl,
    method: 'post',
    data
  })
}
export function createBillUrl(data) {
  return request({
    url: serviceApi.createBillUrl,
    method: 'post',
    data
  })
}
export function updateBillUrl(data) {
  return request({
    url: serviceApi.updateBillUrl,
    method: 'post',
    data
  })
}
export function checkWkg(data) {
  return request({
    url: serviceApi.checkWkg,
    method: 'post',
    data
  })
}
export function deleteBillAllocation(data) {
  return request({
    url: serviceApi.deleteBillAllocation,
    method: 'post',
    data
  })
}
export function deleteBillUrl(data) {
  return request({
    url: serviceApi.deleteBillUrl,
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
export function queryCustomerContactByCustIdUrl1(data) {
  return request({
    url: serviceApi.queryCustomerContactByCustIdUrl1,
    method: 'post',
    data
  })
}
export function queryCustomerContactAddrUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactAddrUrl,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBillSum(data) {
  return request({
    url: serviceApi.queryBillSum,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryAbroadList(data) {
  return request({
    url: ipServiceApi.queryAbroadList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function getAbroadBill(data) {
  return request({
    url: ipServiceApi.getAbroadBill,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createAbroadBill(data) {
  return request({
    url: ipServiceApi.createAbroadBill,
    method: 'post',
    data,
    isLoading: false
  })
}
export function batchModifyAbroadBill(data) {
  return request({
    url: ipServiceApi.batchModifyAbroadBill,
    method: 'post',
    data,
    isLoading: true
  })
}
export function saveAbroadBill(data) {
  return request({
    url: ipServiceApi.saveAbroadBill,
    method: 'post',
    data,
    isLoading: false
  })
}
export function submitAbroadBill(data) {
  return request({
    url: ipServiceApi.submitAbroadBill,
    method: 'post',
    data
  })
}
export function queryAbroadBillDetail(data) {
  return request({
    url: ipServiceApi.queryAbroadBillDetail,
    method: 'post',
    data,
    isLoading: true
  })
}
export function getCaseList(data) {
  return request({
    url: ipServiceApi.getCaseList,
    method: 'post',
    data,
    isLoading: false
  })
}
export function deleteAbroadBill(data) {
  return request({
    url: ipServiceApi.deleteAbroadBill,
    method: 'post',
    data,
    isLoading: false
  })
}
export function batchPayAbroadBill(data) {
  return request({
    url: ipServiceApi.batchPayAbroadBill,
    method: 'post',
    data,
    isLoading: false
  })
}
export function checkWkgIsGj(data) {
  return request({
    url: serviceApi.checkWkgIsGj,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryHXBillData(data) {
  return request({
    url: serviceApi.queryHXBillData,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBillInfoByBillId(data) {
  return request({
    url: ipServiceApi.queryBillInfoByBillId,
    method: 'post',
    data,
    isLoading: false
  })
}
export function deleteBillInfo(data) {
  return request({
    url: ipServiceApi.deleteBillInfo,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBillTaskRecord(data) {
  return request({
    url: ipServiceApi.queryBillTaskRecord,
    method: 'post',
    data,
    isLoading: false
  })
}
export function downloadMaterialBatch(data) {
  return request({
    url: ipServiceApi.downloadMaterialBatch,
    method: 'post',
    data,
    isLoading: false
  })
}
export function disposeAgentNum(data) {
  return request({
    url: ipServiceApi.disposeAgentNum,
    method: 'post',
    data,
    isLoading: false
  })
}
export function billDiscount(data) {
  return request({
    url: ipServiceApi.billDiscount,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createAbroadBillTemplate(data) {
  return request({
    url: ipServiceApi.createAbroadBillTemplate,
    method: 'post',
    data
  })
}
export function createAbroadBillFee(data) {
  return request({
    url: ipServiceApi.createAbroadBillFee,
    method: 'post',
    data
  })
}
export function copyAbroadBill(data) {
  return request({
    url: ipServiceApi.copyAbroadBill,
    method: 'post',
    data
  })
}
export function queryUserRate(data) {
  return request({
    url: serviceApi.queryUserRate,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBillStatisticsByCaseId(data) {
  return request({
    url: serviceApi.queryBillStatisticsByCaseId,
    method: 'post',
    data,
    isLoading: false
  })
}
