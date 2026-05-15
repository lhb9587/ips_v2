<script setup>
import dayjs from "dayjs";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import AttendanceProfileDetailSidebar from "@/views/hrm/attendance-profile/detail-sidebar.vue";
import AttendanceProfileUnarchivedDialog from "@/views/hrm/attendance-profile/unarchived-dialog.vue";
import { saveTableConfig } from "@/utils";
import {
  queryAttendanceArchiveDetail,
  queryAttendanceArchivePage,
  queryAttendanceShiftList,
  updateAttendanceArchive,
  deleteAttendanceArchive,
  changeAttendanceArchiveStatus,
} from "@/api/attendance";

const route = useRoute();
const router = useRouter();
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
      defaultShiftCode: item.defaultShiftCode || "",
      defaultShift: item.defaultShiftName || item.defaultShiftCode || "",
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

const openProfileDetail = async (params) => {
  if (!params?.data) {
    return;
  }
  selectedDetail.value = { ...params.data };
  detailMode.value = "view";
  detailVisible.value = true;

  const archiveId = params.data.archiveId || params.data.id;
  if (!archiveId) {
    return;
  }

  const res = await queryAttendanceArchiveDetail(
    {
      archiveId,
    },
    {
      isLoading: true,
    },
  );
  const detail = res?.data || {};
  selectedDetail.value = {
    ...selectedDetail.value,
    ...detail,
    id: detail.archiveId || selectedDetail.value.id,
    archiveId: detail.archiveId || selectedDetail.value.archiveId,
    employeeCode: detail.talentCode || selectedDetail.value.employeeCode,
    employeeName: detail.talentName || selectedDetail.value.employeeName,
    organizationCode: detail.attendanceOrgCode || selectedDetail.value.organizationCode || "",
    organizationName: detail.attendanceOrgName || selectedDetail.value.organizationName || "",
    holidaySystem: detail.leavePolicyCode || selectedDetail.value.holidaySystem || defaultHolidaySystem,
    attendanceSystem:
      detail.attendancePolicyCode ||
      selectedDetail.value.attendanceSystem ||
      defaultAttendanceSystem,
    defaultShiftCode:
      detail.defaultShiftCode || selectedDetail.value.defaultShiftCode || "",
    defaultShift:
      detail.defaultShiftName ||
      selectedDetail.value.defaultShift ||
      detail.defaultShiftCode ||
      "",
  };
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const openProfileHistory = (record) => {
  const archiveId = record?.archiveId || record?.id;
  if (!archiveId) {
    ElMessage.warning("缺少档案ID，无法查看历史");
    return;
  }
  router.push({
    name: "attendance-profile-history",
    query: {
      archiveId: String(archiveId),
    },
  });
};

const handleSaveProfile = async (payload) => {
  const archiveId = payload.archiveId || payload.id;
  if (!archiveId) {
    ElMessage.warning("缺少档案ID，无法保存");
    return;
  }

  const requestData = {
    archiveId,
    talentCode: payload.employeeCode || payload.talentCode,
    attendanceNo: payload.attendanceNo,
    attendanceOrgCode: payload.organizationCode || payload.attendanceOrgCode,
    defaultShiftCode: payload.defaultShiftCode,
    processMode: payload.processMode,
    effectiveDate: payload.effectiveDate,
    attendancePolicyCode: payload.attendancePolicyCode,
    leavePolicyCode: payload.leavePolicyCode,
  };

  Object.keys(requestData).forEach((key) => {
    if (requestData[key] === undefined || requestData[key] === null || requestData[key] === "") {
      delete requestData[key];
    }
  });

  await updateAttendanceArchive(requestData, { isLoading: true });

  selectedDetail.value = {
    ...selectedDetail.value,
    ...payload,
    holidaySystem: payload.holidaySystem || defaultHolidaySystem,
    attendanceSystem: payload.attendanceSystem || defaultAttendanceSystem,
  };
  detailMode.value = "view";
  ElMessage.success("考勤档案已更新");
  fetchAttendanceArchiveList();
};

const getSelectedArchiveRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const getDisableConfirmMessage = () => {
  const currentDateText = dayjs().format("YYYY年MM月DD日");
  return `员工考勤档案禁用后，${currentDateText}及以后的排班记录将会删除，您确认要禁用吗？`;
};

const handleBatchChangeStatus = (status) => {
  const selectedRows = getSelectedArchiveRows();
  const actionText = status === 1 ? "启用" : "禁用";
  if (!selectedRows.length) {
    ElMessage.warning(`请先选择需要${actionText}的考勤档案`);
    return;
  }
  const invalidRows = selectedRows.filter((item) => !(item?.archiveId || item?.id));
  if (invalidRows.length) {
    ElMessage.warning("所选档案存在无效数据，请刷新后重试");
    return;
  }
  const sameStatusRows = selectedRows.filter((item) => Number(item.status) === status);
  if (sameStatusRows.length) {
    ElMessage.warning(`所选档案中包含已是${actionText}状态的数据，请调整后再操作`);
    return;
  }

  ElMessageBox.confirm(
    status === 0
      ? getDisableConfirmMessage()
      : `确认${actionText}选中的 ${selectedRows.length} 条考勤档案吗？`,
    `${actionText}确认`,
    {
      type: "warning",
      confirmButtonText: actionText,
      cancelButtonText: "取消",
    },
  ).then(async () => {
    await Promise.all(
      selectedRows.map((item) =>
        changeAttendanceArchiveStatus(
          {
            archiveId: item.archiveId || item.id,
            status,
          },
          {
            isLoading: false,
          },
        ),
      ),
    );
    ElMessage.success(`已${actionText} ${selectedRows.length} 条考勤档案`);
    fetchAttendanceArchiveList();
  });
};

const handleBatchEnable = () => {
  handleBatchChangeStatus(1);
};

const handleBatchDisable = () => {
  handleBatchChangeStatus(0);
};

const handleBatchDelete = () => {
  const selectedRows = getSelectedArchiveRows();
  if (!selectedRows.length) {
    ElMessage.warning("请先选择需要删除的考勤档案");
    return;
  }
  const invalidRows = selectedRows.filter((item) => !(item?.archiveId || item?.id));
  if (invalidRows.length) {
    ElMessage.warning("所选档案存在无效数据，请刷新后重试");
    return;
  }
  const enabledRows = selectedRows.filter((item) => Number(item.status) === 1);
  if (enabledRows.length > 0) {
    ElMessage.warning("启用状态的考勤档案不允许删除");
    return;
  }

  ElMessageBox.confirm(
    `确认删除选中的 ${selectedRows.length} 条考勤档案吗？`,
    "删除确认",
    {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    },
  ).then(async () => {
    await Promise.all(
      selectedRows.map((item) =>
        deleteAttendanceArchive(
          {
            archiveId: item.archiveId || item.id,
          },
          { isLoading: false },
        ),
      ),
    );
    ElMessage.success(`已删除 ${selectedRows.length} 条考勤档案`);
    fetchAttendanceArchiveList();
  });
};

const handleDisableDetail = (record) => {
  if (!record?.id && !record?.archiveId) {
    ElMessage.warning("缺少档案ID，无法禁用");
    return;
  }
  if (Number(record.status) === 0) {
    ElMessage.warning("当前档案已是禁用状态");
    return;
  }

  ElMessageBox.confirm(getDisableConfirmMessage(), "禁用确认", {
    type: "warning",
    confirmButtonText: "禁用",
    cancelButtonText: "取消",
  }).then(async () => {
    await changeAttendanceArchiveStatus(
      {
        archiveId: record.archiveId || record.id,
        status: 0,
      },
      {
        isLoading: true,
      },
    );
    selectedDetail.value = {
      ...selectedDetail.value,
      status: 0,
    };
    ElMessage.success("考勤档案已禁用");
    fetchAttendanceArchiveList();
  });
};

const handleEnableDetail = (record) => {
  if (!record?.id && !record?.archiveId) {
    ElMessage.warning("缺少档案ID，无法启用");
    return;
  }
  if (Number(record.status) === 1) {
    ElMessage.warning("当前档案已是启用状态");
    return;
  }

  ElMessageBox.confirm("确认启用该考勤档案吗？", "启用确认", {
    type: "warning",
    confirmButtonText: "启用",
    cancelButtonText: "取消",
  }).then(async () => {
    await changeAttendanceArchiveStatus(
      {
        archiveId: record.archiveId || record.id,
        status: 1,
      },
      {
        isLoading: true,
      },
    );
    selectedDetail.value = {
      ...selectedDetail.value,
      status: 1,
    };
    ElMessage.success("考勤档案已启用");
    fetchAttendanceArchiveList();
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
                  <el-button
                    type="success"
                    plain
                    @click="handleBatchEnable"
                  >
                    启用
                  </el-button>
                  <el-dropdown trigger="click">
                    <el-button plain>
                      更多
                      <el-icon class="el-icon--right">
                        <ArrowDown />
                      </el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleBatchDisable">禁用</el-dropdown-item>
                        <el-dropdown-item @click="handleBatchDelete">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
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
              :showSelectionColumn="true"
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
        @history="openProfileHistory"
        @disable="handleDisableDetail"
        @enable="handleEnableDetail"
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
