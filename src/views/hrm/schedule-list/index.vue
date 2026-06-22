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
import ListSearch from "@/components/common/list-search/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import ScheduleDetailSidebar from "@/views/hrm/schedule-list/detail-sidebar.vue";
import { downLoad, saveTableConfig } from "@/utils";
import {
  exportScheduleList,
  queryAttendanceGroupPage,
  queryAttendanceRotationRuleList,
  queryAttendanceShiftDetail,
  queryAttendanceShiftList,
  queryScheduleDetail,
  queryScheduleHorizontalPage,
  queryScheduleUnscheduledPage,
  queryScheduleVerticalPage,
  queryScheduleWizardMemberPage,
  submitScheduleDetailUpdate,
  submitScheduleTimeRevision,
  submitScheduleSwap,
  submitScheduleWizard,
} from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const TAB_MAP = {
  horizontal: {
    label: "横向显示",
    bussId: 458,
    gridName: "scheduleListGrid",
  },
  vertical: {
    label: "纵向显示",
    bussId: 0,
    gridName: "scheduleVerticalListGrid",
  },
  unscheduled: {
    label: "未排班列表",
    bussId: 460,
    gridName: "scheduleUnscheduledListGrid",
  },
};

const MAX_SCHEDULE_DATE_RANGE_DAYS = 31;
const MAX_VERTICAL_DATE_RANGE_DAYS = 31;
const WEEK_TEXT = ["日", "一", "二", "三", "四", "五", "六"];

const resolveInitialTab = () => {
  const tab = route.query.tab;
  return TAB_MAP[tab] ? tab : "horizontal";
};

const activeTab = ref(resolveInitialTab());
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
const showTimeRevisionDialog = ref(false);
const showTimeRevisionEmployeeDialog = ref(false);
const timeRevisionLoading = ref(false);
const timeRevisionShiftDetailLoading = ref(false);
const timeRevisionMemberLoading = ref(false);
const timeRevisionMemberOptions = ref([]);
const timeRevisionEmployeeTableRef = ref(null);
const timeRevisionSelectedCandidates = ref([]);
const timeRevisionMemberTotal = ref(0);
const timeRevisionCandidateQuery = ref({
  talentCode: "",
  talentName: "",
  deptCodes: [],
  pageNo: 1,
  pageSize: 10,
});
const timeRevisionForm = ref({
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
  shiftCode: "",
  employees: [],
  segments: [],
});
const total = ref(0);
const gridData = ref([]);
const formInline = ref({
  startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
});
const advancedFilter = ref({});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const currentBussId = computed(() => TAB_MAP[activeTab.value].bussId);
const currentGridName = computed(() => TAB_MAP[activeTab.value].gridName);
const showScheduleWizardAction = computed(
  () =>
    activeTab.value === "horizontal" ||
    activeTab.value === "vertical" ||
    activeTab.value === "unscheduled",
);
const showTimeRevisionAction = computed(
  () => activeTab.value === "horizontal" || activeTab.value === "vertical",
);
const showMoreAction = computed(() => activeTab.value === "horizontal");
const showVerticalExport = computed(() => activeTab.value === "vertical");
const showSelectionColumn = computed(
  () => activeTab.value === "horizontal" || activeTab.value === "vertical",
);
const showRowClick = computed(() => activeTab.value === "horizontal");
const currentGridOptions = computed(() =>
  activeTab.value === "horizontal" ? gridOptions : undefined,
);

const dynamicDateList = computed(() => {
  const start = dayjs(formInline.value.startDate);
  const end = dayjs(formInline.value.endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
    return [];
  }
  const result = [];
  let cursor = start;
  while (cursor.isBefore(end, "day") || cursor.isSame(end, "day")) {
    const dateKey = cursor.format("YYYY-MM-DD");
    result.push({
      key: dateKey,
      title: `${dateKey}(${WEEK_TEXT[cursor.day()]})`,
    });
    cursor = cursor.add(1, "day");
  }
  return result;
});

const verticalColumnList = computed(() => {
  const fixedColumns = [
    { title: "序号", value: "sid", width: 70, minWidth: 70, maxWidth: 90 },
    { title: "员工编码", value: "employeeCode", minWidth: 120 },
    { title: "姓名", value: "employeeName", minWidth: 120 },
    { title: "考勤组织", value: "attendanceOrganization", minWidth: 220 },
  ];
  const dateColumns = dynamicDateList.value.map((item) => ({
    title: item.title,
    value: `day_${item.key}`,
    minWidth: 160,
  }));
  return [...fixedColumns, ...dateColumns];
});

const currentColumnDefs = computed(() =>
  activeTab.value === "vertical" ? verticalColumnList.value : columnList.value,
);

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
  dateType: item.dateType || "",
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
  const windowHeight = document.documentElement.clientHeight;
  if (store.state.layout.embedMode) {
    return windowHeight - 135;
  }
  const layout = store.state.layout.layoutType;
  if (layout === "vertical") {
    return windowHeight - 235;
  }
  return windowHeight - 290;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => [store.state.layout.layoutType, store.state.layout.embedMode],
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 50;
  return pageSize;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

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

const mapDayText = (dayItem = {}) => {
  if (!dayItem.scheduled) {
    return "未排班";
  }
  if (dayItem.shiftName) {
    return dayItem.shiftName;
  }
  if (dayItem.shiftCode) {
    return dayItem.shiftCode;
  }
  return "已排班";
};

const DATE_KEY_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:[(（].*[)）])?$/;

const normalizeDateKey = (rawKey = "") => {
  const key = String(rawKey || "").trim();
  const match = key.match(DATE_KEY_PATTERN);
  return match ? match[1] : "";
};

const collectFlatDateMap = (record = {}) => {
  const result = {};
  const mergeFromObject = (obj = {}) => {
    Object.keys(obj).forEach((key) => {
      const dateKey = normalizeDateKey(key);
      if (dateKey) {
        result[dateKey] = obj[key];
      }
    });
  };

  mergeFromObject(record);
  Object.keys(record).forEach((key) => {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      mergeFromObject(value);
    }
  });

  return result;
};

const isEmptyValue = (value) => value === undefined || value === null || value === "";

const buildSharedQueryParams = () => {
  const searchWord = diminput.value.trim();
  return {
    startDate: formInline.value.startDate,
    endDate: formInline.value.endDate,
    talentName: searchWord || undefined,
    ...advancedFilter.value,
  };
};

const validateVerticalDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return true;
  }
  if (dayjs(endDate).isBefore(dayjs(startDate), "day")) {
    ElMessage.warning("结束日期不能早于开始日期");
    return false;
  }
  const spanDays = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
  if (spanDays > MAX_VERTICAL_DATE_RANGE_DAYS) {
    ElMessage.warning(`日期范围不能超过 ${MAX_VERTICAL_DATE_RANGE_DAYS} 天`);
    return false;
  }
  return true;
};

const validateDateRangeForTab = (startDate, endDate, tab = activeTab.value) => {
  if (tab === "vertical") {
    return validateVerticalDateRange(startDate, endDate);
  }
  return validateScheduleDateRange(startDate, endDate);
};

const fetchHorizontalList = () => {
  if (!validateScheduleDateRange(formInline.value.startDate, formInline.value.endDate)) {
    return;
  }
  queryScheduleHorizontalPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      ...buildSharedQueryParams(),
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
        dateType: item.dateType || "",
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

const fetchVerticalList = () => {
  if (!validateVerticalDateRange(formInline.value.startDate, formInline.value.endDate)) {
    return;
  }
  queryScheduleVerticalPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      ...buildSharedQueryParams(),
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      gridData.value = records.map((item, index) => {
        const flatDateMap = collectFlatDateMap(item);
        const row = {
          ...item,
          id: item.talentCode || `${item.attendanceOrgCode || ""}_${index}`,
          employeeCode: item.talentCode || "",
          employeeName: item.talentName || "",
          attendanceOrganization: item.attendanceOrgName || "",
          sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
        };

        const dayMap = {};
        (item.days || []).forEach((dayItem) => {
          if (dayItem?.scheduleDate) {
            dayMap[dayItem.scheduleDate] = mapDayText(dayItem);
          }
        });

        dynamicDateList.value.forEach((dateItem) => {
          const dayValueByFlatKey = flatDateMap[dateItem.key];
          const dayValueByDays = dayMap[dateItem.key];
          const finalValue = !isEmptyValue(dayValueByFlatKey)
            ? dayValueByFlatKey
            : !isEmptyValue(dayValueByDays)
              ? dayValueByDays
              : undefined;
          row[`day_${dateItem.key}`] = isEmptyValue(finalValue) ? "未排班" : finalValue;
        });

        return row;
      });
      total.value = Number(res?.total) || Number(res?.data?.total) || 0;
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fetchUnscheduledList = () => {
  if (!validateScheduleDateRange(formInline.value.startDate, formInline.value.endDate)) {
    return;
  }
  queryScheduleUnscheduledPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      ...buildSharedQueryParams(),
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      gridData.value = records.map((item, index) => ({
        ...item,
        id: item.talentCode || `${item.attendanceOrgCode || ""}_${index}`,
        employeeCode: item.talentCode || "",
        employeeName: item.talentName || "",
        attendanceOrganization: item.attendanceOrgName || "",
        employeeStatus: item.empStatus || "",
        sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
      }));
      total.value = Number(res?.total) || Number(res?.data?.total) || 0;
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fetchActiveTabList = () => {
  if (activeTab.value === "vertical") {
    return fetchVerticalList();
  }
  if (activeTab.value === "unscheduled") {
    return fetchUnscheduledList();
  }
  return fetchHorizontalList();
};

const changeBorder = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("Borderline")) {
      activeClass.value.push("Borderline");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "Borderline");
  }
  saveTableConfig("isBorderline", currentGridName.value, newVal);
};

const changeRowStyle = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("zebra")) {
      activeClass.value.push("zebra");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "zebra");
  }
  saveTableConfig("iszebra", currentGridName.value, newVal);
};

const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", currentGridName.value, height);
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
  advancedFilter.value = {};
  fetchActiveTabList();
};

const handleAdvancedSearch = (typeStr) => {
  diminput.value = "";
  listQuery.value.pageNo = 1;
  advancedFilter.value = { ...typeStr.data };
  fetchActiveTabList();
};

const validateScheduleDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return true;
  }
  if (dayjs(endDate).isBefore(dayjs(startDate), "day")) {
    ElMessage.warning("结束日期不能早于开始日期");
    return false;
  }
  const spanDays = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
  if (spanDays > MAX_SCHEDULE_DATE_RANGE_DAYS) {
    ElMessage.warning(`日期范围不能超过 ${MAX_SCHEDULE_DATE_RANGE_DAYS} 天`);
    return false;
  }
  return true;
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  const startDate = range[0] || "";
  const endDate = range[1] || "";
  if (!validateDateRangeForTab(startDate, endDate)) {
    dateRange.value = [formInline.value.startDate, formInline.value.endDate];
    return;
  }
  formInline.value.startDate = startDate;
  formInline.value.endDate = endDate;
  fuzzySearch();
};

const handleTabChange = () => {
  listQuery.value.pageNo = 1;
  fetchActiveTabList();
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const buildExportParams = () => ({
  ...buildSharedQueryParams(),
  ...currentOperator.value,
});

const handleExport = (command) => {
  if (!validateVerticalDateRange(formInline.value.startDate, formInline.value.endDate)) {
    return;
  }
  const payload = {
    ...buildExportParams(),
    exportScope: command === "exportSelected" ? "SELECTED" : "ALL",
  };

  if (command === "exportSelected") {
    const selectedRows = getSelectedRows();
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要导出的记录");
    }
    const selectedTalentCodes = [
      ...new Set(
        selectedRows
          .map((item) => item.talentCode || item.employeeCode)
          .filter((item) => item || item === 0),
      ),
    ];
    if (selectedTalentCodes.length === 0) {
      return ElMessage.warning("选中记录缺少员工编码，无法导出");
    }
    if (selectedTalentCodes.length > 500) {
      return ElMessage.warning("选中导出员工不能超过500人");
    }
    payload.selectedTalentCodes = selectedTalentCodes.join(",");
  }

  exportScheduleList(payload, { isLoading: true }).then((res) => {
    const filePath = res?.data?.filePath;
    const fileName = res?.data?.fileName || "排班列表.xlsx";
    if (!filePath) {
      return ElMessage.warning("导出文件地址为空");
    }
    downLoad(filePath, fileName);
    ElMessage.success(command === "exportSelected" ? "选中导出成功" : "全部导出成功");
  });
};

// const openRuleDialog = () => {
//   resetRuleDialogState();
//   fetchRotationRuleOptions();
//   fetchWizardMembers();
//   showRuleDialog.value = true;
// };

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
      fetchActiveTabList();
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

const handleOpenScheduleWizard = () => {
  router.push({
    name: "schedule-wizard",
  });
};

const buildRevisionSegmentRecord = (item = {}, index = 0) => ({
  segmentNo: item.segmentNo || index + 1,
  attendanceType: item.attendanceType || "",
  referenceDate: item.referenceDate || item.onDutyRefDate || "current",
  workStartTime: item.workStartTime || item.onDutyTime || "",
  startNeedPunch:
    item.startNeedPunch === false
      ? 0
      : item.startNeedPunch === true
        ? 1
        : Number(item.startNeedPunch ?? item.onDutyNeedPunch ?? 1),
  workEndTime: item.workEndTime || item.offDutyTime || "",
  endNeedPunch:
    item.endNeedPunch === false
      ? 0
      : item.endNeedPunch === true
        ? 1
        : Number(item.endNeedPunch ?? item.offDutyNeedPunch ?? 1),
});

const resetTimeRevisionForm = () => {
  timeRevisionForm.value = {
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    shiftCode: "",
    employees: [],
    segments: [],
  };
  timeRevisionMemberOptions.value = [];
  timeRevisionMemberTotal.value = 0;
  timeRevisionCandidateQuery.value = {
    talentCode: "",
    talentName: "",
    deptCodes: [],
    pageNo: 1,
    pageSize: 10,
  };
  timeRevisionSelectedCandidates.value = [];
  timeRevisionEmployeeTableRef.value?.clearSelection?.();
};

const fetchTimeRevisionMembers = () => {
  timeRevisionMemberLoading.value = true;
  return queryScheduleWizardMemberPage(
    {
      deptCode: undefined,
      deptCodes: timeRevisionCandidateQuery.value.deptCodes?.length
        ? timeRevisionCandidateQuery.value.deptCodes
        : undefined,
      talentCode: timeRevisionCandidateQuery.value.talentCode || undefined,
      talentName: timeRevisionCandidateQuery.value.talentName || undefined,
      pageNo: timeRevisionCandidateQuery.value.pageNo,
      pageSize: timeRevisionCandidateQuery.value.pageSize,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      timeRevisionMemberOptions.value = records.map((item) => ({
        employeeCode: item.talentCode || "",
        employeeName: item.talentName || "",
        attendanceOrganization: item.deptName || "",
        attendanceOrganizationCode: item.deptCode || "",
        selectionDisabled: timeRevisionForm.value.employees.some(
          (employee) => employee.employeeCode === (item.talentCode || ""),
        ),
      }));
      timeRevisionMemberTotal.value = Number(res?.total) || Number(res?.data?.total) || 0;
      if (Number(res?.currPage)) {
        timeRevisionCandidateQuery.value.pageNo = Number(res.currPage);
      }
      timeRevisionSelectedCandidates.value = [];
      nextTick(() => {
        timeRevisionEmployeeTableRef.value?.clearSelection?.();
      });
    })
    .finally(() => {
      timeRevisionMemberLoading.value = false;
    });
};

const handleOpenTimeRevisionDialog = () => {
  resetTimeRevisionForm();
  fetchDetailShiftOptions();
  showTimeRevisionDialog.value = true;
};

const handleTimeRevisionShiftChange = (value) => {
  if (!value) {
    timeRevisionForm.value.segments = [];
    return;
  }
  timeRevisionShiftDetailLoading.value = true;
  queryAttendanceShiftDetail(
    {
      shiftCode: value,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const segments = Array.isArray(res?.data?.segments) ? res.data.segments : [];
      timeRevisionForm.value.segments = segments.map((item, index) =>
        buildRevisionSegmentRecord(item, index),
      );
    })
    .finally(() => {
      timeRevisionShiftDetailLoading.value = false;
    });
};

const timeRevisionEmployeeNames = computed(() =>
  (timeRevisionForm.value.employees || []).map((item) => item.employeeName).join("，"),
);

const openTimeRevisionEmployeeDialog = () => {
  timeRevisionCandidateQuery.value.pageNo = 1;
  timeRevisionCandidateQuery.value.talentCode = "";
  timeRevisionCandidateQuery.value.talentName = "";
  timeRevisionCandidateQuery.value.deptCodes = [];
  showTimeRevisionEmployeeDialog.value = true;
  fetchTimeRevisionMembers();
};

const handleTimeRevisionEmployeeSelection = (rows) => {
  timeRevisionSelectedCandidates.value = rows;
};

const handleTimeRevisionEmployeeSearch = () => {
  timeRevisionCandidateQuery.value.pageNo = 1;
  fetchTimeRevisionMembers();
};

const handleTimeRevisionCandidateDeptChange = (value) => {
  timeRevisionCandidateQuery.value.deptCodes = Array.isArray(value) ? value : [];
  timeRevisionCandidateQuery.value.pageNo = 1;
  fetchTimeRevisionMembers();
};

const handleTimeRevisionEmployeePagination = () => {
  fetchTimeRevisionMembers();
};

const timeRevisionCandidateRowSelectable = (row) => !row.selectionDisabled;

const confirmTimeRevisionEmployees = () => {
  if (!timeRevisionSelectedCandidates.value.length) {
    ElMessage.warning("请先选择员工");
    return;
  }
  const employeeMap = new Map(
    (timeRevisionForm.value.employees || []).map((item) => [item.employeeCode, item]),
  );
  timeRevisionSelectedCandidates.value.forEach((item) => {
    employeeMap.set(item.employeeCode, {
      employeeCode: item.employeeCode,
      employeeName: item.employeeName,
    });
  });
  timeRevisionForm.value.employees = [...employeeMap.values()];
  showTimeRevisionEmployeeDialog.value = false;
  timeRevisionSelectedCandidates.value = [];
};

const clearTimeRevisionEmployees = () => {
  timeRevisionForm.value.employees = [];
};

const submitTimeRevision = () => {
  if (!timeRevisionForm.value.startDate || !timeRevisionForm.value.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return;
  }
  if (!timeRevisionForm.value.shiftCode) {
    ElMessage.warning("请选择班次");
    return;
  }
  if (!timeRevisionForm.value.employees.length) {
    ElMessage.warning("请选择员工");
    return;
  }
  if (!timeRevisionForm.value.segments.length) {
    ElMessage.warning("请完善班次信息");
    return;
  }
  const hasInvalidSegment = timeRevisionForm.value.segments.some(
    (item) =>
      !item.workStartTime ||
      !item.workEndTime ||
      (item.startNeedPunch !== 0 && item.startNeedPunch !== 1) ||
      (item.endNeedPunch !== 0 && item.endNeedPunch !== 1),
  );
  if (hasInvalidSegment) {
    ElMessage.warning("请完整填写班次信息");
    return;
  }

  timeRevisionLoading.value = true;
  submitScheduleTimeRevision(
    {
      startDate: timeRevisionForm.value.startDate,
      endDate: timeRevisionForm.value.endDate,
      deptCode:
        Array.isArray(timeRevisionCandidateQuery.value.deptCodes) &&
        timeRevisionCandidateQuery.value.deptCodes.length
          ? timeRevisionCandidateQuery.value.deptCodes[0]
          : undefined,
      talentName: timeRevisionCandidateQuery.value.talentName || undefined,
      shiftCode: timeRevisionForm.value.shiftCode,
      talentCodes: timeRevisionForm.value.employees.map((item) => item.employeeCode),
      segments: timeRevisionForm.value.segments.map((item, index) => ({
        segmentNo: item.segmentNo || index + 1,
        workStartTime: item.workStartTime,
        startNeedPunch: item.startNeedPunch === 1,
        workEndTime: item.workEndTime,
        endNeedPunch: item.endNeedPunch === 1,
      })),
      ...currentOperator.value,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      ElMessage.success(res?.message || res?.data?.message || "排班时间修订成功");
      showTimeRevisionDialog.value = false;
      fetchActiveTabList();
    })
    .finally(() => {
      timeRevisionLoading.value = false;
    });
};

const handleMoreCommand = (command) => {
  if (command === "swap") {
    handleScheduleSwap();
    return;
  }
  if (command === "swapList") {
    handleOpenScheduleSwapList();
  }
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
      fetchActiveTabList();
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
        fetchActiveTabList();
      });
    })
    .finally(() => {
      detailSubmitLoading.value = false;
    });
};

const handlePagination = () => {
  fetchActiveTabList();
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchAttendanceGroupOptions();
  fetchRotationRuleOptions();
  fetchActiveTabList();
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
          style="margin-bottom: 0;"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex schedule-list__toolbar"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 200px"
                    placeholder="请输入员工姓名"
                    clearable
                    class="top-search"
                    @clear="fuzzySearch"
                    @keyup.enter="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <ListSearch
                    name="scheduleList"
                    :buss-id="TAB_MAP.horizontal.bussId"
                    :is-show="true"
                    @search="handleAdvancedSearch"
                  />
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="schedule-list__date-range"
                    style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                    :clearable="false"
                    @change="handleDateRangeChange"
                  />
                  <el-button
                    v-if="showScheduleWizardAction"
                    type="primary"
                    @click="handleOpenScheduleWizard"
                  >
                    排班向导
                  </el-button>
                  <el-button
                    v-if="showTimeRevisionAction"
                    type="primary"
                    @click="handleOpenTimeRevisionDialog"
                  >
                    排班时间修订
                  </el-button>
                  <el-dropdown
                    v-if="showMoreAction"
                    @command="handleMoreCommand"
                  >
                    <el-button>
                      更多
                      <i class="mdi mdi-chevron-down ms-1"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="swap">
                          调班
                        </el-dropdown-item>
                        <el-dropdown-item command="swapList">
                          调班单
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-dropdown
                    v-if="showVerticalExport"
                    @command="handleExport"
                  >
                    <el-button>
                      导出
                      <i class="mdi mdi-chevron-down ms-1"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="exportSelected">
                          选中导出
                        </el-dropdown-item>
                        <el-dropdown-item command="exportAll">
                          全部导出
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </span>
              <div class="d-flex gap-2 schedule-list__actions">
                <div class="schedule-list__tabs">
                  <el-tabs
                    v-model="activeTab"
                    @tab-change="handleTabChange"
                  >
                    <el-tab-pane
                      v-for="(item, key) in TAB_MAP"
                      :key="key"
                      :label="item.label"
                      :name="key"
                    />
                  </el-tabs>
                </div>
                <TopListTool
                  v-if="activeTab !== 'vertical'"
                  :key="currentBussId"
                  :gridName="currentGridName"
                  :buss-id="currentBussId"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    ...advancedFilter,
                    searchWord: diminput,
                    activeTab,
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
              :key="activeTab"
              :gridName="currentGridName"
              :bussId="activeTab === 'vertical' ? undefined : currentBussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="currentColumnDefs"
              :grid-data="gridData"
              :activeClass="activeTab === 'vertical' ? [] : activeClass"
              :cellRenderer="cellRenderer"
              :showSelectionColumn="showSelectionColumn"
              :rowClick="showRowClick ? openScheduleDetail : undefined"
              :gridOptions="currentGridOptions"
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

    <el-dialog
      v-model="showTimeRevisionDialog"
      title="排班时间修订"
      width="860px"
      destroy-on-close
      :close-on-click-modal="false"
      class="schedule-time-revision-dialog"
      @closed="resetTimeRevisionForm"
    >
      <div class="schedule-time-revision">
        <div class="schedule-time-revision__filter">
          <div class="schedule-time-revision__field">
            <div class="schedule-time-revision__label">开始日期</div>
            <el-date-picker
              v-model="timeRevisionForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="开始日期"
            />
          </div>
          <div class="schedule-time-revision__field">
            <div class="schedule-time-revision__label">结束日期</div>
            <el-date-picker
              v-model="timeRevisionForm.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="结束日期"
            />
          </div>
          <div class="schedule-time-revision__field">
            <div class="schedule-time-revision__label">班次</div>
            <el-select
              v-model="timeRevisionForm.shiftCode"
              filterable
              clearable
              :loading="detailShiftLoading"
              placeholder="请选择班次"
              @change="handleTimeRevisionShiftChange"
            >
              <el-option
                v-for="item in detailShiftOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="schedule-time-revision__field">
            <div class="schedule-time-revision__label">员工</div>
            <el-input
              :model-value="timeRevisionEmployeeNames"
              placeholder="请选择员工"
              readonly
              @click="openTimeRevisionEmployeeDialog"
            >
              <template #suffix>
                <i
                  v-if="timeRevisionForm.employees.length"
                  class="mdi mdi-close-circle employee-clear"
                  @click.stop="clearTimeRevisionEmployees"
                ></i>
                <i
                  v-else
                  class="mdi mdi-menu employee-picker"
                ></i>
              </template>
            </el-input>
          </div>
        </div>

        <div
          v-loading="timeRevisionShiftDetailLoading"
          class="schedule-time-revision__segment"
        >
          <div class="schedule-time-revision__segment-title">班次信息</div>
          <div
            v-if="timeRevisionForm.segments.length"
            class="schedule-time-revision__segment-list"
          >
            <div
              v-for="(item, index) in timeRevisionForm.segments"
              :key="item.segmentNo || index"
              class="schedule-time-revision__segment-card"
            >
              <div class="schedule-time-revision__segment-field">
                <div class="schedule-time-revision__segment-label">上班时间</div>
                <el-time-picker
                  v-model="item.workStartTime"
                  value-format="HH:mm"
                  format="HH:mm"
                  placeholder="上班时间"
                  :clearable="false"
                />
              </div>
              <div class="schedule-time-revision__segment-field">
                <div class="schedule-time-revision__segment-label">上班是否打卡</div>
                <el-select
                  v-model="item.startNeedPunch"
                  placeholder="上班是否打卡"
                >
                  <el-option
                    label="是"
                    :value="1"
                  />
                  <el-option
                    label="否"
                    :value="0"
                  />
                </el-select>
              </div>
              <div class="schedule-time-revision__segment-field">
                <div class="schedule-time-revision__segment-label">下班时间</div>
                <el-time-picker
                  v-model="item.workEndTime"
                  value-format="HH:mm"
                  format="HH:mm"
                  placeholder="下班时间"
                  :clearable="false"
                />
              </div>
              <div class="schedule-time-revision__segment-field">
                <div class="schedule-time-revision__segment-label">下班是否打卡</div>
                <el-select
                  v-model="item.endNeedPunch"
                  placeholder="下班是否打卡"
                >
                  <el-option
                    label="是"
                    :value="1"
                  />
                  <el-option
                    label="否"
                    :value="0"
                  />
                </el-select>
              </div>
            </div>
          </div>
          <div
            v-else
            class="schedule-time-revision__empty"
          >
            请先选择班次后编辑班次信息
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTimeRevisionDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="timeRevisionLoading"
          @click="submitTimeRevision"
        >
          确定
        </el-button>
      </template>

      <el-dialog
        v-model="showTimeRevisionEmployeeDialog"
        title="选择员工"
        width="860px"
        append-to-body
      >
        <div class="candidate-toolbar">
          <el-cascader
            v-model="timeRevisionCandidateQuery.deptCodes"
            class="candidate-toolbar__dept"
            :options="organizationCascaderOptions"
            :props="{ multiple: true, emitPath: false }"
            collapse-tags
            collapse-tags-tooltip
            clearable
            filterable
            :show-all-levels="false"
            placeholder="请选择考勤组织"
            @change="handleTimeRevisionCandidateDeptChange"
          />
          <el-input
            v-model="timeRevisionCandidateQuery.talentCode"
            class="candidate-toolbar__field"
            placeholder="请输入员工编码"
            clearable
            @keyup.enter="handleTimeRevisionEmployeeSearch"
          />
          <el-input
            v-model="timeRevisionCandidateQuery.talentName"
            class="candidate-toolbar__field"
            placeholder="请输入员工姓名"
            clearable
            @keyup.enter="handleTimeRevisionEmployeeSearch"
          >
            <template #prepend>
              <el-button @click="handleTimeRevisionEmployeeSearch">
                <i class="bx bx-search-alt"></i>
              </el-button>
            </template>
          </el-input>
          <el-button
            type="primary"
            @click="handleTimeRevisionEmployeeSearch"
          >
            搜索
          </el-button>
        </div>

        <el-table
          ref="timeRevisionEmployeeTableRef"
          :data="timeRevisionMemberOptions"
          border
          height="420"
          v-loading="timeRevisionMemberLoading"
          row-key="employeeCode"
          @selection-change="handleTimeRevisionEmployeeSelection"
        >
          <el-table-column
            type="selection"
            width="50"
            :selectable="timeRevisionCandidateRowSelectable"
          />
          <el-table-column
            prop="employeeCode"
            label="员工编码"
            min-width="120"
          />
          <el-table-column
            prop="employeeName"
            label="姓名"
            min-width="120"
          />
          <el-table-column
            prop="attendanceOrganization"
            label="考勤组织"
            min-width="220"
          />
        </el-table>

        <div class="candidate-pagination">
          <Pagination
            :total="timeRevisionMemberTotal"
            v-model:page="timeRevisionCandidateQuery.pageNo"
            v-model:limit="timeRevisionCandidateQuery.pageSize"
            :pageSizes="[10, 20, 50, 100]"
            :storage="false"
            @pagination="handleTimeRevisionEmployeePagination"
          />
        </div>
        <template #footer>
          <el-button @click="showTimeRevisionEmployeeDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmTimeRevisionEmployees"
          >
            确定
          </el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.schedule-list__toolbar {
  flex-wrap: nowrap;
  align-items: center;
}

.schedule-list__actions {
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.schedule-list__tabs {
  flex: 0 0 auto;
}

:deep(.schedule-list__tabs .el-tabs) {
  width: auto;
}

:deep(.schedule-list__tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.schedule-list__tabs .el-tabs__header) {
  margin: 0;
}

:deep(.schedule-list__tabs .el-tabs__nav-wrap) {
  padding: 4px;
  border-radius: 4px;
  background: #f3f6fb;
}

:deep(.schedule-list__tabs .el-tabs__nav) {
  gap: 4px;
  border: none !important;
}

:deep(.schedule-list__tabs .el-tabs__active-bar) {
  display: none;
}

:deep(.schedule-list__tabs .el-tabs__item) {
  height: 28px;
  line-height: 28px;
  padding: 0 18px !important;
  border: none !important;
  border-radius: 4px;
  color: #5f6b7a;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.schedule-list__tabs .el-tabs__item:hover) {
  color: #2f6bff;
  background: rgba(47, 107, 255, 0.08);
}

:deep(.schedule-list__tabs .el-tabs__item.is-active) {
  color: #2f6bff;
  font-weight: 600;
  background: #fff;
  box-shadow: 0 1px 4px rgba(31, 45, 61, 0.08);
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

.schedule-time-revision {
  display: grid;
  gap: 16px;
}

.schedule-time-revision__filter {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  padding: 4px 4px 0;
}

.schedule-time-revision__field {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.schedule-time-revision__label {
  color: #4c5d78;
  font-size: 14px;
  text-align: right;
  line-height: 32px;
}

.schedule-time-revision__segment {
  border: 1px solid #e7edf5;
  border-radius: 10px;
  background: #f9fbff;
  padding: 14px;
}

.schedule-time-revision__segment-title {
  font-size: 14px;
  font-weight: 600;
  color: #243449;
  margin-bottom: 12px;
}

.schedule-time-revision__segment-list {
  display: grid;
  gap: 12px;
}

.schedule-time-revision__segment-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.schedule-time-revision__segment-field {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.schedule-time-revision__segment-label {
  color: #4c5d78;
  font-size: 14px;
  text-align: right;
  line-height: 32px;
}

.schedule-time-revision__empty {
  font-size: 13px;
  color: #8492a6;
}

.employee-clear,
.employee-picker {
  color: #909399;
}

.employee-clear {
  cursor: pointer;
}

.employee-clear:hover {
  color: #409eff;
}

.candidate-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.schedule-time-revision-dialog :deep(.el-dialog__header) {
  padding: 18px 22px 12px;
  margin-right: 0;
  border-bottom: 1px solid #edf1f7;
}

.schedule-time-revision-dialog :deep(.el-dialog__title) {
  color: #1f2d49;
  font-size: 20px;
  font-weight: 600;
}

.schedule-time-revision-dialog :deep(.el-dialog__body) {
  padding: 16px 22px 12px;
}

.schedule-time-revision-dialog :deep(.el-dialog__footer) {
  padding: 8px 22px 16px;
  border-top: 1px solid #edf1f7;
}

.schedule-time-revision-dialog :deep(.schedule-time-revision__field .el-input__wrapper),
.schedule-time-revision-dialog :deep(.schedule-time-revision__field .el-select .el-input__wrapper),
.schedule-time-revision-dialog :deep(.schedule-time-revision__field .el-date-editor),
.schedule-time-revision-dialog :deep(.schedule-time-revision__segment-card .el-input__wrapper),
.schedule-time-revision-dialog :deep(.schedule-time-revision__segment-card .el-select .el-input__wrapper),
.schedule-time-revision-dialog :deep(.schedule-time-revision__segment-card .el-date-editor) {
  min-height: 36px;
}

.candidate-toolbar__field {
  width: 220px;
}

.candidate-toolbar__dept {
  width: 260px;
}

.candidate-toolbar__dept :deep(.el-tag) {
  max-width: 180px;
}

.candidate-toolbar__dept :deep(.el-tag__content) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.candidate-pagination {
  margin-top: 16px;
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

  .schedule-time-revision__filter,
  .schedule-time-revision__segment-card {
    grid-template-columns: 1fr;
  }

  .schedule-time-revision__field {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .schedule-time-revision__segment-field {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .schedule-time-revision__label {
    text-align: left;
    line-height: 1.4;
  }

  .schedule-time-revision__segment-label {
    text-align: left;
    line-height: 1.4;
  }
}
</style>
