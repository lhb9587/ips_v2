<script setup>
import CaseList from "@/components/case/caseList/index.vue";
</script>
<template>
  <CaseList
    :bussId="23"
    :business="23"
    :taskType="3"
    gridName="protectionListGrid"
    caseName="保护案件"
  />
</template>
