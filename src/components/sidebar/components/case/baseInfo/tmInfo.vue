<template>
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
            案件类型 :
          </th>
          <td style="width: 40%">{{ caseInfo.caseType }}</td>
          <th
            scope="row"
            style="width: 10%"
          >
            申请方向 :
          </th>
          <td style="width: 40%">{{ caseInfo.appFromto }}</td>
        </tr>
        <tr>
          <th scope="row">所属项目 :</th>
          <td>{{ caseInfo.project }}</td>
          <th scope="row">合同编号 :</th>
          <td>{{ caseInfo.contractNo }}</td>
        </tr>
        <tr>
          <th scope="row">案件文号 :</th>
          <td>{{ caseInfo.agentNum }}</td>
          <th scope="row">机密案件 :</th>
          <td>{{ caseInfo.ifSec ? "是" : "否" }}</td>
        </tr>
        <tr>
          <th scope="row">申请方式 :</th>
          <td>{{ caseInfo.submitType }}</td>
          <th scope="row">代理机构 :</th>
          <td>{{ caseInfo.whdAgencyName }}</td>
        </tr>
        <tr>
          <th scope="row">他所代交 :</th>
          <td>{{ caseInfo.otherAgency == '1' ? "是" : "否" }}</td>
          <th scope="row">案件等级 :</th>
          <td>{{ caseInfo.caseLevelStr }}</td>
        </tr>
        <tr>
          <th scope="row">申请书标注 :</th>
          <td colspan="3">{{ caseInfo.applicationMarks }}</td>
        </tr>
        <tr>
          <th scope="row">案件备注 :</th>
          <td colspan="3">{{ caseInfo.remarks }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    caseInfo: {
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
