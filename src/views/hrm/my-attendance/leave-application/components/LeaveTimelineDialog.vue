<!-- 请假时间轴弹窗，用于展示员工历史请假记录。 -->
<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const currentYear = dayjs().year();
const selectedYear = ref(currentYear);
const monthList = Array.from({ length: 12 }, (_, index) => index + 1);

const yearOptions = computed(() =>
  Array.from({ length: currentYear - 2000 + 1 }, (_, index) => currentYear - index),
);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      selectedYear.value = currentYear;
    }
  },
);

const recordsByMonth = computed(() => {
  const result = monthList.reduce((monthMap, month) => {
    monthMap[month] = [];
    return monthMap;
  }, {});

  props.records.forEach((item) => {
    const applyDate = dayjs(item.applyDate || item.startTime);
    if (!applyDate.isValid() || applyDate.year() !== selectedYear.value) {
      return;
    }
    result[applyDate.month() + 1].push(item);
  });

  return result;
});

const yearRecords = computed(() =>
  monthList.flatMap((month) => recordsByMonth.value[month]),
);

const submittedCount = computed(
  () => yearRecords.value.filter((item) => item.status !== "未提交").length,
);

const statusClass = (status) => {
  const statusMap = {
    未提交: "timeline-record__status--draft",
    审批中: "timeline-record__status--pending",
    已通过: "timeline-record__status--success",
    已驳回: "timeline-record__status--rejected",
    已废弃: "timeline-record__status--discarded",
  };
  return statusMap[status] || "timeline-record__status--draft";
};
</script>

<template>
  <el-dialog
    v-model="visible"
    class="leave-timeline-dialog"
    width="calc(100vw - 56px)"
    top="6vh"
    append-to-body
    destroy-on-close
  >
    <template #header>
      <div class="timeline-dialog__title">请假记录时间轴</div>
    </template>

    <div class="timeline-dialog__body">
      <div class="timeline-dialog__header">
        <div>
          <h3>{{ selectedYear }} 年请假记录</h3>
          <p>按月份横向展示当年请假单据，默认显示当前年份。</p>
          <p>年度记录 {{ yearRecords.length }} 条 已提交 {{ submittedCount }} 条</p>
        </div>
        <el-select
          v-model="selectedYear"
          class="timeline-year-select"
        >
          <el-option
            v-for="year in yearOptions"
            :key="year"
            :label="`${year} 年`"
            :value="year"
          />
        </el-select>
      </div>

      <div class="timeline-scroll">
        <div class="timeline-track">
          <div
            v-for="month in monthList"
            :key="month"
            class="timeline-month"
          >
            <div class="timeline-month__axis">
              <span class="timeline-month__dot"></span>
              <span class="timeline-month__line"></span>
            </div>
            <div class="timeline-month__label">{{ month }}月</div>
            <div class="timeline-month__records">
              <template v-if="recordsByMonth[month].length">
                <div
                  v-for="record in recordsByMonth[month]"
                  :key="record.billNo"
                  class="timeline-record"
                >
                  <div class="timeline-record__name">
                    {{ record.leaveType }} {{ record.duration }}{{ record.unit }}
                  </div>
                  <span :class="['timeline-record__status', statusClass(record.status)]">
                    {{ record.status }}
                  </span>
                </div>
              </template>
              <div
                v-else
                class="timeline-empty"
              >
                本月暂无请假记录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.leave-timeline-dialog) {
  margin-bottom: 0;
}

:deep(.leave-timeline-dialog .el-dialog__header) {
  padding: 16px 18px 4px;
  margin-right: 0;
}

:deep(.leave-timeline-dialog .el-dialog__body) {
  padding: 0 18px 18px;
}

.timeline-dialog__title {
  color: #1a2d4a;
  font-size: 16px;
  font-weight: 500;
}

.timeline-dialog__body {
  color: #122448;
}

.timeline-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.timeline-dialog__header h3 {
  margin: 0 0 8px;
  color: #183052;
  font-size: 14px;
  font-weight: 600;
}

.timeline-dialog__header p {
  margin: 3px 0;
  color: #657590;
  font-size: 12px;
  line-height: 1.4;
}

.timeline-year-select {
  width: 140px;
  flex-shrink: 0;
}

.timeline-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 18px;
}

.timeline-track {
  min-width: 1768px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 12px;
}

.timeline-month {
  min-width: 136px;
}

.timeline-month__axis {
  display: flex;
  align-items: center;
  height: 20px;
}

.timeline-month__dot {
  width: 16px;
  height: 16px;
  border: 4px solid #dbe6ff;
  border-radius: 50%;
  background: #4f7cf2;
  flex-shrink: 0;
}

.timeline-month__line {
  width: 100%;
  height: 2px;
  margin-left: 2px;
  background: #c9d7f4;
}

.timeline-month__label {
  margin: 4px 0 14px;
  color: #1e3354;
  font-size: 14px;
  font-weight: 600;
}

.timeline-month__records {
  display: grid;
  gap: 10px;
}

.timeline-record,
.timeline-empty {
  min-height: 84px;
  padding: 14px 12px;
  border: 1px solid #d9e5f8;
  border-radius: 8px;
  background: #f9fbff;
}

.timeline-record {
  box-shadow: 0 10px 22px rgba(63, 96, 152, 0.08);
}

.timeline-record__name {
  margin-bottom: 10px;
  color: #162947;
  font-size: 14px;
  font-weight: 600;
}

.timeline-record__status {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
}

.timeline-record__status--draft,
.timeline-record__status--discarded {
  color: #7c8798;
}

.timeline-record__status--pending {
  color: #d48716;
}

.timeline-record__status--success {
  color: #3b9b5d;
}

.timeline-record__status--rejected {
  color: #d0443e;
}

.timeline-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  color: #8493ad;
  font-size: 13px;
}

@media (max-width: 768px) {
  .timeline-dialog__header {
    flex-direction: column;
  }

  .timeline-year-select {
    width: 100%;
  }
}
</style>
