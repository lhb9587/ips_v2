<!-- 排班列表纵向显示页，按员工维度展示日期范围内每日排班动态列。 -->
<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { downLoad } from "@/utils";
import { exportScheduleList, queryScheduleVerticalPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const gridName = "scheduleVerticalListGrid";
const MAX_VERTICAL_DATE_RANGE_DAYS = 31;
const WEEK_TEXT = ["日", "一", "二", "三", "四", "五", "六"];

const rowHeight = ref(40);
const diminput = ref("");
const gridRef = ref(null);
const total = ref(0);
const gridData = ref([]);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

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
  startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
  deptCode: "",
});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);

const currentOperator = computed(() => ({
  operatorId: store.state.user.userId || undefined,
  operatorName: store.state.user.name || undefined,
}));

const attendanceOrganizationOptions = computed(() => {
  const scope = store.getters["attendanceScope/scope"] || {};
  if (Array.isArray(scope?.deptScopeTree) && scope.deptScopeTree.length > 0) {
    return mapAttendanceOrganizationTree(scope.deptScopeTree);
  }
  return mapAttendanceOrganizationTree(store.getters["attendanceScope/deptScopes"] || []);
});

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
const pageSizesList = ref([10, 20, 50, 100]);

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

const columnList = computed(() => {
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

const fetchVerticalList = () => {
  if (!validateVerticalDateRange(formInline.value.startDate, formInline.value.endDate)) {
    return;
  }
  queryScheduleVerticalPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      startDate: formInline.value.startDate,
      endDate: formInline.value.endDate,
      deptCode: formInline.value.deptCode || undefined,
      talentName: diminput.value || undefined,
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

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchVerticalList();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  const startDate = range[0] || "";
  const endDate = range[1] || "";
  if (!startDate || !endDate) {
    dateRange.value = [formInline.value.startDate, formInline.value.endDate];
    return;
  }
  if (!validateVerticalDateRange(startDate, endDate)) {
    dateRange.value = [formInline.value.startDate, formInline.value.endDate];
    return;
  }
  formInline.value.startDate = startDate;
  formInline.value.endDate = endDate;
  fuzzySearch();
};

const handlePagination = () => {
  fetchVerticalList();
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const buildExportParams = () => ({
  startDate: formInline.value.startDate,
  endDate: formInline.value.endDate,
  deptCode: formInline.value.deptCode || undefined,
  talentName: diminput.value?.trim() || undefined,
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

const handleDeptChange = (value) => {
  formInline.value.deptCode =
    value === "" || value === null || value === undefined ? "" : String(value);
  fuzzySearch();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  fetchVerticalList();
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
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
                  class="d-flex schedule-vertical-list__toolbar"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
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
                    class="schedule-vertical-list__date-range"
                    style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                    :clearable="false"
                    @change="handleDateRangeChange"
                  />
                  <el-cascader
                    v-model="formInline.deptCode"
                    class="schedule-vertical-list__cascader"
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
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
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
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
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

:deep(.schedule-vertical-list__date-range.el-date-editor--daterange),
.schedule-vertical-list__date-range {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}

.schedule-vertical-list__cascader {
  width: 220px;
}

</style>
