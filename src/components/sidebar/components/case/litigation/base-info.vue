<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">案件详情</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">案件类型 :</th>
              <td style="width: 40%">
                <span
                  v-if="
                    caseTypeList
                      ?.find((item) => item.caseTypeId == 2)
                      .childrens?.find((item) => item.caseTypeId == 18)
                      .childrens?.find(
                        (item) => item.caseTypeId === caseInfo.caseTypeId
                      )
                  "
                >
                  <span
                    v-for="(item, index) in caseInfo.lawsuitCasetypeNameArray"
                    :key="index"
                  >
                    {{ item }}
                  </span>
                </span>
                <span v-else>
                  {{ caseInfo.caseType || "商标行政诉讼" }}
                </span>
              </td>
              <th style="width: 10%">审级 :</th>
              <td style="width: 40%">{{ caseInfo.judgeRankStr }}</td>
            </tr>
            <tr>
              <th>申请方向 :</th>
              <td colspan="3">{{ caseInfo.appFromto }}</td>
            </tr>
            <tr>
              <th>案件文号 :</th>
              <td>{{ caseInfo.agentNum }}</td>
              <th>案件等级 :</th>
              <td>{{ caseInfo.caseLevelStr }}</td>
            </tr>
            <tr>
              <th>是否存在第二期收费 :</th>
              <td colspan="3">{{ caseInfo.sdsf ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th>案件名称 :</th>
              <td style="white-space: normal">{{ caseInfo.caseName }}</td>
              <th>案件名称（英文） :</th>
              <td>{{ caseInfo.caseEnName }}</td>
            </tr>
            <tr>
              <th
                v-if="
                  tmCaseTypeIdList.includes(this.caseInfo.caseTypeId) ||
                  this.caseInfo.caseTypeId === 17
                "
              >
                前案案件类型 :
              </th>
              <td
                v-if="
                  tmCaseTypeIdList.includes(this.caseInfo.caseTypeId) ||
                  this.caseInfo.caseTypeId === 17
                "
              >
                {{ caseInfo.parentCaseType }}
              </td>
              <th
                v-if="
                  !(
                    tmCaseTypeIdList.includes(this.caseInfo.caseTypeId) ||
                    this.caseInfo.caseTypeId === 17
                  )
                "
              >
                相关案件 :
              </th>
              <td
                colspan="3"
                v-if="
                  !(
                    tmCaseTypeIdList.includes(this.caseInfo.caseTypeId) ||
                    this.caseInfo.caseTypeId === 17
                  )
                "
              >
                {{ caseInfo.parentAgentNum }}
              </td>
              <th v-if="tmCaseTypeIdList.includes(this.caseInfo.caseTypeId)">
                前案官文收文日期 :
              </th>
              <td v-if="tmCaseTypeIdList.includes(this.caseInfo.caseTypeId)">
                {{ caseInfo.parentCaseRecvDate }}
              </td>
            </tr>
            <tr v-if="caseInfo.caseType === '商标行政'">
              <th>前案官文发文编号 :</th>
              <td colspan="3">{{ caseInfo.parentDocNumber }}</td>
            </tr>
            <tr>
              <th>基本案情介绍 :</th>
              <td colspan="3">{{ caseInfo.caseIntroduce }}</td>
            </tr>
            <tr>
              <th>管辖法院 :</th>
              <td>{{ caseInfo.courtCustName }}</td>
              <th>法院案号 :</th>
              <td>{{ caseInfo.courtCaseNumber }}</td>
            </tr>
            <tr>
              <th>合议庭 :</th>
              <td colspan="3" class="nocopy">
                <table class="table mb-0">
                  <tbody>
                    <tr>
                      <th style="width: 10%">审判长 :</th>
                      <td>{{ caseInfo.collegialBench }}</td>
                    </tr>
                    <tr>
                      <th>审判员 :</th>
                      <td>{{ caseInfo.judge }}</td>
                    </tr>
                    <tr>
                      <th>法官助理 :</th>
                      <td>{{ caseInfo.judgeAssistant }}</td>
                    </tr>
                    <tr>
                      <th>书记员 :</th>
                      <td>{{ caseInfo.clerk }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr
              v-if="
                caseInfo?.lawsuitCasetypeArray?.find((item) =>
                  [109, 110, 150, 151, 300047, 153, 154].includes(item)
                )
              "
            >
              <th>判赔金额 :</th>
              <td>{{ caseInfo.compensateAmount }}</td>
              <th>标的金额 :</th>
              <td>{{ caseInfo.underlyingAmount }}</td>
            </tr>
            <tr>
              <th>审理方式 :</th>
              <td>
                {{
                  caseInfo.hearWayArray
                    ? caseInfo.hearWayArray
                        ?.map((item) =>
                          transformation(
                            selectDataByClass["1134"],
                            item,
                            "id",
                            "typeName"
                          )
                        )
                        .join(",")
                    : ""
                }}
              </td>
              <th>结案方式 :</th>
              <td>
                {{
                  transformation(
                    selectDataByClass["1135"],
                    caseInfo.closeWay,
                    "id",
                    "typeName"
                  )
                }}
              </td>
            </tr>
            <tr>
              <th>判决结果 :</th>
              <td>{{ caseInfo.judgment }}</td>
              <th>所涉及条款 :</th>
              <td>{{ caseInfo.clause }}</td>
            </tr>
            <tr>
              <th>审理尺度分析 :</th>
              <td>{{ caseInfo.hearMeasureAnalyze }}</td>
              <th>报价 :</th>
              <td>{{ caseInfo.caseOffer || "0" }}</td>
            </tr>
            <tr>
              <th>后续工作及建议 :</th>
              <td colspan="3">{{ caseInfo.laterSuggest }}</td>
            </tr>
            <tr>
              <th>案件备注 :</th>
              <td
                colspan="3"
                style="white-space: normal"
              >
                {{ caseInfo.memo }}
              </td>
            </tr>
            <tr>
              <th>外方代理所 :</th>
              <td>{{ caseInfo.agencyCustName }}</td>
              <th>涉及国家 :</th>
              <td>{{ caseInfo.appState }}</td>
            </tr>
            <tr>
              <th>外方代理所联系人 :</th>
              <td>{{ caseInfo.agencyCustContactName }}</td>
              <th>外方代理所地址 :</th>
              <td>{{ caseInfo.agencyCustAddrName }}</td>
            </tr>
            <tr>
              <th>外方代理所文号 :</th>
              <td colspan="3">{{ caseInfo.foreignAgentNum }}</td>
            </tr>
            <tr>
              <th>外方代理所要求 :</th>
              <td colspan="3" style="white-space: normal">{{ caseInfo.agencyCustReq }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { querycustSelectClass } from "@/api/caseDetail";
import { getCaseTypeList } from "@/utils/user";
import { getMenuName } from "@/utils";

export default {
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectDataByClass: [],
      caseTypeList: getCaseTypeList(),
      tmCaseTypeIdList: [],
    };
  },
  methods: {
    transformation(arr, val, valType, labelStr) {
      if (arr && arr.length) {
        var item = arr.find((item) => item[valType] == val);
        if (item) {
          return item[labelStr];
        } else {
          return "";
        }
      }
      return "";
    },
    fetchcustSelectClass() {
      querycustSelectClass({ classId: "1042,1134,1135,1027,1029,1020" }).then(
        (response) => {
          if (response.success) {
            this.selectDataByClass = response.data;
          } else {
            this.$message.error(response.message);
          }
        }
      );
    },
    formatTmCaseTypeIdList() {
      const arr = this.caseTypeList;
      let tmTypeList = arr?.splice(
        arr?.findIndex((item) => item.caseType == "商标"),
        1
      );
      this.tmCaseTypeIdList = [
        ...getMenuName(tmTypeList).map((item) => item.caseTypeId),
        94,
      ];
    },
  },
  created() {
    this.fetchcustSelectClass();
    this.formatTmCaseTypeIdList();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
