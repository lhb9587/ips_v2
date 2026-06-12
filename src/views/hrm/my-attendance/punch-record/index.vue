<!-- 员工自助打卡记录页，按日期范围查询本人打卡记录并支持快捷操作。 -->
<script setup>
import dayjs from "dayjs";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { queryAttendanceSelfPunchRecordList } from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const gridName = "myPunchRecordGrid";
const columnList = [
  { title: "序号", value: "seq", width: 80, minWidth: 72, sortable: false },
  { title: "日期", value: "attendanceDate", width: 120 },
  { title: "星期", value: "weekName", width: 100 },
  { title: "打卡时间", value: "punchTimeText", minWidth: 200 },
  { title: "打卡次数", value: "punchCount", width: 96 },
  { title: "补签卡时间", value: "supplementTimeText", minWidth: 160 },
  {
    title: "操作",
    value: "rowActions",
    minWidth: 260,
    sortable: false,
    filter: false,
    menuTabs: [],
  },
];

const today = dayjs().format("YYYY-MM-DD");
const monthAgo = dayjs().subtract(29, "day").format("YYYY-MM-DD");

const loading = ref(false);
const allRecords = ref([]);
const gridData = ref([]);
const total = ref(0);
const filterForm = ref({
  startDate: monthAgo,
  endDate: today,
});
const dateRange = ref([monthAgo, today]);

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

const calculateGridHeight = () => {
  const windowHeight = document.documentElement.clientHeight;
  if (store.state.layout.embedMode) {
    return windowHeight - 135;
  }
  const layout = store.state.layout.layoutType;
  if (layout === "vertical") {
    return windowHeight - 235;
  }
  return windowHeight - 290;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => [store.state.layout.layoutType, store.state.layout.embedMode],
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const ACTION_LINK_STYLE =
  "color: #4d75ef; cursor: pointer; margin-right: 8px; white-space: nowrap;";

function validateDateRange() {
  const { startDate, endDate } = filterForm.value;
  if (!startDate || !endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return false;
  }
  if (dayjs(endDate).isBefore(dayjs(startDate), "day")) {
    ElMessage.warning("结束日期不能早于开始日期");
    return false;
  }
  const spanDays = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
  if (spanDays > 90) {
    ElMessage.warning("日期范围不能超过 90 天");
    return false;
  }
  return true;
}

function normalizeRecord(item = {}, index = 0) {
  return {
    ...item,
    id: item.attendanceDate || `punch-record-${index}`,
    supplementTimeText: item.supplementTimeText || "--",
  };
}

function applyPagination() {
  const { pageNo, pageSize } = listQuery.value;
  const start = (pageNo - 1) * pageSize;
  const pageRecords = allRecords.value.slice(start, start + pageSize);
  gridData.value = pageRecords.map((item, index) => ({
    ...item,
    seq: start + index + 1,
  }));
}

async function fetchPunchRecordList() {
  if (!validateDateRange()) {
    return;
  }
  loading.value = true;
  try {
    const res = await queryAttendanceSelfPunchRecordList(
      {
        startDate: filterForm.value.startDate,
        endDate: filterForm.value.endDate,
      },
      { isLoading: false },
    );
    const records = Array.isArray(res?.data) ? res.data : [];
    allRecords.value = records.map((item, index) => normalizeRecord(item, index));
    total.value = allRecords.value.length;

    const maxPage = Math.max(1, Math.ceil(total.value / listQuery.value.pageSize) || 1);
    if (listQuery.value.pageNo > maxPage) {
      listQuery.value.pageNo = maxPage;
    }
    applyPagination();
  } catch (error) {
    allRecords.value = [];
    gridData.value = [];
    total.value = 0;
    ElMessage.error(error?.message || "加载打卡记录失败");
  } finally {
    loading.value = false;
  }
}

function handleDateRangeChange(value) {
  const range = Array.isArray(value) ? value : [];
  filterForm.value.startDate = range[0] || "";
  filterForm.value.endDate = range[1] || "";
}

function handleSearch() {
  listQuery.value.pageNo = 1;
  fetchPunchRecordList();
}

function handlePagination() {
  applyPagination();
}

function resolveActionDate(row, action) {
  return action?.attendanceDate || row?.attendanceDate || "";
}

function handleSupplement(row) {
  const actions = row?.actions || {};
  if (!actions.canSupplement) {
    return;
  }
  const dateText = resolveActionDate(row, actions.supplementAction);
  router.push({
    name: "my-supplement-application",
    query: {
      sourceType: "punch-record",
      ...(dateText ? { sourceDateTime: dateText } : {}),
    },
  });
}

function handleLeave(row) {
  const actions = row?.actions || {};
  if (!actions.canLeave) {
    return;
  }
  const dateText = resolveActionDate(row, actions.leaveAction);
  router.push({
    name: "my-leave-application",
    query: dateText
      ? {
          startTime: dateText,
          endTime: dateText,
        }
      : undefined,
  });
}

function handleBusinessTrip(row) {
  const actions = row?.actions || {};
  if (!actions.canBusinessTrip) {
    return;
  }
  router.push({ path: "/businesstrip-management" });
}

function handleRowAction(attendanceDate, actionType) {
  const row = allRecords.value.find((item) => item.attendanceDate === attendanceDate);
  if (!row) {
    return;
  }
  if (actionType === "supplement") {
    handleSupplement(row);
    return;
  }
  if (actionType === "leave") {
    handleLeave(row);
    return;
  }
  if (actionType === "businessTrip") {
    handleBusinessTrip(row);
  }
}

const cellRenderer = (params) => {
  const field = params.colDef.field;
  if (field === "rowActions") {
    const row = params.data || {};
    const actions = row.actions || {};
    const attendanceDate = row.attendanceDate || "";
    const parts = [];
    if (actions.canSupplement) {
      parts.push(
        `<span style="${ACTION_LINK_STYLE}" onclick="myPunchRecordRowAction('${attendanceDate}', 'supplement')">我要补卡</span>`,
      );
    }
    if (actions.canLeave) {
      parts.push(
        `<span style="${ACTION_LINK_STYLE}" onclick="myPunchRecordRowAction('${attendanceDate}', 'leave')">我要请假</span>`,
      );
    }
    if (actions.canBusinessTrip) {
      parts.push(
        `<span style="${ACTION_LINK_STYLE}" onclick="myPunchRecordRowAction('${attendanceDate}', 'businessTrip')">我要出差</span>`,
      );
    }
    return `<div>${parts.join("")}</div>`;
  }

  let displayValue = params.value || params.value === 0 ? params.value : "";
  if (field === "supplementTimeText" && !displayValue) {
    displayValue = "--";
  }
  return `<span title="${displayValue}">${displayValue}</span>`;
};

onMounted(() => {
  window.myPunchRecordRowAction = handleRowAction;
  fetchPunchRecordList();
});

onUnmounted(() => {
  delete window.myPunchRecordRowAction;
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card box punch-record-card" style="margin-bottom: 0;">
          <div class="card-body punch-record-card__toolbar">
            <div class="punch-record-card__filters">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="punch-record-card__date-range"
                style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                :clearable="false"
                @change="handleDateRangeChange"
              />
              <el-button
                type="primary"
                @click="handleSearch"
              >
                查询
              </el-button>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              :gridName="gridName"
              :height="gridHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :cellRenderer="cellRenderer"
              :isLoading="loading"
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
            />
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.punch-record-card__toolbar {
  padding-bottom: 10px;
}

.punch-record-card__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

:deep(.punch-record-card__date-range.el-date-editor--daterange) {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}
</style>
