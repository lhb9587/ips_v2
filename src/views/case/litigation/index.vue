<script setup>
import CaseList from "@/components/case/caseList/index.vue";
</script>
<template>
  <CaseList
    :bussId="11"
    :business="11"
    :taskType="2"
    gridName="litigationListGrid"
    caseName="诉讼案件"
  />
</template>
