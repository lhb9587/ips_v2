import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryContractFeeInfo(data) {
  return request({
    url: serviceApi.queryContractFeeInfo,
    method: 'post',
    data
  })
}
export function getContractList(data) {
  return request({
    url: serviceApi.getContractList,
    method: 'post',
    data
  })
}
export function getToBeReviewedNumber(data) {
  return request({
    url: serviceApi.getToBeReviewedNumber,
    method: 'post',
    data
  })
}
export function saveContract(data) {
  return request({
    url: serviceApi.saveContract,
    method: 'post',
    data
  })
}
export function queryContractTypeList(data) {
  return request({
    url: serviceApi.queryContractTypeList,
    method: 'get',
    data
  })
}
export function getContractDetail(data) {
  return request({
    url: serviceApi.getContractDetail,
    method: 'post',
    data
  })
}
export function getCustomerList(data) {
  return request({
    url: serviceApi.getCustomerList,
    method: 'post',
    data
  })
}
export function deleteContract(data) {
  return request({
    url: serviceApi.deleteContract,
    method: 'post',
    data
  })
}
export function auditContract(data) {
  return request({
    url: serviceApi.auditContract,
    method: 'post',
    data
  })
}

export function queryTaskHandlers(data) {
  return request({
    url: serviceApi.queryTaskHandlers,
    method: 'post',
    data
  })
}

export function queryContractTemplates(data) {
  return request({
    url: serviceApi.queryContractTemplates,
    method: 'post',
    data
  })
}

export function queryCompany(data) {
  return request({
    url: serviceApi.queryCompany,
    method: 'post',
    data
  })
}

export function getCaseCustomerManager(data) {
  return request({
    url: serviceApi.getCaseCustomerManager,
    method: 'post',
    data
  })
}

export function getContractsByAgentNum(data) {
  return request({
    url: serviceApi.getContractsByAgentNum,
    method: 'get',
    data
  })
}

// 根据案件文号获取案件信息
export function getCase(data) {
  return request({
    url: '/ip_service/interface/fee/getCase',
    method: 'post',
    data
  })
}

// 处理案件文号
export function disposeAgentNum(data) {
  return request({
    url: '/ip_service/interface/caseUtil/disposeAgentNum',
    method: 'post',
    data
  })
}
export function contractViewPdf(data){
  return request({
    url: serviceApi.contractViewPdf,
    method: 'get',
    data
  })
}

// 导出合同流程
export function exportContractFlow(params) {
  return request({
    url: serviceApi.exportContractFlow,
    method: 'get',
    params
  })
}
