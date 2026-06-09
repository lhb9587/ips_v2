<!-- 调班单列表页，单击行可打开调班单详情侧边栏。 -->
<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import { queryScheduleSwapDetail, queryScheduleSwapPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const gridName = "scheduleSwapListGrid";
const DEFAULT_COLUMNS = [
  { title: "序号", value: "sid", width: 70, minWidth: 70, maxWidth: 90 },
  { title: "调出员工编码", value: "sourceTalentCode", minWidth: 120 },
  { title: "调出姓名", value: "sourceTalentName", minWidth: 120 },
  { title: "调出考勤日期", value: "sourceScheduleDate", minWidth: 120 },
  { title: "调入员工编码", value: "targetTalentCode", minWidth: 120 },
  { title: "调入姓名", value: "targetTalentName", minWidth: 120 },
  { title: "调入考勤日期", value: "targetScheduleDate", minWidth: 120 },
  { title: "备注", value: "reason", minWidth: 180 },
  { title: "操作人", value: "operatorName", minWidth: 100 },
  { title: "操作时间", value: "operateTime", minWidth: 170 },
];

const gridHeight = ref(0);
const columnList = ref([...DEFAULT_COLUMNS]);
const rowHeight = ref(40);
const diminput = ref("");
const total = ref(0);
const gridData = ref([]);
const detailVisible = ref(false);
const detailLoading = ref(false);
const selectedDetail = ref({});

const dateTypeLabelMap = {
  workday: "工作日",
  restday: "休息日",
  holiday: "节假日",
};

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

gridHeight.value = calculateGridHeight();

watch(
  () => [store.state.layout.layoutType, store.state.layout.embedMode],
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 10;
  return Math.min(pageSize, 100);
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 20, 50, 100]);

const formatDateType = (value) => dateTypeLabelMap[value] || value || "-";

const parseSnapshot = (snapshot) => {
  if (!snapshot) {
    return {};
  }
  if (typeof snapshot === "object") {
    return snapshot;
  }
  try {
    return JSON.parse(snapshot);
  } catch {
    return {};
  }
};

const pickDisplaySnapshot = (afterSnapshot, beforeSnapshot) => {
  const afterData = parseSnapshot(afterSnapshot);
  if (Object.keys(afterData).length > 0) {
    return afterData;
  }
  return parseSnapshot(beforeSnapshot);
};

const buildDetailFromResponse = (detail = {}, row = {}) => {
  const sourceSnapshot = pickDisplaySnapshot(
    detail.sourceAfterSnapshot,
    detail.sourceBeforeSnapshot,
  );
  const targetSnapshot = pickDisplaySnapshot(
    detail.targetAfterSnapshot,
    detail.targetBeforeSnapshot,
  );

  return {
    swapHistoryId: detail.swapHistoryId || row.swapHistoryId || "",
    reason: detail.reason || row.reason || "-",
    operatorName: detail.operatorName || row.operatorName || "-",
    operateTime: detail.operateTime || row.operateTime || "-",
    source: {
      employeeCode: sourceSnapshot.talentCode || row.sourceTalentCode || "-",
      employeeName: sourceSnapshot.talentName || row.sourceTalentName || "-",
      scheduleDate: sourceSnapshot.scheduleDate || row.sourceScheduleDate || "-",
      dateType: formatDateType(sourceSnapshot.dateType) || row.sourceDateTypeLabel || "-",
      shiftName: sourceSnapshot.shiftName || sourceSnapshot.shiftCode || row.sourceShiftName || "-",
    },
    target: {
      employeeCode: targetSnapshot.talentCode || row.targetTalentCode || "-",
      employeeName: targetSnapshot.talentName || row.targetTalentName || "-",
      scheduleDate: targetSnapshot.scheduleDate || row.targetScheduleDate || "-",
      dateType: formatDateType(targetSnapshot.dateType) || row.targetDateTypeLabel || "-",
      shiftName: targetSnapshot.shiftName || targetSnapshot.shiftCode || row.targetShiftName || "-",
    },
  };
};

const mapSwapRecord = (item = {}, index = 0) => ({
  ...item,
  id:
    item.swapHistoryId ||
    `${item.sourceScheduleDayId || ""}_${item.targetScheduleDayId || ""}_${index}`,
  sourceDateTypeLabel: formatDateType(item.sourceDateType),
  targetDateTypeLabel: formatDateType(item.targetDateType),
});

const fetchScheduleSwapList = () => {
  queryScheduleSwapPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 100),
      talentName: diminput.value || undefined,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      gridData.value = records.map((item, index) => ({
        ...mapSwapRecord(item, index),
        sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
      }));
      total.value = Number(res?.total) || Number(res?.data?.total) || 0;
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const openDetail = (row) => {
  const sourceRow = row?.data || row;
  if (!sourceRow?.swapHistoryId) {
    return;
  }
  detailVisible.value = true;
  detailLoading.value = true;
  queryScheduleSwapDetail(
    {
      swapHistoryId: sourceRow.swapHistoryId,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      selectedDetail.value = buildDetailFromResponse(res?.data || {}, sourceRow);
    })
    .catch(() => {
      selectedDetail.value = buildDetailFromResponse({}, sourceRow);
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchScheduleSwapList();
};

const handlePagination = () => {
  fetchScheduleSwapList();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  fetchScheduleSwapList();
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card box" style="margin-bottom: 0;">
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <div class="d-flex gap-2">
                <el-input
                  v-model="diminput"
                  style="width: 200px"
                  placeholder="请输入员工姓名"
                  clearable
                  class="top-search"
                  @keyup.enter="fuzzySearch"
                >
                  <template #prepend>
                    <el-button @click="fuzzySearch">
                      <i class="bx bx-search-alt"></i>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :cellRenderer="cellRenderer"
              :rowClick="openDetail"
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
      v-if="detailVisible"
      v-model="detailVisible"
      sidebarName="schedule-swap-detail-sidebar"
      :minWidth="760"
      :width="920"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetail"
    >
      <div class="schedule-swap-detail">
        <div class="schedule-swap-detail__header">
          <div>
            <div class="schedule-swap-detail__title">调班单详情</div>
          </div>
          <el-button @click="closeDetail">关闭</el-button>
        </div>

        <div
          v-loading="detailLoading"
          class="schedule-swap-detail__body"
        >
          <section class="detail-panel">
            <div class="detail-grid">
              <div>员工编码</div>
              <div>{{ selectedDetail.source?.employeeCode || "-" }}</div>
              <div>姓名</div>
              <div>{{ selectedDetail.source?.employeeName || "-" }}</div>
              <div>考勤日期</div>
              <div>{{ selectedDetail.source?.scheduleDate || "-" }}</div>
              <div>日期类型</div>
              <div>{{ selectedDetail.source?.dateType || "-" }}</div>
              <div>班次名称</div>
              <div>{{ selectedDetail.source?.shiftName || "-" }}</div>
            </div>
          </section>

          <section class="detail-panel">
            <div class="detail-grid">
              <div>员工编码</div>
              <div>{{ selectedDetail.target?.employeeCode || "-" }}</div>
              <div>姓名</div>
              <div>{{ selectedDetail.target?.employeeName || "-" }}</div>
              <div>考勤日期</div>
              <div>{{ selectedDetail.target?.scheduleDate || "-" }}</div>
              <div>日期类型</div>
              <div>{{ selectedDetail.target?.dateType || "-" }}</div>
              <div>班次名称</div>
              <div>{{ selectedDetail.target?.shiftName || "-" }}</div>
            </div>
          </section>
        </div>
      </div>
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.schedule-swap-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.schedule-swap-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e9edf5;
}

.schedule-swap-detail__title {
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
}

.schedule-swap-detail__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  padding: 24px 28px 32px;
  overflow: auto;
}

.detail-panel {
  padding: 10px 18px 10px 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 18px 16px;
  color: #1f2d49;
  font-size: 14px;
  line-height: 1.7;
}

.detail-grid > div:nth-child(odd) {
  color: #6d7b92;
}

@media (max-width: 960px) {
  .schedule-swap-detail__body {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 88px minmax(0, 1fr);
  }
}
</style>
