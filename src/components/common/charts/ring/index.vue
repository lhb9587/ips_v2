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
    centerFontSize: {
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      chart: null,
      chartSeries: [],
      resizeObserver: null,
      pieRadius: ["40%", "70%"], // 默认
    };
  },
  computed: {
    chartsList() {
      let list = this.chartData[0]?.datas || [];
      // 检查是否存在负数
      const hasNegative = list.some((item) => item.value < 0);
      if (hasNegative) {
        // 如果存在负数，将所有数值取绝对值
        list = list.map((item) => ({
          ...item,
          value: Math.abs(item.value),
          originalValue: item.value, // 保存原始值用于显示
        }));
      }
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
      this.chart = myChart;

      const width = this.$refs.chart.clientWidth;
      let pieRadius = ["40%", "70%"];
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
          // 使用原始值（如果存在）或当前值
          const value = dataItem
            ? dataItem.originalValue !== undefined
              ? dataItem.originalValue
              : dataItem.value
            : 0;

          if (name && name.length > 8) {
            name = name.substring(0, 8) + "...";
          }

          const formatAmountValue = (value) => {
            if (value == null || value === "") return "";

            const absValue = Math.abs(value);
            const sign = value < 0 ? "-" : "";
            if (absValue >= 100000000) {
              return sign + Math.trunc(absValue / 1000000) / 100 + "亿+";
            }
            if (absValue >= 100000) {
              return sign + Math.trunc(absValue / 10000) + "万+";
            }
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
        pieRadius = ["35%", "60%"];
        centerPosition = ["25%", "50%"];
      } else if (width < 400) {
        pieRadius = ["35%", "60%"];
        centerPosition = ["35%", "50%"];
        legendOption = {
          orient: "vertical",
          right: "10",
          top: "40",
          type: "scroll",
          icon: "circle",
          formatter: function (name) {
            let formatName = name
            if (name && name.length > 8) {
              formatName = name.substring(0, 8) + "...";
            }
            return formatName
          },
          textStyle: {
            rich: {
              p: {
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

      const options = {
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            const percent = params.percent + "%";
            return params.name + ": " + params.value + " (" + percent + ")";
          },
        },
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
        legend: legendOption,
        grid: {
          containLabel: true,
        },
        series: [
          {
            type: "pie",
            radius: this.pieRadius,
            center: centerPosition,
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              position: "inside",
              fontWeight: "bold",
              color: "#fff",
              formatter: function (params) {
                if (params.percent < 4) {
                  return "";
                } else {
                  return params.name;
                }
              },
            },
            emphasis: {
              label: {
                show: true,
                fontSize: this.centerFontSize,
                fontWeight: "bold",
              },
            },
            data: this.chartsList,
          },
          {
            type: "pie",
            radius: this.pieRadius,
            center: centerPosition,
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: this.centerFontSize,
                fontWeight: "bold",
                formatter: "{b}\n{c}",
                textStyle: {
                  lineHeight: this.centerFontSize + 8,
                },
              },
            },
            data: this.chartsList,
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
      let pieRadius = ["40%", "70%"];
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
          // 使用原始值（如果存在）或当前值
          const value = dataItem
            ? dataItem.originalValue !== undefined
              ? dataItem.originalValue
              : dataItem.value
            : 0;

          if (name && name.length > 8) {
            name = name.substring(0, 8) + "...";
          }

          const formatAmountValue = (value) => {
            if (value == null || value === "") return "";

            const absValue = Math.abs(value);
            const sign = value < 0 ? "-" : "";
            if (absValue >= 100000000) {
              return sign + Math.trunc(absValue / 1000000) / 100 + "亿+";
            }
            if (absValue >= 100000) {
              return sign + Math.trunc(absValue / 10000) + "万+";
            }
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
        pieRadius = ["35%", "60%"];
        centerPosition = ["25%", "50%"];
      } else if (width < 400) {
        pieRadius = ["35%", "60%"];
        centerPosition = ["35%", "50%"];
        legendOption = {
          orient: "vertical",
          right: "0",
          top: "40",
          type: "scroll",
          icon: "circle",
          formatter: function (name) {
            let formatName = name
            if (name && name.length > 8) {
              formatName = name.substring(0, 8) + "...";
            }
            return formatName
          },
          textStyle: {
            rich: {
              p: {
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
        series: [
          { radius: pieRadius, center: centerPosition },
          { radius: pieRadius, center: centerPosition },
        ],
        legend: legendOption,
      });
      this.chart.resize();
    },
    initResizeObserver() {
      this.resizeObserver = new ResizeObserver(this.throttledResizeHandler);
      if (this.$refs.chart) {
        this.resizeObserver.observe(this.$refs.chart);
      }
    },
  },
  created() {
    this.throttledResizeHandler = throttle(this.handleResize, 100); // 设置节流时间间隔为200ms
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

<style scoped>
.chart-container {
  min-height: 200px;
  min-width: 200px;
  width: 100%;
  height: 100%;
}
</style>
