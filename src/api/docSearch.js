import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryDocumentSearch(data) {
  return request({
    url: serviceApi.queryDocumentSearch,
    method: 'post',
    data
  })
}
export function queryDocumentSearchById(data) {
  return request({
    url: serviceApi.queryDocumentSearchById,
    method: 'post',
    data
  })
}
export function updateFavoriteByUserId(data) {
  return request({
    url: serviceApi.updateFavoriteByUserId,
    method: 'post',
    data
  })
}
