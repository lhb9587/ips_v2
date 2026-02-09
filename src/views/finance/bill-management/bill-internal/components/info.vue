<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">基本信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">案件文号 :</th>
              <td style="width: 40%">{{ billInfo.showrefno }}</td>
              <th style="width: 10%">案件类型 :</th>
              <td style="width: 40%">{{ billInfo.caseTypeIdString }}</td>
            </tr>
            <tr>
              <th>内部账单号 :</th>
              <td colspan="3">{{ billInfo.billinterno }}</td>
            </tr>
            <tr>
              <th>客户 :</th>
              <td>{{ billInfo.custIdString }}</td>
              <th>客户文号 :</th>
              <td>{{ billInfo.custRefno }}</td>
            </tr>
            <tr>
              <th>承办组(所属工作组) :</th>
              <td>{{ billInfo.costWkgIdString }}</td>
              <th>客户组 :</th>
              <td>{{ billInfo.wkgidString }}</td>
            </tr>
            <tr>
              <th>所属部门 :</th>
              <td colspan="3">{{ billInfo.deptname }}</td>
            </tr>
            <tr>
              <th>发生日期 :</th>
              <td>{{ billInfo.begindate }}</td>
              <th>结束日期 :</th>
              <td>{{ billInfo.enddate }}</td>
            </tr>
            <tr>
              <th>开单人 :</th>
              <td>{{ billInfo.reimburseUserIdString }}</td>
              <th>开单日期 :</th>
              <td>{{ billInfo.fillindate }}</td>
            </tr>
            <tr>
              <th>所属月 :</th>
              <td colspan="3">{{ billInfo.belongtodate }}</td>
            </tr>
            <tr>
              <th>收单人 :</th>
              <td>{{ billInfo.receiveUserIdString }}</td>
              <th>总金额 :</th>
              <td>{{ billInfo.total }}</td>
            </tr>
            <tr>
              <th>填报人 :</th>
              <td colspan="3">{{ billInfo.fillinUserIdString }}</td>
            </tr>
            <tr>
              <th>核销状态 :</th>
              <td>{{ billInfo.tobillStatusString }}</td>
              <th>核销日期 :</th>
              <td>{{ billInfo.tobilldate }}</td>
            </tr>
            <tr>
              <th>备注 :</th>
              <td colspan="3">{{ billInfo.remarks }}</td>
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
