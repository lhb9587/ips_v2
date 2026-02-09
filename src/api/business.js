import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryShangjiList(data) {
  return request({
    url: serviceApi.queryShangjiList,
    method: 'post',
    data
  })
}
export function addShangji(data) {
  return request({
    url: serviceApi.addShangji,
    method: 'post',
    data
  })
}
export function queryShangji(data) {
  return request({
    url: serviceApi.queryShangji,
    method: 'post',
    data
  })
}
export function updateShangji(data) {
  return request({
    url: serviceApi.updateShangji,
    method: 'post',
    data
  })
}
export function delShangji(data) {
  return request({
    url: serviceApi.delShangji,
    method: 'post',
    data
  })
}
export function shangjiFenpei(data) {
  return request({
    url: serviceApi.shangjiFenpei,
    method: 'post',
    data
  })
}
