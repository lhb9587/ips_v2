<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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
import { saveTableConfig } from "@/utils";

const route = useRoute();
const store = useStore();

const gridName = "leaveManagementGrid";
const columnOptions = [
  { title: "单据编号", value: "billNo" },
  { title: "员工编码", value: "employeeCode" },
  { title: "姓名", value: "employeeName" },
  { title: "组织", value: "organization" },
  { title: "假期类型", value: "leaveType" },
  { title: "开始时间", value: "startTime" },
  { title: "结束时间", value: "endTime" },
  { title: "请假长度", value: "leaveDuration" },
  { title: "单位", value: "unit" },
  { title: "单据状态", value: "billStatus" },
  { title: "审批人", value: "approver" },
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

const statusToDetailMap = {
  草稿: "未提交",
  审批中: "审批中",
  已审批: "已通过",
  已驳回: "已驳回",
  已废弃: "已废弃",
  已生效: "已通过",
};

const statusToListMap = {
  未提交: "草稿",
  审批中: "审批中",
  已通过: "已审批",
  已驳回: "已驳回",
  已废弃: "已废弃",
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
  billNo: record.billNo,
  applicant: record.employeeName,
  employeeCode: record.employeeCode,
  organization: record.organization,
  applyDate: String(record.startTime || "").split(" ")[0],
  leaveType: record.leaveType,
  startTime: formatManagementLeaveTime(record.startTime),
  endTime: formatManagementLeaveTime(record.endTime),
  duration: record.leaveDuration,
  unit: record.unit,
  status: statusToDetailMap[record.billStatus] || record.billStatus,
  approver: record.approver,
  reason: record.reason || "请假申请已提交，等待审批流程处理。",
  attachments: record.attachments || [],
  comment: record.comment || "审批流程处理中",
});

const buildRecordFromDetail = (detail, sourceRecord = {}) => ({
  ...sourceRecord,
  billNo: detail.billNo,
  employeeCode: detail.employeeCode,
  employeeName: detail.applicant,
  organization: detail.organization,
  leaveType: detail.leaveType,
  startTime: detail.startTime,
  endTime: detail.endTime,
  leaveDuration: detail.duration,
  unit: detail.unit,
  billStatus: statusToListMap[detail.status] || detail.status,
  approver: detail.approver,
  reason: detail.reason,
  attachments: detail.attachments || [],
  comment: detail.comment,
});

const leaveOrderList = ref([
  {
    billNo: "QJD20260401001",
    employeeCode: "HR2023001",
    employeeName: "张敏",
    organization: "华东运营中心",
    leaveType: "年假",
    startTime: "2026-04-01 09:00",
    endTime: "2026-04-02 18:00",
    leaveDuration: 2,
    unit: "天",
    billStatus: "已审批",
    approver: "李经理",
  },
  {
    billNo: "QJD20260403002",
    employeeCode: "HR2023002",
    employeeName: "李倩",
    organization: "人力资源部",
    leaveType: "病假",
    startTime: "2026-04-03 13:30",
    endTime: "2026-04-04 18:00",
    leaveDuration: 1.5,
    unit: "天",
    billStatus: "审批中",
    approver: "王总监",
  },
  {
    billNo: "QJD20260405003",
    employeeCode: "HR2023003",
    employeeName: "王浩",
    organization: "产品研发部",
    leaveType: "调休",
    startTime: "2026-04-05 09:00",
    endTime: "2026-04-05 13:00",
    leaveDuration: 4,
    unit: "小时",
    billStatus: "草稿",
    approver: "赵主管",
  },
  {
    billNo: "QJD20260406004",
    employeeCode: "HR2023004",
    employeeName: "赵雪",
    organization: "财务管理部",
    leaveType: "婚假",
    startTime: "2026-04-06 09:00",
    endTime: "2026-04-10 18:00",
    leaveDuration: 5,
    unit: "天",
    billStatus: "已审批",
    approver: "陈总监",
  },
  {
    billNo: "QJD20260408005",
    employeeCode: "HR2023005",
    employeeName: "陈博",
    organization: "法务中心",
    leaveType: "陪产假",
    startTime: "2026-04-08 09:00",
    endTime: "2026-04-10 18:00",
    leaveDuration: 3,
    unit: "天",
    billStatus: "已审批",
    approver: "周经理",
  },
  {
    billNo: "QJD20260411006",
    employeeCode: "HR2023006",
    employeeName: "周岚",
    organization: "市场发展部",
    leaveType: "产假",
    startTime: "2026-04-11 09:00",
    endTime: "2026-09-15 18:00",
    leaveDuration: 158,
    unit: "天",
    billStatus: "已审批",
    approver: "何总监",
  },
  {
    billNo: "QJD20260412007",
    employeeCode: "HR2023007",
    employeeName: "孙洋",
    organization: "客户成功部",
    leaveType: "年假",
    startTime: "2026-04-12 09:00",
    endTime: "2026-04-12 18:00",
    leaveDuration: 1,
    unit: "天",
    billStatus: "审批中",
    approver: "刘经理",
  },
  {
    billNo: "QJD20260415008",
    employeeCode: "HR2023008",
    employeeName: "刘畅",
    organization: "供应链部",
    leaveType: "事假",
    startTime: "2026-04-15 14:00",
    endTime: "2026-04-15 18:00",
    leaveDuration: 4,
    unit: "小时",
    billStatus: "已驳回",
    approver: "高主管",
  },
  {
    billNo: "QJD20260418009",
    employeeCode: "HR2023009",
    employeeName: "高宁",
    organization: "数字化平台主管部",
    leaveType: "调休",
    startTime: "2026-04-18 09:00",
    endTime: "2026-04-18 12:00",
    leaveDuration: 3,
    unit: "小时",
    billStatus: "已审批",
    approver: "彭经理",
  },
  {
    billNo: "QJD20260420010",
    employeeCode: "HR2023010",
    employeeName: "郭晨",
    organization: "品牌管理部",
    leaveType: "丧假",
    startTime: "2026-04-20 09:00",
    endTime: "2026-04-22 18:00",
    leaveDuration: 3,
    unit: "天",
    billStatus: "草稿",
    approver: "未提交",
  },
  {
    billNo: "QJD20260422011",
    employeeCode: "HR2023011",
    employeeName: "何静",
    organization: "技术支持部",
    leaveType: "病假",
    startTime: "2026-04-22 09:00",
    endTime: "2026-04-23 18:00",
    leaveDuration: 2,
    unit: "天",
    billStatus: "审批中",
    approver: "孙主管",
  },
  {
    billNo: "QJD20260425012",
    employeeCode: "HR2023012",
    employeeName: "彭越",
    organization: "销售管理部",
    leaveType: "年假",
    startTime: "2026-04-25 09:00",
    endTime: "2026-04-25 18:00",
    leaveDuration: 1,
    unit: "天",
    billStatus: "已审批",
    approver: "吴经理",
  },
]);

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  if (!keyword) {
    return leaveOrderList.value;
  }
  return leaveOrderList.value.filter((item) =>
    [
      item.billNo,
      item.employeeCode,
      item.employeeName,
      item.organization,
      item.leaveType,
      item.billStatus,
      item.approver,
    ].some((field) => String(field || "").toLowerCase().includes(keyword)),
  );
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

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const updateBillStatus = (targetRows, status) => {
  const targetIds = new Set(targetRows.map((item) => item.billNo));
  leaveOrderList.value = leaveOrderList.value.map((item) => {
    if (!targetIds.has(item.billNo)) {
      return item;
    }
    return {
      ...item,
      billStatus: status,
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

const handleMoreCommand = (command) => {
  const selectedRows = getSelectedRows();

  if (command === "exportSelected") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要导出的请假单");
    }
    return ElMessage.success(`已导出 ${selectedRows.length} 条选中记录`);
  }

  if (command === "exportAll") {
    return ElMessage.success(`已导出 ${filteredList.value.length} 条列表记录`);
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

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
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
  const recordIndex = leaveOrderList.value.findIndex(
    (item) => item.billNo === updatedRecord.billNo,
  );
  if (recordIndex === -1) {
    return;
  }
  const updatedListRecord = buildRecordFromDetail(
    updatedRecord,
    leaveOrderList.value[recordIndex],
  );
  leaveOrderList.value.splice(recordIndex, 1, updatedListRecord);
  currentDetail.value = buildDetailFromRecord(updatedListRecord);
};

const handleDeleteDetailRecord = (record) => {
  const recordIndex = leaveOrderList.value.findIndex(
    (item) => item.billNo === record.billNo,
  );
  if (recordIndex > -1) {
    leaveOrderList.value.splice(recordIndex, 1);
  }
  closeDetailSidebar();
};

const handlePagination = () => {};

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
