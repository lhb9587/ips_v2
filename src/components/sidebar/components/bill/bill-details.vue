<script>
import { formatAmount, fomatFloat } from "@/utils";
export default {
  props: {
    billInfo: {
      type: Object,
      default: () => {},
    },
  },
  components: {},
  data() {
    return {
      serviceChargeColumns: [
        { title: "发生期始", value: "startdate" },
        {
          title: "服务费描述",
          value: "description",
        },
        {
          title: "数量",
          value: "number",
        },
        {
          title: "本币单价",
          value: "localprice",
        },
        {
          title: "本币金额",
          value: "localsum",
        },
        {
          title: "员工",
          value: "useridString",
        },
      ],
      officialExpensesColumns: [
        { title: "发生期始", value: "startdate" },
        {
          title: "官费描述",
          value: "description",
        },
        {
          title: "数量",
          value: "number",
        },
        {
          title: "本币单价",
          value: "localprice",
        },
        {
          title: "本币金额",
          value: "localsum",
        },
      ],
      incidentalColumns: [
        { title: "发生期始", value: "startdate" },
        {
          title: "杂费描述",
          value: "description",
        },
        {
          title: "本币金额",
          value: "localsum",
        },
      ],
      maxHeight: 160,
      totalLocalCurrencyBills: 0,
    };
  },
  methods: {
    formatAmount,
    fomatFloat(number) {
      return fomatFloat(number, 2);
    },
  },
  computed: {
    totalPrincipal_fw() {
      let fw_number = 0;
      if (this.billInfo.billDetailsfwf) {
        this.billInfo.billDetailsfwf.forEach((item) => {
          fw_number += Number(item.localsum);
        });
      }
      return this.fomatFloat(fw_number);
    },
    tableDatafwf() {
      return this.billInfo.billDetailsfwf || [];
    },
    tableDatagf() {
      return this.billInfo.billDetailgf || [];
    },
    tableDatazf() {
      return this.billInfo.billDetailzf || [];
    },
    totalPrincipal_gf() {
      let gf_number = 0;
      if (this.tableDatagf.length > 0) {
        this.tableDatagf.forEach((item) => {
          gf_number += Number(item.localsum);
        });
      }
      return this.fomatFloat(gf_number);
    },
    totalPrincipal_fw_zh() {
      let fw_number = 0;
      if (this.tableDatafwf.length > 0) {
        this.tableDatafwf.forEach((item) => {
          fw_number += Number(item.localsum * item.discount * 0.01);
        });
      }
      return this.fomatFloat(fw_number);
    },
    totalPrincipal_zf() {
      let zf_number = 0;
      if (this.tableDatazf) {
        this.tableDatazf.forEach((item) => {
          zf_number += Number(item.localsum);
        });
      }
      return this.fomatFloat(zf_number);
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">服务费</h4>
      <div class="table-responsive">
        <el-table
          :data="tableDatafwf"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="{
            effect: 'dark',
            popperClass: 'popper-item',
          }"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of serviceChargeColumns"
            :key="col.value"
            :width="col.value == 'startdate' ? '120px' : 'auto'"
          >
            <template #default="scope">
              <span v-if="['localprice', 'localsum'].includes(col.value)">{{
                formatAmount(scope.row[col.value])
              }}</span>
              <span v-else>{{ scope.row[col.value] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        style="display: flex; justify-content: flex-end; gap: 24px;font-size:14px"
      >
        <div>数量合计：<span class="fw-bold">{{ billInfo.billDetailsfwf?.length || "0" }}</span>条</div>
        <div>本币金额合计（折扣前）：<span class="fw-bold">￥{{ fomatFloat(totalPrincipal_fw) }}</span></div>
        <div>
          本币金额合计（折扣后）：<span class="fw-bold">￥{{ fomatFloat(totalPrincipal_fw_zh) }}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">官费</h4>
      <div class="table-responsive">
        <el-table
          :data="tableDatagf"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="{
            effect: 'dark',
            popperClass: 'popper-item',
          }"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of officialExpensesColumns"
            :key="col.value"
            :width="col.value == 'startdate' ? '120px' : 'auto'"
          >
            <template #default="scope">
              <span v-if="['localprice', 'localsum'].includes(col.value)">{{
                formatAmount(scope.row[col.value])
              }}</span>
              <span v-else>{{ scope.row[col.value] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        style="display: flex; justify-content: flex-end; gap: 24px;font-size:14px"
      >
        <div>数量合计：<span class="fw-bold">{{ billInfo.billDetailgf?.length || "0" }}</span>条</div>
        <div>本币金额合计：<span class="fw-bold">￥{{ fomatFloat(totalPrincipal_gf) }}</span></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">杂费</h4>
      <div class="table-responsive">
        <el-table
          :data="tableDatazf"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="{
            effect: 'dark',
            popperClass: 'popper-item',
          }"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of incidentalColumns"
            :key="col.value"
            :width="col.value == 'startdate' ? '120px' : 'auto'"
          >
            <template #default="scope">
              <span v-if="['localsum'].includes(col.value)">{{
                formatAmount(scope.row[col.value])
              }}</span>
              <span v-else>{{ scope.row[col.value] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        style="display: flex; justify-content: flex-end; gap: 24px;font-size:14px"
      >
        <div>数量合计：<span class="fw-bold">{{ billInfo.billDetailzf?.length || "0" }}</span>条</div>
        <div>本币金额合计：<span class="fw-bold">￥{{ fomatFloat(totalPrincipal_zf) }}</span></div>
      </div>
    </div>
  </div>
  <div
    style="display: flex; justify-content: flex-end; align-items: center"
  >
    <span style="font-size: 16px;">本币账单共计</span>：<span style="font-size: 20px; color: #dc3545; font-weight: bold;">{{
      formatAmount(
        Number(totalPrincipal_gf) +
          Number(totalPrincipal_fw_zh) +
          Number(totalPrincipal_zf)
      )
    }}</span>
  </div>
</template>
<style scoped lang="scss">
.modal-dialog {
  max-width: 600px !important;
}
.fw-bold{
  font-weight: bold;
}
</style>
