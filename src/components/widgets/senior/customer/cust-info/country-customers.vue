<template>
  <div class="customers-container" @scroll="handleScroll">
    <!-- 全球数据概览 -->
    <div
      v-if="!selectedCountry && totals"
      class="overview-section"
    >
      <div class="d-flex gap-2 info-label">
        <h3 class="section-title">全球概览</h3>
        <span>统计范围：{{ allCustomers.statisticalScope || "" }}</span>
      </div>
      <!-- 总账单额 -->
      <div class="info-card blue">
        <div class="info-label">总账单额</div>
        <div class="info-value">
          {{ formatAccountBill(totals.accountBill) }}
        </div>
      </div>

      <!-- 三个指标并排 -->
      <div class="info-grid">
        <div class="info-card purple">
          <div class="info-label">同期增长率</div>
          <div class="info-value">
            <div
              style="color: #67c23a"
              v-if="parseFloat(totals.growthRate) < 0"
            >
              <span>{{ totals.growthRate }}</span>
            </div>
            <div
              style="color: #f46a6a"
              v-if="parseFloat(totals.growthRate) > 0"
            >
              <span>+{{ totals.growthRate }}</span>
            </div>
            <div
              style="color: #f46a6a"
              v-if="parseFloat(totals.growthRate) == 0"
            >
              <span>+{{ totals.growthRate }}</span>
            </div>
          </div>
        </div>
        <div class="info-card green">
          <div class="info-label">总案量</div>
          <div class="info-value">{{ totals.cases }}</div>
        </div>
        <div class="info-card amber">
          <div class="info-label">覆盖国家</div>
          <div class="info-value">{{ totals.countryCount }}</div>
        </div>
      </div>
    </div>

    <!-- 国家概览区域 -->
    <div
      v-if="selectedCountry"
      class="overview-section"
    >
      <div class="countryCn-header">
        <div class="d-flex gap-2 info-label">
          <h3 class="section-title">{{ selectedCountry.data.countryCn }}</h3>
          <span>统计范围：{{ allCustomers.statisticalScope || "" }}</span>
        </div>
        <div
          @click="clearSelection"
          class="return-button"
        >
          返回全球
        </div>
      </div>

      <!-- 账单总额 -->
      <div class="info-card blue">
        <div class="info-label">账单总额</div>
        <div class="info-value">
          {{ formatAccountBill(selectedCountry.data.billSum) }}
        </div>
      </div>

      <!-- 三个指标并排 -->
      <div class="info-grid">
        <div class="info-card purple">
          <div class="info-label">同期增长率</div>
          <div class="info-value">
            <div
              style="color: #67c23a"
              v-if="parseFloat(selectedCountry.data.growthRate) < 0"
            >
              <span>{{ selectedCountry.data.growthRate }}</span>
            </div>
            <div
              style="color: #f46a6a"
              v-if="parseFloat(selectedCountry.data.growthRate) > 0"
            >
              <span>+{{ selectedCountry.data.growthRate }}</span>
            </div>
            <div
              style="color: #f46a6a"
              v-if="parseFloat(selectedCountry.data.growthRate) == 0"
            >
              <span>+{{ selectedCountry.data.growthRate }}</span>
            </div>
          </div>
        </div>
        <div class="info-card green">
          <div class="info-label">案量</div>
          <div class="info-value">{{ selectedCountry.data.caseCount }}</div>
        </div>
        <div class="info-card amber">
          <div class="info-label">客户数量</div>
          <div class="info-value">{{ selectedCountry.data.custCount }}</div>
        </div>
      </div>
    </div>

    <!-- 客户列表区域 -->
    <div class="customer-list-section">
      <!-- 标题和筛选区域 -->
      <div class="list-header">
        <h3 class="list-title">
          {{
            selectedCountry
              ? `${selectedCountry.data.countryCn}客户`
              : "全球客户"
          }}
        </h3>
        <div class="filter-controls">
          <el-select
            v-model="sortBy"
            @change="sortCustomers"
            size="small"
            placeholder="排序方式"
            style="width: 120px"
          >
            <el-option
              label="按账单收入排序"
              value="revenue"
            ></el-option>
            <el-option
              label="按案量排序"
              value="cases"
            ></el-option>
          </el-select>
        </div>
      </div>

      <!-- 客户列表 -->
      <div
        v-if="displayCustomers.length > 0"
        class="customer-list"
      >
        <div
          v-for="(customer, index) in displayCustomers"
          :key="index"
          @click="selectCustomer(customer)"
          class="customer-item"
        >
          <div class="customer-content">
            <div>
              <div class="customer-name">{{ customer.name }}</div>
              <div class="customer-details">
                <span class="customer-revenue">{{
                  formatAccountBill(customer.revenue || 0)
                }}</span>
                <el-tag
                  size="small"
                  type="success"
                  >案量: {{ customer.cases }}</el-tag
                >
              </div>
            </div>
            <div class="arrow-icon">
              <i class="bx bx-chevron-right"></i>
            </div>
          </div>
        </div>
        <!-- 加载更多提示 -->
        <div v-if="loading" class="loading-more">
          加载中...
        </div>
      </div>

      <!-- 无数据提示 -->
      <div
        v-else
        class="empty-list"
      >
        <p>没有找到符合条件的客户</p>
      </div>
    </div>

    <!-- 客户详情弹窗 -->
    <cust-modal ref="custModalRef" />
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import custModal from "@/components/widgets/senior/customer/cust-info/cust-modal.vue";

const props = defineProps({
  selectedCountry: {
    type: Object,
    default: null,
  },
  allCustomers: {
    type: [Array, Object],
    default: () => [],
  },
});

// 模态框引用
const custModalRef = ref(null);

// 打开客户详情模态框
const openCustModal = (custInfo) => {
  custModalRef.value.openModal(custInfo);
};

const emit = defineEmits(["clear-selection"]);

// 状态变量
const sortBy = ref("revenue");
// const filterBy = ref('all');
const customers = ref([]);
const selectedCustomer = ref(null);
const totals = ref(null);

// 分页相关状态
const pageSize = 50;
const currentPage = ref(1);
const loading = ref(false);

// 格式化账单金额
const formatAccountBill = (amount) => {
  if (!amount) return "¥0";
  return `¥${amount.toLocaleString()}`;
};

// 清除国家选择
const clearSelection = () => {
  emit("clear-selection");
};

// 加载全局客户
const loadGlobalCustomers = () => {
  if (!props.allCustomers || !props.allCustomers.custList) return;

  customers.value = [];

  const custList = [...new Set(props.allCustomers.custList)];

  customers.value = custList.map((item) => ({
    cases: item.caseCount,
    revenue: item.billSum,
    growthRate: item.growthRate,
    name: item.custName,
    custId: item.custId,
  }));
};

// 计算属性：过滤和排序后的客户列表
const displayCustomers = computed(() => {
  // 过滤
  let filtered = [...customers.value];

  // 排序
  filtered = filtered.sort((a, b) => {
    if (sortBy.value === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === "revenue") {
      return b.revenue - a.revenue;
    } else if (sortBy.value === "cases") {
      return b.cases - a.cases;
    }
    return 0;
  });

  // 分页
  return filtered.slice(0, currentPage.value * pageSize);
});

// 滚动加载更多
const handleScroll = (e) => {
  const container = e.target;
  const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  
  if (scrollBottom < 50 && !loading.value) {
    loadMore();
  }
};

// 加载更多数据
const loadMore = () => {
  if (loading.value) return;
  if (currentPage.value * pageSize >= customers.value.length) return;
  
  loading.value = true;
  setTimeout(() => {
    currentPage.value++;
    loading.value = false;
  }, 300);
};

// 重置分页
const resetPagination = () => {
  currentPage.value = 1;
  loading.value = false;
  // 重置滚动条位置
  const container = document.querySelector('.customers-container');
  if (container) {
    container.scrollTop = 0;
  }
};

// 方法
const sortCustomers = () => {
  // 排序已通过计算属性处理
  resetPagination()
};

const selectCustomer = (customer) => {
  const custInfo = {
    custId: customer.custId,
    fullname: customer.name,
    timeDimension: totals.value.timeDimension,
    belongToDate: totals.value.dateRange,
  };
  selectedCustomer.value = customer;
  openCustModal(custInfo);
};

// 监听选中的国家变化
watch(
  () => props.selectedCountry,
  (newVal) => {
    resetPagination(); // 重置分页
    if (newVal) {
      if (newVal.data.customerList) {
        customers.value = newVal.data.customerList.map((item) => ({
          cases: item.caseCount,
          revenue: item.billSum,
          growthRate: item.growthRate,
          name: item.custName,
          custId: item.custId,
        }));
      } else {
        customers.value = [];
      }
    } else if (
      props.allCustomers &&
      props.allCustomers.custList &&
      props.allCustomers.custList.length > 0
    ) {
      loadGlobalCustomers();
    } else {
      customers.value = [];
    }
  },
  { immediate: true }
);

// 监听全局客户数据变化
watch(
  () => props.allCustomers,
  (newVal) => {
    if (newVal) {
      // 更新总计数据
      if (newVal.totals) {
        totals.value = newVal.totals;
      }

      if (!props.selectedCountry) {
        // 加载全局客户数据
        loadGlobalCustomers();
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.customers-container {
  height: 98%;
  overflow-y: auto;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
}

.overview-section {
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.countryCn-header {
  display: flex;
  justify-content: space-between;
}

.return-button {
  font-size: 12px;
  color: #556ee6;
  cursor: pointer;
}

.info-card {
  background-color: #f5f7fa;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.info-card.blue {
  background-color: #ecf5ff;
}

.info-card.purple {
  background-color: #f5ecff;
}

.info-card.green {
  background-color: #f0f9eb;
}

.info-card.amber {
  background-color: #fdf6ec;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 3px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.customer-list-section {
  margin-top: 15px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.customer-list {
  border: 1px solid #ebeef5;
  border-radius: 5px;
  overflow: hidden;
}

.customer-item {
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:hover {
  background-color: #f5f7fa;
}

.customer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.customer-details {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-revenue {
  font-size: 12px;
  color: #909399;
}

.arrow-icon {
  color: #c0c4cc;
}

.empty-list {
  padding: 30px;
  text-align: center;
  color: #909399;
  border: 1px solid #ebeef5;
  border-radius: 5px;
}

.customer-detail {
  padding: 0 10px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.detail-card {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 5px;
}

.detail-label {
  font-size: 12px;
  color: #909399;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
}

.trend-section,
.manager-section {
  margin-bottom: 15px;
}

.trend-title,
.manager-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

.trend-chart {
  background-color: #f5f7fa;
  border-radius: 5px;
  padding: 10px;
  height: 180px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-title {
  font-size: 12px;
  color: #909399;
}

.chart-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-color.blue {
  background-color: #409eff;
}

.legend-color.gray {
  background-color: #c0c4cc;
}

.legend-text {
  font-size: 12px;
  color: #909399;
}

.bar-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100px;
  margin-top: 10px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 8%;
  position: relative;
}

.bar {
  width: 6px;
  position: absolute;
  bottom: 20px;
  border-radius: 3px 3px 0 0;
}

.bar.last-year {
  background-color: #c0c4cc;
  left: calc(50% - 8px);
}

.bar.current-year {
  background-color: #409eff;
  left: calc(50% + 2px);
}

.bar-label {
  font-size: 10px;
  color: #909399;
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
}

.manager-card {
  display: flex;
  gap: 15px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 5px;
}

.manager-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e6f1fc;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.manager-info {
  flex: 1;
}

.manager-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 3px;
}

.manager-role {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.domains-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.domains-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.action-footer {
  margin-top: 20px;
  text-align: center;
}

.view-customer-btn {
  width: 100%;
}

.loading-more {
  text-align: center;
  padding: 10px 0;
  color: #909399;
  font-size: 14px;
}
</style>
