<!-- 考勤档案历史页，展示指定档案的历史变更卡片与分页信息。 -->
<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import Pagination from "@/components/common/pagination/index.vue";
import { queryAttendanceArchiveHistoryPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const pageTitle = "档案历史";
const archiveId = computed(() => route.query.archiveId || "");
const loading = ref(false);
const historyList = ref([]);
const total = ref(0);

const calculateContentHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 236;
  }
  return windowHeight - 282;
};

const contentHeight = ref(calculateContentHeight());

watch(
  () => store.state.layout.layoutType,
  () => {
    contentHeight.value = calculateContentHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  return savedData ? savedData.pageSize : 10;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});

const pageSizesList = ref([10, 20, 50, 100]);

const changeTypeTextMap = {
  create: "创建",
  update: "编辑",
  enable: "启用",
  disable: "禁用",
  delete: "删除",
  batch_assign: "批量赋值",
  batch_create_by_default: "批量建档",
};

const yesNoTextMap = {
  0: "否",
  1: "是",
};

const statusTextMap = {
  0: "禁用",
  1: "启用",
};

const safeParseSnapshot = (value) => {
  if (!value) {
    return {};
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

const formatDisplayValue = (value, fallback = "-") => {
  return value || value === 0 ? value : fallback;
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }
  const target = dayjs(value);
  return target.isValid() ? target.format("YYYY-MM-DD HH:mm:ss") : formatDisplayValue(value);
};

const resolveHistorySnapshot = (record) => {
  const afterSnapshot = safeParseSnapshot(record.afterSnapshot);
  const beforeSnapshot = safeParseSnapshot(record.beforeSnapshot);
  return Object.keys(afterSnapshot).length ? afterSnapshot : beforeSnapshot;
};

const formatYesNoValue = (value) => {
  if (value === 0 || value === 1 || value === "0" || value === "1") {
    return yesNoTextMap[Number(value)];
  }
  return formatDisplayValue(value);
};

const formatStatusValue = (value) => {
  if (value === 0 || value === 1 || value === "0" || value === "1") {
    return statusTextMap[Number(value)];
  }
  return formatDisplayValue(value);
};

const formatHistoryCard = (record, index) => {
  const snapshot = resolveHistorySnapshot(record);
  return {
    ...record,
    sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
    snapshot,
    changeTypeText: changeTypeTextMap[record.changeType] || formatDisplayValue(record.changeType),
    operatorNameText: formatDisplayValue(record.operatorName),
    createTimeText: formatDateTime(record.createTime),
    employeeCode: formatDisplayValue(snapshot.talentCode || record.talentCode),
    employeeName: formatDisplayValue(snapshot.talentName),
    organizationName: formatDisplayValue(snapshot.attendanceOrgName || snapshot.attendanceOrgCode),
    attendanceNo: formatDisplayValue(snapshot.attendanceNo),
    attendanceSystem: formatDisplayValue(
      snapshot.attendancePolicyName || snapshot.attendancePolicyCode,
    ),
    holidaySystem: formatDisplayValue(snapshot.leavePolicyName || snapshot.leavePolicyCode),
    defaultShift: formatDisplayValue(snapshot.defaultShiftName || snapshot.defaultShiftCode),
    isPunchAttendance: formatYesNoValue(snapshot.isPunchAttendance),
    isAutoSchedule: formatYesNoValue(snapshot.isAutoSchedule),
    scheduleMode: formatDisplayValue(snapshot.scheduleMode),
    statusText: formatStatusValue(snapshot.status),
    entryDate: formatDisplayValue(snapshot.entryDate),
    regularDate: formatDisplayValue(snapshot.regularDate),
    resignDate: formatDisplayValue(snapshot.resignDate),
    remark: formatDisplayValue(record.remark),
  };
};

const fetchHistoryList = () => {
  if (!archiveId.value) {
    historyList.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  queryAttendanceArchiveHistoryPage(
    {
      archiveId: archiveId.value,
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 100),
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      historyList.value = records.map((item, index) => formatHistoryCard(item, index));
      total.value = Number(res?.total || 0);
    })
    .catch(() => {
      historyList.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

const handlePagination = () => {
  fetchHistoryList();
};

watch(
  () => archiveId.value,
  () => {
    listQuery.value.pageNo = 1;
    fetchHistoryList();
  },
);

onMounted(() => {
  fetchHistoryList();
});
</script>

<template>
  <Layout>
    <div class="attendance-profile-history-page">
      <section class="history-hero card">
        <div class="history-hero__content">
          <h1 class="history-hero__title">{{ pageTitle }}</h1>
          <div class="history-hero__meta">
            <span class="history-hero__meta-item">档案ID：{{ archiveId || "-" }}</span>
            <span class="history-hero__meta-item">历史记录：{{ total }}</span>
          </div>
        </div>
      </section>

      <section
        v-loading="loading"
        class="history-content card"
        :style="{ minHeight: `${contentHeight}px` }"
      >
        <template v-if="historyList.length">
          <article
            v-for="item in historyList"
            :key="item.historyId || `${item.archiveId}-${item.sid}`"
            class="history-card"
          >
            <header class="history-card__header">
              <div class="history-card__title-wrap">
                <div class="history-card__index">#{{ item.sid }}</div>
                <div>
                  <div class="history-card__title">{{ item.changeTypeText }}</div>
                  <div class="history-card__sub">
                    操作人：{{ item.operatorNameText }} ｜ 操作时间：{{ item.createTimeText }}
                  </div>
                </div>
              </div>
              <div class="history-card__status">{{ item.statusText }}</div>
            </header>

            <div class="history-card__grid">
              <div class="history-field">
                <span class="history-field__label">员工编码</span>
                <span class="history-field__value">{{ item.employeeCode }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">员工姓名</span>
                <span class="history-field__value">{{ item.employeeName }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">组织</span>
                <span class="history-field__value">{{ item.organizationName }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">考勤编号</span>
                <span class="history-field__value">{{ item.attendanceNo }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">考勤制度</span>
                <span class="history-field__value">{{ item.attendanceSystem }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">假期制度</span>
                <span class="history-field__value">{{ item.holidaySystem }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">是否打卡考勤</span>
                <span class="history-field__value">{{ item.isPunchAttendance }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">是否自动排班</span>
                <span class="history-field__value">{{ item.isAutoSchedule }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">默认班次</span>
                <span class="history-field__value">{{ item.defaultShift }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">排班模式</span>
                <span class="history-field__value">{{ item.scheduleMode }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">入职日期</span>
                <span class="history-field__value">{{ item.entryDate }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">转正日期</span>
                <span class="history-field__value">{{ item.regularDate }}</span>
              </div>
              <div class="history-field">
                <span class="history-field__label">离职日期</span>
                <span class="history-field__value">{{ item.resignDate }}</span>
              </div>
              <div class="history-field history-field--wide">
                <span class="history-field__label">备注</span>
                <span class="history-field__value">{{ item.remark }}</span>
              </div>
            </div>
          </article>
        </template>

        <el-empty
          v-else
          description="暂无档案历史"
        />
      </section>

      <section
        v-if="total > 0"
        class="history-pagination card"
      >
        <Pagination
          :total="total"
          v-model:page="listQuery.pageNo"
          v-model:limit="listQuery.pageSize"
          :pageSizes="pageSizesList"
          :storage="false"
          storageName="attendanceProfileHistoryPage"
          @pagination="handlePagination"
        />
      </section>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
:deep(.page-content) {
  padding-top: calc(50px + 24px) !important;
  padding-right: 16px !important;
  padding-bottom: 20px !important;
  padding-left: 16px !important;
  background:
    radial-gradient(circle at top right, rgba(79, 127, 193, 0.14), transparent 24%),
    linear-gradient(180deg, #f4f7fb 0%, #eef3f8 100%);
}

.attendance-profile-history-page {
  display: grid;
  gap: 16px;
}

.card {
  border: 1px solid #dce6f2;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 36px rgba(63, 91, 137, 0.08);
  backdrop-filter: blur(8px);
}

.history-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 28px;
}

.history-hero__content {
  display: grid;
  gap: 10px;
}

.history-hero__eyebrow {
  color: #4f7fc1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.history-hero__title {
  margin: 0;
  color: #1f2d49;
  font-size: 28px;
  font-weight: 700;
}

.history-hero__desc {
  max-width: 760px;
  margin: 0;
  color: #5f6f89;
  font-size: 14px;
  line-height: 1.75;
}

.history-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.history-hero__meta-item {
  padding: 8px 14px;
  border-radius: 999px;
  background: #f2f6fc;
  color: #37507c;
  font-size: 13px;
}

.history-content {
  padding: 20px;
}

.history-card {
  padding: 22px 24px;
  border: 1px solid #e4ecf6;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.history-card + .history-card {
  margin-top: 18px;
}

.history-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid #edf2f8;
}

.history-card__title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.history-card__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 52px;
  padding: 0 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2f4f85 0%, #5b88cb 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(79, 127, 193, 0.24);
}

.history-card__title {
  color: #1d2c46;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.history-card__sub {
  margin-top: 6px;
  color: #6d7b92;
  font-size: 13px;
  line-height: 1.6;
}

.history-card__status {
  padding: 7px 14px;
  border-radius: 999px;
  background: #edf4ff;
  color: #3f68a8;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.history-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 32px;
}

.history-field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.history-field--wide {
  grid-column: 1 / -1;
}

.history-field__label {
  color: #7a879d;
  font-size: 13px;
}

.history-field__value {
  color: #1f2d49;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-all;
}

.history-pagination {
  padding: 12px 20px;
}

@media (max-width: 1200px) {
  .history-card__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .history-hero,
  .history-card__header {
    flex-direction: column;
  }

  .history-content {
    padding: 14px;
  }

  .history-card {
    padding: 18px;
  }

  .history-card__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
