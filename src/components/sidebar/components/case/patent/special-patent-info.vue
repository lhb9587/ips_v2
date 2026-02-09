<template>
  <div class="patentContainer" :style="{'max-height':containerMaxHeight + 'px','overflow-y':'scroll'}">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">专利基础信息</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <template v-if="!(caseTypeId == 63 && patentType == 1298)">
                <template v-if="caseTypeId == 64 && patentType == 1296">
                  <tr>
                    <th style="width: 10%">法律状态 :</th>
                    <td style="width: 40%">
                      {{ caseInfo.lawStatusStr }}
                    </td>
                    <th style="width: 10%">法律状态变更日期 :</th>
                    <td style="width: 40%">
                      {{ caseInfo.statusDate }}
                    </td>
                  </tr>
                  <tr>
                    <th>客户状态 :</th>
                    <td>{{ caseInfo.custStatusStr }}</td>
                    <th>客户状态变更日期 :</th>
                    <td>{{ caseInfo.custstatusDate }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <th style="width: 10%">优先权日 :</th>
                    <td style="width: 40%">
                      {{ caseInfo.priorityAppDate }}
                    </td>
                    <th style="width: 10%">递交日期 :</th>
                    <td style="width: 40%">
                      {{ caseInfo.submitDate }}
                    </td>
                  </tr>
                  <tr>
                    <th>申请日 :</th>
                    <td>{{ caseInfo.appDate }}</td>
                    <th>申请号 :</th>
                    <td>
                      <span
                        v-if="
                          caseInfo.appFromto == '外-内' ||
                          caseInfo.appFromto == '内-内' ||
                          caseInfo.appFromto == '台-内'
                        "
                        >{{ caseInfo.appNumberStr }}</span
                      >
                      <span v-else>{{ caseInfo.appNumber }}</span>
                    </td>
                  </tr>
                  <template
                    v-if="
                      caseTypeId != 123 &&
                      ((caseInfo.divcaseList && caseInfo.divcaseList.length) ||
                        caseInfo.isDivcase)
                    "
                  >
                    <tr
                      v-if="caseInfo.divcaseList && caseInfo.divcaseList.length"
                    >
                      <th>针对分案申请号 :</th>
                      <td colspan="3">
                        {{ caseInfo.parentFileNo }}
                      </td>
                    </tr>
                    <tr v-if="caseInfo.isDivcase">
                      <th>原案申请号 :</th>
                      <td colspan="3">{{ caseInfo.parentAppNumber }}</td>
                    </tr>
                    <tr v-if="caseInfo.isDivcase">
                      <th>原案申请日 :</th>
                      <td>{{ caseInfo.parentAppDate }}</td>
                      <th>原案PCT号 :</th>
                      <td>{{ caseInfo.pctFileNo }}</td>
                    </tr>
                  </template>
                  <template v-if="patentType != 1297">
                    <tr>
                      <th>公开号 :</th>
                      <td>{{ caseInfo.openNumber }}</td>
                      <th>公开日 :</th>
                      <td>{{ caseInfo.openDate }}</td>
                    </tr>
                    <tr>
                      <th>实审请求日期 :</th>
                      <td>{{ caseInfo.ssqqDate }}</td>
                      <th>已提实审请求 :</th>
                      <td>{{ caseInfo.ssqq ? "是" : "否" }}</td>
                    </tr>
                  </template>
                  <tr>
                    <th>公告号 :</th>
                    <td>{{ caseInfo.declareNo }}</td>
                    <th>公告日 :</th>
                    <td>{{ caseInfo.declareDate }}</td>
                  </tr>
                  <tr>
                    <template v-if="patentType != 1297">
                      <th>实审日期 :</th>
                      <td>{{ caseInfo.subexamDate }}</td>
                    </template>
                    <template v-else>
                      <th>OA次数 :</th>
                      <td>{{ caseInfo.oaTimes }}</td>
                    </template>
                    <th>授权权利要求项数 :</th>
                    <td>{{ caseInfo.claimItems }}</td>
                  </tr>
                  <tr
                    v-if="
                      caseTypeId == 123 &&
                      (patentType == 1296 || patentType == 1297)
                    "
                  >
                    <th>年费公司 :</th>
                    <td>{{ caseInfo.ngCli }}</td>
                    <th>年费公司案号 :</th>
                    <td>{{ caseInfo.ngcliRefNo }}</td>
                  </tr>
                  <tr>
                    <th>证书号 :</th>
                    <td>{{ caseInfo.certificateNumber }}</td>
                    <th>有效日期 :</th>
                    <td>{{ caseInfo.validEndDate }}</td>
                  </tr>
                  <tr>
                    <th>年费监视 :</th>
                    <td>{{ caseInfo.isagency ? "是" : "否" }}</td>
                    <th>首次年费 :</th>
                    <td>{{ caseInfo.firstYearNumber }}</td>
                  </tr>
                  <tr>
                    <th>复审官方案件编号 :</th>
                    <td>{{ caseInfo.patentNumber }}</td>
                    <th>授权发文日期 :</th>
                    <td>{{ caseInfo.grantDate }}</td>
                  </tr>
                  <tr>
                    <th>授权日 :</th>
                    <td colspan="3">{{ caseInfo.certificateDate }}</td>
                  </tr>
                  <tr>
                    <th>法律状态 :</th>
                    <td>{{ caseInfo.lawStatusStr }}</td>
                    <th>法律状态变更日期 :</th>
                    <td>{{ caseInfo.statusDate }}</td>
                  </tr>
                  <tr>
                    <th>客户状态 :</th>
                    <td>{{ caseInfo.custStatusStr }}</td>
                    <th>客户状态变更日期 :</th>
                    <td>{{ caseInfo.custstatusDate }}</td>
                  </tr>
                </template>
              </template>
              <template v-else>
                <tr>
                  <th>产品分类 :</th>
                  <td>{{ caseInfo.classNo }}</td>
                  <th>优先权日 :</th>
                  <td>{{ caseInfo.priorityAppDate }}</td>
                </tr>
                <tr>
                  <th>申请号 :</th>
                  <td>
                    <span
                      v-if="
                        caseInfo.appFromto == '外-内' ||
                        caseInfo.appFromto == '内-内' ||
                        caseInfo.appFromto == '台-内'
                      "
                      >{{ caseInfo.appNumberStr }}</span
                    >
                    <span v-else>{{ caseInfo.appNumber }}</span>
                  </td>
                  <th>申请日 :</th>
                  <td>{{ caseInfo.appDate }}</td>
                </tr>
                <tr>
                  <th>公告号 :</th>
                  <td>{{ caseInfo.declareNo }}</td>
                  <th>公告日 :</th>
                  <td>{{ caseInfo.declareDate }}</td>
                </tr>
                <tr>
                  <th>递交日期 :</th>
                  <td colspan="3">{{ caseInfo.submitDate }}</td>
                </tr>
                <tr v-if="caseInfo.divcaseList && caseInfo.divcaseList.length">
                  <th>针对分案申请号 :</th>
                  <td colspan="3">{{ caseInfo.parentFileNo }}</td>
                </tr>
                <tr v-if="caseInfo.isDivcase">
                  <th>原案申请号 :</th>
                  <td>{{ caseInfo.parentAppNumber }}</td>
                  <th>原案申请日 :</th>
                  <td>{{ caseInfo.parentAppDate }}</td>
                </tr>
                <tr>
                  <th>证书号 :</th>
                  <td>{{ caseInfo.certificateNumber }}</td>
                  <th>有效日期 :</th>
                  <td>{{ caseInfo.validEndDate }}</td>
                </tr>
                <tr>
                  <th>年费监视 :</th>
                  <td>{{ caseInfo.isagency ? "是" : "否" }}</td>
                  <th>首次年费 :</th>
                  <td>{{ caseInfo.firstYearNumber }}</td>
                </tr>
                <tr>
                  <th>复审官方案件编号 :</th>
                  <td>{{ caseInfo.patentNumber }}</td>
                  <th>授权发文日期 :</th>
                  <td>{{ caseInfo.grantDate }}</td>
                </tr>
                <tr>
                  <th>授权日 :</th>
                  <td colspan="3">{{ caseInfo.certificateDate }}</td>
                </tr>
                <tr>
                  <th>法律状态 :</th>
                  <td>{{ caseInfo.lawStatusStr }}</td>
                  <th>法律状态变更日期 :</th>
                  <td>{{ caseInfo.statusDate }}</td>
                </tr>
                <tr>
                  <th>客户状态 :</th>
                  <td>{{ caseInfo.custStatusStr }}</td>
                  <th>客户状态变更日期 :</th>
                  <td>{{ caseInfo.custstatusDate }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <AppInfo :appTableList="appTableList" />
    <InventorInfo :inventorList="inventorList" />
    <PriorityClaimInfo :priorityClaimList="priorityClaimList" />
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">新递交申请</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <template v-if="!(caseTypeId == 63 && patentType == 1298)">
                <template v-if="caseTypeId == 64">
                  <tr>
                    <th style="width: 10%">文稿字数 :</th>
                    <td style="width: 40%">{{ caseInfo.wordsNum }}</td>
                    <th style="width: 10%">说明书页数 :</th>
                    <td style="width: 40%">{{ caseInfo.descriptionPages }}</td>
                  </tr>
                  <tr>
                    <th>附图幅数 :</th>
                    <td>{{ caseInfo.appendedDrawingsc }}</td>
                    <th>附图页数 :</th>
                    <td>{{ caseInfo.drawingPages }}</td>
                  </tr>
                  <tr>
                    <th>权利要求项数 :</th>
                    <td>{{ caseInfo.claimItems }}</td>
                    <th>权利要求页数 :</th>
                    <td>{{ caseInfo.claimPages }}</td>
                  </tr>
                  <tr>
                    <th>摘要附图页数 :</th>
                    <td colspan="3">{{ caseInfo.substractDrawing }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <th style="width: 10%">文稿字数 :</th>
                    <td style="width: 40%">{{ caseInfo.wordsNum }}</td>
                    <th style="width: 10%">说明书页数 :</th>
                    <td style="width: 40%">{{ caseInfo.descriptionPages }}</td>
                  </tr>
                  <tr>
                    <th>附图幅数 :</th>
                    <td>{{ caseInfo.appendedDrawings }}</td>
                    <th>附图页数 :</th>
                    <td>{{ caseInfo.drawingPages }}</td>
                  </tr>
                  <tr>
                    <th>权利要求项数 :</th>
                    <td>{{ caseInfo.claimItems }}</td>
                    <th>权利要求页数 :</th>
                    <td>{{ caseInfo.claimPages }}</td>
                  </tr>
                  <tr>
                    <th>摘要页数 :</th>
                    <td>{{ caseInfo.substractPage }}</td>
                    <th>摘要附图页数 :</th>
                    <td>{{ caseInfo.substractDrawing }}</td>
                  </tr>
                  <tr>
                    <th>摘要附图指定图 :</th>
                    <td>{{ caseInfo.substractDrwno }}</td>
                    <th>缺委托书 :</th>
                    <td>{{ caseInfo.nopower ? "是" : "否" }}</td>
                  </tr>
                  <tr v-if="caseTypeId != 123 && hasPatentPriority">
                    <th>缺优证文件 :</th>
                    <td colspan="3">
                      {{ caseInfo.priorityFile ? "是" : "否" }}
                    </td>
                  </tr>
                  <tr>
                    <th>要求DAS :</th>
                    <td :colspan="caseInfo.appFromto == '内-内' ? 1 : 3">
                      {{ caseInfo.das ? "是" : "否" }}
                    </td>
                    <template v-if="caseInfo.appFromto == '内-内'">
                      <th>预审案件 :</th>
                      <td>{{ caseInfo.preexamine ? "是" : "否" }}</td>
                    </template>
                  </tr>
                  <tr v-if="caseTypeId == 63">
                    <th>要求优先审查 :</th>
                    <td colspan="3">{{ caseInfo.tqsc ? "是" : "否" }}</td>
                  </tr>
                  <tr
                    v-if="
                      caseTypeId == 63 &&
                      caseInfo.appFromto == '内-内' &&
                      patentType == 1296
                    "
                  >
                    <th>是集中审查 :</th>
                    <td colspan="3">
                      {{ caseInfo.focusReview ? "是" : "否" }}
                    </td>
                  </tr>
                  <tr v-if="caseTypeId == 123">
                    <th>要求审查高速公路 :</th>
                    <td colspan="3">{{ caseInfo.dopph ? "是" : "否" }}</td>
                  </tr>
                  <template
                    v-if="
                      caseTypeId == 123 &&
                      (patentType == 1296 || patentType == 1297)
                    "
                  >
                    <tr>
                      <th>进入国家阶段期限 :</th>
                      <td>
                        {{
                          caseInfo.pctKxq == 1460
                            ? "32个月内提交"
                            : caseInfo.pctKxq == 1458
                            ? "提前进入"
                            : caseInfo.pctKxq == 1461
                            ? "31个月内提交"
                            : caseInfo.pctKxq == 1459
                            ? "30个月内提交"
                            : ""
                        }}
                      </td>

                      <th>修改文件（28或41条） :</th>
                      <td>{{ caseInfo.xgwj ? "是" : "否" }}</td>
                    </tr>
                    <tr>
                      <th>根据条约第19条修改的权利要求和声明 :</th>
                      <td colspan="3">{{ caseInfo.xgwjyw1 ? "是" : "否" }}</td>
                    </tr>
                  </template>
                  <template v-if="caseTypeId == 63 && patentType == 1296">
                    <tr>
                      <th>要求提交香港申请 :</th>
                      <td :colspan="caseInfo.ishk == 1 ? 1 : 3">
                        {{ caseInfo.ishk ? "是" : "否" }}
                      </td>
                      <template v-if="caseInfo.ishk == 1">
                        <th>香港申请案号 :</th>
                        <td>
                          {{ caseInfo.hkRefNoList?.join("；") }}
                        </td>
                      </template>
                    </tr>
                    <tr>
                      <th>是否需要提交分案申请 :</th>
                      <td :colspan="caseInfo.needdiv == 1 ? 1 : 3">
                        {{ caseInfo.needdiv ? "是" : "否" }}
                      </td>
                      <template v-if="caseInfo.needdiv == 1">
                        <th>分案申请案号 :</th>
                        <td>
                          {{ caseInfo.divcaseList?.join("；") }}
                        </td>
                      </template>
                    </tr>
                    <tr>
                      <th>要求新申请同时提实审 :</th>
                      <td>{{ caseInfo.tstss ? "是" : "否" }}</td>
                      <th>要求提交IDS :</th>
                      <td>{{ caseInfo.needIds ? "是" : "否" }}</td>
                    </tr>
                    <tr>
                      <th>费减比例 :</th>
                      <td>{{ caseInfo.feeReduce }}</td>
                      <th>提前公布 :</th>
                      <td>{{ caseInfo.tqgk ? "是" : "否" }}</td>
                    </tr>
                  </template>

                  <template
                    v-if="
                      caseTypeId == 123 &&
                      (patentType == 1296 || patentType == 1297)
                    "
                  >
                    <tr>
                      <th>要求提交香港申请 :</th>
                      <td :colspan="caseInfo.ishk == 1 ? 1 : 3">
                        {{ caseInfo.ishk ? "是" : "否" }}
                      </td>
                      <template v-if="caseInfo.ishk == 1">
                        <th>香港申请案号 :</th>
                        <td>
                          {{ caseInfo.hkRefNoList?.join("；") }}
                        </td>
                      </template>
                    </tr>
                    <tr>
                      <th>是否需要提交分案申请 :</th>
                      <td :colspan="caseInfo.needdiv == 1 ? 1 : 3">
                        {{ caseInfo.needdiv ? "是" : "否" }}
                      </td>
                      <template v-if="caseInfo.needdiv == 1">
                        <th>分案申请案号 :</th>
                        <td>
                          {{ caseInfo.divcaseList?.join("；") }}
                        </td>
                      </template>
                    </tr>
                    <tr>
                      <th>要求提交IDS :</th>
                      <td>{{ caseInfo.needIds ? "是" : "否" }}</td>
                      <th>费减比例 :</th>
                      <td>{{ caseInfo.feeReduce }}</td>
                    </tr>
                    <tr v-if="caseTypeId == 123 && patentType != 1297">
                      <th>要求新申请同时提实审 :</th>
                      <td colspan="3">{{ caseInfo.tstss ? "是" : "否" }}</td>
                    </tr>
                    <tr v-if="patentType == 1296">
                      <th>提前公布 :</th>
                      <td colspan="3">{{ caseInfo.tqgk ? "是" : "否" }}</td>
                    </tr>
                  </template>
                  <template
                    v-if="
                      caseTypeId == 63 &&
                      (patentType == 1297 || patentType == 1298)
                    "
                  >
                    <tr>
                      <th>是否需要提交分案申请 :</th>
                      <td :colspan="caseInfo.needdiv == 1 ? 1 : 3">
                        {{ caseInfo.needdiv ? "是" : "否" }}
                      </td>
                      <template v-if="caseInfo.needdiv == 1">
                        <th>分案申请案号 :</th>
                        <td>{{ caseInfo.divcaseList?.join("；") }}</td>
                      </template>
                    </tr>
                    <tr>
                      <th>要求提交IDS :</th>
                      <td>{{ caseInfo.needIds ? "是" : "否" }}</td>
                      <th>费减比例 :</th>
                      <td>{{ caseInfo.feeReduce }}</td>
                    </tr>
                  </template>
                </template>
              </template>
              <template v-else>
                <tr>
                  <th style="width: 10%">相似设计项数 :</th>
                  <td style="width: 40%">{{ caseInfo.wgxsNum }}</td>
                  <th style="width: 10%">成套设计项数 :</th>
                  <td style="width: 40%">{{ caseInfo.wgctNum }}</td>
                </tr>
                <tr>
                  <th>局部设计 :</th>
                  <td>{{ caseInfo.jusjbj ? "是" : "否" }}</td>
                  <th>缺委托书 :</th>
                  <td>{{ caseInfo.nopower ? "是" : "否" }}</td>
                </tr>
                <tr>
                  <th>请求优先审查 :</th>
                  <td>{{ caseInfo.tqsc ? "是" : "否" }}</td>
                  <th>要求DAS :</th>
                  <td>{{ caseInfo.das ? "是" : "否" }}</td>
                </tr>
                <tr>
                  <template v-if="hasPatentPriority">
                    <th>缺优证文件 :</th>
                    <td>{{ caseInfo.priorityFile ? "是" : "否" }}</td>
                  </template>
                  <th>预审案件 :</th>
                  <td :colspan="hasPatentPriority ? 1 : 3">
                    {{ caseInfo.preexamine ? "是" : "否" }}
                  </td>
                </tr>
                <tr>
                  <th>是否需要提交分案申请 :</th>
                  <td :colspan="caseInfo.needdiv == 1 ? 1 : 3">
                    {{ caseInfo.needdiv ? "是" : "否" }}
                  </td>
                  <template v-if="caseInfo.needdiv == 1">
                    <th>分案申请案号 :</th>
                    <td>
                      {{ caseInfo.divcaseList?.join("；") }}
                    </td>
                  </template>
                </tr>
                <tr>
                  <th>要求提交IDS :</th>
                  <td>{{ caseInfo.needIds ? "是" : "否" }}</td>
                  <th>费减比例 :</th>
                  <td>{{ caseInfo.feeReduce }}</td>
                </tr>
                <tr>
                  <th>要求提交香港申请 :</th>
                  <td :colspan="caseInfo.ishk == 1 ? 1 : 3">
                    {{ caseInfo.ishk ? "是" : "否" }}
                  </td>
                  <template v-if="caseInfo.ishk == 1">
                    <th>香港申请案号 :</th>
                    <td>
                      {{ caseInfo.hkRefNoList?.join("；") }}
                    </td>
                  </template>
                </tr>
              </template>
              <tr v-if="caseInfo.appFromto == '外-内'">
                <th>原案语言 :</th>
                <td colspan="3">{{ caseInfo.pctOpenLang }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div
      class="card"
      v-if="caseTypeId == 123"
    >
      <div class="card-body">
        <h4 class="card-title mb-2">PCT国家阶段</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th style="width: 10%">国际受理局 :</th>
                <td style="width: 40%">{{ caseInfo.pctRecOffice }}</td>
                <th style="width: 10%">检索单位 :</th>
                <td style="width: 40%">{{ caseInfo.pctSearchAu }}</td>
              </tr>
              <tr>
                <th>初审单位 :</th>
                <td>{{ caseInfo.pctPreliexAu }}</td>
                <th>国际申请号 :</th>
                <td>{{ caseInfo.pctFileNo }}</td>
              </tr>
              <tr>
                <th>国际申请日 :</th>
                <td>{{ caseInfo.pctFileDate }}</td>
                <th>国际公开日 :</th>
                <td>{{ caseInfo.pctOpenDate }}</td>
              </tr>
              <tr>
                <th>国际公开号 :</th>
                <td :colspan="3">{{ caseInfo.pctOpenNumber }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div
      class="card"
      v-if="caseTypeId == 64"
    >
      <div class="card-body">
        <h4 class="card-title mb-2">PCT国际申请</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th style="width: 10%">国际受理局 :</th>
                <td style="width: 40%">{{ caseInfo.pctRecOffice }}</td>
                <th style="width: 10%">检索单位 :</th>
                <td style="width: 40%">{{ caseInfo.pctSearchAu }}</td>
              </tr>
              <tr>
                <th>初审单位 :</th>
                <td>{{ caseInfo.pctPreliexAu }}</td>
                <th>申请日 :</th>
                <td>{{ caseInfo.appDate }}</td>
              </tr>
              <tr>
                <th>PCT申请号 :</th>
                <td>{{ caseInfo.pctFileNo }}</td>
                <th>PCT公开号 :</th>
                <td>{{ caseInfo.pctOpenNumber }}</td>
              </tr>
              <tr>
                <th>PCT公开日 :</th>
                <td>{{ caseInfo.pctOpenDate }}</td>
                <th>国际初审日 :</th>
                <td>{{ caseInfo.pctPreliexDate }}</td>
              </tr>
              <tr>
                <th>优先权日 :</th>
                <td>{{ caseInfo.priorityAppDate }}</td>
                <th>要求国际初步审查 :</th>
                <td>{{ caseInfo.pctPreliexDate }}</td>
              </tr>
              <tr>
                <th>递交语言 :</th>
                <td colspan="3">
                  {{ caseInfo.pctLanguage == "E" ? "英文" : "中文" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">立卷信息</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <template
                v-if="
                  caseTypeId == 63 && (patentType == 1296 || patentType == 1297)
                "
              >
                <tr>
                  <th style="width: 10%">收案日期 :</th>
                  <td style="width: 40%">{{ caseInfo.receiveDate }}</td>
                  <th style="width: 10%">创建日期 :</th>
                  <td style="width: 40%">{{ caseInfo.caseDate }}</td>
                </tr>
                <tr>
                  <th>创建人员 :</th>
                  <td colspan="3">{{ caseInfo.createUserName }}</td>
                </tr>
              </template>
              <template
                v-else-if="
                  (caseTypeId == 64 && patentType == 1296) ||
                  (caseTypeId == 123 &&
                    (patentType == 1296 || patentType == 1297)) ||
                  (caseTypeId == 63 &&
                    (patentType == 1297 || patentType == 1298))
                "
              >
                <tr>
                  <th style="width: 10%">收案日期 :</th>
                  <td style="width: 40%">{{ caseInfo.receiveDate }}</td>
                  <th style="width: 10%">创建日期 :</th>
                  <td style="width: 40%">{{ caseInfo.caseDate }}</td>
                </tr>
                <tr>
                  <th>创建人员 :</th>
                  <td colspan="3">{{ caseInfo.createUserName }}</td>
                </tr>
              </template>
              <tr>
                <th>财务备注 :</th>
                <td colspan="3">{{ caseInfo.memo2 }}</td>
              </tr>
              <tr>
                <th>案件备注 :</th>
                <td colspan="3">{{ caseInfo.memo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { transformation } from "@/utils";
import { querycustSelectClass } from "@/api/caseDetail";
import { queryApplicantByIdList } from "@/api/caseList";
import AppInfo from "./app-info.vue";
import InventorInfo from "./inventor-info.vue";
import PriorityClaimInfo from "./priorityClaim-info.vue";

export default {
  components: {
    AppInfo,
    InventorInfo,
    PriorityClaimInfo,
  },
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectData: {},
      appList: [],
      containerMaxHeight:document.documentElement.clientHeight-100
    };
  },
  computed: {
    patentType() {
      return this.caseInfo.patentType || 1296;
    },
    caseTypeId() {
      return this.caseInfo.caseTypeId || 63;
    },
    appTableList() {
      return this.caseInfo.patentCaseApplicationList || [];
    },
    inventorList() {
      return this.caseInfo.patentInventorList || [];
    },
    priorityClaimList() {
      return this.caseInfo.patentPriorityClaimList || [];
    },
    hasPatentPriority() {
      return this.caseInfo.patentPriorityClaimList?.length > 0;
    },
  },
  methods: {
    transformation,
    fetchCustSelectClass() {
      querycustSelectClass({
        classId: "1030",
      }).then((response) => {
        if (response.success) {
          this.selectData = response.data || {};
        } else {
          this.$message.error(response.message);
        }
      });
    },
    fetAppList() {
      queryApplicantByIdList({ appIdArray: this.caseInfo.appId }).then(
        (res) => {
          this.appList = res.data;
        }
      );
    },
  },
  watch: {
    caseInfo: {
      handler(newVal) {
        if (newVal.appId) {
          this.fetAppList();
        }
      },
      deep: true,
    },
  },
  created() {
    this.fetchCustSelectClass();
  },
};
</script>

<style scoped lang="scss">
    .patentContainer{
        .card:last-child{
            margin-bottom: 0;
        }
    }
</style>
