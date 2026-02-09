<script>
import { formatAmount,downLoadAll } from "@/utils";
export default {
  props: {
    feeInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {},
  data() {
    return {
      feeDetailColumns: [
        { title: "费用类型", value: "feetName", width: 300 },
        { title: "费用名", value: "feeName" },
        { title: "金额", value: "amount", width: 100 },
        { title: "发票金额", value: "invoices",width:200 },
        { title: "收款对方名称", value: "receiverName" },
        { title: "费用描述", value: "feeDesc" },
      ],
    };
  },
  computed: {
    tableData() {
      return this.feeInfo.feeDetails || [];
    },
    totalSum() {
      let amountList = this?.feeInfo?.feeDetails
        ?.map((item) => item.amount)
        .filter((item) => !!item);
      if (amountList?.length == 0) {
        return 0.0;
      }
      if (amountList?.length == 1) {
        return amountList[0];
      } else {
        return this.feeInfo?.feeDetails
          ?.map((item) => item.amount)
          .filter((item) => !!item)
          .reduce((pre, next) => {
            return Number(pre) + Number(next);
          });
      }
    },
    invoiceTotalSum() {
      const uniqueInvIds = new Set(); // 用于存储唯一的invId
      const amountList = this.feeInfo?.feeDetails?.reduce(
        (accumulator, item) => {
          if (item.invoices) {
            item.invoices.forEach((invoice) => {
              if (invoice.invStatus != 0) {
                if (!uniqueInvIds.has(invoice.invId)) {
                  const amount = parseFloat(invoice.amountInFiguers);
                  if (!isNaN(amount)) {
                    accumulator.push(amount);
                    uniqueInvIds.add(invoice.invId);
                  }
                }
              }
            });
          }
          return accumulator;
        },
        []
      );

      if (amountList?.length === 0) {
        return 0.0;
      } else if (amountList?.length === 1) {
        return amountList[0]?.toFixed(2);
      } else {
        const totalSum = amountList?.reduce((pre, next) => pre + next);
        return totalSum?.toFixed(2);
      }
    },
  },
  methods: {
    formatAmount,
    downLoadAll,
    preView(url){
      if(['pdf','jpg','png'].some(item=>url.replace(/.+\./,"").toLocaleLowerCase()==item)){
        window.open(`/ipdoc${url}`.replace(/[+]/g,'%2B'))
      } else {
        this.downLoadAll({url:`/ipdoc${url}`})
      }
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">费用明细</h4>
      <div class="table-responsive">
        <el-table
          :data="tableData"
          :max-height="500"
          :fit="true"
          :show-overflow-tooltip="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of feeDetailColumns"
            :key="col.value"
            :type="col.type ? col.type : 'text'"
            :width="col.width ? col.width : 'auto'"
          >
            <template #default="scope" v-if="col.value === 'invoices'">
              <div
                v-for="inv in scope.row.invoices"
                :key="inv.invId"
              >
                <span>
                  <span style="margin-right: 4px;" :class="inv.invStatus == 0 ? 'del_line' : ''"
                    >￥{{ inv.amountInFiguers }}</span
                  >
                  <span
                    :class="
                      inv.invStatus == 0
                        ? 'del_line'
                        : inv.invPath
                        ? 'invoice-fpgl'
                        : ''
                    "
                    :title="inv.invStatus == 0 ? '发票不可用' : ''"
                    @click="preView(`${inv.invPath}`)"
                    >No.{{ inv.invoiceNum }}</span
                  >
                  <el-tooltip
                    :disabled="!inv.veriCode != 0"
                    effect="light"
                    :content="inv.veriMessge"
                    placement="top"
                  >
                    <i
                      v-if="inv.veriCode != 0"
                      :style="
                        'cursor: pointer;' +
                        (inv.veriCode == -1
                          ? 'color:#ebbb35'
                          : inv.veriCode == -11
                          ? 'color:#02c348'
                          : 'color:red')
                      "
                      class="el-icon-warning"
                    ></i>
                  </el-tooltip>
                  
                </span>
              </div>
              <div v-if="scope.row.noInv == 1">
                <el-checkbox
                  :disabled="true"
                  label="无需关联发票"
                  v-model="scope.row.noInv"
                  name="type"
                  :true-label="1"
                  :false-label="0"
                  style="margin-bottom: 0;"
                ></el-checkbox>
                <el-tooltip
                  class="item"
                  effect="light"
                  placement="top-start"
                >
                  <template #content>
                    <div style="margin-top: 1px">无需查验票包括以下类型：</div>
                    <br />定额发票、卷联打车票、蓝联机票行程单、火车票、客户抬头票、财政部监制的非税收入票<br />
                  </template>
                  <i
                    class="dripicons-information"
                    style="cursor: pointer;font-size: 14px;margin-left: 6px;"
                  ></i>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div
        style="
          display: flex;
          justify-content: flex-end;
          gap: 24px;
          font-size: 14px;
        "
      >
        <div>
          总金额：<span class="fw-bold">￥{{ formatAmount(totalSum) }}</span>
        </div>
        <div>
          发票总金额：<span class="fw-bold"
            >￥{{ formatAmount(invoiceTotalSum) }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.del_line {
  text-decoration: line-through red;
}
.invoice-fpgl {
  color: #52a0f5;
  cursor: pointer;
}
</style>
