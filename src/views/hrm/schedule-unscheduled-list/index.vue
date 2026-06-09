<!-- 未排班列表页，展示指定日期范围内完全未排班的人员。 -->
<script setup>
import dayjs from "dayjs";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { saveTableConfig } from "@/utils";
import { queryScheduleUnscheduledPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 460;
const gridName = "scheduleUnscheduledListGrid";
const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const diminput = ref("");
const total = ref(0);
const gridData = ref([]);
const formInline = ref({
  startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);

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
  const pageSize = savedData ? savedData.pageSize : 10;
  return Math.min(pageSize, 100);
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 20, 50, 100]);

const fetchUnscheduledList = () => {
  queryScheduleUnscheduledPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 100),
      startDate: formInline.value.startDate,
      endDate: formInline.value.endDate,
      talentName: diminput.value || undefined,
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
  fetchUnscheduledList();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  formInline.value.startDate = range[0] || "";
  formInline.value.endDate = range[1] || "";
  fuzzySearch();
};

const handlePagination = () => {
  fetchUnscheduledList();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchUnscheduledList();
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
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 200px"
                    placeholder="请输入员工姓名"
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
                    class="schedule-unscheduled-list__date-range"
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

:deep(.schedule-unscheduled-list__date-range.el-date-editor--daterange),
.schedule-unscheduled-list__date-range {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}
</style>
