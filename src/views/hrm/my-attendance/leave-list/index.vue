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
const detailEditMode = ref(false);
const detailEditForm = ref({});
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
const leaveTypeOptions = [
  {
    label: "法定年假",
    remaining: 6,
    transit: 1,
    description: "适用于年度休假安排，提交后同步占用可用年假余额。",
    tone: "blue",
  },
  {
    label: "司龄假",
    remaining: 3,
    transit: 0,
    description: "结合员工司龄发放，可按半天为单位申请。",
    tone: "teal",
  },
  {
    label: "调休假",
    remaining: 2.5,
    transit: 0,
    description: "使用已审批通过的调休加班时长。",
    tone: "sky",
  },
  {
    label: "事假",
    remaining: 5,
    transit: 0,
    description: "用于个人事务处理，额度不足时不允许提交。",
    tone: "orange",
  },
  {
    label: "病假",
    remaining: 8,
    transit: 0,
    description: "病假申请需填写请假说明并可补充诊疗附件。",
    tone: "red",
  },
  {
    label: "其他假期",
    remaining: 2,
    transit: 0,
    description: "承接特殊假类场景，原则阶段统一按固定额度展示。",
    tone: "purple",
  },
];

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

const buildLeaveRequestIdsPayload = (rows) => {
  const ids = [
    ...new Set(
      rows.map((item) => getRowRequestId(item)).filter((id) => id || id === 0),
    ),
  ];
  if (!ids.length) {
    return null;
  }
  if (ids.length === 1) {
    return { leaveRequestId: ids[0] };
  }
  return { leaveRequestIds: ids.join(",") };
};

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
      detailEditMode.value = false;
      detailEditForm.value = {};
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

const parseLeaveTime = (timeText) => {
  const [date = "", period = "上午"] = String(timeText || "").split(" ");
  return { date, period };
};

const formatLeaveTime = (date, period) => {
  if (!date) {
    return "";
  }
  return `${date} ${period || "上午"}`;
};

const getPeriodValue = (period) => (period === "下午" ? 1 : 0);

const calculateDuration = (startDate, startPeriod, endDate, endPeriod) => {
  if (!startDate || !endDate) {
    return 0;
  }
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const dayDiff = Math.floor((end - start) / 86400000);
  if (dayDiff < 0) {
    return 0;
  }
  const halfDayCount =
    dayDiff * 2 + getPeriodValue(endPeriod) - getPeriodValue(startPeriod) + 1;
  return Math.max(Number((halfDayCount * 0.5).toFixed(1)), 0);
};

const buildDetailEditForm = (detail) => ({
  leaveType: detail.leaveType,
  unit: detail.unit,
  startDate: parseLeaveTime(detail.startTime).date,
  startPeriod: parseLeaveTime(detail.startTime).period,
  endDate: parseLeaveTime(detail.endTime).date,
  endPeriod: parseLeaveTime(detail.endTime).period,
  reason: detail.reason,
  attachmentFiles: (detail.attachments || []).map((name, index) => ({
    name,
    uid: `detail-attachment-${index}`,
  })),
});

const detailDuration = computed(() =>
  calculateDuration(
    detailEditForm.value.startDate,
    detailEditForm.value.startPeriod,
    detailEditForm.value.endDate,
    detailEditForm.value.endPeriod,
  ),
);

const getCurrentRecordIndex = () => {
  if (!currentDetail.value?.leaveRequestId) {
    return -1;
  }
  return leaveRecords.value.findIndex(
    (item) => item.requestId === currentDetail.value.leaveRequestId,
  );
};

const handleDiscardDetail = () => {
  if (!currentDetail.value) {
    return;
  }
  ElMessageBox.confirm("确定要废弃当前请假单吗？废弃后该单据将不再进入审批流程。", "废弃确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const recordIndex = getCurrentRecordIndex();
    if (recordIndex === -1) {
      return;
    }
    const updatedRecord = {
      ...leaveRecords.value[recordIndex],
      status: "已废弃",
      approver: "无需审批",
      comment: "申请人已废弃该请假单",
    };
    leaveRecords.value.splice(recordIndex, 1, updatedRecord);
    currentDetail.value = { ...updatedRecord };
    detailEditMode.value = false;
    ElMessage.success("请假单已废弃");
  }).catch(() => {});
};

const handleDeleteDetail = () => {
  if (!currentDetail.value) {
    return;
  }
  ElMessageBox.confirm("确定要删除当前请假单吗？删除后不可恢复。", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const recordIndex = getCurrentRecordIndex();
    if (recordIndex === -1) {
      return;
    }
    leaveRecords.value.splice(recordIndex, 1);
    ElMessage.success("请假单已删除");
    closeDetailSidebar();
  }).catch(() => {});
};

const handleEditDetail = () => {
  if (!currentDetail.value) {
    return;
  }
  detailEditForm.value = buildDetailEditForm(currentDetail.value);
  detailEditMode.value = true;
};

const handleCancelEditDetail = () => {
  detailEditMode.value = false;
  detailEditForm.value = {};
};

const handleSelectDetailLeaveType = (item) => {
  if (!detailEditMode.value) {
    return;
  }
  detailEditForm.value.leaveType = item.label;
};

const normalizeAttachmentFiles = (files) => {
  return (files || [])
    .map((item) => item.name)
    .filter(Boolean);
};

const handleSaveDetail = () => {
  if (!currentDetail.value) {
    return;
  }
  if (!detailEditForm.value.leaveType) {
    ElMessage.warning("请选择假期类型");
    return;
  }
  if (!detailEditForm.value.startDate || !detailEditForm.value.endDate) {
    ElMessage.warning("请填写开始时间和结束时间");
    return;
  }
  if (detailDuration.value <= 0) {
    ElMessage.warning("结束时间不能早于开始时间");
    return;
  }
  if (!detailEditForm.value.reason) {
    ElMessage.warning("请填写请假说明");
    return;
  }

  const recordIndex = getCurrentRecordIndex();
  if (recordIndex === -1) {
    return;
  }
  const updatedRecord = {
    ...leaveRecords.value[recordIndex],
    ...detailEditForm.value,
    startTime: formatLeaveTime(
      detailEditForm.value.startDate,
      detailEditForm.value.startPeriod,
    ),
    endTime: formatLeaveTime(
      detailEditForm.value.endDate,
      detailEditForm.value.endPeriod,
    ),
    duration: detailDuration.value,
    unit: "天",
    attachments: normalizeAttachmentFiles(detailEditForm.value.attachmentFiles),
  };
  delete updatedRecord.startDate;
  delete updatedRecord.startPeriod;
  delete updatedRecord.endDate;
  delete updatedRecord.endPeriod;
  delete updatedRecord.attachmentFiles;
  leaveRecords.value.splice(recordIndex, 1, updatedRecord);
  currentDetail.value = { ...updatedRecord };
  detailEditMode.value = false;
  detailEditForm.value = {};
  ElMessage.success("请假单信息已保存");
};

const approvalFlow = computed(() => {
  if (!currentDetail.value) {
    return [];
  }

  const detail = currentDetail.value;
  const baseFlow = [
    {
      time: `${detail.applyDate} 10:18`,
      title: "发起申请 · 提交申请",
      actor: detail.applicant,
      description: `提交${detail.leaveType}申请，等待直属上级审批。`,
      active: true,
    },
  ];

  if (detail.status === "未提交") {
    return [
      {
        time: `${detail.applyDate} 10:18`,
        title: "保存草稿",
        actor: detail.applicant,
        description: "请假单暂未提交审批。",
        active: true,
      },
    ];
  }

  if (detail.status === "已废弃") {
    return [
      {
        time: `${detail.applyDate} 10:18`,
        title: "废弃申请",
        actor: detail.applicant,
        description: detail.comment,
        active: true,
      },
    ];
  }

  return [
    ...baseFlow,
    {
      time: `${detail.applyDate} 10:19`,
      title:
        detail.status === "已通过"
          ? "直属上级审批 · 审批通过"
          : "直属上级审批 · 提交申请",
      actor: detail.approver,
      description: detail.comment,
      active: detail.status === "审批中",
    },
  ];
});

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const statusTextClass = (status) => {
  const statusMap = {
    未提交: "status-text--draft",
    审批中: "status-text--pending",
    已通过: "status-text--success",
    已驳回: "status-text--rejected",
    已废弃: "status-text--discarded",
  };
  return statusMap[status] || "status-text--draft";
};

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
  detailEditMode.value = false;
  detailEditForm.value = {};
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
                      v-for="item in ['未提交', '审批中', '已通过', '已驳回']"
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
        />
      </div>
      <div
        v-if="false && currentDetail"
        class="leave-detail-sidebar"
      >
        <div class="leave-detail-sidebar__header">
          <div>
            <div class="leave-detail-sidebar__title-line">
              <h2>请假详情</h2>
              <el-button
                type="primary"
                plain
              >
                审批
              </el-button>
            </div>
            <p>{{ currentDetail.billNo }}</p>
          </div>
          <div class="leave-detail-sidebar__actions">
            <template v-if="detailEditMode">
              <el-button
                type="primary"
                @click="handleSaveDetail"
              >
                保存
              </el-button>
              <el-button @click="handleCancelEditDetail">取消</el-button>
            </template>
            <template v-else>
              <el-button
                type="primary"
                plain
                @click="handleEditDetail"
              >
                修改
              </el-button>
              <el-button
                type="warning"
                plain
                :disabled="currentDetail.status === '已废弃'"
                @click="handleDiscardDetail"
              >
                废弃
              </el-button>
              <el-button
                type="danger"
                plain
                @click="handleDeleteDetail"
              >
                删除
              </el-button>
            </template>
            <el-button @click="closeDetailSidebar">关闭</el-button>
          </div>
        </div>

        <div class="detail-layout">
          <section class="detail-card detail-card--main">
            <div class="detail-card__title">请假单信息</div>
            <div class="leave-detail-content">
              <div class="leave-info-table">
                <div class="leave-info-table__label">单据编号</div>
                <div>{{ currentDetail.billNo }}</div>
                <div class="leave-info-table__label">单据状态</div>
                <div :class="['status-text', statusTextClass(currentDetail.status)]">
                  {{ currentDetail.status }}
                </div>

                <div class="leave-info-table__label">姓名</div>
                <div>{{ currentDetail.applicant }}</div>
                <div class="leave-info-table__label">员工编码</div>
                <div>{{ currentDetail.employeeCode }}</div>

                <div class="leave-info-table__label">所属组织</div>
                <div>{{ currentDetail.organization }}</div>
                <div class="leave-info-table__label">申请日期</div>
                <div>{{ currentDetail.applyDate }}</div>
              </div>

              <div class="detail-section">
                <div class="detail-section__title">假期类型</div>
                <div class="detail-leave-type-grid">
                  <button
                    v-for="item in leaveTypeOptions"
                    :key="item.label"
                    type="button"
                    class="detail-leave-type-card"
                    :class="[
                      `detail-leave-type-card--${item.tone}`,
                      {
                        'detail-leave-type-card--selected':
                          (detailEditMode ? detailEditForm.leaveType : currentDetail.leaveType) === item.label,
                        'detail-leave-type-card--readonly': !detailEditMode,
                      },
                    ]"
                    @click="handleSelectDetailLeaveType(item)"
                  >
                    <div class="detail-leave-type-card__title">{{ item.label }}</div>
                    <div class="detail-leave-type-card__quota">
                      剩余 {{ item.remaining.toFixed(1) }} / 在途 {{ item.transit.toFixed(1) }}
                    </div>
                    <p>{{ item.description }}</p>
                  </button>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section__title">请假时间</div>
                <div class="detail-time-panel">
                  <div class="detail-time-item">
                    <span>开始时间</span>
                    <div
                      v-if="detailEditMode"
                      class="detail-time-field"
                    >
                      <el-date-picker
                        v-model="detailEditForm.startDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        size="small"
                        placeholder="请选择开始日期"
                      />
                      <el-select
                        v-model="detailEditForm.startPeriod"
                        size="small"
                      >
                        <el-option
                          label="上午"
                          value="上午"
                        />
                        <el-option
                          label="下午"
                          value="下午"
                        />
                      </el-select>
                    </div>
                    <strong v-else>{{ currentDetail.startTime }}</strong>
                  </div>
                  <div class="detail-time-split">至</div>
                  <div class="detail-time-item">
                    <span>结束时间</span>
                    <div
                      v-if="detailEditMode"
                      class="detail-time-field"
                    >
                      <el-date-picker
                        v-model="detailEditForm.endDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        size="small"
                        placeholder="请选择结束日期"
                      />
                      <el-select
                        v-model="detailEditForm.endPeriod"
                        size="small"
                      >
                        <el-option
                          label="上午"
                          value="上午"
                        />
                        <el-option
                          label="下午"
                          value="下午"
                        />
                      </el-select>
                    </div>
                    <strong v-else>{{ currentDetail.endTime }}</strong>
                  </div>
                  <div class="detail-duration-card">
                    <span>请假时长</span>
                    <strong v-if="detailEditMode">{{ detailDuration }} 天</strong>
                    <strong v-else>{{ currentDetail.duration }} {{ currentDetail.unit }}</strong>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section__title">请假说明</div>
                <el-input
                  v-if="detailEditMode"
                  v-model="detailEditForm.reason"
                  type="textarea"
                  :rows="4"
                  resize="none"
                  placeholder="请填写请假说明"
                />
                <div
                  v-else
                  class="detail-text-block"
                >
                  {{ currentDetail.reason }}
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section__title">附件信息</div>
                <el-upload
                  v-if="detailEditMode"
                  v-model:file-list="detailEditForm.attachmentFiles"
                  class="detail-upload"
                  action="#"
                  :auto-upload="false"
                  multiple
                >
                  <el-button type="primary">上传附件</el-button>
                </el-upload>
                <div
                  v-else
                  class="detail-attachment-list"
                >
                  <template v-if="currentDetail.attachments?.length">
                    <span
                      v-for="item in currentDetail.attachments"
                      :key="item"
                      class="attachment-tag"
                    >
                      {{ item }}
                    </span>
                  </template>
                  <span
                    v-else
                    class="detail-empty-text"
                  >
                    暂无附件
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section class="detail-card approval-card">
            <div class="detail-card__title">审批流程</div>
            <div class="approval-timeline">
              <div
                v-for="(item, index) in approvalFlow"
                :key="`${item.title}-${index}`"
                class="approval-step"
                :class="{ 'approval-step--active': item.active }"
              >
                <div class="approval-step__line"></div>
                <div class="approval-step__dot"></div>
                <div class="approval-step__body">
                  <div class="approval-step__time">{{ item.time }}</div>
                  <div class="approval-step__title">{{ item.title }}</div>
                  <div class="approval-step__actor">{{ item.actor }}</div>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
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

.leave-detail-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px 18px;
  border: 1px solid #dce5f1;
  border-radius: 8px;
  background: #fff;
}

.leave-detail-sidebar__header h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.leave-detail-sidebar__title-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.leave-detail-sidebar__header p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.leave-detail-sidebar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
}

.detail-card {
  border: 1px solid #dce5f1;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.detail-card__title {
  padding: 16px 18px;
  border-bottom: 1px solid #dce5f1;
  color: #122448;
  font-size: 16px;
  font-weight: 600;
}

.leave-detail-content {
  padding: 18px 20px 22px;
}

.leave-info-table {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 180px minmax(0, 1fr);
  margin-bottom: 18px;
}

.leave-info-table > div {
  min-height: 40px;
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 8px 12px;
  border-right: 1px solid #e1e7f0;
  border-bottom: 1px solid #e1e7f0;
  color: #122448;
  font-size: 13px;
  line-height: 1.6;
}

.leave-info-table > div:nth-child(-n + 4) {
  border-top: 1px solid #e1e7f0;
}

.leave-info-table > div:nth-child(4n + 1) {
  border-left: 1px solid #e1e7f0;
}

.leave-info-table__label {
  background: #f3f6fb;
  color: #31425f;
  font-weight: 600;
}

.leave-info-table__label--full {
  grid-column: span 1;
  border-left: 1px solid #e1e7f0;
}

.leave-info-table__content--full {
  grid-column: span 3;
}

.leave-detail-content :deep(.el-input),
.leave-detail-content :deep(.el-select),
.leave-detail-content :deep(.el-date-editor.el-input),
.leave-detail-content :deep(.el-input-number),
.leave-detail-content :deep(.el-textarea) {
  width: 100%;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.detail-meta-item {
  min-height: 64px;
  padding: 10px 12px;
  border: 1px solid #e1e7f0;
  border-radius: 6px;
  background: #fbfcff;
}

.detail-meta-item--wide {
  grid-column: span 2;
}

.detail-meta-item span,
.detail-time-item span,
.detail-duration-card span {
  display: block;
  margin-bottom: 8px;
  color: #6d7890;
  font-size: 12px;
}

.detail-meta-item strong,
.detail-time-item strong,
.detail-duration-card strong {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.status-text {
  font-weight: 600;
}

.status-text--draft,
.status-text--discarded {
  color: #6d7890;
}

.status-text--pending {
  color: #d48716;
}

.status-text--success {
  color: #2f9b5f;
}

.status-text--rejected {
  color: #d0443e;
}

.detail-section + .detail-section {
  margin-top: 20px;
}

.detail-section__title {
  margin-bottom: 10px;
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.detail-leave-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-leave-type-card {
  position: relative;
  width: 100%;
  min-height: 92px;
  padding: 11px 13px;
  border: 1px solid #d8e2f1;
  border-left-width: 4px;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.detail-leave-type-card--readonly {
  cursor: default;
}

.detail-leave-type-card:not(.detail-leave-type-card--readonly):hover {
  border-color: #91b0f5;
  background: #f8faff;
}

.detail-leave-type-card--selected {
  border-color: #4778ef;
  border-width: 2px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e8efff 100%);
  box-shadow:
    0 0 0 1px rgba(71, 120, 239, 0.28),
    0 6px 16px rgba(71, 120, 239, 0.18);

  &::after {
    content: "";
    position: absolute;
    top: 10px;
    right: 10px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4778ef
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E")
      center / 11px no-repeat;
  }

  .detail-leave-type-card__title {
    color: #356fff;
    font-weight: 700;
    padding-right: 22px;
  }
}

.detail-leave-type-card--teal {
  border-left-color: #2e8c91;
}

.detail-leave-type-card--blue {
  border-left-color: #4c7df2;
}

.detail-leave-type-card--sky {
  border-left-color: #6aa6c9;
}

.detail-leave-type-card--orange {
  border-left-color: #ed8b32;
}

.detail-leave-type-card--red {
  border-left-color: #df4d43;
}

.detail-leave-type-card--purple {
  border-left-color: #7652f2;
}

.detail-leave-type-card__title {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.detail-leave-type-card__quota {
  margin-top: 5px;
  color: #356fff;
  font-size: 12px;
}

.detail-leave-type-card p {
  margin: 7px 0 0;
  color: #77849a;
  font-size: 12px;
  line-height: 1.4;
}

.detail-time-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr) 130px;
  align-items: stretch;
  gap: 10px;
}

.detail-time-item,
.detail-duration-card,
.detail-text-block,
.detail-attachment-list {
  min-height: 70px;
  padding: 12px;
  border: 1px solid #e1e7f0;
  border-radius: 6px;
  background: #fbfcff;
}

.detail-time-split {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6d7890;
  font-size: 13px;
}

.detail-time-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 82px;
  gap: 8px;
}

.detail-text-block {
  color: #122448;
  font-size: 13px;
  line-height: 1.7;
}

.detail-attachment-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
}

.detail-empty-text {
  color: #7a879b;
  font-size: 13px;
}

.detail-upload :deep(.el-upload-list) {
  margin-top: 8px;
}

.attachment-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  margin-right: 8px;
  border: 1px solid #d8e2f1;
  border-radius: 4px;
  background: #f8fbff;
  color: #3f5f91;
  line-height: 22px;
}

.approval-card {
  min-height: 360px;
}

.approval-timeline {
  padding: 22px 24px 26px;
}

.approval-step {
  position: relative;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  column-gap: 12px;
  min-height: 114px;
}

.approval-step:last-child {
  min-height: 0;
}

.approval-step__line {
  position: absolute;
  top: 12px;
  bottom: -12px;
  left: 6px;
  width: 1px;
  background: #d9e4f4;
}

.approval-step:last-child .approval-step__line {
  display: none;
}

.approval-step__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 3px;
  border-radius: 50%;
  background: #6aa1f8;
}

.approval-step--active .approval-step__dot {
  background: #4f8df7;
}

.approval-step__body {
  min-width: 0;
  padding-bottom: 22px;
}

.approval-step__time {
  color: #6c7b92;
  font-size: 13px;
}

.approval-step__title {
  margin-top: 8px;
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.approval-step__actor {
  margin-top: 6px;
  color: #466083;
  font-size: 13px;
}

.approval-step p {
  margin: 8px 0 0;
  color: #4f5f77;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .leave-info-table {
    grid-template-columns: 140px minmax(0, 1fr);
  }

  .leave-info-table > div:nth-child(-n + 4) {
    border-top: 0;
  }

  .leave-info-table > div:nth-child(-n + 2) {
    border-top: 1px solid #e1e7f0;
  }

  .leave-info-table > div:nth-child(4n + 1) {
    border-left: 0;
  }

  .leave-info-table > div:nth-child(odd) {
    border-left: 1px solid #e1e7f0;
  }

  .leave-info-table__content--full {
    grid-column: span 1;
  }

  .detail-meta-grid,
  .detail-leave-type-grid,
  .detail-time-panel {
    grid-template-columns: 1fr;
  }

  .detail-meta-item--wide {
    grid-column: span 1;
  }

  .detail-time-split {
    min-height: 24px;
  }
}
</style>
