<template>
  <div
    ref="chart"
    class="chart-container"
  ></div>
</template>

<script>
import { nextTick } from "vue";
import * as echarts from "echarts";
import { throttle } from "lodash";

export default {
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
    panelId: {
      type:Number
    }
  },
  data() {
    return {
      chart: null,
      chartSeries: [],
      resizeObserver: null,
    };
  },
  watch: {
    chartData: {
      handler() {
        this.$nextTick(() => {
          this.renderChart();
        });
      },
      deep: true,
    },
  },
  computed: {
    totalMap() {
      return this.calculateTotalByYear(this.chartData);
    },
  },

  methods: {
    calculateTotalByYear(dataArray) {
      let totalValues = {};
      dataArray.forEach((item) => {
        if (item.datas && item.datas.length > 0) {
          item.datas.forEach((dataPoint) => {
            if (!totalValues[dataPoint.name]) {
              totalValues[dataPoint.name] = 0;
            }
            totalValues[dataPoint.name] =
              Number(dataPoint.value.toFixed(0)) +
              Number(totalValues[dataPoint.name].toFixed(0));
          });
        }
      });
      return totalValues;
    },
    // 根据总数排序
    sortByTotal(xAxisData, formatData) {
      // 计算每个x轴类目的总和
      const totals = {};
      xAxisData.forEach(name => {
        totals[name] = formatData.reduce((sum, series) => {
          const value = series.data[xAxisData.indexOf(name)] || 0;
          return sum + value;
        }, 0);
      });
      
      // 根据总和排序x轴数据
      const sortedXAxis = [...xAxisData].sort((a, b) => totals[b] - totals[a]);
      
      // 重新排序每个系列的数据
      formatData.forEach(series => {
        const newData = sortedXAxis.map(name => {
          const originalIndex = xAxisData.indexOf(name);
          return series.data[originalIndex] || 0;
        });
        series.data = newData;
      });
      
      // 重新排序 totalMap 以匹配新的顺序
      const sortedTotalMap = {};
      sortedXAxis.forEach(name => {
        sortedTotalMap[name] = this.totalMap[name];
      });
      this.totalMap = sortedTotalMap;
      
      return { sortedXAxis, sortedData: formatData };
    },
    formatAmountValue(value) {
      if (value == null || value === "") return "";

      const absValue = Math.abs(value);
      const sign = value < 0 ? "-" : "";
      // 如果金额大于等于 1 千万，保留两位小数并附加 '亿'
      if (absValue >= 100000000) {
        return sign + Math.trunc(absValue / 1000000) / 100 + "亿+";
      }
      // 如果金额在 1 万到 1 千万之间，不保留小数并附加 '万'
      if (absValue >= 100000) {
        return sign + Math.trunc(absValue / 10000) + "万+";
      }
      // 显示原始值
      return sign + absValue;
    },
    renderChart() {
      // 如果已经存在图表实例，先销毁它
      if (this.chart) {
        this.chart.dispose();
      }
      
      // 确保 DOM 元素存在
      if (!this.$refs.chart) {
        return;
      }

      const myChart = echarts.init(this.$refs.chart);
      const xAxisData = [];
      const formatData = [];
      this.chartData.forEach((item) => {
        item.datas?.map((node) => {
          !xAxisData.includes(node.name) && xAxisData.push(node.name);
        });
        const list = [];
        xAxisData.forEach((name) => {
          list.push(
            item.datas.find((node) => node.name == name)
              ? item.datas.find((node) => node.name == name).value
              : 0
          );
        });
        formatData.push({
          name: item.legend,
          type: "bar",
          data: list,
        });
      });

      // 只在 panelId 为 304 时进行排序
      let sortedXAxis = xAxisData;
      let sortedData = formatData;
      if (this.panelId == 304) {
        const sortResult = this.sortByTotal(xAxisData, formatData);
        sortedXAxis = sortResult.sortedXAxis;
        sortedData = sortResult.sortedData;
      }
      
      const options = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.chartData?.map((data) => data?.legend),
          bottom: 0,
        },
        xAxis: {
          type: "category",
          data: sortedXAxis,
          axisLabel: {
            rotate: 45, // 将 X 轴标签旋转为 45 度角
          },
        },
        yAxis: {
          type: "value",
        },
        grid: {
          containLabel: true,
          top: 80,
          bottom: "5%",
        },
        color: [
          "#3e8df3",
          "#4a99f4",
          "#59a5f5",
          "#77b7f7",
          "#99caf8",
          "#a4d0f9",
        ],
        series: sortedData?.map((data, index) => ({
          name: data.name,
          type: "bar",
          data: data.data,
          stack: "total",
          label: {
            show: true,
            position: "top",
            formatter: (params) => {
              if (this.chartData.length - 1 == index) {
                return this.formatAmountValue(this.totalMap[params.name]);
              } else {
                return "";
              }
            },
          },
        })),
      };
      this.chart = myChart;
      myChart.setOption(options);
      myChart.off("click");
      myChart.on("click", (params) => {
        this.$emit("drillHandle", params);
      });
      myChart.resize({ width: "auto", height: "auto" });
    },
    handleResize() {
      if (!this.$refs.chart || !this.chart) {
        return;
      }
      this.chart.resize({ width: "auto", height: "auto" });
    },
    initResizeObserver() {
      // 创建 ResizeObserver 实例
      this.resizeObserver = new ResizeObserver(this.throttledResizeHandler);

      // 开始观察 chart-container 元素
      if (this.$refs.chart) {
        this.resizeObserver.observe(this.$refs.chart);
      }
    },
  },
  created() {
    // 创建节流函数
    this.throttledResizeHandler = throttle(this.handleResize, 200);
  },
  mounted() {
    nextTick(() => {
      this.renderChart();
      this.initResizeObserver();
    });
  },
  beforeUnmount() {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // 移除节流函数
    if (this.throttledResizeHandler) {
      this.throttledResizeHandler.cancel();
    }
    // 销毁图表实例
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  },
};
</script>

<style lang="scss">
.chart-container {
  min-height: 200px;
  min-width: 200px;
  width: 100%;
  height: 100%;
}
</style>
