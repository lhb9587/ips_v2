import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function checkListType(data) {
    return request({
        url: serviceApi.checkListType,
        method: 'post',
        data
    })
}   
export function submitBusinessTrip(data) {
    return request({
        url: serviceApi.submitBusinessTrip,
        method: 'post',
        data
    })
}   
export function saveBusinessTrip(data) {
    return request({
        url: serviceApi.saveBusinessTrip,
        method: 'post',
        data
    })
}   
export function auditBusinessTrip(data) {
    return request({
        url: serviceApi.auditBusinessTrip,
        method: 'post',
        data
    })
}   
export function countTripDays(data) {
    return request({
        url: serviceApi.countTripDays,
        method: 'post',
        data
    })
}   
export function getBtList(data) {
    return request({
        url: serviceApi.getBtList,
        method: 'post',
        data
    })
}   
export function getBtById(data) {
    return request({
        url: serviceApi.getBtById,
        method: 'post',
        data
    })
}   
export function deleteBtById(data) {
    return request({
        url: serviceApi.deleteBtById,
        method: 'post',
        data
    })
}   
export function queryTodoTask(data) {
    return request({
        url: serviceApi.queryTodoTask,
        method: 'post',
        data
    })
}   