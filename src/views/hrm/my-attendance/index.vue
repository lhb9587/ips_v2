<!-- 我的考勤首页，展示员工自助考勤工作台与常用入口。 -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import { queryAttendanceSelfStatistics } from "@/api/attendance";

const router = useRouter();

const quickEntries = [
  {
    label: "我要请假",
    icon: "bx bx-file",
    routeName: "my-leave-application",
  },
  {
    label: "我要补卡",
    icon: "bx bx-id-card",
    routeName: "my-supplement-application",
  },
  {
    label: "我要加班",
    icon: "bx bx-briefcase-alt-2",
    routeName: "my-overtime-application",
  },
  {
    label: "我要出差",
    icon: "bx bx-briefcase",
    path: "/businesstrip-management",
  },
  {
    label: "考勤日历",
    icon: "bx bx-calendar",
    routeName: "my-attendance-calendar",
  },
  {
    label: "打卡记录",
    icon: "bx bx-time-five",
    routeName: "my-punch-record",
  },
];

const statsLoading = ref(false);
const todoStats = ref({
  myWaitingLeaderApproveCount: 0,
  myPendingApproveCount: 0,
});
const yesterdayAttendance = ref({
  attendanceDate: "",
  shiftName: "",
  shiftStartTime: "",
  shiftEndTime: "",
  workTimeRange: "",
  actualWorkHours: 0,
  absentHours: 0,
});
const monthAttendance = ref({
  month: "",
  overtimeHours: 0,
  exceptionCount: 0,
});
const annualLeave = ref({
  year: null,
  leaveTypeCode: "",
  leaveTypeName: "",
  annualQuota: 0,
  remainQuota: 0,
  frozenQuota: 0,
});
const directLeaders = ref([]);

const primaryDirectLeader = computed(() => {
  const leader = directLeaders.value[0];
  if (!leader) {
    return null;
  }
  return {
    name: leader.leaderTalentName || "--",
    empStatus: leader.leaderEmpStatus || "",
  };
});

const yesterdayGauge = computed(() => {
  const absentHours = Number(yesterdayAttendance.value.absentHours || 0);
  const actualWorkHours = Number(yesterdayAttendance.value.actualWorkHours || 0);

  if (absentHours > 0) {
    return {
      label: "旷工",
      hours: formatHours(absentHours),
      tone: "danger",
    };
  }

  if (actualWorkHours > 0) {
    return {
      label: "出勤",
      hours: formatHours(actualWorkHours),
      tone: "success",
    };
  }

  return {
    label: "无数据",
    hours: "0",
    tone: "muted",
  };
});

const yesterdayShiftStart = computed(
  () =>
    yesterdayAttendance.value.shiftStartTime ||
    parseWorkTimeRange(yesterdayAttendance.value.workTimeRange).start ||
    "--",
);

const yesterdayShiftEnd = computed(
  () =>
    yesterdayAttendance.value.shiftEndTime ||
    parseWorkTimeRange(yesterdayAttendance.value.workTimeRange).end ||
    "--",
);

const annualLeaveText = computed(() => {
  const remainQuota = Number(annualLeave.value.remainQuota || 0);
  const annualQuota = Number(annualLeave.value.annualQuota || 0);

  if (remainQuota > 0) {
    return `剩余年假 ${formatQuota(remainQuota)} 天`;
  }

  if (annualQuota > 0) {
    return "年假已用完";
  }

  return "无剩余年假";
});

function formatHours(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "0";
  }
  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2).replace(/\.?0+$/, "");
}

function formatQuota(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "0";
  }
  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2).replace(/\.?0+$/, "");
}

function parseWorkTimeRange(workTimeRange) {
  const text = String(workTimeRange || "").trim();
  if (!text.includes("-")) {
    return { start: "", end: "" };
  }
  const [start, end] = text.split("-");
  return {
    start: String(start || "").trim(),
    end: String(end || "").trim(),
  };
}

async function loadStatistics() {
  statsLoading.value = true;
  try {
    const res = await queryAttendanceSelfStatistics({}, { isLoading: false });
    const data = res?.data || {};

    todoStats.value = {
      myWaitingLeaderApproveCount: Number(data.todo?.myWaitingLeaderApproveCount || 0),
      myPendingApproveCount: Number(data.todo?.myPendingApproveCount || 0),
    };
    yesterdayAttendance.value = {
      attendanceDate: data.yesterdayAttendance?.attendanceDate || "",
      shiftName: data.yesterdayAttendance?.shiftName || "",
      shiftStartTime: data.yesterdayAttendance?.shiftStartTime || "",
      shiftEndTime: data.yesterdayAttendance?.shiftEndTime || "",
      workTimeRange: data.yesterdayAttendance?.workTimeRange || "",
      actualWorkHours: Number(data.yesterdayAttendance?.actualWorkHours || 0),
      absentHours: Number(data.yesterdayAttendance?.absentHours || 0),
    };
    monthAttendance.value = {
      month: data.monthAttendance?.month || "",
      overtimeHours: Number(data.monthAttendance?.overtimeHours || 0),
      exceptionCount: Number(data.monthAttendance?.exceptionCount || 0),
    };
    annualLeave.value = {
      year: data.annualLeave?.year ?? null,
      leaveTypeCode: data.annualLeave?.leaveTypeCode || "",
      leaveTypeName: data.annualLeave?.leaveTypeName || "",
      annualQuota: Number(data.annualLeave?.annualQuota || 0),
      remainQuota: Number(data.annualLeave?.remainQuota || 0),
      frozenQuota: Number(data.annualLeave?.frozenQuota || 0),
    };
    directLeaders.value = Array.isArray(data.directLeaders)
      ? data.directLeaders
      : [];
  } catch (error) {
    ElMessage.error(error?.message || "加载考勤统计失败");
  } finally {
    statsLoading.value = false;
  }
}

const handleQuickEntry = (item) => {
  if (item.routeName) {
    router.push({ name: item.routeName });
    return;
  }
  if (item.path) {
    router.push(item.path);
    return;
  }
  ElMessage.info("该功能暂未开放");
};

const goAttendanceCalendar = (date) => {
  router.push({
    name: "my-attendance-calendar",
    query: date ? { date } : undefined,
  });
};

const goApprovalCenter = (tab = "pending") => {
  router.push({
    name: "approval-center",
    query: { tab },
  });
};

onMounted(() => {
  loadStatistics();
});
</script>

<template>
  <Layout>
    <div v-loading="statsLoading" class="attendance-page">
      <div class="attendance-shell">
        <section class="attendance-card shortcut-card">
          <div class="section-title">常用入口</div>
          <div class="shortcut-grid">
            <button
              v-for="item in quickEntries"
              :key="item.label"
              type="button"
              class="shortcut-item"
              :class="{ 'shortcut-item--active': item.routeName || item.path }"
              @click="handleQuickEntry(item)"
            >
              <span class="shortcut-item__icon">
                <i :class="item.icon"></i>
              </span>
              <span class="shortcut-item__text">{{ item.label }}</span>
            </button>
          </div>
        </section>

        <div class="attendance-stats-grid">
          <article class="attendance-card main-card pending-card">
            <div class="section-title">我的待办/申请</div>
            <div class="pending-card__body">
              <button
                type="button"
                class="pending-card__item"
                @click="goApprovalCenter('pending')"
              >
                <span class="pending-card__label">我的待办</span>
                <strong class="pending-card__value">{{
                  todoStats.myPendingApproveCount
                }}</strong>
              </button>
              <button
                type="button"
                class="pending-card__item"
                @click="goApprovalCenter('mine')"
              >
                <span class="pending-card__label">我的申请</span>
                <strong class="pending-card__value">{{
                  todoStats.myWaitingLeaderApproveCount
                }}</strong>
              </button>
            </div>
            <div class="pending-card__leader">
              <span class="pending-card__leader-label">直接上级</span>
              <span class="pending-card__leader-name">
                {{ primaryDirectLeader?.name || "--" }}
              </span>
              <span
                v-if="
                  primaryDirectLeader?.empStatus &&
                  primaryDirectLeader.empStatus !== '在职'
                "
                class="pending-card__leader-status"
              >
                {{ primaryDirectLeader.empStatus }}
              </span>
            </div>
          </article>

          <article class="attendance-card main-card yesterday-card">
            <div class="section-title">昨日出勤</div>
            <div class="yesterday-card__body">
              <div class="attendance-gauge">
                <svg viewBox="0 0 240 140" aria-hidden="true">
                  <path
                    d="M40 118a80 80 0 0 1 160 0"
                    fill="none"
                    stroke="#edf1f7"
                    stroke-linecap="round"
                    stroke-width="12"
                  />
                  <path
                    d="M40 118a80 80 0 0 1 126-64"
                    fill="none"
                    :stroke="
                      yesterdayGauge.tone === 'danger'
                        ? '#dd6178'
                        : yesterdayGauge.tone === 'success'
                          ? '#5d86f6'
                          : '#c5cedb'
                    "
                    stroke-linecap="round"
                    stroke-width="12"
                  />
                </svg>
                <div class="attendance-gauge__text">
                  <span>{{ yesterdayGauge.label }}</span>
                  <strong>{{ yesterdayGauge.hours }}</strong>
                  <span>小时</span>
                </div>
              </div>
              <div class="attendance-date-card">
                <div class="attendance-date-card__row">
                  <span>{{ yesterdayAttendance.attendanceDate || "--" }}</span>
                  <button
                    type="button"
                    class="text-link-button text-link-button--interactive"
                    @click="goAttendanceCalendar(yesterdayAttendance.attendanceDate)"
                  >
                    详情
                  </button>
                </div>
                <div class="attendance-date-card__time">
                  <span>{{ yesterdayShiftStart }}</span>
                  <span>{{ yesterdayShiftEnd }}</span>
                </div>
              </div>
            </div>
          </article>

          <article class="attendance-card main-card status-card">
            <div class="section-title">当月出勤</div>
            <div class="status-card__body">
              <div class="status-item">
                <span class="status-item__icon status-item__icon--blue">
                  <i class="bx bx-briefcase-alt-2"></i>
                </span>
                <div class="status-item__value">
                  <span>加班</span>
                  <strong>{{ formatHours(monthAttendance.overtimeHours) }}</strong>
                  <span>小时</span>
                </div>
              </div>
              <div class="status-item">
                <span class="status-item__icon status-item__icon--red">
                  <i class="bx bx-error-circle"></i>
                </span>
                <div class="status-item__value">
                  <span>异常</span>
                  <strong>{{ monthAttendance.exceptionCount }}</strong>
                  <span>次</span>
                </div>
              </div>
            </div>
            <div class="card-link-row">
              <button
                type="button"
                class="text-link-button text-link-button--interactive"
                @click="goAttendanceCalendar()"
              >
                详情
              </button>
            </div>
          </article>

          <article class="attendance-card main-card leave-card">
            <div class="section-title">我的年假</div>
            <div class="leave-card__body">
              <div class="leave-illustration">
                <svg viewBox="0 0 220 140" aria-hidden="true">
                  <path d="M36 112a74 74 0 0 1 148 0" fill="#eef4ff" />
                  <circle cx="78" cy="44" r="14" fill="#f9d8df" />
                  <circle cx="80" cy="44" r="6" fill="#d9687b" />
                  <rect
                    x="84"
                    y="52"
                    width="64"
                    height="12"
                    rx="6"
                    fill="#d8e6ff"
                  />
                  <path
                    d="M84 112V72c0-18 14-32 32-32s32 14 32 32v40"
                    fill="#7ea5ff"
                  />
                  <path d="M120 88l16 12h-16V88Z" fill="#5472e4" />
                  <rect
                    x="142"
                    y="48"
                    width="22"
                    height="54"
                    rx="11"
                    fill="#8bd0b0"
                  />
                  <rect
                    x="148"
                    y="48"
                    width="12"
                    height="54"
                    rx="6"
                    fill="#5ab789"
                  />
                  <rect
                    x="160"
                    y="66"
                    width="4"
                    height="50"
                    rx="2"
                    fill="#d1a26e"
                  />
                </svg>
              </div>
              <div class="leave-card__text">{{ annualLeaveText }}</div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.page-content) {
  padding-top: calc(50px + 24px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f5f7fb;
}

.attendance-page {
  min-height: calc(100vh - 120px);
}

.attendance-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.attendance-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.attendance-card {
  background: #fff;
  border: 1px solid #dce6f2;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(72, 101, 146, 0.08);
}

.main-card {
  display: flex;
  flex-direction: column;
  padding: 14px 18px 16px;
  min-height: 220px;
}

.shortcut-card {
  padding: 18px 24px 22px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #dfe8f3;
  color: #22304f;
  font-size: 18px;
  font-weight: 500;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 20px 16px;
  margin-top: -2px;
}

.shortcut-item {
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #314363;
  cursor: default;
}

.shortcut-item--active {
  cursor: pointer;
}

.shortcut-item--active:hover .shortcut-item__icon {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(71, 108, 214, 0.16);
}

.shortcut-item__icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shortcut-item:nth-child(6n + 1) .shortcut-item__icon {
  background: #e2f7f9;
  color: #57a7bf;
}

.shortcut-item:nth-child(6n + 2) .shortcut-item__icon {
  background: #fde8f0;
  color: #df718e;
}

.shortcut-item:nth-child(6n + 3) .shortcut-item__icon {
  background: #e6ecff;
  color: #6b86f3;
}

.shortcut-item:nth-child(6n + 4) .shortcut-item__icon {
  background: #e8ecff;
  color: #7e95ff;
}

.shortcut-item:nth-child(6n + 5) .shortcut-item__icon {
  background: #e3f1ff;
  color: #5d93e8;
}

.shortcut-item:nth-child(6n + 6) .shortcut-item__icon {
  background: #fff1d5;
  color: #d79a2c;
}

.shortcut-item__text {
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.pending-card__body,
.leave-card__body,
.yesterday-card__body {
  flex: 1;
  min-height: 0;
}

.pending-card__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.pending-card__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e3ebf6;
  border-radius: 4px;
  background: #f8faff;
  color: #314363;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pending-card__item:hover {
  border-color: #b8ccf7;
  box-shadow: 0 4px 12px rgba(71, 108, 214, 0.1);
}

.pending-card__label {
  font-size: 14px;
  font-weight: 500;
}

.pending-card__value {
  color: #4b73ee;
  font-size: 30px;
  line-height: 1;
  font-weight: 400;
}

.pending-card__leader {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  border-top: 1px solid #e3ebf6;
  color: #314363;
  font-size: 13px;
}

.pending-card__leader-label {
  flex-shrink: 0;
  color: #70819f;
}

.pending-card__leader-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #22304f;
  font-weight: 500;
}

.pending-card__leader-status {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 2px;
  background: #f5f0e8;
  color: #b07a2a;
  font-size: 12px;
}

.yesterday-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.attendance-gauge {
  position: relative;
  max-width: 220px;
  margin: 0 auto;
}

.attendance-gauge svg {
  width: 100%;
  display: block;
}

.attendance-gauge__text {
  position: absolute;
  inset: 30px 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  color: #22304f;
  font-size: 14px;
}

.attendance-gauge__text strong {
  color: #1f3160;
  font-size: 22px;
  font-weight: 600;
}

.attendance-date-card {
  background: #f5f8fd;
  border-radius: 2px;
  overflow: hidden;
}

.attendance-date-card__row,
.attendance-date-card__time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  color: #30415e;
  font-size: 14px;
}

.attendance-date-card__row {
  border-bottom: 1px solid #dde7f2;
}

.text-link-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #4d75ef;
  font-size: 14px;
  text-decoration: none;
  cursor: default;
}

.text-link-button--interactive {
  cursor: pointer;
}

.attendance-date-card__time {
  color: #70819f;
  font-size: 13px;
}

.status-card__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  flex: 1;
  align-items: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.status-item__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.status-item__icon--blue {
  background: #e6ecff;
  color: #5d7ef1;
}

.status-item__icon--red {
  background: #fde7e5;
  color: #e17c72;
}

.status-item__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: #334364;
  font-size: 14px;
}

.status-item__value strong {
  color: #4b73ee;
  font-size: 30px;
  line-height: 1;
  font-weight: 400;
}

.card-link-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.leave-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.leave-illustration {
  width: min(190px, 100%);
}

.leave-illustration svg {
  width: 100%;
  display: block;
}

.leave-card__text {
  color: #22304f;
  font-size: 15px;
}

@media (max-width: 1200px) {
  .attendance-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shortcut-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-top: calc(50px + 24px) !important;
    padding-right: 12px !important;
    padding-bottom: 12px !important;
    padding-left: 12px !important;
  }

  .attendance-stats-grid {
    grid-template-columns: 1fr;
  }

  .main-card,
  .shortcut-card {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 12px;
  }

  .status-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
