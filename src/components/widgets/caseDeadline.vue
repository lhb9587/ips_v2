<script>
import Stat from "@/components/widgets/stat.vue";
export default {
  name: "caseDeadline",
  props: {
    cardDesc: {
      type: String,
      default: "",
    },
  },
  components: {
    Stat,
  },
};
</script>
<template>
  <Stat
    icon="bx bx-alarm"
    title="案件时限"
    value="0"
    :showDetail="true"
    :helpText="cardDesc"
  />
</template>
