<template>
  <div class="donut-card">
    <div class="donut-header">
      <div class="donut-title">{{ title }}</div>
      <div v-if="title === '前十客户账单额占比'" class="donut-switch donut-switch--hidden">
        <span>案件领域</span>
        <span>业务领域</span>
      </div>
    </div>
    <!-- 数据为空或全为0时显示暂无数据 -->
    <div v-if="isDataEmpty" class="donut-empty">
      <div class="donut-empty-icon">📊</div>
      <div class="donut-empty-text">暂无数据</div>
    </div>
    <div v-else ref="chartRef" class="donut-body"></div>
  </div>
</template>

<script setup>
/* global defineProps */
import { onBeforeUnmount, onMounted, ref, watch, nextTick, computed } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  title: { type: String, default: "" },
  data: { type: Array, default: () => [] },
  showDetail: { type: Boolean, default: false },
  solid: { type: Boolean, default: false },
  hoverDetailFetcher: { type: Function, default: null },
});

const chartRef = ref(null);
const chart = ref(null);
const hoverDetailCache = ref(new Map());
const hoverDetailLoading = ref(new Set());
let hideTipTimer = null;
const currentHoverKey = ref(null);

// 判断数据是否为空或全为0
const isDataEmpty = computed(() => {
  if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
    return true;
  }
  // 检查所有值是否都为0或无效
  const total = props.data.reduce((sum, item) => sum + (item.value || 0), 0);
  return total === 0;
});

const buildBillsTooltipHtml = (name, amount, bills) => {
  if (!bills || !Array.isArray(bills) || bills.length === 0) {
    return `<div style="padding:4px 0">${name}${amount ? `，${amount}` : ""}</div>`;
  }
  const isByField = bills[0] && "customerName" in bills[0];
  if (isByField) {
    const rows = bills
      .map(
        (b) =>
          `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${b.customerName || ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${b.amount || ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${b.direction || ""}</td>
          </tr>`
      )
      .join("");
    return `
    <div style="padding:4px 0;min-width:280px">
      <div style="font-weight:600;margin-bottom:8px;font-size:13px">${name}${amount ? ` · ${amount}` : ""}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f5f7fa">
            <th style="padding:6px 8px;text-align:left;font-weight:600">客户名称</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">账单金额</th>
            <th style="padding:6px 8px;text-align:left;font-weight:600">申请方向</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
  // 如果是前十客户图表，按领域汇总显示
  if (props.title && props.title.includes("前十客户")) {
    // 按领域汇总
    const fieldMap = new Map();
    bills.forEach((b) => {
      const fieldName = b.field || "";
      const billAmount = parseFloat((b.amount || "").replace(/[¥,]/g, "")) || 0;
      
      if (fieldMap.has(fieldName)) {
        const existing = fieldMap.get(fieldName);
        existing.amount += billAmount;
        existing.count += 1;
      } else {
        fieldMap.set(fieldName, {
          name: fieldName,
          amount: billAmount,
          count: 1
        });
      }
    });
    
    // 计算总金额用于计算占比
    const totalAmount = Array.from(fieldMap.values()).reduce((sum, item) => sum + item.amount, 0);
    
    // 转换为数组并按金额排序
    const fieldList = Array.from(fieldMap.values())
      .map(item => ({
        ...item,
        amountStr: `¥${item.amount.toLocaleString()}`
      }))
      .sort((a, b) => b.amount - a.amount);
    
    const rows = fieldList
      .map(
        (item) => {
          const billPercent = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0;
          return `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${item.name || ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${item.amountStr || ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${billPercent}%</td>
          </tr>`;
        }
      )
      .join("");
    return `
    <div style="padding:4px 0;min-width:280px">
      <div style="font-weight:600;margin-bottom:8px;font-size:13px">${name}${amount ? ` · ${amount}` : ""}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f5f7fa">
            <th style="padding:6px 8px;text-align:left;font-weight:600">领域名称</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">账单额</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">占比</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
  
  const rows = bills
    .map(
      (b) =>
        `<tr>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${b.billNo || ""}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${b.amount || ""}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${b.field || ""}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${b.direction || ""}</td>
        </tr>`
    )
    .join("");
  return `
    <div style="padding:4px 0;min-width:320px">
      <div style="font-weight:600;margin-bottom:8px;font-size:13px">${name}${amount ? ` · ${amount}` : ""}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f5f7fa">
            <th style="padding:6px 8px;text-align:left;font-weight:600">账单号</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">账单金额</th>
            <th style="padding:6px 8px;text-align:left;font-weight:600">案件领域</th>
            <th style="padding:6px 8px;text-align:left;font-weight:600">申请方向</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
};

const formatAmountValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/[¥￥]/.test(trimmed)) return trimmed.replace("￥", "¥");
    const num = Number.parseFloat(trimmed.replace(/,/g, ""));
    if (Number.isFinite(num)) {
      return `¥${num.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return trimmed;
  }
  return "";
};

const buildHoverDetailHtml = (name, rows) => {
  if (!rows || rows.length === 0) {
    return `<div style="padding:4px 0">暂无数据</div>`;
  }
  const body = rows
    .map((row) => {
      const fieldName = row.domain || row.fieldName || row.field || row.name || row.label || "";
      const amount = formatAmountValue(row.amount || row.billSum || "");
      let percent = row.percentage || row.percent || row.rate || row.ratio || row.proportion || "";
      if (typeof percent === "number") {
        percent = `${(percent * 100).toFixed(0)}%`;
      } else if (typeof percent === "string") {
        const normalized = percent.trim();
        const asNumber = Number.parseFloat(normalized);
        if (Number.isFinite(asNumber) && !/%$/.test(normalized)) {
          percent = `${(asNumber * 100).toFixed(0)}%`;
        } else {
          percent = normalized;
        }
      }
      return `<tr>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${fieldName}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${amount}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${percent}</td>
      </tr>`;
    })
    .join("");
  return `
    <div style="padding:4px 0;min-width:280px">
      <div style="font-weight:600;margin-bottom:8px;font-size:13px">${name}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f5f7fa">
            <th style="padding:6px 8px;text-align:left;font-weight:600">领域名称</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">账单额</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">占比</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
};

const getHoverKey = (data, params) => {
  if (data?.custId !== undefined && data?.custId !== null) {
    return String(data.custId);
  }
  const name = data?.name ?? params?.name;
  if (name) return `other-${name}`;
  const index = params?.dataIndex ?? 0;
  return `other-${index}`;
};

const ensureHoverDetail = (params) => {
  if (!props.hoverDetailFetcher) return;
  const key = getHoverKey(params?.data, params);
  currentHoverKey.value = key;
  if (hoverDetailCache.value.has(key) || hoverDetailLoading.value.has(key)) return;
  hoverDetailLoading.value.add(key);
  props
    .hoverDetailFetcher(params?.data?.custId ?? null, params?.data)
    .then((rows) => {
      hoverDetailCache.value.set(key, Array.isArray(rows) ? rows : []);
    })
    .catch(() => {
      hoverDetailCache.value.set(key, []);
    })
    .finally(() => {
      hoverDetailLoading.value.delete(key);
      if (chart.value && currentHoverKey.value === key) {
        chart.value.dispatchAction({
          type: "showTip",
          seriesIndex: params?.seriesIndex ?? 0,
          dataIndex: params?.dataIndex ?? 0,
        });
      }
    });
};

const buildOption = () => {
  const total = props.data.reduce((sum, item) => sum + (item.value || 0), 0);
  // 如果是"前十客户账单额占比"，外半径设为70%与饼图一致，内半径50%
  const isTopCustomers = props.title && props.title.includes("前十客户");
  const radius = props.solid ? "70%" : (isTopCustomers ? ["50%", "70%"] : ["58%", "78%"]);
  
  // 扩展的颜色方案，支持至少15种颜色，避免重复
  const colorPalette = [
    '#2f6bff', // 蓝色
    '#39b27f', // 绿色
    '#f7b84b', // 黄色
    '#6c7cff', // 紫色
    '#ff7a5c', // 橙色
    '#8b9db8', // 灰色
    '#ff6b9d', // 粉色
    '#4ecdc4', // 青色
    '#95e1d3', // 浅青色
    '#f38181', // 浅红色
    '#aa96da', // 淡紫色
    '#fcbad3', // 淡粉色
    '#a8e6cf', // 淡绿色
    '#ffd3a5', // 淡橙色
    '#fd79a8', // 深粉色
  ];
  
  return {
    color: colorPalette,
    tooltip: {
      trigger: "item",
      triggerOn: "click",
      renderMode: "html",
      confine: false,
      appendToBody: true,
      enterable: true,
      hideDelay: 200,
      transitionDuration: 0.15,
      backgroundColor: "#fff",
      borderColor: "#e1e7f2",
      borderWidth: 1,
      padding: [12, 16],
      extraCssText: "box-shadow: 0 8px 24px rgba(16,36,76,0.12); border-radius: 12px; max-height: 70vh; overflow: auto; pointer-events: auto;",
      formatter: (params) => {
        const d = params?.data;
        const name = d?.name ?? params?.name ?? "";
        const amount = d?.amount ?? "";
        if (props.hoverDetailFetcher) {
          const hoverKey = getHoverKey(d, params);
          currentHoverKey.value = hoverKey;
          ensureHoverDetail(params);
          if (hoverDetailLoading.value.has(hoverKey)) {
            return `<div style="padding:4px 0">加载中...</div>`;
          }
          if (hoverDetailCache.value.has(hoverKey)) {
            return buildHoverDetailHtml(name, hoverDetailCache.value.get(hoverKey));
          }
        }
        if (d?.bills) {
          return buildBillsTooltipHtml(name, amount, d.bills);
        }
        return `<div style="padding:4px 0">${name}${amount ? `，${amount}` : ""}</div>`;
      },
      position: (point, params, dom, rect, size) => {
        const viewW = size?.viewSize?.[0] ?? window.innerWidth;
        const viewH = size?.viewSize?.[1] ?? window.innerHeight;
        const contentW = size?.contentSize?.[0] ?? 340;
        const contentH = Math.min(size?.contentSize?.[1] ?? 200, viewH * 0.7);
        const gap = 12;
        const pad = 8;
        
        const rectX = rect?.x ?? 0;
        const rectY = rect?.y ?? 0;
        const mouseX = rectX + point[0];
        const mouseY = rectY + point[1];
        
        const spaceRight = viewW - mouseX - gap;
        const spaceLeft = mouseX - gap;
        
        let x, y;
        
        if (spaceRight >= contentW + pad) {
          x = mouseX + gap;
        } else if (spaceLeft >= contentW + pad) {
          x = mouseX - contentW - gap;
        } else {
          if (spaceRight > spaceLeft) {
            x = Math.max(pad, viewW - contentW - pad);
          } else {
            x = pad;
          }
        }
        
        y = mouseY - contentH / 2;
        if (y < pad) y = pad;
        if (y + contentH + pad > viewH) y = viewH - contentH - pad;
        
        return [x, y];
      },
    },
    series: [
      {
        type: "pie",
        radius: radius,
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: (params) => {
            const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
            const amount = params.data?.amount || "";
            // 如果标题包含"前十客户"，显示名称、占比和账单额
            if (props.title && props.title.includes("前十客户")) {
              return `${params.name} ${percent}% ${amount}`;
            }
            if (props.showDetail) {
              return `${params.name}\n${percent}% ${amount}`;
            }
            return params.name;
          },
          fontSize: 10,
          color: "#5f6f86",
          lineHeight: 14,
        },
        data: props.data,
      },
    ],
  };
};

const scheduleHideTip = () => {
  if (!chart.value) return;
  if (hideTipTimer) clearTimeout(hideTipTimer);
  hideTipTimer = setTimeout(() => {
    if (chart.value) {
      chart.value.dispatchAction({ type: "hideTip" });
    }
  }, 200);
};

const clearHideTip = () => {
  if (hideTipTimer) {
    clearTimeout(hideTipTimer);
    hideTipTimer = null;
  }
};

const bindChartEvents = () => {
  if (!chart.value) return;
  chart.value.off("globalout");
  chart.value.off("mouseout");
  chart.value.off("mouseover");
  chart.value.off("click");
  chart.value.on("globalout", () => {
    scheduleHideTip();
  });
  chart.value.on("click", (params) => {
    clearHideTip();
    if (props.hoverDetailFetcher) {
      ensureHoverDetail(params);
    }
    if (chart.value) {
      chart.value.dispatchAction({
        type: "showTip",
        seriesIndex: params?.seriesIndex ?? 0,
        dataIndex: params?.dataIndex ?? 0,
      });
    }
  });
};

const renderChart = () => {
  if (!chart.value || isDataEmpty.value) return;
  chart.value.setOption(buildOption());
  bindChartEvents();
};

const initChart = () => {
  if (!chartRef.value || isDataEmpty.value) return;
  chart.value = echarts.init(chartRef.value);
  renderChart();
};

const resizeChart = () => {
  if (chart.value) chart.value.resize();
};

let resizeObserver = null;

onMounted(() => {
  // 延迟初始化，确保容器有尺寸
  nextTick(() => {
    setTimeout(() => {
      initChart();
    }, 100);
  });
  
  window.addEventListener("resize", resizeChart);
  
  // 使用 ResizeObserver 监听容器尺寸变化
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      resizeChart();
    });
    resizeObserver.observe(chartRef.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value);
    resizeObserver.disconnect();
  }
  if (chart.value) chart.value.dispose();
  if (hideTipTimer) clearTimeout(hideTipTimer);
});

watch(
  () => props.data,
  () => {
    hoverDetailCache.value = new Map();
    hoverDetailLoading.value = new Set();
    if (isDataEmpty.value) {
      // 数据为空，销毁图表
      if (chart.value) {
        chart.value.dispose();
        chart.value = null;
      }
    } else {
      // 数据有效，初始化或更新图表
      nextTick(() => {
        if (!chart.value && chartRef.value) {
          chart.value = echarts.init(chartRef.value);
        }
        renderChart();
      });
    }
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.donut-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8b9db8;
  
  .donut-empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.6;
  }
  
  .donut-empty-text {
    font-size: 13px;
    color: #8b9db8;
  }
}
</style>
