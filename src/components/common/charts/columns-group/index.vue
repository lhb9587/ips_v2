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
    hasYearCompare: {
      type: Boolean,
      default: false,
    },
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
    showPercentChange() {
      return this.hasYearCompare;
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
    formatThousand(value) {
      if (value == null || value === "") return "-";
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    renderChart() {
      // 确保在渲染之前销毁现有的图表实例
      if (this.chart) {
        this.chart.dispose();
        this.chart = null; // 释放引用
      }
      
      if (!this.$refs.chart) {
        return;
      }

      const myChart = echarts.init(this.$refs.chart);
      // 1. 获取所有name（账单收入、费用支出、结余）
      const xAxisData = [];
      this.chartData.forEach((item) => {
        item.datas?.forEach((node) => {
          if (!xAxisData.includes(node.name)) xAxisData.push(node.name);
        });
      });
      // 2. 获取所有年份（legend）
      const legendData = this.chartData.map(item => item.legend);
      // 3. 生成series，每个年份一组
      const series = legendData.map((year) => {
        // 以x轴顺序补全数据
        const data = xAxisData.map(name => {
          const yearObj = this.chartData.find(item => item.legend == year);
          const found = yearObj?.datas.find(node => node.name == name);
          return found ? found.value : null;
        });
        return {
          name: year,
          type: 'bar',
          data,
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              return this.formatAmountValue(params.value);
            },
          },
        };
      });
      // 4. tooltip优化
      const options = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let result = params[0].axisValueLabel + '<br/>';
            params.forEach((item) => {
              let diffStr = '';
              if (this.showPercentChange && item.seriesIndex > 0) {
                // 找到上一年同name的值
                const prev = params[item.seriesIndex - 1].data;
                if (prev !== null && prev !== 0 && item.data !== null && item.data !== 0) {
                  const percent = ((item.data - prev) / Math.abs(prev)) * 100;
                  const sign = percent > 0 ? '+' : '';
                  diffStr = `（${sign}${percent.toFixed(2)}%）`;
                }
              }
              // 数值加粗并加千分位
              const valueStr = `<b style='color:#333'>${item.data == null ? '-' : this.formatThousand(item.data)}</b>`;
              result += `${item.marker}${item.seriesName}：${valueStr}${diffStr}<br/>`;
            });
            return result;
          },
        },
        legend: {
          data: legendData,
          bottom: 0,
        },
        xAxis: {
          type: "category",
          data: xAxisData,
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
        series,
      };
      this.chart = myChart; // 重新赋值
      myChart.setOption(options);
      myChart.off("click");
      myChart.on("click", (params) => {
        this.$emit("drillHandle", params);
      });
      myChart.resize({ width: "auto", height: "auto" });
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize({ width: "auto", height: "auto" });
      }
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
    // 确保在组件销毁前清理所有实例
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.throttledResizeHandler) {
      this.throttledResizeHandler.cancel();
    }
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
