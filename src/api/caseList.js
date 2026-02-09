import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'
import ipServiceApi from '@/api/ipServiceApi.config.js'

export function createTmCaseQuotesTemplate(data) {
  return request({
    url: serviceApi.createTmCaseQuotesTemplate,
    method: 'post',
    data,
    // isLoading: false
  })
}
export function queryLawCaseClause(data) {
  return request({
    url: serviceApi.queryLawCaseClause,
    method: 'post',
    data,
    // isLoading: false
  })
}
// 撰写流程
export function queryArticleWriter(data) {
  return request({
    url: serviceApi.queryArticleWriter,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryZxLevel(data) {
  return request({
    url: serviceApi.queryZxLevel,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryZxCaseCount(data) {
  return request({
    url: serviceApi.queryZxCaseCount,
    method: 'post',
    data,
    isLoading: true
  })
}
export function uploadImageAndReadGoods(formData,cb) {
  return request({
    url: serviceApi.uploadImageAndReadGoods,
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
export function queryImageGoodsList(data) {
  return request({
    url: serviceApi.queryImageGoodsList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryImageGoodsContrast(data) {
  return request({
    url: serviceApi.queryImageGoodsContrast,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryArticleDetail(data) {
  return request({
    url: serviceApi.queryArticleDetail,
    method: 'post',
    data,
    isLoading: true
  })
}
export function updateCaseCust(data) {
  return request({
    url: serviceApi.updateCaseCust,
    method: 'post',
    data,
    isLoading: true
  })
}
export function updateCaseCustInfo(data) {
  return request({
    url: serviceApi.updateCaseCustInfo,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryArticleList(data) {
  return request({
    url: serviceApi.queryArticleList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function modifyArticleApp(data) {
  return request({
    url: serviceApi.modifyArticleApp,
    method: 'post',
    data,
    isLoading: true
  })
}
export function doArticleTask(data) {
  return request({
    url: serviceApi.doArticleTask,
    method: 'post',
    data,
    isLoading: true
  })
}
export function deleteArticleApp(data) {
  return request({
    url: serviceApi.deleteArticleApp,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryCustPOAPerson(data) {
  return request({
    url: serviceApi.queryCustPOAPerson,
    method: 'post',
    data,
    isLoading: true
  })
}
export function endorseArticleCaseTasker(data) {
  return request({
    url: serviceApi.endorseArticleCaseTasker,
    method: 'post',
    data,
    isLoading: true
  })
}
export function createArticleApp(data) {
  return request({
    url: serviceApi.createArticleApp,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryRefCaseIdList(data) {
  return request({
    url: serviceApi.queryRefCaseIdList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryDefaultUser(data) {
  return request({
    url: ipServiceApi.queryDefaultUser,
    method: 'post',
    data,
    isLoading: true
  })
}
export function copyMaterial(data) {
  return request({
    url: ipServiceApi.copyMaterial,
    method: 'post',
    data,
    isLoading: true
  })
}
export function modifyMaterialStatus(data) {
  return request({
    url: ipServiceApi.modifyMaterialStatus,
    method: 'post',
    data,
    isLoading: true
  })
}
export function deleteFile(data) {
  return request({
    url: ipServiceApi.deleteFile,
    method: 'post',
    data,
    isLoading: true
  })
}
export function updateZczStatus(data) {
  return request({
    url: ipServiceApi.updateZczStatus,
    method: 'post',
    data,
    isLoading: true
  })
}
export function decFile(data) {
  return request({
    url: ipServiceApi.decFile,
    method: 'post',
    data,
    isLoading: true
  })
}
// 商标审限
export function queryTrademarkHearTermList(data) {
  return request({
    url: ipServiceApi.queryTrademarkHearTermList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryTrademarkHearTermById(data) {
  return request({
    url: ipServiceApi.queryTrademarkHearTermById,
    method: 'post',
    data,
    isLoading: true
  })
}
export function updateTrademarkHearTerm(data) {
  return request({
    url: ipServiceApi.updateTrademarkHearTerm,
    method: 'post',
    data,
    isLoading: true
  })
}
export function addTrademarkHearTerm(data) {
  return request({
    url: ipServiceApi.addTrademarkHearTerm,
    method: 'post',
    data,
    isLoading: true
  })
}
export function delTrademarkHearTermById(data) {
  return request({
    url: ipServiceApi.delTrademarkHearTermById,
    method: 'post',
    data,
    isLoading: true
  })
}
export function translate(data) {
  return request({
    url: ipServiceApi.translate,
    method: 'post',
    data,
    isLoading: true
  })
}
export function relevantCase(data) {
  return request({
    url: ipServiceApi.relevantCase,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryCaseByagent(data) {
  return request({
    url: ipServiceApi.queryCaseByagent,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryRelevantCase(data) {
  return request({
    url: ipServiceApi.queryRelevantCase,
    method: 'post',
    data,
    isLoading: true
  })
}
export function getTimelimitObj(data) {
  return request({
    url: ipServiceApi.getTimelimitObj,
    method: 'post',
    data,
    isLoading: false
  })
}
export function batchDownloadCPCExcel(data) {
  return request({
    url: serviceApi.batchDownloadCPCExcel,
    method: 'post',
    data
  })
}
export function batchDownloadCPCDocs(data) {
  return request({
    url: serviceApi.batchDownloadCPCDocs,
    method: 'post',
    data
  })
}
export function createCode(data) {
  return request({
    url: serviceApi.createCode,
    method: 'post',
    data
  })
}
export function recordOnlienEdit(data) {
  return request({
    url: serviceApi.recordOnlienEdit,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createTask(data) {
  return request({
    url: serviceApi.createTask,
    method: 'post',
    data
  })
}
export function queryMaterialByCaseIdUrl(data) {
  return request({
    url: serviceApi.queryMaterialByCaseIdUrl,
    method: 'post',
    data
  })
}
export function queryCaseType(data) {
  return request({
    url: serviceApi.queryCaseType,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCustomerNameId(data) {
  return request({
    url: serviceApi.queryCustomerNameId,
    method: 'post',
    data: Object.assign(data, { 'isCustomer': 1 }),
    isLoading: false
  })
}
export function queryDeliver(data) {
  return request({
    url: serviceApi.queryDeliver,
    method: 'post',
    data
  })
}
export function queryAlltask(data,config={}) {
  return request({
    url: serviceApi.queryAlltask,
    method: 'post',
    data,
    ...config
  })
}
export function queryCasesByTaskId(data) {
  return request({
    url: serviceApi.queryCasesByTaskId,
    method: 'post',
    data
  })
}
export function selectColumn(data) {
  return request({
    url: serviceApi.selectColumn,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryPreference(data) {
  return request({
    url: serviceApi.queryPreference,
    method: 'post',
    data,
    isLoading: false
  })
}
export function savePreference(data) {
  return request({
    url: serviceApi.savePreference,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCaseList(data) {
  return request({
    url: serviceApi.queryCaseList,
    method: 'post',
    data,
    isLoading: true,
  })
}
export function getAllCaseInfo(data,config = {}) {
  return request({
    url: serviceApi.getAllCaseInfo,
    method: 'post',
    data,
    ...config
  })
}
export function deleteTask(data) {
  return request({
    url: serviceApi.deleteTask,
    method: 'post',
    data
  })
}
export function delPreference(data) {
  return request({
    url: serviceApi.delPreference,
    method: 'post',
    data
  })
}
export function queryFilter(data) {
  return request({
    url: serviceApi.queryFilter,
    method: 'post',
    data
  })
}
export function configFilter(data) {
  return request({
    url: serviceApi.configFilter,
    method: 'post',
    data
  })
}
export function queryFilterConfig(data) {
  return request({
    url: serviceApi.queryFilterConfig,
    method: 'post',
    data
  })
}
export function addWaitCases(data) {
  return request({
    url: ipServiceApi.addWaitCases,
    method: 'post',
    data
  })
}
export function getCaption(data) {
  return request({
    url: ipServiceApi.getCaption,
    method: 'post',
    data
  })
}
export function queryLawList(data) {
  return request({
    url: ipServiceApi.queryLawList,
    method: 'post',
    data
  })
}
export function deleteWaitCase(data) {
  return request({
    url: ipServiceApi.deleteWaitCase,
    method: 'post',
    data
  })
}
export function preCaseApproval(data) {
  return request({
    url: ipServiceApi.preCaseApproval,
    method: 'post',
    data
  })
}
export function transferDoc(data) {
  return request({
    url: ipServiceApi.transferDoc,
    method: 'post',
    data
  })
}
export function importCPCFile(data) {
  return request({
    url: ipServiceApi.importCPCFile,
    method: 'post',
    data
  })
}
export function queryUnloadedDocFromCPC(data) {
  return request({
    url: ipServiceApi.queryUnloadedDocFromCPC,
    method: 'post',
    data
  })
}
export function queryCaseInfo(data) {
  return request({
    url: ipServiceApi.queryCaseInfo,
    method: 'post',
    data,
    isLoading: true
  })
}
export function preSubmit(data) {
  return request({
    url: ipServiceApi.preSubmit,
    method: 'post',
    data
  })
}
export function officialCase(data) {
  return request({
    url: ipServiceApi.officialCase,
    method: 'post',
    data
  })
}
export function batchHeigCredit(data) {
  return request({
    url: ipServiceApi.batchHeigCredit,
    method: 'post',
    data
  })
}
export function passOrReturn(data) {
  return request({
    url: ipServiceApi.passOrReturn,
    method: 'post',
    data
  })
}
export function GSQQueryAllClass(data) {
  return request({
    url: ipServiceApi.GSQQueryAllClass,
    method: 'post',
    data
  })
}
export function checkCases(data) {
  return request({
    url: ipServiceApi.checkCases,
    method: 'post',
    data
  })
}
export function queryDocByDraftNumber(data) {
  return request({
    url: ipServiceApi.queryDocByDraftNumber,
    method: 'post',
    data
  })
}
export function zipDoc(data) {
  return request({
    url: ipServiceApi.zipDoc,
    method: 'post',
    data
  })
}
export function delCase(data) {
  return request({
    url: ipServiceApi.delCase,
    method: 'post',
    data
  })
}
export function queryMaterialByCaseId(data) {
  return request({
    url: ipServiceApi.queryMaterialByCaseId,
    method: 'post',
    data
  })
}
export function deleteCaseMaterial(data) {
  return request({
    url: ipServiceApi.deleteCaseMaterial,
    method: 'post',
    data
  })
}
export function queryMaterialType(data) {
  return request({
    url: ipServiceApi.queryMaterialType,
    method: 'post',
    data
  })
}
export function creatematerial1(data) {
  return request({
    url: ipServiceApi.creatematerial1,
    method: 'post',
    data
  })
}
export function submitOffical(data) {
  return request({
    url: ipServiceApi.submitOffical,
    method: 'post',
    data
  })
}
export function createSubmitOfficials(data) {
  return request({
    url: ipServiceApi.createSubmitOfficials,
    method: 'post',
    data
  })
}
export function queryUserAll(data) {
  return request({
    url: ipServiceApi.queryUserAll,
    method: 'post',
    data:{...{isActive:1},...data}
  })
}
export function queryInstruction(data) {
  return request({
    url: ipServiceApi.queryInstruction,
    method: 'post',
    data
  })
}
export function submitOfficalAudit(data) {
  return request({
    url: ipServiceApi.submitOfficalAudit,
    method: 'post',
    data
  })
}
export function typeInOfficalDoc(data) {
  return request({
    url: ipServiceApi.typeInOfficalDoc,
    method: 'post',
    data
  })
}
export function queryMailingType(data) {
  return request({
    url: ipServiceApi.queryMailingType,
    method: 'post',
    data
  })
}
export function auditOfficalDoc(data) {
  return request({
    url: ipServiceApi.auditOfficalDoc,
    method: 'post',
    data
  })
}
export function queryDocs(data) {
  return request({
    url: ipServiceApi.queryDocs,
    method: 'post',
    data
  })
}
export function getOfficialInformList(data) {
  return request({
    url: ipServiceApi.getOfficialInformList,
    method: 'post',
    data
  })
}
export function queryCase(data) {
  return request({
    url: ipServiceApi.queryCase,
    method: 'post',
    data
  })
}
export function modifyOfficalDoc(data) {
  return request({
    url: ipServiceApi.modifyOfficalDoc,
    method: 'post',
    data
  })
}
export function queryAppByCusetId(data) {
  return request({
    url: ipServiceApi.queryAppByCusetId,
    method: 'post',
    data
  })
}

export function queryCanProcessTm(data) {
  return request({
    url: ipServiceApi.queryCanProcessTm,
    method: 'post',
    data
  })
}
export function importTmRegNumberData(data) {
  return request({
    url: ipServiceApi.importTmRegNumberData,
    method: 'post',
    data
  })
}
export function getSubmitOfficialList(data) {
  return request({
    url: ipServiceApi.getSubmitOfficialList,
    method: 'post',
    data,
    //isLoading: false
  })
}
export function submitOfficalModify(data) {
  return request({
    url: ipServiceApi.submitOfficalModify,
    method: 'post',
    data
  })
}
export function delCaseMaterial(data) {
  return request({
    url: ipServiceApi.delCaseMaterial,
    method: 'post',
    data
  })
}
export function queryMailList(data) {
  return request({
    url: ipServiceApi.queryMailList,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryMailType(data) {
  return request({
    url: ipServiceApi.queryMailType,
    method: 'post',
    data
  })
}
export function queryCustomerList(data) {
  return request({
    url: serviceApi.queryCustomerList,
    method: 'post',
    data
  })
}
export function queryAppInfoUrl(data) {
  return request({
    url: serviceApi.queryAppInfoUrl,
    method: 'post',
    data
  })
}
export function sendMail(data) {
  return request({
    url: ipServiceApi.sendMail,
    method: 'post',
    isLoading: false,
    isClickForbidden: true,
    data
  })
}
export function tmdetail(data) {
  return request({
    url: ipServiceApi.tmdetail,
    method: 'post',
    data
  })
}
export function queryAgencyName(data) {
  return request({
    url: ipServiceApi.queryAgencyName,
    method: 'post',
    data
  })
}
export function deleteIns(data) {
  return request({
    url: ipServiceApi.deleteIns,
    method: 'post',
    data
  })
}
export function deleteDoc(data) {
  return request({
    url: ipServiceApi.deleteDoc,
    method: 'post',
    data
  })
}
export function deleteCase(data) {
  return request({
    url: ipServiceApi.deleteCase,
    method: 'post',
    data
  })
}
export function getChangeCaseList(data) {
  return request({
    url: ipServiceApi.getChangeCaseList,
    method: 'post',
    data
  })
}
export function create2(data) {
  return request({
    url: ipServiceApi.create2,
    method: 'post',
    data
  })
}

export function querymaterialbyapp(data) {
  return request({
    url: ipServiceApi.querymaterialbyapp,
    method: 'post',
    data
  })
}
export function creatematerialsimple(data) {
  return request({
    url: ipServiceApi.creatematerialsimple,
    method: 'post',
    data
  })
}
export function creatematerial(formData,cb) {
  return request({
    url: serviceApi.creatematerialUrl,
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
export function queryMaterialBySort(data) {
  return request({
    url: ipServiceApi.queryMaterialBySort,
    method: 'post',
    data
  })
}

export function queryMaterialList(data) {
  return request({
    url: ipServiceApi.queryMaterialList,
    method: 'post',
    data
  })
}
export function querySortList(data) {
  return request({
    url: ipServiceApi.querySortList,
    method: 'post',
    data
  })
}
export function restoreMaterial(data) {
  return request({
    url: ipServiceApi.restoreMaterial,
    method: 'post',
    data
  })
}
export function putMaterialIntoRubbish(data) {
  return request({
    url: ipServiceApi.putMaterialIntoRubbish,
    method: 'post',
    data
  })
}
export function downloadMaterial(data) {
  return request({
    url: ipServiceApi.downloadMaterial,
    method: 'post',
    data
  })
}
export function getTimelimitList(data) {
  return request({
    url: ipServiceApi.getTimelimitList,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryWithdraw(data) {
  return request({
    url: ipServiceApi.queryWithdraw,
    method: 'post',
    data
  })
}
export function queryCaseMaterial(data) {
  return request({
    url: ipServiceApi.queryCaseMaterial,
    method: 'post',
    data
  })
}
export function getTimelimitTypeAll(data) {
  return request({
    url: ipServiceApi.getTimelimitTypeAll,
    method: 'post',
    data,
    isLoading:false
  })
}
export function getWriteoffState(data) {
  return request({
    url: ipServiceApi.getWriteoffState,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryMaterialDocType(data) {
  return request({
    url: ipServiceApi.queryMaterialDocType,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryMaterialTypeByDocId(data) {
  return request({
    url: ipServiceApi.queryMaterialTypeByDocId,
    method: 'post',
    data,
    isLoading:false
  })
}
export function getCase(data) {
  return request({
    url: ipServiceApi.getCase,
    method: 'post',
    data,
    isLoading:false
  })
}
export function delTimelimit(data) {
  return request({
    url: ipServiceApi.delTimelimit,
    method: 'post',
    data
  })
}

export function upTimelimit(data) {
  return request({
    url: ipServiceApi.upTimelimit,
    method: 'post',
    data
  })
}
export function getTimelimitByCaseId(data) {
  return request({
    url: ipServiceApi.getTimelimitByCaseId,
    method: 'post',
    data
  })
}
export function addTimelimit(data) {
  return request({
    url: ipServiceApi.addTimelimit,
    method: 'post',
    data
  })
}
export function getTimelimitDetail(data) {
  return request({
    url: ipServiceApi.getTimelimitDetail,
    method: 'post',
    data
  })
}
export function getTimelimitType(data) {
  return request({
    url: ipServiceApi.getTimelimitType,
    method: 'post',
    data
  })
}
export function getAbslimitDate(data) {
  return request({
    url: ipServiceApi.getAbslimitDate,
    method: 'post',
    data
  })
}
export function queryMaterialById(data) {
  return request({
    url: ipServiceApi.queryMaterialById,
    method: 'post',
    data
  })
}
export function updateMaterial(data) {
  return request({
    url: ipServiceApi.updateMaterial,
    method: 'post',
    data
  })
}
export function getTimelimitListByTltId(data) {
  return request({
    url: ipServiceApi.getTimelimitListByTltId,
    method: 'post',
    data,
  })
}
export function getCaseStage(data) {
  return request({
    url: ipServiceApi.getCaseStage,
    method: 'post',
    data
  })
}
export function getTimelimitWriteoff(data) {
  return request({
    url: ipServiceApi.getTimelimitWriteoff,
    method: 'post',
    data
  })
}
export function addTimelimitWriteoff(data) {
  return request({
    url: ipServiceApi.addTimelimitWriteoff,
    method: 'post',
    data
  })
}
export function auditTimelimit(data) {
  return request({
    url: ipServiceApi.auditTimelimit,
    method: 'post',
    data
  })
}
export function queryCaseByMaterialId(data) {
  return request({
    url: ipServiceApi.queryCaseByMaterialId,
    method: 'post',
    data
  })
}
export function getBusinessList(data) {
  return request({
    url: ipServiceApi.getBusinessList,
    method: 'post',
    data
  })
}
export function modifyjoinapp(data) {
  return request({
    url: ipServiceApi.modifyjoinapp,
    method: 'post',
    data
  })
}
export function sendBusiness(data) {
  return request({
    url: ipServiceApi.sendBusiness,
    method: 'post',
    data
  })
}
export function getRemindRecord(data) {
  return request({
    url: ipServiceApi.getRemindRecord,
    method: 'post',
    data
  })
}
export function getRemindType(data) {
  return request({
    url: ipServiceApi.getRemindType,
    method: 'post',
    data
  })
}
export function upRemindType(data) {
  return request({
    url: ipServiceApi.upRemindType,
    method: 'post',
    data
  })
}
export function getPlan(data) {
  return request({
    url: ipServiceApi.getPlan,
    method: 'post',
    data
  })
}

export function getManualRecognitionOfficialInfoCount(data) {
  return request({
    url: ipServiceApi.getManualRecognitionOfficialInfoCount,
    method: 'post',
    data,
    isLoading: false
  })
}
export function recognizedError(data) {
  return request({
    url: ipServiceApi.recognizedError,
    method: 'post',
    data
  })
}
export function getManualRecognitionOfficialInfoList(data) {
  return request({
    url: ipServiceApi.getManualRecognitionOfficialInfoList,
    method: 'post',
    data
  })
}
export function queryTrademarkCaseByOfficialDoc(data) {
  return request({
    url: ipServiceApi.queryTrademarkCaseByOfficialDoc,
    method: 'post',
    data,
    isLoading:false
  })
}
export function manualBindOfficialDocAndCase(data) {
  return request({
    url: ipServiceApi.manualBindOfficialDocAndCase,
    method: 'post',
    data
  })
}
export function modifyOfficalDocBatch(data) {
  return request({
    url: ipServiceApi.modifyOfficalDocBatch,
    method: 'post',
    data
  })
}
export function lowCreditAudit(data) {
  return request({
    url: ipServiceApi.lowCreditAudit,
    method: 'post',
    data
  })
}
export function queryBillTask(data,config={}) {
  return request({
    url: ipServiceApi.queryBillTask,
    method: 'post',
    data,
    ...config
  })
}
export function batchdoBillTask(data) {
  return request({
    url: ipServiceApi.batchdoBillTask,
    method: 'post',
    data
  })
}
export function queryBudgetFee(data) {
  return request({
    url: ipServiceApi.queryBudgetFee,
    method: 'post',
    data
  })
}
export function queryBudgetAndFeeDetail(data) {
  return request({
    url: ipServiceApi.queryBudgetAndFeeDetail,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBudget(data) {
  return request({
    url: ipServiceApi.queryBudget,
    method: 'post',
    data
  })
}
export function queryAppAddrByTm(data) {
  return request({
    url: ipServiceApi.queryAppAddrByTm,
    method: 'post',
    data
  })
}
export function createBudget(data) {
  return request({
    url: ipServiceApi.createBudget,
    method: 'post',
    data
  })
}
export function saveBudget(data) {
  return request({
    url: ipServiceApi.saveBudget,
    method: 'post',
    data
  })
}
export function addBudget(data) {
  return request({
    url: ipServiceApi.addBudget,
    method: 'post',
    data
  })
}
export function createBudgetConfig(data) {
  return request({
    url: ipServiceApi.createBudgetConfig,
    method: 'post',
    data
  })
}
export function queryChangedBudget(data) {
  return request({
    url: ipServiceApi.queryChangedBudget,
    method: 'post',
    data,
    isLoading:false
  })
}
export function getCaseByTmFileId(data) {
  return request({
    url: ipServiceApi.getCaseByTmFileId,
    method: 'post',
    data
  })
}
export function queryBudgetList(data) {
  return request({
    url: ipServiceApi.queryBudgetList,
    method: 'post',
    data
  })
}
export function queryDepartMent(data) {
  return request({
    url: ipServiceApi.queryDepartMent,
    method: 'post',
    data
  })
}
export function queryBudgetByFeetId(data) {
  return request({
    url: ipServiceApi.queryBudgetByFeetId,
    method: 'post',
    data
  })
}
export function queryFeeType(data) {
  return request({
    url: ipServiceApi.queryFeeType,
    method: 'post',
    data
  })
}
export function submitBudget(data) {
  return request({
    url: ipServiceApi.submitBudget,
    method: 'post',
    data
  })
}
export function queryBudgetDetailSum(data) {
  return request({
    url: ipServiceApi.queryBudgetDetailSum,
    method: 'post',
    data
  })
}
export function modifyMaterialType(data) {
  return request({
    url: ipServiceApi.modifyMaterialType,
    method: 'post',
    data
  })
}
export function queryBudgetConfig(data) {
  return request({
    url: ipServiceApi.queryBudgetConfig,
    method: 'post',
    data
  })
}
export function queryBudgetForAjust(data) {
  return request({
    url: ipServiceApi.queryBudgetForAjust,
    method: 'post',
    data
  })
}
export function queryBudgetFeeType(data) {
  return request({
    url: ipServiceApi.queryBudgetFeeType,
    method: 'post',
    data
  })
}
export function ajustBudget(data) {
  return request({
    url: ipServiceApi.ajustBudget,
    method: 'post',
    data
  })
}

export function updateBudgetConfig(data) {
  return request({
    url: ipServiceApi.updateBudgetConfig,
    method: 'post',
    data
  })
}
export function deleteBudgetConfig(data) {
  return request({
    url: ipServiceApi.deleteBudgetConfig,
    method: 'post',
    data
  })
}
export function auditBudget(data) {
  return request({
    url: ipServiceApi.auditBudget,
    method: 'post',
    data
  })
}
export function queryTaskUser(data) {
  return request({
    url: ipServiceApi.queryTaskUser,
    method: 'post',
    data
  })
}
export function queryAppUser(data) {
  return request({
    url: ipServiceApi.queryAppUser,
    method: 'post',
    data
  })
}
export function deleteBudget(data) {
  return request({
    url: ipServiceApi.deleteBudget,
    method: 'post',
    data
  })
}
export function queryHerderList(data) {
  return request({
    url: ipServiceApi.queryHerderList,
    method: 'post',
    data
  })
}
export function deriveList(data) {
  return request({
    url: ipServiceApi.deriveList,
    method: 'post',
    data
  })
}
export function getCaseTimelimitList(data) {
  return request({
    url: ipServiceApi.getCaseTimelimitList,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryCorrelationCaseList(data) {
  return request({
    url: ipServiceApi.queryCorrelationCaseList,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryMailTypeAll(data) {
  return request({
    url: ipServiceApi.queryMailTypeAll,
    method: 'post',
    data,
    isLoading: false
  })
}
export function createMultMaterial(formData,cb) {
  return request({
    url: ipServiceApi.createMultMaterial,
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
export function createMultSubmitMaterial(formData,cb) {
  return request({
    url: ipServiceApi.createMultSubmitMaterial,
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
export function getCaseStageBytimeTypeWriteoffState(data) {
  return request({
    url: ipServiceApi.getCaseStageBytimeTypeWriteoffState,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBudgetLog(data) {
  return request({
    url: ipServiceApi.queryBudgetLog,
    method: 'post',
    data
  })
}
export function queryOperator(data) {
  return request({
    url: ipServiceApi.queryOperator,
    method: 'post',
    data
  })
}
export function remainingBudget(data) {
  return request({
    url: ipServiceApi.remainingBudget,
    method: 'post',
    data
  })
}
export function queryReport(data) {
  return request({
    url: ipServiceApi.queryReport,
    method: 'post',
    data
  })
}
export function noCase(data) {
  return request({
    url: ipServiceApi.noCase,
    method: 'post',
    data
  })
}
export function assignCase(data) {
  return request({
    url: ipServiceApi.assignCase,
    method: 'post',
    data
  })
}
export function assginTaskCandidate(data) {
  return request({
    url: ipServiceApi.assginTaskCandidate,
    method: 'post',
    data
  })
}
export function queryTackBackTask(data) {
  return request({
    url: ipServiceApi.queryTackBackTask,
    method: 'post',
    data
  })
}
export function queryAssignTask(data) {
  return request({
    url: ipServiceApi.queryAssignTask,
    method: 'post',
    data
  })
}

export function tackBackTask(data) {
  return request({
    url: ipServiceApi.tackBackTask,
    method: 'post',
    data
  })
}
export function getSum(data,config={}) {
  return request({
    url: ipServiceApi.getSum,
    method: 'post',
    data,
    ...config
  })
}
export function createReceiptTemplate(data){
  return request({
    url: ipServiceApi.createReceiptTemplate,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryBillReceipt(data){
  return request({
    url: ipServiceApi.queryBillReceipt,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryReceiptIitem(data){
  return request({
    url: ipServiceApi.queryReceiptIitem,
    method: 'post',
    data,
    isLoading: false
  })
}
export function updateReceiptBatch(data){
  return request({
    url: ipServiceApi.updateReceiptBatch,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryReceiptList(data,config={}){
  return request({
    url: ipServiceApi.queryReceiptList,
    method: 'post',
    data,
    ...config,
  })
}
export function queryReceiptCompany(data){
  return request({
    url: ipServiceApi.queryReceiptCompany,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryBankaccountListBycustId(data){
  return request({
    url: ipServiceApi.queryBankaccountListBycustId,
    method: 'post',
    data,
    isLoading: false
  })
}
export function updateMail(data){
  return request({
    url: ipServiceApi.updateMail,
    method: 'post',
    data,
    isLoading: false
  })
}
export function getFilterScheme(data){
  return request({
    url: ipServiceApi.getFilterScheme,
    method: 'post',
    data,
    isLoading: false
  })
}
export function addFilterScheme(data){
  return request({
    url: ipServiceApi.addFilterScheme,
    method: 'post',
    data,
    isLoading: false
  })
}
export function delFilterScheme(data){
  return request({
    url: ipServiceApi.delFilterScheme,
    method: 'post',
    data,
    isLoading: false
  })
}
export function getTmDate(data){
  return request({
    url: ipServiceApi.getTmDate,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryFeeTaskDefine(data){
  return request({
    url: ipServiceApi.queryFeeTaskDefine,
    method: 'post',
    data,
    isLoading: false
  })
}
export function saveReceipt(data){
  return request({
    url: ipServiceApi.saveReceipt,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryReceiptDetail(data){
  return request({
    url: ipServiceApi.queryReceiptDetail,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryApplicantByIdList(data){
  return request({
    url: ipServiceApi.queryApplicantByIdList,
    method: 'post',
    data,
    isLoading: false
  })
}
export function getAdversaryArray(data){
  return request({
    url: ipServiceApi.getAdversaryArray,
    method: 'post',
    data,
    isLoading: false
  })
}
export function submitReceipt(data){
  return request({
    url: ipServiceApi.submitReceipt,
    method: 'post',
    data,
  })
}
export function deleteReceipt(data){
  return request({
    url: ipServiceApi.deleteReceipt,
    method: 'post',
    data,
  })
}
export function getDocNumber(data){
  return request({
    url: ipServiceApi.getDocNumber,
    method: 'post',
    data,
  })
}
export function upWorkMember(data){
  return request({
    url: ipServiceApi.upWorkMember,
    method: 'post',
    data,
    isLoading:false
  })
}

export function queryKeyName(data){
  return request({
    url: ipServiceApi.queryKeyName,
    method: 'post',
    data,
  })
}
export function getCaseWorkgroupChangeMessage(data){
  return request({
    url: ipServiceApi.getCaseWorkgroupChangeMessage,
    method: 'post',
    data,
    isLoading:false
  })
}
export function upCaseWorkgroupChangeMessage(data){
  return request({
    url: ipServiceApi.upCaseWorkgroupChangeMessage,
    method: 'post',
    data,
  })
}
export function receiptCreateReceipt(data){
  return request({
    url: ipServiceApi.receiptCreateReceipt,
    method: 'post',
    data,
  })
}
export function receiptToTask(data){
  return request({
    url: ipServiceApi.receiptToTask,
    method: 'post',
    data,
  })
}
export function changeCaseStage(data){
  return request({
    url: ipServiceApi.changeCaseStage,
    method: 'post',
    data,
  })
}
export function queryCaseProgress(data){
  return request({
    url: ipServiceApi.queryCaseProgress,
    method: 'post',
    data,
  })
}
export function checkPermission(data){
  return request({
    url: ipServiceApi.checkPermission,
    method: 'post',
    data,
  })
}
export function queryAuditUserList(data){
  return request({
    url: ipServiceApi.queryAuditUserList,
    method: 'post',
    data,
  })
}
export function queryCaseFeeInfo(data){
  return request({
    url: ipServiceApi.queryCaseFeeInfo,
    method: 'post',
    data,
  })
}
export function queryServerIp(data){
  return request({
    url: ipServiceApi.queryServerIp,
    method: 'post',
    data,
  })
}
export function revocationTimelimitWriteoff(data){
  return request({
    url: ipServiceApi.revocationTimelimitWriteoff,
    method: 'post',
    data,
  })
}
export function queryCaseMaterialList(data){
  return request({
    url: ipServiceApi.queryCaseMaterialList,
    method: 'post',
    data,
  })
}
export function copyCase(data){
  return request({
    url: ipServiceApi.copyCase,
    method: 'post',
    data,
  })
}
export function queryTrademarkCaseOfficial(data){
  return request({
    url: ipServiceApi.queryTrademarkCaseOfficial,
    method: 'post',
    data,
  })
}
export function doAbroadBillTask(data){
  return request({
    url: ipServiceApi.doAbroadBillTask,
    method: 'post',
    data,
  })
}
export function uploadDocFile(formData,cb) {
  return request({
    url: ipServiceApi.uploadDocFile,
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
export function queryBillRecordListByBillRecordIds(data){
  return request({
    url: ipServiceApi.queryBillRecordListByBillRecordIds,
    method: 'post',
    data,
  })
}
export function updateBillRecordListByBillRecordIds(data){
  return request({
    url: ipServiceApi.updateBillRecordListByBillRecordIds,
    method: 'post',
    data,
  })
}
export function billRecordDelete(data){
  return request({
    url: ipServiceApi.billRecordDelete,
    method: 'post',
    data,
  })
}
export function queryTaskDefine(data){
  return request({
    url: ipServiceApi.queryTaskDefine,
    method: 'post',
    data,
  })
}
export function queryCaseAbroadBillInfo(data){
  return request({
    url: ipServiceApi.queryCaseAbroadBillInfo,
    method: 'post',
    data,
    isLoading: false
  })
}
export function modifyCaseType(data){
  return request({
    url: ipServiceApi.modifyCaseType,
    method: 'post',
    data
  })
}
export function modifyCaseStage(data){
  return request({
    url: ipServiceApi.modifyCaseStage,
    method: 'post',
    data
  })
}
export function getCaseInfo(data){
  return request({
    url: ipServiceApi.getCaseInfo,
    method: 'post',
    data
  })
}
export function queryCaseProgressName(data){
  return request({
    url: ipServiceApi.queryCaseProgressName,
    method: 'post',
    data
  })
}
export function getCaseHistory(data){
  return request({
    url: ipServiceApi.getCaseHistory,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryUserByRoleId(data){
  return request({
    url: ipServiceApi.queryUserByRoleId,
    method: 'post',
    data
  })
}
export function queryLogList(data){
  return request({
    url: ipServiceApi.queryLogList,
    method: 'get',
    data
  })
}
export function getPropertyList(data){
  return request({
    url: ipServiceApi.getPropertyList,
    method: 'post',
    data
  })
}
export function createPatentMultMaterial(data) {
  return request({
    url: serviceApi.createPatentMultMaterial,
    method: 'post',
    data
  })
}
export function getSubmitDate(data){
  return request({
    url: ipServiceApi.getSubmitDate,
    method: 'post',
    data
  })
}
export function getApprovalNumber(data){
  return request({
    url: ipServiceApi.getApprovalNumber,
    method: 'post',
    data
  })
}
export function updateWkg(data){
  return request({
    url: ipServiceApi.updateWkg,
    method: 'post',
    data
  })
}
export function queryCustomerSource(data){
  return request({
    url: ipServiceApi.queryCustomerSource,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCaseWork(data){
  return request({
    url: ipServiceApi.queryCaseWork,
    method: 'post',
    data
  })
}
export function getCaseTime(data){
  return request({
    url: ipServiceApi.getCaseTime,
    method: 'post',
    data
  })
}
export function queryTmEdition(data){
  return request({
    url: ipServiceApi.queryTmEdition,
    method: 'post',
    data
  })
}
export function queryTmTarget(data){
  return request({
    url: ipServiceApi.queryTmTarget,
    method: 'post',
    data
  })
}
export function importTmMonitorData(data){
  return request({
    url: ipServiceApi.importTmMonitorData,
    method: 'post',
    data
  })
}
export function uploadBatchFile(formData,cb){
  return request({
    url: ipServiceApi.uploadBatchFile,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb&&cb(a)
    }
  })
}
export function queryFileByTltId(data){
  return request({
    url: ipServiceApi.queryFileByTltId,
    method: 'post',
    data
  })
}
export function addProjectTaskGroup(data){
  return request({
    url: serviceApi.addProjectTaskGroup,
    method: 'post',
    data
  })
}
export function copyCaseData(data){
  return request({
    url: serviceApi.copyCaseData,
    method: 'post',
    data
  })
}
export function queryProjectTask(data){
  return request({
    url: serviceApi.queryProjectTask,
    method: 'post',
    data
  })
}
export function modifyProjectTaskGroup(data){
  return request({
    url: serviceApi.modifyProjectTaskGroup,
    method: 'post',
    data
  })
}
export function deleteProjectTaskGroup(data){
  return request({
    url: serviceApi.deleteProjectTaskGroup,
    method: 'post',
    data
  })
}
export function addProjectTask(data){
  return request({
    url: serviceApi.addProjectTask,
    method: 'post',
    data
  })
}
export function modifyProjectTask(data){
  return request({
    url: serviceApi.modifyProjectTask,
    method: 'post',
    data
  })
}
export function deleteProjectTask(data){
  return request({
    url: serviceApi.deleteProjectTask,
    method: 'post',
    data
  })
}
export function assginTask(data){
  if(localStorage.getItem('executor')){
   let arr= JSON.parse(localStorage.getItem('executor'))
    if(arr.includes(data.executor)){
      arr=arr.filter(item=>item!=data.executor)
      arr.unshift(data.executor)
    }else {
      arr.unshift(data.executor)
      arr = arr.slice(0, 5)
    }
    localStorage.setItem('executor',JSON.stringify(arr))
  }else {
    localStorage.setItem('executor',JSON.stringify([data.executor]))
  }
  return request({
    url: serviceApi.assginTask,
    method: 'post',
    data
  })
}
export function stopTaskHours(data){
  return request({
    url: serviceApi.stopTaskHours,
    method: 'post',
    data
  })
}
export function submitTask(data){
  return request({
    url: serviceApi.submitTask,
    method: 'post',
    data
  })
}
export function auditTask(data){
  return request({
    url: serviceApi.auditTask,
    method: 'post',
    data
  })
}
export function queryToDoTask(data){
  return request({
    url: serviceApi.queryToDoTask,
    method: 'post',
    data
  })
}
export function addTaskHours(data){
  return request({
    url: serviceApi.addTaskHours,
    method: 'post',
    data
  })
}
export function startTaskHours(data){
  return request({
    url: serviceApi.startTaskHours,
    method: 'post',
    data
  })
}
export function deleteTaskHours(data){
  return request({
    url: serviceApi.deleteTaskHours,
    method: 'post',
    data
  })
}
export function modifyTaskNo(data){
  return request({
    url: serviceApi.modifyTaskNo,
    method: 'post',
    data
  })
}
export function queryAutoWorkHours(data){
  return request({
    url: serviceApi.queryAutoWorkHours,
    method: 'post',
    data,
    isLoading:false
  })
}
export function submitWorkHours(data){
  return request({
    url: serviceApi.submitWorkHours,
    method: 'post',
    data
  })
}
export function auditWorkHours(data){
  return request({
    url: serviceApi.auditWorkHours,
    method: 'post',
    data
  })
}
export function modifyTaskHours(data){
  return request({
    url: serviceApi.modifyTaskHours,
    method: 'post',
    data
  })
}
export function queryTaskUserList(data){
  return request({
    url: serviceApi.queryTaskUserList,
    method: 'post',
    data
  })
}
export function queryTmAnnouncement(data){
  return request({
    url: ipServiceApi.queryTmAnnouncement,
    method: 'post',
    data
  })
}
export function queryTmRecordType(data){
  return request({
    url: ipServiceApi.queryTmRecordType,
    method: 'post',
    data
  })
}
// export function tmAnnouncement(data){
//   return request({
//     url: ipServiceApi.tmAnnouncement,
//     method: 'post',
//     data
//   })
// }
export function addBillRecord(data){
  return request({
    url: ipServiceApi.addBillRecord,
    method: 'post',
    data
  })
}
export function queryWorkHourTask(data,config={}){
  return request({
    url: serviceApi.queryWorkHourTask,
    method: 'post',
    data,
    ...config
  })
}
export function updateWorkHourTasker(data){
  return request({
    url: serviceApi.updateWorkHourTasker,
    method: 'post',
    data
  })
}
export function queryIfHehuoren(data){
  return request({
    url: serviceApi.queryIfHehuoren,
    method: 'post',
    data
  })
}
export function queryActiveWorkgroupBossUserList(data){
  return request({
    url: serviceApi.queryActiveWorkgroupBossUserList,
    method: 'post',
    data
  })
}
export function queryWorkHours(data,config={}){
  return request({
    url: serviceApi.queryWorkHours,
    method: 'post',
    isLoading: true,
    data,
    ...config
  })
}
export function queryWorkType(data){
  return request({
    url: serviceApi.queryWorkType,
    method: 'post',
    data
  })
}
export function queryCaseIdByAgentNum(data){
  return request({
    url: serviceApi.queryCaseIdByAgentNum,
    method: 'post',
    data
  })
}
export function queryUsersTaskList(data){
  return request({
    url: serviceApi.queryUsersTaskList,
    method: 'post',
    data
  })
}
export function pauseTaskHours(data){
  return request({
    url: serviceApi.pauseTaskHours,
    method: 'post',
    data
  })
}
export function delayTask(data){
  return request({
    url: serviceApi.delayTask,
    method: 'post',
    data
  })
}
export function shenpiTask(data){
  return request({
    url: serviceApi.shenpiTask,
    method: 'post',
    data
  })
}
export function bindTmplateFile(data){
  return request({
    url: serviceApi.bindTmplateFile,
    method: 'post',
    data
  })
}
export function copyTemplFile(data){
  return request({
    url: serviceApi.copyTemplFile,
    method: 'post',
    data
  })
}
export function unbindTaskFile(data){
  return request({
    url: serviceApi.unbindTaskFile,
    method: 'post',
    data
  })
}
export function unbindTmplateFile(data){
  return request({
    url: serviceApi.unbindTmplateFile,
    method: 'post',
    data
  })
}
export function bindTaskFile(data){
  return request({
    url: serviceApi.bindTaskFile,
    method: 'post',
    data
  })
}
export function modifyTaskMessage(data){
  return request({
    url: serviceApi.modifyTaskMessage,
    method: 'post',
    data
  })
}
export function queryRecentCase(data){
  return request({
    url: serviceApi.queryRecentCase,
    method: 'post',
    data
  })
}
export function queryHourUserList(data){
  return request({
    url: serviceApi.queryHourUserList,
    method: 'post',
    data
  })
}
export function queryProjecTeptId(data){
  return request({
    url: serviceApi.queryProjecTeptId,
    method: 'post',
    data
  })
}
export function createTemplateByPrj(data){
  return request({
    url: serviceApi.createTemplateByPrj,
    method: 'post',
    data
  })
}
export function queryTmFirstCheck(data){
  return request({
    url: ipServiceApi.queryTmFirstCheck,
    method: 'post',
    data
  })
}
export function queryTmFirstCheckByDsId(data){
  return request({
    url: ipServiceApi.queryTmFirstCheckByDsId,
    method: 'post',
    data,
    isLoading:false
  })
}
export function tmFirstCheck(formData,cb){
  return request({
    url: ipServiceApi.tmFirstCheck,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb&&cb(a)
    }
  })
}
export function tmAnnouncement(formData,cb){
  return request({
    url: ipServiceApi.tmAnnouncement,
    method: 'post',
    data: formData,
    contentType: false,
    processData: false,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress(a){
      cb&&cb(a)
    }
  })
}

export function queryRemindPlan(data){
  return request({
    url: ipServiceApi.queryRemindPlan,
    method: 'post',
    data
  })
}
export function getRemindPlan(data){
  return request({
    url: ipServiceApi.getRemindPlan,
    method: 'post',
    data
  })
}
export function addRemindPlan(data){
  return request({
    url: ipServiceApi.addRemindPlan,
    method: 'post',
    data
  })
}
export function modifyRemindPlan(data){
  return request({
    url: ipServiceApi.modifyRemindPlan,
    method: 'post',
    data
  })
}
export function deleteRemindPlan(data){
  return request({
    url: ipServiceApi.deleteRemindPlan,
    method: 'post',
    data
  })
}
export function viewMsg(data){
  return request({
    url: ipServiceApi.viewMsg,
    method: 'post',
    data
  })
}
export function viewPdf(data){
  return request({
    url: ipServiceApi.viewPdf,
    method: 'post',
    data
  })
}
export function queryTotalHour(data){
  return request({
    url: ipServiceApi.queryTotalHour,
    method: 'post',
    data
  })
}
export function queryList(data){
  return request({
    url: ipServiceApi.queryList,
    method: 'post',
    data
  })
}
export function querySimilarCustomer(data){
  return request({
    url: ipServiceApi.querySimilarCustomer,
    method: 'post',
    data
  })
}
export function BillInternalQueryToDoTask(data,config={}){
  return request({
    url: ipServiceApi.BillInternalQueryToDoTask,
    method: 'post',
    data,
    ...config
  })
}
export function updateTmFirstCheckInfo(data){
  return request({
    url: ipServiceApi.updateTmFirstCheckInfo,
    method: 'post',
    data
  })
}
export function deleteTmFirstCheckInfo(data){
  return request({
    url: ipServiceApi.deleteTmFirstCheckInfo,
    method: 'post',
    data
  })
}
export function addTmFirstCheckInfo(data){
  return request({
    url: ipServiceApi.addTmFirstCheckInfo,
    method: 'post',
    data
  })
}
export function deleteMaterialById(data){
  return request({
    url: ipServiceApi.deleteMaterialById,
    method: 'post',
    data
  })
}
export function queryDeptGroup(data){
  return request({
    url: ipServiceApi.queryDeptGroup,
    method: 'post',
    data
  })
}
export function createProject(data){
  return request({
    url: ipServiceApi.createProject,
    method: 'post',
    data
  })
}
export function queryProjectList(data){
  return request({
    url: ipServiceApi.queryProjectList,
    method: 'post',
    data
  })
}
export function queryRecentProject(data){
  return request({
    url: ipServiceApi.queryRecentProject,
    method: 'post',
    data
  })
}
export function queryRecentMeeting(data){
  return request({
    url: ipServiceApi.queryRecentMeeting,
    method: 'post',
    data
  })
}
export function queryProjectDetail(data){
  return request({
    url: ipServiceApi.queryProjectDetail,
    method: 'post',
    data
  })
}
export function modifyProject(data){
  return request({
    url: ipServiceApi.modifyProject,
    method: 'post',
    data
  })
}
export function deleteProject(data){
  return request({
    url: ipServiceApi.deleteProject,
    method: 'post',
    data
  })
}
export function queryTaskById(data){
  return request({
    url: ipServiceApi.queryTaskById,
    method: 'post',
    data
  })
}
export function queryProjectFeeInfo(data){
  return request({
    url: ipServiceApi.queryProjectFeeInfo,
    method: 'post',
    data
  })
}
export function createFeeInProject(data){
  return request({
    url: ipServiceApi.createFeeInProject,
    method: 'post',
    data
  })
}
export function modifyRemindPlanPm(data){
  return request({
    url: ipServiceApi.modifyRemindPlanPm,
    method: 'post',
    data
  })
}
export function finishTask(data){
  return request({
    url: ipServiceApi.finishTask,
    method: 'post',
    data
  })
}
export function addTaskWach(data){
  return request({
    url: ipServiceApi.addTaskWach,
    method: 'post',
    data
  })
}
export function deleteTaskWach(data){
  return request({
    url: ipServiceApi.deleteTaskWach,
    method: 'post',
    data
  })
}
export function queryTaskWatch(data){
  return request({
    url: ipServiceApi.queryTaskWatch,
    method: 'post',
    data
  })
}
export function addTaskMemo(data){
  return request({
    url: ipServiceApi.addTaskMemo,
    method: 'post',
    data
  })
}
export function modifyTaskMemo(data){
  return request({
    url: ipServiceApi.modifyTaskMemo,
    method: 'post',
    data
  })
}
export function deleteTaskMemo(data){
  return request({
    url: ipServiceApi.deleteTaskMemo,
    method: 'post',
    data
  })
}
export function queryTaskMemo(data){
  return request({
    url: ipServiceApi.queryTaskMemo,
    method: 'post',
    data
  })
}
export function taskFinishTask(data){
  return request({
    url: ipServiceApi.taskFinishTask,
    method: 'post',
    data
  })
}
export function getRemindRecordDetail(data){
  return request({
    url: ipServiceApi.getRemindRecordDetail,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryMaterialByObjTypeAndInstId(data){
  return request({
    url: ipServiceApi.queryMaterialByObjTypeAndInstId,
    method: 'post',
    data
  })
}
export function queryInvoiceBorrowList(data){
  return request({
    url: ipServiceApi.queryInvoiceBorrowList,
    method: 'post',
    data
  })
}
export function createInvoiceBorrow(data){
  return request({
    url: ipServiceApi.createInvoiceBorrow,
    method: 'post',
    data
  })
}
export function modifyInvoiceBorrow(data){
  return request({
    url: ipServiceApi.modifyInvoiceBorrow,
    method: 'post',
    data
  })
}
export function doInvoiceBorrowTask(data){
  return request({
    url: ipServiceApi.doInvoiceBorrowTask,
    method: 'post',
    data
  })
}
export function deleteInvoiceBorrow(data){
  return request({
    url: ipServiceApi.deleteInvoiceBorrow,
    method: 'post',
    data
  })
}
export function checkInvoiceBorrowTasker(data){
  return request({
    url: ipServiceApi.checkInvoiceBorrowTasker,
    method: 'post',
    data
  })
}
export function endorseInvoiceBorrow(data){
  return request({
    url: ipServiceApi.endorseInvoiceBorrow,
    method: 'post',
    data
  })
}
// 批量修改欠票人
export function modifyInvoiceBorrowBatch(data){
  return request({
    url: ipServiceApi.modifyInvoiceBorrowBatch,
    method: 'post',
    data
  })
}
// 归还欠票
export function returnInvoice(data){
  return request({
    url: ipServiceApi.returnInvoice,
    method: 'post',
    data
  })
}
// 发票库
export function queryInvoiceLibrary(data){
  return request({
    url: ipServiceApi.queryInvoiceLibrary,
    method: 'post',
    data
  })
}
export function createInvoice(data){
  return request({
    url: ipServiceApi.createInvoice,
    method: 'post',
    data
  })
}
export function modifyInvoice(data){
  return request({
    url: ipServiceApi.modifyInvoice,
    method: 'post',
    data
  })
}
export function deleteInvoice(data){
  return request({
    url: ipServiceApi.deleteInvoice,
    method: 'post',
    data
  })
}
export function modifyInvoiceStatus(data){
  return request({
    url: ipServiceApi.modifyInvoiceStatus,
    method: 'post',
    data
  })
}
export function modifyVeriCode(data){
  return request({
    url: ipServiceApi.modifyVeriCode,
    method: 'post',
    data
  })
}
export function batchModifyInvoice(data){
  return request({
    url: ipServiceApi.batchModifyInvoice,
    method: 'post',
    data
  })
}
export function checkInvoice(data){
  return request({
    url: ipServiceApi.checkInvoice,
    method: 'post',
    data
  })
}
export function batchProcess(data){
  return request({
    url: ipServiceApi.batchProcess,
    method: 'post',
    data
  })
}

// 借款管理
export function queryLoanList(data){
  return request({
    url: ipServiceApi.queryLoanList,
    method: 'post',
    data
  })
}
export function createLoan(data){
  return request({
    url: ipServiceApi.createLoan,
    method: 'post',
    data
  })
}
export function deleteLoan(data){
  return request({
    url: ipServiceApi.deleteLoan,
    method: 'post',
    data
  })
}
export function modifyLoan(data){
  return request({
    url: ipServiceApi.modifyLoan,
    method: 'post',
    data
  })
}
export function checkBorrowTasker(data){
  return request({
    url: ipServiceApi.checkBorrowTasker,
    method: 'post',
    data
  })
}
export function endorseBorrow(data){
  return request({
    url: ipServiceApi.endorseBorrow,
    method: 'post',
    data
  })
}
export function doLoanTask(data){
  return request({
    url: ipServiceApi.doLoanTask,
    method: 'post',
    data
  })
}

// 报表中心
export function queryFinancialList(data){
  return request({
    url: ipServiceApi.queryFinancialList,
    method: 'post',
    data
  })
}
export function queryFinancialDoc(data){
  return request({
    url: ipServiceApi.queryFinancialDoc,
    method: 'post',
    data
  })
}
export function deleteFinancialDoc(data){
  return request({
    url: ipServiceApi.deleteFinancialDoc,
    method: 'post',
    data
  })
}
export function financialCreateExcel(data){
  return request({
    url: ipServiceApi.financialCreateExcel,
    method: 'post',
    data
  })
}
export function createFinancial(data){
  return request({
    url: ipServiceApi.createFinancial,
    method: 'post',
    data
  })
}
export function modifyFinancial(data){
  return request({
    url: ipServiceApi.modifyFinancial,
    method: 'post',
    data
  })
}
export function deleteFinancial(data){
  return request({
    url: ipServiceApi.deleteFinancial,
    method: 'post',
    data
  })
}
export function queryFinancialLocked(data){
  return request({
    url: ipServiceApi.queryFinancialLocked,
    method: 'post',
    data
  })
}
export function modifyFinancialLocked(data){
  return request({
    url: ipServiceApi.modifyFinancialLocked,
    method: 'post',
    data
  })
}
export function queryReportCompany(data){
  return request({
    url: ipServiceApi.queryReportCompany,
    method: 'post',
    data
  })
}
export function queryReportCompany1(data){
  return request({
    url: ipServiceApi.queryReportCompany1,
    method: 'post',
    data
  })
}
export function queryReportCompanySelect(data){
  return request({
    url: ipServiceApi.queryReportCompanySelect,
    method: 'post',
    data
  })
}
export function createOrModifyCompany(data){
  return request({
    url: ipServiceApi.createOrModifyCompany,
    method: 'post',
    data
  })
}
export function deleteReportCompany(data){
  return request({
    url: ipServiceApi.deleteReportCompany,
    method: 'post',
    data
  })
}
export function queryfSalaryList(data){
  return request({
    url: ipServiceApi.queryfSalaryList,
    method: 'post',
    data
  })
}
export function createFSalary(data){
  return request({
    url: ipServiceApi.createFSalary,
    method: 'post',
    data
  })
}
export function modifyfSalary(data){
  return request({
    url: ipServiceApi.modifyfSalary,
    method: 'post',
    data
  })
}
export function salaryCreateExcel(data){
  return request({
    url: ipServiceApi.salaryCreateExcel,
    method: 'post',
    data
  })
}
export function deletefSalary(data){
  return request({
    url: ipServiceApi.deletefSalary,
    method: 'post',
    data
  })
}
export function querySalaryLocked(data){
  return request({
    url: ipServiceApi.querySalaryLocked,
    method: 'post',
    data
  })
}
export function modifySalaryLocked(data){
  return request({
    url: ipServiceApi.modifySalaryLocked,
    method: 'post',
    data
  })
}
export function queryFManageDevList(data){
  return request({
    url: ipServiceApi.queryFManageDevList,
    method: 'post',
    data
  })
}
export function createFManageDev(data){
  return request({
    url: ipServiceApi.createFManageDev,
    method: 'post',
    data
  })
}
export function modifyFManageDev(data){
  return request({
    url: ipServiceApi.modifyFManageDev,
    method: 'post',
    data
  })
}
export function manageDevCreateExcel(data){
  return request({
    url: ipServiceApi.manageDevCreateExcel,
    method: 'post',
    data
  })
}
export function deleteFManageDev(data){
  return request({
    url: ipServiceApi.deleteFManageDev,
    method: 'post',
    data
  })
}
export function queryManageDevLocked(data){
  return request({
    url: ipServiceApi.queryManageDevLocked,
    method: 'post',
    data
  })
}
export function modifyManageDevLocked(data){
  return request({
    url: ipServiceApi.modifyManageDevLocked,
    method: 'post',
    data
  })
}
export function queryFProfitLossList(data){
  return request({
    url: ipServiceApi.queryFProfitLossList,
    method: 'post',
    data
  })
}
export function createFProfitLoss(data){
  return request({
    url: ipServiceApi.createFProfitLoss,
    method: 'post',
    data
  })
}
export function modifyFProfitLoss(data){
  return request({
    url: ipServiceApi.modifyFProfitLoss,
    method: 'post',
    data
  })
}
export function profitLossCreateExcel(data){
  return request({
    url: ipServiceApi.profitLossCreateExcel,
    method: 'post',
    data
  })
}
export function deleteFProfitLoss(data){
  return request({
    url: ipServiceApi.deleteFProfitLoss,
    method: 'post',
    data
  })
}
export function queryProfitLossLocked(data){
  return request({
    url: ipServiceApi.queryProfitLossLocked,
    method: 'post',
    data
  })
}
export function modifyProfitLossLocked(data){
  return request({
    url: ipServiceApi.modifyProfitLossLocked,
    method: 'post',
    data
  })
}
export function queryFAssetsDebtList(data){
  return request({
    url: ipServiceApi.queryFAssetsDebtList,
    method: 'post',
    data
  })
}
export function createFAssetsDebt(data){
  return request({
    url: ipServiceApi.createFAssetsDebt,
    method: 'post',
    data
  })
}
export function modifyFAssetsDebt(data){
  return request({
    url: ipServiceApi.modifyFAssetsDebt,
    method: 'post',
    data
  })
}
export function assetsDebtCreateExcel(data){
  return request({
    url: ipServiceApi.assetsDebtCreateExcel,
    method: 'post',
    data
  })
}
export function deleteFAssetsDebt(data){
  return request({
    url: ipServiceApi.deleteFAssetsDebt,
    method: 'post',
    data
  })
}
export function queryAssetsDebtLocked(data){
  return request({
    url: ipServiceApi.queryAssetsDebtLocked,
    method: 'post',
    data
  })
}
export function modifyAssetsDebtLocked(data){
  return request({
    url: ipServiceApi.modifyAssetsDebtLocked,
    method: 'post',
    data
  })
}
export function queryFFundBalanceList(data){
  return request({
    url: ipServiceApi.queryFFundBalanceList,
    method: 'post',
    data
  })
}
export function createFFundBalance(data){
  return request({
    url: ipServiceApi.createFFundBalance,
    method: 'post',
    data
  })
}
export function modifyFFundBalance(data){
  return request({
    url: ipServiceApi.modifyFFundBalance,
    method: 'post',
    data
  })
}
export function fundBalanceCreateExcel(data){
  return request({
    url: ipServiceApi.fundBalanceCreateExcel,
    method: 'post',
    data
  })
}
export function deleteFFundBalance(data){
  return request({
    url: ipServiceApi.deleteFFundBalance,
    method: 'post',
    data
  })
}
export function queryFundBalanceLocked(data){
  return request({
    url: ipServiceApi.queryFundBalanceLocked,
    method: 'post',
    data
  })
}
export function modifyFundBalanceLocked(data){
  return request({
    url: ipServiceApi.modifyFundBalanceLocked,
    method: 'post',
    data
  })
}
export function queryFFundRegions(data){
  return request({
    url: ipServiceApi.queryFFundRegions,
    method: 'post',
    data
  })
}
export function queryFFundAccountList(data){
  return request({
    url: ipServiceApi.queryFFundAccountList,
    method: 'post',
    data
  })
}
export function createFFundRegions(data){
  return request({
    url: ipServiceApi.createFFundRegions,
    method: 'post',
    data
  })
}
export function modifyFFundRegions(data){
  return request({
    url: ipServiceApi.modifyFFundRegions,
    method: 'post',
    data
  })
}
export function createFFundBalanceBatch(data){
  return request({
    url: ipServiceApi.createFFundBalanceBatch,
    method: 'post',
    data
  })
}
export function modifyFFundBalanceBatch(data){
  return request({
    url: ipServiceApi.modifyFFundBalanceBatch,
    method: 'post',
    data
  })
}
export function deleteFFundRegions(data) {
  return request({
    url: ipServiceApi.deleteFFundRegions,
    method: 'post',
    data
  })
}
export function queryLastMonthFFundRegionsDetail(data) {
  return request({
    url: ipServiceApi.queryLastMonthFFundRegionsDetail,
    method: 'post',
    data
  })
}
export function createFFundAccount(data) {
  return request({
    url: ipServiceApi.createFFundAccount,
    method: 'post',
    data
  })
}
export function modifyFFundAccount(data) {
  return request({
    url: ipServiceApi.modifyFFundAccount,
    method: 'post',
    data
  })
}
export function deleteFFundAccount(data) {
  return request({
    url: ipServiceApi.deleteFFundAccount,
    method: 'post',
    data
  })
}
export function getWorkDateList(data) {
  return request({
    url: ipServiceApi.getWorkDateList,
    method: 'post',
    data
  })
}
export function updateWorkDate(data) {
  return request({
    url: ipServiceApi.updateWorkDate,
    method: 'post',
    data
  })
}
export function insertWorkDate(data) {
  return request({
    url: ipServiceApi.insertWorkDate,
    method: 'post',
    data
  })
}
export function delWorkDate(data) {
  return request({
    url: ipServiceApi.delWorkDate,
    method: 'post',
    data
  })
}
export function protectionCaseTemplateGeneration(data) {
  return request({
    url: ipServiceApi.protectionCaseTemplateGeneration,
    method: 'post',
    data
  })
}
export function downloadEvidenceMaterialzipPackage(data) {
  return request({
    url: ipServiceApi.downloadEvidenceMaterialzipPackage,
    method: 'post',
    data
  })
}
export function queryCustGroupByCaseId(data) {
  return request({
    url: ipServiceApi.queryCustGroupByCaseId,
    method: 'post',
    data
  })
}
export function queryAccountCustList(data) {
  return request({
    url: ipServiceApi.queryAccountCustList,
    method: 'post',
    data
  })
}
export function authorizeIPS() {
  return request({
    url: ipServiceApi.authorizeIPS,
    method: 'post',
  })
}
// updateTmFirstCheckInfo :SYS_URL+'tmMonitor/updateTmFirstCheckInfo',
//   deleteTmFirstCheckInfo :SYS_URL+'tmMonitor/deleteTmFirstCheckInfo',
//   addTmFirstCheckInfo :SYS_URL+'tmMonitor/addTmFirstCheckInfo',

//  String queryUserList = ipPort +'/chat/interface/user/queryUserList';
//  String login = ipPort +'/chat/interface/auth/login';

// export function qyeryTasks(data) {
//   return request({
//     url: ipServiceApi.qyeryTasks,
//     method: 'get',
//     data
//   })
// }
// let sumList=['getBusinessNum', 'getTimelimitNum', 'taskQueryAll', 'sumQueryMailList', 'queryBilltaskNum']
// export function getSum(){
//   return Promise.all(sumList.map(item=> request({
//      url: ipServiceApi[item],
//      method: 'post',
//      isLoading: false
//    })))
// }
export function getTimelimitNum(data) {
  return request({
    url: ipServiceApi.getTimelimitNum,
    method: 'post',
    data,
    isLoading: false
  })
}
export function statisticCase(data) {
  return request({
    url: serviceApi.statisticCase,
    method: 'post',
    data,
    isLoading: true
  })
}
export function getCaseInfoByCaseId(data) {
  return request({
    url: serviceApi.getCaseInfoByCaseId,
    method: 'post',
    data,
    isLoading: true
  })
}
