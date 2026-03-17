<template>
  <div
    v-if="showTrademarkApplicationInfo"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">商标申请说明</h4>

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
                优先权国家 :
              </th>
              <td style="width: 40%">{{ caseInfo.priorityBaseCrty }}</td>
              <th
                scope="row"
                style="width: 10%"
              >
                优先权日期 :
              </th>
              <td style="width: 40%">{{ caseInfo.priorityAppDate }}</td>
            </tr>
            <tr>
              <th scope="row">优先权类别 :</th>
              <td colspan="3">{{ caseInfo.priorityClasses }}</td>
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
    showTrademarkApplicationInfo() {
      return (
        !this.caseInfo.usAgency &&
        this.caseInfo.caseType === "马德里商标转国内注册"
      );
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
