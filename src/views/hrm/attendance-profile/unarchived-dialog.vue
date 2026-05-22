<!-- 未建档员工列表弹窗，负责展示并分页查询未建档员工。 -->
<!-- eslint-disable no-undef -->
<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import Pagination from "@/components/common/pagination/index.vue";
import {
  batchCreateAttendanceArchiveByDefault,
  queryUnarchivedAttendanceArchivePage,
} from "@/api/attendance";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  shiftOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "created"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const loading = ref(false);
const searchKeyword = ref("");
const tableData = ref([]);
const total = ref(0);
const tableRef = ref(null);
const shiftDialogVisible = ref(false);
const selectedShift = ref("");
const selectedRows = ref([]);
const submitLoading = ref(false);
const listQuery = ref({
  pageNo: 1,
  pageSize: 20,
});
const pageSizesList = [10, 20, 50, 100, 200];
const selectedCount = computed(() => selectedRows.value.length);
const defaultShiftValue = computed(
  () => props.shiftOptions.find((item) => item?.isDefault)?.shiftName || "",
);

const resolvePositionName = (record) => {
  return record.positionName || record.posName || record.position || record.posId || "-";
};

const fetchUnarchivedList = () => {
  loading.value = true;
  queryUnarchivedAttendanceArchivePage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      talentName: searchKeyword.value || undefined,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      tableData.value = records.map((item) => ({
        ...item,
        positionName: resolvePositionName(item),
        employmentStatus: item.empStatus || "-",
        groupEntryDate: item.joinDate || "-",
      }));
      total.value = res?.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleSearch = () => {
  listQuery.value.pageNo = 1;
  fetchUnarchivedList();
};

const handlePagination = () => {
  fetchUnarchivedList();
};

const openShiftDialog = () => {
  shiftDialogVisible.value = true;
};

const chooseShift = (row) => {
  selectedShift.value = row.shiftName || "";
  shiftDialogVisible.value = false;
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const resetDialogState = () => {
  selectedRows.value = [];
  selectedShift.value = defaultShiftValue.value;
  shiftDialogVisible.value = false;
  nextTick(() => {
    tableRef.value?.clearSelection?.();
  });
};

const handleBatchCreate = () => {
  if (!selectedRows.value.length) {
    return ElMessage.warning("请选择需要建档的员工");
  }

  if (!selectedShift.value) {
    return ElMessage.warning("\u8BF7\u9009\u62E9\u9ED8\u8BA4\u73ED\u6B21");
  }

  const talentCodes = [...new Set(selectedRows.value.map((item) => item.talentCode).filter(Boolean))];
  if (!talentCodes.length) {
    return ElMessage.warning("未获取到有效的员工编码");
  }

  submitLoading.value = true;
  batchCreateAttendanceArchiveByDefault(
    {
      talentCodes,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      ElMessage.success(res?.data?.message || "批量建档成功");
      emit("created");
      closeDialog();
    })
    .finally(() => {
      submitLoading.value = false;
    });
};

const closeDialog = () => {
  resetDialogState();
  dialogVisible.value = false;
};

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      resetDialogState();
      return;
    }
    listQuery.value.pageNo = 1;
    selectedShift.value = defaultShiftValue.value;
    fetchUnarchivedList();
  },
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="未建档案"
    width="1080px"
    class="attendance-profile-unarchived-dialog"
    :close-on-click-modal="false"
    destroy-on-close
    top="5vh"
  >
    <div class="attendance-profile-unarchived">
      <div class="attendance-profile-unarchived__hero">
        <div class="attendance-profile-unarchived__hero-main">
          <div class="attendance-profile-unarchived__hero-title">待建档员工列表</div>
          <div class="attendance-profile-unarchived__hero-desc">
            勾选未建档员工后，可按组织默认配置批量创建考勤档案。
          </div>
        </div>
        <div class="attendance-profile-unarchived__hero-stats">
          <div class="attendance-profile-unarchived__stat-card">
            <div class="attendance-profile-unarchived__stat-label">待建档人数</div>
            <div class="attendance-profile-unarchived__stat-value">{{ total }}</div>
          </div>
          <div class="attendance-profile-unarchived__stat-card attendance-profile-unarchived__stat-card--accent">
            <div class="attendance-profile-unarchived__stat-label">已选择</div>
            <div class="attendance-profile-unarchived__stat-value">{{ selectedCount }}</div>
          </div>
        </div>
      </div>

      <div class="attendance-profile-unarchived__panel">
        <div class="attendance-profile-unarchived-dialog__toolbar">
          <el-input
            v-model="searchKeyword"
            clearable
            placeholder="请输入员工姓名"
            class="attendance-profile-unarchived-dialog__input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prepend>
              <el-button @click="handleSearch">
                <i class="bx bx-search-alt"></i>
              </el-button>
            </template>
          </el-input>
          <div class="attendance-profile-unarchived-dialog__toolbar-tip">
            支持按员工编码或姓名快速筛选
          </div>
        </div>

        <div class="attendance-profile-unarchived-dialog__table-wrap">
          <el-table
            ref="tableRef"
            v-loading="loading"
            :data="tableData"
            border
            stripe
            height="420"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="54"
              align="center"
            />
            <el-table-column
              prop="talentCode"
              label="员工编码"
              min-width="160"
            />
            <el-table-column
              prop="talentName"
              label="姓名"
              min-width="140"
            />
            <el-table-column
              prop="deptName"
              label="组织"
              min-width="260"
              show-overflow-tooltip
            />
            <el-table-column
              prop="positionName"
              label="职位"
              min-width="160"
              show-overflow-tooltip
            />
            <el-table-column
              prop="employmentStatus"
              label="用工关系状态"
              min-width="160"
            />
            <el-table-column
              prop="groupEntryDate"
              label="入集团日期"
              min-width="160"
            />
          </el-table>
        </div>

        <div
          v-if="total > 0"
          class="attendance-profile-unarchived-dialog__pagination"
        >
          <Pagination
            :total="total"
            v-model:page="listQuery.pageNo"
            v-model:limit="listQuery.pageSize"
            :pageSizes="pageSizesList"
            :storage="false"
            @pagination="handlePagination"
          />
        </div>
      </div>

      <div class="attendance-profile-unarchived__footer-panel">
        <div class="attendance-profile-unarchived__field-block">
          <div class="attendance-profile-unarchived__field-meta">
            <div class="attendance-profile-unarchived__field-label">默认班次</div>
          </div>
          <el-input
            v-model="selectedShift"
            readonly
            placeholder="请选择默认班次"
            class="attendance-profile-unarchived-dialog__shift-input"
            @click="openShiftDialog"
          >
            <template #append>
              <el-button @click="openShiftDialog">选择</el-button>
            </template>
          </el-input>
        </div>

        <div class="attendance-profile-unarchived-dialog__footer-actions">
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleBatchCreate"
          >
            批量建档
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="shiftDialogVisible"
      title="选择班次"
      width="1280px"
      append-to-body
      destroy-on-close
      class="attendance-profile-shift-dialog"
    >
      <div class="attendance-profile-dialog__body">
        <div class="attendance-profile-dialog__table-wrap">
          <el-table
            :data="shiftOptions"
            border
            height="420"
            highlight-current-row
            @row-dblclick="chooseShift"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
            />
            <el-table-column
              prop="shiftCode"
              label="班次编码"
              min-width="120"
            />
            <el-table-column
              prop="shiftName"
              label="班次名称"
              min-width="180"
            />
            <el-table-column
              prop="overtimePayType"
              label="加班补偿方式"
              min-width="140"
            />
            <el-table-column
              prop="applicableFrequency"
              label="适用段次"
              min-width="120"
            />
            <el-table-column
              prop="cardRule"
              label="取卡规则"
              min-width="160"
            />
            <el-table-column
              prop="standardWorkHours"
              label="标准工时"
              min-width="120"
            />
            <el-table-column
              prop="organizationName"
              label="组织"
              min-width="140"
            />
            <el-table-column
              label="操作"
              fixed="right"
              width="90"
            >
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="chooseShift(row)"
                >
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

  </el-dialog>
</template>

<style scoped lang="scss">
.attendance-profile-unarchived,
.attendance-profile-unarchived *,
.attendance-profile-dialog__body,
.attendance-profile-dialog__body *,
.attendance-profile-shift-dialog,
.attendance-profile-shift-dialog * {
  box-sizing: border-box;
}

.attendance-profile-unarchived {
  display: grid;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.attendance-profile-unarchived__hero {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid #e6edf7;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbfcff 0%, #f4f8ff 100%);
  width: 100%;
  min-width: 0;
}

.attendance-profile-unarchived__hero-main {
  min-width: 0;
  flex: 1;
}

.attendance-profile-unarchived__hero-title {
  color: #243449;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.attendance-profile-unarchived__hero-desc {
  margin-top: 6px;
  color: #66758f;
  font-size: 13px;
  line-height: 20px;
}

.attendance-profile-unarchived__hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px;
  flex: 0 0 auto;
  min-width: 0;
}

.attendance-profile-unarchived__stat-card {
  min-width: 120px;
  padding: 14px 16px;
  border: 1px solid #dfe8f4;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
}

.attendance-profile-unarchived__stat-card--accent {
  border-color: #cfdcff;
  background: #f3f7ff;
}

.attendance-profile-unarchived__stat-label {
  color: #6a7892;
  font-size: 12px;
  line-height: 18px;
}

.attendance-profile-unarchived__stat-value {
  margin-top: 4px;
  color: #243449;
  font-size: 24px;
  font-weight: 600;
  line-height: 30px;
}

.attendance-profile-unarchived__panel {
  padding: 16px;
  border: 1px solid #e7edf5;
  border-radius: 12px;
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  width: 100%;
  min-width: 0;
}

.attendance-profile-unarchived-dialog__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  min-width: 0;
}

.attendance-profile-unarchived-dialog__input,
.attendance-profile-unarchived-dialog__table-wrap {
  width: 100%;
  min-width: 0;
}

.attendance-profile-unarchived-dialog__input {
  max-width: 320px;
  flex: 0 1 320px;
}

.attendance-profile-unarchived-dialog__toolbar-tip {
  flex: 0 1 auto;
  color: #7d8aa3;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  min-width: 0;
}

.attendance-profile-unarchived-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}

.attendance-profile-unarchived-dialog__pagination {
  padding-top: 14px;
}

.attendance-profile-unarchived__footer-panel {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  border: 1px solid #e7edf5;
  border-radius: 12px;
  background: #fbfcfe;
  width: 100%;
  min-width: 0;
}

.attendance-profile-unarchived__field-block {
  display: grid;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.attendance-profile-unarchived__field-meta {
  display: grid;
  gap: 4px;
}

.attendance-profile-unarchived__field-label {
  color: #243449;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.attendance-profile-unarchived__field-desc {
  color: #7b879c;
  font-size: 12px;
  line-height: 18px;
}

.attendance-profile-unarchived-dialog__shift-input {
  max-width: 420px;
  width: 100%;
}

.attendance-profile-unarchived-dialog__footer-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
}

:deep(.attendance-profile-unarchived-dialog .el-input-group__append),
:deep(.attendance-profile-shift-dialog .el-input-group__append) {
  padding: 0;
  background: #f6f9fc;
}

:deep(.attendance-profile-unarchived-dialog .el-dialog__body) {
  padding-top: 14px;
  overflow-x: hidden;
}

:deep(.attendance-profile-unarchived-dialog) {
  max-width: calc(100vw - 48px);
}

:deep(.attendance-profile-unarchived-dialog .el-dialog__footer) {
  display: none;
}

.attendance-profile-dialog__body,
.attendance-profile-dialog__table-wrap {
  width: 100%;
}

.attendance-profile-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.attendance-profile-unarchived-dialog .el-table th.el-table__cell),
:deep(.attendance-profile-shift-dialog .el-table th.el-table__cell) {
  background: #f6f8fb;
  color: #243449;
}

@media (max-width: 960px) {
  .attendance-profile-unarchived__hero,
  .attendance-profile-unarchived__footer-panel,
  .attendance-profile-unarchived-dialog__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .attendance-profile-unarchived__hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .attendance-profile-unarchived-dialog__input,
  .attendance-profile-unarchived-dialog__shift-input {
    max-width: none;
  }

  .attendance-profile-unarchived-dialog__footer-actions {
    justify-content: flex-end;
  }
}
</style>
