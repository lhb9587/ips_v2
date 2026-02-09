<template>
  <div
    class="card"
    v-if="[100, 118, 106, 101, 69, 157].includes(caseTypeId)"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">专利基础信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <template v-if="caseTypeId == 101">
              <tr>
                <th>优先权日 :</th>
                <td :colspan="caseTypeId != 123 ? 1 : 3">
                  {{ caseInfo.priorityAppDate }}
                </td>
                <template v-if="caseTypeId != 123">
                  <th>递交日期 :</th>
                  <td>{{ caseInfo.submitDate }}</td>
                </template>
              </tr>
              <tr>
                <th style="width: 10%">申请日 :</th>
                <td style="width: 40%">
                  {{ caseInfo.appDate }}
                </td>
                <th style="width: 10%">申请号 :</th>
                <td style="width: 40%">
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
                <tr v-if="caseInfo.divcaseList && caseInfo.divcaseList.length">
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
              <tr>
                <th>公告号 :</th>
                <td>{{ caseInfo.declareNo }}</td>
                <th>公告日 :</th>
                <td>{{ caseInfo.declareDate }}</td>
              </tr>
              <tr>
                <th>OA次数 :</th>
                <td>{{ caseInfo.oaTimes }}</td>
                <th>授权权利要求项数 :</th>
                <td>{{ caseInfo.claimItems }}</td>
              </tr>
              <tr>
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
            <template v-else-if="caseTypeId == 69">
              <tr>
                <th style="width: 10%">申请号 :</th>
                <td style="width: 40%">
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
                <th style="width: 10%">申请日 :</th>
                <td style="width: 40%">
                  {{ caseInfo.appDate }}
                </td>
              </tr>
              <tr>
                <th>证书号 :</th>
                <td>{{ caseInfo.certificateNumber }}</td>
                <th>有效日期 :</th>
                <td>{{ caseInfo.validEndDate }}</td>
              </tr>
              <tr>
                <th>公开号 :</th>
                <td>{{ caseInfo.openNumber }}</td>
                <th>公开日 :</th>
                <td>{{ caseInfo.openDate }}</td>
              </tr>
              <tr>
                <th>公告号 :</th>
                <td>{{ caseInfo.declareNo }}</td>
                <th>公告日 :</th>
                <td>{{ caseInfo.declareDate }}</td>
              </tr>
              <tr>
                <th>授权日 :</th>
                <td>{{ caseInfo.certificateDate }}</td>
                <th>授权权利要求项数 :</th>
                <td>{{ caseInfo.claimItems }}</td>
              </tr>
              <tr>
                <th>授权发文日期 :</th>
                <td>{{ caseInfo.grantDate }}</td>
                <th>递交日期 :</th>
                <td>{{ caseInfo.submitDate }}</td>
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
              <tr>
                <th>年费监视 :</th>
                <td>{{ caseInfo.isagency ? "是" : "否" }}</td>
                <th>首次年费 :</th>
                <td>{{ caseInfo.firstYearNumber }}</td>
              </tr>
              <tr>
                <th>费减比例 :</th>
                <td colspan="3">{{ caseInfo.feeReduce }}</td>
              </tr>
            </template>
            <template v-else>
              <template v-if="caseTypeId != 106">
                <tr>
                  <th style="width: 10%">申请号 :</th>
                  <td style="width: 40%">
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
                  <th style="width: 10%">申请日 :</th>
                  <td style="width: 40%">
                    {{ caseInfo.appDate }}
                  </td>
                </tr>
                <tr>
                  <th>登记日 :</th>
                  <td>{{ caseInfo.certificateDate }}</td>
                  <th>证书号 :</th>
                  <td>{{ caseInfo.certificateNumber }}</td>
                </tr>
              </template>
              <tr>
                <th style="width: 10%">法律状态 :</th>
                <td style="width: 40%">{{ caseInfo.lawStatusStr }}</td>
                <th style="width: 10%">法律状态变更日期 :</th>
                <td style="width: 40%">{{ caseInfo.statusDate }}</td>
              </tr>
              <tr>
                <th>客户状态 :</th>
                <td>{{ caseInfo.custStatusStr }}</td>
                <th>客户状态变更日期 :</th>
                <td>{{ caseInfo.custstatusDate }}</td>
              </tr>
              <tr v-if="caseTypeId != 106">
                <th>年费监视 :</th>
                <td colspan="3">{{ caseInfo.isagency ? "是" : "否" }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <AppInfo :appTableList="appTableList" />
  <InventorInfo
    :inventorList="inventorList"
    v-if="
      caseTypeId != 215 &&
      caseTypeId != 66 &&
      caseTypeId != 100 &&
      caseTypeId != 118 &&
      caseTypeId != 106
    "
  />
  <PriorityClaimInfo
    :priorityClaimList="priorityClaimList"
    v-if="
      caseTypeId != 215 &&
      caseTypeId != 66 &&
      caseTypeId != 100 &&
      caseTypeId != 118 &&
      caseTypeId != 106
    "
  />
  <div
    class="card"
    v-if="caseTypeId == 101"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">新递交申请</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th>文稿字数 :</th>
              <td>{{ caseInfo.wordsNum }}</td>
              <th>说明书页数 :</th>
              <td>{{ caseInfo.descriptionPages }}</td>
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
              <td :colspan="caseInfo.appFromto == '内-内' ? 1 : 3">
                {{ caseInfo.substractDrwno }}
              </td>
              <template v-if="caseInfo.appFromto == '内-内'">
                <th>预审案件 :</th>
                <td>{{ caseInfo.preexamine ? "是" : "否" }}</td>
              </template>
            </tr>
            <tr>
              <th>要求DAS :</th>
              <td>{{ caseInfo.das ? "是" : "否" }}</td>
              <th>缺委托书 :</th>
              <td>{{ caseInfo.nopower ? "是" : "否" }}</td>
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
              <td colspan="3">{{ caseInfo.feeReduce }}</td>
            </tr>
            <tr v-if="caseInfo.appFromto == '外-内'">
              <th>原案语言 :</th>
              <td colspan="3">{{ caseInfo.pctOpenLang }}</td>
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
            <template v-if="caseInfo.caseTypeId == 69">
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
            <template v-else>
              <tr>
                <th style="width: 10%">收案日期 :</th>
                <td style="width: 40%">{{ caseInfo.receiveDate }}</td>
                <th style="width: 10%">递交日期 :</th>
                <td style="width: 40%">{{ caseInfo.submitDate }}</td>
              </tr>
              <tr>
                <th>创建日期 :</th>
                <td>{{ caseInfo.caseDate }}</td>
                <th>创建人员 :</th>
                <td>{{ caseInfo.createUserName }}</td>
              </tr>
              <tr
                v-if="
                  caseTypeId != 69 &&
                  caseTypeId != 68 &&
                  caseTypeId != 102 &&
                  caseTypeId != 101
                "
              >
                <th>财务备注 :</th>
                <td colspan="3">{{ caseInfo.memo2 }}</td>
              </tr>
              <template v-if="caseTypeId == 68 || caseTypeId == 102">
                <tr>
                  <th>指示外方代理日 :</th>
                  <td>{{ caseInfo.agencyCustShowDate }}</td>
                  <th>第二步递交日期 :</th>
                  <td>{{ caseInfo.ssqqDate }}</td>
                </tr>
                <tr>
                  <th>申请人与发明人的关系 :</th>
                  <td colspan="3">{{ caseInfo.modifymemo }}</td>
                </tr>
              </template>
              <tr v-if="caseTypeId == 101">
                <th>委托外方日期 :</th>
                <td colspan="3">{{ caseInfo.agencyCustShowDate }}</td>
              </tr>
              <tr
                v-if="
                  caseTypeId == 69 ||
                  caseTypeId == 68 ||
                  caseTypeId == 102 ||
                  caseTypeId == 101
                "
              >
                <th>财务备注 :</th>
                <td colspan="3">{{ caseInfo.memo2 }}</td>
              </tr>
              <tr>
                <th>案件备注 :</th>
                <td colspan="3">{{ caseInfo.memo }}</td>
              </tr>
            </template>
          </tbody>
        </table>
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
    };
  },
  computed: {
    caseTypeId() {
      return this.caseInfo.caseTypeId;
    },
    patentType() {
      return this.caseInfo.patentType;
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

<style></style>
