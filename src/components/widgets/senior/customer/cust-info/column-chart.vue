<template>
  <div
    ref="chartDom"
    class="cust-info-chart"
  ></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, defineProps, watch } from "vue";
import * as echarts from "echarts";
import { throttle } from "lodash";

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  }
});

const chartDom = ref(null);
let myChart = null;
let resizeObserver = null;

// 处理窗口大小变化
const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

// 使用节流函数避免频繁调用
const throttledResize = throttle(handleResize, 200);

// 初始化图表
const initChart = () => {
  if (!chartDom.value) return;
  
  // 如果已经存在图表实例，先销毁
  if (myChart) {
    myChart.dispose();
  }
  
  // 初始化图表
  myChart = echarts.init(chartDom.value);
  
  // 处理数据
  const legends = props.chartData.map(item => item.legend);
  const xAxisData = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
  const series = props.chartData.map(item => ({
    name: item.legend,
    type: 'bar',
    barWidth: '8',
    barGap: '30%',
    data: Array.from({ length: 12 }, (_, i) => {
      const monthData = item.datas.find(d => d.name === String(i + 1));
      return monthData ? monthData.value : 0;
    }),
    itemStyle: {
      borderRadius: [8, 8, 0, 0]
    }
  }));

  // 设置不同的颜色
  if (series[0]) {
    series[0].itemStyle.color = '#d3d6e9';
  }
  if (series[1]) {
    series[1].itemStyle.color = '#4e7dee';
  }

  const option = {
    title: {
      text: '月度账单额',
      left: '15px',
      top: 10,
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    legend: {
      data: legends,
      right: 10,
      top: 10,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      },
      icon: 'circle'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach(item => {
          result += `${item.seriesName}: ${item.value.toLocaleString('zh-CN')}<br/>`;
        });
        return result;
      }
    },
    grid: {
      containLabel: true,
      top: '30px',
      bottom: '3%',
      left: '-40px',
      right: '15px'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#E0E0E0'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        interval: 0,
        rotate: 0,
        margin: 8
      }
    },
    yAxis: {
      type: "value",
      show: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: series.map(s => ({
      ...s,
      barGap: '30%',
      barCategoryGap: '40%'
    }))
  };

  // 设置选项并调整大小
  myChart.setOption(option);
  myChart.resize();
};

// 监听数据变化
watch(() => props.chartData, () => {
  nextTick(() => {
    initChart();
  });
}, { deep: true });

// 监控容器宽高变化并重新初始化图表
const setupResizeObserver = () => {
  if (!chartDom.value) return;
  
  // 创建并初始化ResizeObserver来监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    throttledResize();
  });
  resizeObserver.observe(chartDom.value);
};

// 当组件挂载完成后初始化图表
onMounted(() => {
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    initChart();
    setupResizeObserver();
    
    // 监听窗口大小变化
    window.addEventListener('resize', throttledResize);
  });
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', throttledResize);
  
  // 取消节流函数
  if (throttledResize && throttledResize.cancel) {
    throttledResize.cancel();
  }
  
  // 销毁图表实例
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
});
</script>

<style scoped>
.cust-info-chart {
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
</style>
