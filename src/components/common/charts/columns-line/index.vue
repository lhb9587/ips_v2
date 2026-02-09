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
        this.renderChart();
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
      const myChart = echarts.init(this.$refs.chart);
      const xAxisData = [];
      this.chartData.forEach((item) => {
        item.datas?.map((node) => {
          !xAxisData.includes(node.name) && xAxisData.push(node.name);
        });
      });
      const options = {
        tooltip: {
          trigger: "axis",
        //   axisPointer: {
        //     type: 'cross'
        //   }
        },
        legend: false,
        xAxis: {
          type: "category",
          data: xAxisData,
          axisLabel: {
            rotate: 45, // 将 X 轴标签旋转为 45 度角
          },
        },
        yAxis: [
          {
            type: "value",
            position: 'left',
            axisLabel: {
              formatter: (value) => {
                return this.formatAmountValue(value);
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#E4E7ED'
              }
            },
            alignTicks: true,
          },
          {
            type: "value",
            position: 'right',
            interval: 25,
            axisLabel: {
              formatter: '{value} %'
            },
            splitLine: {
              show: false  // 隐藏右侧y轴的分割线，只保留左侧的分割线
            },
            alignTicks: true,
            minInterval: 25,
            axisTick: {
              interval: 25
            },
            min: function(value) {
              // 如果最小值大于0，则从0开始
              if (value.min > 0) {
                return 0;
              }
              // 否则保持原来的逻辑，确保是25的倍数
              return Math.floor(value.min / 25) * 25;
            },
            max: function(value) {
              return Math.ceil(value.max / 25) * 25;
            }
          }
        ],
        grid: {
          containLabel: true,
          top: 80,
          bottom: "5%",
        },
        color: [
          "#3e8df3", // 柱状图颜色
          "#a4d0f9"  // 折线图颜色
        ],
        series: this.chartData?.map((data, index) => ({
          name: data.legend,
          type: index === 0 ? "bar" : "line",
          yAxisIndex: index, // 柱状图使用左侧y轴，折线图使用右侧y轴
          data: data.datas?.map((item) => item.value),
          label: {
            show: true,
            position: "top",
            formatter: (params) => {
              return index === 0 ? 
                this.formatAmountValue(params.value) : 
                params.value + '%';
            },
          },
          // 为折线图添加特殊配置
          ...(index === 1 ? {
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: "#a4d0f9" // 确保线的颜色与点的颜色一致
            },
            itemStyle: {
              color: "#a4d0f9" // 确保数据点的颜色一致
            }
          } : {})
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

