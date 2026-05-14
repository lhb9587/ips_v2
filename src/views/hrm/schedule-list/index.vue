<script setup>
import dayjs from "dayjs";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import ScheduleDetailSidebar from "@/views/hrm/schedule-list/detail-sidebar.vue";
import { saveTableConfig } from "@/utils";
import {
  queryAttendanceGroupPage,
  queryAttendanceRotationRuleList,
  queryAttendanceShiftList,
  queryScheduleDetail,
  queryScheduleHorizontalPage,
  queryScheduleWizardMemberPage,
  submitScheduleDetailUpdate,
  submitScheduleSwap,
  submitScheduleWizard,
} from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const bussId = 458;
const gridName = "scheduleListGrid";
const DATE_TYPE_MAP = {
  workday: "工作日",
  restday: "休息日",
  holiday: "节假日",
};

const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const diminput = ref("");
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailSubmitLoading = ref(false);
const selectedDetail = ref({});
const detailShiftLoading = ref(false);
const detailShiftOptions = ref([]);
const total = ref(0);
const gridData = ref([]);
const formInline = ref({
  startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const showRuleDialog = ref(false);
const employeeTableRef = ref(null);
const employeeLoading = ref(false);
const employeeTotal = ref(0);
const ruleLoading = ref(false);
const submitRuleLoading = ref(false);
const swapLoading = ref(false);
const selectedEmployees = ref([]);
const createInitialRuleForm = () => ({
  attendanceSystem: "默认考勤制度",
  attendanceGroup: "",
  organization: "",
  employeeName: "",
  ruleId: "",
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
  holidayHandling: "顺延",
});
const ruleForm = ref({
  ...createInitialRuleForm(),
});

const ruleOptions = ref([]);

const employeeSource = ref([]);
const employeePagination = ref({
  pageNo: 1,
  pageSize: 100,
});
const attendanceGroupOptions = ref([]);
const attendanceGroupLoading = ref(false);
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
const buildWizardMemberRecord = (item = {}) => ({
  id: item.archiveId || item.talentCode || "",
  employeeCode: item.talentCode || "",
  employeeName: item.talentName || "",
  attendanceOrganization: item.deptName || "",
  attendanceOrganizationCode: item.deptCode || "",
  attendanceGroupId: item.attendanceGroupId || "",
  attendanceGroupName: item.attendanceGroupName || "",
  archiveId: item.archiveId || "",
  canSchedule: item.canSchedule !== false,
  cannotScheduleReason: item.cannotScheduleReason || "",
});
const buildScheduleDetailRecord = (item = {}) => ({
  scheduleDayId: item.scheduleDayId || "",
  talentCode: item.talentCode || "",
  talentName: item.talentName || "",
  attendanceOrgCode: item.attendanceOrgCode || "",
  attendanceOrgName: item.attendanceOrgName || "",
  scheduleDate: item.scheduleDate || "",
  dateTypeValue: item.dateType || "",
  dateType: DATE_TYPE_MAP[item.dateType] || item.dateType || "",
  attendanceArchiveCode: item.attendanceArchiveCode || "",
  attendancePolicyCode: item.attendancePolicyCode || "",
  attendancePolicyName: item.attendancePolicyName || item.attendancePolicyCode || "",
  canEdit: item.canEdit === true,
  standardHours:
    item.standardHours || item.standardHours === 0 ? item.standardHours : "",
  shiftCode: item.shiftCode || "",
  shiftName: item.shiftName || "",
  fetchCardRuleCode: item.fetchCardRuleCode || "",
  fetchCardRuleName: item.fetchCardRuleName || item.fetchCardRuleCode || "",
  segments: Array.isArray(item.segments)
    ? item.segments.map((segment) => ({
        segmentNo: segment.segmentNo,
        attendanceType: segment.attendanceType || "",
        referenceDate: segment.referenceDate || segment.startReferenceDate || "current",
        workStartTime: segment.workStartTime || "",
        startNeedPunch: segment.startNeedPunch,
        startFloatMinutes: segment.startFloatMinutes || 0,
        workEndTime: segment.workEndTime || "",
        endNeedPunch: segment.endNeedPunch,
        endFloatMinutes: segment.endFloatMinutes || 0,
        restStartTime: segment.restStartTime || "",
        restEndTime: segment.restEndTime || "",
        restMinutes: segment.restMinutes || 0,
      }))
    : [],
});
const currentOperator = computed(() => ({
  operatorId: store.state.user.userId || undefined,
  operatorName: store.state.user.name || undefined,
}));

const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 244;
  }
  return windowHeight - 290;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => store.state.layout.layoutType,
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 10;
  return Math.min(pageSize, 100);
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 20, 50, 100]);

const fetchAttendanceGroupOptions = () => {
  attendanceGroupLoading.value = true;
  return queryAttendanceGroupPage(
    {
      pageNo: 1,
      pageSize: 1000,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      attendanceGroupOptions.value = records.map((item) => ({
        value: item.groupId || item.groupCode,
        label: item.groupName || item.name || "",
      }));
      return attendanceGroupOptions.value;
    })
    .catch(() => {
      attendanceGroupOptions.value = [];
      return [];
    })
    .finally(() => {
      attendanceGroupLoading.value = false;
    });
};

const fetchWizardMembers = () => {
  employeeLoading.value = true;
  return queryScheduleWizardMemberPage(
    {
      deptCode: ruleForm.value.organization || undefined,
      groupId: ruleForm.value.attendanceGroup || undefined,
      talentName: ruleForm.value.employeeName || undefined,
      pageNo: employeePagination.value.pageNo,
      pageSize: employeePagination.value.pageSize,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      employeeSource.value = records.map((item) => buildWizardMemberRecord(item));
      employeeTotal.value = Number(res?.total) || Number(res?.data?.total) || 0;
      if (Number(res?.currPage)) {
        employeePagination.value.pageNo = Number(res.currPage);
      }
    })
    .catch(() => {
      employeeSource.value = [];
      employeeTotal.value = 0;
    })
    .finally(() => {
      employeeLoading.value = false;
    });
};

const fetchRotationRuleOptions = () => {
  ruleLoading.value = true;
  return queryAttendanceRotationRuleList(
    {
      organizationCode: ruleForm.value.organization || undefined,
    },
    {
      isLoading: false,
    },
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

const fetchDetailShiftOptions = () => {
  detailShiftLoading.value = true;
  return queryAttendanceShiftList(
    {},
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      detailShiftOptions.value = records.map((item) => ({
        label: item.shiftName || "",
        value: item.shiftCode || "",
      }));
      return detailShiftOptions.value;
    })
    .catch(() => {
      detailShiftOptions.value = [];
      return [];
    })
    .finally(() => {
      detailShiftLoading.value = false;
    });
};

const fetchScheduleList = () => {
  queryScheduleHorizontalPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 100),
      startDate: formInline.value.startDate,
      endDate: formInline.value.endDate,
      talentCode: diminput.value || undefined,
      talentName: diminput.value || undefined,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      gridData.value = records.map((item, index) => ({
        ...item,
        id: item.scheduleDayId,
        employeeCode: item.talentCode || "",
        employeeName: item.talentName || "",
        attendanceOrganization: item.attendanceOrgName || "",
        attendanceGroupName:
          item.attendanceGroupName || item.groupName || item.attendanceGroup || "",
        attendanceDate: item.scheduleDate || "",
        dateType: DATE_TYPE_MAP[item.dateType] || item.dateType || "",
        shiftName: item.shiftName || "",
        workStartTime: item.workStartTime || "",
        workEndTime: item.workEndTime || "",
        attendanceNo: item.attendanceArchiveCode || "",
        attendanceSystem:
          item.attendancePolicyName || item.attendancePolicyCode || "",
        cardRule: item.fetchCardRuleName || item.fetchCardRuleCode || "",
        sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
      }));
      total.value = res?.total || 0;
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const changeBorder = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("Borderline")) {
      activeClass.value.push("Borderline");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "Borderline");
  }
  saveTableConfig("isBorderline", gridName, newVal);
};

const changeRowStyle = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("zebra")) {
      activeClass.value.push("zebra");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "zebra");
  }
  saveTableConfig("iszebra", gridName, newVal);
};

const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!document.fullscreenElement) {
    element.requestFullscreen().then(() => {
      setTimeout(() => {
        gridHeight.value = document.documentElement.clientHeight - 155;
      }, 100);
    });
  } else {
    document.exitFullscreen().then(() => {
      gridHeight.value = calculateGridHeight();
    });
  }
};

const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchScheduleList();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  formInline.value.startDate = range[0] || "";
  formInline.value.endDate = range[1] || "";
  fuzzySearch();
};

const openRuleDialog = () => {
  resetRuleDialogState();
  fetchRotationRuleOptions();
  fetchWizardMembers();
  showRuleDialog.value = true;
};

const resetRuleDialogState = () => {
  ruleForm.value = createInitialRuleForm();
  selectedEmployees.value = [];
  employeeSource.value = [];
  employeeTotal.value = 0;
  employeePagination.value = {
    pageNo: 1,
    pageSize: 100,
  };
  employeeTableRef.value?.clearSelection?.();
};

const handleRuleDialogClose = () => {
  resetRuleDialogState();
};

const getScheduleDayId = (row = {}) => row.scheduleDayId || row.id;

const formatSwapMessage = (data = {}, sourceRow = {}, targetRow = {}) => {
  if (data.message) {
    return data.message;
  }
  const sourceText = `${sourceRow.employeeName || data.sourceTalentName || ""}${
    sourceRow.attendanceDate || data.sourceScheduleDate || ""
      ? `（${sourceRow.attendanceDate || data.sourceScheduleDate}）`
      : ""
  }`;
  const targetText = `${targetRow.employeeName || data.targetTalentName || ""}${
    targetRow.attendanceDate || data.targetScheduleDate || ""
      ? `（${targetRow.attendanceDate || data.targetScheduleDate}）`
      : ""
  }`;
  if (sourceText.trim() && targetText.trim()) {
    return `调班成功：${sourceText} 与 ${targetText}`;
  }
  return "调班成功";
};

const handleScheduleSwap = () => {
  const selectedRows = gridRef.value?.getRowList?.() || [];
  if (selectedRows.length !== 2) {
    ElMessage.warning("请选择两条排班记录进行调班");
    return;
  }
  const [sourceRow, targetRow] = selectedRows;
  const sourceScheduleDayId = getScheduleDayId(sourceRow);
  const targetScheduleDayId = getScheduleDayId(targetRow);
  if (!sourceScheduleDayId || !targetScheduleDayId) {
    ElMessage.warning("选中的排班记录缺少日排班ID，无法调班");
    return;
  }
  swapLoading.value = true;
  submitScheduleSwap(
    {
      sourceScheduleDayId,
      targetScheduleDayId,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      ElMessage.success(formatSwapMessage(res?.data || {}, sourceRow, targetRow));
      fetchScheduleList();
    })
    .finally(() => {
      swapLoading.value = false;
    });
};

const handleOpenScheduleSwapList = () => {
  router.push({
    name: "schedule-swap-list",
  });
};

const handleOpenUnscheduledList = () => {
  router.push({
    name: "schedule-unscheduled-list",
  });
};

const handleOpenVerticalList = () => {
  router.push({
    name: "schedule-vertical-list",
  });
};

const handleEmployeeSelectionChange = (rows) => {
  selectedEmployees.value = rows;
};

const handleEmployeeFilter = async () => {
  await nextTick();
  employeePagination.value.pageNo = 1;
  fetchWizardMembers();
  selectedEmployees.value = [];
  employeeTableRef.value?.clearSelection?.();
};

const handleEmployeePagination = () => {
  fetchWizardMembers();
};

const submitRuleDialog = () => {
  if (!selectedEmployees.value.length) {
    ElMessage.warning("请先选择人员");
    return;
  }
  if (!ruleForm.value.ruleId) {
    ElMessage.warning("请先指定轮班规则");
    return;
  }
  if (!ruleForm.value.startDate || !ruleForm.value.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  submitRuleLoading.value = true;
  submitScheduleWizard(
    {
      startDate: ruleForm.value.startDate,
      endDate: ruleForm.value.endDate,
      rotationRuleCode: ruleForm.value.ruleId,
      holidayHandleMode: "DELAY",
      memberTalentCodes: selectedEmployees.value
        .map((item) => item.employeeCode)
        .filter(Boolean),
      ...currentOperator.value,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      showRuleDialog.value = false;
      fetchScheduleList();
      ElMessage.success(res?.data?.message || "轮班规则已应用");
    })
    .finally(() => {
      submitRuleLoading.value = false;
    });
};

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const buildScheduleDetailQuery = (rowData = {}) => {
  if (rowData.id || rowData.scheduleDayId) {
    return {
      scheduleDayId: rowData.id || rowData.scheduleDayId,
    };
  }

  return {
    talentCode: rowData.talentCode || rowData.employeeCode || undefined,
    scheduleDate: rowData.scheduleDate || rowData.attendanceDate || undefined,
  };
};

const openScheduleDetail = (params) => {
  const rowData = params?.data || params;
  const query = buildScheduleDetailQuery(rowData);
  if (!query.scheduleDayId && !(query.talentCode && query.scheduleDate)) {
    return;
  }
  detailVisible.value = true;
  detailLoading.value = true;
  selectedDetail.value = buildScheduleDetailRecord(rowData);
  queryScheduleDetail(
    query,
    {
      isLoading: false,
    },
  )
    .then((res) => {
      selectedDetail.value = buildScheduleDetailRecord({
        ...rowData,
        ...(res?.data || {}),
      });
    })
    .catch(() => {
      selectedDetail.value = {};
      detailVisible.value = false;
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const handleDetailEdit = () => {
  if (!detailShiftOptions.value.length) {
    fetchDetailShiftOptions();
  }
};

const handleDetailSave = (payload) => {
  detailSubmitLoading.value = true;
  return submitScheduleDetailUpdate(
    {
      scheduleDayId: payload.scheduleDayId,
      dateType: payload.dateType,
      shiftCode: payload.shiftCode,
      segments: payload.segments,
      ...currentOperator.value,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      ElMessage.success(res?.data?.message || "保存成功");
      return queryScheduleDetail(
        {
          scheduleDayId: payload.scheduleDayId,
        },
        {
          isLoading: false,
        },
      ).then((detailRes) => {
        selectedDetail.value = buildScheduleDetailRecord(detailRes?.data || {});
        fetchScheduleList();
      });
    })
    .finally(() => {
      detailSubmitLoading.value = false;
    });
};

const handlePagination = () => {
  fetchScheduleList();
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchAttendanceGroupOptions();
  fetchRotationRuleOptions();
  fetchScheduleList();
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
          class="card box"
          ref="boxRef"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 200px"
                    placeholder="搜索..."
                    clearable
                    class="top-search"
                    @keyup.enter="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="schedule-list__date-range"
                    style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                    clearable
                    @change="handleDateRangeChange"
                  />
                  <el-button
                    type="primary"
                    plain
                    @click="openRuleDialog"
                  >
                    轮班规则
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    :loading="swapLoading"
                    @click="handleScheduleSwap"
                  >
                    调班
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    @click="handleOpenScheduleSwapList"
                  >
                    调班单
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    @click="handleOpenUnscheduledList"
                  >
                    未排班列表
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    @click="handleOpenVerticalList"
                  >
                    纵向显示
                  </el-button>
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: diminput,
                  }"
                  :isFull="isFull"
                >
                </TopListTool>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :bussId="bussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
              :showSelectionColumn="true"
              :rowClick="openScheduleDetail"
              :gridOptions="gridOptions"
            />
          </div>
          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :pageSizes="pageSizesList"
              @pagination="handlePagination"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showRuleDialog"
      title="轮班规则"
      width="980px"
      destroy-on-close
      class="schedule-rule-dialog"
      :close-on-click-modal="false"
      @closed="handleRuleDialogClose"
    >
      <div class="schedule-rule-dialog__body">
        <div class="schedule-rule-dialog__filter">
          <div class="schedule-rule-dialog__filter-row">
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">考勤制度</div>
              <el-input
                v-model="ruleForm.attendanceSystem"
                readonly
                class="schedule-rule-dialog__input"
              >
                <template #append>
                  <i class="bx bx-list-ul"></i>
                </template>
              </el-input>
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">组织</div>
              <el-cascader
                v-model="ruleForm.organization"
                class="schedule-rule-dialog__input"
                :options="organizationCascaderOptions"
                :props="cascaderProps"
                clearable
                filterable
                :show-all-levels="false"
                placeholder="请选择组织"
              />
            </div>
          </div>
          <div class="schedule-rule-dialog__filter-row">
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">考勤组</div>
              <el-select
                v-model="ruleForm.attendanceGroup"
                class="schedule-rule-dialog__input"
                clearable
                filterable
                :loading="attendanceGroupLoading"
                placeholder="请选择考勤组"
                @change="handleEmployeeFilter"
              >
                <el-option
                  v-for="item in attendanceGroupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">姓名</div>
              <div class="schedule-rule-dialog__search">
                <el-input
                  v-model="ruleForm.employeeName"
                  class="schedule-rule-dialog__input"
                  @keyup.enter="handleEmployeeFilter"
                />
                <el-button
                  type="primary"
                  @click="handleEmployeeFilter"
                >
                  查询
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="schedule-rule-dialog__table-wrap">
          <el-table
            ref="employeeTableRef"
            :data="employeeSource"
            border
            height="360"
            v-loading="employeeLoading"
            row-key="archiveId"
            @selection-change="handleEmployeeSelectionChange"
          >
            <el-table-column
              type="selection"
              width="48"
            />
            <el-table-column
              prop="employeeCode"
              label="员工编码"
              min-width="120"
            />
            <el-table-column
              prop="employeeName"
              label="姓名"
              min-width="100"
            />
            <el-table-column
              prop="attendanceOrganization"
              label="组织"
              min-width="320"
            />
            <el-table-column
              prop="attendanceGroupName"
              label="考勤组"
              min-width="180"
            />
          </el-table>
        </div>
        <div
          v-if="employeeTotal > 0"
          class="schedule-rule-dialog__table-pagination"
        >
          <Pagination
            :total="employeeTotal"
            v-model:page="employeePagination.pageNo"
            v-model:limit="employeePagination.pageSize"
            :pageSizes="[20, 50, 100, 200]"
            :storage="false"
            @pagination="handleEmployeePagination"
          />
        </div>

        <div class="schedule-rule-dialog__footer-form">
          <div class="schedule-rule-dialog__field schedule-rule-dialog__field--full">
            <div class="schedule-rule-dialog__label">轮班规则</div>
            <el-select
              v-model="ruleForm.ruleId"
              filterable
              :loading="ruleLoading"
              placeholder="请选择轮班规则"
              class="schedule-rule-dialog__rule-select"
            >
              <el-option
                v-for="item in ruleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="schedule-rule-dialog__rule-grid">
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">开始日期</div>
              <el-date-picker
                v-model="ruleForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="schedule-rule-dialog__input"
              />
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">结束日期</div>
              <el-date-picker
                v-model="ruleForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="schedule-rule-dialog__input"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitRuleLoading"
          @click="submitRuleDialog"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <DragSidebar
      v-if="detailVisible"
      v-model="detailVisible"
      sidebarName="schedule-list-detail-sidebar"
      :minWidth="760"
      :width="920"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetail"
    >
      <ScheduleDetailSidebar
        :detailInfo="selectedDetail"
        :loading="detailLoading"
        :shiftOptions="detailShiftOptions"
        :shiftLoading="detailShiftLoading"
        :submitLoading="detailSubmitLoading"
        @edit="handleDetailEdit"
        @save="handleDetailSave"
        @close="closeDetail"
      />
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

:deep(.schedule-list__date-range.el-date-editor--daterange),
.schedule-list__date-range {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}

.schedule-rule-dialog__body {
  display: grid;
  gap: 16px;
}

.schedule-rule-dialog__filter {
  padding: 8px 12px 2px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fafcff;
}

.schedule-rule-dialog__filter-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 28px;
  margin-bottom: 14px;
}

.schedule-rule-dialog__field {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.schedule-rule-dialog__field--full {
  width: 100%;
}

.schedule-rule-dialog__label {
  color: #4c5d78;
  font-size: 14px;
  text-align: right;
}

.schedule-rule-dialog__input {
  width: 100%;
}

.schedule-rule-dialog__search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  gap: 10px;
}

.schedule-rule-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-rule-dialog__table-pagination {
  margin-top: -4px;
}

.schedule-rule-dialog__footer-form {
  display: grid;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fbfcfe;
}

.schedule-rule-dialog__rule-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 28px;
}

.schedule-rule-dialog__rule-select {
  width: 100%;
}

:deep(.schedule-rule-dialog .el-dialog__body) {
  padding-top: 14px;
}

:deep(.schedule-rule-dialog .el-input-group__append) {
  padding: 0 10px;
  color: #5f6f89;
  background: #f6f9fc;
}

:deep(.schedule-rule-dialog .el-table th.el-table__cell) {
  background: #f6f8fb;
  color: #243449;
}

@media (max-width: 960px) {
  .schedule-rule-dialog__filter-row {
    grid-template-columns: 1fr;
  }

  .schedule-rule-dialog__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .schedule-rule-dialog__rule-grid {
    grid-template-columns: 1fr;
  }

  .schedule-rule-dialog__label {
    text-align: left;
  }
}
</style>
