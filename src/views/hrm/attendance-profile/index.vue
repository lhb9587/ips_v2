<script setup>
import dayjs from "dayjs";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import AttendanceProfileDetailSidebar from "@/views/hrm/attendance-profile/detail-sidebar.vue";
import AttendanceProfileUnarchivedDialog from "@/views/hrm/attendance-profile/unarchived-dialog.vue";
import { saveTableConfig } from "@/utils";
import { queryAttendanceArchivePage, queryAttendanceShiftList } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 456;
const gridName = "attendanceProfileGrid";
const defaultHolidaySystem = "默认假期制度";
const defaultAttendanceSystem = "默认考勤制度";

const shiftOptions = ref([]);

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
const unarchivedDialogVisible = ref(false);
const detailMode = ref("view");
const selectedDetail = ref({});
const total = ref(0);
const gridData = ref([]);

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

const fetchShiftOptions = () => {
  queryAttendanceShiftList(
    {},
    {
      isLoading: false,
    },
  ).then((res) => {
    const records = Array.isArray(res?.data) ? res.data : [];
    shiftOptions.value = records.map((item) => ({
      ...item,
      overtimePayType: item.overtimeCompensateMode || "",
      applicableFrequency: item.shiftType || "",
      cardRule: item.fetchCardRuleName || "",
      standardWorkHours: item.standardHours ?? "",
      organizationName: item.organizationName || item.organizationCode || "",
      isDefault: item.isDefault === 1,
    }));
  });
};

const fetchAttendanceArchiveList = () => {
  queryAttendanceArchivePage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      talentCode: diminput.value || undefined,
      talentName: diminput.value || undefined,
      ...formInline.value,
    },
    {
      isLoading: true,
    },
  ).then((res) => {
    const records = Array.isArray(res?.data) ? res.data : [];
    gridData.value = records.map((item, index) => ({
      ...item,
      id: item.archiveId,
      employeeCode: item.talentCode,
      employeeName: item.talentName,
      organizationCode: item.attendanceOrgCode || "",
      organizationName: item.attendanceOrgName || "",
      holidaySystem: item.leavePolicyCode || defaultHolidaySystem,
      attendanceSystem: item.attendancePolicyCode || defaultAttendanceSystem,
      defaultShift: item.defaultShiftCode || "",
      sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
    }));
    total.value = res?.total || 0;
  });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  fetchAttendanceArchiveList();
};

const formatDateTimeCell = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const target = dayjs(value);
  return target.isValid() ? target.format("YYYY-MM-DD HH:mm") : "";
};

const formatSwitchCell = (value) => {
  if (value === 1 || value === "1") {
    return "开启";
  }
  if (value === 0 || value === "0") {
    return "关闭";
  }
  return value || value === 0 ? value : "";
};

const formatYesNoCell = (value) => {
  if (value === 1 || value === "1") {
    return "是";
  }
  if (value === 0 || value === "0") {
    return "否";
  }
  return value || value === 0 ? value : "";
};

const cellRenderer = (params) => {
  let displayValue = params.value || params.value === 0 ? params.value : "";
  if (["createTime", "updateTime"].includes(params?.colDef?.field)) {
    displayValue = formatDateTimeCell(params.value);
  }
  if (params?.colDef?.field === "status") {
    displayValue = formatSwitchCell(params.value);
  }
  if (["isAutoSchedule", "isPunchAttendance"].includes(params?.colDef?.field)) {
    displayValue = formatYesNoCell(params.value);
  }
  return `<span title="${displayValue}">${displayValue}</span>`;
};

const openUnarchivedDialog = () => {
  unarchivedDialogVisible.value = true;
};

const openProfileDetail = (params) => {
  if (!params?.data) {
    return;
  }
  selectedDetail.value = { ...params.data };
  detailMode.value = "view";
  detailVisible.value = true;
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const handleSaveProfile = (payload) => {
  const targetIndex = gridData.value.findIndex((item) => item.id === payload.id);
  if (targetIndex > -1) {
    gridData.value.splice(targetIndex, 1, {
      ...gridData.value[targetIndex],
      ...payload,
      holidaySystem: payload.holidaySystem || defaultHolidaySystem,
      attendanceSystem: payload.attendanceSystem || defaultAttendanceSystem,
    });
    selectedDetail.value = { ...gridData.value[targetIndex] };
    ElMessage.success("考勤档案已更新");
    return;
  }

  selectedDetail.value = {
    ...payload,
    holidaySystem: payload.holidaySystem || defaultHolidaySystem,
    attendanceSystem: payload.attendanceSystem || defaultAttendanceSystem,
  };
  detailMode.value = "view";
  listQuery.value.pageNo = 1;
  ElMessage.success("考勤档案已新增");
  fetchAttendanceArchiveList();
};

const deleteProfiles = (rows) => {
  const targetIds = new Set(rows.map((item) => item.id));
  gridData.value = gridData.value.filter((item) => !targetIds.has(item.id));
  if (gridData.value.length === 0 && listQuery.value.pageNo > 1) {
    listQuery.value.pageNo -= 1;
  }
};

const handleDeleteDetail = (record) => {
  if (!record?.id) {
    closeDetail();
    return;
  }

  ElMessageBox.confirm(`确认删除 ${record.employeeName} 的考勤档案吗？`, "删除确认", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(() => {
    deleteProfiles([record]);
    closeDetail();
    ElMessage.success("考勤档案已删除");
  });
};

const handlePagination = () => {
  fetchAttendanceArchiveList();
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchShiftOptions();
  fetchAttendanceArchiveList();
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
                  <el-button
                    v-if="false"
                    type="primary"
                    @click="openCreateDetail"
                  >
                    新增
                  </el-button>
                  <el-button @click="openUnarchivedDialog">未建档案</el-button>
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
              :rowClick="openProfileDetail"
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

    <DragSidebar
      v-if="detailVisible"
      v-model="detailVisible"
      sidebarName="attendance-profile-detail-sidebar"
      :minWidth="760"
      :width="900"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetail"
    >
      <AttendanceProfileDetailSidebar
        :detailInfo="selectedDetail"
        :mode="detailMode"
        :shiftOptions="shiftOptions"
        @save="handleSaveProfile"
        @delete="handleDeleteDetail"
        @close="closeDetail"
      />
    </DragSidebar>

    <AttendanceProfileUnarchivedDialog
      v-model="unarchivedDialogVisible"
      :shiftOptions="shiftOptions"
      @created="fetchAttendanceArchiveList"
    />
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}
</style>
