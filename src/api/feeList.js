import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'

export function queryWorkGroupByUserId(data) {
  return request({
    url: serviceApi.queryWorkGroupByUserId,
    method: 'post',
    data,
    isLoading: false
  })
}
export function deleteFeeRule(data) {
  return request({
    url: serviceApi.deleteFeeRule,
    method: 'post',
    data,
    isLoading: true
  })
}
export function modifyFeeRule(data) {
  return request({
    url: serviceApi.modifyFeeRule,
    method: 'post',
    data,
    isLoading: true
  })
}
export function createFeeRule(data) {
  return request({
    url: serviceApi.createFeeRule,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryFeeRuleList(data) {
  return request({
    url: serviceApi.queryFeeRuleList,
    method: 'post',
    data,
    isLoading: true
  })
}

export function checkLawsuitReceiptNo(data) {
  return request({
    url: ipServiceApi.checkLawsuitReceiptNo,
    method: 'post',
    data
  })
}
export function updateFeeDetailList(data) {
  return request({
    url: ipServiceApi.updateFeeDetailList,
    method: 'post',
    data
  })
}
export function queryCompanyByPermission(data) {
  return request({
    url: ipServiceApi.queryCompanyByPermission,
    method: 'post',
    data
  })
}
export function queryDeptCompany(data) {
  return request({
    url: ipServiceApi.queryDeptCompany,
    method: 'post',
    data
  })
}
export function queryFeeList(data) {
  return request({
    url: ipServiceApi.queryFeeList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function getInvoiceBorrowInfo(data) {
  return request({
    url: ipServiceApi.getInvoiceBorrowInfo,
    method: 'post',
    data
  })
}
export function createFee(data) {
  return request({
    url: ipServiceApi.createFee,
    method: 'post',
    data
  })
}
export function queryFeeTask(data,config = {}) {
  return request({
    url: ipServiceApi.queryFeeTask,
    method: 'post',
    data,
    ...config
  })
}
export function queryFeeTypeList(data) {
  return request({
    url: ipServiceApi.queryFeeTypeList,
    method: 'post',
    data
  })
}
export function submitFee(data) {
  return request({
    url: ipServiceApi.submitFee,
    method: 'post',
    data
  })
}
export function queryFeeInfo(data) {
  return request({
    url: ipServiceApi.queryFeeInfo,
    method: 'post',
    data,
    isLoading: true
  })
}
export function updateFee(data) {
  return request({
    url: ipServiceApi.updateFee,
    method: 'post',
    data
  })
}
export function queryPayMode(data) {
  return request({
    url: ipServiceApi.queryPayMode,
    method: 'post',
    data
  })
}
export function queryCompany(data) {
  return request({
    url: ipServiceApi.queryCompany,
    method: 'post',
    data
  })
}
export function updateFeeBatch(data) {
  return request({
    url: ipServiceApi.updateFeeBatch,
    method: 'post',
    data
  })
}
export function unbindWorkHour(data) {
  return request({
    url: ipServiceApi.unbindWorkHour,
    method: 'post',
    data
  })
}
export function bindWorkHour(data) {
  return request({
    url: ipServiceApi.bindWorkHour,
    method: 'post',
    data
  })
}
export function queryWorkHourList(data) {
  return request({
    url: ipServiceApi.queryWorkHourList,
    method: 'post',
    data
  })
}
export function copyFee(data) {
  return request({
    url: ipServiceApi.copyFee,
    method: 'post',
    data
  })
}
export function batchDoFeeTask(data) {
  return request({
    url: ipServiceApi.batchDoFeeTask,
    method: 'post',
    data
  })
}
export function createFeeInCase(data) {
  return request({
    url: ipServiceApi.createFeeInCase,
    method: 'post',
    data
  })
}
export function deleteFeeDetail(data) {
  return request({
    url: ipServiceApi.deleteFeeDetail,
    method: 'post',
    data
  })
}
export function deleteFee(data) {
  return request({
    url: ipServiceApi.deleteFee,
    method: 'post',
    data
  })
}
export function queryFeeWfstatus(data) {
  return request({
    url: ipServiceApi.queryFeeWfstatus,
    method: 'post',
    data,
    isLoading:false
  })
}
export function endorseFee(data) {
  return request({
    url: ipServiceApi.endorseFee,
    method: 'post',
    data,
  })
}
export function checkFeeTasker(data) {
  return request({
    url: ipServiceApi.checkFeeTasker,
    method: 'post',
    data,
  })
}
export function queryEndorseTasker(data) {
  return request({
    url: ipServiceApi.queryEndorseTasker,
    method: 'post',
    data,
  })
}
export function queryFeeTaskDefine(data) {
  return request({
    url: ipServiceApi.queryFeeTaskDefine,
    method: 'post',
    data,
  })
}
export function querySpecificPayType(data) {
  return request({
    url: ipServiceApi.querySpecificPayType,
    method: 'post',
    data,
  })
}
export function getCase(data) {
  return request({
    url: ipServiceApi.feeGetCase,
    method: 'post',
    data,
  })
}
export function queryFeeSum(data) {
  return request({
    url: ipServiceApi.queryFeeSum,
    method: 'post',
    data,
  })
}
export function createFeeTemplate(data) {
  return request({
    url: ipServiceApi.createFeeTemplate,
    method: 'post',
    data,
  })
}
