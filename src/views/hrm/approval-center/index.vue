<!-- 审批中心列表页，支持全部、待审批、我的申请三个页签分页查询。 -->
<script setup>
import dayjs from "dayjs";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import { saveTableConfig } from "@/utils";
import {
  queryApprovalCenterPage,
  queryLeaveRequestAdminDetail,
} from "@/api/attendance";
import LeaveDetailContent from "@/views/hrm/my-attendance/leave-list/components/LeaveDetailContent.vue";
import OvertimeDetailContent from "@/views/hrm/my-attendance/overtime-list/components/OvertimeDetailContent.vue";
import SupplementDetailContent from "@/views/hrm/my-attendance/supplement-detail/components/SupplementDetailContent.vue";
import { fetchOvertimeRequestDetailForApproval } from "@/views/hrm/my-attendance/utils/overtimeDetail";
import {
  buildApprovalCenterSupplementFallback,
  fetchSupplementRequestDetail,
} from "@/views/hrm/my-attendance/utils/supplementDetail";

const route = useRoute();
const store = useStore();

const bussId = 472;
const gridName = "approvalCenterGrid";

const tabList = ref([
  { label: "全部", value: "all" },
  { label: "待审批", value: "pending" },
  { label: "我的申请", value: "mine" },
]);

const BIZ_TYPE_OPTIONS = [
  { label: "请假", value: "leave" },
  { label: "加班", value: "overtime" },
  { label: "补签", value: "supplement" },
  { label: "出差", value: "trip" },
];

const STATUS_OPTIONS = [
  { label: "审批中", value: "审批中" },
  { label: "已通过", value: "已通过" },
  { label: "已退回", value: "已退回" },
];

const resolveInitialTab = () => {
  const tab = route.query.tab;
  const index = tabList.value.findIndex((item) => item.value === tab);
  return index >= 0 ? index : 0;
};

const selectedTab = ref(resolveInitialTab());
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const gridData = ref([]);
const total = ref(0);
const columnList = ref([]);
const keyword = ref("");
const detailDrawerVisible = ref(false);
const currentDetail = ref(null);
const currentDetailBizType = ref("");

const mapLeaveDetail = (detail, fallback = {}) => ({
  ...fallback,
  ...detail,
  details: Array.isArray(detail?.details) ? detail.details : [],
  attachments: Array.isArray(detail?.attachments) ? detail.attachments : [],
  approvalLogs: Array.isArray(detail?.approvalLogs) ? detail.approvalLogs : [],
});

const fetchLeaveDetailById = async (leaveRequestId, fallback = {}) => {
  const res = await queryLeaveRequestAdminDetail(
    { leaveRequestId },
    { isLoading: false },
  );
  return mapLeaveDetail(res?.data || {}, fallback);
};

const fetchOvertimeDetailById = async (overtimeRequestId, fallback = {}) =>
  fetchOvertimeRequestDetailForApproval(overtimeRequestId, fallback);

const fetchSupplementDetailById = async (supplementRequestId, fallback = {}) =>
  fetchSupplementRequestDetail(
    supplementRequestId,
    buildApprovalCenterSupplementFallback(fallback),
  );

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetailBizType.value = "";
};

const handleApprovalDone = () => {
  closeDetailSidebar();
  fetchApprovalCenterList();
};
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const formInline = ref({
  bizType: "",
  status: "",
});

const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
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

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 50;
  return Math.min(pageSize, 200);
};

listQuery.value.pageSize = fetchLocalPageSize();

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

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!element) {
    return;
  }
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

const buildQueryParams = () => {
  const searchKeyword = keyword.value.trim();
  const params = {
    tab: tabList.value[selectedTab.value]?.value || "all",
    pageNo: listQuery.value.pageNo,
    pageSize: Math.min(listQuery.value.pageSize, 200),
    bizType: formInline.value.bizType || undefined,
    status: formInline.value.status || undefined,
  };

  if (searchKeyword) {
    if (/[\u4e00-\u9fa5]/.test(searchKeyword)) {
      params.applicantName = searchKeyword;
    } else {
      params.applicantCode = searchKeyword;
    }
  }

  return params;
};

const normalizeRecord = (item = {}, index = 0) => ({
  ...item,
  id: item.instanceId || `${item.bizType || "approval"}-${index}`,
  sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
  submitTimeText: item.submitTime
    ? dayjs(item.submitTime).format("YYYY-MM-DD HH:mm:ss")
    : "",
  receivedTimeText: item.receivedTime
    ? dayjs(item.receivedTime).format("YYYY-MM-DD HH:mm:ss")
    : "",
  finishTimeText: item.finishTime
    ? dayjs(item.finishTime).format("YYYY-MM-DD HH:mm:ss")
    : "",
});

const fetchApprovalCenterList = () => {
  queryApprovalCenterPage(buildQueryParams(), { isLoading: true })
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
  fetchApprovalCenterList();
};

watch(selectedTab, () => {
  listQuery.value.pageNo = 1;
  fetchApprovalCenterList();
});

const handlePagination = () => {
  fetchApprovalCenterList();
};

let rowClickTimer;
const BIZ_TYPE_DETAIL_CONFIG = {
  leave: {
    missingIdMessage: "当前记录缺少请假单ID，无法打开详情",
    fetchDetail: fetchLeaveDetailById,
  },
  overtime: {
    missingIdMessage: "当前记录缺少加班单ID，无法打开详情",
    fetchDetail: fetchOvertimeDetailById,
  },
  supplement: {
    missingIdMessage: "当前记录缺少补签单ID，无法打开详情",
    fetchDetail: fetchSupplementDetailById,
  },
};

const DETAIL_SIDEBAR_NAME_MAP = {
  leave: "approval-center-leave-detail-sidebar",
  overtime: "approval-center-overtime-detail-sidebar",
  supplement: "approval-center-supplement-detail-sidebar",
};

const handleRowClick = (params) => {
  const rowData = params?.data || {};
  const detailConfig = BIZ_TYPE_DETAIL_CONFIG[rowData.bizType];
  if (!detailConfig) {
    return;
  }
  const bizId = rowData.bizId;
  if (!bizId && bizId !== 0) {
    ElMessage.warning(detailConfig.missingIdMessage);
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
  }
  rowClickTimer = setTimeout(async () => {
    try {
      currentDetailBizType.value = rowData.bizType;
      currentDetail.value = await detailConfig.fetchDetail(bizId, rowData);
      detailDrawerVisible.value = true;
    } catch (error) {
      console.log(error);
    } finally {
      rowClickTimer = null;
    }
  }, 200);
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchApprovalCenterList();
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
          ref="boxRef"
          class="card box"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <div class="mb-0 flex-grow-1">
                <div
                  class="d-flex approval-center__toolbar"
                  style="gap: 10px"
                >
                  <div>
                    <b-tabs
                      v-model="selectedTab"
                      pills
                      nav-class="bg-light rounded custom-tabs"
                    >
                      <b-tab
                        v-for="item in tabList"
                        :key="item.value"
                        :title="item.label"
                      />
                    </b-tabs>
                  </div>
                  <el-input
                    v-model="keyword"
                    class="top-search"
                    style="width: 220px"
                    placeholder="请输入申请人姓名或编码"
                    clearable
                    @keyup.enter="fuzzySearch"
                    @clear="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-select
                    v-model="formInline.bizType"
                    class="approval-center__select"
                    clearable
                    placeholder="业务类型"
                    @change="fuzzySearch"
                  >
                    <el-option
                      v-for="item in BIZ_TYPE_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-model="formInline.status"
                    class="approval-center__select"
                    clearable
                    placeholder="审批状态"
                    @change="fuzzySearch"
                  >
                    <el-option
                      v-for="item in STATUS_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
              <div class="flex-shrink-0">
                <div class="d-flex">
                  <TopListTool
                    :gridName="gridName"
                    :buss-id="bussId"
                    :queryList="{
                      ...listQuery,
                      ...formInline,
                      tab: tabList[selectedTab]?.value,
                      searchWord: keyword,
                    }"
                    :isFull="isFull"
                    @changeBorder="changeBorder"
                    @changeRowStyle="changeRowStyle"
                    @changeRowHeight="changeRowHeight"
                    @changeScreenSize="changeScreenSize"
                    @setColumn="setColumn"
                  />
                </div>
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
              showSelectionColumn
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
            />
          </div>
        </div>
      </div>
    </div>

    <DragSidebar
      v-if="detailDrawerVisible"
      v-model="detailDrawerVisible"
      :sidebarName="DETAIL_SIDEBAR_NAME_MAP[currentDetailBizType] || 'approval-center-detail-sidebar'"
      :minWidth="900"
      :width="1180"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetailSidebar"
    >
      <div
        v-if="currentDetail && currentDetailBizType === 'leave'"
        class="leave-detail-sidebar"
      >
        <LeaveDetailContent
          :detailInfo="currentDetail"
          @close="closeDetailSidebar"
          @approval-done="handleApprovalDone"
        />
      </div>
      <div
        v-else-if="currentDetail && currentDetailBizType === 'overtime'"
        class="overtime-detail-sidebar"
      >
        <OvertimeDetailContent
          :detailInfo="currentDetail"
          @close="closeDetailSidebar"
          @approval-done="handleApprovalDone"
        />
      </div>
      <div
        v-else-if="currentDetail && currentDetailBizType === 'supplement'"
        class="supplement-detail-sidebar"
      >
        <SupplementDetailContent
          :detailInfo="currentDetail"
          @close="closeDetailSidebar"
          @approval-done="handleApprovalDone"
        />
      </div>
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.approval-center__toolbar {
  flex-wrap: wrap;
  align-items: center;
}

:deep(.approval-center__select.el-select) {
  width: 140px;
}

.custom-tabs {
  .nav-link {
    padding: 6px 14px;
  }
}

.overtime-detail-sidebar,
.supplement-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
}
</style>
