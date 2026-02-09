import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'
export function queryAgentTask(data) {
  return request({
    url: ipServiceApi.queryAgentTask,
    method: 'post',
    data
  })
}
export function getAreaList(data) {
  return request({
    url: serviceApi.getAreaList,
    method: 'post',
    data
  })
}
export function queryDeptGroupAndUser(data) {
  return request({
    url: serviceApi.queryDeptGroupAndUser,
    method: 'post',
    data
  })
}
export function queryDeptByCondition(data) {
  return request({
    url: serviceApi.queryDeptByCondition,
    method: 'post',
    data
  })
}
export function deleteDeptId(res) {
  return request({
    url: serviceApi.deleteDeptById,
    method: 'post',
    data: {
      id: res.deptId
    }
  })
}
export function queryDomainNames() {
  return request({
    url: serviceApi.queryDomainNames,
    method: 'post',
    data: {
      agencyId: 1
    }
  })
}
export function selectAllDept(data) {
  return request({
    url: serviceApi.selectAllDept,
    method: 'post',
    data
  })
}

export function updateDeptById(data) {
  return request({
    url: serviceApi.updateDeptById,
    method: 'post',
    data
  })
}
export function createDept(data) {
  return request({
    url: serviceApi.createDept,
    method: 'post',
    data
  })
}
export function queryWorkGroup(data) {
  return request({
    url: serviceApi.queryWorkGroup,
    method: 'post',
    data
  })
}
export function deleteWorkgroup(data) {
  return request({
    url: serviceApi.deleteWorkgroup,
    method: 'post',
    data: { wkgId: data.wkgId }
  })
}
export function queryWorkgroupNames() {
  return request({
    url: serviceApi.queryWorkgroupNames,
    method: 'post',
    data: { }
  })
}

export function selectWorkgroupById(num) {
  return request({
    url: serviceApi.selectWorkgroupById,
    method: 'post',
    data: { wkgId: num }
  })
}
export function queryUsers(data) {
  return request({
    url: serviceApi.queryUsers,
    method: 'post',
    data: data
  })
}
export function queryRoleNames() {
  return request({
    url: serviceApi.queryRoleNames,
    method: 'post',
    data: {  }
  })
}
export function createWorkgroup(sendData) {
  return request({
    url: serviceApi.createWorkgroup,
    method: 'post',
    data: sendData
  })
}

export function updateById(sendData) {
  return request({
    url: serviceApi.updateById,
    method: 'post',
    data: sendData
  })
}
export function queryUserNames() {
  return request({
    url: serviceApi.queryUserNames,
    method: 'post',
    data: {}
  })
}
export function queryPosition(){
  return request({
    url: serviceApi.queryPosition,
    method: 'post',
    data: {}
  })
}
export function queryCustName(data) {
  return request({
    url: serviceApi.queryCustName,
    method: 'post',
    data
  })
}
export function addUser(data) {
  return request({
    url: serviceApi.addUser,
    method: 'post',
    data: data
  })
}
export function updateUser(data) {
  return request({
    url: serviceApi.updateUser,
    method: 'post',
    data: data
  })
}
export function addUserIcon(data) {
  return request({
    url: serviceApi.addUserIcon,
    method: 'post',
    data: data
  })
}
export function queryUserById(userId) {
  return request({
    url: serviceApi.queryUserById,
    method: 'post',
    data: { userId },
    isLoading: true
  })
}
export function deleteUser(userId){
  return request({
    url: serviceApi.deleteUser,
    method: 'post',
    data: { userId }
  })
}
export function queryDomains(data){
  return request({
    url: serviceApi.queryDomains,
    method: 'post',
    data
  })
}
export function createDomain(data){
  return request({
    url: serviceApi.createDomain,
    method: 'post',
    data
  })
}
export function domainDelete(data){
  return request({
    url: serviceApi.domainDelete,
    method: 'post',
    data
  })
}
export function domainUpdate(data) {
  return request({
    url: serviceApi.domainUpdate,
    method: 'post',
    data
  })
}
export function queryWorkgroupsByDomainId(data) {
  return request({
    url: serviceApi.queryWorkgroupsByDomainId,
    method: 'post',
    data
  })
}
// 角色
export function queryAllRoles(data) {
  return request({
    url: serviceApi.queryAllRoles,
    method: 'post',
    data
  })
}
export function deleteRoleById(data) {
  return request({
    url: serviceApi.deleteRoleById,
    method: 'post',
    data
  })
}
export function addUserForPermission(data) {
  return request({
    url: serviceApi.addUserForPermission,
    method: 'post',
    data
  })
}
export function queryUserIdByPermission(data) {
  return request({
    url: serviceApi.queryUserIdByPermission,
    method: 'post',
    data
  })
}
export function createRole(data) {
  return request({
    url: serviceApi.createRole,
    method: 'post',
    data
  })
}

export function updateRoleById(data) {
  return request({
    url: serviceApi.updateRoleById,
    method: 'post',
    data
  })
}
export function deleteGroupOrDeptById(data) {
  return request({
    url: serviceApi.deleteGroupOrDeptById,
    method: 'post',
    data
  })
}
export function updateDeptOrWorkDominId(data) {
  return request({
    url: serviceApi.updateDeptOrWorkDominId,
    method: 'post',
    data
  })
}

export function queryDepts() {
  return request({
    url: serviceApi.queryDepts,
    method: 'post',
    data:{}
  })
}
export function queryAllPermission(data) {
  return request({
    url: serviceApi.queryAllPermission,
    method: 'post',
    data
  })
}
export function addPermissionForRole(data) {
  return request({
    url: serviceApi.addPermissionForRole,
    method: 'post',
    data
  })
}
export function addPermissionForUser(data) {
  return request({
    url: serviceApi.addPermissionForUser,
    method: 'post',
    data
  })
}
export function queryRolesByPermissionId(id) {
  return request({
    url: serviceApi.queryRolesByPermissionId,
    method: 'post',
    data:{id}
  })
}

export function queryPermissionsByUserId(userId) {
  return request({
    url: serviceApi.queryPermissionsByUserId,
    method: 'post',
    data:{userId}
  })
}
export function queryWkgRole(data) {
  return request({
    url: ipServiceApi.queryWkgRole,
    method: 'post',
    data
  })
}
export function queryWorkByUserId(data) {
  return request({
    url: ipServiceApi.queryWorkByUserId,
    method: 'post',
    data
  })
}
export function queryChargeItemList(data) {
  return request({
    url: serviceApi.queryChargeItemList,
    method: 'post',
    data
  })
}
export function deleteChargeItem(data) {
  return request({
    url: serviceApi.deleteChargeItem,
    method: 'post',
    data
  })
}
export function queryChargeItemInfo(data) {
  return request({
    url: serviceApi.queryChargeItemInfo,
    method: 'post',
    data
  })
}
export function updateChargeItem(data) {
  return request({
    url: serviceApi.updateChargeItem,
    method: 'post',
    data
  })
}
export function addChargeItemInfo(data) {
  return request({
    url: serviceApi.addChargeItemInfo,
    method: 'post',
    data
  })
}
export function queryCustomerListByUserId(data) {
  return request({
    url: serviceApi.queryCustomerListByUserId,
    method: 'post',
    data
  })
}
export function saveLog(data) {
  return request({
    url: ipServiceApi.saveLog,
    method: 'post',
    data,
    isLoading: false
  })
}
export function insertSystemUpdateRecord(data) {
  return request({
    url: ipServiceApi.insertSystemUpdateRecord,
    method: 'post',
    data
  })
}
export function deleteSystemUpdateRecord(data) {
  return request({
    url: ipServiceApi.deleteSystemUpdateRecord,
    method: 'post',
    data
  })
}
export function updateSystemUpdateRecord(data) {
  return request({
    url: ipServiceApi.updateSystemUpdateRecord,
    method: 'post',
    data
  })
}
export function querySystemUpdateRecord(data) {
  return request({
    url: ipServiceApi.querySystemUpdateRecord,
    method: 'post',
    data
  })
}
export function querySystemUpdateRecordList(data) {
  return request({
    url: ipServiceApi.querySystemUpdateRecordList,
    method: 'post',
    data
  })
}
export function updateUserPassWordByUsername(data) {
  return request({
    url: ipServiceApi.updateUserPassWordByUsername,
    method: 'post',
    data
  })
}
export function queryMenuFabConfigByUserId(data) {
  return request({
    url: ipServiceApi.queryMenuFabConfigByUserId,
    method: 'post',
    data
  })
}
export function saveMenuFabConfig(data) {
  return request({
    url: ipServiceApi.saveMenuFabConfig,
    method: 'post',
    data
  })
}
