<!-- 请假列表页，用于查询、筛选和查看员工请假单。 -->
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import LeaveDetailContent from "./components/LeaveDetailContent.vue";
import { saveTableConfig } from "@/utils";
import {
  abandonLeaveRequestSelf,
  deleteLeaveRequestSelf,
  queryLeaveRequestAdminDetail,
  queryLeaveRequestSelfPage,
} from "@/api/attendance";
import {
  buildLeaveRequestIdsPayload,
  getLeaveRequestId,
  normalizeLeaveDetail,
} from "@/views/hrm/my-attendance/utils/leaveDetail";

const route = useRoute();
const router = useRouter();
const store = useStore();

const bussId = 474;
const gridName = "myLeaveListGrid";
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
const leaveRecords = ref([]);

const total = ref(0);

const gridData = computed(() =>
  leaveRecords.value.map((item, index) => ({
    ...item,
    sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
  })),
);

const fetchLeaveList = async () => {
  const payload = {
    pageNo: listQuery.value.pageNo,
    pageSize: listQuery.value.pageSize,
    requestNo: diminput.value?.trim() || undefined,
    requestStatus: statusFilter.value || undefined,
  };
  const res = await queryLeaveRequestSelfPage(payload, { isLoading: false });
  const list = Array.isArray(res?.data) ? res.data : [];
  leaveRecords.value = list
  total.value = Number(res?.total || 0);
};

const mapLeaveDetail = (detail, fallback = {}) => normalizeLeaveDetail(detail, fallback);

const fetchLeaveDetail = async (rowData) => {
  const rowRequestId = getLeaveRequestId(rowData);
  if (rowRequestId === null) {
    return mapLeaveDetail(rowData);
  }
  const res = await queryLeaveRequestAdminDetail(
    { leaveRequestId: rowRequestId },
    { isLoading: false },
  );
  return mapLeaveDetail(res?.data || {}, rowData);
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  fetchLeaveList();
};

const handleCreate = () => {
  router.push({ name: "my-leave-application" });
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const getRowRequestId = (row) => getLeaveRequestId(row);

const validateOperableRows = (rows, flagKey, actionLabel) => {
  if (!rows.length) {
    ElMessage.warning(`请先选择需要${actionLabel}的请假单`);
    return null;
  }
  const operableRows = rows.filter((item) => item?.[flagKey]);
  if (!operableRows.length) {
    ElMessage.warning(`所选记录中没有可${actionLabel}的请假单`);
    return null;
  }
  if (operableRows.length !== rows.length) {
    ElMessage.warning(`所选记录中包含不可${actionLabel}的请假单，请重新选择`);
    return null;
  }
  return operableRows;
};

const refreshListAfterBatchAction = (processedIds = []) => {
  const processedIdSet = new Set(processedIds.map((id) => String(id)));
  if (
    currentDetail.value &&
    processedIdSet.has(String(getRowRequestId(currentDetail.value) || ""))
  ) {
    closeDetailSidebar();
  }
  gridRef.value?.getRowNode?.()?.forEach?.((node) => node.setSelected(false));
  fetchLeaveList();
};

const handleBatchDelete = () => {
  const operableRows = validateOperableRows(getSelectedRows(), "canDelete", "删除");
  if (!operableRows) {
    return;
  }
  const payload = buildLeaveRequestIdsPayload(operableRows);
  if (!payload) {
    return ElMessage.warning("选中记录缺少请假单ID，无法删除");
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${operableRows.length} 条请假草稿吗？删除后不可恢复。`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() =>
      deleteLeaveRequestSelf(payload, { isLoading: true }).then((res) => {
        const successCount = Number(res?.data?.successCount || operableRows.length);
        ElMessage.success(`已删除 ${successCount} 条请假草稿`);
        refreshListAfterBatchAction(
          res?.data?.leaveRequestIds || operableRows.map((item) => getRowRequestId(item)),
        );
      }),
    )
    .catch(() => {});
};

const handleBatchAbandon = () => {
  const operableRows = validateOperableRows(getSelectedRows(), "canAbandon", "废弃");
  if (!operableRows) {
    return;
  }
  const payload = buildLeaveRequestIdsPayload(operableRows);
  if (!payload) {
    return ElMessage.warning("选中记录缺少请假单ID，无法废弃");
  }
  ElMessageBox.confirm(
    `确定要废弃选中的 ${operableRows.length} 条请假单吗？废弃后该单据将不再进入审批流程。`,
    "废弃确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() =>
      abandonLeaveRequestSelf(payload, { isLoading: true }).then((res) => {
        const successCount = Number(res?.data?.successCount || operableRows.length);
        ElMessage.success(`已废弃 ${successCount} 条请假单`);
        refreshListAfterBatchAction(
          res?.data?.leaveRequestIds || operableRows.map((item) => getRowRequestId(item)),
        );
      }),
    )
    .catch(() => {});
};

const handleRowClick = (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
  }
  rowClickTimer = setTimeout(async () => {
    try {
      currentDetail.value = await fetchLeaveDetail(params.data);
      detailDrawerVisible.value = true;
    } catch (error) {
      console.log(error);
    } finally {
      rowClickTimer = null;
    }
  }, 220);
};

const handleRowDoubleClick = async (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
  let detailData = params.data;
  try {
    detailData = await fetchLeaveDetail(params.data);
  } catch (error) {
    console.log(error);
  }
  sessionStorage.setItem("myLeaveCurrentDetail", JSON.stringify(detailData));
  detailDrawerVisible.value = false;
  const leaveRequestId = getLeaveRequestId(detailData);
  router.push({
    name: "my-leave-detail",
    params: { billNo: detailData.requestNo || detailData.billNo || "" },
    query:
      leaveRequestId !== null
        ? { leaveRequestId: String(leaveRequestId) }
        : {},
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

const handleRefreshList = () => {
  closeDetailSidebar();
  fetchLeaveList();
};

const handlePagination = () => {
  fetchLeaveList();
};

const handleUpdateDetailRecord = (updatedRecord) => {
  const record = normalizeLeaveDetail(updatedRecord);
  if (!record.leaveRequestId) {
    return;
  }
  const recordIndex = leaveRecords.value.findIndex(
    (item) => getRowRequestId(item) === record.leaveRequestId,
  );
  if (recordIndex === -1) {
    return;
  }
  leaveRecords.value.splice(recordIndex, 1, record);
  currentDetail.value = { ...record };
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchLeaveList();
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
          style="margin-bottom: 0;"
        >
          <div class="card-body leave-list-header">
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex flex-wrap"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 220px"
                    placeholder="请输入单据编号"
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
                      v-for="item in ['未提交', '审批中', '已通过', '已退回']"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                  <el-button
                    type="primary"
                    @click="handleCreate"
                  >
                    新建请假申请
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    @click="handleBatchAbandon"
                  >
                    废弃
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    @click="handleBatchDelete"
                  >
                    删除
                  </el-button>
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
                    status: statusFilter,
                    bussId,
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
              showSelectionColumn
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
      sidebarName="my-leave-detail-sidebar"
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
          @refresh-list="handleRefreshList"
        />
      </div>
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.leave-list-header {
  padding-bottom: 10px;
}

.leave-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
