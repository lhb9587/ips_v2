<!-- 请假详情内容组件，用于展示和处理请假单详情信息。 -->
<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import { downLoadAll } from "@/utils";
import {
  abandonLeaveRequestAdmin,
  abandonLeaveRequestSelf,
  approveApprovalTask,
  queryLeaveRequestAdminDetail,
  queryLeaveRequestSelfCalcDuration,
  queryLeaveRequestSelfInit,
  rejectApprovalTask,
  saveLeaveRequestSelf,
} from "@/api/attendance";
import {
  beforeLeaveAttachmentUpload,
  buildLeaveAttachmentAccessUrl,
  handleLeaveAttachmentUploadSuccess,
  uploadLeaveAttachment,
} from "@/views/hrm/my-attendance/utils/leaveAttachmentUpload";
import {
  buildLeaveApprovalFlow,
  getLeaveRequestId,
  normalizeLeaveDetail,
} from "@/views/hrm/my-attendance/utils/leaveDetail";
import { formatLeaveTypeLabel } from "@/views/hrm/my-attendance/utils/leaveType";

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
const defaultLeaveTypeNames = ["法定年假", "司龄假", "事假", "病假"];

const startTime2Options = [
  { label: "上午 9:00", value: "9:00:00" },
  { label: "下午 14:00", value: "14:00:00" },
];
const endTime2Options = [
  { label: "上午 14:00", value: "14:00:00" },
  { label: "下午 18:00", value: "18:00:00" },
];

const leaveTypeOptions = ref([]);
const otherLeaveTypesExpanded = ref(false);
const tonePool = ["blue", "teal", "sky", "orange", "red", "purple"];

const isOtherLeaveType = (label) =>
  !!label && label !== "其他假期" && !defaultLeaveTypeNames.includes(label);

const syncOtherLeaveTypesExpanded = (leaveTypeName) => {
  otherLeaveTypesExpanded.value = isOtherLeaveType(leaveTypeName);
};

const selectedLeaveTypeName = computed(() =>
  detailEditMode.value ? detailEditForm.value.leaveType : currentDetail.value.leaveTypeName,
);

const leaveTypeSectionTitle = computed(() =>
  selectedLeaveTypeName.value
    ? `假期类型-${formatLeaveTypeLabel(selectedLeaveTypeName.value)}`
    : "假期类型",
);

const primaryLeaveTypeOptions = computed(() =>
  leaveTypeOptions.value.filter((item) => defaultLeaveTypeNames.includes(item.label)),
);

const otherLeaveTypeOptions = computed(() =>
  leaveTypeOptions.value.filter((item) => !defaultLeaveTypeNames.includes(item.label)),
);

const otherLeaveTypeCard = {
  key: "other",
  label: "其他假期",
  isNoQuota: true,
  showQuotaLine: false,
  showLastYear: false,
  tone: "purple",
};

const displayLeaveTypeOptions = computed(() => {
  if (otherLeaveTypesExpanded.value) {
    return [...primaryLeaveTypeOptions.value, ...otherLeaveTypeOptions.value];
  }
  if (otherLeaveTypeOptions.value.length > 0) {
    return [...primaryLeaveTypeOptions.value, otherLeaveTypeCard];
  }
  return [...primaryLeaveTypeOptions.value];
});

const resolveTalentCode = (detail = {}) => detail.talentCode || detail.employeeCode || "";

const fetchLeaveTypes = async (talentCode) => {
  try {
    const params = talentCode ? { talentCode } : {};
    const res = await queryLeaveRequestSelfInit(params, { isLoading: false });
    const list = Array.isArray(res?.data?.leaveTypes) ? res.data.leaveTypes : [];
    if (!list.length) {
      return;
    }

    const mappedAll = list.map((item, index) => {
      const isNoQuota = item?.isNoQuota ?? item?.noQuota ?? false;
      const label = item?.leaveTypeName || "";
      return {
        key: item?.leaveTypeCode,
        label,
        remaining: Number(item?.remainQuota ?? item?.remaining ?? 0),
        frozenQuota: Number(item?.frozenQuota ?? 0),
        lastYear: Number(item?.lastYearCarryForwardQuota ?? item?.lastYear ?? 0),
        isNoQuota,
        showQuotaLine: !isNoQuota,
        showLastYear: !isNoQuota && ["法定年假", "司龄假"].includes(label),
        tone: tonePool[index % tonePool.length],
      };
    });

    const primaryLeaveTypes = mappedAll.filter((item) => defaultLeaveTypeNames.includes(item.label));
    leaveTypeOptions.value = [
      ...primaryLeaveTypes,
      ...mappedAll.filter((item) => !defaultLeaveTypeNames.includes(item.label)),
    ];
  } catch (error) {
    // keep existing fallback UI without blocking detail rendering
  }
};

const resolveApprovalTaskId = (detail = {}) => detail.taskId ?? detail.task?.taskId ?? null;

watch(
  () => props.detailInfo,
  (detail) => {
    currentDetail.value = detail ? normalizeLeaveDetail(detail) : {};
    detailEditMode.value = false;
    detailEditForm.value = {};
    syncOtherLeaveTypesExpanded(detail?.leaveTypeName);
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

watch(
  () => resolveTalentCode(props.detailInfo),
  (talentCode) => {
    fetchLeaveTypes(talentCode);
  },
  { immediate: true },
);

const buildDateTime = (date, time2, fallback) => {
  const time = time2 || fallback;
  return `${date} ${time}`;
};

const normalizeTime2 = (timeText, isEnd = false) => {
  const text = String(timeText || "").trim();
  if (!text) {
    return isEnd ? "18:00:00" : "9:00:00";
  }

  const options = isEnd ? endTime2Options : startTime2Options;
  const matched = options.find((item) => item.value === text);
  if (matched) {
    return matched.value;
  }

  const parts = text.split(":");
  if (parts.length >= 2) {
    const normalized = `${Number(parts[0])}:${String(parts[1]).padStart(2, "0")}:${String(parts[2] || "00").padStart(2, "0")}`;
    const byValue = options.find((item) => item.value === normalized);
    if (byValue) {
      return byValue.value;
    }
    const hour = Number(parts[0]);
    if (isEnd) {
      return hour >= 18 ? "18:00:00" : "14:00:00";
    }
    return hour >= 14 ? "14:00:00" : "9:00:00";
  }

  if (text === "下午") {
    return isEnd ? "18:00:00" : "14:00:00";
  }
  if (text === "上午") {
    return isEnd ? "14:00:00" : "9:00:00";
  }

  return isEnd ? "18:00:00" : "9:00:00";
};

const parseDateTimeField = (timeText, isEnd = false) => {
  const text = String(timeText || "").trim();
  if (!text) {
    return { date: "", time2: isEnd ? "18:00:00" : "9:00:00" };
  }

  if (text.includes("上午") || text.includes("下午")) {
    const [date = "", period = "上午"] = text.split(" ");
    return { date, time2: normalizeTime2(period, isEnd) };
  }

  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const parsed = dayjs(normalized);
  if (!parsed.isValid()) {
    return { date: "", time2: isEnd ? "18:00:00" : "9:00:00" };
  }

  const time2 = `${parsed.hour()}:${String(parsed.minute()).padStart(2, "0")}:${String(parsed.second()).padStart(2, "0")}`;
  return {
    date: parsed.format("YYYY-MM-DD"),
    time2: normalizeTime2(time2, isEnd),
  };
};

const resolveLeaveTimeFields = (detail = {}) => {
  const startParsed = parseDateTimeField(detail.startTime, false);
  const endParsed = parseDateTimeField(detail.endTime, true);

  return {
    startTime: detail.startDate || startParsed.date,
    startTime2: detail.startTime2 || startParsed.time2,
    endTime: detail.endDate || endParsed.date,
    endTime2: detail.endTime2 || endParsed.time2,
  };
};

const formatTime2Label = (time2, isEnd = false) => {
  const options = isEnd ? endTime2Options : startTime2Options;
  return options.find((item) => item.value === time2)?.label || time2;
};

const formatLeaveTimeDisplay = (detail, isEnd = false) => {
  const fields = resolveLeaveTimeFields(detail);
  const date = isEnd ? fields.endTime : fields.startTime;
  const time2 = isEnd ? fields.endTime2 : fields.startTime2;
  if (!date) {
    return "";
  }
  return `${date} ${formatTime2Label(time2, isEnd)}`;
};

const buildDetailEditForm = (detail) => ({
  leaveType: detail.leaveTypeName,
  unit: detail.durationUnit,
  ...resolveLeaveTimeFields(detail),
  reason: detail.leaveReason,
  attachmentFiles: (detail.attachments || []).map((item, index) => ({
    name: item?.fileName || String(item?.attachmentId || ""),
    attachmentId: item?.attachmentId || undefined,
    url: item?.filePath || item?.fileUrl,
    filePath: item?.filePath || item?.fileUrl,
    uid: `detail-attachment-${index}`,
  })),
});

const resolveAttachmentUrl = (data = {}) => {
  const responseData = data?.response?.data;
  const payload = Array.isArray(responseData) ? responseData[0] : responseData;
  return (
    data?.filePath ||
    data?.fileUrl ||
    data?.url ||
    payload?.filePath ||
    payload?.fileUrl ||
    payload?.address
  );
};

const downloadAttachment = (item) => {
  const url = resolveAttachmentUrl(item);
  if (!url) {
    return;
  }
  const fileName = item?.fileName || item?.name || url.split("/").pop();
  downLoadAll({
    url: buildLeaveAttachmentAccessUrl(url),
    downLoad: String(fileName).replace(/\.[^.]+$/, ""),
    success() {},
  });
};

const openPreviewUrl = (url) => {
  window.open(buildLeaveAttachmentAccessUrl(url).replace(/[+]/g, "%2B"));
};

const PREVIEWABLE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

const onPreview = (data) => {
  const url = resolveAttachmentUrl(data);
  if (!url) {
    return false;
  }
  const ext = url.replace(/.+\./, "").toLowerCase();
  if (PREVIEWABLE_EXTENSIONS.includes(ext)) {
    openPreviewUrl(url);
    return;
  }
  downloadAttachment(data);
};

const detailDuration = ref(0);
const detailQuotaEnough = ref(true);
const detailCalcMessage = ref("");

const resolveLeaveTypeCode = (leaveTypeName) => {
  const matched = leaveTypeOptions.value.find((item) => item.label === leaveTypeName);
  return matched?.key || currentDetail.value.leaveTypeCode || "";
};

const resetDetailCalcState = () => {
  detailDuration.value = 0;
  detailQuotaEnough.value = true;
  detailCalcMessage.value = "";
};

const calcDetailDuration = async () => {
  if (!detailEditMode.value) {
    return;
  }

  const leaveTypeCode = resolveLeaveTypeCode(detailEditForm.value.leaveType);
  const { startTime, startTime2, endTime, endTime2 } = detailEditForm.value;
  if (!leaveTypeCode || !startTime || !endTime) {
    resetDetailCalcState();
    return;
  }

  const startDateTime = buildDateTime(startTime, startTime2, "9:00:00");
  const endDateTime = buildDateTime(endTime, endTime2, "18:00:00");
  if (dayjs(endDateTime).isBefore(dayjs(startDateTime))) {
    resetDetailCalcState();
    return;
  }

  try {
    const res = await queryLeaveRequestSelfCalcDuration(
      {
        leaveTypeCode,
        startTime,
        startTime2,
        endTime,
        endTime2,
      },
      { isLoading: false },
    );
    const data = res?.data || {};
    detailDuration.value = Number(data.duration || 0);
    detailQuotaEnough.value = data.quotaEnough !== false;
    detailCalcMessage.value = data.message || "";
  } catch (error) {
    resetDetailCalcState();
  }
};

watch(
  () =>
    detailEditMode.value
      ? [
          detailEditForm.value.leaveType,
          detailEditForm.value.startTime,
          detailEditForm.value.startTime2,
          detailEditForm.value.endTime,
          detailEditForm.value.endTime2,
        ]
      : null,
  () => {
    calcDetailDuration();
  },
  { immediate: true, deep: true },
);

const normalizeAttachmentFiles = (files) => {
  return (files || [])
    .map((item) => item.name)
    .filter(Boolean);
};

const buildAttachmentIds = (files = []) =>
  files
    .map((item) => item?.attachmentId || item?.response?.data?.attachmentId || item?.id)
    .filter((id) => id !== undefined && id !== null && id !== "")
    .join(",");

const hasUploadingFiles = computed(() =>
  (detailEditForm.value?.attachmentFiles || []).some(
    (item) => item?.status === "uploading",
  ),
);

const handleUploadSuccess = handleLeaveAttachmentUploadSuccess;

const buildSavePayload = (actionType, source, useEditForm = false) => {
  const leaveTypeCode = resolveLeaveTypeCode(
    useEditForm ? source.leaveType : source.leaveTypeName,
  );
  const timeFields = useEditForm
    ? {
        startTime: source.startTime,
        startTime2: source.startTime2,
        endTime: source.endTime,
        endTime2: source.endTime2,
      }
    : resolveLeaveTimeFields(source);
  const reason = useEditForm ? source.reason : source.leaveReason;
  const attachmentIds = buildAttachmentIds(useEditForm ? source.attachmentFiles : source.attachments);

  return {
    requestId: currentDetail.value.leaveRequestId,
    leaveTypeCode,
    ...timeFields,
    reason,
    actionType,
    attachmentIds: attachmentIds || undefined,
  };
};

const refreshCurrentDetail = async () => {
  if (!currentDetail.value?.leaveRequestId) {
    return;
  }
  const res = await queryLeaveRequestAdminDetail(
    { leaveRequestId: currentDetail.value.leaveRequestId },
    { isLoading: false },
  );
  const latestDetail = res?.data || {};
  currentDetail.value = normalizeLeaveDetail(latestDetail, currentDetail.value);
  if (!detailEditMode.value) {
    syncOtherLeaveTypesExpanded(currentDetail.value.leaveTypeName);
  }
  emit("update-detail", currentDetail.value);
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

const handleEditDetail = () => {
  if (!currentDetail.value?.canEdit || !currentDetail.value?.leaveRequestId) {
    return;
  }
  detailEditForm.value = buildDetailEditForm(currentDetail.value);
  syncOtherLeaveTypesExpanded(currentDetail.value.leaveTypeName);
  detailEditMode.value = true;
};

const validateDetailEditForm = () => {
  if (hasUploadingFiles.value) {
    ElMessage.warning("附件上传中，请稍后再保存");
    return false;
  }
  if (!detailEditForm.value.leaveType) {
    ElMessage.warning("请选择假期类型");
    return false;
  }
  if (!detailEditForm.value.startTime || !detailEditForm.value.endTime) {
    ElMessage.warning("请填写开始时间和结束时间");
    return false;
  }
  const startDateTime = buildDateTime(
    detailEditForm.value.startTime,
    detailEditForm.value.startTime2,
    "9:00:00",
  );
  const endDateTime = buildDateTime(
    detailEditForm.value.endTime,
    detailEditForm.value.endTime2,
    "18:00:00",
  );
  if (dayjs(endDateTime).isBefore(dayjs(startDateTime))) {
    ElMessage.warning("结束时间不能早于开始时间");
    return false;
  }
  if (detailDuration.value <= 0) {
    ElMessage.warning("结束时间不能早于开始时间");
    return false;
  }
  if (!detailQuotaEnough.value) {
    ElMessage.warning(detailCalcMessage.value || "当前请假无法申请，请调整假期类型或起止时间");
    return false;
  }
  if (!detailEditForm.value.reason) {
    ElMessage.warning("请填写请假说明");
    return false;
  }
  return true;
};

const handleSubmitDetail = () => {
  if (!currentDetail.value?.canSubmit) {
    return;
  }
  if (!currentDetail.value?.leaveRequestId) {
    ElMessage.warning("缺少请假单ID，无法提交");
    return;
  }
  if (detailEditMode.value && !validateDetailEditForm()) {
    return;
  }
  if (hasUploadingFiles.value) {
    ElMessage.warning("附件上传中，请稍后再提交");
    return;
  }
  ElMessageBox.confirm("确认提交当前请假申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const payload = detailEditMode.value
          ? buildSavePayload("submit", detailEditForm.value, true)
          : buildSavePayload("submit", currentDetail.value, false);
        await saveLeaveRequestSelf(payload);
        handleCancelEditDetail();
        ElMessage.success("请假申请已提交审批");
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
  syncOtherLeaveTypesExpanded(currentDetail.value.leaveTypeName);
};

const handleDiscardDetail = () => {
  if (!currentDetail.value?.canAbandon) {
    return;
  }
  const leaveRequestId = getLeaveRequestId(currentDetail.value);
  if (leaveRequestId === null) {
    ElMessage.warning("缺少请假单ID，无法操作");
    return;
  }
  const abandonApi = props.adminMode
    ? abandonLeaveRequestAdmin
    : abandonLeaveRequestSelf;
  ElMessageBox.confirm(
    "确定要废弃当前请假单吗？废弃后该单据将不再进入审批流程。",
    "废弃确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() =>
      abandonApi({ leaveRequestId }, { isLoading: true }).then(async () => {
        detailEditMode.value = false;
        await refreshCurrentDetail();
        ElMessage.success("请假单已废弃");
      }),
    )
    .catch(() => {});
};

const handleExpandOtherLeaveTypes = () => {
  otherLeaveTypesExpanded.value = true;
  if (detailEditMode.value) {
    detailEditForm.value.leaveType = "";
  }
};

const handleSelectDetailLeaveType = (item) => {
  if (item.key === "other") {
    handleExpandOtherLeaveTypes();
    return;
  }
  if (!detailEditMode.value) {
    return;
  }
  detailEditForm.value.leaveType = item.label;
};

const handleSaveDetail = () => {
  if (!currentDetail.value?.leaveRequestId) {
    return;
  }
  if (!validateDetailEditForm()) {
    return;
  }

  const updatedRecord = {
    ...currentDetail.value,
    leaveTypeName: detailEditForm.value.leaveType,
    startDate: detailEditForm.value.startTime,
    startTime2: detailEditForm.value.startTime2,
    endDate: detailEditForm.value.endTime,
    endTime2: detailEditForm.value.endTime2,
    startTime: formatLeaveTimeDisplay(
      {
        startDate: detailEditForm.value.startTime,
        startTime2: detailEditForm.value.startTime2,
      },
      false,
    ),
    endTime: formatLeaveTimeDisplay(
      {
        endDate: detailEditForm.value.endTime,
        endTime2: detailEditForm.value.endTime2,
      },
      true,
    ),
    leaveDuration: detailDuration.value,
    durationUnit: "天",
    leaveReason: detailEditForm.value.reason,
    attachments: normalizeAttachmentFiles(detailEditForm.value.attachmentFiles),
  };
  const payload = buildSavePayload("save", detailEditForm.value, true);
  saveLeaveRequestSelf(payload)
    .then(async (res) => {
      const nextRecord = {
        ...updatedRecord,
        requestStatus: res?.data?.status || updatedRecord.requestStatus,
      };
      currentDetail.value = { ...nextRecord };
      detailEditMode.value = false;
      detailEditForm.value = {};
      syncOtherLeaveTypesExpanded(nextRecord.leaveTypeName);
      await refreshCurrentDetail();
      ElMessage.success("请假单信息已保存");
    })
    .catch((error) => {
      console.log(error);
    });
};

const approvalFlow = computed(() => buildLeaveApprovalFlow(currentDetail.value));

</script>

<template>
  <div
    v-if="currentDetail?.leaveRequestId"
    class="leave-detail-content-wrap"
  >
    <div class="leave-detail-sidebar__header">
      <div>
        <div class="leave-detail-sidebar__title-line">
          <h2>请假详情</h2>
        </div>
        <p>{{ currentDetail.requestNo }}</p>
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
        <div class="detail-card__title">请假单信息</div>
        <div class="leave-detail-content">
          <div class="leave-info-table">
            <div class="leave-info-table__label">单据编号</div>
            <div>{{ currentDetail.requestNo }}</div>
            <div class="leave-info-table__label">单据状态</div>
            <div :class="['status-text', statusTextClass(currentDetail.requestStatus)]">
              {{ currentDetail.requestStatus }}
            </div>

            <div class="leave-info-table__label">姓名</div>
            <div>{{ currentDetail.talentName }}</div>
            <div class="leave-info-table__label">员工编码</div>
            <div>{{ currentDetail.talentCode }}</div>

            <div class="leave-info-table__label">所属组织</div>
            <div>{{ currentDetail.deptName }}</div>
            <div class="leave-info-table__label">申请日期</div>
            <div>{{ currentDetail.applyTime }}</div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">{{ leaveTypeSectionTitle }}</div>
            <div class="detail-leave-type-grid">
              <button
                v-for="item in displayLeaveTypeOptions"
                :key="item.key || item.label"
                type="button"
                class="detail-leave-type-card"
                :class="[
                  `detail-leave-type-card--${item.tone}`,
                  {
                    'detail-leave-type-card--selected':
                      item.key !== 'other' && selectedLeaveTypeName === item.label,
                    'detail-leave-type-card--readonly': !detailEditMode,
                    'detail-leave-type-card--expand': item.key === 'other',
                  },
                ]"
                @click="handleSelectDetailLeaveType(item)"
              >
                <div class="detail-leave-type-card__title">
                  <template v-if="item.key === 'other'">
                    其他假期<span class="detail-leave-type-card__arrow">>></span>
                  </template>
                  <template v-else>{{ formatLeaveTypeLabel(item.label) }}</template>
                </div>
                <div
                  v-if="item.showQuotaLine"
                  class="detail-leave-type-card__quota"
                >
                  <template v-if="item.showLastYear">
                    去年结余{{ Number(item.lastYear || 0).toFixed(1) }}/
                  </template>
                  今年剩余{{ Number(item.remaining || 0).toFixed(1) }}/在途{{ Number(item.frozenQuota || 0).toFixed(1) }}
                </div>
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
                    v-model="detailEditForm.startTime"
                    type="date"
                    value-format="YYYY-MM-DD"
                    size="small"
                    placeholder="请选择开始日期"
                  />
                  <el-select
                    v-model="detailEditForm.startTime2"
                    size="small"
                  >
                    <el-option
                      v-for="item in startTime2Options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <strong v-else>{{ formatLeaveTimeDisplay(currentDetail, false) }}</strong>
              </div>
              <div class="detail-time-split">至</div>
              <div class="detail-time-item">
                <span>结束时间</span>
                <div
                  v-if="detailEditMode"
                  class="detail-time-field"
                >
                  <el-date-picker
                    v-model="detailEditForm.endTime"
                    type="date"
                    value-format="YYYY-MM-DD"
                    size="small"
                    placeholder="请选择结束日期"
                  />
                  <el-select
                    v-model="detailEditForm.endTime2"
                    size="small"
                  >
                    <el-option
                      v-for="item in endTime2Options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <strong v-else>{{ formatLeaveTimeDisplay(currentDetail, true) }}</strong>
              </div>
              <div class="detail-duration-card">
                <span>请假时长</span>
                <strong v-if="detailEditMode">{{ detailDuration.toFixed(1) }} 天</strong>
                <strong v-else>
                  {{ currentDetail.leaveDuration }} {{ currentDetail.durationUnit }}
                </strong>
                <p
                  v-if="detailEditMode && !detailQuotaEnough && detailCalcMessage"
                  class="detail-duration-card__warning"
                >
                  {{ detailCalcMessage }}
                </p>
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
              {{ currentDetail.leaveReason }}
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section__title">附件信息</div>
            <el-upload
              v-if="detailEditMode"
              v-model:file-list="detailEditForm.attachmentFiles"
              class="detail-upload"
              action="#"
              accept="*/*"
              :http-request="uploadLeaveAttachment"
              :before-upload="beforeLeaveAttachmentUpload"
              :on-success="handleUploadSuccess"
              :on-preview="onPreview"
              :auto-upload="true"
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
                  :key="item.fileName || item.attachmentId || item"
                  class="attachment-tag"
                  @click="onPreview(item)"
                >
                  {{ item.fileName || item.attachmentId || item }}
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
</template>

<style scoped lang="scss">
.leave-detail-content-wrap {
  min-height: 100%;
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
  grid-template-columns: 120px minmax(0, 1fr) 120px minmax(0, 1fr);
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

.leave-detail-content :deep(.el-input),
.leave-detail-content :deep(.el-select),
.leave-detail-content :deep(.el-date-editor.el-input),
.leave-detail-content :deep(.el-input-number),
.leave-detail-content :deep(.el-textarea) {
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

.detail-leave-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.detail-leave-type-card {
  position: relative;
  width: 100%;
  min-height: 66px;
  padding: 8px 12px;
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

.detail-leave-type-card--expand {
  cursor: pointer;

  .detail-leave-type-card__arrow {
    margin-left: 2px;
    color: #77849a;
    font-weight: 400;
    letter-spacing: -1px;
  }
}

.detail-leave-type-card--readonly.detail-leave-type-card--expand:hover {
  border-color: #91b0f5;
  background: #f8faff;
}

.detail-leave-type-card:not(.detail-leave-type-card--readonly):hover {
  border-color: #91b0f5;
  background: #f8faff;
}

.detail-leave-type-card--selected {
  border-color: #4778ef;
  border-width: 2px;
  padding: 7px 11px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e8efff 100%);
  box-shadow:
    0 0 0 1px rgba(71, 120, 239, 0.28),
    0 6px 16px rgba(71, 120, 239, 0.18);

  &::after {
    content: "";
    position: absolute;
    top: 7px;
    right: 7px;
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
  font-size: 13px;
  font-weight: 600;
}

.detail-leave-type-card__quota {
  margin-top: 4px;
  color: #356fff;
  font-size: 11px;
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

.detail-time-item span,
.detail-duration-card span {
  display: block;
  margin-bottom: 8px;
  color: #6d7890;
  font-size: 12px;
}

.detail-time-item strong,
.detail-duration-card strong {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.detail-duration-card__warning {
  margin: 8px 0 0;
  color: #c45656;
  font-size: 12px;
  line-height: 1.6;
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
  grid-template-columns: minmax(0, 1fr) 150px;
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
  cursor: pointer;

  &:hover {
    border-color: #9cb8e8;
    background: #eef4ff;
  }
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

  .detail-leave-type-grid,
  .detail-time-panel {
    grid-template-columns: 1fr;
  }

  .detail-time-field {
    grid-template-columns: 1fr;
  }

  .detail-time-split {
    min-height: 24px;
  }
}
</style>
