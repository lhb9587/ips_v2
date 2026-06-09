<!-- 考勤日历页，展示员工月度统计、月历状态与单日考勤详情。 -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import {
  queryAttendanceCalendarDayDetail,
  queryAttendanceCalendarMonth,
} from "@/api/attendance";

const route = useRoute();
const router = useRouter();

const weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const businessActions = [
  { label: "我要请假", type: "primary", routeName: "my-leave-application" },
  { label: "我要出差", type: "primary", path: "/businesstrip-management" },
  { label: "我要加班", type: "primary", routeName: "my-overtime-application" },
  { label: "我要补卡", type: "primary", routeName: "my-supplement-application" },
];
const statCards = [
  {
    key: "overtimeHours",
    label: "加班小时数",
    unit: "小时",
    icon: "bx bx-time-five",
    tone: "purple",
  },
  {
    key: "leaveDays",
    label: "请假天数",
    unit: "天",
    icon: "bx bx-calendar-minus",
    tone: "blue",
  },
  {
    key: "tripDays",
    label: "出差天数",
    unit: "天",
    icon: "bx bx-briefcase-alt",
    tone: "teal",
  },
  {
    key: "supplementCount",
    label: "补签次数",
    unit: "次",
    icon: "bx bx-calendar-check",
    tone: "green",
  },
  {
    key: "lateCount",
    label: "迟到次数",
    unit: "次",
    icon: "bx bx-timer",
    tone: "yellow",
  },
  {
    key: "earlyLeaveCount",
    label: "早退次数",
    unit: "次",
    icon: "bx bx-stopwatch",
    tone: "orange",
  },
  {
    key: "absentCount",
    label: "旷工次数",
    unit: "次",
    icon: "bx bx-briefcase",
    tone: "red",
  },
];
const approvalSummaryTypes = new Set(["leave", "overtime", "supplement"]);
const statusIconRules = [
  {
    type: "exception",
    icon: "bx bx-error-circle",
    tone: "exception",
  },
  {
    type: "leave",
    icon: "bx bx-calendar-minus",
    summaryKey: "leaveSummary",
    countKey: "leaveDays",
    listRouteName: "my-leave-list",
  },
  {
    type: "overtime",
    icon: "bx bx-time-five",
    summaryKey: "overtimeSummary",
    countKey: "overtimeHours",
    listRouteName: "my-overtime-list",
  },
  {
    type: "trip",
    icon: "bx bx-briefcase-alt",
    summaryKey: "tripSummary",
    countKey: "tripDays",
  },
  {
    type: "supplement",
    icon: "bx bx-calendar-check",
    summaryKey: "supplementSummary",
    countKey: "supplementCount",
    listRouteName: "my-supplement-list",
  },
];

const monthLoading = ref(false);
const detailLoading = ref(false);
const resolveInitialDate = () => {
  const queryDate = String(route.query.date || "").trim();
  if (queryDate && dayjs(queryDate).isValid()) {
    return queryDate;
  }
  return dayjs().format("YYYY-MM-DD");
};
const currentMonth = ref(dayjs(resolveInitialDate()).startOf("month"));
const selectedDate = ref(resolveInitialDate());
const monthData = ref({
  stats: {},
  days: [],
});
const detailData = ref(null);
const detailVisible = ref(true);
let skipSelectedDateWatcher = false;

const selectedMonthValue = computed({
  get: () => currentMonth.value.format("YYYY-MM"),
  set: (value) => {
    if (!value) {
      return;
    }
    const nextMonth = dayjs(`${value}-01`);
    if (nextMonth.isValid()) {
      currentMonth.value = nextMonth.startOf("month");
    }
  },
});

const monthTitle = computed(() => currentMonth.value.format("YYYY年MM月"));

const dayMap = computed(() => {
  const map = new Map();
  (monthData.value.days || []).forEach((item) => {
    map.set(item.attendanceDate, item);
  });
  return map;
});

const calendarDays = computed(() => {
  const monthStart = currentMonth.value.startOf("month");
  const monthEnd = currentMonth.value.endOf("month");
  const startOffset = monthStart.day() === 0 ? 6 : monthStart.day() - 1;
  const endOffset = 7 - (monthEnd.day() === 0 ? 7 : monthEnd.day());
  const startDate = monthStart.subtract(startOffset, "day");
  const totalDays = monthEnd.diff(startDate, "day") + 1 + endOffset;

  return Array.from({ length: totalDays }, (_, index) => {
    const date = startDate.add(index, "day");
    const dateText = date.format("YYYY-MM-DD");
    const snapshot = dayMap.value.get(dateText);
    return {
      date,
      dateText,
      label: date.date(),
      isCurrentMonth: date.isSame(currentMonth.value, "month"),
      isToday: date.isSame(dayjs(), "day"),
      isSelected: dateText === selectedDate.value,
      weekdayLabel: weekLabels[index % 7],
      snapshot,
      icons: resolveDayIcons(snapshot),
    };
  });
});

const selectedSnapshot = computed(() => dayMap.value.get(selectedDate.value) || null);

const statCardsDisplay = computed(() =>
  statCards.map((item) => ({
    ...item,
    display: formatMetricValue(monthData.value.stats?.[item.key], item.unit),
  })),
);

const detailRows = computed(() => {
  const snapshot = detailData.value?.snapshot || selectedSnapshot.value || {};
  const schedule = detailData.value?.schedule || {};
  const actualMinutes = Number(snapshot.actualWorkMinutes || 0);

  return [
    {
      label: "选中日期",
      value: `${selectedDate.value || "--"} / ${formatWeekday(selectedDate.value)}`,
    },
    {
      label: "日期类型",
      value: schedule.dateType || "--",
    },
    {
      label: "排班信息",
      value: buildScheduleText(schedule, snapshot),
    },
    {
      label: "上班打卡",
      value: extractPunchTime(0),
    },
    {
      label: "下班打卡",
      value: extractPunchTime(-1),
    },
    {
      label: "实际工作时间",
      value: actualMinutes ? `${(actualMinutes / 60).toFixed(1)} 小时` : "--",
    },
    {
      label: "考勤异常信息",
      value: String(snapshot.dayStatus || "").trim() || "无异常",
    },
  ];
});

const supplementActionDisabled = computed(() => {
  const canSupplement = detailData.value?.snapshot?.canSupplement ?? selectedSnapshot.value?.canSupplement;
  return Number(canSupplement) !== 1;
});

function normalizeStatValue(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  return value;
}

function formatMetricValue(value, unit) {
  const normalizedValue = normalizeStatValue(value);
  const numericValue = Number(normalizedValue);

  if (Number.isNaN(numericValue)) {
    return {
      value: normalizedValue,
      unit,
    };
  }

  if (numericValue === 0) {
    return {
      value: 0,
      unit,
    };
  }

  return {
    value: normalizedValue,
    unit,
  };
}

function resolveDayIcons(snapshot) {
  if (!snapshot) {
    return [];
  }
  const icons = [];
  const hasException =
    Number(snapshot.lateCount || 0) > 0 ||
    Number(snapshot.earlyLeaveCount || 0) > 0 ||
    Number(snapshot.absentCount || 0) > 0;

  if (hasException) {
    const exceptionRule = statusIconRules.find((item) => item.type === "exception");
    if (exceptionRule) {
      icons.push({
        icon: exceptionRule.icon,
        tone: exceptionRule.tone,
        tooltip: buildExceptionTooltip(snapshot),
      });
    }
  }

  statusIconRules
    .filter((item) => item.type !== "exception")
    .forEach((rule) => {
      if (Number(snapshot[rule.countKey] || 0) <= 0) {
        return;
      }
      const summary = snapshot[rule.summaryKey];
      const summaryList =
        rule.type === "supplement" ? normalizeSummaryList(summary) : null;

      if (summaryList?.length > 1) {
        summaryList.forEach((summaryItem) => {
          icons.push({
            type: rule.type,
            icon: rule.icon,
            tone: resolveApprovalSummaryTone([summaryItem]),
            tooltip: buildSupplementSummaryTooltip(summaryItem),
            routeName: rule.listRouteName,
          });
        });
        return;
      }

      icons.push({
        type: rule.type,
        icon: rule.icon,
        tone: resolveBusinessTone(summary, rule.type),
        tooltip: buildBusinessTooltip(rule.type, summary),
        routeName: rule.listRouteName,
      });
    });

  return icons.slice(0, 4);
}

function normalizeSummaryList(summary) {
  if (summary === null || summary === undefined) {
    return null;
  }
  if (Array.isArray(summary) && summary.length > 0) {
    return summary;
  }
  return null;
}

function resolveApprovalSummaryTone(list) {
  if (!Array.isArray(list) || !list.length) {
    return "exception";
  }
  const statuses = list
    .map((item) => String(item?.status || "").trim())
    .filter(Boolean);
  if (!statuses.length) {
    return "exception";
  }
  if (
    statuses.some((status) =>
      ["未审核", "待审核", "审批中", "待审批", "未提交", "已退回"].some((keyword) =>
        status.includes(keyword),
      ),
    )
  ) {
    return "pending";
  }
  if (
    statuses.every((status) =>
      ["已通过", "审批通过", "已审核", "已生效"].some((keyword) => status.includes(keyword)),
    )
  ) {
    return "success";
  }
  return "exception";
}

function formatSupplementSummaryTime(item = {}) {
  const raw =
    item.attendanceDatetime ||
    item.attendanceDateTime ||
    item.attendanceTime ||
    "";
  if (!raw) {
    return "";
  }
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format("HH:mm") : String(raw);
}

function buildSupplementSummaryTooltip(item = {}) {
  const timeText = formatSupplementSummaryTime(item);
  const status = String(item?.status || "").trim();
  if (timeText && status) {
    return `补卡：${timeText} ${status}`;
  }
  return timeText ? `补卡：${timeText}` : status ? `补卡：${status}` : "补卡";
}

function resolveBusinessTone(summary, type) {
  if (approvalSummaryTypes.has(type)) {
    const list = normalizeSummaryList(summary);
    if (!list) {
      return "exception";
    }
    return resolveApprovalSummaryTone(list);
  }

  const text = String(summary || "").trim();
  if (!text) {
    return "success";
  }
  if (
    text.includes("未审核") ||
    text.includes("待审核") ||
    text.includes("审批中") ||
    text.includes("待审批") ||
    text.includes("未提交")
  ) {
    return "pending";
  }
  if (
    text.includes("已通过") ||
    text.includes("审批通过") ||
    text.includes("已审核") ||
    text.includes("已生效") ||
    text.includes("通过")
  ) {
    return "success";
  }
  return "success";
}

function buildExceptionTooltip(snapshot) {
  const tags = [];
  if (Number(snapshot.lateCount || 0) > 0) {
    tags.push(`迟到 ${snapshot.lateCount} 次`);
  }
  if (Number(snapshot.earlyLeaveCount || 0) > 0) {
    tags.push(`早退 ${snapshot.earlyLeaveCount} 次`);
  }
  if (Number(snapshot.absentCount || 0) > 0) {
    tags.push(`旷工 ${snapshot.absentCount} 次`);
  }
  return tags.join(" / ") || "考勤异常";
}

function buildBusinessTooltip(type, summary) {
  const labelMap = {
    leave: "请假",
    overtime: "加班",
    trip: "出差",
    supplement: "补卡",
  };
  const label = labelMap[type] || "状态";
  if (approvalSummaryTypes.has(type)) {
    const list = normalizeSummaryList(summary);
    if (!list) {
      return label;
    }
    if (type === "supplement") {
      const lines = list
        .map((item) => {
          const timeText = formatSupplementSummaryTime(item);
          const status = String(item?.status || "").trim();
          if (timeText && status) {
            return `${timeText} ${status}`;
          }
          return timeText || status;
        })
        .filter(Boolean);
      if (!lines.length) {
        return label;
      }
      return `${label}：${lines.join(" / ")}`;
    }
    const statuses = [
      ...new Set(
        list
          .map((item) => String(item?.status || "").trim())
          .filter(Boolean),
      ),
    ];
    if (!statuses.length) {
      return label;
    }
    return `${label}：${statuses.join(" / ")}`;
  }
  const text = String(summary || "").trim();
  return text || label;
}

function formatWeekday(value) {
  if (!value) {
    return "--";
  }
  const day = dayjs(value).day();
  const labels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return labels[day] || "--";
}

function buildScheduleText(schedule, snapshot) {
  if (snapshot?.scheduleInfo) {
    return snapshot.scheduleInfo;
  }
  const shiftText = [schedule.shiftCode, schedule.shiftName].filter(Boolean).join(" - ");
  return shiftText || "--";
}

function extractPunchTime(index) {
  const records = detailData.value?.punchRecords || [];
  if (!records.length) {
    return "--";
  }
  const target = index === -1 ? records[records.length - 1] : records[index];
  return target?.punchTime ? dayjs(target.punchTime).format("HH:mm") : "--";
}

async function loadMonthData() {
  monthLoading.value = true;
  try {
    const res = await queryAttendanceCalendarMonth(
      { yearMonth: currentMonth.value.format("YYYY-MM") },
      { isLoading: false },
    );
    monthData.value = {
      stats: res.data?.stats || {},
      days: res.data?.days || [],
    };

    const hasSelectedDateInMonth =
      selectedDate.value &&
      dayjs(selectedDate.value).isSame(currentMonth.value, "month");
    if (!hasSelectedDateInMonth) {
      const fallbackDate = currentMonth.value.isSame(dayjs(), "month")
        ? dayjs().format("YYYY-MM-DD")
        : currentMonth.value.startOf("month").format("YYYY-MM-DD");
      skipSelectedDateWatcher = true;
      selectedDate.value = fallbackDate;
    }

    if (!dayMap.value.has(selectedDate.value)) {
      skipSelectedDateWatcher = true;
      selectedDate.value = currentMonth.value.startOf("month").format("YYYY-MM-DD");
    }
  } finally {
    monthLoading.value = false;
  }
}

async function loadDayDetail() {
  if (!selectedDate.value) {
    return;
  }
  detailLoading.value = true;
  try {
    const res = await queryAttendanceCalendarDayDetail(
      { attendanceDate: selectedDate.value },
      { isLoading: false, showErrorMessage: false },
    );
    detailData.value = res.data || null;
  } catch (error) {
    detailData.value = null;
    ElMessage.warning(error?.message || "单日详情加载失败");
  } finally {
    detailLoading.value = false;
  }
}

async function refreshPage() {
  await loadMonthData();
  await loadDayDetail();
}

function changeMonth(step) {
  currentMonth.value = currentMonth.value.add(step, "month").startOf("month");
}

function selectDay(day) {
  if (!day?.dateText) {
    return;
  }
  if (!detailVisible.value) {
    detailVisible.value = true;
  }
  selectedDate.value = day.dateText;
}

function handleBusinessAction(item) {
  if (item.routeName) {
    router.push({ name: item.routeName });
    return;
  }
  if (item.path) {
    router.push(item.path);
  }
}

function handleDayIconClick(icon) {
  if (!icon.routeName) {
    return;
  }
  router.push({ name: icon.routeName });
}

function resolveSupplementSourceDateTime() {
  const dateText = detailData.value?.attendanceDate || selectedDate.value;
  if (!dateText) {
    return undefined;
  }
  return dayjs(dateText).format("YYYY-MM-DD");
}

function goSupplement() {
  if (supplementActionDisabled.value) {
    return;
  }
  const sourceDateTime = resolveSupplementSourceDateTime();
  router.push({
    name: "my-supplement-application",
    query: {
      sourceType: "calendar",
      ...(sourceDateTime ? { sourceDateTime } : {}),
    },
  });
}

watch(currentMonth, async () => {
  await refreshPage();
});

watch(selectedDate, async () => {
  if (skipSelectedDateWatcher) {
    skipSelectedDateWatcher = false;
    return;
  }
  await loadDayDetail();
});

onMounted(async () => {
  await refreshPage();
});
</script>

<template>
  <Layout>
    <div class="attendance-calendar-page">
      <section class="calendar-toolbar">
        <div class="calendar-toolbar__title">
          <h2>考勤日历</h2>
          <p>查看月度统计、每日考勤状态与单日明细。</p>
        </div>
        <div class="calendar-toolbar__actions">
          <el-button
            v-for="item in businessActions"
            :key="item.label"
            :type="item.type"
            @click="handleBusinessAction(item)"
          >
            {{ item.label }}
          </el-button>
        </div>
      </section>

      <div
        class="calendar-layout"
        :class="{ 'calendar-layout--detail-hidden': !detailVisible }"
        v-loading="monthLoading"
      >
        <aside class="calendar-stats">
          <div class="calendar-stats__header">
            <span>月度统计</span>
          </div>
          <div class="calendar-stats__list">
            <article
              v-for="item in statCardsDisplay"
              :key="item.key"
              class="stats-card"
              :class="`stats-card--${item.tone}`"
            >
              <div class="stats-card__meta">
                <div class="stats-card__icon">
                  <i :class="item.icon"></i>
                </div>
                <div class="stats-card__label">{{ item.label }}</div>
              </div>
              <div class="stats-card__value">
                {{ item.display.value }}<span>{{ item.display.unit }}</span>
              </div>
            </article>
          </div>
        </aside>

        <section class="calendar-board">
          <div class="calendar-board__toolbar">
            <div class="calendar-board__switcher">
              <button type="button" class="switch-btn" @click="changeMonth(-1)">
                <i class="bx bx-chevron-left"></i>
              </button>
              <span class="calendar-board__title">{{ monthTitle }}</span>
              <button type="button" class="switch-btn" @click="changeMonth(1)">
                <i class="bx bx-chevron-right"></i>
              </button>
            </div>
            <el-date-picker
              v-model="selectedMonthValue"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择月份"
              class="calendar-board__picker"
            />
          </div>

          <div class="calendar-weekdays">
            <span v-for="item in weekLabels" :key="item">{{ item }}</span>
          </div>

          <div class="calendar-grid">
            <button
              v-for="day in calendarDays"
              :key="day.dateText"
              type="button"
              class="calendar-cell"
              :class="{
                'calendar-cell--other': !day.isCurrentMonth,
                'calendar-cell--selected': day.isSelected,
                'calendar-cell--today': day.isToday,
              }"
              @click="selectDay(day)"
            >
              <div class="calendar-cell__header">
                <span class="calendar-cell__date">{{ day.label }}</span>
                <span class="calendar-cell__week">{{ day.weekdayLabel }}</span>
              </div>
              <div class="calendar-cell__icons">
                <el-tooltip
                  v-for="(icon, index) in day.icons"
                  :key="`${day.dateText}-${index}`"
                  :content="icon.tooltip"
                  placement="top"
                  :show-after="120"
                >
                  <span
                    class="calendar-status-icon"
                    :class="[
                      `calendar-status-icon--${icon.tone}`,
                      { 'calendar-status-icon--clickable': icon.routeName },
                    ]"
                    @click.stop="handleDayIconClick(icon)"
                  >
                    <i :class="icon.icon"></i>
                  </span>
                </el-tooltip>
              </div>
            </button>
          </div>
        </section>

        <aside v-if="detailVisible" class="calendar-detail" v-loading="detailLoading">
          <div class="calendar-detail__header">
            <span>单日详情</span>
            <button type="button" class="calendar-detail__close" @click="detailVisible = false">
              关闭
            </button>
          </div>

          <div class="calendar-detail__table">
            <div
              v-for="item in detailRows"
              :key="item.label"
              class="detail-row"
            >
              <div class="detail-row__label">{{ item.label }}</div>
              <div class="detail-row__value">{{ item.value }}</div>
            </div>
          </div>

          <div class="calendar-detail__actions">
            <el-button
              type="primary"
              plain
              :disabled="supplementActionDisabled"
              @click="goSupplement"
            >
              我要补签
            </el-button>
          </div>
        </aside>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
:deep(.page-content) {
  padding-top: calc(50px + 16px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f3f6fb;
}

.attendance-calendar-page {
  min-height: calc(100vh - 120px);
  color: #14284b;
}

.calendar-toolbar,
.calendar-stats,
.calendar-board,
.calendar-detail {
  border: 1px solid #dce5f1;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(42, 78, 136, 0.06);
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.calendar-toolbar__title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.calendar-toolbar__title p {
  margin: 6px 0 0;
  color: #687993;
  font-size: 13px;
}

.calendar-toolbar__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.calendar-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 350px;
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

.calendar-layout--detail-hidden {
  grid-template-columns: 280px minmax(0, 1fr);
}

.calendar-stats__header,
.calendar-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #e4ebf5;
  font-size: 16px;
  font-weight: 600;
}

.calendar-stats__list {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.stats-card {
  display: flex;
  flex-direction: column;
  padding: 14px 14px 12px;
  border: 1px solid #dfE7f1;
  border-radius: 14px;
}

.stats-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-card__icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  color: #22395d;
  font-size: 18px;
}

.stats-card__label {
  color: #48617f;
  font-size: 13px;
  line-height: 1.4;
}

.stats-card__value {
  margin-top: auto;
  align-self: flex-end;
  color: #16315d;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  text-align: right;
}

.stats-card__value span {
  margin-left: 4px;
  font-size: 16px;
  font-weight: 600;
}

.stats-card--purple {
  background: linear-gradient(135deg, #f4f0ff 0%, #eef2ff 100%);
}

.stats-card--blue {
  background: linear-gradient(135deg, #edf4ff 0%, #e8f0ff 100%);
}

.stats-card--teal {
  background: linear-gradient(135deg, #ebfbf7 0%, #e3f6f7 100%);
}

.stats-card--green {
  background: linear-gradient(135deg, #eef9ed 0%, #e6f6e8 100%);
}

.stats-card--yellow {
  background: linear-gradient(135deg, #fff9e7 0%, #fff4cf 100%);
}

.stats-card--orange {
  background: linear-gradient(135deg, #fff2e3 0%, #ffe8c7 100%);
}

.stats-card--red {
  background: linear-gradient(135deg, #fff0f0 0%, #ffe3e3 100%);
}

.calendar-board {
  padding: 18px 20px 22px;
}

.calendar-board__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.calendar-board__switcher {
  display: flex;
  align-items: center;
  gap: 14px;
}

.switch-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #dce5f1;
  border-radius: 50%;
  background: #fff;
  color: #5877e8;
  font-size: 20px;
  line-height: 1;
}

.calendar-board__title {
  color: #16315d;
  font-size: 18px;
  font-weight: 700;
}

.calendar-board__picker {
  width: 220px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;
  padding: 0 4px;
  color: #4c6382;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.calendar-cell {
  min-height: 116px;
  padding: 12px 10px;
  border: 1px solid #dce5f1;
  border-radius: 16px;
  background: #fff;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.calendar-cell:hover {
  border-color: #8ca8ff;
  box-shadow: 0 8px 20px rgba(74, 110, 214, 0.12);
  transform: translateY(-1px);
}

.calendar-cell--other {
  background: #f6f8fc;
  color: #9aabbe;
}

.calendar-cell--selected {
  border-color: #4679f5;
  box-shadow: inset 0 0 0 2px rgba(70, 121, 245, 0.12);
  background: linear-gradient(180deg, #eff5ff 0%, #f7faff 100%);
}

.calendar-cell--today .calendar-cell__date {
  color: #4679f5;
}

.calendar-cell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.calendar-cell__date {
  color: #17315e;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.calendar-cell__week {
  color: #5c7290;
  font-size: 14px;
}

.calendar-cell__icons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 48px;
}

.calendar-status-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.calendar-status-icon--exception,
.calendar-status-icon--pending {
  background: #ffe4e4;
  color: #dd6363;
}

.calendar-status-icon--success {
  background: #e1f6e8;
  color: #42a964;
}

.calendar-status-icon--clickable {
  cursor: pointer;
}

.calendar-detail {
  overflow: hidden;
}

.calendar-detail__close {
  border: 0;
  background: transparent;
  color: #4f79f0;
  font-size: 14px;
}

.calendar-detail__table {
  padding: 20px;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
}

.detail-row__label,
.detail-row__value {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #e2e8f2;
  border-top: 0;
  font-size: 14px;
}

.detail-row:first-child .detail-row__label,
.detail-row:first-child .detail-row__value {
  border-top: 1px solid #e2e8f2;
}

.detail-row__label {
  background: #f4f7fb;
  color: #42587b;
  font-weight: 600;
}

.detail-row__value {
  color: #1b345d;
  word-break: break-all;
}

.calendar-detail__actions {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
}

@media (max-width: 1880px) {
  .calendar-layout {
    grid-template-columns: 200px minmax(0, 1fr) 350px;
  }

  .calendar-layout--detail-hidden {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .calendar-cell__date {
    font-size: 26px;
  }
}

@media (max-width: 1480px) {
  .calendar-layout {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .calendar-detail {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1024px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }

  .calendar-board__toolbar,
  .calendar-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .calendar-toolbar__actions,
  .calendar-detail__actions {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-right: 12px !important;
    padding-left: 12px !important;
  }

  .calendar-grid {
    gap: 8px;
  }

  .calendar-cell {
    min-height: 96px;
    padding: 10px 8px;
  }

  .calendar-cell__date {
    font-size: 22px;
  }

  .calendar-cell__week {
    font-size: 12px;
  }

  .calendar-cell__icons {
    margin-top: 36px;
  }

  .detail-row {
    grid-template-columns: 120px minmax(0, 1fr);
  }
}
</style>
