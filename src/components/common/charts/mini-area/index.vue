<script>
const currentMonth = new Date().getMonth();
export default {
  name: "MiniArea",
  props: {
    // realData: {
    //   type: Array,
    //   default: () => [100, 200, 300, 800, 500, null, null, null, null, null]
    // },
    // forecastData: {
    //   type: Array,
    //   default: () => [null, null, null, null, 500, 600, 700, 400, 900, 1000]
    // },
    chartData: {
      type: Array,
      default: () => [],
    },
    color: {
      type: String,
      default: "#556ee6",
    },
  },
  data() {
    return {
      series: [
        {
          name: "真实数据",
          data: this.chartData,
        },
      ],
      chartOptions: {
        chart: {
          sparkline: {
            enabled: true,
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
          width: 2,
          dashArray: [0, currentMonth + 1], // 设置虚线样式
        },
        colors: [this.color],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [20, 100, 100, 100],
          },
        },
        tooltip: {
          trigger: "axis",

          custom: ({ series, dataPointIndex}) => {
            // 自定义 tooltip 内容
            return `<div style="z-index: 9999;padding:10px"><div>${
              series[0][dataPointIndex] && series[0][dataPointIndex] != 0
                ? "真实数据"
                : "预测数据"
            }</div><div><span>${dataPointIndex+1}月：</span>${
              series[0][dataPointIndex] && series[0][dataPointIndex] != 0
                ? this.formatAmountValue(series[0][dataPointIndex]) || 0
                : this.formatAmountValue(series[1][dataPointIndex]) || 0
            }</div></div>`;
          },
        },
        grid: {
          show: false,
        },
        xaxis: {
          labels: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
      },
    };
  },
  conputed: {},

  watch: {
    chartData: {
      handler(newVal) {
        let resultData = [];
        const realNullArray = Array(12 - currentMonth).fill(null);
        const realList = currentMonth ? newVal?.slice(0, currentMonth) : [];
        const realData = realList.concat(realNullArray);

        const forecastNullArray = currentMonth
          ? Array(currentMonth - 1).fill(null)
          : [];
        const forecastList = currentMonth
          ? newVal?.slice(currentMonth - 1, 12)
          : newVal;
        const forecastData = forecastNullArray.concat(forecastList);

        resultData = [
          {
            name: "真实数据",
            data: realData,
          },
          {
            name: "预测数据",
            data: forecastData,
          },
        ];
        this.series = resultData;
      },
      deep: true,
    },
    color: {
      handler(newVal) {
        this.chartOptions.colors = [newVal];
      },
    },
  },
  methods:{
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
  },
  created() {
    let resultData = [];
    const realNullArray = Array(12 - currentMonth).fill(null);
    const realList = currentMonth ? this.chartData?.slice(0, currentMonth) : [];
    const realData = realList.concat(realNullArray);

    const forecastNullArray = currentMonth
      ? Array(currentMonth - 1).fill(null)
      : [];
    const forecastList = currentMonth
      ? this.chartData?.slice(currentMonth - 1, 12)
      : this.chartData;
    const forecastData = forecastNullArray.concat(forecastList);
    resultData = [
      {
        name: "真实数据",
        data: realData,
      },
      {
        name: "预测数据",
        data: forecastData,
      },
    ];
    this.series = resultData;
  },
};
</script>

<template>
  <apexchart
    class="apex-charts"
    type="area"
    height="60"
    :series="series"
    :options="chartOptions"
  ></apexchart>
</template>

<style scoped>
.apex-charts {
  min-height: 60px;
}
</style>
