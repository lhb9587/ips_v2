import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryAllUrl(data) {
  return request({
    url: serviceApi.queryAllUrl,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryApplication(data) {
  return request({
    url: serviceApi.queryApplication,
    method: 'post',
    data
  })
}
export function queryAddrByAppIds(data) {
  return request({
    url: serviceApi.queryAddrByAppIds,
    method: 'post',
    data
  })
}
export function queryCountrysUrl(data) {
  return request({
    url: serviceApi.queryCountrysUrl,
    method: 'post',
    data
  })
}
export function deleteUrl(data) {
  return request({
    url: serviceApi.deleteUrl,
    method: 'post',
    data
  })
}
export function updateUrl(data) {
  return request({
    url: serviceApi.updateUrl,
    method: 'post',
    data
  })
}
export function queryDetailByIdUrl(data) {
  return request({
    url: serviceApi.queryDetailByIdUrl,
    method: 'post',
    data
  })
}
export function createUrl(data) {
  return request({
    url: serviceApi.createUrl,
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
export function querycustSelectClass(data) {
  return request({
    url: serviceApi.querycustSelectClass,
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
export function queryCPCAddr(data) {
  return request({
    url: serviceApi.queryCPCAddr,
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
