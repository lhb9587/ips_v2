import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'
export function queryKnowledgeBase(data){
  return request({
    url: ipServiceApi.queryKnowledgeBase,
    method: 'get',
    data
  })
}
export function queryFilter(data){
  return request({
    url: ipServiceApi.queryFilter,
    method: 'post',
    data
  })
}
export function configFilter(data){
  return request({
    url: ipServiceApi.configFilter,
    method: 'post',
    data
  })
}

export function queryPropertyList(data){
  return request({
    url: ipServiceApi.queryPropertyList,
    method: 'post',
    data
  })
}
export function queryDoc(data){
  return request({
    url: ipServiceApi.queryDoc,
    method: 'post',
    data
  })
}
export function queryDocStructure(data){
  return request({
    url: ipServiceApi.queryDocStructure,
    method: 'post',
    data
  })
}
export function queryDocList(data){
  return request({
    url: ipServiceApi.queryDocList,
    method: 'post',
    data
  })
}
export function queryDocDetail(data){
  return request({
    url: ipServiceApi.queryDocDetail,
    method: 'post',
    data
  })
}
export function queryDocBystId(data){
  return request({
    url: ipServiceApi.queryDocBystId,
    method: 'post',
    data
  })
}
export function queryCaseTypeList(data){
  return request({
    url: ipServiceApi.queryCaseTypeList,
    method: 'post',
    data
  })
}
export function queryPageData(data){
  return request({
    url: ipServiceApi.queryPageData,
    method: 'post',
    data
  })
}
export function queryFilterConfig(data){
  return request({
    url: ipServiceApi.queryFilterConfig,
    method: 'post',
    data
  })
}
export function queryNavigation(data){
  return request({
    url: ipServiceApi.queryNavigation,
    method: 'post',
    data
  })
}
export function queryKnowledgeProperty(data){
  return request({
    url: ipServiceApi.queryKnowledgeProperty,
    method: 'post',
    data
  })
}
export function updateKnowledgeProperty(data){
  return request({
    url: ipServiceApi.updateKnowledgeProperty,
    method: 'post',
    data
  })
}
export function queryRuleByindex(data){
  return request({
    url: ipServiceApi.queryRuleByindex,
    method: 'post',
    data
  })
}
export function queryRuleByRuleName(data){
  return request({
    url: ipServiceApi.queryRuleByRuleName,
    method: 'post',
    data
  })
}
export function queryProperty(data){
  return request({
    url: ipServiceApi.queryProperty,
    method: 'post',
    data
  })
}
export function insertRule(data){
  return request({
    url: ipServiceApi.insertRule,
    method: 'post',
    data
  })
}
export function updateRule(data){
  return request({
    url: ipServiceApi.updateRule,
    method: 'post',
    data
  })
}
export function deleteRule(data){
  return request({
    url: ipServiceApi.deleteRule,
    method: 'post',
    data
  })
}
export function analysisWord(formData,cb){
  return request({
    url: ipServiceApi.analysisWord,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb(a)
    }
  })
}
export function queryContents(data){
  return request({
    url: ipServiceApi.queryContents,
    method: 'post',
    data
  })
}
export function queryContentsDelTitle(data){
  return request({
    url: ipServiceApi.queryContentsDelTitle,
    method: 'post',
    data
  })
}
export function analysisWordOne(formData,cb){
  return request({
    url: ipServiceApi.analysisWordOne,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb(a)
    }
  })
}
export function queryTongJiGOutline(data){
  return request({
    url: ipServiceApi.queryTongJiGOutline,
    method: 'post',
    data
  })
}
export function queryUpdateDate(data){
  return request({
    url: ipServiceApi.queryUpdateDate,
    method: 'post',
    data
  })
}
export function updateDocCensus(data){
  return request({
    url: ipServiceApi.updateDocCensus,
    method: 'post',
    data
  })
}
export function addComment(data){
  return request({
    url: ipServiceApi.addComment,
    method: 'post',
    data
  })
}
export function queryCdResult(data){
  return request({
    url: ipServiceApi.queryCdResult,
    method: 'post',
    data
  })
}
export function checkRule(data){
  return request({
    url: ipServiceApi.checkRule,
    method: 'post',
    data
  })
}
export function queryKbLibList(data){
  return request({
    url: ipServiceApi.queryKbLibList,
    method: 'post',
    data
  })
}
export function queryUserLibList(data){
  return request({
    url: ipServiceApi.queryUserLibList,
    method: 'post',
    data
  })
}
export function queryKbLibUser(data){
  return request({
    url: ipServiceApi.queryKbLibUser,
    method: 'post',
    data
  })
}
export function updateUserLib(data){
  return request({
    url: ipServiceApi.updateUserLib,
    method: 'post',
    data
  })
}
