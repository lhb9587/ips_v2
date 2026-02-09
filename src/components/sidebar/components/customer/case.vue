<template>
  <div class="row">
    <div
      v-for="stat of statData"
      :key="stat.icon"
      class="col-md-4"
    >
      <Stat
        :icon="stat.icon"
        :title="stat.title"
        :value="stat.value"
      />
    </div>
  </div>
  <div class="card mb-0">
    <div class="card-body">
      <h4 class="card-title mb-4">最近案件</h4>
      <el-table
        :data="custWithcaseList"
        :max-height="maxHeight"
        :fit="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :width="col.width?col.width:'auto'"
        >
          <template #default="scope">
            <span
              v-if="col.value === 'agentNum'"
              class="agent-number"
              v-on:click="toggleCaseSidebar(scope.row.caseId,scope.row.taskType)"
              >{{ scope.row.agentNum }}</span
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-3" v-if="total > 0">
        <Pagination
          :total="total"
          v-model:page="listQuery.pageNo"
          v-model:limit="listQuery.pageSize"
          @pagination="fetchCustonWithCase"
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
    :caseId="itemCaseId"
    :taskType="taskType"
  />
</template>

<script>
import Stat from "@/components/sidebar/components/customer/stat";
import Pagination from "@/components/common/pagination/index.vue";
import { getAllCaseInfo } from "@/api/caseList";
import CaseSidebar from "@/components/sidebar/case-sidebar.vue";

export default {
  components: { Stat, Pagination,CaseSidebar },
  props: {
    caseCount: {
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
          title: "已结案",
          value: 0,
        },
        {
          icon: "bx bx-hourglass",
          title: "进行中",
          value: 0,
        },
        {
          icon: "bx bx-package",
          title: "今年新立案",
          value: 0,
        },
      ],
      columns: [
        { title: "案件名称", value: "caseName" },
        {
          title: "案件文号",
          value: "agentNum",
        },
        {
          title: "案件类型",
          value: "caseTypeStr",
        },
        {
          title: "申请方向",
          value: "appFromto",
          width: 100
        },
      ],
      maxHeight: document.documentElement.clientHeight - 354,
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
      custWithcaseList: [],
      itemCaseId: "",
      taskType: 1,
      isCaseDetail: false,
    };
  },
  watch: {
    caseCount: {
      handler(val) {
        this.statData[0].value = val.closeCases || 0;
        this.statData[1].value = val.ongoingCases || 0;
        this.statData[2].value = val.currYearCases || 0;
      },
      immediate: true,
    },
    "customerInfo.custId": {
      handler() {
        this.fetchCustonWithCase();
      },
      immediate: true,
    },
  },
  methods: {
    toggleCaseSidebar(caseId,taskType){
      this.itemCaseId = caseId;
      this.taskType = taskType;
      this.isCaseDetail = true;
    },
    handleSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    fetchCustonWithCase() {
      getAllCaseInfo({
        ...this.listQuery,
        custIdArray: [this.customerInfo.custId],
      },{isLoading: true}).then((res) => {
        this.custWithcaseList = res.data || [];
        this.total = res.total || 0;
      });
    },
  },
};
</script>
<style scoped>
.agent-number {
  cursor: pointer;
  color: #556ee6 !important;
}
</style>
