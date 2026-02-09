<template>
  <div
    ref="chartDom"
    style="width: 100%; height: 100%"
    v-if="chartData.length"
  ></div>
  <el-empty
    description="暂无数据"
    :image-size="40"
    style="padding: 20px 0"
    v-else
  />
</template>

<script setup>
import * as echarts from "echarts";
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  defineProps,
  computed,
} from "vue";
import { throttle } from "lodash";

const props = defineProps({
  custData: {
    type: Object,
    default: () => {},
  },
});
const chartData = computed(() => {
  if (!props.custData) return [];
  return props.custData?.performanceData;
});

const chartDom = ref(null);
let chart = null;
let resizeObserver = null;

// 格式化显示函数
const formatValue = (value) => {
  if (value == null || value === "") return "";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 100000000) {
    return sign + Math.trunc(absValue / 1000000) / 100 + "亿+";
  }
  if (absValue >= 10000) {
    return sign + Math.trunc(absValue / 10000) + "万+";
  }
  return sign + absValue;
};

// 渲染图表
const renderChart = () => {
  if (!chartDom.value) return;
  if (!chartData.value.length) return;

  // 如果已有图表实例，先销毁
  if (chart) {
    chart.dispose();
  }

  chart = echarts.init(chartDom.value);

  const option = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: chartData.value.map((item) => item.name),
      axisLabel: {
        color: "#6e757c",
        fontSize: 10,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "#e5e5e5",
        },
      },
    },
    yAxis: {
      type: "value",
      show: false, // 隐藏纵轴
    },
    grid: {
      containLabel: true,
      top: 30,
      bottom: "10%",
      left: -50,
      right: "3%",
    },
    color: ["#77c195"],
    series: [
      {
        data: chartData.value.map((item) => item.value),
        type: "line",
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: "#77c195",
        },
        itemStyle: {
          color: "#77c195",
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) => formatValue(params.value),
          textStyle: {
            fontWeight: "bold",
            fontSize: 12,
          },
        },
      },
    ],
  };

  chart.setOption(option);
  setTimeout(() => {
    chart.resize();
  }, 0);
};

// 处理大小变化
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

// 使用throttle防止过于频繁的调整
const throttledResizeHandler = throttle(handleResize, 200);

// 初始化ResizeObserver
const initResizeObserver = () => {
  // 创建ResizeObserver实例
  resizeObserver = new ResizeObserver(throttledResizeHandler);

  // 开始观察容器元素
  if (chartDom.value) {
    resizeObserver.observe(chartDom.value);
  }
};

// 监听属性变化
watch(
  () => chartData,
  () => {
    renderChart();
  },
  { deep: true }
);

onMounted(() => {
  renderChart();
  initResizeObserver();
});

onBeforeUnmount(() => {
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  // 取消节流函数
  if (throttledResizeHandler && throttledResizeHandler.cancel) {
    throttledResizeHandler.cancel();
  }

  // 销毁图表实例
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style lang="scss" scoped></style>
