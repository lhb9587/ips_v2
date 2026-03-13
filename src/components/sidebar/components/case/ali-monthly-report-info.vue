<template>
  <div
    v-if="showAliMonthlyReportInfo"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">阿里月报信息</h4>

      <div class="table-responsive">
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                品牌层级 :
              </th>
              <td style="width: 40%">{{ toDisplay(caseInfo.brandHierarchy) }}</td>
              <th
                scope="row"
                style="width: 10%"
              >
                风险类型 :
              </th>
              <td style="width: 40%">{{ toDisplay(caseInfo.riskType) }}</td>
            </tr>
            <tr>
              <th scope="row">风险等级 :</th>
              <td>{{ toDisplay(caseInfo.riskLevel) }}</td>
              <th scope="row">备注(关联案件说明) :</th>
              <td>{{ toDisplay(caseInfo.aliRemarks) }}</td>
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
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    showAliMonthlyReportInfo() {
      return !!this.caseInfo.custName && this.caseInfo.custName.includes("阿里");
    },
  },
  methods: {
    toDisplay(value) {
      return value || "-";
    },
  },
  created() {
    this.$addCopy();
  },
  beforeUnmount() {
    this.$destroyCopy();
  },
};
</script>

<style></style>

