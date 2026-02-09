<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">基本信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                案件文号 :
              </th>
              <td style="width: 40%">
                <el-dropdown
                  trigger="click"
                  :hide-on-click="true"
                  placement="bottom-start"
                  popper-class="dropdown-menu-custom"
                  v-if="
                    billInfo.showRefno?.indexOf('~') != -1 ||
                    billInfo.showRefno?.indexOf('/') != -1
                  "
                >
                  <div
                    :title="billInfo.showRefno"
                    style="
                      max-width: 300px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                      v-on:click.stop="fetchCaseList(billInfo.billId)"
                  >
                    <span
                      class="clickable"
                    >
                      {{ billInfo.showRefno }}
                    </span>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu style="max-height: 126px">
                      <el-dropdown-item
                        v-for="item in caseagentNumList"
                        :key="item"
                        @click="queryCaseDetailFunc(item)"
                        >{{ item.agentNum }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <span
                  v-else
                  class="clickable"
                  v-on:click.stop="toggleCaseSidebar(billInfo)"
                  >{{ billInfo.showRefno }}</span
                >
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                账单号 :
              </th>
              <td style="width: 40%">{{ billInfo.billNo }}</td>
            </tr>
            <tr>
              <th scope="row">案件类型 :</th>
              <td>{{ getCaseTypeIdString(billInfo.caseTypeIdString) }}</td>
              <th scope="row">所属工作组 :</th>
              <td>{{ billInfo.wkgIdString }}</td>
            </tr>
            <tr>
              <th scope="row">客户 :</th>
              <td colspan="3">
                <span class="clickable" v-on:click="toggleCustSidebar">
                  {{ billInfo.custFullNameString }}
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">案件描述 :</th>
              <td
                colspan="3"
                class="nocopy"
                v-html="getSpecialInfo(billInfo.caseDesc)"
              ></td>
            </tr>
            <tr>
              <th scope="row">结算币种 :</th>
              <td>{{ billInfo.curIdString }}</td>
              <th scope="row">账单折扣 :</th>
              <td>{{ billInfo.discount }}</td>
            </tr>
            <tr>
              <th scope="row">账单状态 :</th>
              <td>{{ billInfo.wfStatus }}</td>
              <th scope="row">收款状态 :</th>
              <td>{{ billInfo.paymentStatusStr }}</td>
            </tr>
            <tr>
              <th scope="row">开单人 :</th>
              <td>{{ billInfo.billUserIdString }}</td>
              <th scope="row">开单日期 :</th>
              <td>{{ billInfo.billDate }}</td>
            </tr>
            <tr>
              <th scope="row">备注 :</th>
              <td colspan="3">{{ billInfo.remarks }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
  <CustomerSidebar
    :custId="billInfo.custId"
    v-if="isCustDetail"
    :showSidebar="isCustDetail"
    @update:showSidebar="custSidebarUpdate"
  />
</template>

<script>
import CaseSidebar from "@/components/sidebar/case-sidebar";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";
import { queryCaseListByBillId, queryBillUrl } from "@/api/billApi";
export default {
  props: {
    billInfo: {
      type: Object,
      required: true,
    },
  },
  components: {
    CaseSidebar,
    CustomerSidebar
  },
  data() {
    return {
      caseId: "",
      taskType: "",
      isCaseDetail: false,
      isCustDetail:false,
      caseagentNumList: [],
    };
  },
  methods: {
    toggleCustSidebar() {
      this.isCustDetail = true;
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
    },
    getCaseTypeIdString(str) {
      return (str && [...new Set(str.split(","))].join(",")) || "";
    },
    getSpecialInfo(string) {
      if (string) {
        return string
          .split("\n")
          .map(
            (
              item
            ) => `<div title="${item}" style="word-wrap: break-word;line-height:24px;
            word-break: break-word;">${item}</div>`
          )
          .join("");
      } else {
        return "";
      }
    },
    fetchCaseList(billId) {
      queryCaseListByBillId({ billId: billId }).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.caseagentNumList = res.data;
        }
      });
    },
    queryCaseDetailFunc(info) {
      this.caseId = info.caseId;
      this.taskType = info.taskType;
      this.isCaseDetail = true;
    },
    caseSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    toggleCaseSidebar(info) {
      queryBillUrl({ billId: info.billId }).then((res) => {
        this.taskType = res.data.taskType;
        this.caseId = res.data.caseId;
        this.isCaseDetail = true;
      });
    },
  },
  created() {
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
