<script>
import SeniorStat from "@/components/widgets/senior-stat.vue";
import { getChartData } from "@/api/dashboard";
import { workbenchComputed } from "@/state/helpers";

export default {
  name: "totalProfit",
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
        panelId: 4039,
        isSeniorPanel: 1,
        financeAudit: this.toExamineValue,
        adjustStatus: this.statusValue,
      }).then((res) => {
        this.cardData = res.data?.chartDatas?.numberOfDetail?.profit || {};

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
    icon="icon iconfont icon-shouruguanli"
    icon-color="#66a3eb"
    title="本年净利润"
    :cardData="cardData"
    :defaultPanelId="4069"
  />
</template>
