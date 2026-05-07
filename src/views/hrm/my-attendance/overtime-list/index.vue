<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import OvertimeDetailContent from "./components/OvertimeDetailContent.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const router = useRouter();
const store = useStore();

const gridName = "myOvertimeListGrid";
const columnOptions = [
  { title: "单据编号", value: "billNo" },
  { title: "姓名", value: "applicant" },
  { title: "加班日期", value: "overtimeDate" },
  { title: "加班开始时间", value: "startTime" },
  { title: "加班结束时间", value: "endTime" },
  { title: "休息时长（分）", value: "breakMinutes" },
  { title: "申请加班小时数", value: "overtimeHours" },
  { title: "加班原因", value: "overtimeReason" },
  { title: "单据状态", value: "status" },
  { title: "审批人", value: "approver" },
  { title: "来源", value: "source" },
];

const columnList = ref([...columnOptions]);
const setColumn = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    columnList.value = [...columnOptions];
    return;
  }
  const validColumns = list.filter((item) =>
    columnOptions.some((column) => column.value === item.value),
  );
  columnList.value = validColumns.length > 0 ? validColumns : [...columnOptions];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const diminput = ref("");
const statusFilter = ref("");
const detailDrawerVisible = ref(false);
const currentDetail = ref(null);
let rowClickTimer = null;

const gridOptions = {
  rowMultiSelectWithClick: true,
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

const changeScreenSize = () => {
  const element = boxRef.value;
  if (!document.fullscreenElement) {
    element.requestFullscreen().then(() => {
      setTimeout(() => {
        gridHeight.value = document.documentElement.clientHeight - 160;
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

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  return savedData ? savedData.pageSize : 50;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});

const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});

const overtimeRecords = ref([
  {
    billNo: "JB20260506001",
    applicant: "张员工",
    employeeCode: "EMP2026136",
    organization: "产品研发中心",
    position: "Java后端开发工程师",
    applyDate: "2026-05-06",
    overtimeDate: "2026-05-05",
    startTimeOnly: "19:00",
    endTimeOnly: "22:00",
    startTime: "2026-05-05 19:00",
    endTime: "2026-05-05 22:00",
    breakMinutes: 30,
    overtimeHours: 2.5,
    overtimeReason: "项目上线",
    compensationType: "调休",
    status: "审批中",
    approver: "李经理",
    source: "员工自助",
    remark: "处理版本发布窗口及上线巡检。",
    comment: "已提交，等待直属上级审批",
  },
  {
    billNo: "JB20260428002",
    applicant: "张员工",
    employeeCode: "EMP2026136",
    organization: "产品研发中心",
    position: "Java后端开发工程师",
    applyDate: "2026-04-28",
    overtimeDate: "2026-04-27",
    startTimeOnly: "18:30",
    endTimeOnly: "21:30",
    startTime: "2026-04-27 18:30",
    endTime: "2026-04-27 21:30",
    breakMinutes: 0,
    overtimeHours: 3,
    overtimeReason: "客户支持",
    compensationType: "加班费",
    status: "已通过",
    approver: "王主管",
    source: "员工自助",
    remark: "配合客户完成夜间联调支持。",
    comment: "审批通过",
  },
  {
    billNo: "JB20260416003",
    applicant: "张员工",
    employeeCode: "EMP2026136",
    organization: "产品研发中心",
    position: "Java后端开发工程师",
    applyDate: "2026-04-16",
    overtimeDate: "2026-04-16",
    startTimeOnly: "18:00",
    endTimeOnly: "20:00",
    startTime: "2026-04-16 18:00",
    endTime: "2026-04-16 20:00",
    breakMinutes: 0,
    overtimeHours: 2,
    overtimeReason: "其他原因",
    compensationType: "调休",
    status: "未提交",
    approver: "未提交",
    source: "员工自助",
    remark: "整理阶段性方案并补充交付材料。",
    comment: "草稿暂未进入审批",
  },
  {
    billNo: "JB20260321004",
    applicant: "张员工",
    employeeCode: "EMP2026136",
    organization: "产品研发中心",
    position: "Java后端开发工程师",
    applyDate: "2026-03-21",
    overtimeDate: "2026-03-20",
    startTimeOnly: "09:00",
    endTimeOnly: "13:00",
    startTime: "2026-03-20 09:00",
    endTime: "2026-03-20 13:00",
    breakMinutes: 30,
    overtimeHours: 3.5,
    overtimeReason: "紧急交付",
    compensationType: "调休",
    status: "已驳回",
    approver: "陈经理",
    source: "员工自助",
    remark: "节前紧急处理客户交付事项。",
    comment: "请补充交付背景后重新提交",
  },
]);

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  return overtimeRecords.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      [
        item.billNo,
        item.applicant,
        item.overtimeDate,
        item.overtimeReason,
        item.status,
        item.approver,
      ].some((field) => String(field || "").toLowerCase().includes(keyword));
    const matchStatus = !statusFilter.value || item.status === statusFilter.value;
    return matchKeyword && matchStatus;
  });
});

const total = computed(() => filteredList.value.length);

const gridData = computed(() => {
  const start = (listQuery.value.pageNo - 1) * listQuery.value.pageSize;
  const end = start + listQuery.value.pageSize;
  return filteredList.value.slice(start, end).map((item, index) => ({
    ...item,
    sid: start + index,
  }));
});

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
};

const handleCreate = () => {
  router.push({ name: "my-overtime-application" });
};

const handleRowClick = (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
  }
  rowClickTimer = setTimeout(() => {
    currentDetail.value = params.data;
    detailDrawerVisible.value = true;
    rowClickTimer = null;
  }, 220);
};

const handleRowDoubleClick = (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
  sessionStorage.setItem("myOvertimeCurrentDetail", JSON.stringify(params.data));
  detailDrawerVisible.value = false;
  router.push({
    name: "my-overtime-detail",
    params: { billNo: params.data.billNo },
  });
};

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
};

const handlePagination = () => {};

const handleUpdateDetailRecord = (updatedRecord) => {
  const recordIndex = overtimeRecords.value.findIndex(
    (item) => item.billNo === updatedRecord.billNo,
  );
  if (recordIndex === -1) {
    return;
  }
  overtimeRecords.value.splice(recordIndex, 1, updatedRecord);
  currentDetail.value = { ...updatedRecord };
};

const handleDeleteDetailRecord = (record) => {
  const recordIndex = overtimeRecords.value.findIndex(
    (item) => item.billNo === record.billNo,
  );
  if (recordIndex > -1) {
    overtimeRecords.value.splice(recordIndex, 1);
  }
  closeDetailSidebar();
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});

onUnmounted(() => {
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
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
          <div class="card-body overtime-list-header">
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex flex-wrap"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 240px"
                    placeholder="搜索单据编号、加班原因、状态..."
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
                  <el-select
                    v-model="statusFilter"
                    clearable
                    placeholder="单据状态"
                    style="width: 140px"
                    @change="fuzzySearch"
                  >
                    <el-option
                      v-for="item in ['未提交', '审批中', '已通过', '已驳回', '已废弃']"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                  <el-button
                    type="primary"
                    @click="handleCreate"
                  >
                    新增加班申请
                  </el-button>
                </div>
              </span>
              <div class="d-flex align-items-center">
                <TopListTool
                  :gridRef="gridRef"
                  :setColumn="setColumn"
                  :columnList="columnList"
                  :changeBorder="changeBorder"
                  :changeRowStyle="changeRowStyle"
                  :changeScreenSize="changeScreenSize"
                  :changeRowHeight="changeRowHeight"
                  :inputData="{
                    diminput,
                    status: statusFilter,
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
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
              :gridOptions="gridOptions"
              :rowClick="handleRowClick"
              :rowDoubleClicked="handleRowDoubleClick"
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
            ></Pagination>
          </div>
        </div>
      </div>
    </div>

    <DragSidebar
      v-if="detailDrawerVisible"
      v-model="detailDrawerVisible"
      sidebarName="my-overtime-detail-sidebar"
      :minWidth="900"
      :width="1180"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetailSidebar"
    >
      <div
        v-if="currentDetail"
        class="overtime-detail-sidebar"
      >
        <OvertimeDetailContent
          :detailInfo="currentDetail"
          @close="closeDetailSidebar"
          @update-detail="handleUpdateDetailRecord"
          @delete-detail="handleDeleteDetailRecord"
        />
      </div>
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.overtime-list-header {
  padding-bottom: 10px;
}

.overtime-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
