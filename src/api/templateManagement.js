import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function queryTemplateList(data) {
  return request({
    url: serviceApi.queryTemplateList,
    method: 'post',
    data
  })
}
export function createTemplate(data) {
  return request({
    url: serviceApi.createTemplate,
    method: 'post',
    data
  })
}
export function deleteTemplate(data) {
  return request({
    url: serviceApi.deleteTemplate,
    method: 'post',
    data
  })
}
export function deleteTemplateFile(data){
  return request({
    url: serviceApi.deleteTemplateFile,
    method: 'post',
    data
  })
}
export function modifyTemplate(data) {
  return request({
    url: serviceApi.modifyTemplate,
    method: 'post',
    data
  })
}
export function addTaskGroup(data) {
  return request({
    url: serviceApi.addTaskGroup,
    method: 'post',
    data
  })
}
export function queryTaskList(data) {
  return request({
    url: serviceApi.queryTaskList,
    method: 'post',
    data
  })
}
export function addTemplateUser(data) {
  return request({
    url: serviceApi.addTemplateUser,
    method: 'post',
    data
  })
}
export function modifyTaskGroup(data) {
  return request({
    url: serviceApi.modifyTaskGroup,
    method: 'post',
    data
  })
}
export function deleteTasks(data) {
  return request({
    url: serviceApi.deleteTasks,
    method: 'post',
    data
  })
}
export function modifyTemplateUser(data) {
  return request({
    url: serviceApi.modifyTemplateUser,
    method: 'post',
    data
  })
}
export function deleteTemplateUser(data) {
  return request({
    url: serviceApi.deleteTemplateUser,
    method: 'post',
    data
  })
}
export function deleteTaskGroup(data) {
  return request({
    url: serviceApi.deleteTaskGroup,
    method: 'post',
    data
  })
}
export function copyTemplate(data) {
  return request({
    url: serviceApi.copyTemplate,
    method: 'post',
    data
  })
}
export function addTask(data) {
  return request({
    url: serviceApi.addTask,
    method: 'post',
    data
  })
}
export function modifyTask(data) {
  return request({
    url: serviceApi.modifyTask,
    method: 'post',
    data
  })
}
export function addTaskItem(data){
  return request({
    url: serviceApi.addTaskItem,
    method: 'post',
    data
  })
}
export function modifyTaskItem(data){
  return request({
    url: serviceApi.modifyTaskItem,
    method: 'post',
    data
  })
}
export function queryTemplateFileList(data){
  return request({
    url: serviceApi.queryTemplateFileList,
    method: 'post',
    data
  })
}
export function deleteTaskItem(data){
  return request({
    url: serviceApi.deleteTaskItem,
    method: 'post',
    data
  })
}
