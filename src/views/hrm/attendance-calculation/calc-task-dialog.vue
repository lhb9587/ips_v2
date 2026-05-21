<!-- 考勤计算后台任务弹窗，按时间范围分页展示计算任务卡片列表。 -->
<script setup>
import dayjs from "dayjs";
import { computed, reactive, ref, watch, defineProps, defineEmits} from "vue";
import Pagination from "@/components/common/pagination/index.vue";
import Tabs from "@/components/common/tabs/index.vue";
import { queryAttendanceCalcTaskPage } from "@/api/attendance";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const TAB_MAP = {
  mine: { label: "我创建的", queryMode: "mine" },
  all: { label: "其他", queryMode: "all" },
};

const tabList = Object.entries(TAB_MAP).map(([value, item]) => ({
  value,
  label: item.label,
}));

const loading = ref(false);
const taskList = ref([]);
const total = ref(0);
const dateRange = ref([]);
const activeTab = ref("mine");

const listQuery = reactive({
  pageNo: 1,
  pageSize: 8,
});

const pageSizesList = [8, 12, 20, 50];

const getDefaultDateRange = () => {
  const end = dayjs();
  const start = end.subtract(30, "day");
  return [start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")];
};

const buildQueryParams = () => {
  const [startTime, endTime] = Array.isArray(dateRange.value) ? dateRange.value : [];
  return {
    pageNo: listQuery.pageNo,
    pageSize: Math.min(listQuery.pageSize, 200),
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    queryMode: TAB_MAP[activeTab.value]?.queryMode || "mine",
  };
};

const formatDisplayTime = (value) => value || "-";

const getTaskTitle = (task = {}) => {
  const typeName = task.taskTypeName || "考勤计算";
  const operatorName = task.operatorName;
  if (operatorName && !String(typeName).includes(operatorName)) {
    return `${typeName} (${operatorName})`;
  }
  return typeName;
};

const getStatusClass = (taskStatus = "") => {
  const map = {
    success: "is-success",
    processing: "is-processing",
    partial_failed: "is-warning",
    failed: "is-danger",
  };
  return map[taskStatus] || "is-default";
};

const fetchTaskList = () => {
  loading.value = true;
  queryAttendanceCalcTaskPage(buildQueryParams(), {
    isLoading: false,
  })
    .then((res) => {
      taskList.value = Array.isArray(res?.data) ? res.data : [];
      total.value = Number(res?.total || 0);
      if (Number(res?.currPage)) {
        listQuery.pageNo = Number(res.currPage);
      }
    })
    .catch(() => {
      taskList.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleSearch = () => {
  listQuery.pageNo = 1;
  fetchTaskList();
};

const handlePagination = () => {
  fetchTaskList();
};

const handleDateRangeChange = (value) => {
  if (!value || value.length !== 2) {
    dateRange.value = [];
  }
  handleSearch();
};

const handleTabChange = () => {
  listQuery.pageNo = 1;
  fetchTaskList();
};

const handleTabSwitch = (value) => {
  if (activeTab.value === value) {
    return;
  }
  activeTab.value = value;
  handleTabChange();
};

const resetDialogState = () => {
  activeTab.value = "mine";
  dateRange.value = getDefaultDateRange();
  listQuery.pageNo = 1;
  listQuery.pageSize = 8;
  taskList.value = [];
  total.value = 0;
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      resetDialogState();
      fetchTaskList();
    }
  },
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="后台事务"
    width="1120px"
    class="attendance-calc-task-dialog"
    destroy-on-close
    append-to-body
  >
    <div class="attendance-calc-task-dialog__header">
      <div class="attendance-calc-task-dialog__tabs">
        <Tabs
          :tab-list="tabList"
          :active-tab="activeTab"
          @change="handleTabSwitch"
        />
      </div>
      <div class="attendance-calc-task-dialog__filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="attendance-calc-task-dialog__date-range"
          style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
          clearable
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

    <div
      v-loading="loading"
      class="attendance-calc-task-dialog__body"
    >
      <div
        v-if="taskList.length"
        class="attendance-calc-task-dialog__grid"
      >
        <div
          v-for="task in taskList"
          :key="task.taskId"
          class="calc-task-card"
        >
          <div class="calc-task-card__title">
            {{ getTaskTitle(task) }}
          </div>
          <div class="calc-task-card__rows">
            <div class="calc-task-card__row">
              <span class="calc-task-card__label">计划时间</span>
              <span class="calc-task-card__value">{{ formatDisplayTime(task.createTime) }}</span>
            </div>
            <div class="calc-task-card__row">
              <span class="calc-task-card__label">开始时间</span>
              <span class="calc-task-card__value">{{ formatDisplayTime(task.startTime) }}</span>
            </div>
            <div class="calc-task-card__row">
              <span class="calc-task-card__label">结束时间</span>
              <span class="calc-task-card__value">{{ formatDisplayTime(task.endTime) }}</span>
            </div>
            <div class="calc-task-card__row">
              <span class="calc-task-card__label">创建时间</span>
              <span class="calc-task-card__value">{{ formatDisplayTime(task.createTime) }}</span>
            </div>
            <div class="calc-task-card__row">
              <span class="calc-task-card__label">创建者</span>
              <span class="calc-task-card__value">{{ formatDisplayTime(task.operatorName) }}</span>
            </div>
          </div>
          <div
            class="calc-task-card__status"
            :class="getStatusClass(task.taskStatus)"
          >
            {{ task.taskStatusName || "-" }}
          </div>
        </div>
      </div>
      <el-empty
        v-else
        description="暂无后台事务"
      />
    </div>

    <div
      v-if="total > 0"
      class="attendance-calc-task-dialog__pagination"
    >
      <Pagination
        v-model:page="listQuery.pageNo"
        v-model:limit="listQuery.pageSize"
        :total="total"
        :pageSizes="pageSizesList"
        @pagination="handlePagination"
      />
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.attendance-calc-task-dialog__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
}

.attendance-calc-task-dialog__tabs {
  flex: 0 0 auto;
  width: 240px;
}

.attendance-calc-task-dialog__filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  margin-left: auto;
}

:deep(.attendance-calc-task-dialog__tabs .tabs-container) {
  background: #f3f6fb;
  border: 1px solid #e8edf5;
  border-radius: 4px;
  padding: 3px;
  gap: 4px;
}

:deep(.attendance-calc-task-dialog__tabs .tab-item) {
  min-width: 0;
  height: 28px;
  line-height: 28px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #5f6b7a;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

:deep(.attendance-calc-task-dialog__tabs .tab-item:hover:not(.active)) {
  color: #2f6bff;
  background: rgba(47, 107, 255, 0.08);
}

:deep(.attendance-calc-task-dialog__tabs .tab-item.active) {
  color: #2f6bff;
  font-weight: 600;
  background: #fff;
  box-shadow: 0 2px 8px rgba(47, 107, 255, 0.14);
  transform: none;
}

@media (max-width: 720px) {
  .attendance-calc-task-dialog__header {
    flex-direction: column;
    align-items: stretch;
  }

  .attendance-calc-task-dialog__tabs {
    width: 100%;
  }

  .attendance-calc-task-dialog__filters {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

:deep(.attendance-calc-task-dialog__date-range.el-date-editor--daterange),
.attendance-calc-task-dialog__date-range {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}

.attendance-calc-task-dialog__body {
  min-height: 240px;
}

.attendance-calc-task-dialog__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.calc-task-card {
  position: relative;
  min-height: 188px;
  padding: 14px 14px 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.calc-task-card__title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.calc-task-card__rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calc-task-card__row {
  display: flex;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
}

.calc-task-card__label {
  flex: 0 0 auto;
}

.calc-task-card__label::after {
  content: "：";
}

.calc-task-card__value {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.calc-task-card__status {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.calc-task-card__status.is-success {
  color: #67c23a;
}

.calc-task-card__status.is-processing {
  color: #409eff;
}

.calc-task-card__status.is-warning {
  color: #e6a23c;
}

.calc-task-card__status.is-danger {
  color: #f56c6c;
}

.attendance-calc-task-dialog__pagination {
  margin-top: 16px;
}

@media (max-width: 1080px) {
  .attendance-calc-task-dialog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
