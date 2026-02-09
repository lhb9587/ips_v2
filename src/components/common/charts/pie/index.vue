<template>
  <div
    ref="chart"
    class="chart-container"
  ></div>
</template>

<script>
import { formatAmountValue } from "@/utils";
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
      pieRadius: "70%", // 默认
    };
  },
  computed: {
    chartsList() {
      let list = this.chartData[0]?.datas || [];
      list.sort((a, b) => b.value - a.value);
      return list;
    },
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

  methods: {
    formatAmountValue, // 格式化金额
    renderChart() {
      if (this.chart) {
        this.chart.dispose();
      }

      if (!this.$refs.chart) {
        return;
      }

      const myChart = echarts.init(this.$refs.chart);
      this.chart = myChart;
      // 动态设置半径和位置
      const width = this.$refs.chart.clientWidth;
      let pieRadius = "70%";
      let centerPosition = ["35%", "50%"];
      let legendOption = {
        orient: "vertical",
        right: "10",
        top: "40",
        type: "scroll",
        icon: "circle",
        formatter: function (name) {
          const data = options.series[0].data;
          let total = 0;
          const dataItem = data.find((item) => item.name === name);
          data.forEach(function (item) {
            total += item.value;
          });
          const percentage = ((dataItem.value / total) * 100).toFixed(2);
          const value = dataItem ? dataItem.value : 0; // 获取对应的值
          if (name && name.length > 9) {
            name = name.substring(0, 9) + "...";
          }
          const formatAmountValue = (value) => {
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
          };
          const formatValue = formatAmountValue(value);
          const arr = [
            `{name|${name}(${formatValue})}`,
            `{percent|${percentage}%}`,
          ];
          return arr.join("");
        },
        textStyle: {
          rich: {
            name: {
              width: 150,
              overflow: "ellipsis",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            },
            percent: {
              padding: [0, 0, 0, 15],
            },
          },
        },
      };
      if (400 < width && width < 580) {
        pieRadius = "60%";
        centerPosition = ["25%", "50%"];
      } else if (width < 400) {
        centerPosition = ["35%", "50%"];
        legendOption = {
          orient: "vertical",
          right: "10",
          top: "40",
          type: "scroll",
          icon: "circle",
          formatter: function (name) {
            const arr = [
              `{name|${name}}`,
            ];
            return arr.join("");
          },
          textStyle: {
            rich: {
              name: {
                  width: 100,
                },
              },
          },
        };
      }
      this.pieRadius = pieRadius;
      const options = {
        // tooltip: {
        //   trigger: "item",
        // },
        grid: {
          containLabel: true,
        },
        tooltip: {
          trigger: "item",
          formatter: "{b} : {c} ({d}%)",
        },
        legend: legendOption,
        color: [
          "#3e8df3",
          "#4493f3",
          "#4a99f4",
          "#519ff5",
          "#59a5f5",
          "#62abf6",
          "#6cb1f6",
          "#77b7f7",
          "#82bef8",
          "#8dc4f8",
          "#99caf8",
          "#99caf8",
          "#a4d0f9",
        ],
        series: [
          {
            type: "pie",
            label: {
              show: true,
              position: "inside",
              fontWeight: "bold",
              color: "white",
              formatter: function (params) {
                if (params.percent < 4) {
                  return "";
                } else {
                  return `${params.name} ${formatAmountValue(params.value)}`;
                }
              },
            },
            radius: this.pieRadius,
            center: centerPosition,
            data: this.chartsList,
            emphasis: {},
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
            },
          },
        ],
      };
      myChart.setOption(options);
      myChart.off("click");
      myChart.on("click", (params) => {
        this.$emit("drillHandle", params);
      });
      myChart.on("legendselectchanged", (params) => {
        const selected = params.selected;
        let legend = [];
        for (let name in selected) {
          legend.push({ name: name });
        }
        myChart.dispatchAction({
          type: "legendSelect",
          batch: legend,
        });
        this.$emit("drillHandle", params);
      });
      myChart.resize({ width: "auto", height: "auto" });
    },
    handleResize() {
      if (!this.$refs.chart || !this.chart) {
        return;
      }
      const width = this.$refs.chart.clientWidth;
      let pieRadius = "70%";
      let centerPosition = ["35%", "50%"];
      const data = [...this.chartsList];
      let legendOption = {
        orient: "vertical",
        right: "10",
        top: "40",
        type: "scroll",
        icon: "circle",
        formatter: function (name) {
          let total = 0;
          const dataItem = data.find((item) => item.name === name);
          data.forEach(function (item) {
            total += item.value;
          });
          const percentage = ((dataItem.value / total) * 100).toFixed(2);
          const value = dataItem ? dataItem.value : 0; // 获取对应的值
          if (name && name.length > 9) {
            name = name.substring(0, 9) + "...";
          }
          const formatAmountValue = (value) => {
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
          };
          const formatValue = formatAmountValue(value);
          const arr = [
            `{name|${name}(${formatValue})}`,
            `{percent|${percentage}%}`,
          ];
          return arr.join("");
        },
        textStyle: {
          rich: {
            name: {
              width: 150,
              overflow: "ellipsis",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            },
            percent: {
              padding: [0, 0, 0, 15],
            },
          },
        },
      };
      if (400 < width && width < 580) {
        pieRadius = "60%";
        centerPosition = ["25%", "50%"];
      } else if (width < 400) {
        pieRadius = "60%";
        centerPosition = ["35%", "50%"];
        legendOption = {
          orient: "vertical",
          right: "10",
          top: "40",
          type: "scroll",
          icon: "circle",
          formatter: function (name) {
            const arr = [`{name|${name}}`];
            return arr.join("");
          },
          textStyle: {
            rich: {
              name: {
                width: 100,
                overflow: "ellipsis",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              },
            },
          },
        };
      }
      this.pieRadius = pieRadius;
      this.chart.setOption({
        series: [{ radius: pieRadius, center: centerPosition }],
        legend: legendOption,
      });
      this.chart.resize();
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
    this.throttledResizeHandler = throttle(this.handleResize, 200); // 设置节流时间间隔为200ms
  },
  mounted() {
    nextTick(() => {
      this.renderChart();
      this.initResizeObserver();
    });
    // window.addEventListener("resize", this.throttledResizeHandler);
  },
  beforeUnmount() {
    // window.removeEventListener("resize", this.throttledResizeHandler);
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

<style scoped>
.chart-container {
  min-height: 200px;
  min-width: 200px;
  width: 100%;
  height: 100%;
}
</style>
