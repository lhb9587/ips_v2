<script>
import SeniorStat from "@/components/widgets/senior-stat.vue";
import { getChartData } from "@/api/dashboard";
import { workbenchComputed } from "@/state/helpers";

export default {
  name: "totalFee",
  components: {
    SeniorStat,
  },
  data() {
    return {
      cardData: {},
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
        panelId: 4038,
        isSeniorPanel: 1,
        financeAudit: this.toExamineValue,
        adjustStatus: this.statusValue,
      }).then((res) => {
        this.cardData = res.data?.chartDatas?.numberOfDetail?.expense || {};
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
    icon="icon iconfont icon-zhichu"
    icon-color="#5a6dde"
    title="本年总费用"
    :defaultPanelId="4014"
    :cardData="cardData"
  />
</template>
