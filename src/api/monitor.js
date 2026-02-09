import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryMonitorFactorImage() {
  return request({
    url: serviceApi.queryMonitorFactorImage,
    method: 'post'
  })
}
export function queryMonitorResultSum() {
  return request({
    url: serviceApi.queryMonitorResultSum,
    method: 'post'
  })
}
export function queryMonitorResultMessage(data) {
  return request({
    url: serviceApi.queryMonitorResultMessage,
    method: 'post',
    data,
  })
}
export function queryMonitorCustomer(data) {
  return request({
    url: serviceApi.queryMonitorCustomer,
    method: 'post',
    data,
  })
}
export function downloadSdResultExcel(data) {
  return request({
    url: serviceApi.downloadSdResultExcel,
    method: 'post',
    data,
  })
}
export function queryAnnouncementName(data) {
  return request({
    url: serviceApi.queryAnnouncementName,
    method: 'post',
    data,
  })
}
export function queryoAnnouncement(data) {
  return request({
    url: serviceApi.queryoAnnouncement,
    method: 'post',
    data,
  })
}
export function queryoObjectHasResult(data) {
  return request({
    url: serviceApi.queryoObjectHasResult,
    method: 'post',
    data,
  })
}
export function downloadMonitorResultExcel(data) {
  return request({
    url: serviceApi.downloadMonitorResultExcel,
    method: 'post',
    data,
  })
}
export function downloadMonitorListExcel(data, params) {
  return request({
    url: serviceApi.downloadMonitorListExcel,
    method: 'post',
    data
  })
}
export function queryMonitorResult(data) {
  return request({
    url: serviceApi.queryMonitorResult,
    method: 'post',
    data,
  })
}
export function queryMonitorResultList(data) {
  return request({
    url: serviceApi.queryMonitorResultList,
    method: 'post',
    data,
  })
}
export function queryMonitorList(data) {
  return request({
    url: serviceApi.queryMonitorList,
    method: 'post',
    data,
  })
}
export function queryIssueList(data) {
  return request({
    url: serviceApi.queryIssueList,
    method: 'post',
    data,
  })
}
export function queryMonitor(data) {
  return request({
    url: serviceApi.queryMonitor,
    method: 'post',
    data,
  })
}
export function queryMonitorFactorType(data) {
  return request({
    url: serviceApi.queryMonitorFactorType,
    method: 'post',
    data,
  })
}
export function updateMonitor(data) {
  return request({
    url: serviceApi.updateMonitor,
    method: 'post',
    data,
  })
}
export function delMonitor(data) {
  return request({
    url: serviceApi.delMonitor,
    method: 'post',
    data,
  })
}
export function addMonitor(data) {
  return request({
    url: serviceApi.addMonitor,
    method: 'post',
    data,
  })
}
export function updatebatchStop(data) {
  return request({
    url: serviceApi.updatebatchStop,
    method: 'post',
    data,
  })
}
export function batchState(data) {
  return request({
    url: serviceApi.batchState,
    method: 'post',
    data,
  })
}
