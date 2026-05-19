<!-- 打卡记录列表页，负责按组织、姓名和日期范围分页查询员工打卡记录。 -->
<script setup>
import dayjs from "dayjs";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { saveTableConfig } from "@/utils";
import { queryAttendancePunchRecordPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 462;
const gridName = "attendanceRecordGrid";
const DEFAULT_COLUMNS = [
  { title: "序号", value: "sid", width: 70, minWidth: 70, maxWidth: 90 },
  { title: "员工编码", value: "talentCode", minWidth: 120 },
  { title: "员工姓名", value: "talentName", minWidth: 120 },
  { title: "组织", value: "deptName", minWidth: 260 },
  { title: "考勤编号", value: "attendanceNo", minWidth: 120 },
  { title: "打卡日期", value: "punchDate", minWidth: 120 },
  { title: "打卡时间", value: "punchTime", minWidth: 180 },
  { title: "打卡来源", value: "sourceType", minWidth: 120 },
  { title: "打卡地点", value: "punchLocation", minWidth: 180 },
  { title: "描述", value: "remark", minWidth: 180 },
  { title: "状态", value: "status", minWidth: 100 },
];

const columnList = ref([...DEFAULT_COLUMNS]);
const setColumn = (list) => {
  columnList.value = Array.isArray(list) && list.length ? list : [...DEFAULT_COLUMNS];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const diminput = ref("");
const total = ref(0);
const gridData = ref([]);

const today = dayjs().format("YYYY-MM-DD");
const formInline = ref({
  startDate: today,
  endDate: today,
});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);

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
  const pageSize = savedData ? savedData.pageSize : 50;
  return Math.min(pageSize, 200);
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

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

const fetchAttendanceRecordList = () => {
  queryAttendancePunchRecordPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 200),
      talentName: diminput.value || undefined,
      startDate: formInline.value.startDate || undefined,
      endDate: formInline.value.endDate || undefined,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      gridData.value = records.map((item, index) => ({
        ...item,
        id: item.recordId,
        sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
      }));
      total.value = Number(res?.total || 0);
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchAttendanceRecordList();
};

const handlePagination = () => {
  fetchAttendanceRecordList();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  formInline.value.startDate = range[0] || "";
  formInline.value.endDate = range[1] || "";
  fuzzySearch();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchAttendanceRecordList();
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
                  class="d-flex attendance-record__toolbar"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    class="top-search"
                    style="width: 200px"
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
                    class="attendance-record__date-range"
                    style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                    clearable
                    @change="handleDateRangeChange"
                  />
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: diminput,
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
              :gridName="gridName"
              :bussId="bussId"
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

.attendance-record__toolbar {
  flex-wrap: wrap;
}

:deep(.attendance-record__date-range.el-date-editor--daterange) {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}
</style>
