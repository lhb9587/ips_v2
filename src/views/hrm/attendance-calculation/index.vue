<!-- 考勤计算列表页，负责按考勤周期、人员、组织与考勤组筛选三类计算状态列表。 -->
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { downLoad, saveTableConfig } from "@/utils";
import {
  calculateAllAttendanceCalc,
  calculateSelectedAttendanceCalc,
  exportAttendanceCalcResult,
  queryAttendanceCalcNotCalculatedPage,
  queryAttendanceCalcParams,
  queryAttendanceCalcPendingPage,
  queryAttendanceCalcResultDetailPage,
  queryAttendanceGroupPage,
} from "@/api/attendance";
import CalcTaskDialog from "./calc-task-dialog.vue";

const route = useRoute();
const store = useStore();

const CALCULATED_EXCEPTION_FILTER_OPTIONS = [
  { field: "absent", label: "旷工" },
  { field: "late", label: "迟到" },
  { field: "earlyLeave", label: "早退" },
  { field: "leave", label: "请假" },
  { field: "overtime", label: "加班" },
  { field: "trip", label: "出差" },
];

const TAB_MAP = {
  calculated: {
    label: "已计算",
    bussId: 469,
    query: queryAttendanceCalcResultDetailPage,
  },
  notCalculated: {
    label: "未计算",
    bussId: 466,
    query: queryAttendanceCalcNotCalculatedPage,
  },
  pending: {
    label: "待计算",
    bussId: 467,
    query: queryAttendanceCalcPendingPage,
  },
};

const activeTab = ref("calculated");
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const gridData = ref([]);
const total = ref(0);
const periodOptions = ref([]);
const groupOptions = ref([]);
const calcDeptScopeTree = ref([]);

const resolveDeptCode = (item = {}) => {
  const code =
    item.deptCode ?? item.deptId ?? item.organizationCode ?? item.value ?? "";
  return code === "" || code === null || code === undefined ? "" : String(code);
};

const mapAttendanceOrganizationTree = (list = []) =>
  list
    .map((item) => {
      const deptCode = resolveDeptCode(item);
      if (!deptCode) {
        return null;
      }
      return {
        deptCode,
        deptName: item.deptName || item.organizationName || item.label || "",
        children: Array.isArray(item.children)
          ? mapAttendanceOrganizationTree(item.children)
          : [],
      };
    })
    .filter(Boolean);
const formInline = ref({
  periodCode: "",
  deptCode: "",
  groupId: "",
});
const keyword = ref("");
const calculatedExceptionFilters = ref([]);
const supplementSubmitted = ref("");
const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const columnList = ref([]);
const calculateAllLoading = ref(false);
const calculateSelectedLoading = ref(false);
const calcTaskDialogVisible = ref(false);

const attendanceOrganizationOptions = computed(() => {
  if (calcDeptScopeTree.value.length > 0) {
    return mapAttendanceOrganizationTree(calcDeptScopeTree.value);
  }
  const scope = store.getters["attendanceScope/scope"] || {};
  if (Array.isArray(scope?.deptScopeTree) && scope.deptScopeTree.length > 0) {
    return mapAttendanceOrganizationTree(scope.deptScopeTree);
  }
  return mapAttendanceOrganizationTree(store.getters["attendanceScope/deptScopes"] || []);
});

const currentBussId = computed(() => TAB_MAP[activeTab.value].bussId);
const currentGridName = computed(
  () => `attendanceCalculationGrid_${activeTab.value}`,
);
const showCalculateActions = computed(() => true);
const showExportAction = computed(() => activeTab.value === "calculated");
const showCalculatedExceptionFilters = computed(() => activeTab.value === "calculated");

const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const calculateGridHeight = () => {
  const windowHeight = document.documentElement.clientHeight;
  if (store.state.layout.embedMode) {
    return windowHeight - 185;
  }
  const layout = store.state.layout.layoutType;
  if (layout === "vertical") {
    return windowHeight - 285;
  }
  return windowHeight - 340;
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
  return savedData ? savedData.pageSize : 50;
};

listQuery.value.pageSize = fetchLocalPageSize();

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
  if (!element) {
    return;
  }
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

const resolveQueryDeptCode = () => {
  const deptCode = formInline.value.deptCode;
  return deptCode === "" || deptCode === null || deptCode === undefined
    ? undefined
    : String(deptCode);
};

const buildCalculatedExceptionQueryParams = () => {
  const params = {};
  calculatedExceptionFilters.value.forEach((field) => {
    params[field] = 1;
  });
  if (supplementSubmitted.value !== "") {
    params.supplementSubmitted = supplementSubmitted.value;
  }
  return params;
};

const buildQueryParams = () => {
  const params = {
    pageNo: listQuery.value.pageNo,
    pageSize: listQuery.value.pageSize,
    periodCode: formInline.value.periodCode || undefined,
    deptCode: resolveQueryDeptCode(),
    groupId: formInline.value.groupId || undefined,
    talentName: keyword.value || undefined,
  };
  if (activeTab.value === "calculated") {
    Object.assign(params, buildCalculatedExceptionQueryParams());
  }
  return params;
};

const buildCalculateParams = () => ({
  periodCode: formInline.value.periodCode || undefined,
  deptCode: resolveQueryDeptCode(),
  groupId: formInline.value.groupId || undefined,
  talentName: keyword.value || undefined,
  operatorId: store.state.user.userId || undefined,
  operatorName: store.state.user.name || undefined,
});

const normalizeRecord = (item = {}, index = 0) => ({
  ...item,
  id:
    item.id ||
    item.stateId ||
    item.calcStateId ||
    `${item.talentCode || "talent"}-${item.periodCode || "period"}-${index}`,
  sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
  deptName: item.deptName || item.attendanceOrgName || item.organizationName || "",
  groupName: item.groupName || item.attendanceGroupName || "",
  attendancePolicyName: item.attendancePolicyName || item.policyName || "",
  periodName: item.periodName || item.periodCode || "",
  statusName: item.statusName || item.status || TAB_MAP[activeTab.value].label,
  lastCalcTime: item.lastCalcTime || item.calculateTime || item.calcTime || "",
});

const fetchAttendanceCalculationList = () => {
  const currentTab = TAB_MAP[activeTab.value];
  currentTab
    .query(buildQueryParams(), { isLoading: true })
    .then((res) => {
      const records = Array.isArray(res?.data)
        ? res.data
        : res?.data?.records || [];
      gridData.value = records.map((item, index) => normalizeRecord(item, index));
      total.value = Number(res?.total || res?.data?.total || 0);
      if (Number(res?.currPage)) {
        listQuery.value.pageNo = Number(res.currPage);
      }
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const handlePagination = () => {
  fetchAttendanceCalculationList();
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchAttendanceCalculationList();
};

const handleDeptChange = (value) => {
  formInline.value.deptCode =
    value === "" || value === null || value === undefined ? "" : String(value);
  fuzzySearch();
};

const handleTabChange = (tabName) => {
  if (tabName !== "calculated") {
    calculatedExceptionFilters.value = [];
    supplementSubmitted.value = "";
  }
  listQuery.value.pageNo = 1;
  fetchAttendanceCalculationList();
};

const handleCalculatedExceptionFilterChange = () => {
  if (activeTab.value !== "calculated") {
    return;
  }
  fuzzySearch();
};

const fetchGroupOptions = () => {
  return queryAttendanceGroupPage(
    {
      pageNo: 1,
      pageSize: 1000,
    },
    {
      isLoading: false,
    },
  ).then((res) => {
    const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
    groupOptions.value = records.map((item) => ({
      label: item.groupName,
      value: item.groupId,
    }));
  });
};

const fetchPageParams = () => {
  return queryAttendanceCalcParams(
    {},
    {
      isLoading: true,
    },
  ).then((res) => {
    const data = res?.data || {};
    calcDeptScopeTree.value = Array.isArray(data.deptScopeTree)
      ? data.deptScopeTree
      : [];
    periodOptions.value = Array.isArray(data.periodOptions) ? data.periodOptions : [];
    formInline.value.periodCode =
      data.defaultPeriodCode ||
      periodOptions.value[0]?.periodCode ||
      periodOptions.value[0]?.code ||
      "";
  });
};

const handlePeriodChange = () => {
  listQuery.value.pageNo = 1;
  fetchAttendanceCalculationList();
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const getSelectedTalentCodes = () => {
  const rows = getSelectedRows();
  return rows
    .map((item) => item?.talentCode)
    .filter((item, index, list) => item && list.indexOf(item) === index);
};

const buildExportParams = () => {
  const talentKeyword = keyword.value.trim();
  return {
    periodCode: formInline.value.periodCode || undefined,
    deptCode: resolveQueryDeptCode(),
    talentName: talentKeyword || undefined,
  };
};

const handleExport = (command) => {
  if (!formInline.value.periodCode) {
    ElMessage.warning("请先选择考勤周期");
    return;
  }

  const payload = {
    ...buildExportParams(),
    exportMode: command === "exportSelected" ? "selected" : "all",
  };

  if (command === "exportSelected") {
    const selectedRows = getSelectedRows();
    if (!selectedRows.length) {
      return ElMessage.warning("请先选择需要导出的记录");
    }
    const selectedTalentCodes = [
      ...new Set(
        selectedRows
          .map((item) => item.talentCode)
          .filter((item) => item || item === 0),
      ),
    ];
    if (!selectedTalentCodes.length) {
      return ElMessage.warning("选中记录缺少员工编码，无法导出");
    }
    payload.selectedTalentCodes = selectedTalentCodes.join(",");
  }

  exportAttendanceCalcResult(payload, { isLoading: true }).then((res) => {
    const filePath = res?.data?.filePath;
    const fileName = res?.data?.fileName || "考勤计算结果.xlsx";
    if (!filePath) {
      return ElMessage.warning("导出文件地址为空");
    }
    downLoad(filePath, fileName);
    ElMessage.success(command === "exportSelected" ? "选中导出成功" : "全部导出成功");
  });
};

const handleCalculateAll = () => {
  if (!formInline.value.periodCode) {
    ElMessage.warning("请先选择考勤周期");
    return;
  }
  calculateAllLoading.value = true;
  calculateAllAttendanceCalc(buildCalculateParams(), {
    isLoading: false,
  })
    .then((res) => {
      ElMessage.success(res?.data?.message || res?.message || "计算任务已提交");
      fetchAttendanceCalculationList();
    })
    .finally(() => {
      calculateAllLoading.value = false;
    });
};

const handleCalculateSelected = () => {
  if (!formInline.value.periodCode) {
    ElMessage.warning("请先选择考勤周期");
    return;
  }
  const talentCodes = getSelectedTalentCodes();
  if (!talentCodes.length) {
    ElMessage.warning("请先选择需要计算的员工");
    return;
  }
  calculateSelectedLoading.value = true;
  calculateSelectedAttendanceCalc(
    {
      periodCode: formInline.value.periodCode,
      talentCodes,
      operatorId: store.state.user.userId || undefined,
      operatorName: store.state.user.name || undefined,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      ElMessage.success(res?.data?.message || res?.message || "计算任务已提交");
      fetchAttendanceCalculationList();
    })
    .finally(() => {
      calculateSelectedLoading.value = false;
    });
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  Promise.all([fetchPageParams(), fetchGroupOptions()])
    .finally(() => {
      fetchAttendanceCalculationList();
    });
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
          ref="boxRef"
          class="card box"
          style="margin-bottom: 0;"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex attendance-calculation__toolbar"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="keyword"
                    class="top-search"
                    style="width: 220px"
                    placeholder="请输入员工姓名"
                    clearable
                    @keyup.enter="fuzzySearch"
                    @clear="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-select
                    v-model="formInline.periodCode"
                    class="attendance-calculation__period"
                    filterable
                    placeholder="请选择考勤周期"
                    @change="handlePeriodChange"
                  >
                    <el-option
                      v-for="item in periodOptions"
                      :key="item.periodCode"
                      :label="item.periodName"
                      :value="item.periodCode"
                    />
                  </el-select>
                  <el-cascader
                    v-model="formInline.deptCode"
                    class="attendance-calculation__cascader"
                    :options="attendanceOrganizationOptions"
                    :props="{
                      checkStrictly: true,
                      emitPath: false,
                      value: 'deptCode',
                      label: 'deptName',
                    }"
                    clearable
                    filterable
                    :show-all-levels="false"
                    placeholder="请选择组织"
                    @change="handleDeptChange"
                  />
                  <el-select
                    v-model="formInline.groupId"
                    class="attendance-calculation__group"
                    clearable
                    filterable
                    placeholder="请选择考勤组"
                    @change="fuzzySearch"
                  >
                    <el-option
                      v-for="item in groupOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
              </span>
              <div class="d-flex gap-2 attendance-calculation__actions">
                <div class="attendance-calculation__tabs">
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
                  :gridName="currentGridName"
                  :buss-id="currentBussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    ...buildCalculatedExceptionQueryParams(),
                    searchWord: keyword,
                    activeTab,
                  }"
                  :isFull="isFull"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                />
              </div>
            </div>
          </div>

          <div class="attendance-calculation__tabs-bar">
            <div
              v-if="showCalculateActions || showExportAction"
              class="d-flex gap-2 attendance-calculation__tab-actions"
            >
              <el-button
                v-if="showCalculateActions"
                type="primary"
                :loading="calculateAllLoading"
                @click="handleCalculateAll"
              >
                全部计算
              </el-button>
              <el-button
                v-if="showCalculateActions"
                type="primary"
                :loading="calculateSelectedLoading"
                @click="handleCalculateSelected"
              >
                计算选中行
              </el-button>
              <el-button
                v-if="showCalculateActions"
                @click="calcTaskDialogVisible = true"
              >
                查看后台事务
              </el-button>
              <el-dropdown
                v-if="showExportAction"
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
              <el-checkbox-group
                v-if="showCalculatedExceptionFilters"
                v-model="calculatedExceptionFilters"
                class="attendance-calculation__exception-filters"
                @change="handleCalculatedExceptionFilterChange"
              >
                <el-checkbox
                  v-for="item in CALCULATED_EXCEPTION_FILTER_OPTIONS"
                  :key="item.field"
                  :label="item.field"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
              <el-radio-group
                v-if="showCalculatedExceptionFilters"
                v-model="supplementSubmitted"
                class="attendance-calculation__supplement-filter"
                @change="handleCalculatedExceptionFilterChange"
              >
                <el-radio label="">全部</el-radio>
                <el-radio label="1">已提交申请</el-radio>
                <el-radio label="0">未提交申请</el-radio>
              </el-radio-group>
            </div>
          </div>

          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="currentGridName"
              :bussId="currentBussId"
              :showSelectionColumn="true"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
            />
          </div>

          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :total="total"
              :pageSizes="pageSizesList"
              @pagination="handlePagination"
            />
          </div>
        </div>
      </div>
    </div>

    <CalcTaskDialog v-model="calcTaskDialogVisible" />
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.attendance-calculation__toolbar {
  flex-wrap: wrap;
}

.attendance-calculation__actions {
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
}

.attendance-calculation__tabs-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 10px;
  flex-wrap: wrap;
}

.attendance-calculation__tabs {
  flex: 0 0 auto;
}

.attendance-calculation__tab-actions {
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.attendance-calculation__tabs .el-tabs) {
  width: auto;
}

:deep(.attendance-calculation__tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.attendance-calculation__tabs .el-tabs__header) {
  margin: 0;
}

:deep(.attendance-calculation__tabs .el-tabs__nav-wrap) {
  padding: 4px;
  border-radius: 4px;
  background: #f3f6fb;
}

:deep(.attendance-calculation__tabs .el-tabs__nav) {
  gap: 4px;
  border: none !important;
}

:deep(.attendance-calculation__tabs .el-tabs__active-bar) {
  display: none;
}

:deep(.attendance-calculation__tabs .el-tabs__item) {
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

:deep(.attendance-calculation__tabs .el-tabs__item:hover) {
  color: #2f6bff;
  background: rgba(47, 107, 255, 0.08);
}

:deep(.attendance-calculation__tabs .el-tabs__item.is-active) {
  color: #2f6bff;
  font-weight: 600;
  background: #fff;
  box-shadow: 0 4px 12px rgba(47, 107, 255, 0.12);
}

:deep(.attendance-calculation__period.el-select) {
  width: 300px;
}

:deep(.attendance-calculation__group.el-select) {
  width: 220px;
}

:deep(.attendance-calculation__cascader.el-cascader) {
  width: 260px;
}

.attendance-calculation__exception-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  padding: 4px 12px;
  border-radius: 4px;
  background: #f3f6fb;
}

:deep(.attendance-calculation__exception-filters .el-checkbox) {
  margin-right: 0;
  height: 28px;
}

:deep(.attendance-calculation__exception-filters label) {
  margin-bottom: 0;
}
</style>
