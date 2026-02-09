import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'
export function createGovList(data) {
  return request({
    url: ipServiceApi.createGovList,
    method: 'post',
    data
  })
}
export function createForm(data) {
  return request({
    url: ipServiceApi.createForm,
    method: 'post',
    data
  })
}
export function queryMandate(data) {
  return request({
    url: ipServiceApi.queryMandate,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createPOA(data) {
  return request({
    url: ipServiceApi.createPOA,
    method: 'post',
    data
  })
}
export function createMailByself(data) {
  return request({
    url: ipServiceApi.createMailByself,
    method: 'post',
    data
  })
}
export function queryAllMailType(data) {
  return request({
    url: ipServiceApi.queryAllMailType,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createListOfMaterial(data) {
  return request({
    url: ipServiceApi.createListOfMaterial,
    method: 'post',
    data
  })
}
export function queryListOfMaterial(data) {
  return request({
    url: ipServiceApi.queryListOfMaterial,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createReceipt(data) {
  return request({
    url: ipServiceApi.createReceipt,
    method: 'post',
    data
  })
}
export function excelMould(data) {
  return request({
    url: ipServiceApi.excelMould,
    method: 'post',
    data
  })
}
