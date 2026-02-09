<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">案件详情</h4>

      <TMInfo :caseInfo="caseInfo"/>
    </div>
  </div>
</template>

<script>
import TMInfo from "./baseInfo/tmInfo";
export default {
  components: {
    TMInfo,
  },
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
    taskType: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  watch: {
    caseInfo: {
      handler(newVal) {
        console.log(newVal, 'caseInfo2222');
      },
      deep: true,
    },
  },
};
</script>

<style></style>
