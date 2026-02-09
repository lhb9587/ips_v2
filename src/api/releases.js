import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryReleaseList(data,config) {
  return request({
    url: serviceApi.queryReleaseList,
    method: 'post',
    data,
    ...config
  })
}
export function modifyRelease(data) {
  return request({
    url: serviceApi.modifyRelease,
    method: 'post',
    data,
    isLoading: true
  })
}
export function createRelease(data) {
  return request({
    url: serviceApi.createRelease,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryReleaseById(data) {
  return request({
    url: serviceApi.queryReleaseById,
    method: 'post',
    data,
    isLoading: true
  })
}
export function deleteRelease(data) {
  return request({
    url: serviceApi.deleteRelease,
    method: 'post',
    data,
    isLoading: true
  })
}
