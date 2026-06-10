<!-- 补签卡详情内容组件，用于展示和处理补签卡单详情信息。 -->
<script setup>
/* global defineProps, defineEmits */
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  abandonSupplementRequestSelf,
  approveApprovalTask,
  querySupplementRequestSelfInit,
  rejectApprovalTask,
  saveSupplementRequestSelf,
} from "@/api/attendance";
import {
  buildSupplementApprovalFlow,
  buildSupplementSavePayload,
  createEmptySupplementItem,
  fetchSupplementRequestDetail,
  getSupplementRequestId,
  normalizeSupplementDetail,
  normalizeSupplementItem,
} from "@/views/hrm/my-attendance/utils/supplementDetail";

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  showBack: {
    type: Boolean,
    default: false,
  },
  backText: {
    type: String,
    default: "返回",
  },
  singleItemOnly: {
    type: Boolean,
    default: true,
  },
  adminMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "back", "update-detail", "refresh-list", "approval-done"]);

const supplementReasonOptions = ref([]);
const detailInfo = ref(normalizeSupplementDetail(props.detailInfo));
const isEditingItems = ref(false);
const itemEditList = ref([]);
const saving = ref(false);
const approvalDialogVisible = ref(false);
const approvalDialogType = ref("approve");
const approvalOpinion = ref("");
const approveLoading = ref(false);
const rejectLoading = ref(false);

watch(
  () => props.detailInfo,
  (value) => {
    detailInfo.value = normalizeSupplementDetail(value);
    isEditingItems.value = false;
    itemEditList.value = [];
  },
  { deep: true },
);

const approvalFlow = computed(() => buildSupplementApprovalFlow(detailInfo.value));

const displayItem = computed(() => detailInfo.value.items?.[0] || {});

const showEditButton = computed(
  () => !props.adminMode && detailInfo.value?.canEdit === true,
);
const showSubmitButton = computed(
  () => !props.adminMode && detailInfo.value?.canSubmit === true,
);
const showAbandonButton = computed(
  () => !props.adminMode && detailInfo.value?.canAbandon === true,
);

const resolveApprovalTaskId = (detail = {}) => detail.taskId ?? detail.task?.taskId ?? null;

const showApproveButton = computed(() => !!detailInfo.value?.canApprove);

const showRejectButton = computed(() => !!detailInfo.value?.canReject);

const approvalDialogTitle = computed(() =>
  approvalDialogType.value === "approve" ? "审批通过" : "审批退回",
);

const openApprovalDialog = (type) => {
  approvalDialogType.value = type;
  approvalOpinion.value = "";
  approvalDialogVisible.value = true;
};

const submitApproval = async () => {
  const taskId = resolveApprovalTaskId(detailInfo.value);

  const isApprove = approvalDialogType.value === "approve";
  const payload = {
    taskId,
    opinion: approvalOpinion.value?.trim() || undefined,
  };
  const requestApi = isApprove ? approveApprovalTask : rejectApprovalTask;
  const loadingRef = isApprove ? approveLoading : rejectLoading;

  if (loadingRef.value) {
    return;
  }
  loadingRef.value = true;
  try {
    await requestApi(payload);
    approvalDialogVisible.value = false;
    approvalOpinion.value = "";
    ElMessage.success(isApprove ? "审批已通过" : "审批已退回");
    emit("approval-done", detailInfo.value);
    emit("close");
  } catch (error) {
    console.log(error);
  } finally {
    loadingRef.value = false;
  }
};

const statusTextClass = (status) => {
  const statusMap = {
    未提交: "status-text--draft",
    审批中: "status-text--pending",
    已通过: "status-text--success",
    已退回: "status-text--rejected",
    已驳回: "status-text--rejected",
    已废弃: "status-text--discarded",
    已撤回: "status-text--discarded",
  };
  return statusMap[status] || "status-text--draft";
};

const loadSupplementReasonOptions = async () => {
  if (supplementReasonOptions.value.length) {
    return;
  }
  try {
    const res = await querySupplementRequestSelfInit({}, { isLoading: false });
    supplementReasonOptions.value = Array.isArray(res?.data?.supplementReasons)
      ? res.data.supplementReasons
      : [];
  } catch (error) {
    supplementReasonOptions.value = [];
  }
};

const refreshCurrentDetail = async () => {
  const supplementRequestId = getSupplementRequestId(detailInfo.value);
  if (supplementRequestId === null) {
    return;
  }
  detailInfo.value = await fetchSupplementRequestDetail(
    supplementRequestId,
    detailInfo.value,
  );
  emit("update-detail", detailInfo.value);
};

const createEmptyItem = createEmptySupplementItem;

const cloneItems = (items) => {
  const list = Array.isArray(items) ? items : [];
  return list.map((item) => normalizeSupplementItem(item));
};

const handleEditItems = async () => {
  await loadSupplementReasonOptions();
  const currentItems = cloneItems(detailInfo.value.items);
  itemEditList.value = currentItems.length ? [currentItems[0]] : [createEmptyItem()];
  isEditingItems.value = true;
};

const handleCancelEditItems = () => {
  itemEditList.value = [];
  isEditingItems.value = false;
};

const validateEditItems = () => {
  const item = itemEditList.value[0];
  if (!item?.attendanceTime) {
    ElMessage.warning("请选择考勤时间");
    return false;
  }
  if (!item?.reasonCode) {
    ElMessage.warning("请选择补签原因");
    return false;
  }
  return true;
};

const handleSaveItems = async () => {
  if (!validateEditItems() || saving.value) {
    return;
  }
  saving.value = true;
  try {
    const item = itemEditList.value[0];
    await saveSupplementRequestSelf(
      buildSupplementSavePayload(item, {
        supplementRequestId: getSupplementRequestId(detailInfo.value) || undefined,
        talentCode: detailInfo.value.employeeCode || undefined,
        actionType: "save",
      }),
      { isLoading: true },
    );
    await refreshCurrentDetail();
    handleCancelEditItems();
    emit("refresh-list");
    ElMessage.success("补签信息已保存");
  } catch (error) {
    console.log(error);
  } finally {
    saving.value = false;
  }
};

const handleSubmit = () => {
  if (!showSubmitButton.value || saving.value) {
    ElMessage.warning("当前补签单无需提交");
    return;
  }
  if (isEditingItems.value && !validateEditItems()) {
    return;
  }
  ElMessageBox.confirm("确认提交当前补签申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      saving.value = true;
      try {
        const item = isEditingItems.value ? itemEditList.value[0] : displayItem.value;
        await saveSupplementRequestSelf(
          buildSupplementSavePayload(item, {
            supplementRequestId: getSupplementRequestId(detailInfo.value) || undefined,
            talentCode: detailInfo.value.employeeCode || undefined,
            actionType: "submit",
          }),
          { isLoading: true },
        );
        handleCancelEditItems();
        ElMessage.success("补签申请已提交审批");
        emit("refresh-list");
      } catch (error) {
        console.log(error);
      } finally {
        saving.value = false;
      }
    })
    .catch(() => {});
};

const handleDiscard = () => {
  if (isEditingItems.value) {
    ElMessage.warning("请先保存或取消补签信息编辑");
    return;
  }
  if (!showAbandonButton.value) {
    ElMessage.warning("当前补签单不可废弃");
    return;
  }
  ElMessageBox.confirm(
    "确定要废弃当前补签单吗？废弃后该单据将不再进入审批流程。",
    "废弃确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      const supplementRequestId = getSupplementRequestId(detailInfo.value);
      if (supplementRequestId === null) {
        return ElMessage.warning("缺少补签单ID，无法废弃");
      }
      try {
        await abandonSupplementRequestSelf({ supplementRequestId }, { isLoading: true });
        await refreshCurrentDetail();
        emit("refresh-list");
        ElMessage.success("补签单已废弃");
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {});
};
</script>

<template>
  <div
    v-if="getSupplementRequestId(detailInfo) !== null || detailInfo?.billNo"
    class="supplement-detail-content-wrap"
  >
    <div class="supplement-detail-sidebar__header">
      <div>
        <div class="supplement-detail-sidebar__title-line">
          <h2>补签详情</h2>
        </div>
        <p>{{ detailInfo.billNo || "--" }}</p>
      </div>
      <div class="supplement-detail-sidebar__actions">
        <template v-if="isEditingItems">
          <el-button
            type="primary"
            :loading="saving"
            @click="handleSaveItems"
          >
            保存
          </el-button>
          <el-button @click="handleCancelEditItems">取消</el-button>
        </template>
        <template v-else>
          <el-button
            v-if="showApproveButton"
            type="primary"
            :loading="approveLoading"
            @click="openApprovalDialog('approve')"
          >
            通过
          </el-button>
          <el-button
            v-if="showRejectButton"
            type="danger"
            :loading="rejectLoading"
            @click="openApprovalDialog('reject')"
          >
            退回
          </el-button>
          <el-button
            v-if="showEditButton"
            type="primary"
            @click="handleEditItems"
          >
            修改
          </el-button>
          <el-button
            v-if="showAbandonButton"
            type="primary"
            @click="handleDiscard"
          >
            废弃
          </el-button>
        </template>
        <el-button
          v-if="showSubmitButton"
          type="primary"
          :loading="saving"
          @click="handleSubmit"
        >
          提交
        </el-button>
        <el-button
          v-if="showClose"
          @click="emit('close')"
        >
          关闭
        </el-button>
        <el-button
          v-if="showBack"
          @click="emit('back')"
        >
          {{ backText }}
        </el-button>
      </div>
    </div>

    <div class="detail-layout">
      <section class="detail-card detail-card--main">
        <div class="detail-card__title">补签单信息</div>
        <div class="supplement-detail-content">
          <div class="detail-info-table">
            <div class="detail-info-table__label">单据编号</div>
            <div>{{ detailInfo.billNo || "--" }}</div>
            <div class="detail-info-table__label">单据状态</div>
            <div :class="['status-text', statusTextClass(detailInfo.status)]">
              {{ detailInfo.status || "--" }}
            </div>

            <div class="detail-info-table__label">姓名</div>
            <div>{{ detailInfo.applicant || "--" }}</div>
            <div class="detail-info-table__label">员工编码</div>
            <div>{{ detailInfo.employeeCode || "--" }}</div>

            <div class="detail-info-table__label">所属组织</div>
            <div>{{ detailInfo.organization || "--" }}</div>
            <div class="detail-info-table__label">职位</div>
            <div class="detail-info-table__value--wrap">{{ detailInfo.position || "--" }}</div>

            <div class="detail-info-table__label">申请日期</div>
            <div>{{ detailInfo.applyDate || "--" }}</div>
            <div class="detail-info-table__label">办理人</div>
            <div>{{ detailInfo.approver || "--" }}</div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">补签信息</div>
            <div class="detail-form-grid">
              <div class="detail-field">
                <span>考勤时间</span>
                <el-date-picker
                  v-if="isEditingItems"
                  v-model="itemEditList[0].attendanceTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="请选择考勤时间"
                />
                <strong v-else>{{ displayItem.attendanceTime || "--" }}</strong>
              </div>
              <div class="detail-field">
                <span>补签原因</span>
                <el-select
                  v-if="isEditingItems"
                  v-model="itemEditList[0].reasonCode"
                  placeholder="请选择补签原因"
                >
                  <el-option
                    v-for="reason in supplementReasonOptions"
                    :key="reason.reasonCode"
                    :label="reason.reasonName"
                    :value="reason.reasonCode"
                  />
                </el-select>
                <strong v-else>{{ displayItem.reason || "--" }}</strong>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">备注</div>
            <el-input
              v-if="isEditingItems"
              v-model="itemEditList[0].remark"
              type="textarea"
              :rows="4"
              resize="none"
              placeholder="请填写异常说明、补充依据或其他需要说明的信息"
            />
            <div
              v-else
              class="detail-text-block"
            >
              {{ displayItem.remark || "--" }}
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

    <el-dialog
      v-model="approvalDialogVisible"
      :title="approvalDialogTitle"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见（非必填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="approvalDialogType === 'approve' ? approveLoading : rejectLoading"
            @click="submitApproval"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.supplement-detail-content-wrap {
  min-height: 100%;
}

.supplement-detail-sidebar__header {
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

.supplement-detail-sidebar__header h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.supplement-detail-sidebar__title-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.supplement-detail-sidebar__header p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.supplement-detail-sidebar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.supplement-detail-content {
  padding: 18px 20px 22px;
}

.detail-info-table {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 120px minmax(0, 1fr);
  margin-bottom: 18px;
}

.detail-info-table > div {
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

.detail-info-table > div:nth-child(-n + 4) {
  border-top: 1px solid #e1e7f0;
}

.detail-info-table > div:nth-child(4n + 1) {
  border-left: 1px solid #e1e7f0;
}

.detail-info-table__label {
  background: #f3f6fb;
  color: #31425f;
  font-weight: 600;
}

.detail-info-table__value--wrap {
  align-items: flex-start !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  line-height: 1.6;
  white-space: normal;
  word-break: break-all;
}

.supplement-detail-content :deep(.el-input),
.supplement-detail-content :deep(.el-select),
.supplement-detail-content :deep(.el-date-editor.el-input),
.supplement-detail-content :deep(.el-textarea) {
  width: 100%;
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

.detail-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-field,
.detail-text-block {
  min-height: 70px;
  padding: 12px;
  border: 1px solid #e1e7f0;
  border-radius: 6px;
  background: #fbfcff;
}

.detail-field span {
  display: block;
  margin-bottom: 8px;
  color: #6d7890;
  font-size: 12px;
}

.detail-field strong {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.detail-text-block {
  color: #122448;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
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

  .detail-form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .supplement-detail-sidebar__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .supplement-detail-sidebar__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .detail-info-table {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .detail-info-table > div:nth-child(-n + 4) {
    border-top: 0;
  }

  .detail-info-table > div:nth-child(-n + 2) {
    border-top: 1px solid #e1e7f0;
  }

  .detail-info-table > div:nth-child(4n + 1) {
    border-left: 0;
  }

  .detail-info-table > div:nth-child(odd) {
    border-left: 1px solid #e1e7f0;
  }
}
</style>
