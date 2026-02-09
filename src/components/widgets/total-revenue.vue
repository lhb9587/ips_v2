<script>
import SeniorStat from "@/components/widgets/senior-stat.vue";
import { getChartData } from "@/api/dashboard";
import { workbenchComputed } from "@/state/helpers";

export default {
  name: "TotalRevenue",
  components: {
    SeniorStat,
  },
  data() {
    return {
      cardData: [],
    };
  },
  computed: {
    ...workbenchComputed,
  },
  watch: {
    toExamineValue() {
      this.fetchData();
    },
    statusValue() {
      this.fetchData();
    },
  },
  methods: {
    fetchData() {
      getChartData({
        panelId: 4037,
        isSeniorPanel: 1,
        financeAudit: this.toExamineValue,
        adjustStatus: this.statusValue,
      }).then((res) => {
        this.cardData = res.data?.chartDatas?.numberOfDetail?.income || {};
      });
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
<template>
  <SeniorStat
    icon="icon iconfont icon-shouru"
    icon-color="#f1a246"
    title="本年总收入"
    :defaultPanelId="4027"
    :cardData="cardData"
  />
</template>
<style></style>
