<!-- 考勤结果汇总列表页，负责按日期范围、组织及高级筛选分页查询员工考勤结果汇总数据。 -->
<script setup>
import dayjs from "dayjs";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { downLoad, saveTableConfig } from "@/utils";
import {
  exportAttendanceResultSummary,
  queryAttendanceResultSummaryPage,
} from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const handleBackToAttendanceManagement = () => {
  router.push({ name: "attendance-management" });
};

const bussId = 470;
const gridName = "attendanceResultSummaryGrid";
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const gridData = ref([]);
const total = ref(0);
const columnList = ref([]);
const keyword = ref("");

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
const today = dayjs().format("YYYY-MM-DD");
const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const formInline = ref({
  startDate: monthStart,
  endDate: today,
  deptCode: "",
});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);
const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const attendanceOrganizationOptions = computed(() => {
  const scope = store.getters["attendanceScope/scope"] || {};
  if (Array.isArray(scope?.deptScopeTree) && scope.deptScopeTree.length > 0) {
    return mapAttendanceOrganizationTree(scope.deptScopeTree);
  }
  return mapAttendanceOrganizationTree(store.getters["attendanceScope/deptScopes"] || []);
});

const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

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

listQuery.value.pageSize = fetchLocalPageSize();

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

const buildQueryParams = () => {
  const talentKeyword = keyword.value.trim();
  return {
    pageNo: listQuery.value.pageNo,
    pageSize: listQuery.value.pageSize,
    startDate: formInline.value.startDate || undefined,
    endDate: formInline.value.endDate || undefined,
    deptCode: formInline.value.deptCode || undefined,
    talentName: talentKeyword || undefined,
  };
};

const normalizeRecord = (item = {}, index = 0) => ({
  ...item,
  id:
    item.id ||
    item.userId ||
    `${item.talentCode || "talent"}-${item.periodCode || "period"}-${index}`,
  sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
});

const fetchAttendanceResultSummaryList = () => {
  queryAttendanceResultSummaryPage(buildQueryParams(), { isLoading: true })
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      gridData.value = records.map((item, index) => normalizeRecord(item, index));
      total.value = Number(res?.total || 0);
      if (Number(res?.currPage)) {
        listQuery.value.pageNo = Number(res.currPage);
      }
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchAttendanceResultSummaryList();
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const handlePagination = () => {
  fetchAttendanceResultSummaryList();
};

const handleDeptChange = (value) => {
  formInline.value.deptCode =
    value === "" || value === null || value === undefined ? "" : String(value);
  fuzzySearch();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  if (!range.length) {
    formInline.value.startDate = monthStart;
    formInline.value.endDate = today;
    dateRange.value = [monthStart, today];
  } else {
    formInline.value.startDate = range[0] || "";
    formInline.value.endDate = range[1] || "";
  }
  fuzzySearch();
};

const handleExport = (command) => {
  const payload = {
    ...buildQueryParams(),
    exportMode: command === "exportSelected" ? "selected" : "all",
  };

  if (command === "exportSelected") {
    const selectedRows = getSelectedRows();
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要导出的记录");
    }
    const selectedTalentCodes = [
      ...new Set(
        selectedRows
          .map((item) => item.talentCode)
          .filter((item) => item || item === 0),
      ),
    ];
    if (selectedTalentCodes.length === 0) {
      return ElMessage.warning("选中记录缺少员工编码，无法导出");
    }
    payload.selectedTalentCodes = selectedTalentCodes.join(",");
  }

  delete payload.pageNo;
  delete payload.pageSize;

  exportAttendanceResultSummary(payload, { isLoading: true }).then((res) => {
    const filePath = res?.data?.filePath;
    const fileName = res?.data?.fileName || "考勤结果汇总.xlsx";
    if (!filePath) {
      return ElMessage.warning("导出文件地址为空");
    }
    downLoad(filePath, fileName);
    ElMessage.success(command === "exportSelected" ? "选中导出成功" : "全部导出成功");
  });
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchAttendanceResultSummaryList();
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
                  class="d-flex attendance-result-summary__toolbar"
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
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="attendance-result-summary__date-range"
                    @change="handleDateRangeChange"
                    :clearable="false"
                  />
                  <el-cascader
                    v-model="formInline.deptCode"
                    class="attendance-result-summary__cascader"
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
                  <el-dropdown @command="handleExport">
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
              <div class="d-flex gap-2">
                <el-button
                  plain
                  @click="handleBackToAttendanceManagement"
                >
                  返回假勤管理导航
                </el-button>
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: keyword,
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
              :gridOptions="gridOptions"
              showSelectionColumn
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
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.attendance-result-summary__toolbar {
  flex-wrap: wrap;
}

:deep(.attendance-result-summary__cascader.el-cascader) {
  width: 260px;
}

:deep(.attendance-result-summary__date-range.el-date-editor--daterange) {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}
</style>
