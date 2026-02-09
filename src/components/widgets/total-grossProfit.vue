<script>
import SeniorStat from "@/components/widgets/senior-stat";
import { getChartData } from "@/api/dashboard";
import { workbenchComputed } from "@/state/helpers";

export default {
  name: "totalGrossProfit",
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
        panelId: 4040,
        isSeniorPanel: 1,
        financeAudit: this.toExamineValue,
        adjustStatus: this.statusValue,
      }).then(( res ) => {
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
    icon="icon iconfont icon-yuetixian"
    icon-color="#e3736f"
    title="本年毛利润"
    :cardData="cardData"
    :defaultPanelId="4070"
  />
</template>
