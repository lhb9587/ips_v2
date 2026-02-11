<template>
  <div class="field-pie-card">
    <div class="field-pie-header">
      <div class="field-pie-title">
        <span>按负责领域账单额占比</span>
        <!-- <span v-if="!isDataEmpty" class="field-pie-title-info">
          {{ totalAmountFormatted }} · 100%
        </span> -->
      </div>
      <div class="field-pie-switch">
        <span 
          :class="{ active: fieldType === 'case' }"
          @click="fieldType = 'case'"
        >
          案件领域
        </span>
        <span 
          :class="{ active: fieldType === 'business' }"
          @click="fieldType = 'business'"
        >
          业务领域
        </span>
      </div>
    </div>
    <!-- 数据为空或全为0时显示暂无数据 -->
    <div v-if="isDataEmpty" class="field-pie-empty">
      <div class="field-pie-empty-icon">📊</div>
      <div class="field-pie-empty-text">暂无数据</div>
    </div>
    <div v-else ref="chartRef" class="field-pie-body"></div>
  </div>
</template>

<script setup>
/* global defineProps */
import { onBeforeUnmount, onMounted, ref, watch, computed, nextTick } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  caseFields: { type: Array, default: () => [] },
  businessFields: { type: Array, default: () => [] },
  hoverDetailFetcher: { type: Function, default: null },
});

const chartRef = ref(null);
const chart = ref(null);
const fieldType = ref('case'); // 默认案件领域
const hoverDetailCache = ref(new Map());
const hoverDetailLoading = ref(new Set());
const currentHoverKey = ref(null);
const currentHoverParams = ref({ seriesIndex: 0, dataIndex: 0 });

const currentData = computed(() => {
  return fieldType.value === 'case' ? props.caseFields : props.businessFields;
});

// 过滤掉无金额的项，只用于图表展示
const chartData = computed(() => {
  const data = currentData.value;
  if (!data || !Array.isArray(data)) return [];
  return data.filter((item) => {
    const val = typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0);
    return val > 0;
  });
});

// 判断数据是否为空或全为0
const isDataEmpty = computed(() => {
  const data = currentData.value;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return true;
  }
  // 检查所有值是否都为0或无效
  const total = data.reduce((sum, item) => {
    const val = typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0);
    return sum + val;
  }, 0);
  return total === 0;
});

// 计算总金额并格式化
// const totalAmountFormatted = computed(() => {
//   const data = currentData.value;
//   if (!data || !Array.isArray(data) || data.length === 0) {
//     return '';
//   }
//   const total = data.reduce((sum, item) => {
//     const val = typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0);
//     return sum + val;
//   }, 0);
//   if (total === 0) return '';
//   return `¥${total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// });

const buildOption = () => {
  const data = chartData.value;
  const total = data.reduce((sum, item) => {
    const val = typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0);
    return sum + val;
  }, 0);
  
  return {
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
        const name = d?.name ?? d?.label ?? params?.name ?? params?.label ?? "";
        currentHoverParams.value = {
          seriesIndex: params?.seriesIndex ?? 0,
          dataIndex: params?.dataIndex ?? 0,
        };
        let amount = d?.amount ?? "";
        const val = typeof d?.value === 'string' ? parseFloat(d.value) || 0 : (d?.value || 0);
        const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        // 如果没有 amount，从 value 格式化
        if (!amount && val > 0) {
          amount = `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (props.hoverDetailFetcher && name) {
          ensureHoverDetail(name);
          const hoverKey = `${fieldType.value}:${name}`;
          if (hoverDetailLoading.value.has(hoverKey)) {
            return `<div style="padding:4px 0">加载中...</div>`;
          }
          if (hoverDetailCache.value.has(hoverKey)) {
            return buildHoverDetailHtml(name, hoverDetailCache.value.get(hoverKey));
          }
        }
        if (d?.subFields || d?.bills) {
          return buildBillsTooltipHtml(name, amount, percent, d.bills, d);
        }
        return `<div style="padding:4px 0">${name} ${percent}% ${amount ? `，${amount}` : ""}</div>`;
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
        radius: "70%", // 饼图（不是环形图）
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: (params) => {
            const val = typeof params.value === 'string' ? parseFloat(params.value) || 0 : (params.value || 0);
            const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            const amount = params.data?.amount || "";
            // 如果没有 amount，从 value 格式化
            let amountStr = amount;
            if (!amountStr && val > 0) {
              amountStr = `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            const name = params.name || params.data?.name || params.data?.label || "";
            return `${name} ${percent}% ${amountStr}`;
          },
          fontSize: 10,
          color: "#5f6f86",
        },
        data: data.map(item => ({
          ...item,
          name: item.name || item.label || '',
          value: typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0)
        })),
      },
    ],
  };
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
  const label = fieldType.value === 'case' ? '案件类型' : '业务类型';
  const body = rows
    .map((row) => {
      const fieldName = row.caseType || row.domain || row.name || row.label || "";
      const amount = formatAmountValue(row.billSum || row.amount || "");
      const percent = row.percentage || row.percent || row.rate || row.ratio || row.proportion || "";
      return `<tr>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${fieldName}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${amount}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${percent}</td>
      </tr>`;
    })
    .join("");
  return `
    <div style="padding:4px 0;min-width:280px;max-height:300px;display:flex;flex-direction:column">
      <div style="font-weight:600;margin-bottom:8px;font-size:13px;position:sticky;top:0;background:#fff;z-index:2">${name}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead style="position:sticky;top:0;background:#f5f7fa;z-index:1">
          <tr>
            <th style="padding:6px 8px;text-align:left;font-weight:600">${label}</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">账单额</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">占比</th>
          </tr>
        </thead>
      </table>
      <div style="max-height:240px;overflow:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>`;
};

const ensureHoverDetail = (name) => {
  if (!props.hoverDetailFetcher) return;
  const hoverKey = `${fieldType.value}:${name}`;
  currentHoverKey.value = hoverKey;
  if (hoverDetailCache.value.has(hoverKey) || hoverDetailLoading.value.has(hoverKey)) return;
  hoverDetailLoading.value.add(hoverKey);
  props
    .hoverDetailFetcher({ fieldType: fieldType.value, name })
    .then((rows) => {
      hoverDetailCache.value.set(hoverKey, Array.isArray(rows) ? rows : []);
    })
    .catch(() => {
      hoverDetailCache.value.set(hoverKey, []);
    })
    .finally(() => {
      hoverDetailLoading.value.delete(hoverKey);
      if (chart.value && currentHoverKey.value === hoverKey) {
        chart.value.dispatchAction({
          type: "showTip",
          seriesIndex: currentHoverParams.value.seriesIndex ?? 0,
          dataIndex: currentHoverParams.value.dataIndex ?? 0,
        });
      }
    });
};

const buildBillsTooltipHtml = (name, amount, percent, bills, data) => {
  // 优先使用 subFields（子领域列表）
  const subFields = data?.subFields;
  if (subFields && Array.isArray(subFields) && subFields.length > 0) {
    const fieldLabel = fieldType.value === 'case' ? '案件类型' : '业务领域';
    const rows = subFields
      .map(
        (item) => {
          return `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${item.name || ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${item.amount || ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:right">${item.percent || ""}</td>
          </tr>`;
        }
      )
      .join("");
    return `
    <div style="padding:4px 0;min-width:280px">
      <div style="font-weight:600;margin-bottom:8px;font-size:13px">${name} ${percent}% ${amount ? ` · ${amount}` : ""}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f5f7fa">
            <th style="padding:6px 8px;text-align:left;font-weight:600">${fieldLabel}</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">账单额</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">占比</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
  
  // 如果没有 subFields，回退到原来的客户列表显示
  if (!bills || !Array.isArray(bills) || bills.length === 0) {
    return `<div style="padding:4px 0">${name} ${percent}% ${amount ? `，${amount}` : ""}</div>`;
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
  return `<div style="padding:4px 0">${name} ${percent}% ${amount ? `，${amount}` : ""}</div>`;
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
let hideTipTimer = null;

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
  chart.value.off("click");
  chart.value.on("globalout", () => {
    scheduleHideTip();
  });
  chart.value.on("click", (params) => {
    clearHideTip();
    currentHoverParams.value = {
      seriesIndex: params?.seriesIndex ?? 0,
      dataIndex: params?.dataIndex ?? 0,
    };
    if (props.hoverDetailFetcher) {
      ensureHoverDetail(params?.data?.name ?? params?.name ?? "");
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
  () => currentData.value,
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

watch(
  () => fieldType.value,
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
  }
);
</script>

<style scoped lang="scss">
.field-pie-card {
  border: 1px solid #e6edf8;
  border-radius: 14px;
  padding: 12px;
  background: #ffffff;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.field-pie-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.field-pie-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2a44;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .field-pie-title-info {
    font-size: 12px;
    font-weight: 400;
    color: #5f6f86;
  }
}

.field-pie-switch {
  display: flex;
  gap: 4px;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 2px;
  
  span {
    padding: 4px 10px;
    font-size: 11px;
    color: #5f6f86;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    white-space: nowrap;
    
    &:hover {
      color: #2f6bff;
    }
    
    &.active {
      background: #ffffff;
      color: #2f6bff;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(16, 36, 76, 0.08);
    }
  }
}

.field-pie-body {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.field-pie-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8b9db8;
  
  .field-pie-empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.6;
  }
  
  .field-pie-empty-text {
    font-size: 13px;
    color: #8b9db8;
  }
}
</style>
