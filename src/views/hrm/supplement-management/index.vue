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
import SupplementDetailContent from "@/views/hrm/my-attendance/supplement-detail/components/SupplementDetailContent.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const router = useRouter();
const store = useStore();

const gridName = "supplementManagementGrid";
const columnOptions = [
  { title: "单据编号", value: "billNo" },
  { title: "员工编码", value: "employeeCode" },
  { title: "姓名", value: "employeeName" },
  { title: "组织", value: "organization" },
  { title: "考勤日期", value: "attendanceDate" },
  { title: "补签类型", value: "type" },
  { title: "补签时间点", value: "timePoint" },
  { title: "补签原因", value: "reason" },
  { title: "子项数", value: "itemCount" },
  { title: "单据状态", value: "billStatus" },
  { title: "审批人", value: "approver" },
  { title: "备注", value: "remark" },
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

const supplementOrderList = ref([
  {
    billNo: "BQD20260401001",
    employeeCode: "HR2023001",
    employeeName: "张敏",
    position: "招聘专员",
    organization: "华东运营中心",
    applyDate: "2026-04-01",
    billStatus: "已审批",
    approver: "李经理",
    approvalComment: "审批通过",
    items: [
      {
        attendanceDate: "2026-04-01",
        timePoint: "09:00",
        type: "上班补签",
        reason: "忘记打卡",
        remark: "早会前到岗，忘记刷卡。",
      },
    ],
  },
  {
    billNo: "BQD20260403002",
    employeeCode: "HR2023002",
    employeeName: "李倩",
    position: "人力资源主管",
    organization: "人力资源部",
    applyDate: "2026-04-03",
    billStatus: "审批中",
    approver: "王总监",
    approvalComment: "部门负责人审批中",
    items: [
      {
        attendanceDate: "2026-04-03",
        timePoint: "18:00",
        type: "下班补签",
        reason: "外出公干",
        remark: "客户现场沟通后直接下班。",
      },
    ],
  },
  {
    billNo: "BQD20260405003",
    employeeCode: "HR2023003",
    employeeName: "王浩",
    position: "产品经理",
    organization: "产品研发部",
    applyDate: "2026-04-05",
    billStatus: "草稿",
    approver: "未提交",
    approvalComment: "草稿暂未进入审批",
    items: [
      {
        attendanceDate: "2026-04-05",
        timePoint: "09:30",
        type: "上班补签",
        reason: "其他补签",
        remark: "园区入口排队导致未及时打卡。",
      },
    ],
  },
  {
    billNo: "BQD20260408004",
    employeeCode: "HR2023004",
    employeeName: "赵雪",
    position: "财务会计",
    organization: "财务管理部",
    applyDate: "2026-04-08",
    billStatus: "已审批",
    approver: "陈总监",
    approvalComment: "审批通过",
    items: [
      {
        attendanceDate: "2026-04-08",
        timePoint: "13:30",
        type: "外出补签",
        reason: "外出公干",
        remark: "午间外出办理银行业务后返回。",
      },
      {
        attendanceDate: "2026-04-08",
        timePoint: "18:00",
        type: "下班补签",
        reason: "外出公干",
        remark: "结束业务后直接返回家中。",
      },
    ],
  },
  {
    billNo: "BQD20260412005",
    employeeCode: "HR2023005",
    employeeName: "陈博",
    position: "法务专员",
    organization: "法务中心",
    applyDate: "2026-04-12",
    billStatus: "已驳回",
    approver: "周经理",
    approvalComment: "请补充外出说明后重新提交",
    items: [
      {
        attendanceDate: "2026-04-12",
        timePoint: "09:00",
        type: "上班补签",
        reason: "外出公干",
        remark: "材料不足，需补充说明。",
      },
    ],
  },
  {
    billNo: "BQD20260416006",
    employeeCode: "HR2023006",
    employeeName: "周岚",
    position: "市场经理",
    organization: "市场发展部",
    applyDate: "2026-04-16",
    billStatus: "审批中",
    approver: "何总监",
    approvalComment: "等待部门负责人审批",
    items: [
      {
        attendanceDate: "2026-04-16",
        timePoint: "18:15",
        type: "下班补签",
        reason: "参加公司团建",
        remark: "团建活动结束后统一离场。",
      },
    ],
  },
]);

const getFirstItem = (record) => record.items?.[0] || {};

const buildListRow = (record) => {
  const firstItem = getFirstItem(record);
  return {
    ...record,
    attendanceDate: firstItem.attendanceDate || "--",
    type: firstItem.type || "--",
    timePoint: firstItem.timePoint || "--",
    reason: firstItem.reason || "--",
    remark: firstItem.remark || "--",
    itemCount: record.items?.length || 0,
  };
};

const buildDetailFromRecord = (record) => ({
  billNo: record.billNo,
  applicant: record.employeeName,
  employeeCode: record.employeeCode,
  position: record.position,
  organization: record.organization,
  applyDate: record.applyDate,
  status: statusToDetailMap[record.billStatus] || record.billStatus,
  approver: record.approver,
  approvalComment: record.approvalComment,
  items: Array.isArray(record.items) ? record.items.map((item) => ({ ...item })) : [],
});

const buildRecordFromDetail = (detail, sourceRecord = {}) => ({
  ...sourceRecord,
  billNo: detail.billNo,
  employeeCode: detail.employeeCode,
  employeeName: detail.applicant,
  position: detail.position,
  organization: detail.organization,
  applyDate: detail.applyDate,
  billStatus: statusToListMap[detail.status] || detail.status,
  approver: detail.approver,
  approvalComment: detail.approvalComment,
  items: Array.isArray(detail.items) ? detail.items.map((item) => ({ ...item })) : [],
});

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  if (!keyword) {
    return supplementOrderList.value;
  }
  return supplementOrderList.value.filter((item) => {
    const row = buildListRow(item);
    return [
      row.billNo,
      row.employeeCode,
      row.employeeName,
      row.organization,
      row.attendanceDate,
      row.type,
      row.timePoint,
      row.reason,
      row.billStatus,
      row.approver,
      row.remark,
    ].some((field) => String(field || "").toLowerCase().includes(keyword));
  });
});

const total = computed(() => filteredList.value.length);

const gridData = computed(() => {
  const start = (listQuery.value.pageNo - 1) * listQuery.value.pageSize;
  const end = start + listQuery.value.pageSize;
  return filteredList.value.slice(start, end).map((item, index) => ({
    ...buildListRow(item),
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
  supplementOrderList.value = supplementOrderList.value.map((item) => {
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
    return ElMessage.warning("请先选择需要提交生效的补签卡");
  }
  updateBillStatus(selectedRows, "已生效");
  ElMessage.success(`已提交 ${selectedRows.length} 条补签卡生效`);
};

const handleMoreCommand = (command) => {
  const selectedRows = getSelectedRows();

  if (command === "exportSelected") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要导出的补签卡");
    }
    return ElMessage.success(`已导出 ${selectedRows.length} 条选中记录`);
  }

  if (command === "exportAll") {
    return ElMessage.success(`已导出 ${filteredList.value.length} 条列表记录`);
  }

  if (command === "reverseApproval") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要反审批的补签卡");
    }
    updateBillStatus(selectedRows, "草稿");
    return ElMessage.success(`已完成 ${selectedRows.length} 条补签卡反审批`);
  }

  if (command === "discard") {
    if (selectedRows.length === 0) {
      return ElMessage.warning("请先选择需要废弃的补签卡");
    }
    updateBillStatus(selectedRows, "已废弃");
    return ElMessage.success(`已废弃 ${selectedRows.length} 条补签卡`);
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
  sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(detail));
  detailDrawerVisible.value = false;
  router.push({
    name: "my-supplement-detail",
    params: { billNo: detail.billNo },
  });
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
};

const handleUpdateDetailRecord = (updatedRecord) => {
  const recordIndex = supplementOrderList.value.findIndex(
    (item) => item.billNo === updatedRecord.billNo,
  );
  if (recordIndex === -1) {
    return;
  }
  const updatedListRecord = buildRecordFromDetail(
    updatedRecord,
    supplementOrderList.value[recordIndex],
  );
  supplementOrderList.value.splice(recordIndex, 1, updatedListRecord);
  currentDetail.value = buildDetailFromRecord(updatedListRecord);
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
      sidebarName="supplement-management-detail-sidebar"
      :minWidth="900"
      :width="1180"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetailSidebar"
    >
      <div
        v-if="currentDetail"
        class="supplement-detail-sidebar"
      >
        <SupplementDetailContent
          :detailInfo="currentDetail"
          @close="closeDetailSidebar"
          @update-detail="handleUpdateDetailRecord"
        />
      </div>
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.supplement-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
