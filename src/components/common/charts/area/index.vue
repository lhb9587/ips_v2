<template>
  <div
    ref="chart"
    class="area-container"
  ></div>
</template>

<script>
import { nextTick } from "vue";
import * as echarts from "echarts";

export default {
  name: "Area",
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart: null,
      chartSeries: [],
      resizeObserver: null,
    };
  },
  methods: {
    renderChart() {
      if (this.chart) {
        this.chart.dispose();
      }

      if (!this.$refs.chart) {
        return;
      }

      const myChart = echarts.init(this.$refs.chart);
      this.chart = myChart;

      const options = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none",
          },
          formatter: (params) => {
            const data = params[0].data;
            if (data === null) {
              return '';
            }
            return `${params[0].name}: ${data}`;
          },
        },
        grid: {
          left: "0%",
          right: "0%",
          bottom: "0%",
          top: "0%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          show: false,
        },
        yAxis: {
          type: "value",
          show: false,
        },
        series: [
          {
            name: "数据",
            type: "line",
            stack: "总量",
            smooth: true,
            symbol: "none",
            areaStyle: {
              normal: {
                color: "rgba(128, 128, 255, 0.2)",
              },
            },
            emphasis: {
              focus: "series",
            },
            data: [120, 132, null, 134, 90, 230, 210],
          },
        ],
      };

      myChart.setOption(options);
      myChart.resize({ width: "auto", height: "auto" });
    },
  },
  mounted() {
    nextTick(() => {
      this.renderChart();
    });
  },
};
</script>
<style scoped>
.area-container {
  min-height: 100px;
  min-width: 100px;
  width: 100%;
  height: 100%;
}
</style>
