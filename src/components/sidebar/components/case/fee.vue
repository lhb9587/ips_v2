<script>
import FeeSidebar from "@/views/finance/finance-fee/detail-sidebar";

export default {
  props: {
    caseInfo: {
      type: Object,
      required: () => {},
    },
    feeList: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    FeeSidebar,
  },
  data() {
    return {
      columns: [
        { title: "科目", value: "feeName", width: 120 },
        {
          title: "总金额",
          value: "total",
        },
        {
          title: "费用承担组",
          value: "groupname",
        },
        {
          title: "报销人所属组",
          value: "reimburseWkgIdStr",
        },
        {
          title: "报销人",
          value: "fullname",
        },
        {
          title: "是否境外账单",
          value: "isAbroadBill",
        },
        {
          title: "核销状态",
          value: "tobillStatusStr",
        },
        {
          title: "费用状态",
          value: "wfStatus",
        },
      ],
      isShowDetail: false,
      feeId: undefined,
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.feeList || [];
    },
  },
  methods: {
    handleSidebarUpdate(value) {
      this.isShowDetail = value;
    },
    toggleSidebar(rowInfo) {
      this.feeId = rowInfo.feeId;
      this.isShowDetail = !this.isShowDetail;
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <el-table
        :data="tableData"
        :max-height="maxHeight"
        :show-overflow-tooltip="true"
        :scrollbar-always-on="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :width="col.width ? col.width : 'auto'"
        >
          <template #default="scope">
            <span
              v-if="col.value === 'feeName'"
              class="clickable"
              @click="toggleSidebar(scope.row)"
              >{{ scope.row.feeName }}</span
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <FeeSidebar
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    :feeId="feeId"
  />
</template>
