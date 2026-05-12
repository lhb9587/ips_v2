<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { queryUnarchivedAttendanceArchivePage } from "@/api/attendance";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: "view",
  },
  shiftOptions: {
    type: Array,
    default: () => [],
  },
  organizationOptions: {
    type: Array,
    default: () => [],
  },
  employeeOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save", "delete"]);

const isEditing = ref(false);
const formData = ref({});
const shiftDialogVisible = ref(false);
const employeeDialogVisible = ref(false);
const employeeLoading = ref(false);
const employeeOptions = ref([]);

const defaultPolicy = {
  holidaySystem: "默认假期制度",
  attendanceSystem: "默认考勤制度",
};

const syncFormData = (detailInfo) => {
  formData.value = {
    ...detailInfo,
    holidaySystem: defaultPolicy.holidaySystem,
    attendanceSystem: defaultPolicy.attendanceSystem,
    organizationCode: detailInfo.organizationCode || "",
    organizationName: detailInfo.organizationName || "",
  };
};

watch(
  () => [props.detailInfo, props.mode],
  ([detailInfo, mode]) => {
    syncFormData(detailInfo || {});
    isEditing.value = mode === "create";
  },
  { immediate: true, deep: true },
);

const titleText = computed(() =>
  props.mode === "create" ? "新增考勤档案" : "考勤档案详情",
);

const filteredShiftOptions = computed(() => props.shiftOptions);

const resolveEmployeePositionName = (record) => {
  return record.positionName || record.posName || record.position || record.posId || "-";
};

const fetchEmployeeOptions = () => {
  employeeLoading.value = true;
  queryUnarchivedAttendanceArchivePage(
    {
      pageNo: 1,
      pageSize: 200,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      employeeOptions.value = records.map((item) => ({
        ...item,
        employeeCode: item.talentCode,
        employeeName: item.talentName,
        organizationCode: item.deptCode || "",
        organizationName: item.deptName || "",
        positionName: resolveEmployeePositionName(item),
        employmentStatus: item.empStatus || "-",
        groupEntryDate: item.joinDate || "-",
        attendanceNo: item.talentCode || "",
      }));
    })
    .finally(() => {
      employeeLoading.value = false;
    });
};

const filteredEmployeeOptions = computed(() => employeeOptions.value);

const closeSidebar = () => {
  isEditing.value = false;
  emit("close");
};

const startEdit = () => {
  syncFormData(props.detailInfo || {});
  isEditing.value = true;
};

const cancelEdit = () => {
  if (props.mode === "create") {
    closeSidebar();
    return;
  }
  syncFormData(props.detailInfo || {});
  isEditing.value = false;
};

const openEmployeeDialog = () => {
  if (!isEditing.value || props.mode !== "create") {
    return;
  }
  employeeDialogVisible.value = true;
  fetchEmployeeOptions();
};

const chooseEmployee = (row) => {
  formData.value.employeeCode = row.employeeCode;
  formData.value.employeeName = row.employeeName;
  formData.value.attendanceNo = row.attendanceNo || formData.value.attendanceNo;
  formData.value.organizationCode = row.organizationCode;
  formData.value.organizationName = row.organizationName;
  employeeDialogVisible.value = false;
};

const openShiftDialog = () => {
  if (!isEditing.value) {
    return;
  }
  shiftDialogVisible.value = true;
};

const chooseShift = (row) => {
  formData.value.defaultShift = row.shiftName;
  formData.value.organizationCode = row.organizationCode;
  formData.value.organizationName = row.organizationName;
  shiftDialogVisible.value = false;
};

const saveEdit = () => {
  if (!formData.value.employeeName) {
    return ElMessage.warning("请选择员工");
  }
  if (!formData.value.defaultShift) {
    return ElMessage.warning("请选择默认班次");
  }

  emit("save", {
    ...props.detailInfo,
    employeeCode: formData.value.employeeCode || props.detailInfo.employeeCode,
    employeeName: formData.value.employeeName || props.detailInfo.employeeName,
    attendanceNo: formData.value.attendanceNo || props.detailInfo.attendanceNo,
    defaultShift: formData.value.defaultShift,
    organizationCode: formData.value.organizationCode || props.detailInfo.organizationCode,
    organizationName: formData.value.organizationName || props.detailInfo.organizationName,
    holidaySystem: defaultPolicy.holidaySystem,
    attendanceSystem: defaultPolicy.attendanceSystem,
  });
  isEditing.value = false;
};

const deleteRecord = () => {
  emit("delete", props.detailInfo);
};

const detailRows = [
  [
    { label: "员工编码", key: "employeeCode" },
    { label: "姓名", key: "employeeName", editable: true, type: "employee-dialog" },
  ],
  [
    { label: "考勤编号", key: "attendanceNo" },
    { label: "默认班次", key: "defaultShift", editable: true, type: "shift-dialog" },
  ],
  [
    { label: "假期制度", key: "holidaySystem" },
    { label: "考勤制度", key: "attendanceSystem" },
  ],
];

const formatValue = (field) => {
  const value = formData.value[field.key] ?? props.detailInfo[field.key];
  if (
    props.mode === "create" &&
    ["employeeCode", "attendanceNo"].includes(field.key) &&
    !value
  ) {
    return "";
  }
  return value || "-";
};

const canEditField = (field) => {
  if (!isEditing.value || !field.editable) {
    return false;
  }
  if (field.key === "employeeName") {
    return props.mode === "create";
  }
  return field.key === "defaultShift";
};
</script>

<template>
  <div class="attendance-profile-detail">
    <div class="attendance-profile-detail__header">
      <div class="attendance-profile-detail__title">{{ titleText }}</div>
      <div class="attendance-profile-detail__actions">
        <template v-if="isEditing">
          <el-button
            plain
            @click="cancelEdit"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="saveEdit"
          >
            保存
          </el-button>
        </template>
        <template v-else>
          <el-button
            type="primary"
            plain
            @click="startEdit"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            plain
            @click="deleteRecord"
          >
            删除
          </el-button>
        </template>
        <el-tooltip
          content="关闭"
          placement="top"
          :teleported="false"
        >
          <div
            class="attendance-profile-detail__close mdi mdi-window-close"
            @click="closeSidebar"
          ></div>
        </el-tooltip>
      </div>
    </div>

    <div class="attendance-profile-detail__content">
      <section class="detail-section">
        <div class="detail-section__rows">
          <div
            v-for="(row, rowIndex) in detailRows"
            :key="rowIndex"
            class="detail-row"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="detail-item"
            >
              <div class="detail-item__label">{{ field.label }}</div>
              <div
                v-if="canEditField(field) && field.type === 'employee-dialog'"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData[field.key]"
                  placeholder="请选择员工"
                  readonly
                  @click="openEmployeeDialog"
                >
                  <template #append>
                    <el-button @click="openEmployeeDialog">选择</el-button>
                  </template>
                </el-input>
              </div>
              <div
                v-else-if="canEditField(field) && field.type === 'shift-dialog'"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData[field.key]"
                  placeholder="请选择班次"
                  readonly
                  @click="openShiftDialog"
                >
                  <template #append>
                    <el-button @click="openShiftDialog">选择</el-button>
                  </template>
                </el-input>
              </div>
              <div
                v-else
                class="detail-item__value"
              >
                {{ formatValue(field) }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="employeeDialogVisible"
      title="选择员工"
      width="1120px"
      append-to-body
      destroy-on-close
      class="attendance-profile-employee-dialog"
    >
      <div class="attendance-profile-dialog__body">
        <div class="attendance-profile-dialog__table-wrap">
          <el-table
            v-loading="employeeLoading"
            :data="filteredEmployeeOptions"
            border
            height="420"
            highlight-current-row
            empty-text="无数据"
            @row-dblclick="chooseEmployee"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
            />
            <el-table-column
              prop="employeeCode"
              label="员工编码"
              min-width="140"
            />
            <el-table-column
              prop="employeeName"
              label="姓名"
              min-width="140"
            />
            <el-table-column
              prop="organizationName"
              label="组织"
              min-width="220"
            />
            <el-table-column
              prop="positionName"
              label="职位"
              min-width="160"
            />
            <el-table-column
              prop="employmentStatus"
              label="用工关系状态"
              min-width="160"
            />
            <el-table-column
              prop="groupEntryDate"
              label="入集团日期"
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
                  @click="chooseEmployee(row)"
                >
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

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
            :data="filteredShiftOptions"
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
  </div>
</template>

<style scoped lang="scss">
.attendance-profile-detail {
  height: 100%;
  background: #fff;
}

.attendance-profile-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e9edf5;
}

.attendance-profile-detail__title {
  position: relative;
  padding-bottom: 10px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.attendance-profile-detail__title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 68px;
  height: 3px;
  border-radius: 999px;
  background: #4f80c2;
}

.attendance-profile-detail__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attendance-profile-detail__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.attendance-profile-detail__content {
  padding: 24px 40px 40px;
}

.detail-section__rows {
  display: grid;
  gap: 18px;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 72px;
  row-gap: 16px;
}

.detail-item {
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.detail-item__label {
  flex: 0 0 96px;
  color: #6d7b92;
  font-size: 14px;
  line-height: 1.6;
}

.detail-item__value,
.detail-item__editor {
  flex: 1;
  min-width: 0;
}

.detail-item__value {
  color: #1f2d49;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-all;
}

:deep(.detail-item__editor .el-input__wrapper),
:deep(.detail-item__editor .el-select) {
  width: 100%;
}

.attendance-profile-dialog__body {
  display: grid;
  gap: 16px;
}

.attendance-profile-dialog__filter {
  padding: 8px 12px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fafcff;
}

.attendance-profile-dialog__field {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.attendance-profile-dialog__label {
  color: #4c5d78;
  font-size: 14px;
  text-align: right;
}

.attendance-profile-dialog__input,
.attendance-profile-dialog__table-wrap {
  width: 100%;
}

.attendance-profile-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.attendance-profile-employee-dialog .el-dialog__body),
:deep(.attendance-profile-shift-dialog .el-dialog__body) {
  padding-top: 14px;
}

:deep(.attendance-profile-employee-dialog .el-input-group__append),
:deep(.attendance-profile-shift-dialog .el-input-group__append) {
  padding: 0;
  background: #f6f9fc;
}

:deep(.attendance-profile-employee-dialog .el-table th.el-table__cell),
:deep(.attendance-profile-shift-dialog .el-table th.el-table__cell) {
  background: #f6f8fb;
  color: #243449;
}

@media (max-width: 960px) {
  .attendance-profile-detail__content {
    padding: 20px 24px 32px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }

  .attendance-profile-detail__actions {
    gap: 8px;
  }

  .attendance-profile-dialog__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .attendance-profile-dialog__label {
    text-align: left;
  }
}
</style>
