<script>
import BillSidebar from "@/views/finance/bill-management/bill-internal/detail-sidebar.vue";

export default {
  props: {
    caseInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {
    BillSidebar,
  },
  data() {
    return {
      columns: [
        { title: "内部账单号", value: "billInterNo" },
        {
          title: "官费",
          value: "officialCost",
        },
        {
          title: "服务费",
          value: "serviceCost",
        },
        {
          title: "杂费",
          value: "otherCost",
        },
        {
          title: "总金额",
          value: "total",
        },
        {
          title: "承办组",
          value: "costWkgIdString",
        },
        {
          title: "客户组",
          value: "costWkgIdString",
        },
        {
          title: "账单状态",
          value: "tobillStatusString",
        },
      ],
      isBillDetail: false,
      maxHeight: document.documentElement.clientHeight - 168,
      billInterId: "",
    };
  },
  computed: {
    tableData() {
      return this.caseInfo.caseBillInternalArray || [];
    },
  },
  methods: {
    toggleBillSidebar(rowInfo) {
      this.billInterId = rowInfo.billInterId;
      this.isBillDetail = !this.isSBillDetail;
    },
    handleSidebarUpdate(value) {
      this.isBillDetail = value;
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <div class="p-3 pt-0">
        <el-table
          :data="tableData"
          :max-height="maxHeight"
          :fit="true"
          :show-overflow-tooltip="true"
          @row-click="toggleBillSidebar"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
          >
            <template #default="scope">
              <span
                v-if="col.value === 'billInterNo'"
                class="clickable"
                >{{ scope.row.billInterNo }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <BillSidebar
    v-if="isBillDetail"
    :showSidebar="isBillDetail"
    @update:showSidebar="handleSidebarUpdate"
    :billinterid="billInterId"
  />
</template>
