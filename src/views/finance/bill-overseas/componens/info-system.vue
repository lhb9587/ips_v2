<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">系统信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">备注 :</th>
              <td colspan="3">
                {{ billInfo.remarks }}
              </td>
            </tr>
            <tr>
              <th style="width: 10%">同批付款金额 :</th>
              <td style="width: 40%">
                {{ formatAmount(billInfo.batchPayMoney) }}
              </td>
              <th style="width: 10%">同批付款境外账单号 :</th>
              <td style="width: 40%">{{ billInfo.batchAbroadNo }}</td>
            </tr>
            <tr>
              <th>创建人 :</th>
              <td>{{ billInfo.createUserName }}</td>
              <th>创建日期 :</th>
              <td>{{ billInfo.createDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { formatAmount } from "@/utils";
export default {
  props: {
    billInfo: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatAmount,
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
