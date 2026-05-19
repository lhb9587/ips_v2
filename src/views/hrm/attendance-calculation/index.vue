<!-- 考勤计算列表页，负责按考勤周期、人员、组织与考勤组筛选三类计算状态列表。 -->
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { saveTableConfig } from "@/utils";
import {
  queryAttendanceCalcCalculatedPage,
  queryAttendanceCalcNotCalculatedPage,
  queryAttendanceCalcParams,
  queryAttendanceCalcPendingPage,
  queryAttendanceGroupPage,
} from "@/api/attendance";

const route = useRoute();
const store = useStore();

const TAB_MAP = {
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
  calculated: {
    label: "已计算",
    bussId: 469,
    query: queryAttendanceCalcCalculatedPage,
  },
};

const activeTab = ref("notCalculated");
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridData = ref([]);
const total = ref(0);
const periodOptions = ref([]);
const groupOptions = ref([]);
const deptCodes = ref([]);
const formInline = ref({
  periodCode: "",
  deptCode: "",
  groupId: "",
});
const keyword = ref("");
const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const columnList = ref([]);

const attendanceOrganizationOptions = computed(() => {
  const scope = store.getters["attendanceScope/scope"] || {};
  if (Array.isArray(scope?.deptScopeTree) && scope.deptScopeTree.length > 0) {
    return scope.deptScopeTree;
  }
  return store.getters["attendanceScope/deptScopes"] || [];
});

const currentBussId = computed(() => TAB_MAP[activeTab.value].bussId);
const currentGridName = computed(
  () => `attendanceCalculationGrid_${activeTab.value}`,
);

const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 292;
  }
  return windowHeight - 338;
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

const buildQueryParams = () => ({
  pageNo: listQuery.value.pageNo,
  pageSize: listQuery.value.pageSize,
  periodCode: formInline.value.periodCode || undefined,
  deptCode: formInline.value.deptCode || undefined,
  groupId: formInline.value.groupId || undefined,
  talentCode: keyword.value || undefined,
  talentName: keyword.value || undefined,
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
  const nextCodes = Array.isArray(value) ? value : [];
  deptCodes.value = nextCodes;
  formInline.value.deptCode = nextCodes.length ? nextCodes[nextCodes.length - 1] : "";
  fuzzySearch();
};

const handleTabChange = () => {
  listQuery.value.pageNo = 1;
  fetchAttendanceCalculationList();
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
    periodOptions.value = Array.isArray(data.periodOptions) ? data.periodOptions : [];
    formInline.value.periodCode =
      data.defaultPeriodCode ||
      periodOptions.value[0]?.periodCode ||
      "";
  });
};

const handlePeriodChange = () => {
  listQuery.value.pageNo = 1;
  fetchAttendanceCalculationList();
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
                  <el-select
                    v-model="formInline.periodCode"
                    class="attendance-calculation__period"
                    clearable
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
                  <el-input
                    v-model="keyword"
                    class="top-search"
                    style="width: 220px"
                    placeholder="请输入姓名或编码"
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
                  <el-cascader
                    v-model="deptCodes"
                    class="attendance-calculation__cascader"
                    :options="attendanceOrganizationOptions"
                    :props="{
                      checkStrictly: true,
                      emitPath: true,
                      value: 'deptCode',
                      label: 'deptName',
                    }"
                    clearable
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
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
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="currentGridName"
                  :buss-id="currentBussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
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

          <div style="padding: 0 10px">
            <GridView
              :gridName="currentGridName"
              :bussId="currentBussId"
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
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.attendance-calculation__toolbar {
  flex-wrap: wrap;
}

.attendance-calculation__tabs {
  padding: 0 10px 10px;
}

:deep(.attendance-calculation__tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.attendance-calculation__tabs .el-tabs__header) {
  margin: 0;
}

:deep(.attendance-calculation__tabs .el-tabs__nav-wrap) {
  padding: 4px;
  border-radius: 12px;
  background: #f3f6fb;
}

:deep(.attendance-calculation__tabs .el-tabs__nav) {
  gap: 6px;
  border: none !important;
}

:deep(.attendance-calculation__tabs .el-tabs__active-bar) {
  display: none;
}

:deep(.attendance-calculation__tabs .el-tabs__item) {
  height: 36px;
  padding: 0 18px !important;
  border: none !important;
  border-radius: 10px;
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
  width: 220px;
}

:deep(.attendance-calculation__group.el-select) {
  width: 220px;
}

:deep(.attendance-calculation__cascader.el-cascader) {
  width: 260px;
}
</style>
