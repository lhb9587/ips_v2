<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import OvertimeDetailContent from "@/views/hrm/my-attendance/overtime-list/components/OvertimeDetailContent.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const router = useRouter();
const store = useStore();

const gridName = "overtimeManagementGrid";
const columnOptions = [
  { title: "单据编号", value: "billNo" },
  { title: "员工编码", value: "employeeCode" },
  { title: "姓名", value: "applicant" },
  { title: "组织", value: "organization" },
  { title: "职位", value: "position" },
  { title: "加班日期", value: "overtimeDate" },
  { title: "加班开始时间", value: "startTime" },
  { title: "加班结束时间", value: "endTime" },
  { title: "休息时长（分）", value: "breakMinutes" },
  { title: "申请加班小时数", value: "overtimeHours" },
  { title: "加班原因", value: "overtimeReason" },
  { title: "单据状态", value: "billStatus" },
  { title: "审批人", value: "approver" },
  { title: "来源", value: "source" },
];

const columnList = ref([...columnOptions]);
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
  const element = boxRef.value;
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

const overtimeOrderList = ref([
  {
    billNo: "JBD20260401001",
    employeeCode: "HR2023001",
    applicant: "张敏",
    organization: "华东运营中心",
    position: "招聘专员",
    applyDate: "2026-04-01",
    overtimeDate: "2026-04-01",
    startTimeOnly: "18:30",
    endTimeOnly: "21:30",
    startTime: "2026-04-01 18:30",
    endTime: "2026-04-01 21:30",
    breakMinutes: 30,
    overtimeHours: 2.5,
    overtimeReason: "招聘项目集中面试",
    billStatus: "已审批",
    approver: "李经理",
    source: "员工自助",
    remark: "配合候选人夜间面试及复盘。",
    comment: "审批通过",
  },
  {
    billNo: "JBD20260403002",
    employeeCode: "HR2023002",
    applicant: "李倩",
    organization: "人力资源部",
    position: "人力资源主管",
    applyDate: "2026-04-03",
    overtimeDate: "2026-04-03",
    startTimeOnly: "19:00",
    endTimeOnly: "22:00",
    startTime: "2026-04-03 19:00",
    endTime: "2026-04-03 22:00",
    breakMinutes: 0,
    overtimeHours: 3,
    overtimeReason: "绩效校准会议",
    billStatus: "审批中",
    approver: "王总监",
    source: "员工自助",
    remark: "完成部门绩效资料校准。",
    comment: "部门负责人审批中",
  },
  {
    billNo: "JBD20260405003",
    employeeCode: "HR2023003",
    applicant: "王浩",
    organization: "产品研发部",
    position: "产品经理",
    applyDate: "2026-04-05",
    overtimeDate: "2026-04-05",
    startTimeOnly: "09:00",
    endTimeOnly: "13:00",
    startTime: "2026-04-05 09:00",
    endTime: "2026-04-05 13:00",
    breakMinutes: 30,
    overtimeHours: 3.5,
    overtimeReason: "版本上线",
    billStatus: "草稿",
    approver: "未提交",
    source: "员工自助",
    remark: "周末版本发布窗口支持。",
    comment: "草稿暂未进入审批",
  },
  {
    billNo: "JBD20260408004",
    employeeCode: "HR2023004",
    applicant: "赵雪",
    organization: "财务管理部",
    position: "财务会计",
    applyDate: "2026-04-08",
    overtimeDate: "2026-04-08",
    startTimeOnly: "18:00",
    endTimeOnly: "20:30",
    startTime: "2026-04-08 18:00",
    endTime: "2026-04-08 20:30",
    breakMinutes: 0,
    overtimeHours: 2.5,
    overtimeReason: "月结处理",
    billStatus: "已审批",
    approver: "陈总监",
    source: "员工自助",
    remark: "处理月末账务结算。",
    comment: "审批通过",
  },
  {
    billNo: "JBD20260412005",
    employeeCode: "HR2023005",
    applicant: "陈博",
    organization: "法务中心",
    position: "法务专员",
    applyDate: "2026-04-12",
    overtimeDate: "2026-04-12",
    startTimeOnly: "18:30",
    endTimeOnly: "21:00",
    startTime: "2026-04-12 18:30",
    endTime: "2026-04-12 21:00",
    breakMinutes: 0,
    overtimeHours: 2.5,
    overtimeReason: "合同紧急审核",
    billStatus: "已驳回",
    approver: "周经理",
    source: "员工自助",
    remark: "客户合同急件处理。",
    comment: "请补充项目背景后重新提交",
  },
  {
    billNo: "JBD20260416006",
    employeeCode: "HR2023006",
    applicant: "周岚",
    organization: "市场发展部",
    position: "市场经理",
    applyDate: "2026-04-16",
    overtimeDate: "2026-04-16",
    startTimeOnly: "20:00",
    endTimeOnly: "23:00",
    startTime: "2026-04-16 20:00",
    endTime: "2026-04-16 23:00",
    breakMinutes: 0,
    overtimeHours: 3,
    overtimeReason: "客户活动支持",
    billStatus: "审批中",
    approver: "何总监",
    source: "员工自助",
    remark: "协助客户活动收尾及数据整理。",
    comment: "等待部门负责人审批",
  },
]);

const buildDetailFromRecord = (record) => ({
  ...record,
  status: statusToDetailMap[record.billStatus] || record.billStatus,
});

const buildRecordFromDetail = (detail, sourceRecord = {}) => ({
  ...sourceRecord,
  ...detail,
  billStatus: statusToListMap[detail.status] || detail.status,
});

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  if (!keyword) {
    return overtimeOrderList.value;
  }
  return overtimeOrderList.value.filter((item) =>
    [
      item.billNo,
      item.employeeCode,
      item.applicant,
      item.organization,
      item.position,
      item.overtimeDate,
      item.startTime,
      item.endTime,
      item.overtimeReason,
      item.billStatus,
      item.approver,
      item.source,
      item.remark,
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

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const updateBillStatus = (targetRows, status) => {
  const targetIds = new Set(targetRows.map((item) => item.billNo));
  overtimeOrderList.value = overtimeOrderList.value.map((item) => {
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
    return ElMessage.warning("请先选择需要提交生效的加班单");
  }
  updateBillStatus(selectedRows, "已生效");
  ElMessage.success(`已提交 ${selectedRows.length} 条加班单生效`);
};

const handleMoreCommand = (command) => {
  const selectedRows = getSelectedRows();

  if (command === "exportSelected") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要导出的加班单");
    }
    return ElMessage.success(`已导出 ${selectedRows.length} 条选中记录`);
  }

  if (command === "exportAll") {
    return ElMessage.success(`已导出 ${filteredList.value.length} 条列表记录`);
  }

  if (command === "reverseApproval") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要反审批的加班单");
    }
    updateBillStatus(selectedRows, "草稿");
    return ElMessage.success(`已完成 ${selectedRows.length} 条加班单反审批`);
  }

  if (command === "discard") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要废弃的加班单");
    }
    updateBillStatus(selectedRows, "已废弃");
    return ElMessage.success(`已废弃 ${selectedRows.length} 条加班单`);
  }
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
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

const handleRowDoubleClick = (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
  const detail = buildDetailFromRecord(params.data);
  sessionStorage.setItem("myOvertimeCurrentDetail", JSON.stringify(detail));
  detailDrawerVisible.value = false;
  router.push({
    name: "my-overtime-detail",
    params: { billNo: detail.billNo },
  });
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
};

const handleUpdateDetailRecord = (updatedRecord) => {
  const recordIndex = overtimeOrderList.value.findIndex(
    (item) => item.billNo === updatedRecord.billNo,
  );
  if (recordIndex === -1) {
    return;
  }
  const updatedListRecord = buildRecordFromDetail(
    updatedRecord,
    overtimeOrderList.value[recordIndex],
  );
  overtimeOrderList.value.splice(recordIndex, 1, updatedListRecord);
  currentDetail.value = buildDetailFromRecord(updatedListRecord);
};

const handleDeleteDetailRecord = (record) => {
  const recordIndex = overtimeOrderList.value.findIndex(
    (item) => item.billNo === record.billNo,
  );
  if (recordIndex > -1) {
    overtimeOrderList.value.splice(recordIndex, 1);
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
              :rowDoubleClicked="handleRowDoubleClick"
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
      sidebarName="overtime-management-detail-sidebar"
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

.overtime-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
