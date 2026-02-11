import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function querySortPermission(data) {
  return request({
    url: serviceApi.querySortPermission,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryMaterialByUserIdAndYear(data) {
  return request({
    url: serviceApi.queryMaterialByUserIdAndYear,
    method: 'post',
    data,
    isLoading: false
  })
}
export function updateSortPermission(data) {
  return request({
    url: serviceApi.updateSortPermission,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCountryList(data) {
  return request({
    url: serviceApi.queryCountryList,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createDir(data) {
  return request({
    url: serviceApi.createDir,
    method: 'post',
    data
  })
}
export function deleteDir(data) {
  return request({
    url: serviceApi.deleteDir,
    method: 'post',
    data
  })
}
export function queryNwDocTypeList(data) {
  return request({
    url: serviceApi.queryNwDocTypeList,
    method: 'post',
    data,
    idLoading: false
  })
}
export function queryContinentByWorldArea(data) {
  return request({
    url: serviceApi.queryContinentByWorldArea,
    method: 'post',
    data,
    idLoading: false
  })
}
export function queryContinent(data) {
  return request({
    url: serviceApi.queryContinent,
    method: 'post',
    data,
    idLoading: false
  })
}
export function queryCountryAgency(data) {
  return request({
    url: serviceApi.queryCountryAgency,
    method: 'post',
    data
  })
}
export function queryNwMaterial(data) {
  return request({
    url: serviceApi.queryNwMaterial,
    method: 'post',
    data
  })
}
export function modifyNwMaterial(data) {
  return request({
    url: serviceApi.modifyNwMaterial,
    method: 'post',
    data
  })
}
export function modifyDir(data) {
  return request({
    url: serviceApi.modifyDir,
    method: 'post',
    data
  })
}
export function moveNwMaterialAndDir(data) {
  return request({
    url: serviceApi.moveNwMaterialAndDir,
    method: 'post',
    data
  })
}
export function copyNwMaterialAndDir(data) {
  return request({
    url: serviceApi.copyNwMaterialAndDir,
    method: 'post',
    data
  })
}
export function deleteNwMaterial(data) {
  return request({
    url: serviceApi.deleteNwMaterial,
    method: 'post',
    data
  })
}
export function deleteMail(data) {
  return request({
    url: serviceApi.deleteMail,
    method: 'post',
    data
  })
}
export function queryNwCaseTypeList(data) {
  return request({
    url: serviceApi.queryNwCaseTypeList,
    method: 'post',
    data
  })
}
export function createNwCaseType(data) {
  return request({
    url: serviceApi.createNwCaseType,
    method: 'post',
    data
  })
}
export function createNwMaterial(data) {
  return request({
    url: serviceApi.createNwMaterial,
    method: 'post',
    data,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function createArchives(data) {
  return request({
    url: serviceApi.createArchives,
    method: 'post',
    data
  })
}
export function updateArchives(data) {
  return request({
    url: serviceApi.updateArchives,
    method: 'post',
    data
  })
}
export function queryArchivesInfo(data) {
  return request({
    url: serviceApi.queryArchivesInfo,
    method: 'post',
    data
  })
}
export function delArchives(data) {
  return request({
    url: serviceApi.delArchives,
    method: 'post',
    data
  })
}
export function updateArchivesStatus(data) {
  return request({
    url: serviceApi.updateArchivesStatus,
    method: 'post',
    data
  })
}
export function queryArchivesList(data) {
  return request({
    url: serviceApi.queryArchivesList,
    method: 'post',
    data
  })
}
export function batchUpdateArchives(data) {
  return request({
    url: serviceApi.batchUpdateArchives,
    method: 'post',
    data
  })
}
export function copyArchives(data) {
  return request({
    url: serviceApi.copyArchives,
    method: 'post',
    data
  })
}
export function uploadArchivesMaterial(formData,cb) {
  return request({
    url: serviceApi.uploadArchivesMaterial,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb&&cb(a)
    },
  })
}
export function deleteArchivesMaterial(data) {
  return request({
    url: serviceApi.deleteArchivesMaterial,
    method: 'post',
    data
  })
}
export function queryArchivesStatusByBarcode(data) {
  return request({
    url: serviceApi.queryArchivesStatusByBarcode,
    method: 'post',
    data
  })
}
export function uploadSampleMaterial(formData,cb) {
  return request({
    url: serviceApi.uploadSampleMaterial,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb&&cb(a)
    },
  })
}
export function deleteSampleMaterial(data) {
  return request({
    url: serviceApi.deleteSampleMaterial,
    method: 'post',
    data
  })
}
export function exportArchivesBack(data) {
  return request({
    url: serviceApi.exportArchivesBack,
    method: 'post',
    data
  })
}
export function exportLendArchivesPortrait(data) {
  return request({
    url: serviceApi.exportLendArchivesPortrait,
    method: 'post',
    data
  })
}
export function exportLendArchivesCrossWise(data) {
  return request({
    url: serviceApi.exportLendArchivesCrossWise,
    method: 'post',
    data
  })
}
export function exportArchivesTakeAway(data) {
  return request({
    url: serviceApi.exportArchivesTakeAway,
    method: 'post',
    data
  })
}
export function exportArchivesRemoteStore(data) {
  return request({
    url: serviceApi.exportArchivesRemoteStore,
    method: 'post',
    data
  })
}
export function statisticsManagerOperationTimes(data) {
  return request({
    url: serviceApi.statisticsManagerOperationTimes,
    method: 'post',
    data
  })
}
export function statisticsAgentNumsCount(data) {
  return request({
    url: serviceApi.statisticsAgentNumsCount,
    method: 'post',
    data
  })
}
export function initArchivesOriginalFile(data) {
  return request({
    url: serviceApi.initArchivesOriginalFile,
    method: 'post',
    data
  })
}
export function queryArchivesAndSampleList(data) {
  return request({
    url: serviceApi.queryArchivesAndSampleList,
    method: 'post',
    data
  })
}

export function querySampleList(data) {
  return request({
    url: serviceApi.querySampleList,
    method: 'post',
    data
  })
}
export function createSample(data) {
  return request({
    url: serviceApi.createSample,
    method: 'post',
    data
  })
}
export function updateSample(data) {
  return request({
    url: serviceApi.updateSample,
    method: 'post',
    data
  })
}
export function updateSampleStatus(data) {
  return request({
    url: serviceApi.updateSampleStatus,
    method: 'post',
    data
  })
}
export function querySampleInfo(data) {
  return request({
    url: serviceApi.querySampleInfo,
    method: 'post',
    data
  })
}
export function batchUpdateSamples(data) {
  return request({
    url: serviceApi.batchUpdateSamples,
    method: 'post',
    data
  })
}
export function copySample(data) {
  return request({
    url: serviceApi.copySample,
    method: 'post',
    data
  })
}
export function delSample(data) {
  return request({
    url: serviceApi.delSample,
    method: 'post',
    data
  })
}
export function exportSampleLendOut(data) {
  return request({
    url: serviceApi.exportSampleLendOut,
    method: 'post',
    data
  })
}
export function exportSampleSendOut(data) {
  return request({
    url: serviceApi.exportSampleSendOut,
    method: 'post',
    data
  })
}
export function exportSampleDestroy(data) {
  return request({
    url: serviceApi.exportSampleDestroy,
    method: 'post',
    data
  })
}
export function sampleWorkloadStatistics(data) {
  return request({
    url: serviceApi.sampleWorkloadStatistics,
    method: 'post',
    data
  })
}
