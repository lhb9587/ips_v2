<template>
  <div class="radar-card">
    <div v-if="!hideHeader" class="radar-header">
      <div>
        <div class="radar-title">{{ title }}</div>
        <div class="radar-subtitle">{{ subtitle }}</div>
      </div>
      <span class="radar-badge">对比视图</span>
    </div>
    <div ref="chartRef" class="radar-body"></div>
  </div>
</template>

<script setup>
/* global defineProps */
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  title: { type: String, default: "综合能力雷达图" },
  subtitle: { type: String, default: "支持 3-5 位合伙人对比" },
  hideHeader: { type: Boolean, default: false },
  indicators: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
});

const chartRef = ref(null);
const chart = ref(null);
const legendSelected = ref({});

const buildLegendSelectedMap = (series, baseSelected = {}) => {
  const map = { ...baseSelected };
  series.forEach((item) => {
    const name = item?.name;
    if (!name) return;
    if (!(name in map)) {
      map[name] = true;
    }
  });
  return map;
};

const getCurrentLegendSelected = () => {
  if (chart.value) {
    const option = chart.value.getOption();
    const selected = option?.legend?.[0]?.selected;
    if (selected && Object.keys(selected).length > 0) {
      return selected;
    }
  }
  return legendSelected.value;
};

// 格式化金额显示（万/亿）
const formatAmount = (value) => {
  if (value === null || value === undefined) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  } else if (num >= 1000) {
    return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  } else {
    return num.toFixed(2);
  }
};

// 计算每个指标的最大值（基于当前显示的数据）
const calculateIndicatorMax = () => {
  if (!props.series || props.series.length === 0 || !props.indicators || props.indicators.length === 0) {
    // 如果没有数据，返回默认值
    return props.indicators.map(() => 100);
  }
  
  // 计算每个指标在所有 series 中的最大值和最小值（考虑负数）
  const maxValues = props.indicators.map((_, index) => {
    let max = 0;
    let min = 0;
    
    props.series.forEach((item) => {
      const values = item.value || [];
      if (Array.isArray(values) && values[index] !== undefined) {
        const val = Number(values[index]) || 0;
        max = Math.max(max, val);
        min = Math.min(min, val);
      }
    });
    
    // 计算实际需要的范围（考虑负数）
    const range = Math.max(Math.abs(max), Math.abs(min));
    
    // 如果范围为0，返回默认值100
    if (range === 0) {
      return 100;
    }
    
    // 根据范围大小，选择合适的步长和上限
    let step, upperBound;
    if (range < 5) {
      step = 1;
      upperBound = Math.ceil(range * 1.3); // 留30%余量
    } else if (range < 10) {
      step = 2;
      upperBound = Math.ceil(range / 2) * 2 * 1.3;
    } else if (range < 30) {
      step = 5;
      upperBound = Math.ceil(range / 5) * 5 * 1.3;
    } else if (range < 100) {
      step = 10;
      upperBound = Math.ceil(range / 10) * 10 * 1.3;
    } else {
      step = Math.ceil(range / 10);
      upperBound = Math.ceil(range / step) * step * 1.2;
    }
    
    // 确保至少是最大值的1.2倍，并且向上取整到合适的值
    return Math.max(upperBound, range * 1.2);
  });
  
  return maxValues;
};


const renderChart = async () => {
  if (!chart.value) return;
  
  // 计算动态最大值
  const indicatorMaxValues = calculateIndicatorMax();
  const currentSelected = buildLegendSelectedMap(props.series, getCurrentLegendSelected());
  const colorPalette = [
    "#2f6bff",
    "#34c38f",
    "#f7b84b",
    "#f06595",
    "#6c7cff",
    "#ff7a5c",
    "#8b9db8",
    "#ff6b9d",
    "#4ecdc4",
    "#95e1d3",
    "#f38181",
    "#aa96da",
    "#fcbad3",
    "#a8e6cf",
    "#ffd3a5",
    "#fd79a8",
    "#00d2ff",
    "#3a7bd5",
  ];
  const seriesData = props.series.map((item, index) => {
    const color = colorPalette[index % colorPalette.length];
    return {
    name: item?.name,
    type: "radar",
    data: [
      {
        name: item?.name,
        value: item?.value || [],
      },
    ],
    symbol: "circle",
    symbolSize: 4,
    areaStyle: { opacity: 0.15, color },
    lineStyle: { width: 2, color },
    itemStyle: { color },
  };
  });
  
  // 检测图例是否会显示两行（使用更简单的估算方法）
  const containerWidth = chartRef.value?.clientWidth || 0;
  const estimatedItemWidth = 90; // 每个图例项估算宽度（图标+文字+间距）
  const itemsPerLine = containerWidth > 0 ? Math.floor((containerWidth - 40) / estimatedItemWidth) : 6;
  const useScroll = props.series.length > itemsPerLine;
  
  const option = {
    tooltip: {
      appendToBody: true,
      confine: true,
      extraCssText: "z-index: 4000;",
      formatter: (params) => {
        if (!params || !params.data) return '';
        const { name, value } = params.data;
        const indicators = props.indicators || [];
        // 需要格式化为金额的指标名称
        const amountIndicators = ['客户开发人', '客户协调人', '客户负责人', '客户组', '承办组'];
        let html = `<div style="font-weight: 600; margin-bottom: 8px;">${name}</div>`;
        if (Array.isArray(value)) {
          value.forEach((val, index) => {
            const indicatorName = indicators[index] || `指标${index + 1}`;
            let displayVal;
            if (amountIndicators.includes(indicatorName)) {
              displayVal = `¥${formatAmount(val)}`;
            } else if (indicatorName === '客户参与人') {
              displayVal = `${val}次`;
            } else {
              displayVal = val;
            }
            html += `<div style="display: flex; justify-content: space-between; gap: 16px; padding: 2px 0;">
              <span style="color: #5f6f86;">${indicatorName}</span>
              <span style="font-weight: 600; color: #1d2a3a;">${displayVal}</span>
            </div>`;
          });
        }
        return html;
      },
    },
    radar: {
      radius: "62%",
      splitNumber: 4,
      axisName: { color: "#415067", fontSize: 12 },
      splitLine: { lineStyle: { color: ["#dfe6f2"] } },
      splitArea: { areaStyle: { color: ["#f6f8fc", "#ffffff"] } },
      indicator: props.indicators.map((name, index) => ({
        name,
        max: indicatorMaxValues[index] || 100,
      })),
    },
    legend: {
      data: props.series.map((item) => item.name),
      bottom: 0,
      textStyle: { color: "#5f6f86" },
      selected: currentSelected,
      // 如果会显示两行，使用滚动类型
      type: useScroll ? 'scroll' : 'plain',
      itemGap: 12,
      itemWidth: 12,
      itemHeight: 12,
    },
    series: seriesData,
    // 扩展的颜色方案，支持至少15种颜色，避免重复
    color: colorPalette,
  };
  chart.value.setOption(option, true);
};

const initChart = () => {
  if (!chartRef.value) return;
  chart.value = echarts.init(chartRef.value);
  chart.value.on("legendselectchanged", (params) => {
    if (params?.selected) {
      legendSelected.value = { ...params.selected };
      renderChart();
    }
  });
  renderChart();
};

const resizeChart = () => {
  if (chart.value) {
    chart.value.resize();
  }
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  if (chart.value) {
    chart.value.dispose();
  }
});

watch(
  () => [props.series, props.indicators],
  () => {
    legendSelected.value = buildLegendSelectedMap(props.series, legendSelected.value);
    renderChart();
  },
  { deep: true }
);
</script>
