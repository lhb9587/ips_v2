import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function createProject(data) {
  return request({
    url: serviceApi.createProject,
    method: 'post',
    data
  })
}
export function queryFolderViewData(data) {
  return request({
    url: serviceApi.queryFolderViewData,
    method: 'post',
    data
  })
}
export function queryFolderViewTasks(data) {
  return request({
    url: serviceApi.queryFolderViewTasks,
    method: 'post',
    data
  })
}
export function queryFolderViewSubtasks(data) {
  return request({
    url: serviceApi.queryFolderViewSubtasks,
    method: 'post',
    data
  })
}
export function queryFolderViewSubtasksLevel4(data) {
  return request({
    url: serviceApi.queryFolderViewSubtasksLevel4,
    method: 'post',
    data
  })
}
export function queryProjectDetail(data) {
  return request({
    url: serviceApi.queryProjectDetail,
    method: 'post',
    data
  })
}
export function updateProject(data) {
  return request({
    url: serviceApi.updateProject,
    method: 'post',
    data
  })
}
export function deleteProjectUrl(data) {
  return request({
    url: serviceApi.deleteProjectUrl,
    method: 'post',
    data
  })
}
export function queryActivityLog(data) {
  return request({
    url: serviceApi.queryActivityLog,
    method: 'post',
    data
  })
}
export function queryChangeHistory(data) {
  return request({
    url: serviceApi.queryChangeHistory,
    method: 'post',
    data
  })
}
export function createTaskUrl(data) {
  return request({
    url: serviceApi.createTaskUrl,
    method: 'post',
    data
  })
}
export function updateTaskUrl(data) {
  return request({
    url: serviceApi.updateTaskUrl,
    method: 'post',
    data
  })
}
export function deleteTaskUrl(data) {
  return request({
    url: serviceApi.deleteTaskUrl,
    method: 'post',
    data
  })
}
export function queryTaskDetail(data) {
  return request({
    url: serviceApi.queryTaskDetail,
    method: 'post',
    data
  })
}
export function getAllTasklist(data) {
  return request({
    url: serviceApi.getAllTasklist,
    method: 'post',
    data
  })
}
export function createSubtask(data) {
  return request({
    url: serviceApi.createSubtask,
    method: 'post',
    data
  })
}
export function updateSubtask(data) {
  return request({
    url: serviceApi.updateSubtask,
    method: 'post',
    data
  })
}
export function deleteSubtask(data) {
  return request({
    url: serviceApi.deleteSubtask,
    method: 'post',
    data
  })
}
export function querySubtaskDetail(data) {
  return request({
    url: serviceApi.querySubtaskDetail,
    method: 'post',
    data
  })
}

//案件引用
export function queryRelatedCases(data) {
  return request({
    url: serviceApi.queryRelatedCases,
    method: 'post',
    data
  })
}
export function addRelatedCase(data) {
  return request({
    url: serviceApi.addRelatedCase,
    method: 'post',
    data
  })
}
export function removeRelatedCase(data) {
  return request({
    url: serviceApi.removeRelatedCase,
    method: 'post',
    data
  })
}

//事项引用
export function queryRelatedTasks(data) {
  return request({
    url: serviceApi.queryRelatedTasks,
    method: 'post',
    data
  })
}
export function addRelatedTask(data) {
  return request({
    url: serviceApi.addRelatedTask,
    method: 'post',
    data
  })
}
export function removeRelatedTask(data) {
  return request({
    url: serviceApi.removeRelatedTask,
    method: 'post',
    data
  })
}
export function deleteMaterialUrl(data) {
  return request({
    url: serviceApi.deleteMaterialUrl,
    method: 'post',
    data
  })
}
export function downloadMaterial(data) {
  return request({
    url: serviceApi.downloadMaterial,
    method: 'post',
    data,
    responseType: "blob"
  })
}
export function viewMaterial(data) {
  return request({
    url: serviceApi.viewMaterial,
    method: 'post',
    data,
    responseType: "blob"
  })
}
export function addTaskNote(data) {
  return request({
    url: serviceApi.addTaskNote,
    method: 'post',
    data
  })
}
export function updateTaskNote(data) {
  return request({
    url: serviceApi.updateTaskNote,
    method: 'post',
    data
  })
}
export function deleteTaskNote(data) {
  return request({
    url: serviceApi.deleteTaskNote,
    method: 'post',
    data
  })
}
export function queryTaskNoteList(data) {
  return request({
    url: serviceApi.queryTaskNoteList,
    method: 'post',
    data
  })
}
export function addSubtaskNote(data) {
  return request({
    url: serviceApi.addSubtaskNote,
    method: 'post',
    data
  })
}
export function updateSubtaskNote(data) {
  return request({
    url: serviceApi.updateSubtaskNote,
    method: 'post',
    data
  })
}
export function deleteSubtaskNote(data) {
  return request({
    url: serviceApi.deleteSubtaskNote,
    method: 'post',
    data
  })
}
export function querySubtaskNoteList(data) {
  return request({
    url: serviceApi.querySubtaskNoteList,
    method: 'post',
    data
  })
}
export function queryProjectStatistics(data) {
  return request({
    url: serviceApi.queryProjectStatistics,
    method: 'post',
    data
  })
}
export function checkEditPermission(data) {
  return request({
    url: serviceApi.checkEditPermission,
    method: 'post',
    data
  })
}
export function queryProjectListUrl(data) {
  return request({
    url: serviceApi.queryProjectListUrl,
    method: 'post',
    data
  })
}
export function queryTaskListUrl(data) {
  return request({
    url: serviceApi.queryTaskListUrl,
    method: 'post',
    data
  })
}
export function querySubtaskListUrl(data) {
  return request({
    url: serviceApi.querySubtaskListUrl,
    method: 'post',
    data
  })
}
export function queryUserRoleList(data) {
  return request({
    url: serviceApi.queryUserRoleList,
    method: 'post',
    data
  })
}
export function queryProjectList(data) {
  return request({
    url: serviceApi.queryProjectList,
    method: 'post',
    data
  })
}
export function queryTodoTaskByPrjId(data) {
  return request({
    url: serviceApi.queryTodoTaskByPrjId,
    method: 'post',
    data
  })
}
export function queryMyTasksAsOwner(data) {
  return request({
    url: serviceApi.queryMyTasksAsOwner,
    method: 'post',
    data
  })
}
export function queryOwnerProjects(data) {
  return request({
    url: serviceApi.queryOwnerProjects,
    method: 'post',
    data
  })
}
export function queryOwnerTasksAndSubTasks(data) {
  return request({
    url: serviceApi.queryOwnerTasksAndSubTasks,
    method: 'post',
    data
  })
}
export function queryOwnerSubTasks(data) {
  return request({
    url: serviceApi.queryOwnerSubTasks,
    method: 'post',
    data
  })
}
export function queryMyTaskList(data) {
  return request({
    url: serviceApi.queryMyTaskList,
    method: 'post',
    data
  })
}