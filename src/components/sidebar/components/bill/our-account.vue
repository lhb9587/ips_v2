<template>
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">我方账户</h4>
  
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
                  我方账户 :
                </th>
                <td style="width: 40%">{{ billInfo.payAccountIdString }}</td>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  银行账户名称 :
                </th>
                <td style="width: 40%">{{ billInfo.bankAccountName }}</td>
              </tr>
              <tr>
                <th scope="row">开户银行 :</th>
                <td colspan="3">{{ billInfo.bankName }}</td>
              </tr>
              <tr>
                <th scope="row">银行账号 :</th>
                <td>{{ billInfo.bankAccount }}</td>
                <th scope="row">银行行号 :</th>
                <td>{{ billInfo.bankNo}}</td>
              </tr>
              <tr>
                <th scope="row">银行国际代码 :</th>
                <td colspan="3">{{ billInfo.swiftCode }}</td>
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
  