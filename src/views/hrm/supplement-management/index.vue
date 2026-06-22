<!-- 后台补签卡列表页：分页查询、详情侧栏与批量管理操作。 -->
<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import SupplementDetailContent from "@/views/hrm/my-attendance/supplement-detail/components/SupplementDetailContent.vue";
import {
  abandonSupplementRequestAdmin,
  exportSupplementRequestAdmin,
  querySupplementRequestAdminPage,
  reverseApproveSupplementRequestAdmin,
} from "@/api/attendance";
import { downLoad, saveTableConfig } from "@/utils";
import {
  buildSupplementRequestIdsPayload,
  fetchSupplementRequestDetail,
  getSupplementRequestId,
  normalizeSupplementDetail,
} from "@/views/hrm/my-attendance/utils/supplementDetail";

const route = useRoute();
const router = useRouter();
const store = useStore();

const handleBackToAttendanceManagement = () => {
  router.push({ name: "attendance-management" });
};

const bussId = 479;
const gridName = "supplementManagementGrid";

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

const buildListQueryParams = () => {
  const keyword = diminput.value.trim();
  const params = {
    pageNo: listQuery.value.pageNo,
    pageSize: listQuery.value.pageSize,
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
  id: item.supplementRequestId,
  sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
});

const fetchSupplementRequestList = () => {
  querySupplementRequestAdminPage(buildListQueryParams(), { isLoading: true })
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

const fetchSupplementDetail = async (rowData) => {
  const supplementRequestId = getSupplementRequestId(rowData);
  if (supplementRequestId === null) {
    ElMessage.warning("当前记录缺少补签单ID，无法打开详情");
    throw new Error("missing supplementRequestId");
  }
  return fetchSupplementRequestDetail(supplementRequestId, rowData);
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  fetchSupplementRequestList();
};

const handleAdvancedSearch = (typeStr) => {
  diminput.value = "";
  listQuery.value.pageNo = 1;
  formInline.value = { ...typeStr.data };
  fetchSupplementRequestList();
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const getRowRequestId = (row) => getSupplementRequestId(row);

const validateOperableRows = (rows, flagKey, actionLabel) => {
  if (!rows.length) {
    ElMessage.warning(`请先选择需要${actionLabel}的补签卡`);
    return null;
  }
  const operableRows = rows.filter((item) => item?.[flagKey]);
  if (!operableRows.length) {
    ElMessage.warning(`所选记录中没有可${actionLabel}的补签卡`);
    return null;
  }
  if (operableRows.length !== rows.length) {
    ElMessage.warning(`所选记录中包含不可${actionLabel}的补签卡，请重新选择`);
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
  fetchSupplementRequestList();
};

const runBatchAdminAction = async ({
  rows,
  flagKey,
  actionLabel,
  confirmMessage,
  requestFn,
  successLabel,
  skipFlagCheck = false,
}) => {
  if (!rows.length) {
    ElMessage.warning(`请先选择需要${actionLabel}的补签卡`);
    return;
  }
  const operableRows = skipFlagCheck
    ? rows
    : validateOperableRows(rows, flagKey, actionLabel);
  if (!operableRows) {
    return;
  }
  try {
    await ElMessageBox.confirm(confirmMessage, `${actionLabel}确认`, {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  const payload = buildSupplementRequestIdsPayload(operableRows);
  if (!payload) {
    return ElMessage.warning(`选中记录缺少补签单ID，无法${actionLabel}`);
  }
  try {
    const res = await requestFn(payload, { isLoading: true });
    const successCount = Number(res?.data?.successCount || operableRows.length);
    ElMessage.success(`已${successLabel} ${successCount} 条补签卡`);
    refreshListAfterBatchAction(
      res?.data?.supplementRequestIds ||
        operableRows.map((item) => getRowRequestId(item)),
    );
  } catch (error) {
    console.log(error);
  }
};

const handleExport = (command) => {
  const payload = {
    ...buildExportParams(),
    exportMode: command === "exportSelected" ? "SELECTED" : "ALL",
  };

  if (command === "exportSelected") {
    const selectedRows = getSelectedRows();
    if (!selectedRows.length) {
      return ElMessage.warning("请先选择需要导出的补签卡");
    }
    const supplementRequestIds = [
      ...new Set(
        selectedRows
          .map((item) => getRowRequestId(item))
          .filter((id) => id || id === 0),
      ),
    ];
    if (!supplementRequestIds.length) {
      return ElMessage.warning("选中记录缺少补签单ID，无法导出");
    }
    payload.supplementRequestIds = supplementRequestIds.join(",");
  }

  exportSupplementRequestAdmin(payload, { isLoading: true }).then((res) => {
    const filePath = res?.data?.filePath;
    const fileName = res?.data?.fileName || "后台补签卡导出.xlsx";
    if (!filePath) {
      return ElMessage.warning("导出文件地址为空");
    }
    downLoad(filePath, fileName);
    ElMessage.success(command === "exportSelected" ? "选中导出成功" : "全部导出成功");
  });
};

const handleMoreCommand = (command) => {
  if (command === "exportSelected" || command === "exportAll") {
    return handleExport(command);
  }

  if (command === "reverseApproval") {
    return runBatchAdminAction({
      rows: getSelectedRows(),
      flagKey: "canReverseApprove",
      actionLabel: "反审批",
      confirmMessage: "确定将选中的已通过补签单反审批为未提交吗？",
      requestFn: reverseApproveSupplementRequestAdmin,
      successLabel: "反审批",
    });
  }

  if (command === "discard") {
    return runBatchAdminAction({
      rows: getSelectedRows(),
      actionLabel: "废弃",
      confirmMessage: "确定要废弃选中的补签卡吗？废弃后该单据将不再进入审批流程。",
      requestFn: abandonSupplementRequestAdmin,
      successLabel: "废弃",
      skipFlagCheck: true,
    });
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
  if (
    ["attendanceDateTime", "applyTime", "submitTime", "approveTime"].includes(
      params?.colDef?.field,
    )
  ) {
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
  rowClickTimer = setTimeout(async () => {
    try {
      currentDetail.value = await fetchSupplementDetail(params.data);
      detailDrawerVisible.value = true;
    } catch (error) {
      console.log(error);
    } finally {
      rowClickTimer = null;
    }
  }, 220);
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
};

const handleRefreshList = () => {
  closeDetailSidebar();
  fetchSupplementRequestList();
};

const handleUpdateDetailRecord = (updatedRecord) => {
  const record = normalizeSupplementDetail(updatedRecord);
  const recordId = getSupplementRequestId(record);
  if (recordId === null) {
    return;
  }
  const recordIndex = gridData.value.findIndex(
    (item) => getRowRequestId(item) === recordId,
  );
  if (recordIndex === -1) {
    return;
  }
  gridData.value.splice(recordIndex, 1, {
    ...gridData.value[recordIndex],
    ...record,
    status: record.status || record.billStatus,
  });
  currentDetail.value = { ...record };
};

const handlePagination = () => {
  fetchSupplementRequestList();
};

const handleMissingCheck = () => {
  router.push({ name: "supplement-missing-check" });
};

onMounted(() => {
  fetchSupplementRequestList();
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
                    @keyup.enter="fuzzySearch"
                    class="top-search"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <ListSearch
                    name="supplementManagementList"
                    :buss-id="bussId"
                    :is-show="true"
                    @search="handleAdvancedSearch"
                  />
                  <el-button @click="handleMissingCheck">缺卡检查</el-button>
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
                <el-button
                  plain
                  @click="handleBackToAttendanceManagement"
                >
                  返回假勤管理导航
                </el-button>
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
          admin-mode
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

.supplement-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
