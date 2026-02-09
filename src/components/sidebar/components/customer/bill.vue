<template>
  <div class="row">
    <div
      v-for="stat of statData"
      :key="stat.icon"
      class="col-12 col-md-6 col-lg-3"
    >
      <Stat
        :icon="stat.icon"
        :title="stat.title"
        :help-text="stat.helpText"
        :value="stat.value"
      />
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">最近账单</h4>
      <el-table
        :data="custWithBillList"
        :max-height="maxHeight"
        :fit="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
        >
          <template #default="scope">
            <div v-if="col.value === 'agentNumString'">
              <el-dropdown
                trigger="click"
                :hide-on-click="true"
                placement="bottom-start"
                popper-class="dropdown-menu-custom"
                v-if="
                  scope.row.agentNumString?.indexOf('~') != -1 ||
                  scope.row.agentNumString?.indexOf('/') != -1
                "
              >
                <span
                  class="clickable"
                  v-on:click.stop="fetchCaseList(scope.row.billId)"
                >
                  {{ scope.row.agentNumString }}
                </span>
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
                v-on:click.stop="toggleCaseSidebar(scope.row)"
                >{{ scope.row.agentNumString }}</span
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-3" v-if="total > 0">
        <Pagination
          :total="total"
          v-model:page="listQuery.pageNo"
          v-model:limit="listQuery.pageSize"
          @pagination="fetchCustonWithBill"
          :pageSizes="pageSizesList"
          :storage="false"
        ></Pagination>
      </div>
    </div>
  </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="handleSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
</template>

<script>
import Stat from "@/components/sidebar/components/customer/stat";
import Pagination from "@/components/common/pagination/index.vue";
import CaseSidebar from "@/components/sidebar/case-sidebar.vue";
import { formatAmount } from "@/utils";
import { fetchList,queryBillUrl,queryCaseListByBillId } from "@/api/billApi";

export default {
  components: { Stat, Pagination, CaseSidebar },
  props: {
    billCount: {
      type: Object,
      default: () => {},
    },
    customerInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      statData: [
        {
          icon: "bx bx-check-circle",
          title: "已收款",
          helpText: "包括账单收款、预收款、赔偿款等款项金额",
          value: 0,
        },
        {
          icon: "bx bx-select-multiple",
          title: "账单收款",
          helpText: "账单总金额的收款",
          value: 0,
        },
        {
          icon: "bx bx-hourglass",
          title: "账单未收款",
          helpText: "账单总金额的未收款",
          value: 0,
        },
        {
          icon: "bx bx-package",
          title: "账单收入",
          helpText: "账单总金额-账单官费",
          value: 0,
        },
      ],
      columns: [
        { title: "账单号", value: "billNo" },
        {
          title: "案件文号",
          value: "agentNumString",
          interdictShowTooltip: true,
        },
        {
          title: "案件类型",
          value: "caseTypeIdString",
        },
        {
          title: "账单金额",
          value: "billSum",
        },
      ],
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
      maxHeight: document.documentElement.clientHeight - 354,
      custWithBillList: [],
      caseId: "",
      taskType: 1,
      isCaseDetail: false,
      caseagentNumList: [],
    };
  },
  watch: {
    billCount: {
      handler(val) {
        this.statData[0].value = formatAmount(val.paidSum) || 0;
        this.statData[1].value = formatAmount(val.billPaidSum) || 0;
        this.statData[2].value = formatAmount(val.billUpaid) || 0;
        this.statData[3].value = formatAmount(val.billIncome) || 0;
      },
      immediate: true,
    },
    "customerInfo.custId": {
      handler() {
        this.fetchCustonWithBill();
      },
      immediate: true,
    },
  },
  methods: {
    toggleCaseSidebar(rowInfo) {
      queryBillUrl({ billId:rowInfo.billId }).then((res) => {
        this.taskType = res.data.taskType
        this.caseId = res.data.caseId;
        this.isCaseDetail = true;
      });
    },
    handleSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    fetchCustonWithBill() {
      fetchList({
        ...this.listQuery,
        custIdList: [this.customerInfo.custId],
      },{isLoading: true}).then((res) => {
        this.custWithBillList = res.data || [];
        this.total = res.total || 0;
      });
    },
    fetchCaseList(billId) {
      queryCaseListByBillId({ billId: billId }).then(
        (res) => {
          if (res.success && res.data && res.data.length > 0) {
            this.caseagentNumList = res.data;
          }
        }
      );
    },
    queryCaseDetailFunc (info){
      this.caseId = info.caseId
      this.taskType = info.taskType
      this.isCaseDetail = true;
    }
  },
};
</script>