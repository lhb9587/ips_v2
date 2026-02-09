<script setup>
import CaseList from "@/components/case/caseList/index.vue";
</script>
<template>
  <CaseList
    :bussId="3"
    :business="3"
    :taskType="4"
    gridName="patentListGrid"
    caseName="专利案件"
  />
</template>
