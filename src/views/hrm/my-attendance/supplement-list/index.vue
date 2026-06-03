<!-- 补签卡列表页，用于查询、筛选和查看员工补签卡单。 -->
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
import SupplementDetailContent from "@/views/hrm/my-attendance/supplement-detail/components/SupplementDetailContent.vue";
import {
  abandonSupplementRequestSelf,
  deleteSupplementRequestSelf,
  querySupplementRequestSelfPage,
} from "@/api/attendance";
import { saveTableConfig } from "@/utils";
import {
  buildSupplementRequestIdsPayload,
  fetchSupplementRequestDetail,
  getSupplementRequestId,
  normalizeSupplementDetail,
  normalizeSupplementListRow,
} from "@/views/hrm/my-attendance/utils/supplementDetail";

const route = useRoute();
const router = useRouter();
const store = useStore();

const bussId = 478;
const gridName = "mySupplementCardListGrid";
const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const supplementRecords = ref([]);
const total = ref(0);
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
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  return savedData ? savedData.pageSize : 50;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});

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
    return windowHeight - 260;
  }
  return windowHeight - 306;
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

const listRows = computed(() => supplementRecords.value);

const gridData = computed(() =>
  listRows.value.map((item, index) => ({
    ...item,
    sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
  })),
);

const fetchSupplementList = async () => {
  const keyword = diminput.value.trim();
  const payload = {
    pageNo: listQuery.value.pageNo,
    pageSize: Math.min(listQuery.value.pageSize, 100),
    keyword: keyword || undefined,
  };
  try {
    const res = await querySupplementRequestSelfPage(payload, { isLoading: false });
    const records = Array.isArray(res?.data) ? res.data : [];
    supplementRecords.value = records.map((item, index) =>
      normalizeSupplementListRow(item, index, listQuery.value.pageNo, listQuery.value.pageSize),
    );
    total.value = Number(res?.total || 0);
    if (Number(res?.currPage)) {
      listQuery.value.pageNo = Number(res.currPage);
    }
  } catch (error) {
    supplementRecords.value = [];
    total.value = 0;
  }
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchSupplementList();
};

const goCreate = () => {
  router.push({ name: "my-supplement-application" });
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const getRowRequestId = (row) => getSupplementRequestId(row);

const validateOperableRows = (rows, flagKey, actionLabel) => {
  if (!rows.length) {
    ElMessage.warning(`请先选择需要${actionLabel}的补签单`);
    return null;
  }
  const operableRows = rows.filter((item) => item?.[flagKey]);
  if (!operableRows.length) {
    ElMessage.warning(`所选记录中没有可${actionLabel}的补签单`);
    return null;
  }
  if (operableRows.length !== rows.length) {
    ElMessage.warning(`所选记录中包含不可${actionLabel}的补签单，请重新选择`);
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
  fetchSupplementList();
};

const handleBatchDelete = () => {
  const operableRows = validateOperableRows(getSelectedRows(), "canDelete", "删除");
  if (!operableRows) {
    return;
  }
  const payload = buildSupplementRequestIdsPayload(operableRows);
  if (!payload) {
    return ElMessage.warning("选中记录缺少补签单ID，无法删除");
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${operableRows.length} 条补签草稿吗？删除后不可恢复。`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() =>
      deleteSupplementRequestSelf(payload, { isLoading: true }).then((res) => {
        const successCount = Number(res?.data?.successCount || operableRows.length);
        ElMessage.success(`已删除 ${successCount} 条补签草稿`);
        refreshListAfterBatchAction(
          res?.data?.supplementRequestIds ||
            operableRows.map((item) => getRowRequestId(item)),
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
  const payload = buildSupplementRequestIdsPayload(operableRows);
  if (!payload) {
    return ElMessage.warning("选中记录缺少补签单ID，无法废弃");
  }
  ElMessageBox.confirm(
    `确定要废弃选中的 ${operableRows.length} 条补签单吗？废弃后该单据将不再进入审批流程。`,
    "废弃确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() =>
      abandonSupplementRequestSelf(payload, { isLoading: true }).then((res) => {
        const successCount = Number(res?.data?.successCount || operableRows.length);
        ElMessage.success(`已废弃 ${successCount} 条补签单`);
        refreshListAfterBatchAction(
          res?.data?.supplementRequestIds ||
            operableRows.map((item) => getRowRequestId(item)),
        );
      }),
    )
    .catch(() => {});
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
};

const handleDetailUpdate = (updatedRecord) => {
  currentDetail.value = normalizeSupplementDetail(updatedRecord);
  fetchSupplementList();
};

const handleRefreshList = () => {
  closeDetailSidebar();
  fetchSupplementList();
};

const fetchSupplementDetail = async (rowData) => {
  const supplementRequestId = getSupplementRequestId(rowData);
  if (supplementRequestId === null) {
    ElMessage.warning("当前记录缺少补签单ID，无法打开详情");
    throw new Error("missing supplementRequestId");
  }
  return fetchSupplementRequestDetail(supplementRequestId, rowData);
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

const openDetail = async (params) => {
  const record = params?.data || params;
  const supplementRequestId = getSupplementRequestId(record);
  if (supplementRequestId === null) {
    return ElMessage.warning("当前记录缺少补签单ID，无法打开详情");
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
  detailDrawerVisible.value = false;
  try {
    const detail = await fetchSupplementDetail(record);
    sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(detail));
    router.push({
      name: "my-supplement-detail",
      params: { billNo: detail.billNo || record.billNo },
      query: { supplementRequestId: String(supplementRequestId) },
    });
  } catch (error) {
    console.log(error);
  }
};

const handlePagination = () => {
  fetchSupplementList();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  if (params.colDef.field === "sid") {
    return params.value || params.value === 0 ? Number(params.value) + 1 : "";
  }
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchSupplementList();
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
                <div class="d-flex supplement-toolbar">
                  <el-input
                    v-model="diminput"
                    style="width: 220px"
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
                  <el-button type="primary" @click="goCreate">
                    新建补签申请
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
              :rowDoubleClicked="openDetail"
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
      sidebarName="my-supplement-detail-sidebar"
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
          @update-detail="handleDetailUpdate"
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

.supplement-toolbar {
  gap: 10px;
  flex-wrap: wrap;
}

.supplement-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
  color: #122448;
}

:deep(.status-tag) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #f4f4f5;
  color: #606266;
  font-size: 12px;
  line-height: 22px;
}

:deep(.status-tag--warning) {
  border-color: #f3d19e;
  background: #fdf6ec;
  color: #b88230;
}

:deep(.status-tag--success) {
  border-color: #b3e19d;
  background: #f0f9eb;
  color: #529b2e;
}

:deep(.status-tag--danger) {
  border-color: #fab6b6;
  background: #fef0f0;
  color: #c45656;
}

:deep(.status-tag--info) {
  border-color: #d3d4d6;
  background: #f4f4f5;
  color: #73767a;
}
</style>
