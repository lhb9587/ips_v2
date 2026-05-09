import request from '@/utils/request'
import attendanceApi from '@/api/attendanceApi.config'

export function getAttendanceScope(config = {}) {
  return request({
    url: attendanceApi.attendanceAuthScope,
    method: 'get',
    isLoading: false,
    successByCode: 200,
    ...config
  })
}

export function queryAttendanceArchivePage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceArchivePage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupPage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupPage,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupDetail(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupDetail,
    method: 'post',
    data,
    ...config
  })
}

export function saveAttendanceGroup(data, config = {}) {
  return request({
    url: attendanceApi.saveAttendanceGroup,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupDeleteCheck(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupDeleteCheck,
    method: 'post',
    data,
    ...config
  })
}

export function deleteAttendanceGroup(data, config = {}) {
  return request({
    url: attendanceApi.deleteAttendanceGroup,
    method: 'post',
    data,
    ...config
  })
}

export function queryAttendanceGroupMemberCandidatePage(data, config = {}) {
  return request({
    url: attendanceApi.queryAttendanceGroupMemberCandidatePage,
    method: 'post',
    data,
    ...config
  })
}

export function queryUnarchivedAttendanceArchivePage(data, config = {}) {
  return request({
    url: attendanceApi.queryUnarchivedAttendanceArchivePage,
    method: 'post',
    data,
    ...config
  })
}

export function batchCreateAttendanceArchiveByDefault(data, config = {}) {
  return request({
    url: attendanceApi.batchCreateAttendanceArchiveByDefault,
    method: 'post',
    data,
    ...config
  })
}
