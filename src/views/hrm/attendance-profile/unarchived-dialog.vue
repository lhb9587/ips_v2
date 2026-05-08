<!-- 未建档员工列表弹窗，负责展示并分页查询未建档员工。 -->
<!-- eslint-disable no-undef -->
<script setup>
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import Pagination from "@/components/common/pagination/index.vue";
import {
  batchCreateAttendanceArchiveByDefault,
  queryUnarchivedAttendanceArchivePage,
} from "@/api/hrmList";

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
const shiftDialogVisible = ref(false);
const selectedShift = ref("");
const selectedRows = ref([]);
const submitLoading = ref(false);
const listQuery = ref({
  pageNo: 1,
  pageSize: 20,
});
const pageSizesList = [10, 20, 50, 100, 200];

const resolvePositionName = (record) => {
  return record.positionName || record.posName || record.position || record.posId || "-";
};

const fetchUnarchivedList = () => {
  loading.value = true;
  queryUnarchivedAttendanceArchivePage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      talentCode: searchKeyword.value || undefined,
      talentName: searchKeyword.value || undefined,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = res?.data?.records || [];
      tableData.value = records.map((item) => ({
        ...item,
        positionName: resolvePositionName(item),
        employmentStatus: item.empStatus || "-",
        groupEntryDate: item.joinDate || "-",
      }));
      total.value = res?.data?.total || 0;
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

const handleBatchCreate = () => {
  if (!selectedRows.value.length) {
    return ElMessage.warning("请选择需要建档的员工");
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
  selectedRows.value = [];
  dialogVisible.value = false;
};

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      return;
    }
    listQuery.value.pageNo = 1;
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
    destroy-on-close
  >
    <div class="attendance-profile-unarchived-dialog__toolbar">
      <el-input
        v-model="searchKeyword"
        clearable
        placeholder="请输入员工编码/姓名"
        class="attendance-profile-unarchived-dialog__input"
        @keyup.enter="handleSearch"
      >
        <template #prepend>
          <el-button @click="handleSearch">
            <i class="bx bx-search-alt"></i>
          </el-button>
        </template>
      </el-input>
    </div>

    <div class="attendance-profile-unarchived-dialog__table-wrap">
      <el-table
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

    <div class="attendance-profile-unarchived-dialog__footer-form">
      <div class="attendance-profile-unarchived-dialog__form-label">默认班次</div>
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

    <el-dialog
      v-model="shiftDialogVisible"
      title="选择班次"
      width="1100px"
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

    <template #footer>
      <div class="attendance-profile-unarchived-dialog__footer-actions">
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleBatchCreate"
        >
          批量建档
        </el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.attendance-profile-unarchived-dialog__toolbar {
  margin-bottom: 16px;
}

.attendance-profile-unarchived-dialog__input,
.attendance-profile-unarchived-dialog__table-wrap {
  width: 100%;
}

.attendance-profile-unarchived-dialog__input {
  max-width: 320px;
}

.attendance-profile-unarchived-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}

.attendance-profile-unarchived-dialog__pagination {
  padding-top: 16px;
}

.attendance-profile-unarchived-dialog__footer-form {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
}

.attendance-profile-unarchived-dialog__form-label {
  flex: 0 0 auto;
  min-width: 72px;
  color: #243449;
  font-weight: 500;
}

.attendance-profile-unarchived-dialog__shift-input {
  max-width: 360px;
}

.attendance-profile-unarchived-dialog__footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.attendance-profile-unarchived-dialog .el-input-group__append),
:deep(.attendance-profile-shift-dialog .el-input-group__append) {
  padding: 0;
  background: #f6f9fc;
}

:deep(.attendance-profile-unarchived-dialog .el-dialog__body) {
  padding-top: 14px;
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
</style>
