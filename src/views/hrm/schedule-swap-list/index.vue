<!-- 调班单列表页，单击行可打开调班单详情侧边栏。 -->
<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import { queryScheduleSwapDetail, queryScheduleSwapPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const gridName = "scheduleSwapListGrid";
const DEFAULT_COLUMNS = [
  { title: "调出员工编码", value: "sourceTalentCode", minWidth: 120 },
  { title: "调出姓名", value: "sourceTalentName", minWidth: 120 },
  { title: "调出考勤日期", value: "sourceScheduleDate", minWidth: 120 },
  { title: "调入员工编码", value: "targetTalentCode", minWidth: 120 },
  { title: "调入姓名", value: "targetTalentName", minWidth: 120 },
  { title: "调入考勤日期", value: "targetScheduleDate", minWidth: 120 },
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
  const pageSize = savedData ? savedData.pageSize : 50;
  return pageSize;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 20, 50, 100]);

const formatDateType = (value) => dateTypeLabelMap[value] || value || "-";

const formatOperateTime = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const target = dayjs(value);
  return target.isValid() ? target.format("YYYY-MM-DD HH:mm") : String(value);
};

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
    operatorName: detail.operatorName || row.operatorName || "-",
    operateTime: formatOperateTime(detail.operateTime || row.operateTime) || "-",
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
  operateTime: formatOperateTime(item.operateTime) || item.operateTime,
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
          <div class="schedule-swap-detail__title">调班单详情</div>
          <el-tooltip
            content="关闭"
            placement="top"
            :teleported="false"
          >
            <div
              class="schedule-swap-detail__close mdi mdi-window-close"
              @click="closeDetail"
            ></div>
          </el-tooltip>
        </div>

        <div
          v-loading="detailLoading"
          class="schedule-swap-detail__body"
        >
          <section class="detail-section">
            <div class="detail-section__title">基本信息</div>
            <div class="detail-grid detail-grid--basic">
              <div class="detail-item">
                <div class="detail-item__label">操作人</div>
                <div class="detail-item__value">{{ selectedDetail.operatorName || "-" }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">操作时间</div>
                <div class="detail-item__value">{{ selectedDetail.operateTime || "-" }}</div>
              </div>
            </div>
          </section>

          <div class="swap-panel-group">
            <section class="swap-panel">
              <div class="swap-panel__title">调班人员信息1</div>
              <div class="swap-panel__card">
                <div class="swap-panel__employee">
                  <span class="swap-panel__name">{{ selectedDetail.source?.employeeName || "-" }}</span>
                  <span class="swap-panel__code">{{ selectedDetail.source?.employeeCode || "-" }}</span>
                </div>
                <div class="swap-panel__grid">
                  <div class="detail-item">
                    <div class="detail-item__label">考勤日期</div>
                    <div class="detail-item__value">{{ selectedDetail.source?.scheduleDate || "-" }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-item__label">日期类型</div>
                    <div class="detail-item__value">{{ selectedDetail.source?.dateType || "-" }}</div>
                  </div>
                  <div class="detail-item swap-panel__item--full">
                    <div class="detail-item__label">班次名称</div>
                    <div class="detail-item__value">{{ selectedDetail.source?.shiftName || "-" }}</div>
                  </div>
                </div>
              </div>
            </section>

            <div
              class="swap-panel__divider"
              aria-hidden="true"
            >
              <i class="bx bx-transfer-alt"></i>
            </div>

            <section class="swap-panel">
              <div class="swap-panel__title">调班人员信息2</div>
              <div class="swap-panel__card">
                <div class="swap-panel__employee">
                  <span class="swap-panel__name">{{ selectedDetail.target?.employeeName || "-" }}</span>
                  <span class="swap-panel__code">{{ selectedDetail.target?.employeeCode || "-" }}</span>
                </div>
                <div class="swap-panel__grid">
                  <div class="detail-item">
                    <div class="detail-item__label">考勤日期</div>
                    <div class="detail-item__value">{{ selectedDetail.target?.scheduleDate || "-" }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-item__label">日期类型</div>
                    <div class="detail-item__value">{{ selectedDetail.target?.dateType || "-" }}</div>
                  </div>
                  <div class="detail-item swap-panel__item--full">
                    <div class="detail-item__label">班次名称</div>
                    <div class="detail-item__value">{{ selectedDetail.target?.shiftName || "-" }}</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
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
  position: relative;
  padding-bottom: 10px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.schedule-swap-detail__title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 68px;
  height: 3px;
  border-radius: 999px;
  background: #4f80c2;
}

.schedule-swap-detail__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.schedule-swap-detail__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 28px;
  padding: 24px 32px 36px;
  overflow: auto;
}

.detail-section {
  display: grid;
  gap: 16px;
}

.detail-section__title {
  color: #1f2d49;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-grid--basic {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 40px;
}

.swap-panel-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
  align-items: stretch;
  gap: 12px;
}

.swap-panel {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.swap-panel__title {
  color: #1f2d49;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.swap-panel__card {
  display: grid;
  gap: 16px;
  height: 100%;
  padding: 18px 20px 20px;
  border: 1px solid #e7edf5;
  border-radius: 10px;
  background: #fbfcfe;
}

.swap-panel__employee {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
  padding-bottom: 14px;
  border-bottom: 1px dashed #e3eaf3;
}

.swap-panel__name {
  color: #1f2d49;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.swap-panel__code {
  color: #6d7b92;
  font-size: 13px;
  line-height: 1.4;
}

.swap-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 24px;
}

.swap-panel__item--full {
  grid-column: 1 / -1;
}

.swap-panel__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #edf5ff;
  color: #4f80c2;
  font-size: 22px;
}

.detail-item {
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.detail-item__label {
  flex: 0 0 72px;
  color: #6d7b92;
  font-size: 14px;
  line-height: 1.7;
}

.detail-item__value {
  flex: 1;
  min-width: 0;
  color: #1f2d49;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

@media (max-width: 960px) {
  .schedule-swap-detail__body {
    padding: 20px 24px 28px;
  }

  .detail-grid--basic,
  .swap-panel__grid {
    grid-template-columns: 1fr;
  }

  .swap-panel-group {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .swap-panel__divider {
    justify-self: center;
    transform: rotate(90deg);
  }

  .detail-item__label {
    flex-basis: 88px;
  }
}
</style>
