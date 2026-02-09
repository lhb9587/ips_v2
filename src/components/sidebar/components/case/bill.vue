<script>
import BillSidebar from "@/components/sidebar/bill-sidebar";

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
        { title: "账单号", value: "billNo", width: 150 },
        {
          title: "官费",
          value: "officialCost",
        },
        {
          title: "服务费",
          value: "serviceCost",
        },
        { title: "服务费（折扣后）", value: "serviceCostDiscount", width: 140 },
        {
          title: "杂费",
          value: "otherCost",
        },
        {
          title: "总金额",
          value: "billSum",
        },
        {
          title: "账单状态",
          value: "wfStatus",
        },
        {
          title: "收款日期",
          value: "paymentDate",
        },
      ],
      isBillDetail: false,
      billId:undefined,
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.caseInfo.caseBillArray || [];
    },
  },
  methods:{
    toggleBillSidebar(rowInfo) {
      this.billId = rowInfo.billId;
      this.isBillDetail = !this.isSBillDetail;
    },
    billSidebarUpdate(value) {
      this.isBillDetail = value;
    },
  }
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <el-table
        :data="tableData"
        :max-height="maxHeight"
        :fit="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :width="col.width ? col.width : 'auto'"
        >
          <template #default="scope">
            <span v-if="col.value === 'billNo'" class="clickable" @click="toggleBillSidebar(scope.row)">{{ scope.row.billNo }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <BillSidebar
    v-if="isBillDetail"
    :showSidebar="isBillDetail"
    @update:showSidebar="billSidebarUpdate"
    :billId="billId"
  />
</template>
