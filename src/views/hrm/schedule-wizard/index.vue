<!-- 排班向导页：支持基于轮班规则的日历式排班，复用排班列表轮班规则接口与字段。 -->
<script setup>
import dayjs from "dayjs";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import Pagination from "@/components/common/pagination/index.vue";
import {
  queryAttendanceGroupPage,
  queryAttendanceRotationRuleList,
  queryScheduleWizardMemberPage,
  submitScheduleWizard,
} from "@/api/attendance";

const store = useStore();
const router = useRouter();

const ruleLoading = ref(false);
const submitLoading = ref(false);
const employeeLoading = ref(false);
const attendanceGroupLoading = ref(false);
const showEmployeeDialog = ref(false);
const showRuleDialog = ref(false);

const form = ref({
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
  ruleId: "",
});

const ruleOptions = ref([]);
const attendanceGroupOptions = ref([]);
const selectedEmployees = ref([]);
const dialogSelectedEmployees = ref([]);
const employeeTableRef = ref(null);
const employeeSource = ref([]);
const employeeTotal = ref(0);
const employeeFilter = ref({
  organization: "",
  attendanceGroup: "",
  employeeName: "",
});
const employeePagination = ref({
  pageNo: 1,
  pageSize: 100,
});
const ruleDialogForm = ref({
  ruleId: "",
  startDate: "",
  endDate: "",
});

const isRuleDateRangeWithinOneMonth = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid()) return false;
  if (end.isBefore(start, "day")) return false;
  return !end.isAfter(start.add(1, "month"), "day");
};

const cascaderProps = {
  emitPath: false,
  checkStrictly: true,
  value: "value",
  label: "label",
  children: "children",
};

const attendanceScope = computed(() => store.getters["attendanceScope/scope"] || {});
const organizationCascaderOptions = computed(() => {
  const mapTree = (list = []) =>
    list.map((item) => ({
      value: item.deptCode || item.deptId || item.organizationCode || item.value,
      label: item.deptName || item.organizationName || item.label,
      children: Array.isArray(item.children) ? mapTree(item.children) : [],
    }));
  if (
    Array.isArray(attendanceScope.value?.deptScopeTree) &&
    attendanceScope.value.deptScopeTree.length > 0
  ) {
    return mapTree(attendanceScope.value.deptScopeTree);
  }
  return (store.getters["attendanceScope/deptScopes"] || []).map((item) => ({
    value: item.deptCode || item.deptId || item.organizationCode,
    label: item.deptName || item.organizationName || item.organizationFullName,
    children: [],
  }));
});

const currentOperator = computed(() => ({
  operatorId: store.state.user.userId || undefined,
  operatorName: store.state.user.name || undefined,
}));

const weekdayLabel = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const calendarCursor = ref(dayjs().startOf("month"));

const calendarMonth = computed(() => calendarCursor.value.startOf("month"));

const calendarTitle = computed(() => calendarMonth.value.format("YYYY年 MM月"));

const extractShiftNameFromRuleName = (ruleName = "") => {
  const source = String(ruleName || "").trim();
  if (!source) return "";
  const withoutSuffix = source.replace(/轮班规则$/u, "").replace(/规则$/u, "").trim();
  if (!withoutSuffix) return source;
  const parts = withoutSuffix
    .split(/[|｜/、,，\s_-]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts[0] || withoutSuffix;
};

const calendarShiftName = computed(() => {
  const currentRule = ruleOptions.value.find((item) => item.value === form.value.ruleId);
  return extractShiftNameFromRuleName(currentRule?.label || "");
});

const scheduleDays = computed(() => {
  if (!form.value.startDate || !form.value.endDate || !form.value.ruleId) {
    return new Set();
  }
  const start = dayjs(form.value.startDate);
  const end = dayjs(form.value.endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
    return new Set();
  }
  const set = new Set();
  let cursor = start;
  while (cursor.isBefore(end, "day") || cursor.isSame(end, "day")) {
    if (cursor.day() !== 0 && cursor.day() !== 6) {
      set.add(cursor.format("YYYY-MM-DD"));
    }
    cursor = cursor.add(1, "day");
  }
  return set;
});

const calendarCells = computed(() => {
  const monthStart = calendarMonth.value.startOf("month");
  const gridStart = monthStart.startOf("week");
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const current = gridStart.add(i, "day");
    const dateText = current.format("YYYY-MM-DD");
    const inMonth = current.month() === monthStart.month();
    const isWeekend = current.day() === 0 || current.day() === 6;
    const hasShift = scheduleDays.value.has(dateText);
    cells.push({
      dateText,
      dayText: current.date(),
      inMonth,
      isWeekend,
      hasShift,
    });
  }
  return cells;
});

const fetchAttendanceGroupOptions = () => {
  attendanceGroupLoading.value = true;
  return queryAttendanceGroupPage(
    { pageNo: 1, pageSize: 1000 },
    { isLoading: false },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      attendanceGroupOptions.value = records.map((item) => ({
        value: item.groupId || item.groupCode,
        label: item.groupName || item.name || "",
      }));
    })
    .catch(() => {
      attendanceGroupOptions.value = [];
    })
    .finally(() => {
      attendanceGroupLoading.value = false;
    });
};

const fetchRotationRuleOptions = () => {
  ruleLoading.value = true;
  return queryAttendanceRotationRuleList(
    {
      organizationCode: employeeFilter.value.organization || undefined,
    },
    { isLoading: false },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      ruleOptions.value = records.map((item) => ({
        label: item.ruleName || item.rotationRuleName || "",
        value: item.ruleCode || item.rotationRuleCode || "",
      }));
    })
    .catch(() => {
      ruleOptions.value = [];
    })
    .finally(() => {
      ruleLoading.value = false;
    });
};

const fetchWizardMembers = () => {
  employeeLoading.value = true;
  return queryScheduleWizardMemberPage(
    {
      deptCode: employeeFilter.value.organization || undefined,
      groupId: employeeFilter.value.attendanceGroup || undefined,
      talentName: employeeFilter.value.employeeName || undefined,
      pageNo: employeePagination.value.pageNo,
      pageSize: employeePagination.value.pageSize,
    },
    { isLoading: false },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      employeeSource.value = records.map((item) => ({
        id: item.archiveId || item.talentCode || "",
        archiveId: item.archiveId || "",
        employeeCode: item.talentCode || "",
        employeeName: item.talentName || "",
        attendanceOrganization: item.deptName || "",
        attendanceGroupName: item.attendanceGroupName || "",
      }));
      employeeTotal.value = Number(res?.total) || Number(res?.data?.total) || 0;
      return nextTick().then(() => {
        const selectedCodeSet = new Set(
          dialogSelectedEmployees.value.map((item) => item.employeeCode).filter(Boolean),
        );
        if (!employeeTableRef.value?.toggleRowSelection) {
          return;
        }
        employeeSource.value.forEach((row) => {
          employeeTableRef.value.toggleRowSelection(row, selectedCodeSet.has(row.employeeCode));
        });
      });
    })
    .catch(() => {
      employeeSource.value = [];
      employeeTotal.value = 0;
    })
    .finally(() => {
      employeeLoading.value = false;
    });
};

const handleOpenEmployeeDialog = () => {
  showEmployeeDialog.value = true;
  dialogSelectedEmployees.value = [...selectedEmployees.value];
  fetchWizardMembers();
};

const handleOpenRuleDialog = () => {
  if (!selectedEmployees.value.length) {
    ElMessage.warning("请先选择员工");
    return;
  }
  ruleDialogForm.value = {
    ruleId: form.value.ruleId || "",
    startDate: form.value.startDate || dayjs().format("YYYY-MM-DD"),
    endDate: form.value.endDate || dayjs().add(30, "day").format("YYYY-MM-DD"),
  };
  showRuleDialog.value = true;
};

const handleEmployeeSelectionChange = (rows) => {
  dialogSelectedEmployees.value = rows || [];
};

const handleEmployeeFilter = () => {
  employeePagination.value.pageNo = 1;
  fetchWizardMembers();
  employeeTableRef.value?.clearSelection?.();
  dialogSelectedEmployees.value = [];
};

const handleEmployeePagination = () => {
  fetchWizardMembers();
};

const handleConfirmEmployees = () => {
  selectedEmployees.value = [...dialogSelectedEmployees.value];
  showEmployeeDialog.value = false;
};

const handleRemoveEmployee = (employeeCode) => {
  selectedEmployees.value = selectedEmployees.value.filter(
    (item) => item.employeeCode !== employeeCode,
  );
  dialogSelectedEmployees.value = dialogSelectedEmployees.value.filter(
    (item) => item.employeeCode !== employeeCode,
  );
};

const handleConfirmRule = () => {
  if (!ruleDialogForm.value.ruleId) {
    ElMessage.warning("请选择轮班规则");
    return;
  }
  if (!ruleDialogForm.value.startDate || !ruleDialogForm.value.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  if (!isRuleDateRangeWithinOneMonth(ruleDialogForm.value.startDate, ruleDialogForm.value.endDate)) {
    if (
      dayjs(ruleDialogForm.value.endDate).isBefore(dayjs(ruleDialogForm.value.startDate), "day")
    ) {
      ElMessage.warning("结束日期不能早于开始日期");
    } else {
      ElMessage.warning("开始日期和结束日期间隔不能超过一个月");
    }
    return;
  }
  form.value.ruleId = ruleDialogForm.value.ruleId;
  form.value.startDate = ruleDialogForm.value.startDate;
  form.value.endDate = ruleDialogForm.value.endDate;
  calendarCursor.value = dayjs(form.value.startDate || dayjs()).startOf("month");
  showRuleDialog.value = false;
};

const handlePrevMonth = () => {
  calendarCursor.value = calendarCursor.value.subtract(1, "month").startOf("month");
};

const handleNextMonth = () => {
  calendarCursor.value = calendarCursor.value.add(1, "month").startOf("month");
};

const handleSubmit = () => {
  if (!selectedEmployees.value.length) {
    ElMessage.warning("请先选择员工");
    return;
  }
  if (!form.value.ruleId) {
    ElMessage.warning("请选择轮班规则");
    return;
  }
  if (!form.value.startDate || !form.value.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  if (!isRuleDateRangeWithinOneMonth(form.value.startDate, form.value.endDate)) {
    if (dayjs(form.value.endDate).isBefore(dayjs(form.value.startDate), "day")) {
      ElMessage.warning("结束日期不能早于开始日期");
    } else {
      ElMessage.warning("开始日期和结束日期间隔不能超过一个月");
    }
    return;
  }
  submitLoading.value = true;
  submitScheduleWizard(
    {
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      rotationRuleCode: form.value.ruleId,
      holidayHandleMode: "DELAY",
      memberTalentCodes: selectedEmployees.value
        .map((item) => item.employeeCode)
        .filter(Boolean),
      ...currentOperator.value,
    },
    { isLoading: true },
  )
    .then((res) => {
      ElMessage.success(res?.data?.message || "排班保存成功");
      selectedEmployees.value = [];
      dialogSelectedEmployees.value = [];
      form.value.ruleId = "";
      form.value.startDate = "";
      form.value.endDate = "";
    })
    .finally(() => {
      submitLoading.value = false;
    });
};

const handleOpenScheduleList = () => {
  router.push({
    name: "schedule-list",
  });
};

watch(
  () => employeeFilter.value.organization,
  () => {
    fetchRotationRuleOptions();
  },
);

onMounted(() => {
  fetchAttendanceGroupOptions();
  fetchRotationRuleOptions();
});
</script>

<template>
  <Layout>
    <div class="schedule-wizard-page">
      <div class="schedule-wizard-toolbar">
        <div class="schedule-wizard-actions">
          <el-button type="primary" @click="handleOpenEmployeeDialog">选择员工</el-button>
          <el-button type="primary" @click="handleOpenRuleDialog">轮班规则</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
          <el-button type="primary" plain @click="handleOpenScheduleList">排班列表</el-button>
        </div>
      </div>

      <div class="schedule-wizard-content">
        <div class="schedule-wizard-employee-panel">
          <div
            v-for="item in selectedEmployees"
            :key="item.id || item.employeeCode"
            class="schedule-wizard-employee-tag"
          >
            <span>[{{ item.employeeCode }}]{{ item.employeeName }}</span>
            <i
              class="bx bx-x schedule-wizard-employee-remove"
              title="删除"
              @click="handleRemoveEmployee(item.employeeCode)"
            ></i>
          </div>
        </div>
        <div class="schedule-wizard-calendar-panel">
          <div class="schedule-wizard-calendar-header">
            <i class="bx bx-chevron-left schedule-wizard-month-arrow" @click="handlePrevMonth"></i>
            <span>{{ calendarTitle }}</span>
            <i class="bx bx-chevron-right schedule-wizard-month-arrow" @click="handleNextMonth"></i>
          </div>
          <div class="schedule-wizard-week-head">
            <div v-for="week in weekdayLabel" :key="week" class="schedule-wizard-week-item">
              {{ week }}
            </div>
          </div>
          <div class="schedule-wizard-calendar-grid">
            <div
              v-for="cell in calendarCells"
              :key="cell.dateText"
              class="schedule-wizard-cell"
              :class="{
                'is-outside': !cell.inMonth,
                'is-current-month': cell.inMonth,
                'is-weekend': cell.isWeekend,
              }"
            >
              <div class="schedule-wizard-cell-day">{{ cell.dayText }}</div>
              <div v-if="cell.hasShift" class="schedule-wizard-cell-shift">
                {{ calendarShiftName || "班次" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showEmployeeDialog"
      title="选择员工"
      width="980px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="schedule-wizard-dialog-filter">
        <el-input
          v-model="employeeFilter.employeeName"
          placeholder="请输入姓名"
          class="schedule-wizard-dialog-control"
          @keyup.enter="handleEmployeeFilter"
          clearable
        />
        <el-cascader
          v-model="employeeFilter.organization"
          :options="organizationCascaderOptions"
          :props="cascaderProps"
          clearable
          filterable
          :show-all-levels="false"
          placeholder="请选择组织"
          class="schedule-wizard-dialog-control"
          @change="handleEmployeeFilter"
        />
        <el-select
          v-model="employeeFilter.attendanceGroup"
          clearable
          filterable
          placeholder="请选择考勤组"
          :loading="attendanceGroupLoading"
          class="schedule-wizard-dialog-control"
          @change="handleEmployeeFilter"
        >
          <el-option
            v-for="item in attendanceGroupOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button type="primary" @click="handleEmployeeFilter">查询</el-button>
      </div>

      <el-table
        ref="employeeTableRef"
        :data="employeeSource"
        border
        height="360"
        v-loading="employeeLoading"
        row-key="archiveId"
        @selection-change="handleEmployeeSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="employeeCode" label="员工编码" min-width="120" />
        <el-table-column prop="employeeName" label="姓名" min-width="100" />
        <el-table-column prop="attendanceOrganization" label="组织" min-width="300" />
        <el-table-column prop="attendanceGroupName" label="考勤组" min-width="160" />
      </el-table>
      <div v-if="employeeTotal > 0" class="schedule-wizard-dialog-pagination">
        <Pagination
          :total="employeeTotal"
          v-model:page="employeePagination.pageNo"
          v-model:limit="employeePagination.pageSize"
          :storage="false"
          :pageSizes="[20, 50, 100, 200]"
          @pagination="handleEmployeePagination"
        />
      </div>
      <template #footer>
        <el-button @click="showEmployeeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEmployees">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showRuleDialog"
      title="轮班规则"
      width="520px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="schedule-wizard-rule-dialog">
        <div class="schedule-wizard-rule-field">
          <span class="schedule-wizard-label">轮班规则</span>
          <el-select
            v-model="ruleDialogForm.ruleId"
            filterable
            placeholder="请选择轮班规则"
            :loading="ruleLoading"
            class="schedule-wizard-rule-select"
          >
            <el-option
              v-for="item in ruleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="schedule-wizard-rule-field">
          <span class="schedule-wizard-label">开始日期</span>
          <el-date-picker
            v-model="ruleDialogForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="schedule-wizard-input"
          />
        </div>
        <div class="schedule-wizard-rule-field">
          <span class="schedule-wizard-label">结束日期</span>
          <el-date-picker
            v-model="ruleDialogForm.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="schedule-wizard-input"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmRule">确定</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<style scoped lang="scss">
.schedule-wizard-page {
  padding: 12px 10px;
  background: #f3f5f7;
}

.schedule-wizard-toolbar {
  display: grid;
  gap: 12px;
  margin-bottom: 10px;
}

.schedule-wizard-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.schedule-wizard-rule-select {
  width: 260px;
}

.schedule-wizard-rule-dialog {
  display: grid;
  gap: 12px;
}

.schedule-wizard-rule-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.schedule-wizard-label {
  min-width: 70px;
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 600;
}

.schedule-wizard-input {
  width: 240px;
}

.schedule-wizard-content {
  display: flex;
  gap: 8px;
  min-height: 600px;
}

.schedule-wizard-employee-panel {
  width: 220px;
  border: 1px solid #cfd6dd;
  background: #fff;
  overflow: auto;
  padding: 6px;
}

.schedule-wizard-employee-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 6px;
  color: #2a4f72;
  font-size: 13px;
  border: 1px solid #d4e2f0;
  background: #ebf3fb;
  margin-bottom: 4px;
}

.schedule-wizard-employee-remove {
  color: #6f86a0;
  font-size: 16px;
  cursor: pointer;
}

.schedule-wizard-employee-remove:hover {
  color: #2f5d87;
}

.schedule-wizard-calendar-panel {
  flex: 1;
  border: 1px solid #cfd6dd;
  background: #dbe2e7;
  padding: 10px;
}

.schedule-wizard-calendar-header {
  width: 180px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #8fa6bb;
  color: #fff;
  line-height: 32px;
  font-size: 14px;
  font-weight: 700;
  padding: 0 8px;
}

.schedule-wizard-month-arrow {
  cursor: pointer;
  font-size: 18px;
  color: #eef5fb;
}

.schedule-wizard-month-arrow:hover {
  color: #ffffff;
}

.schedule-wizard-week-head {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.schedule-wizard-week-item {
  text-align: center;
  line-height: 28px;
  color: #5f7f98;
  background: #f2f4f6;
  border: 1px solid #d6dde3;
  border-right: 0;
}

.schedule-wizard-week-item:last-child {
  border-right: 1px solid #d6dde3;
}

.schedule-wizard-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.schedule-wizard-cell {
  min-height: 88px;
  border: 1px solid #d6dde3;
  border-right: 0;
  border-top: 0;
  background: #fff;
  padding: 6px 4px;
}

.schedule-wizard-cell:nth-child(7n) {
  border-right: 1px solid #d6dde3;
}

.schedule-wizard-cell-day {
  font-size: 24px;
  line-height: 1;
  color: #d7dde2;
  font-weight: 700;
}

.schedule-wizard-cell.is-current-month .schedule-wizard-cell-day {
  color: #9aa7b3;
}

.schedule-wizard-cell.is-weekend {
  background: #ececec;
}

.schedule-wizard-cell.is-outside .schedule-wizard-cell-day {
  color: #dde3e8;
}

.schedule-wizard-cell-shift {
  margin-top: 10px;
  font-size: 13px;
  color: #2d4c67;
}

.schedule-wizard-dialog-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.schedule-wizard-dialog-control {
  width: 220px;
}

.schedule-wizard-dialog-pagination {
  padding-top: 10px;
}
</style>
