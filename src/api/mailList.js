import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'
export function upMailbox(data) {
  return request({
    url: ipServiceApi.upMailbox,
    method: 'post',
    data
  })
}
export function addMailbox(data) {
  return request({
    url: ipServiceApi.addMailbox,
    method: 'post',
    data
  })
}
export function manualFinish(data) {
  return request({
    url: ipServiceApi.manualFinish,
    method: 'post',
    data
  })
}
export function batchFinish(data) {
  return request({
    url: ipServiceApi.batchFinish,
    method: 'post',
    data
  })
}
export function queryJieduan(data) {
  return request({
    url: ipServiceApi.queryJieduan,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryJieduanOfMailType(data) {
  return request({
    url: ipServiceApi.queryJieduanOfMailType,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryPatentMailType(data) {
  return request({
    url: ipServiceApi.queryPatentMailType,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryMailTypeByJieduan(data) {
  return request({
    url: ipServiceApi.queryMailTypeByJieduan,
    method: 'post',
    data,
    isLoading: false
  })
}
