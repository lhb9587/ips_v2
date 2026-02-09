import request from '@/utils/request'
import serviceApi from '@/api/serviceApi.config.js'

export function importExcel(data) {
  return request({
    url: serviceApi.importExcel,
    method: 'post',
    data,
    isLoading: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export function queryAgencyInfoByCustId(data) {
  return request({
    url: serviceApi.queryAgencyInfoByCustId,
    method: 'post',
    data,
    isLoading: false
  })
}
export function checkImageInstruction(data) {
  return request({
    url: serviceApi.checkImageInstruction,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryGoodsContrast(data) {
  return request({
    url: serviceApi.queryGoodsContrast,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryParentCaseDocNumber(data) {
  return request({
    url: serviceApi.queryParentCaseDocNumber,
    method: 'post',
    data,
    isLoading: true
  })
}
export function mergePdf(data) {
  return request({
    url: serviceApi.mergePdf,
    method: 'post',
    data,
    isLoading: true
  })
}
export function fileMergePdf(data) {
  return request({
    url: serviceApi.fileMergePdf,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryAgentNumByCaseId(data) {
  return request({
    url: serviceApi.queryAgentNumByCaseId,
    method: 'post',
    data,
    isLoading: true
  })
}
export function chongtuAudit(data) {
  return request({
    url: serviceApi.chongtuAudit,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryAgentPerson(data) {
  return request({
    url: serviceApi.queryAgentPerson,
    method: 'post',
    data,
    isLoading: false
  })
}
export function chongtuTest(data) {
  return request({
    url: serviceApi.chongtuTest,
    method: 'post',
    data,
    isLoading: true
  })
}
export function tijiao(data) {
  return request({
    url: serviceApi.tijiao,
    method: 'post',
    data,
    isLoading: true
  })
}
export function ifNewLevel(data) {
  return request({
    url: serviceApi.ifNewLevel,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryQuoteByNumber(data) {
  return request({
    url: serviceApi.queryQuoteByNumber,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryReplaceAgencyName(data) {
  return request({
    url: serviceApi.queryReplaceAgencyName,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryPatentCountry(data) {
  return request({
    url: serviceApi.queryPatentCountry,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryUserRole(data) {
  return request({
    url: serviceApi.queryUserRole,
    method: 'post',
    data,
    isLoading: false
  })
}
export function modifyMailInfo(data) {
  return request({
    url: serviceApi.modifyMailInfo,
    method: 'post',
    data,
    isLoading: false
  })
}
export function submitCaseClose(data) {
  return request({
    url: serviceApi.submitCaseClose,
    method: 'post',
    data
  })
}
export function auditCaseClose(data) {
  return request({
    url: serviceApi.auditCaseClose,
    method: 'post',
    data
  })
}
export function queryCaseRoleName(data) {
  return request({
    url: serviceApi.queryCaseRoleName,
    method: 'post',
    data,
    isLoading: false
  })
}
// 查询预先定义的文件命名方式
export function queryFileNameDefine(data) {
  return request({
    url: serviceApi.queryFileNameDefine,
    method: 'post',
    data,
    isLoading: false
  })
}

// 查询文件命名自定义元素
export function queryFileNameElement(data) {
  return request({
    url: serviceApi.queryFileNameElement,
    method: 'post',
    data,
    isLoading: false
  })
}

//申请人中的发明人列表
export function queryInventorList(data) {
  return request({
    url: serviceApi.queryInventorList,
    method: 'post',
    data,
    isLoading: false
  })
}
//补正文件名称列表
export function queryBzdefineList(data) {
  return request({
    url: serviceApi.queryBzdefineList,
    method: 'post',
    data,
    isLoading: false
  })
}

//著录变更证明文件对应的分组类别
export function queryZbgroup(data) {
  return request({
    url: serviceApi.queryZbgroup,
    method: 'post',
    data,
    isLoading: false
  })
}
//查询案件最近的官方通知的发文日志和发文编号
export function queryLastDoc(data) {
  return request({
    url: serviceApi.queryLastDoc,
    method: 'post',
    data,
    isLoading: false
  })
}
//著录变更理由对应的证明文件
export function queryZbzmfile(data) {
  return request({
    url: serviceApi.queryZbzmfile,
    method: 'post',
    data,
    isLoading: false
  })
}
//著录变更理由
export function queryZbliyou(data) {
  return request({
    url: serviceApi.queryZbliyou,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCaseInfoUrl(data) {
  return request({
    url: serviceApi.queryCaseInfoUrl,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryPatentCaseInfo(data) {
  return request({
    url: serviceApi.queryPatentCaseInfo,
    method: 'post',
    data,
    isLoading: true
  })
}
export function queryOrigCaseInfo(data) {
  return request({
    url: serviceApi.queryOrigCaseInfo,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryUserCaseNumber(data) {
  return request({
    url: serviceApi.queryUserCaseNumber,
    method: 'post',
    data,
    isLoading: false
  })
}
export function queryCaseAgentNumList(data) {
  return request({
    url: serviceApi.queryCaseAgentNumList,
    method: 'post',
    data,
    isLoading: false
  })
}
export function lawsuitUrl(data) {
  return request({
    url: serviceApi.lawsuitUrl,
    method: 'post',
    data,
    isLoading: true
  })
}
export function GSQQueryAllClassUrl(data) {
  return request({
    url: serviceApi.GSQQueryAllClassUrl,
    method: 'post',
    data
  })
}
export function saveCaseInfoUrl(data) {
  return request({
    url: serviceApi.saveCaseInfoUrl,
    method: 'post',
    data
  })
}
export function heighCreditUrl(data) {
  return request({
    url: serviceApi.heighCreditUrl,
    method: 'post',
    data
  })
}
export function queryListByUrl(data) {
  return request({
    url: serviceApi.queryListByUrl,
    method: 'post',
    data,
    isLoading:false
  })
}
export function queryGoodsByAgentNumUrl(data) {
  return request({
    url: serviceApi.queryGoodsByAgentNumUrl,
    method: 'post',
    data
  })
}
export function queryGoodsPlanUrl(data) {
  return request({
    url: serviceApi.queryGoodsPlanUrl,
    method: 'post',
    data
  })
}
export function addGoodsPlanUrl(data) {
  return request({
    url: serviceApi.addGoodsPlanUrl,
    method: 'post',
    data
  })
}
export function createZbrecord(data) {
  return request({
    url: serviceApi.createZbrecord,
    method: 'post',
    data
  })
}
export function updateZbrecord(data) {
  return request({
    url: serviceApi.updateZbrecord,
    method: 'post',
    data
  })
}
export function queryZbrecordList(data) {
  return request({
    url: serviceApi.queryZbrecordList,
    method: 'post',
    data
  })
}
export function queryCaseInfoForZb(data) {
  return request({
    url: serviceApi.queryCaseInfoForZb,
    method: 'post',
    data
  })
}
export function queryItemList(data) {
  return request({
    url: serviceApi.queryItemList,
    method: 'post',
    data
  })
}
export function queryGoodsUrl(data) {
  return request({
    url: serviceApi.queryGoodsUrl,
    method: 'post',
    data
  })
}
export function oneKeyZipUrl(data) {
  return request({
    url: serviceApi.oneKeyZipUrl,
    method: 'post',

    data
  })
}
export function checkForbidContentUrl(data) {
  return request({
    url: serviceApi.checkForbidContentUrl,
    method: 'post',

    data
  })
}
export function checkSameTmUrl(data) {
  return request({
    url: serviceApi.checkSameTmUrl,
    method: 'post',

    data
  })
}
export function cradeJoinAppUrl(data) {
  return request({
    url: serviceApi.cradeJoinAppUrl,
    method: 'post',

    data
  })
}
export function queryCaseEventListUrl(data) {
  return request({
    url: serviceApi.queryCaseEventListUrl,
    method: 'post',
    data,
  })
}
export function delJoinAppUrl(data) {
  return request({
    url: serviceApi.delJoinAppUrl,
    method: 'post',

    data
  })
}
export function modifyjoinappUrl(data) {
  return request({
    url: serviceApi.modifyjoinappUrl,
    method: 'post',

    data
  })
}
export function deleteGoodsPlanUrl(data) {
  return request({
    url: serviceApi.deleteGoodsPlanUrl,
    method: 'post',

    data
  })
}
export function queryCountry(data) {
  return request({
    url: serviceApi.queryCountry,

    method: 'get',
    params: data
  })
}
export function GSQAllcategoryUrl(data) {
  return request({
    url: serviceApi.GSQAllcategoryUrl,

    method: 'get',
    params: data
  })
}
export function GSQCategoryUrl(data) {
  return request({
    url: serviceApi.GSQCategoryUrl,

    method: 'get',
    params: data
  })
}
export function queryCustomerList(data) {
  return request({
    url: serviceApi.queryCustomerList,

    method: 'get',
    params: data,
    isLoading: false

  })
}
export function queryCountryTm(data) {
  return request({
    url: serviceApi.queryCountryTm,

    method: 'get',
    params: data
  })
}export function queryCountryCaseUrl(data) {
  return request({
    url: serviceApi.queryCountryCaseUrl,

    method: 'get',
    params: data
  })
}
export function queryCaseStageTm(data) {
  return request({
    url: serviceApi.queryCaseStageTm,
    method: 'get',
    params: data
  })
}
export function queryCustomerContactByCustIdUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactByCustIdUrl,
    method: 'get',
    params: data,
    isLoading: false

  })
}
export function GSQQueryFirstClassUrl(data) {
  return request({
    url: serviceApi.GSQQueryFirstClassUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryByNameUrl(data) {
  return request({
    url: serviceApi.queryByNameUrl,
    method: 'get',
    params: data,

  })
}
export function queryOtherCustomerListUrl(data) {
  return request({
    url: serviceApi.queryOtherCustomerListUrl,
    method: 'get',
    params: data,

  })
}
export function GSQQueryClassUrl(data) {
  return request({
    url: serviceApi.GSQQueryClassUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryDetaileGroupUrl(data) {
  return request({
    url: serviceApi.queryDetaileGroupUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryAppInfoUrl(data) {
  return request({
    url: serviceApi.queryAppInfoUrl,
    method: 'get',
    params: data,
    isLoading: false

  })
}
export function queryAppContactUrl(data) {
  return request({
    url: serviceApi.queryAppContactUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryCustomerReqUrl(data) {
  return request({
    url: serviceApi.queryCustomerReqUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}

export function queryCustomerUrl(data) {
  return request({
    url: serviceApi.queryCustomerUrl,
    method: 'get',
    params: data,
    isLoading: false
  })
}
export function queryUserNames(data) {
  return request({
    url: serviceApi.queryUserNames,
    method: 'get',
    params: {...{isActive:1},...data}
  })
}
export function querycustSelectClass(data) {
  return request({
    url: serviceApi.querycustSelectClass,
    method: 'get',
    params: data
  })
}
export function queryRoleNames(data) {
  return request({
    url: serviceApi.queryRoleNames,
    method: 'get',
    params: data
  })
}
export function queryCaseWorkgroupUrl(data) {
  return request({
    url: serviceApi.queryCaseWorkgroupUrl,
    method: 'get',
    params: data
  })
}

export function delCaseMaterialUrl(data) {
  return request({
    url: serviceApi.delCaseMaterialUrl,
    method: 'post',
    data
  })
}
export function queryAppAddrByAppIdUrl(data) {
  return request({
    url: serviceApi.queryAppAddrByAppIdUrl,
    method: 'post',
    data:{... {status:1}, ...data },
    isLoading: false

  })
}
export function saveCasesUrl(data) {
  return request({
    url: serviceApi.saveCasesUrl,
    method: 'post',
    data
  })
}
export function queryMaterialTypeUrl(data) {
  return request({
    url: serviceApi.queryMaterialTypeUrl,
    method: 'post',
    data
  })
}
export function queryCaseByCaseIdsUrl(data) {
  return request({
    url: serviceApi.queryCaseByCaseIdsUrl,
    method: 'post',
    data
  })
}
export function getBatchHerderUrl(data) {
  return request({
    url: serviceApi.getBatchHerderUrl,
    method: 'post',
    data
  })
}
export function queryCaseEventDetailUrl(data) {
  return request({
    url: serviceApi.queryCaseEventDetailUrl,
    method: 'post',
    data
  })
}
export function updateCaseEventUrl(data) {
  return request({
    url: serviceApi.updateCaseEventUrl,
    method: 'post',
    data
  })
}
export function deleteCaseEventUrl(data) {
  return request({
    url: serviceApi.deleteCaseEventUrl,
    method: 'post',
    data
  })
}
export function addCaseEventUrl(data) {
  return request({
    url: serviceApi.addCaseEventUrl,
    method: 'post',
    data
  })
}
export function analysisFile(data) {
  return request({
    url: serviceApi.analysisFile,
    method: 'post',
    data
  })
}
export function queryCustomerContactByCustContactIdUrl(data) {
  return request({
    url: serviceApi.queryCustomerContactByCustContactIdUrl,
    method: 'post',
    data,
    isLoading: false

  })
}
export function queryConflicterListUrl(data) {
  return request({
    url: serviceApi.queryConflicterListUrl,
    method: 'post',
    data,
    isLoading: false
  })
}
export function addConflicterUrl(data) {
  return request({
    url: serviceApi.addConflicterUrl,
    method: 'post',
    data
  })
}
export function getSubmitOfficialsUrl(data) {
  return request({
    url: serviceApi.getSubmitOfficialsUrl,
    method: 'post',
    data
  })
}
export function upSubmitOfficialsUrl(data) {
  return request({
    url: serviceApi.upSubmitOfficialsUrl,
    method: 'post',
    data
  })
}
export function queryTrademarkCaseByOfficialTmFileIdsUrl(data) {
  return request({
    url: serviceApi.queryTrademarkCaseByOfficialTmFileIdsUrl,
    method: 'post',
    data
  })
}
export function upTrademarkCaseByOfficialTmFileIdsUrl(data) {
  return request({
    url: serviceApi.upTrademarkCaseByOfficialTmFileIdsUrl,
    method: 'post',
    data
  })
}
export function queryCaseGory(data) {
  return request({
    url: serviceApi.queryCaseGory,
    method: 'post',
    data
  })
}
export function handoverCase(data) {
  return request({
    url: serviceApi.handoverCase,
    method: 'post',
    data
  })
}
export function auditCase(data) {
  return request({
    url: serviceApi.auditCase,
    method: 'post',
    data
  })
}
