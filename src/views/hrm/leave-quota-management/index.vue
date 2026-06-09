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
import GenerateDialog from "@/views/hrm/leave-quota-management/generate-dialog.vue";
import { saveTableConfig } from "@/utils";
import {
  auditLeaveQuotaAccount,
  batchExtendLeaveQuotaAccount,
  deleteLeaveQuotaAccount,
  generateLeaveQuotaAccount,
  queryLeaveQuotaAccountDetail,
  queryLeaveQuotaAccountPage,
  queryLeaveTypeList,
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
const generateDialogVisible = ref(false);
const batchExtendLeaveTypeOptions = ref([]);
const generateLeaveTypeOptions = ref([]);
const quotaList = ref([]);
const total = ref(0);
const auditLoading = ref(false);
const reverseAuditLoading = ref(false);
const deleteLoading = ref(false);
const generateLoading = ref(false);
const batchExtendLoading = ref(false);
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

const attendanceScope = computed(() => store.getters["attendanceScope/scope"] || {});

const attendanceOrganizationOptions = computed(() => {
  if (
    Array.isArray(attendanceScope.value?.deptScopeTree) &&
    attendanceScope.value.deptScopeTree.length > 0
  ) {
    return attendanceScope.value.deptScopeTree;
  }
  return store.getters["attendanceScope/deptScopes"] || [];
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
    positionName: item.positionName || item.position || "",
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
        ...rowData,
        ...mapQuotaBaseRecord(res?.data || {}),
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

const openBatchExtendDialog = () => {
  if (batchExtendLeaveTypeOptions.value.length > 0) {
    batchDialogVisible.value = true;
    return;
  }
  queryLeaveTypeList({
    isLoading: true,
  }).then((res) => {
    batchExtendLeaveTypeOptions.value = Array.isArray(res?.data) ? res.data : [];
    batchDialogVisible.value = true;
  });
};

const openGenerateDialog = () => {
  if (generateLeaveTypeOptions.value.length > 0) {
    generateDialogVisible.value = true;
    return;
  }
  queryLeaveTypeList({
    isLoading: true,
  }).then((res) => {
    generateLeaveTypeOptions.value = Array.isArray(res?.data) ? res.data : [];
    generateDialogVisible.value = true;
  });
};

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const getSelectedQuotaRows = () => {
  return getSelectedRows().filter((item) => item?.id || item?.quotaAccountId);
};

const validateAuditRows = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning("请先选择需要审核的记录");
    return false;
  }
  const invalidRows = rows.filter((item) => item.auditStatus !== "未审核");
  if (invalidRows.length > 0) {
    ElMessage.warning("仅支持选择未审核记录进行审核");
    return false;
  }
  return true;
};

const validateReverseAuditRows = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning("请先选择需要反审核的记录");
    return false;
  }
  const invalidStatusRows = rows.filter((item) => item.auditStatus !== "已审核");
  if (invalidStatusRows.length > 0) {
    ElMessage.warning("仅支持选择已审核记录进行反审核");
    return false;
  }
  const invalidQuotaRows = rows.filter(
    (item) => Number(item.usedQuota || 0) > 0 || Number(item.frozenQuota || 0) > 0,
  );
  if (invalidQuotaRows.length > 0) {
    ElMessage.warning("已发生请假扣减或冻结的额度不支持反审核");
    return false;
  }
  return true;
};

const validateDeleteRows = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning("请先选择需要删除的记录");
    return false;
  }
  const invalidStatusRows = rows.filter((item) => item.auditStatus !== "未审核");
  if (invalidStatusRows.length > 0) {
    ElMessage.warning("仅支持删除未审核记录");
    return false;
  }
  const invalidQuotaRows = rows.filter(
    (item) => Number(item.usedQuota || 0) > 0 || Number(item.frozenQuota || 0) > 0,
  );
  if (invalidQuotaRows.length > 0) {
    ElMessage.warning("已发生请假扣减或冻结的额度禁止删除");
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
    `确认审核选中的 ${rows.length} 条记录吗？`,
    "审核确认",
    {
      type: "warning",
      confirmButtonText: "审核",
      cancelButtonText: "取消",
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
      updateQuotaAuditStatus(rows, "已审核");
      ElMessage.success(res?.data?.message || "审核成功");
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
    `确认反审核选中的 ${rows.length} 条记录吗？`,
    "反审核确认",
    {
      type: "warning",
      confirmButtonText: "反审核",
      cancelButtonText: "取消",
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
      updateQuotaAuditStatus(rows, "未审核");
      ElMessage.success(res?.data?.message || "反审核成功");
      fetchLeaveQuotaList();
    })
    .finally(() => {
      reverseAuditLoading.value = false;
    });
};

const handleDeleteQuota = async () => {
  const rows = getSelectedQuotaRows();
  if (!validateDeleteRows(rows)) {
    return;
  }
  await ElMessageBox.confirm(
    `确认删除选中的 ${rows.length} 条假期额度吗？`,
    "删除确认",
    {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    },
  );
  deleteLoading.value = true;
  deleteLeaveQuotaAccount(
    {
      quotaAccountIds: rows.map((item) => item.id || item.quotaAccountId).join(","),
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const deletedIds = new Set(
        rows.map((item) => item.id || item.quotaAccountId).filter(Boolean),
      );
      quotaList.value = quotaList.value.filter((item) => {
        const currentId = item.id || item.quotaAccountId;
        return !deletedIds.has(currentId);
      });
      if (
        selectedQuotaDetail.value?.id &&
        deletedIds.has(selectedQuotaDetail.value.id)
      ) {
        quotaDetailVisible.value = false;
        selectedQuotaDetail.value = {};
      }
      ElMessage.success(res?.data?.message || "删除成功");
      fetchLeaveQuotaList();
    })
    .finally(() => {
      deleteLoading.value = false;
    });
};

const handleGenerateQuota = (formData) => {
  generateLoading.value = true;
  generateLeaveQuotaAccount(formData, {
    isLoading: true,
  })
    .then((res) => {
      generateDialogVisible.value = false;
      ElMessage.success(res?.data?.message || "生成额度成功");
      listQuery.value.pageNo = 1;
      fetchLeaveQuotaList();
    })
    .finally(() => {
      generateLoading.value = false;
    });
};

const handleMoreCommand = (command) => {
  const commandMap = {
    audit: handleAudit,
    reverseAudit: handleReverseAudit,
    ledger: openLedgerPage,
    delete: handleDeleteQuota,
  };
  commandMap[command]?.();
};

const buildBatchExtendPayload = (formData) => {
  const payload = {
    reason: formData.reason || undefined,
  };

  if (formData.extensionType === "fixedDate") {
    payload.extendMode = "TO_DATE";
    payload.newPeriodEndDate = formData.fixedDate;
  } else {
    payload.extendMode = "ADD_MONTHS";
    payload.extendMonths = Number(formData.monthCount || 0);
  }

  if (formData.targetType === "selected") {
    const selectedRows = getSelectedQuotaRows();
    payload.extendTargetType = "SELECTED";
    payload.quotaAccountIds = selectedRows
      .map((item) => item.id || item.quotaAccountId)
      .filter(Boolean)
      .join(",");
    return payload;
  }

  if (formData.targetType === "all") {
    payload.extendTargetType = "ALL_LIST";
    payload.talentName = diminput.value || undefined;
    return payload;
  }

  payload.extendTargetType = "CONDITION";
  payload.leaveTypeCode = formData.leaveTypeCode || undefined;
  payload.periodMatchMode =
    formData.periodMode === "exact" ? "EXACT_PERIOD" : "LATEST_EFFECTIVE";
  payload.periodStartDate = formData.periodStartDate || undefined;
  payload.periodEndDate = formData.periodEndDate || undefined;
  if (formData.employeeScope === "specifiedEmployees") {
    payload.employeeScope = "SELECTED_EMPLOYEES";
    payload.talentCodes =
      formData.employees
        ?.map((item) => item.employeeCode)
        .filter(Boolean)
        .join(",") || undefined;
  } else {
    payload.employeeScope = "ALL_IN_SCOPE";
  }
  return payload;
};

const handleBatchExtend = (formData) => {
  if (formData.targetType === "selected" && getSelectedQuotaRows().length === 0) {
    return ElMessage.warning("请先选择需要延期的记录");
  }

  if (formData.targetType === "condition" && !formData.leaveTypeCode) {
    return ElMessage.warning("请选择假期类型");
  }

  if (formData.targetType === "condition" && formData.periodMode === "exact") {
    if (!formData.periodStartDate || !formData.periodEndDate) {
      return ElMessage.warning("请选择完整的周期日期");
    }
  }

  if (
    formData.targetType === "condition" &&
    formData.employeeScope === "specifiedEmployees"
  ) {
    if (!Array.isArray(formData.employees) || formData.employees.length === 0) {
      return ElMessage.warning("请选择员工");
    }
  }

  if (formData.extensionType === "fixedDate" && !formData.fixedDate) {
    return ElMessage.warning("请选择固定日期");
  }

  if (formData.extensionType === "byMonths" && Number(formData.monthCount || 0) <= 0) {
    return ElMessage.warning("按月数延期时请输入大于 0 的月数");
  }

  batchExtendLoading.value = true;
  batchExtendLeaveQuotaAccount(buildBatchExtendPayload(formData), {
    isLoading: true,
  })
    .then((res) => {
      batchDialogVisible.value = false;
      quotaDetailVisible.value = false;
      selectedQuotaDetail.value = {};
      ElMessage.success(res?.data?.message || "批量延期成功");
      fetchLeaveQuotaList();
    })
    .finally(() => {
      batchExtendLoading.value = false;
    });
};

const handleQuotaDetailSaved = (detail) => {
  const quotaAccountId = detail?.id || detail?.quotaAccountId;
  if (!quotaAccountId) {
    return;
  }
  selectedQuotaDetail.value = {
    ...selectedQuotaDetail.value,
    ...detail,
  };
  quotaList.value = quotaList.value.map((item) => {
    const currentId = item.id || item.quotaAccountId;
    if (currentId !== quotaAccountId) {
      return item;
    }
    return {
      ...item,
      ...detail,
    };
  });
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
                    class="top-search"
                    style="width: 200px"
                    placeholder="请输入员工姓名"
                    clearable
                    @clear="fuzzySearch"
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
                    :loading="generateLoading"
                    @click="openGenerateDialog"
                  >
                    生成额度
                  </el-button>
                  <el-button
                    type="primary"
                    @click="openBatchExtendDialog"
                  >
                    批量延期
                  </el-button>
                  <el-dropdown @command="handleMoreCommand">
                    <el-button>
                      更多
                      <i class="mdi mdi-chevron-down ms-1"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          command="audit"
                          :disabled="auditLoading"
                        >
                          审核
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="reverseAudit"
                          :disabled="reverseAuditLoading"
                        >
                          反审核
                        </el-dropdown-item>
                        <el-dropdown-item command="ledger">
                          额度日志信息
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="delete"
                          :disabled="deleteLoading"
                        >
                          删除
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
        @saved="handleQuotaDetailSaved"
        @close="closeQuotaDetail"
      />
    </DragSidebar>

    <BatchExtendDialog
      v-model="batchDialogVisible"
      :leaveTypeOptions="batchExtendLeaveTypeOptions"
      :organizationOptions="attendanceOrganizationOptions"
      @confirm="handleBatchExtend"
    />

    <GenerateDialog
      v-model="generateDialogVisible"
      :leaveTypeOptions="generateLeaveTypeOptions"
      :organizationOptions="attendanceOrganizationOptions"
      @confirm="handleGenerateQuota"
    />

  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

</style>
