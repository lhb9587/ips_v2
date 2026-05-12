<!-- 假期额度维护列表页，负责列表查询、审核反审核、台账查看与详情侧栏展示。 -->
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
import LeaveQuotaDetailSidebar from "@/views/hrm/leave-quota-management/detail-sidebar.vue";
import BatchExtendDialog from "@/views/hrm/leave-quota-management/batch-extend-dialog.vue";
import { saveTableConfig } from "@/utils";
import {
  auditLeaveQuotaAccount,
  queryLeaveQuotaAccountDetail,
  queryLeaveQuotaAccountPage,
  reverseAuditLeaveQuotaAccount,
} from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const bussId = 461;
const gridName = "leaveQuotaManagementGrid";
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
const quotaDetailVisible = ref(false);
const selectedQuotaDetail = ref({});
const detailLoading = ref(false);
const batchDialogVisible = ref(false);
const quotaList = ref([]);
const total = ref(0);
const auditLoading = ref(false);
const reverseAuditLoading = ref(false);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const STATUS_UNAUDITED = "\u672a\u5ba1\u6838";
const STATUS_AUDITED = "\u5df2\u5ba1\u6838";
const TEXT_SEARCH_PLACEHOLDER = "\u641c\u7d22...";
const TEXT_AUDIT = "\u5ba1\u6838";
const TEXT_REVERSE_AUDIT = "\u53cd\u5ba1\u6838";
const TEXT_LEDGER = "\u989d\u5ea6\u65e5\u5fd7\u4fe1\u606f";
const TEXT_BATCH_EXTEND = "\u6279\u91cf\u5ef6\u671f";
const TEXT_CANCEL = "\u53d6\u6d88";
const TEXT_AUDIT_CONFIRM_TITLE = "\u5ba1\u6838\u786e\u8ba4";
const TEXT_REVERSE_AUDIT_CONFIRM_TITLE = "\u53cd\u5ba1\u6838\u786e\u8ba4";
const TEXT_AUDIT_SUCCESS = "\u5ba1\u6838\u6210\u529f";
const TEXT_REVERSE_AUDIT_SUCCESS = "\u53cd\u5ba1\u6838\u6210\u529f";
const TEXT_SELECT_AUDIT = "\u8bf7\u5148\u9009\u62e9\u9700\u8981\u5ba1\u6838\u7684\u8bb0\u5f55";
const TEXT_SELECT_REVERSE_AUDIT =
  "\u8bf7\u5148\u9009\u62e9\u9700\u8981\u53cd\u5ba1\u6838\u7684\u8bb0\u5f55";
const TEXT_AUDIT_ROW_INVALID =
  "\u4ec5\u652f\u6301\u9009\u62e9\u672a\u5ba1\u6838\u8bb0\u5f55\u8fdb\u884c\u5ba1\u6838";
const TEXT_REVERSE_AUDIT_ROW_INVALID =
  "\u4ec5\u652f\u6301\u9009\u62e9\u5df2\u5ba1\u6838\u8bb0\u5f55\u8fdb\u884c\u53cd\u5ba1\u6838";
const TEXT_REVERSE_AUDIT_QUOTA_INVALID =
  "\u5df2\u53d1\u751f\u8bf7\u5047\u6263\u51cf\u6216\u51bb\u7ed3\u7684\u989d\u5ea6\u4e0d\u652f\u6301\u53cd\u5ba1\u6838";
const TEXT_SELECT_EXTEND = "\u8bf7\u5148\u9009\u62e9\u9700\u8981\u5ef6\u671f\u7684\u8bb0\u5f55";
const TEXT_SELECT_PERIOD = "\u8bf7\u9009\u62e9\u5b8c\u6574\u7684\u5468\u671f\u65e5\u671f";
const TEXT_SELECT_SPECIFIED_EXTEND =
  "\u8bf7\u9009\u62e9\u6307\u5b9a\u5ef6\u671f\u65e5\u671f";
const TEXT_SELECT_FIXED_DATE = "\u8bf7\u9009\u62e9\u56fa\u5b9a\u65e5\u671f";
const TEXT_EXTEND_MONTH_INVALID =
  "\u6309\u6708\u6570\u5ef6\u671f\u65f6\u8bf7\u8f93\u5165\u5927\u4e8e 0 \u7684\u6708\u6570";
const TEXT_EXTEND_EMPTY = "\u6ca1\u6709\u5339\u914d\u5230\u53ef\u5ef6\u671f\u7684\u8bb0\u5f55";
const TEXT_AUDIT_CONFIRM_MESSAGE =
  "\u786e\u8ba4\u5ba1\u6838\u9009\u4e2d\u7684 {count} \u6761\u8bb0\u5f55\u5417\uff1f";
const TEXT_REVERSE_AUDIT_CONFIRM_MESSAGE =
  "\u786e\u8ba4\u53cd\u5ba1\u6838\u9009\u4e2d\u7684 {count} \u6761\u8bb0\u5f55\u5417\uff1f";
const TEXT_BATCH_EXTEND_SUCCESS =
  "\u5df2\u5b8c\u6210 {count} \u6761\u8bb0\u5f55\u7684\u5ef6\u671f\u5904\u7406";
const formatMessage = (template, count) => template.replace("{count}", count);

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

const leaveTypeOptions = computed(() => {
  return [...new Set(quotaList.value.map((item) => item.leaveType).filter(Boolean))];
});

const gridData = computed(() => quotaList.value);

const mapQuotaBaseRecord = (item) => {
  return {
    ...item,
    id: item.quotaAccountId,
    employeeCode: item.talentCode || "",
    employeeName: item.talentName || "",
    organizationCode: item.deptCode || "",
    organizationName: item.deptName || "",
    positionName: item.positionName || "",
    hireDate: item.hireDate || item.joinDate || "",
    regularDate: item.regularDate || "",
    groupJoinDate: item.groupJoinDate || "",
    companyJoinDate: item.companyJoinDate || "",
    firstWorkDate: item.firstWorkDate || item.startWorkDate || "",
    leaveType: item.leaveTypeName || "",
    leaveUnit: item.quotaUnit || "",
    effectDate: item.effectDate || item.periodStartDate || "",
    extendedDate: item.extendedDate || item.periodEndDate || "",
    adjustmentQuota: item.adjustQuota ?? 0,
    remainingQuota: item.remainQuota ?? 0,
    carriedForwardQuota: item.carryoverQuota ?? 0,
    pendingQuota: item.pendingQuota ?? 0,
    billStatus: item.billStatus || item.auditStatus || "",
  };
};

const mapQuotaRecord = (item, index) => {
  const sid = (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index;
  return {
    ...mapQuotaBaseRecord(item),
    sid,
  };
};

const fetchLeaveQuotaList = () => {
  queryLeaveQuotaAccountPage(
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
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      quotaList.value = records.map((item, index) => mapQuotaRecord(item, index));
      total.value = Number(res?.total || 0);
    })
    .catch(() => {
      quotaList.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchLeaveQuotaList();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

const openQuotaDetail = (params) => {
  if (params?.event?.target?.closest?.(".ag-selection-checkbox")) {
    return;
  }
  const rowData = params?.data;
  const quotaAccountId = rowData?.id || rowData?.quotaAccountId;
  if (!quotaAccountId) {
    return;
  }
  detailLoading.value = true;
  quotaDetailVisible.value = true;
  queryLeaveQuotaAccountDetail(
    {
      quotaAccountId,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      selectedQuotaDetail.value = {
        ...mapQuotaBaseRecord(res?.data || {}),
        ...rowData,
      };
    })
    .catch(() => {
      quotaDetailVisible.value = false;
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const openLedgerPage = () => {
  router.push({
    name: "leave-quota-management-ledger",
  });
};

const getQuotaRecordKey = (item) => {
  return [
    item.id || item.quotaAccountId || "",
    item.employeeCode || "",
    item.leaveTypeCode || "",
    item.periodStartDate || "",
  ].join("|");
};

const addMonthsToDate = (dateString, months) => {
  const baseDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) {
    return dateString;
  }
  const day = baseDate.getDate();
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + months + 1, 0);
  const maxDay = nextDate.getDate();
  const safeDay = Math.min(day, maxDay);
  const finalDate = new Date(baseDate);
  finalDate.setMonth(finalDate.getMonth() + months, safeDay);
  const year = finalDate.getFullYear();
  const month = `${finalDate.getMonth() + 1}`.padStart(2, "0");
  const date = `${finalDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${date}`;
};

const openBatchExtendDialog = () => {
  batchDialogVisible.value = true;
};

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const getSelectedQuotaRows = () => {
  return getSelectedRows().filter((item) => item?.id || item?.quotaAccountId);
};

const validateAuditRows = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning(TEXT_SELECT_AUDIT);
    return false;
  }
  const invalidRows = rows.filter((item) => item.auditStatus !== STATUS_UNAUDITED);
  if (invalidRows.length > 0) {
    ElMessage.warning(TEXT_AUDIT_ROW_INVALID);
    return false;
  }
  return true;
};

const validateReverseAuditRows = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning(TEXT_SELECT_REVERSE_AUDIT);
    return false;
  }
  const invalidStatusRows = rows.filter((item) => item.auditStatus !== STATUS_AUDITED);
  if (invalidStatusRows.length > 0) {
    ElMessage.warning(TEXT_REVERSE_AUDIT_ROW_INVALID);
    return false;
  }
  const invalidQuotaRows = rows.filter(
    (item) => Number(item.usedQuota || 0) > 0 || Number(item.frozenQuota || 0) > 0,
  );
  if (invalidQuotaRows.length > 0) {
    ElMessage.warning(TEXT_REVERSE_AUDIT_QUOTA_INVALID);
    return false;
  }
  return true;
};

const updateQuotaAuditStatus = (rows, auditStatus) => {
  const selectedIds = new Set(
    rows.map((item) => item.id || item.quotaAccountId).filter(Boolean),
  );
  quotaList.value = quotaList.value.map((item) => {
    const currentId = item.id || item.quotaAccountId;
    if (!selectedIds.has(currentId)) {
      return item;
    }
    return {
      ...item,
      auditStatus,
      billStatus: auditStatus,
    };
  });
  if (selectedQuotaDetail.value?.id && selectedIds.has(selectedQuotaDetail.value.id)) {
    selectedQuotaDetail.value = {
      ...selectedQuotaDetail.value,
      auditStatus,
      billStatus: auditStatus,
    };
  }
};

const handleAudit = async () => {
  const rows = getSelectedQuotaRows();
  if (!validateAuditRows(rows)) {
    return;
  }
  await ElMessageBox.confirm(
    formatMessage(TEXT_AUDIT_CONFIRM_MESSAGE, rows.length),
    TEXT_AUDIT_CONFIRM_TITLE,
    {
      type: "warning",
      confirmButtonText: TEXT_AUDIT,
      cancelButtonText: TEXT_CANCEL,
    },
  );
  auditLoading.value = true;
  auditLeaveQuotaAccount(
    {
      quotaAccountIds: rows.map((item) => item.id || item.quotaAccountId).join(","),
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      updateQuotaAuditStatus(rows, STATUS_AUDITED);
      ElMessage.success(res?.data?.message || TEXT_AUDIT_SUCCESS);
      fetchLeaveQuotaList();
    })
    .finally(() => {
      auditLoading.value = false;
    });
};

const handleReverseAudit = async () => {
  const rows = getSelectedQuotaRows();
  if (!validateReverseAuditRows(rows)) {
    return;
  }
  await ElMessageBox.confirm(
    formatMessage(TEXT_REVERSE_AUDIT_CONFIRM_MESSAGE, rows.length),
    TEXT_REVERSE_AUDIT_CONFIRM_TITLE,
    {
      type: "warning",
      confirmButtonText: TEXT_REVERSE_AUDIT,
      cancelButtonText: TEXT_CANCEL,
    },
  );
  reverseAuditLoading.value = true;
  reverseAuditLeaveQuotaAccount(
    {
      quotaAccountIds: rows.map((item) => item.id || item.quotaAccountId).join(","),
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      updateQuotaAuditStatus(rows, STATUS_UNAUDITED);
      ElMessage.success(res?.data?.message || TEXT_REVERSE_AUDIT_SUCCESS);
      fetchLeaveQuotaList();
    })
    .finally(() => {
      reverseAuditLoading.value = false;
    });
};

const buildBatchTargets = (formData) => {
  if (formData.targetType === "all") {
    return quotaList.value;
  }

  if (formData.targetType === "selected") {
    return getSelectedRows();
  }

  let targets = [...quotaList.value];

  if (formData.leaveType) {
    targets = targets.filter((item) => item.leaveType === formData.leaveType);
  }

  if (formData.periodMode === "exact") {
    targets = targets.filter(
      (item) =>
        item.periodStartDate === formData.periodStartDate &&
        item.periodEndDate === formData.periodEndDate,
    );
  } else if (targets.length > 0) {
    const latestPeriodEndDate = targets.reduce((latest, item) => {
      return item.periodEndDate > latest ? item.periodEndDate : latest;
    }, targets[0].periodEndDate);
    targets = targets.filter((item) => item.periodEndDate === latestPeriodEndDate);
  }

  if (formData.employeeScope === "specifiedDate") {
    targets = targets.filter(
      (item) => item.extendedDate === formData.specifiedExtendedDate,
    );
  }

  return targets;
};

const getNextExtendedDate = (item, formData) => {
  if (formData.extensionType === "fixedDate") {
    return formData.fixedDate;
  }
  const baseDate = item.extendedDate || item.periodEndDate;
  return addMonthsToDate(baseDate, Number(formData.monthCount || 0));
};

const handleBatchExtend = (formData) => {
  if (formData.targetType === "selected" && getSelectedRows().length === 0) {
    return ElMessage.warning(TEXT_SELECT_EXTEND);
  }

  if (formData.targetType === "condition" && formData.periodMode === "exact") {
    if (!formData.periodStartDate || !formData.periodEndDate) {
      return ElMessage.warning(TEXT_SELECT_PERIOD);
    }
  }

  if (formData.targetType === "condition" && formData.employeeScope === "specifiedDate") {
    if (!formData.specifiedExtendedDate) {
      return ElMessage.warning(TEXT_SELECT_SPECIFIED_EXTEND);
    }
  }

  if (formData.extensionType === "fixedDate" && !formData.fixedDate) {
    return ElMessage.warning(TEXT_SELECT_FIXED_DATE);
  }

  if (formData.extensionType === "byMonths" && Number(formData.monthCount || 0) <= 0) {
    return ElMessage.warning(TEXT_EXTEND_MONTH_INVALID);
  }

  const targets = buildBatchTargets(formData);
  if (targets.length === 0) {
    return ElMessage.warning(TEXT_EXTEND_EMPTY);
  }

  const targetKeys = new Set(targets.map((item) => getQuotaRecordKey(item)));
  quotaList.value = quotaList.value.map((item) => {
    if (!targetKeys.has(getQuotaRecordKey(item))) {
      return item;
    }
    return {
      ...item,
      extendedDate: getNextExtendedDate(item, formData),
    };
  });

  if (
    selectedQuotaDetail.value &&
    targetKeys.has(getQuotaRecordKey(selectedQuotaDetail.value))
  ) {
    selectedQuotaDetail.value = {
      ...selectedQuotaDetail.value,
      extendedDate: getNextExtendedDate(selectedQuotaDetail.value, formData),
    };
  }

  batchDialogVisible.value = false;
  ElMessage.success(formatMessage(TEXT_BATCH_EXTEND_SUCCESS, targets.length));
};

const closeQuotaDetail = () => {
  quotaDetailVisible.value = false;
};

const handlePagination = () => {
  fetchLeaveQuotaList();
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchLeaveQuotaList();
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
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    class="top-search"
                    style="width: 200px"
                    :placeholder="TEXT_SEARCH_PLACEHOLDER"
                    clearable
                    @keyup.enter="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-button
                    type="primary"
                    plain
                    :loading="auditLoading"
                    @click="handleAudit"
                  >
                    {{ TEXT_AUDIT }}
                  </el-button>
                  <el-button
                    type="warning"
                    plain
                    :loading="reverseAuditLoading"
                    @click="handleReverseAudit"
                  >
                    {{ TEXT_REVERSE_AUDIT }}
                  </el-button>
                  <el-button
                    type="success"
                    plain
                    @click="openLedgerPage"
                  >
                    {{ TEXT_LEDGER }}
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    @click="openBatchExtendDialog"
                  >
                    {{ TEXT_BATCH_EXTEND }}
                  </el-button>
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: diminput,
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
              :rowClick="openQuotaDetail"
              :gridOptions="gridOptions"
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
      v-if="quotaDetailVisible"
      v-model="quotaDetailVisible"
      sidebarName="leave-quota-detail-sidebar"
      :minWidth="800"
      :width="980"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeQuotaDetail"
    >
      <LeaveQuotaDetailSidebar
        :detailInfo="selectedQuotaDetail"
        :loading="detailLoading"
        @close="closeQuotaDetail"
      />
    </DragSidebar>

    <BatchExtendDialog
      v-model="batchDialogVisible"
      :leaveTypeOptions="leaveTypeOptions"
      @confirm="handleBatchExtend"
    />

  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

</style>
