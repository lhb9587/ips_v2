<!-- 请假详情内容组件，用于展示和处理请假单详情信息。 -->
<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

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
});

const emit = defineEmits(["back", "close", "update-detail", "delete-detail"]);

const detailEditMode = ref(false);
const detailEditForm = ref({});
const currentDetail = ref({});

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
    description: "承接特殊假期场景，原则阶段统一按固定额度展示。",
    tone: "purple",
  },
];

watch(
  () => props.detailInfo,
  (detail) => {
    currentDetail.value = detail ? { ...detail } : {};
    detailEditMode.value = false;
    detailEditForm.value = {};
  },
  { immediate: true, deep: true },
);

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

const normalizeAttachmentFiles = (files) => {
  return (files || [])
    .map((item) => item.name)
    .filter(Boolean);
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
  if (!currentDetail.value?.billNo) {
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

const handleSaveDetail = () => {
  if (!currentDetail.value?.billNo) {
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

  const updatedRecord = {
    ...currentDetail.value,
    leaveType: detailEditForm.value.leaveType,
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
    reason: detailEditForm.value.reason,
    attachments: normalizeAttachmentFiles(detailEditForm.value.attachmentFiles),
  };
  currentDetail.value = { ...updatedRecord };
  detailEditMode.value = false;
  detailEditForm.value = {};
  emit("update-detail", updatedRecord);
  ElMessage.success("请假单信息已保存");
};

const handleDiscardDetail = () => {
  if (!currentDetail.value?.billNo) {
    return;
  }
  ElMessageBox.confirm(
    "确定要废弃当前请假单吗？废弃后该单据将不再进入审批流程。",
    "废弃确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      const updatedRecord = {
        ...currentDetail.value,
        status: "已废弃",
        approver: "无需审批",
        comment: "申请人已废弃该请假单",
      };
      currentDetail.value = { ...updatedRecord };
      detailEditMode.value = false;
      emit("update-detail", updatedRecord);
      ElMessage.success("请假单已废弃");
    })
    .catch(() => {});
};

const handleDeleteDetail = () => {
  if (!currentDetail.value?.billNo) {
    return;
  }
  ElMessageBox.confirm("确定要删除当前请假单吗？删除后不可恢复。", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      emit("delete-detail", currentDetail.value);
      ElMessage.success("请假单已删除");
    })
    .catch(() => {});
};

const approvalFlow = computed(() => {
  if (!currentDetail.value?.billNo) {
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
</script>

<template>
  <div
    v-if="currentDetail?.billNo"
    class="leave-detail-content-wrap"
  >
    <div class="leave-detail-sidebar__header">
      <div>
        <div class="leave-detail-sidebar__title-line">
          <h2>请假详情</h2>
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
          <el-button
            v-if="showBack"
            @click="emit('back')"
          >
            返回请假列表
          </el-button>
        </template>
        <el-button
          v-if="showClose"
          @click="emit('close')"
        >
          关闭
        </el-button>
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
                      (detailEditMode
                        ? detailEditForm.leaveType
                        : currentDetail.leaveType) === item.label,
                    'detail-leave-type-card--readonly': !detailEditMode,
                  },
                ]"
                @click="handleSelectDetailLeaveType(item)"
              >
                <div class="detail-leave-type-card__title">{{ item.label }}</div>
                <div class="detail-leave-type-card__quota">
                  剩余 {{ item.remaining.toFixed(1) }} / 在途
                  {{ item.transit.toFixed(1) }}
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
                <strong v-else>
                  {{ currentDetail.duration }} {{ currentDetail.unit }}
                </strong>
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
}

.detail-leave-type-card {
  width: 100%;
  min-height: 92px;
  padding: 11px 13px;
  border: 1px solid #d8e2f1;
  border-left-width: 4px;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.detail-leave-type-card--readonly {
  cursor: default;
}

.detail-leave-type-card--selected {
  border-color: #4778ef;
  box-shadow: 0 8px 18px rgba(61, 105, 210, 0.12);
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

  .detail-leave-type-grid,
  .detail-time-panel {
    grid-template-columns: 1fr;
  }

  .detail-time-split {
    min-height: 24px;
  }
}
</style>
