<!-- 加班详情内容组件，用于展示和处理加班单详情信息。 -->
<script setup>
import { computed, ref, watch, defineProps, defineEmits } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import {
  abandonOvertimeRequestAdmin,
  abandonOvertimeRequestSelf,
  approveApprovalTask,
  rejectApprovalTask,
  saveOvertimeRequestSelf,
} from "@/api/attendance";
import {
  buildOvertimeApprovalFlow,
  buildOvertimeSaveDateTime,
  fetchOvertimeRequestDetail,
  formatOvertimeDateTimeValue,
  getOvertimeRequestId,
  normalizeOvertimeDetail,
  resolveOvertimeDateFromDateTime,
} from "@/views/hrm/my-attendance/utils/overtimeDetail";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  showBack: {
    type: Boolean,
    default: false,
  },
  adminMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "close", "update-detail", "approval-done", "refresh-list"]);

const detailEditMode = ref(false);
const approvalDialogVisible = ref(false);
const approvalDialogType = ref("approve");
const approvalOpinion = ref("");
const approveLoading = ref(false);
const rejectLoading = ref(false);
const detailEditForm = ref({});
const currentDetail = ref({});

const resolveApprovalTaskId = (detail = {}) => detail.taskId ?? detail.task?.taskId ?? null;

watch(
  () => props.detailInfo,
  (detail) => {
    currentDetail.value = detail ? normalizeOvertimeDetail(detail) : {};
    detailEditMode.value = false;
    detailEditForm.value = {};
  },
  { immediate: true, deep: true },
);

const approvalTaskId = computed(() => resolveApprovalTaskId(currentDetail.value));

const showApproveButton = computed(
  () => !!currentDetail.value?.canApprove && !!approvalTaskId.value,
);

const showRejectButton = computed(
  () => !!currentDetail.value?.canReject && !!approvalTaskId.value,
);

const showEditButton = computed(() => currentDetail.value?.canEdit === true);

const showSubmitButton = computed(() => currentDetail.value?.canSubmit === true);

const showAbandonButton = computed(() => currentDetail.value?.canAbandon === true);

const approvalDialogTitle = computed(() =>
  approvalDialogType.value === "approve" ? "审批通过" : "审批退回",
);

const openApprovalDialog = (type) => {
  if (!approvalTaskId.value) {
    ElMessage.warning("缺少审批任务ID，无法操作");
    return;
  }
  approvalDialogType.value = type;
  approvalOpinion.value = "";
  approvalDialogVisible.value = true;
};

const submitApproval = async () => {
  const taskId = approvalTaskId.value;
  if (!taskId) {
    ElMessage.warning("缺少审批任务ID，无法操作");
    return;
  }

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
    emit("approval-done", currentDetail.value);
    emit("close");
  } catch (error) {
    console.log(error);
  } finally {
    loadingRef.value = false;
  }
};

const buildDetailEditForm = (detail) => ({
  startTime:
    detail.startTime ||
    buildOvertimeSaveDateTime(detail.overtimeDate, detail.startTimeOnly) ||
    "",
  endTime:
    detail.endTime ||
    buildOvertimeSaveDateTime(detail.overtimeDate, detail.endTimeOnly) ||
    "",
  breakMinutes: detail.breakMinutes || 0,
  overtimeHours: detail.overtimeHours || 0,
  overtimeReason: detail.overtimeReason || "",
  remark: detail.remark || "",
});

const computedOvertimeHours = computed(() => {
  const { startTime, endTime, breakMinutes } = detailEditForm.value;
  if (!startTime || !endTime) {
    return 0;
  }
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
    return 0;
  }
  const durationMinutes = end.diff(start, "minute") - Number(breakMinutes || 0);
  if (durationMinutes <= 0) {
    return 0;
  }
  return Number((durationMinutes / 60).toFixed(1));
});

const statusTextClass = (status) => {
  const statusMap = {
    未提交: "status-text--draft",
    审批中: "status-text--pending",
    已通过: "status-text--success",
    已退回: "status-text--rejected",
    已驳回: "status-text--rejected",
    已废弃: "status-text--discarded",
  };
  return statusMap[status] || "status-text--draft";
};

const refreshCurrentDetail = async () => {
  const overtimeRequestId = getOvertimeRequestId(currentDetail.value);
  if (overtimeRequestId === null) {
    return;
  }
  currentDetail.value = await fetchOvertimeRequestDetail(overtimeRequestId);
  emit("update-detail", currentDetail.value);
};

const buildSavePayload = (submitFlag) => {
  const form = detailEditMode.value ? detailEditForm.value : currentDetail.value;
  const startTimeValue = detailEditMode.value
    ? form.startTime
    : form.startTime ||
      currentDetail.value.startTime ||
      currentDetail.value.overtimeStartTime;
  const endTimeValue = detailEditMode.value
    ? form.endTime
    : form.endTime ||
      currentDetail.value.endTime ||
      currentDetail.value.overtimeEndTime;
  const overtimeStartTime = formatOvertimeDateTimeValue(startTimeValue);
  const overtimeEndTime = formatOvertimeDateTimeValue(endTimeValue);
  return {
    overtimeRequestId: getOvertimeRequestId(currentDetail.value) || undefined,
    overtimeDate: resolveOvertimeDateFromDateTime(overtimeStartTime),
    overtimeStartTime,
    overtimeEndTime,
    restMinutes: Number(form.breakMinutes ?? currentDetail.value.breakMinutes ?? 0),
    overtimeTypeCode: currentDetail.value.overtimeTypeCode || undefined,
    overtimeTypeName: currentDetail.value.overtimeType || undefined,
    compensationType: currentDetail.value.compensationType || undefined,
    reason: (form.overtimeReason ?? currentDetail.value.overtimeReason)?.trim() || undefined,
    remark: (form.remark ?? currentDetail.value.remark)?.trim() || undefined,
    submitFlag,
  };
};

const handleEditDetail = () => {
  if (!currentDetail.value?.canEdit || getOvertimeRequestId(currentDetail.value) === null) {
    return;
  }
  detailEditForm.value = buildDetailEditForm(currentDetail.value);
  detailEditMode.value = true;
};

const handleSubmitDetail = () => {
  if (!currentDetail.value?.canSubmit) {
    return;
  }
  if (getOvertimeRequestId(currentDetail.value) === null) {
    ElMessage.warning("缺少加班单ID，无法提交");
    return;
  }
  if (detailEditMode.value && !validateDetail()) {
    return;
  }
  ElMessageBox.confirm("确认提交当前加班申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await saveOvertimeRequestSelf(buildSavePayload("1"), { isLoading: true });
        handleCancelEditDetail();
        ElMessage.success("加班申请已提交审批");
        emit("refresh-list");
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {});
};

const handleCancelEditDetail = () => {
  detailEditMode.value = false;
  detailEditForm.value = {};
};

const validateDetail = () => {
  const form = detailEditForm.value;
  if (!form.startTime || !form.endTime) {
    ElMessage.warning("请填写加班开始和结束时间");
    return false;
  }
  if (!dayjs(form.endTime).isAfter(dayjs(form.startTime))) {
    ElMessage.warning("结束时间需晚于开始时间");
    return false;
  }
  if (computedOvertimeHours.value <= 0) {
    ElMessage.warning("申请加班小时数需大于 0");
    return false;
  }
  return true;
};

const handleSaveDetail = () => {
  if (!currentDetail.value?.canEdit || getOvertimeRequestId(currentDetail.value) === null) {
    return;
  }
  if (!validateDetail()) {
    return;
  }
  saveOvertimeRequestSelf(buildSavePayload("0"), { isLoading: true })
    .then(async () => {
      detailEditMode.value = false;
      detailEditForm.value = {};
      await refreshCurrentDetail();
      ElMessage.success("加班单信息已保存");
    })
    .catch((error) => {
      console.log(error);
    });
};

const handleDiscardDetail = () => {
  if (!currentDetail.value?.canAbandon) {
    return;
  }
  const overtimeRequestId = getOvertimeRequestId(currentDetail.value);
  if (overtimeRequestId === null) {
    ElMessage.warning("缺少加班单ID，无法操作");
    return;
  }
  const abandonApi = props.adminMode
    ? abandonOvertimeRequestAdmin
    : abandonOvertimeRequestSelf;
  ElMessageBox.confirm(
    "确定要废弃当前加班单吗？废弃后该单据将不再进入审批流程。",
    "废弃确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() =>
      abandonApi({ overtimeRequestId }, { isLoading: true }).then(async () => {
        detailEditMode.value = false;
        await refreshCurrentDetail();
        ElMessage.success("加班单已废弃");
      }),
    )
    .catch(() => {});
};

const approvalFlow = computed(() => {
  if (getOvertimeRequestId(currentDetail.value) === null && !currentDetail.value?.billNo) {
    return [];
  }
  return buildOvertimeApprovalFlow(currentDetail.value);
});
</script>

<template>
  <div
    v-if="getOvertimeRequestId(currentDetail) !== null || currentDetail?.billNo"
    class="overtime-detail-content-wrap"
  >
    <div class="overtime-detail-sidebar__header">
      <div>
        <div class="overtime-detail-sidebar__title-line">
          <h2>加班详情</h2>
        </div>
        <p>{{ currentDetail.billNo }}</p>
      </div>
      <div class="overtime-detail-sidebar__actions">
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
            @click="handleEditDetail"
          >
            修改
          </el-button>
          <el-button
            v-if="showAbandonButton"
            type="primary"
            @click="handleDiscardDetail"
          >
            废弃
          </el-button>
        </template>
        <el-button
          v-if="showSubmitButton"
          type="primary"
          @click="handleSubmitDetail"
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
          返回
        </el-button>
      </div>
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
            :loading="approveLoading || rejectLoading"
            @click="submitApproval"
          >
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <div class="detail-layout">
      <section class="detail-card detail-card--main">
        <div class="detail-card__title">加班单信息</div>
        <div class="overtime-detail-content">
          <div class="detail-info-table">
            <div class="detail-info-table__label">单据编号</div>
            <div>{{ currentDetail.billNo }}</div>
            <div class="detail-info-table__label">单据状态</div>
            <div :class="['status-text', statusTextClass(currentDetail.status)]">
              {{ currentDetail.status }}
            </div>

            <div class="detail-info-table__label">姓名</div>
            <div>{{ currentDetail.applicant }}</div>
            <div class="detail-info-table__label">员工编码</div>
            <div>{{ currentDetail.employeeCode }}</div>

            <div class="detail-info-table__label">所属组织</div>
            <div>{{ currentDetail.organization }}</div>
            <div class="detail-info-table__label">职位</div>
            <div class="detail-info-table__value--wrap">{{ currentDetail.position }}</div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">加班时段</div>
            <div class="detail-form-grid">
              <div class="detail-field">
                <span>开始时间</span>
                <el-date-picker
                  v-if="detailEditMode"
                  v-model="detailEditForm.startTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="请选择开始时间"
                />
                <strong v-else>{{ currentDetail.startTime }}</strong>
              </div>
              <div class="detail-field">
                <span>结束时间</span>
                <el-date-picker
                  v-if="detailEditMode"
                  v-model="detailEditForm.endTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="请选择结束时间"
                />
                <strong v-else>{{ currentDetail.endTime }}</strong>
              </div>
              <div class="detail-field">
                <span>休息时长（分）</span>
                <el-input-number
                  v-if="detailEditMode"
                  v-model="detailEditForm.breakMinutes"
                  :min="0"
                  :step="30"
                  controls-position="right"
                />
                <strong v-else>{{ currentDetail.breakMinutes }}</strong>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">业务属性</div>
            <div class="detail-option-group">
              <div class="detail-option-block">
                <div class="detail-option-block__title">加班原因</div>
                <el-input
                  v-if="detailEditMode"
                  v-model="detailEditForm.overtimeReason"
                  type="textarea"
                  :rows="4"
                  resize="none"
                  placeholder="请填写加班原因，例如项目上线、紧急交付、客户支持等"
                />
                <div
                  v-else
                  class="detail-text-block"
                >
                  {{ currentDetail.overtimeReason }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">时长与备注</div>
            <div class="detail-duration-box">
              <strong>
                {{ detailEditMode ? computedOvertimeHours : currentDetail.overtimeHours }}
                小时
              </strong>
              <span>
                审批通过后按 1:1 生成调休假，未使用额度 3 个月后失效。
              </span>
            </div>
            <el-input
              v-if="detailEditMode"
              v-model="detailEditForm.remark"
              type="textarea"
              :rows="4"
              resize="none"
              placeholder="请填写加班事项说明、工作内容或交接安排"
            />
            <div
              v-else
              class="detail-text-block"
            >
              {{ currentDetail.remark }}
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
</template>

<style scoped lang="scss">
.overtime-detail-content-wrap {
  min-height: 100%;
}

.overtime-detail-sidebar__header {
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

.overtime-detail-sidebar__header h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.overtime-detail-sidebar__title-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.overtime-detail-sidebar__header p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.overtime-detail-sidebar__actions {
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

.overtime-detail-content {
  padding: 18px 20px 22px;
}

.detail-info-table {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 180px minmax(0, 1fr);
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

.overtime-detail-content :deep(.el-input),
.overtime-detail-content :deep(.el-select),
.overtime-detail-content :deep(.el-date-editor.el-input),
.overtime-detail-content :deep(.el-input-number),
.overtime-detail-content :deep(.el-time-editor.el-input),
.overtime-detail-content :deep(.el-textarea) {
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-field,
.detail-duration-box,
.detail-text-block {
  min-height: 70px;
  padding: 12px;
  border: 1px solid #e1e7f0;
  border-radius: 6px;
  background: #fbfcff;
}

.detail-field span,
.detail-duration-box span {
  display: block;
  margin-bottom: 8px;
  color: #6d7890;
  font-size: 12px;
}

.detail-field strong,
.detail-duration-box strong {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.detail-option-group {
  display: grid;
  gap: 16px;
}

.detail-option-block__title {
  margin-bottom: 10px;
  color: #415372;
  font-size: 13px;
  font-weight: 600;
}

.detail-duration-box {
  margin-bottom: 12px;
  border-color: #f3c574;
  background: #fff7e9;
}

.detail-duration-box strong {
  display: block;
  color: #bf5b0c;
  font-size: 22px;
  line-height: 1.2;
}

.detail-duration-box span {
  margin-top: 10px;
  margin-bottom: 0;
  color: #9b5e1e;
  line-height: 1.6;
}

.detail-text-block {
  color: #122448;
  font-size: 13px;
  line-height: 1.7;
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

  .detail-info-table {
    grid-template-columns: 140px minmax(0, 1fr);
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

  .detail-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
