<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import LeaveDetailContent from "@/views/hrm/my-attendance/leave-list/components/LeaveDetailContent.vue";
import {
  exportLeaveRequestAdmin,
  queryLeaveRequestAdminPage,
} from "@/api/attendance";
import { downLoad, saveTableConfig } from "@/utils";

const route = useRoute();
const store = useStore();

const bussId = 473;
const gridName = "leaveManagementGrid";

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
const total = ref(0);
const gridData = ref([]);

const mapRequestStatusToDetail = (status) => {
  if (status === "已退回") {
    return "已驳回";
  }
  return status || "";
};

const formatManagementLeaveTime = (timeText) => {
  const [date = "", time = ""] = String(timeText || "").split(" ");
  if (!date) {
    return "";
  }
  if (["上午", "下午"].includes(time)) {
    return `${date} ${time}`;
  }
  const parsedTime = dayjs(`${date} ${time || "00:00"}`);
  return `${date} ${parsedTime.isValid() && parsedTime.hour() >= 12 ? "下午" : "上午"}`;
};

const buildDetailFromRecord = (record) => ({
  leaveRequestId: record.leaveRequestId,
  billNo: record.requestNo,
  applicant: record.talentName,
  employeeCode: record.talentCode,
  organization: record.deptName,
  applyDate: record.applyTime
    ? dayjs(record.applyTime).format("YYYY-MM-DD")
    : String(record.startTime || "").split(" ")[0],
  leaveType: record.leaveTypeName,
  startTime: formatManagementLeaveTime(record.startTime),
  endTime: formatManagementLeaveTime(record.endTime),
  duration: record.leaveDuration,
  unit: record.durationUnit,
  status: mapRequestStatusToDetail(record.requestStatus),
  approver: record.currentApproverName,
  reason: record.leaveReason || "",
  attachments: record.attachments || [],
  comment: record.comment || "",
});

const buildRecordFromDetail = (detail, sourceRecord = {}) => ({
  ...sourceRecord,
  leaveRequestId: detail.leaveRequestId || sourceRecord.leaveRequestId,
  requestNo: detail.billNo,
  talentCode: detail.employeeCode,
  talentName: detail.applicant,
  deptName: detail.organization,
  leaveTypeName: detail.leaveType,
  startTime: detail.startTime,
  endTime: detail.endTime,
  leaveDuration: detail.duration,
  durationUnit: detail.unit,
  requestStatus:
    detail.status === "已驳回" ? "已退回" : detail.status || sourceRecord.requestStatus,
  currentApproverName: detail.approver,
  leaveReason: detail.reason,
  attachments: detail.attachments || [],
  comment: detail.comment,
});

const buildListQueryParams = () => {
  const keyword = diminput.value.trim();
  const params = {
    pageNo: listQuery.value.pageNo,
    pageSize: Math.min(listQuery.value.pageSize, 200),
    ...formInline.value,
  };
  if (!keyword) {
    return params;
  }
  if (/[\u4e00-\u9fa5]/.test(keyword)) {
    params.talentName = keyword;
  } else {
    params.requestNo = keyword;
  }
  return params;
};

const buildExportParams = () => {
  const params = { ...buildListQueryParams() };
  delete params.pageNo;
  delete params.pageSize;
  return params;
};

const normalizeRecord = (item = {}, index = 0) => ({
  ...item,
  id: item.leaveRequestId,
  sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
});

const fetchLeaveRequestList = () => {
  queryLeaveRequestAdminPage(buildListQueryParams(), { isLoading: true })
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
  formInline.value = {};
  fetchLeaveRequestList();
};

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const updateBillStatus = (targetRows, status) => {
  const targetIds = new Set(
    targetRows.map((item) => item.leaveRequestId || item.requestNo),
  );
  gridData.value = gridData.value.map((item) => {
    const rowKey = item.leaveRequestId || item.requestNo;
    if (!targetIds.has(rowKey)) {
      return item;
    }
    return {
      ...item,
      requestStatus: status,
    };
  });
};

const handleSubmitEffect = () => {
  const selectedRows = getSelectedRows();
  if (selectedRows.length === 0) {
    return ElMessage.warning("请先选择需要提交生效的请假单");
  }
  updateBillStatus(selectedRows, "已生效");
  ElMessage.success(`已提交 ${selectedRows.length} 条请假单生效`);
};

const handleExport = (command) => {
  const payload = {
    ...buildExportParams(),
    exportMode: command === "exportSelected" ? "SELECTED" : "ALL",
  };

  if (command === "exportSelected") {
    const selectedRows = getSelectedRows();
    if (!selectedRows.length) {
      return ElMessage.warning("请先选择需要导出的请假单");
    }
    const leaveRequestIds = [
      ...new Set(
        selectedRows
          .map((item) => item.leaveRequestId)
          .filter((item) => item || item === 0),
      ),
    ];
    if (!leaveRequestIds.length) {
      return ElMessage.warning("选中记录缺少请假单ID，无法导出");
    }
    payload.leaveRequestIds = leaveRequestIds.join(",");
  }

  exportLeaveRequestAdmin(payload, { isLoading: true }).then((res) => {
    const filePath = res?.data?.filePath;
    const fileName = res?.data?.fileName || "后台请假单导出.xlsx";
    if (!filePath) {
      return ElMessage.warning("导出文件地址为空");
    }
    downLoad(filePath, fileName);
    ElMessage.success(command === "exportSelected" ? "选中导出成功" : "全部导出成功");
  });
};

const handleMoreCommand = (command) => {
  const selectedRows = getSelectedRows();

  if (command === "exportSelected" || command === "exportAll") {
    return handleExport(command);
  }

  if (command === "reverseApproval") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要反审批的请假单");
    }
    updateBillStatus(selectedRows, "草稿");
    return ElMessage.success(`已完成 ${selectedRows.length} 条请假单反审批`);
  }

  if (command === "discard") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要废弃的请假单");
    }
    updateBillStatus(selectedRows, "已废弃");
    return ElMessage.success(`已废弃 ${selectedRows.length} 条请假单`);
  }
};

const formatDateTimeCell = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const target = dayjs(value);
  return target.isValid() ? target.format("YYYY-MM-DD HH:mm:ss") : "";
};

const cellRenderer = (params) => {
  let displayValue = params.value || params.value === 0 ? params.value : "";
  if (["startTime", "endTime", "applyTime"].includes(params?.colDef?.field)) {
    displayValue = formatDateTimeCell(params.value);
  }
  return `<span title="${displayValue}">${displayValue}</span>`;
};

const handleRowClick = (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
  }
  rowClickTimer = setTimeout(() => {
    currentDetail.value = buildDetailFromRecord(params.data);
    detailDrawerVisible.value = true;
    rowClickTimer = null;
  }, 220);
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
};

const handleUpdateDetailRecord = (updatedRecord) => {
  const recordIndex = gridData.value.findIndex(
    (item) =>
      (updatedRecord.leaveRequestId &&
        item.leaveRequestId === updatedRecord.leaveRequestId) ||
      item.requestNo === updatedRecord.billNo,
  );
  if (recordIndex === -1) {
    return;
  }
  const updatedListRecord = buildRecordFromDetail(
    updatedRecord,
    gridData.value[recordIndex],
  );
  gridData.value.splice(recordIndex, 1, updatedListRecord);
  currentDetail.value = buildDetailFromRecord(updatedListRecord);
};

const handleDeleteDetailRecord = () => {
  closeDetailSidebar();
  fetchLeaveRequestList();
};

const handlePagination = () => {
  fetchLeaveRequestList();
};

onMounted(() => {
  fetchLeaveRequestList();
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
                    @keyup.enter="fuzzySearch"
                    class="top-search"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-button
                    type="primary"
                    @click="handleSubmitEffect"
                  >
                    提交生效
                  </el-button>
                  <el-dropdown @command="handleMoreCommand">
                    <el-button>
                      更多
                      <i class="mdi mdi-chevron-down ms-1"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="exportSelected">
                          导出选中
                        </el-dropdown-item>
                        <el-dropdown-item command="exportAll">
                          导出全部
                        </el-dropdown-item>
                        <el-dropdown-item command="reverseApproval">
                          反审批
                        </el-dropdown-item>
                        <el-dropdown-item command="discard">
                          废弃
                        </el-dropdown-item>
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
              :cellRenderer="cellRenderer"
              :gridOptions="gridOptions"
              :rowClick="handleRowClick"
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
      v-if="detailDrawerVisible"
      v-model="detailDrawerVisible"
      sidebarName="leave-management-detail-sidebar"
      :minWidth="900"
      :width="1180"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetailSidebar"
    >
      <div
        v-if="currentDetail"
        class="leave-detail-sidebar"
      >
        <LeaveDetailContent
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

.leave-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
