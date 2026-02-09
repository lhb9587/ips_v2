<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">银行信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">收款人名称 :</th>
              <td style="width: 40%">{{ billInfo.payeeName }}</td>
              <th style="width: 10%">收款人地址 :</th>
              <td style="width: 40%">{{ billInfo.accAddr }}</td>
            </tr>
            <tr>
              <th>开户银行名称 :</th>
              <td>{{ billInfo.bankName }}</td>
              <th>开户银行地址 :</th>
              <td>{{ billInfo.address }}</td>
            </tr>
            <tr>
              <th>开户银行账户 :</th>
              <td>
                {{ billInfo.account }}
              </td>
              <th>Swift Code :</th>
              <td>
                {{ billInfo.swiftcode }}
              </td>
            </tr>
            <tr>
              <th>代理银行名称 :</th>
              <td>{{ billInfo.agencyBankName }}</td>
              <th>代理银行地址 :</th>
              <td>{{ billInfo.agencyBankAddr }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    billInfo: {
      type: Object,
      required: true,
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
