<script setup>
import CaseList from "@/components/case/caseList/index.vue";
</script>
<template>
  <CaseList
    :bussId="29"
    :business="5"
    :taskType="5"
    gridName="domainNameListGrid"
    caseName="域名案件"
  />
</template>
