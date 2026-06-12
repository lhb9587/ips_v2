<!-- 考勤档案详情侧栏，展示并编辑员工考勤档案信息。 -->
<script setup>
import dayjs from "dayjs";
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { queryUnarchivedAttendanceArchivePage } from "@/api/attendance";

const store = useStore();
const userList = computed(() => store.state.user.userList || []);

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

const emit = defineEmits(["close", "save", "disable", "enable", "history"]);

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

const resolveDirectLeaderFromDetail = (detailInfo = {}) => {
  const leader = Array.isArray(detailInfo.directLeaders)
    ? detailInfo.directLeaders[0]
    : null;
  return {
    directLeaderUserId:
      detailInfo.directLeaderUserId ?? leader?.leaderUserId ?? "",
    directLeaderName:
      detailInfo.directLeaderName ?? leader?.leaderTalentName ?? "",
  };
};

const syncFormData = (detailInfo) => {
  const directLeader = resolveDirectLeaderFromDetail(detailInfo);
  formData.value = {
    ...detailInfo,
    ...directLeader,
    holidaySystem: defaultPolicy.holidaySystem,
    attendanceSystem: defaultPolicy.attendanceSystem,
    organizationCode: detailInfo.organizationCode || "",
    organizationName: detailInfo.organizationName || "",
    defaultShift: detailInfo.defaultShift || "",
    defaultShiftCode: detailInfo.defaultShiftCode || "",
    processMode: detailInfo.processMode || "correct",
    effectiveDate: detailInfo.effectiveDate || "",
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

const summaryName = computed(() => formData.value.employeeName || props.detailInfo.employeeName || "-");

const summaryOrganization = computed(
  () => formData.value.organizationName || props.detailInfo.organizationName || "-",
);

const summaryStatus = computed(() => formatStatusValue(formData.value.status ?? props.detailInfo.status));

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
  formData.value.defaultShiftCode = row.shiftCode;
  formData.value.organizationCode = row.organizationCode;
  formData.value.organizationName = row.organizationName;
  shiftDialogVisible.value = false;
};

const handleDirectLeaderChange = (userId) => {
  const matched = userList.value.find((item) => Number(item.value) === Number(userId));
  formData.value.directLeaderName = matched?.label || matched?.fullname || "";
};

const saveEdit = () => {
  if (!formData.value.employeeName) {
    return ElMessage.warning("请选择员工");
  }
  if (!formData.value.defaultShift) {
    return ElMessage.warning("请选择默认班次");
  }
  if (formData.value.processMode === "change" && !formData.value.effectiveDate) {
    return ElMessage.warning("请选择生效日期");
  }

  emit(
    "save",
    {
      ...props.detailInfo,
      employeeCode: formData.value.employeeCode || props.detailInfo.employeeCode,
      employeeName: formData.value.employeeName || props.detailInfo.employeeName,
      attendanceNo: formData.value.attendanceNo || props.detailInfo.attendanceNo,
      defaultShift: formData.value.defaultShift,
      defaultShiftCode: formData.value.defaultShiftCode || props.detailInfo.defaultShiftCode,
      isPunchAttendance:
        formData.value.isPunchAttendance === undefined || formData.value.isPunchAttendance === null
          ? 1
          : Number(formData.value.isPunchAttendance),
      processMode: formData.value.processMode || "correct",
      effectiveDate:
        formData.value.processMode === "change" ? formData.value.effectiveDate : undefined,
      organizationCode: formData.value.organizationCode || props.detailInfo.organizationCode,
      organizationName: formData.value.organizationName || props.detailInfo.organizationName,
      directLeaderUserId: formData.value.directLeaderUserId || "",
      directLeaderName: formData.value.directLeaderName || "",
      holidaySystem: defaultPolicy.holidaySystem,
      attendanceSystem: defaultPolicy.attendanceSystem,
    },
    () => {
      isEditing.value = false;
    },
  );
};

const disableRecord = () => {
  emit("disable", props.detailInfo);
};

const enableRecord = () => {
  emit("enable", props.detailInfo);
};

const openHistoryPage = () => {
  if (!props.detailInfo?.archiveId && !props.detailInfo?.id) {
    return ElMessage.warning("缺少档案ID，无法查看历史");
  }
  emit("history", props.detailInfo);
};

const detailSections = computed(() => {
  const rows = [
    [
      { label: "员工编码", key: "employeeCode" },
      { label: "打卡考勤", key: "isPunchAttendance", format: "boolean", editable: true, type: "punch-radio" },
    ],
    [
      { label: "考勤制度", key: "attendanceSystem" },
      { label: "假期制度", key: "holidaySystem" },
    ],
    [
      { label: "默认班次", key: "defaultShift", editable: true, type: "shift-dialog" },
      { label: "考勤状态", key: "status", format: "status" },
    ],
    [
      {
        label: "直接上级",
        key: "directLeaderUserId",
        format: "directLeader",
        editable: true,
        type: "direct-leader-select",
        span: 2,
      },
    ],
  ];
  if (isEditing.value) {
    rows.unshift([
      {
        label: "档案信息处理",
        key: "processMode",
        editable: true,
        type: "process-mode",
        span: 2,
      },
    ]);
  }
  if (formData.value.processMode === "change") {
    rows.push([
      {
        label: "生效日期",
        key: "effectiveDate",
        editable: true,
        type: "effective-date",
        format: "date",
        span: 2,
      },
    ]);
  }
  return [
    {
      title: "考勤信息",
      rows,
    },
  ];
});

function formatDateValue(value, pattern = "YYYY-MM-DD") {
  if (!value) {
    return "-";
  }
  const target = dayjs(value);
  return target.isValid() ? target.format(pattern) : value;
}

function formatBooleanValue(value) {
  if (value === 1 || value === "1") {
    return "是";
  }
  if (value === 0 || value === "0") {
    return "否";
  }
  return value || value === 0 ? value : "-";
}

function formatStatusValue(value) {
  if (value === 1 || value === "1") {
    return "启用";
  }
  if (value === 0 || value === "0") {
    return "禁用";
  }
  return value || value === 0 ? value : "-";
}

function formatScheduleModeValue(value) {
  if (value === "fixed") {
    return "固定班次";
  }
  if (value === "rotation") {
    return "轮班";
  }
  return value || "-";
}

function formatProcessModeValue(value) {
  if (value === "change") {
    return "变更档案信息";
  }
  return "纠正档案信息";
}

const resolveDirectLeaderDisplayName = (userId) => {
  if (!userId && userId !== 0) {
    return "-";
  }
  const matched = userList.value.find((item) => Number(item.value) === Number(userId));
  if (matched) {
    return matched.label || matched.fullname || "-";
  }
  return formData.value.directLeaderName || props.detailInfo.directLeaderName || "-";
};

const formatValue = (field) => {
  const value = formData.value[field.key] ?? props.detailInfo[field.key];
  if (
    props.mode === "create" &&
    ["employeeCode", "attendanceNo"].includes(field.key) &&
    !value
  ) {
    return "";
  }
  if (field.format === "datetime") {
    return formatDateValue(value, "YYYY-MM-DD HH:mm:ss");
  }
  if (field.format === "date") {
    return formatDateValue(value);
  }
  if (field.format === "boolean") {
    return formatBooleanValue(value);
  }
  if (field.format === "status") {
    return formatStatusValue(value);
  }
  if (field.format === "scheduleMode") {
    return formatScheduleModeValue(value);
  }
  if (field.key === "processMode") {
    return formatProcessModeValue(value);
  }
  if (field.format === "directLeader") {
    const userId = formData.value.directLeaderUserId ?? props.detailInfo.directLeaderUserId;
    return resolveDirectLeaderDisplayName(userId);
  }
  return value || "-";
};

const getValueClass = (field) => {
  if (field.key !== "status") {
    return "";
  }
  const value = formData.value[field.key] ?? props.detailInfo[field.key];
  return Number(value) === 0 ? "detail-item__value--danger" : "detail-item__value--primary";
};

const summaryBadgeClass = computed(() =>
  Number(formData.value.status ?? props.detailInfo.status) === 0
    ? "detail-summary__badge--danger"
    : "detail-summary__badge--primary",
);

const canEditField = (field) => {
  if (!isEditing.value || !field.editable) {
    return false;
  }
  if (field.key === "employeeName") {
    return props.mode === "create";
  }
  if (field.key === "effectiveDate") {
    return formData.value.processMode === "change";
  }
  return ["defaultShift", "processMode", "isPunchAttendance", "directLeaderUserId"].includes(
    field.key,
  );
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
            v-if="props.mode !== 'create'"
            plain
            @click="openHistoryPage"
          >
            档案历史
          </el-button>
          <el-button
            type="primary"
            @click="startEdit"
          >
            编辑
          </el-button>
          <el-button
            v-if="Number(props.detailInfo?.status) !== 0"
            type="danger"
            @click="disableRecord"
          >
            禁用
          </el-button>
          <el-button
            v-else
            type="success"
            plain
            @click="enableRecord"
          >
            开启
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
      <section class="detail-summary">
        <div class="detail-summary__avatar">
          <i class="bx bx-user"></i>
        </div>
        <div class="detail-summary__main">
          <div class="detail-summary__name">{{ summaryName }}</div>
          <div class="detail-summary__meta">{{ summaryOrganization }}</div>
          <div class="detail-summary__meta">{{ formData.empTypeName }}</div>
        </div>
        <div class="detail-summary__aside">
          <div
            class="detail-summary__badge"
            :class="summaryBadgeClass"
          >
            {{ summaryStatus }}
          </div>
          <div class="detail-summary__aside-text">
            默认班次：{{ formatValue({ key: "defaultShift" }) }}
          </div>
          <div class="detail-summary__aside-text">
            考勤编号：{{ formatValue({ key: "attendanceNo" }) }}
          </div>
        </div>
      </section>

      <section
        v-for="section in detailSections"
        :key="section.title"
        class="detail-section"
      >
        <div class="detail-section__title">{{ section.title }}</div>
        <div
          v-if="isEditing"
          class="detail-section__tips"
        >
          温馨提示：纠正档案信息：对不准确的档案信息进行纠正，即修改最新的档案信息，不产生新的档案历史记录；<br/>
          变更档案信息：档案信息从“生效日期”时间点发生变更，变更将会产生新的档案历史记录。
        </div>
        <div class="detail-section__rows">
          <div
            v-for="(row, rowIndex) in section.rows"
            :key="rowIndex"
            class="detail-row"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="detail-item"
              :class="{ 'detail-item--full': field.span === 2 }"
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
                v-else-if="canEditField(field) && field.type === 'process-mode'"
                class="detail-item__editor"
              >
                <el-radio-group v-model="formData.processMode">
                  <el-radio value="correct">纠正档案信息</el-radio>
                  <el-radio value="change">变更档案信息</el-radio>
                </el-radio-group>
              </div>
              <div
                v-else-if="canEditField(field) && field.type === 'punch-radio'"
                class="detail-item__editor"
              >
                <el-radio-group v-model="formData.isPunchAttendance">
                  <el-radio :value="1">是</el-radio>
                  <el-radio :value="0">否</el-radio>
                </el-radio-group>
              </div>
              <div
                v-else-if="canEditField(field) && field.type === 'effective-date'"
                class="detail-item__editor"
              >
                <el-date-picker
                  v-model="formData.effectiveDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  placeholder="请选择生效日期"
                  style="width: 100%"
                />
              </div>
              <div
                v-else-if="canEditField(field) && field.type === 'direct-leader-select'"
                class="detail-item__editor"
              >
                <el-select
                  v-model="formData.directLeaderUserId"
                  placeholder="请选择直接上级"
                  filterable
                  style="width: 100%"
                  @change="handleDirectLeaderChange"
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div
                v-else
                class="detail-item__value"
                :class="getValueClass(field)"
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
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
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
  padding: 24px 28px 32px;
  display: grid;
  gap: 18px;
  overflow-y: auto;
}

.detail-summary,
.detail-section {
  border: 1px solid #e6edf7;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(65, 92, 136, 0.06);
}

.detail-summary {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 220px;
  gap: 20px;
  align-items: center;
  padding: 22px 24px;
}

.detail-summary__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 4px;
  background: linear-gradient(135deg, #eef4fd 0%, #dfe9f8 100%);
  color: #6d88b4;
  font-size: 42px;
}

.detail-summary__main {
  min-width: 0;
}

.detail-summary__name {
  color: #1f2d49;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}

.detail-summary__meta {
  margin-top: 8px;
  color: #607089;
  font-size: 14px;
  line-height: 1.7;
}

.detail-summary__aside {
  display: grid;
  gap: 10px;
  align-content: start;
  padding-left: 20px;
  border-left: 1px solid #edf2f8;
}

.detail-summary__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 72px;
  padding: 6px 14px;
  border-radius: 4px;
  background: #edf5ff;
  color: #3666a8;
  font-size: 13px;
  font-weight: 700;
}

.detail-summary__badge--primary {
  background: #edf5ff;
  color: #3666a8;
}

.detail-summary__badge--danger {
  background: #faecec;
  color: #b85c5c;
}

.detail-summary__aside-text {
  color: #5f6f89;
  font-size: 13px;
  line-height: 1.6;
}

.detail-section {
  padding: 22px 24px 24px;
}

.detail-section__title {
  margin-bottom: 18px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
}

.detail-section__rows {
  display: grid;
  gap: 14px;
}

.detail-section__tips {
  margin: -6px 0 12px;
  color: #d03050;
  font-size: 13px;
  line-height: 1.7;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 58px;
  padding: 14px 16px;
  border-radius: 4px;
  background: #f8fbff;
  border: 1px solid #edf2f8;
}

.detail-item--full {
  grid-column: 1 / -1;
}

.detail-item__label {
  flex: 0 0 96px;
  color: #6d7b92;
  font-size: 13px;
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
  font-weight: 500;
  line-height: 1.7;
  word-break: break-all;
}

.detail-item__value--primary {
  color: #3666a8;
}

.detail-item__value--danger {
  color: #b85c5c;
}

:deep(.detail-item__editor .el-input__wrapper),
:deep(.detail-item__editor .el-select) {
  width: 100%;
}

:deep(.detail-item__editor .el-input__wrapper) {
  background: #fff;
}

.attendance-profile-dialog__body {
  display: grid;
  gap: 16px;
}

.attendance-profile-dialog__filter {
  padding: 8px 12px;
  border: 1px solid #e7edf5;
  border-radius: 4px;
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
  border-radius: 4px;
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
    padding: 18px 18px 28px;
  }

  .detail-summary {
    grid-template-columns: 1fr;
  }

  .detail-summary__aside {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid #edf2f8;
    padding-top: 14px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }

  .attendance-profile-detail__actions {
    gap: 8px;
  }

  .detail-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .detail-item__label {
    flex: none;
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
