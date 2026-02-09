<template>
  <div class="world-map-container">
    <!-- 地图容器 -->
    <div
      ref="mapContainer"
      class="map-canvas"
    ></div>
    <!-- <div class="map-header mb-2">
      <div style="font-size: 24px; font-weight: 700">全球销售地图</div>
      <div>查看全球客户分布和销售数据</div>
    </div> -->

    <!-- 时间范围选择 -->
    <div class="time-filter">
      <select
        v-model="timeDimension"
        @change="handleTimeChange"
        class="time-selector"
      >
        <option value="近30天">近30天</option>
        <option value="近90天">近90天</option>
        <option value="近半年">近半年</option>
        <option value="近一年">近一年</option>
        <option value="去年">去年</option>
        <option value="本年">本年</option>
        <option value="自定义">自定义</option>
      </select>
      <el-date-picker
        v-if="timeDimension === '自定义'"
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        style="width: 240px; margin-left: 8px"
        value-format="YYYY-MM-DD"
        popper-class="time-filter-dropdown"
        placement="bottom-start"
        :teleported="false"
        @change="handleDateRangeChange"
      />
    </div>

    <!-- 缩放控制 -->
    <div class="zoom-controls">
      <button
        @click="resetSelection"
        class="control-btn"
        title="重置选择"
      >
        <i class="bx bx-sync font-size-18"></i>
      </button>
      <button
        @click="zoomIn"
        class="control-btn"
        title="放大"
      >
        <i class="bx bx-plus"></i>
      </button>
      <button
        @click="zoomOut"
        class="control-btn"
        title="缩小"
      >
        <i class="bx bx-minus"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  defineEmits,
  defineExpose,
} from "vue";
import * as echarts from "echarts";
import worldJson from "@/assets/map/world.json"; // 确保路径正确
import { throttle } from "lodash";
import { mapZHName } from "@/assets/map/mapZHName.js";
import { queryCustomerMap } from "@/api/dashboard";

const emit = defineEmits(["country-selected", "data-updated"]);

// 引用和状态
const mapContainer = ref(null);
let chart = null;
const zoomLevel = ref(1.5);
const timeDimension = ref("近90天");
const dateRange = ref(null);
const mapData = ref([]);
const selectedCountry = ref(null);
const selectedCountryEnName = ref(null);
const isMapLoaded = ref(false);
let resizeObserver = null;

// 格式化账单金额
const formatAccountBill = (amount) => {
  if (!amount) return "¥0";
  return `¥${amount.toLocaleString()}`;
};

// 国家名称映射表，将中文名映射到地图JSON中的英文名
// const countryNameMap = mapZHName

// 处理时间范围变化
const handleTimeChange = (value) => {
  if (value !== "自定义") {
    dateRange.value = null;
  }
  updateMap();
};

// 处理日期范围变化
const handleDateRangeChange = () => {
  if (dateRange.value) {
    updateMap();
  }
};

// 修改 fetchMapData 方法以支持自定义日期范围
const fetchMapData = async () => {
  try {
    const params = {
      timeDimension:
        timeDimension.value !== "自定义" ? timeDimension.value : undefined,
    };

    // 如果是自定义时间范围，需要有日期范围才调用接口
    if (timeDimension.value === "自定义" && !dateRange.value) {
      return [];
    }

    // 如果是自定义时间范围，添加日期范围参数
    if (timeDimension.value === "自定义") {
      params.belongToDate = dateRange.value;
    }

    const res = await queryCustomerMap(params);
    // const rawData = [
    //   {
    //     countryCn: "中国大陆",
    //     countryEn: "Mainland China",
    //     value: 9500,
    //     billSum: "¥950,000",
    //     caseCount: 120,
    //     growthRate: "+15.2%",
    //   },
    //   {
    //     countryCn: "美国",
    //     countryEn: "United States",
    //     value: 8200,
    //     billSum: "$820,000",
    //     caseCount: 95,
    //     growthRate: "+8.7%",
    //   },
    //   {
    //     countryCn: "英国",
    //     countryEn: "United Kingdom",
    //     value: 5600,
    //     billSum: "£560,000",
    //     caseCount: 72,
    //     growthRate: "+5.3%",
    //   },
    //   {
    //     countryCn: "日本",
    //     countryEn: "Japan",
    //     value: 4900,
    //     billSum: "¥490,000",
    //     caseCount: 63,
    //     growthRate: "+7.1%",
    //   },
    //   {
    //     countryCn: "德国",
    //     countryEn: "Germany",
    //     value: 4200,
    //     billSum: "€420,000",
    //     caseCount: 54,
    //     growthRate: "+3.9%",
    //   },
    //   {
    //     countryCn: "法国",
    //     countryEn: "France",
    //     value: 3800,
    //     billSum: "€380,000",
    //     caseCount: 48,
    //     growthRate: "+2.8%",
    //   },
    //   {
    //     countryCn: "澳大利亚",
    //     countryEn: "Australia",
    //     value: 3200,
    //     billSum: "$320,000",
    //     caseCount: 41,
    //     growthRate: "+9.5%",
    //   },
    //   {
    //     countryCn: "加拿大",
    //     countryEn: "Canada",
    //     value: 2900,
    //     billSum: "$290,000",
    //     caseCount: 37,
    //     growthRate: "+4.6%",
    //   },
    //   {
    //     countryCn: "印度",
    //     countryEn: "India",
    //     value: 2500,
    //     billSum: "₹250,000",
    //     caseCount: 32,
    //     growthRate: "+18.3%",
    //   },
    //   {
    //     countryCn: "巴西",
    //     countryEn: "Brazil",
    //     value: 2100,
    //     billSum: "R$210,000",
    //     caseCount: 27,
    //     growthRate: "+6.2%",
    //   },
    //   {
    //     countryCn: "俄罗斯",
    //     countryEn: "Russia",
    //     value: 1800,
    //     billSum: "₽180,000",
    //     caseCount: 23,
    //     growthRate: "+1.7%",
    //   },
    //   {
    //     countryCn: "韩国",
    //     countryEn: "Korea",
    //     value: 1700,
    //     billSum: "₩170,000",
    //     caseCount: 22,
    //     growthRate: "+8.9%",
    //   },
    //   {
    //     countryCn: "意大利",
    //     countryEn: "Italy",
    //     value: 1600,
    //     billSum: "€160,000",
    //     caseCount: 21,
    //     growthRate: "+2.1%",
    //   },
    //   {
    //     countryCn: "西班牙",
    //     countryEn: "Spain",
    //     value: 1500,
    //     billSum: "€150,000",
    //     caseCount: 19,
    //     growthRate: "+3.5%",
    //   },
    //   {
    //     countryCn: "墨西哥",
    //     countryEn: "Mexico",
    //     value: 1400,
    //     billSum: "$140,000",
    //     caseCount: 18,
    //     growthRate: "+7.8%",
    //   },
    //   {
    //     countryCn: "荷兰",
    //     countryEn: "Netherlands",
    //     value: 1300,
    //     billSum: "€130,000",
    //     caseCount: 17,
    //     growthRate: "+4.2%",
    //   },
    //   {
    //     countryCn: "新加坡",
    //     countryEn: "Singapore",
    //     value: 1200,
    //     billSum: "S$120,000",
    //     caseCount: 15,
    //     growthRate: "+10.5%",
    //   },
    //   {
    //     countryCn: "瑞典",
    //     countryEn: "Sweden",
    //     value: 1100,
    //     billSum: "kr110,000",
    //     caseCount: 14,
    //     growthRate: "+3.7%",
    //   },
    //   {
    //     countryCn: "阿联酋",
    //     countryEn: "United Arab Emirates",
    //     value: 1000,
    //     billSum: "د.إ100,000",
    //     caseCount: 13,
    //     growthRate: "+12.3%",
    //   },
    //   {
    //     countryCn: "瑞士",
    //     countryEn: "Switzerland",
    //     value: 950,
    //     billSum: "CHF95,000",
    //     caseCount: 12,
    //     growthRate: "+2.9%",
    //   },
    // ];

    // 计算总计值
    // const totalAccount = rawData.reduce(
    //   (sum, item) => sum + item.accountBill,
    //   0
    // );
    // const totalCases = rawData.reduce((sum, item) => sum + item.caseCount, 0);

    // 将数据发送给父组件，包括总计信息
    emit("data-updated", {
      //   countries: mapData.value,
      totals: {
        accountBill: res.data.billSum || 0,
        cases: res.data.caseCount || 0,
        countryCount: res.data.countryCount || 0,
        growthRate: res.data.growthRate || "0%",
        timeDimension: timeDimension.value,
        dateRange: dateRange.value,
      },
      custList: res.data.allData || [],
      statisticalScope:res.data.statisticalScope
    });
    // 添加英文名称，便于与地图匹配
    mapData.value = res.data.country.map((item) => ({
      ...item,
      //   nameEn: mapZHName[item.countryCn] || item.countryCn,
    }));
    return mapData.value;
  } catch (error) {
    console.error("获取地图数据失败:", error);
    return [];
  }
};

// 加载世界地图数据
const loadWorldMap = async () => {
  if (isMapLoaded.value) return true;

  try {
    echarts.registerMap("world", worldJson);
    isMapLoaded.value = true;
    return true;
  } catch (error) {
    console.error("加载世界地图数据失败:", error);
    return false;
  }
};

// 处理大小变化
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

// 使用节流函数避免频繁调用
const throttledResize = throttle(handleResize, 200);

// 监控容器宽高变化
const setupResizeObserver = () => {
  if (!mapContainer.value) return;

  // 创建并初始化ResizeObserver来监听容器大小变化
  resizeObserver = new ResizeObserver(throttledResize);
  resizeObserver.observe(mapContainer.value);
};

// 重置选择状态
const resetSelection = () => {
  if (chart) {
    // 清除地图上的选中状态
    chart.dispatchAction({
      type: "unselect",
      seriesIndex: 0,
      name: selectedCountryEnName.value,
    });

    // 清除本地选中状态
    selectedCountry.value = null;
    selectedCountryEnName.value = null;

    // 通知父组件取消选择
    emit("country-selected", null);

    // 刷新地图状态
    updateMap();
  }
};

// 暴露方法给父组件使用
defineExpose({
  resetSelection,
});

// 初始化地图
const initChart = async () => {
  // 加载世界地图数据
  const mapLoaded = await loadWorldMap();
  if (!mapLoaded) return;

  // 初始化ECharts实例
  if (mapContainer.value) {
    chart = echarts.init(mapContainer.value);

    // 获取数据
    const data = await fetchMapData();

    // 找出最大值用于设置visualMap，如果没有数据则设置默认值
    const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.billSum || 0)) : 100;

    // 设置地图选项
    const option = {
      backgroundColor: "#fff",
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          const countryData = mapData.value.find(
            (item) => item.countryEn === params.name
          );
          if (countryData) {
            return `
              <div style="font-weight:bold;font-size:14px">${countryData.countryCn}</div>
              <div style="font-size:12px;margin-top:4px">账单总额: ${formatAccountBill(countryData.billSum || 0)}</div>
              <div style="font-size:12px">案量: ${countryData.caseCount || 0}</div>
              <div style="font-size:12px">客户数量: ${countryData.custCount || 0}</div>
              <div style="font-size:12px">增长率: ${countryData.growthRate || '0%'}</div>
            `;
          }
          return mapZHName[params.name] || params.name;
        },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        text: ["高账单额", "低账单额"],
        realtime: false,
        calculable: false,
        inRange: {
          color: data.length > 0 ? ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"] : ["#f3f4f5"],
        },
        left: "left",
        bottom: 20,
        itemWidth: 10,
        itemHeight: 80,
        textStyle: {
          fontSize: 10,
        },
        show: data.length > 0, // 当没有数据时隐藏图例
      },
      geo: {
        map: "world",
        roam: true,
        scaleLimit: {
          min: 1,
          max: 5
        },
        zoom: zoomLevel.value,
        center: [10, 20],
        label: {
          show: false,
          normal: {
            fontSize: 0, //控制标签文本大小( 当 fontSize: 0 时不显示)
            show: false,
          },
        },
        emphasis: {
          label: {
            show: false,
          },
          itemStyle: {
            areaColor: "#2a333d",
          },
        },
        itemStyle: {
          areaColor: "#f3f4f5",
          borderColor: "#ddd",
          borderWidth: 1,
        },
      },
      series: [
        {
          name: "账单额贡献",
          type: "map",
          geoIndex: 0,
          data: data.map((item) => {
            return {
              name: item.countryEn,
              value: item.billSum,
            };
          }),
          emphasis: {
            itemStyle: {
              areaColor: "#5470c6",
            },
          },
          select: {
            itemStyle: {
              areaColor: "#5470c6",
            },
          },
          selectedMode: "single",
        },
      ],
    };

    // 应用配置
    chart.setOption(option);

    // 绑定事件
    chart.on("click", function (params) {
      // 根据英文名查找对应的中文名数据
      const countryData = mapData.value.find(
        (item) => item.countryEn === params.name
      );
      if (countryData) {
        selectedCountry.value = countryData.name;
        selectedCountryEnName.value = params.name;

        // 高亮选中国家
        chart.dispatchAction({
          type: "select",
          seriesIndex: 0,
          name: params.name,
        });

        // 通知父组件
        emit("country-selected", {
          country: countryData.name,
          data: countryData,
        });
      } else {
        // 高亮选中国家
        chart.dispatchAction({
          type: "select",
          seriesIndex: 0,
          name: selectedCountryEnName.value,
        });
      }
    });

    // 调整大小
    chart.resize();
  }
};

// 更新地图数据
const updateMap = async () => {
  await fetchMapData();
  if (chart) {
    const data = mapData.value;
    // 找出最大值用于设置visualMap，如果没有数据则设置默认值
    const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.billSum || 0)) : 100;
    zoomLevel.value = 1.5;
    chart.setOption({
      visualMap: {
        max: maxValue,
        show: data.length > 0,
        inRange: {
          color: data.length > 0 ? ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"] : ["#f3f4f5"],
        },
      },
      geo: {
        zoom: zoomLevel.value,
        center: [10, 20], // 重置地图中心点到初始位置
      },
      series: [
        {
          data: data.map((item) => ({
            name: item.countryEn,
            value: item.billSum || 0,
          })),
        },
      ],
    });

    // 重置选择
    if (selectedCountry.value !== null) {
      resetSelection();
    }
  }
};

// 缩放控制
const zoomIn = () => {
  if (zoomLevel.value < 5) {
    zoomLevel.value += 0.5;
    applyZoom();
  }
};

const zoomOut = () => {
  const currentZoom = chart.getOption().geo[0].zoom;
  if (currentZoom > 1) {
    zoomLevel.value = Math.max(1, currentZoom - 0.5);
    applyZoom();
  }
};

const applyZoom = () => {
  if (chart) {
    const currentOption = chart.getOption();
    currentOption.geo[0].zoom = zoomLevel.value;
    chart.setOption(currentOption);
  }
};

// 监听时间范围变化
// watch(timeDimension, () => {
//   updateMap();
// });

// 挂载时初始化地图
onMounted(() => {
  nextTick(() => {
    initChart();
    setupResizeObserver();

    // 窗口大小变化时调整地图尺寸
    window.addEventListener("resize", throttledResize);
  });
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  // 移除窗口大小变化监听
  window.removeEventListener("resize", throttledResize);

  // 取消节流函数
  if (throttledResize && throttledResize.cancel) {
    throttledResize.cancel();
  }

  // 销毁图表实例
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style scoped>
.world-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-canvas {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.time-filter {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
  display: flex;
  align-items: center;
}
.map-header {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  background-color: white;
  border-radius: 4px;
}

.time-selector {
  border: none;
  background: transparent;
  font-size: 12px;
  padding: 4px 8px;
  outline: none;
  cursor: pointer;
  min-width: 80px;
}

.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.control-btn {
  border: none;
  background: none;
  padding: 4px;
  margin: 2px 0;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

/* 修改下拉框样式 */
:deep(.time-filter-dropdown) {
  position: fixed !important;
  margin-top: 5px !important;
  transform: none !important;
}

:deep(.el-picker__popper) {
  position: fixed !important;
  margin-top: 5px !important;
  transform: none !important;
}
</style>
