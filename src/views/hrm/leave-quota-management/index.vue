<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import LeaveQuotaDetailSidebar from "@/views/hrm/leave-quota-management/detail-sidebar.vue";
import BatchExtendDialog from "@/views/hrm/leave-quota-management/batch-extend-dialog.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const store = useStore();

const gridName = "leaveQuotaManagementGrid";
const columnOptions = [
  { title: "员工编码", value: "employeeCode" },
  { title: "姓名", value: "employeeName" },
  { title: "假期类型", value: "leaveType" },
  { title: "周期开始日期", value: "periodStartDate" },
  { title: "周期结束日期", value: "periodEndDate" },
  { title: "假期单位", value: "leaveUnit" },
  { title: "标准额度", value: "standardQuota" },
  { title: "增减额度", value: "adjustmentQuota" },
  { title: "实际额度", value: "actualQuota" },
  { title: "已用额度", value: "usedQuota" },
  { title: "冻结额度", value: "frozenQuota" },
  { title: "剩余额度", value: "remainingQuota" },
  { title: "审核状态", value: "auditStatus" },
];

const columnList = ref([...columnOptions]);
const setColumn = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    columnList.value = [...columnOptions];
    return;
  }
  const validColumns = list.filter((item) =>
    columnOptions.some((column) => column.value === item.value),
  );
  columnList.value = validColumns.length > 0 ? validColumns : [...columnOptions];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const diminput = ref("");
const quotaDetailVisible = ref(false);
const selectedQuotaDetail = ref({});
const batchDialogVisible = ref(false);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const changeBorder = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("Borderline")) {
      activeClass.value.push("Borderline");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "Borderline");
  }
  saveTableConfig("isBorderline", gridName, newVal);
};

const changeRowStyle = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("zebra")) {
      activeClass.value.push("zebra");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "zebra");
  }
  saveTableConfig("iszebra", gridName, newVal);
};

const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};

const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 244;
  }
  return windowHeight - 290;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => store.state.layout.layoutType,
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!document.fullscreenElement) {
    element.requestFullscreen().then(() => {
      setTimeout(() => {
        gridHeight.value = document.documentElement.clientHeight - 155;
      }, 100);
    });
  } else {
    document.exitFullscreen().then(() => {
      gridHeight.value = calculateGridHeight();
    });
  }
};

const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  return savedData ? savedData.pageSize : 50;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});

const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});

const quotaList = ref([
  {
    employeeCode: "10633",
    employeeName: "杨光",
    organizationName: "曜斗科技",
    positionName: "组长",
    hireDate: "2017-02-16",
    regularDate: "2017-02-16",
    groupJoinDate: "2017-02-16",
    companyJoinDate: "2017-02-16",
    firstWorkDate: "2000-05-01",
    leaveType: "事假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 8,
    adjustmentQuota: 0,
    actualQuota: 8,
    usedQuota: 0,
    frozenQuota: 0,
    remainingQuota: 8,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "已审核",
    auditStatus: "已审核",
  },
  {
    employeeCode: "10634",
    employeeName: "张敏",
    organizationName: "华东运营中心",
    positionName: "招商主管",
    hireDate: "2019-03-20",
    regularDate: "2019-06-20",
    groupJoinDate: "2019-03-20",
    companyJoinDate: "2019-03-20",
    firstWorkDate: "2014-07-01",
    leaveType: "年假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 10,
    adjustmentQuota: 2,
    actualQuota: 12,
    usedQuota: 3,
    frozenQuota: 1,
    remainingQuota: 8,
    carriedForwardQuota: 1,
    pendingQuota: 1,
    billStatus: "已审核",
    auditStatus: "已审核",
  },
  {
    employeeCode: "10635",
    employeeName: "李倩",
    organizationName: "人力资源部",
    positionName: "HRBP",
    hireDate: "2020-08-10",
    regularDate: "2020-11-10",
    groupJoinDate: "2020-08-10",
    companyJoinDate: "2020-08-10",
    firstWorkDate: "2017-06-01",
    leaveType: "病假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 30,
    adjustmentQuota: 0,
    actualQuota: 30,
    usedQuota: 4,
    frozenQuota: 0,
    remainingQuota: 26,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "已审核",
    auditStatus: "已审核",
  },
  {
    employeeCode: "10636",
    employeeName: "王浩",
    organizationName: "产品研发部",
    positionName: "前端工程师",
    hireDate: "2021-04-12",
    regularDate: "2021-07-12",
    groupJoinDate: "2021-04-12",
    companyJoinDate: "2021-04-12",
    firstWorkDate: "2018-03-01",
    leaveType: "调休",
    periodStartDate: "2026-03-01",
    periodEndDate: "2026-08-31",
    leaveUnit: "小时",
    effectDate: "2026-03-01",
    extendedDate: "2026-08-31",
    standardQuota: 24,
    adjustmentQuota: 4,
    actualQuota: 28,
    usedQuota: 6,
    frozenQuota: 2,
    remainingQuota: 20,
    carriedForwardQuota: 0,
    pendingQuota: 2,
    billStatus: "审核中",
    auditStatus: "审核中",
  },
  {
    employeeCode: "10637",
    employeeName: "赵雪",
    organizationName: "财务管理部",
    positionName: "会计",
    hireDate: "2018-09-03",
    regularDate: "2018-12-03",
    groupJoinDate: "2018-09-03",
    companyJoinDate: "2018-09-03",
    firstWorkDate: "2015-07-01",
    leaveType: "婚假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 10,
    adjustmentQuota: 0,
    actualQuota: 10,
    usedQuota: 0,
    frozenQuota: 0,
    remainingQuota: 10,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "草稿",
    auditStatus: "草稿",
  },
  {
    employeeCode: "10638",
    employeeName: "陈博",
    organizationName: "法务中心",
    positionName: "法务专员",
    hireDate: "2022-02-14",
    regularDate: "2022-05-14",
    groupJoinDate: "2022-02-14",
    companyJoinDate: "2022-02-14",
    firstWorkDate: "2019-09-01",
    leaveType: "陪产假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 15,
    adjustmentQuota: 0,
    actualQuota: 15,
    usedQuota: 5,
    frozenQuota: 0,
    remainingQuota: 10,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "已审核",
    auditStatus: "已审核",
  },
  {
    employeeCode: "10639",
    employeeName: "周岚",
    organizationName: "市场发展部",
    positionName: "市场经理",
    hireDate: "2016-05-06",
    regularDate: "2016-08-06",
    groupJoinDate: "2016-05-06",
    companyJoinDate: "2016-05-06",
    firstWorkDate: "2011-03-01",
    leaveType: "产假",
    periodStartDate: "2026-02-15",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-02-15",
    extendedDate: "2026-12-31",
    standardQuota: 158,
    adjustmentQuota: 0,
    actualQuota: 158,
    usedQuota: 32,
    frozenQuota: 0,
    remainingQuota: 126,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "已审核",
    auditStatus: "已审核",
  },
  {
    employeeCode: "10640",
    employeeName: "孙洋",
    organizationName: "客户成功部",
    positionName: "客户经理",
    hireDate: "2023-01-09",
    regularDate: "2023-04-09",
    groupJoinDate: "2023-01-09",
    companyJoinDate: "2023-01-09",
    firstWorkDate: "2020-08-01",
    leaveType: "年假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 5,
    adjustmentQuota: 1,
    actualQuota: 6,
    usedQuota: 1,
    frozenQuota: 0,
    remainingQuota: 5,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "审核中",
    auditStatus: "审核中",
  },
  {
    employeeCode: "10641",
    employeeName: "刘畅",
    organizationName: "供应链部",
    positionName: "采购专员",
    hireDate: "2021-11-18",
    regularDate: "2022-02-18",
    groupJoinDate: "2021-11-18",
    companyJoinDate: "2021-11-18",
    firstWorkDate: "2018-10-01",
    leaveType: "事假",
    periodStartDate: "2026-01-01",
    periodEndDate: "2026-12-31",
    leaveUnit: "天",
    effectDate: "2026-01-01",
    extendedDate: "2026-12-31",
    standardQuota: 8,
    adjustmentQuota: 0,
    actualQuota: 8,
    usedQuota: 2,
    frozenQuota: 1,
    remainingQuota: 5,
    carriedForwardQuota: 0,
    pendingQuota: 1,
    billStatus: "已驳回",
    auditStatus: "已驳回",
  },
  {
    employeeCode: "10642",
    employeeName: "高宁",
    organizationName: "数字化平台主管部",
    positionName: "数据分析师",
    hireDate: "2019-12-02",
    regularDate: "2020-03-02",
    groupJoinDate: "2019-12-02",
    companyJoinDate: "2019-12-02",
    firstWorkDate: "2016-02-01",
    leaveType: "调休",
    periodStartDate: "2026-04-01",
    periodEndDate: "2026-09-30",
    leaveUnit: "小时",
    effectDate: "2026-04-01",
    extendedDate: "2026-09-30",
    standardQuota: 16,
    adjustmentQuota: 2,
    actualQuota: 18,
    usedQuota: 8,
    frozenQuota: 0,
    remainingQuota: 10,
    carriedForwardQuota: 0,
    pendingQuota: 0,
    billStatus: "已审核",
    auditStatus: "已审核",
  },
]);

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  if (!keyword) {
    return quotaList.value;
  }
  return quotaList.value.filter((item) =>
    [
      item.employeeCode,
      item.employeeName,
      item.organizationName,
      item.positionName,
      item.leaveType,
      item.leaveUnit,
      item.auditStatus,
    ].some((field) => String(field || "").toLowerCase().includes(keyword)),
  );
});

const total = computed(() => filteredList.value.length);
const leaveTypeOptions = computed(() => {
  return [...new Set(quotaList.value.map((item) => item.leaveType).filter(Boolean))];
});

const gridData = computed(() => {
  const start = (listQuery.value.pageNo - 1) * listQuery.value.pageSize;
  const end = start + listQuery.value.pageSize;
  return filteredList.value.slice(start, end).map((item, index) => ({
    ...item,
    sid: start + index,
  }));
});

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
};

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const openQuotaDetail = (params) => {
  selectedQuotaDetail.value = { ...params.data };
  quotaDetailVisible.value = true;
};

const getQuotaRecordKey = (item) => {
  return [item.employeeCode, item.leaveType, item.periodStartDate].join("|");
};

const addMonthsToDate = (dateString, months) => {
  const baseDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) {
    return dateString;
  }
  const day = baseDate.getDate();
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + months + 1, 0);
  const maxDay = nextDate.getDate();
  const safeDay = Math.min(day, maxDay);
  const finalDate = new Date(baseDate);
  finalDate.setMonth(finalDate.getMonth() + months, safeDay);
  const year = finalDate.getFullYear();
  const month = `${finalDate.getMonth() + 1}`.padStart(2, "0");
  const date = `${finalDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${date}`;
};

const openBatchExtendDialog = () => {
  batchDialogVisible.value = true;
};

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const buildBatchTargets = (formData) => {
  if (formData.targetType === "all") {
    return filteredList.value;
  }

  if (formData.targetType === "selected") {
    return getSelectedRows();
  }

  let targets = [...filteredList.value];

  if (formData.leaveType) {
    targets = targets.filter((item) => item.leaveType === formData.leaveType);
  }

  if (formData.periodMode === "exact") {
    targets = targets.filter(
      (item) =>
        item.periodStartDate === formData.periodStartDate &&
        item.periodEndDate === formData.periodEndDate,
    );
  } else if (targets.length > 0) {
    const latestPeriodEndDate = targets.reduce((latest, item) => {
      return item.periodEndDate > latest ? item.periodEndDate : latest;
    }, targets[0].periodEndDate);
    targets = targets.filter((item) => item.periodEndDate === latestPeriodEndDate);
  }

  if (formData.employeeScope === "specifiedDate") {
    targets = targets.filter(
      (item) => item.extendedDate === formData.specifiedExtendedDate,
    );
  }

  return targets;
};

const getNextExtendedDate = (item, formData) => {
  if (formData.extensionType === "fixedDate") {
    return formData.fixedDate;
  }
  const baseDate = item.extendedDate || item.periodEndDate;
  return addMonthsToDate(baseDate, Number(formData.monthCount || 0));
};

const handleBatchExtend = (formData) => {
  if (formData.targetType === "selected" && getSelectedRows().length === 0) {
    return ElMessage.warning("请先选择需要延期的记录");
  }

  if (formData.targetType === "condition" && formData.periodMode === "exact") {
    if (!formData.periodStartDate || !formData.periodEndDate) {
      return ElMessage.warning("请选择完整的周期日期");
    }
  }

  if (formData.targetType === "condition" && formData.employeeScope === "specifiedDate") {
    if (!formData.specifiedExtendedDate) {
      return ElMessage.warning("请选择指定延期日期");
    }
  }

  if (formData.extensionType === "fixedDate" && !formData.fixedDate) {
    return ElMessage.warning("请选择固定日期");
  }

  if (formData.extensionType === "byMonths" && Number(formData.monthCount || 0) <= 0) {
    return ElMessage.warning("按月数延期时请输入大于 0 的月数");
  }

  const targets = buildBatchTargets(formData);
  if (targets.length === 0) {
    return ElMessage.warning("没有匹配到可延期的记录");
  }

  const targetKeys = new Set(targets.map((item) => getQuotaRecordKey(item)));
  quotaList.value = quotaList.value.map((item) => {
    if (!targetKeys.has(getQuotaRecordKey(item))) {
      return item;
    }
    return {
      ...item,
      extendedDate: getNextExtendedDate(item, formData),
    };
  });

  if (
    selectedQuotaDetail.value &&
    targetKeys.has(getQuotaRecordKey(selectedQuotaDetail.value))
  ) {
    selectedQuotaDetail.value = {
      ...selectedQuotaDetail.value,
      extendedDate: getNextExtendedDate(selectedQuotaDetail.value, formData),
    };
  }

  batchDialogVisible.value = false;
  ElMessage.success(`已完成 ${targets.length} 条记录的延期处理`);
};

const handleSaveQuotaDetail = (payload) => {
  const adjustmentQuota = Math.max(Number(payload.adjustmentQuota || 0), 0);
  const actualQuota = Number(payload.standardQuota || 0) + adjustmentQuota;
  const remainingQuota =
    actualQuota - Number(payload.usedQuota || 0) - Number(payload.frozenQuota || 0);

  const nextDetail = {
    ...payload,
    adjustmentQuota,
    actualQuota,
    remainingQuota,
  };

  quotaList.value = quotaList.value.map((item) => {
    if (
      item.employeeCode === payload.employeeCode &&
      item.leaveType === payload.leaveType &&
      item.periodStartDate === payload.periodStartDate
    ) {
      return {
        ...item,
        ...nextDetail,
      };
    }
    return item;
  });

  selectedQuotaDetail.value = nextDetail;
};

const closeQuotaDetail = () => {
  quotaDetailVisible.value = false;
};

const handlePagination = () => {};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
          class="card box"
          ref="boxRef"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 200px"
                    placeholder="搜索..."
                    clearable
                    @keyup.enter="fuzzySearch"
                    class="top-search"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-button
                    type="primary"
                    plain
                    @click="openBatchExtendDialog"
                  >
                    批量延期
                  </el-button>
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: diminput,
                  }"
                  :isFull="isFull"
                >
                </TopListTool>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
              :rowDoubleClicked="openQuotaDetail"
              :gridOptions="gridOptions"
            />
          </div>
          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :pageSizes="pageSizesList"
              @pagination="handlePagination"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
    <DragSidebar
      v-if="quotaDetailVisible"
      v-model="quotaDetailVisible"
      sidebarName="leave-quota-detail-sidebar"
      :minWidth="800"
      :width="980"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeQuotaDetail"
    >
      <LeaveQuotaDetailSidebar
        :detailInfo="selectedQuotaDetail"
        @save="handleSaveQuotaDetail"
        @close="closeQuotaDetail"
      />
    </DragSidebar>
    <BatchExtendDialog
      v-model="batchDialogVisible"
      :leaveTypeOptions="leaveTypeOptions"
      @confirm="handleBatchExtend"
    />
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}
</style>
