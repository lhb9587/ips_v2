import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryItineraryList(data) {
  return request({
    url: serviceApi.queryItineraryList,
    method: 'post',
    data
  })
}
export function createItinerary(data) {
  return request({
    url: serviceApi.createItinerary,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryItineraryDetail(data) {
  return request({
    url: serviceApi.queryItineraryDetail,
    method: 'post',
    data
  })
}
export function modifyItinerary(data) {
  return request({
    url: serviceApi.modifyItinerary,
    method: 'post',
    data
  })
}
export function deleteItinerary(data) {
  return request({
    url: serviceApi.deleteItinerary,
    method: 'post',
    data
  })
}
export function queryItineraryUser(data) {
  return request({
    url: serviceApi.queryItineraryUser,
    method: 'post',
    data
  })
}
export function configItineraryUser(data) {
  return request({
    url: serviceApi.configItineraryUser,
    method: 'post',
    data
  })
}
export function queryMeetingList(data) {
  return request({
    url: serviceApi.queryMeetingList,
    method: 'post',
    data
  })
}
export function createMeeting(data) {
  return request({
    url: serviceApi.createMeeting,
    method: 'post',
    data,
    isLoading: true
  })
}
export function modifyMeeting(data) {
  return request({
    url: serviceApi.modifyMeeting,
    method: 'post',
    data
  })
}
export function deleteMeeting(data) {
  return request({
    url: serviceApi.deleteMeeting,
    method: 'post',
    data
  })
}
export function sendItineraryForOutlook(data) {
  return request({
    url: serviceApi.sendItineraryForOutlook,
    method: 'post',
    data
  })
}
export function queryItineraryConfigUser(data) {
  return request({
    url: serviceApi.queryItineraryConfigUser,
    method: 'post',
    data
  })
}
export function queryDefaultMeetingwxList(data) {
  return request({
    url: serviceApi.queryDefaultMeetingwxList,
    method: 'post',
    data
  })
}
export function saveMeetingwx(data) {
  return request({
    url: serviceApi.saveMeetingwx,
    method: 'post',
    data
  })
}
export function queryMeetingwxList(data) {
  return request({
    url: serviceApi.queryMeetingwxList,
    method: 'post',
    data
  })
}
export function queryDeptGroupUser(data) {
  return request({
    url: serviceApi.queryDeptGroupUser,
    method: 'post',
    data
  })
}
export function queryTimeZone(data) {
  return request({
    url: serviceApi.queryTimeZone,
    method: 'post',
    data
  })
}
export function queryCalendars(data) {
  return request({
    url: serviceApi.queryCalendars,
    method: 'post',
    data
  })
}
export function queryCalendarEvents(data) {
  return request({
    url: serviceApi.queryCalendarEvents,
    method: 'post',
    data
  })
}