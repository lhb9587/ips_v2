<!-- 请假申请页，负责创建、保存和提交员工请假单。 -->
<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import {
  queryLeaveRequestSelfCalcDuration,
  queryLeaveRequestSelfInit,
  saveLeaveRequestSelf,
} from "@/api/attendance";
import {
  beforeLeaveAttachmentUpload,
  handleLeaveAttachmentUploadSuccess,
  uploadLeaveAttachment,
} from "@/views/hrm/my-attendance/utils/leaveAttachmentUpload";
import { getUserInfo } from "@/utils/user";
import LeaveTypeCard from "./components/LeaveTypeCard.vue";
import LeaveTimelineDialog from "./components/LeaveTimelineDialog.vue";

const router = useRouter();

const employeeInfo = reactive({
  name: "",
  code: "",
  organization: "",
});

const leaveTypes = ref([]);

const records = ref([]);

const form = reactive({
  billNo: `QJ${dayjs().format("YYYYMMDD")}${String(Date.now()).slice(-4)}`,
  applyDate: dayjs().format("YYYY-MM-DD"),
  applicant: employeeInfo.name,
  leaveTypeKey: "",
  otherType: "",
  startDate: "",
  startPeriod: "上午 9:00",
  endDate: "",
  endPeriod: "下午 18:00",
  reason: "",
});

const fileList = ref([]);
const editingBillNo = ref("");
const timelineDialogVisible = ref(false);

const startPeriodOptions = ["上午 9:00", "下午 14:00"];
const endPeriodOptions = ["上午 14:00", "下午 18:00"];
const defaultLeaveTypeNames = ["法定年假", "司龄假", "事假", "病假"];
const otherTypeOptions = ref([]);

const tonePool = ["blue", "teal", "sky", "orange", "red", "purple"];

const fetchLeaveApplicationInit = async () => {
  try {
    const userInfo = getUserInfo?.() || {};
    employeeInfo.name = userInfo?.userName || userInfo?.name || employeeInfo.name;
    employeeInfo.code =
      userInfo?.talentCode || userInfo?.empCode || userInfo?.code || employeeInfo.code;
    employeeInfo.organization =
      userInfo?.deptName ||
      userInfo?.organizationName ||
      userInfo?.organization ||
      employeeInfo.organization;

    form.applicant = employeeInfo.name;

    const res = await queryLeaveRequestSelfInit({}, { isLoading: false });
    const data = res?.data || {};
    const employee = data?.employee || {};
    const list = data?.leaveTypes || [];

    employeeInfo.name = employee?.talentName || employeeInfo.name;
    employeeInfo.code = employee?.talentCode || employeeInfo.code;
    employeeInfo.organization = employee?.deptName || employeeInfo.organization;
    form.applicant = employeeInfo.name;
    if (data?.applyDate) {
      form.applyDate = dayjs(data.applyDate).format("YYYY-MM-DD");
    }
    if (!Array.isArray(list) || list.length === 0) {
      return;
    }

    const mappedAll = list.map((item, index) => {
        const isNoQuota = item?.isNoQuota ?? item?.noQuota ?? false;
        const quota = !isNoQuota;
        const label = item?.leaveTypeName || "";
        const showLastYear = !isNoQuota && ["法定年假", "司龄假"].includes(label);
        return {
          key: item?.leaveTypeCode,
          label,
          remaining: Number(item?.remainQuota ?? item?.remainingQuota ?? item?.remaining ?? item?.availableQuota ?? 0),
          frozenQuota: Number(item?.frozenQuota ?? item?.transit ?? 0),
          lastYear: Number(item?.lastYearCarryForwardQuota ?? item?.lastYearQuota ?? item?.lastYear ?? 0),
          quota,
          isNoQuota,
          showQuotaLine: !isNoQuota,
          showLastYear,
          tone: tonePool[index % tonePool.length],
        };
      });

    const primaryLeaveTypes = mappedAll.filter((item) => defaultLeaveTypeNames.includes(item.label));
    const extraLeaveTypes = mappedAll.filter((item) => !defaultLeaveTypeNames.includes(item.label));
    otherTypeOptions.value = extraLeaveTypes;

    leaveTypes.value = [
      ...primaryLeaveTypes,
      {
        key: "other",
        label: "其他假期",
        remaining: 0,
        frozenQuota: 0,
        quota: false,
        isNoQuota: true,
        showQuotaLine: false,
        showLastYear: false,
        tone: "purple",
      },
    ];

    if (!leaveTypes.value.some((item) => item.key === form.leaveTypeKey)) {
      form.leaveTypeKey = leaveTypes.value[0]?.key || form.leaveTypeKey;
    }
  } catch (error) {
    ElMessage.warning("初始化数据获取失败");
  }
};

const displayLeaveTypes = computed(() => {
  if (form.leaveTypeKey === "other") {
    return leaveTypes.value.filter((item) => item.key !== "other");
  }
  return leaveTypes.value.filter(
    (item) => item.key === "other" || defaultLeaveTypeNames.includes(item.label),
  );
});

const otherLeaveTypeCards = computed(() =>
  otherTypeOptions.value.map((item, index) => ({
    ...item,
    tone: item.tone || tonePool[index % tonePool.length],
  })),
);

onMounted(() => {
  fetchLeaveApplicationInit();
});

const activeLeaveType = computed(() =>
  leaveTypes.value.find((item) => item.key === form.leaveTypeKey),
);

const selectedLeaveLabel = computed(() => {
  if (form.leaveTypeKey === "other" && form.otherType) {
    const selected = otherLeaveTypeCards.value.find((item) => item.key === form.otherType);
    return selected?.label || "";
  }
  return activeLeaveType.value?.label || "";
});

const handleLeaveTypeSelect = (item) => {
  form.leaveTypeKey = item.key;
  if (item.key !== "other") {
    form.otherType = "";
  }
};

const submittedCount = computed(
  () => records.value.filter((item) => item.status !== "未提交").length,
);

const lastLeaveTime = computed(() => records.value[0]?.startTime || "--");

const leaveDuration = ref(0);
const quotaEnough = ref(true);
const calcDurationMessage = ref("");
const lastCalcWarningMessage = ref("");

const resolveSelectedLeaveTypeCode = () =>
  form.leaveTypeKey === "other" ? form.otherType : form.leaveTypeKey;

const buildDateTime = (date, period, fallback) => {
  const time = period?.includes("14:00")
    ? "14:00:00"
    : period?.includes("18:00")
      ? "18:00:00"
      : period?.includes("9:00")
        ? "09:00:00"
        : fallback;
  return `${date} ${time}`;
};

const resetCalcDurationState = () => {
  leaveDuration.value = 0;
  quotaEnough.value = true;
  calcDurationMessage.value = "";
  lastCalcWarningMessage.value = "";
};

const calcLeaveDuration = async () => {
  const leaveTypeCode = resolveSelectedLeaveTypeCode();
  if (!leaveTypeCode || !form.startDate || !form.endDate) {
    resetCalcDurationState();
    return;
  }

  const startTime = buildDateTime(form.startDate, form.startPeriod, "09:00:00");
  const endTime = buildDateTime(form.endDate, form.endPeriod, "18:00:00");
  if (dayjs(endTime).isBefore(dayjs(startTime))) {
    resetCalcDurationState();
    return;
  }

  try {
    const res = await queryLeaveRequestSelfCalcDuration(
      {
        leaveTypeCode,
        startTime,
        endTime,
      },
      { isLoading: false },
    );
    const data = res?.data || {};
    leaveDuration.value = Number(data.duration || 0);
    quotaEnough.value = data.quotaEnough !== false;
    calcDurationMessage.value = data.message || "";
    if (!quotaEnough.value && calcDurationMessage.value) {
      if (calcDurationMessage.value !== lastCalcWarningMessage.value) {
        ElMessage.warning(calcDurationMessage.value);
        lastCalcWarningMessage.value = calcDurationMessage.value;
      }
    } else {
      lastCalcWarningMessage.value = "";
    }
  } catch (error) {
    resetCalcDurationState();
  }
};

watch(
  () => [
    form.leaveTypeKey,
    form.otherType,
    form.startDate,
    form.startPeriod,
    form.endDate,
    form.endPeriod,
  ],
  () => {
    calcLeaveDuration();
  },
  { immediate: true },
);

const durationWarning = computed(() => {
  if (!quotaEnough.value && calcDurationMessage.value) {
    return calcDurationMessage.value;
  }

  if (!activeLeaveType.value || !leaveDuration.value) {
    return "请选择假期类型并填写起止时间，系统将自动计算请假长度。";
  }

  if (activeLeaveType.value.key === "rest" && leaveDuration.value < 0.5) {
    return "调休假最小可请 4 小时，对应 0.5 天。";
  }

  if (
    activeLeaveType.value.quota &&
    leaveDuration.value > activeLeaveType.value.remaining
  ) {
    return "当前请假长度已超过该假期剩余额度，提交前需要调整。";
  }

  return "请假长度将随开始、结束日期和时段自动更新。";
});

const validateForm = (submit = false) => {
  if (!leaveTypes.value.length) {
    ElMessage.warning("请假类型加载中，请稍后重试");
    return false;
  }
  if (!form.leaveTypeKey) {
    ElMessage.warning("请选择假期类型");
    return false;
  }
  if (form.leaveTypeKey === "other" && !form.otherType) {
    ElMessage.warning("请选择其他假期类型");
    return false;
  }
  if (!form.startDate || !form.endDate) {
    ElMessage.warning("请选择请假开始和结束日期");
    return false;
  }
  if (dayjs(form.endDate).isBefore(dayjs(form.startDate), "day")) {
    ElMessage.warning("结束日期不能早于开始日期");
    return false;
  }
  if (!form.reason.trim()) {
    ElMessage.warning("请填写请假说明");
    return false;
  }
  if (!quotaEnough.value) {
    ElMessage.warning(calcDurationMessage.value || "当前请假无法申请，请调整假期类型或起止时间");
    return false;
  }
  if (
    submit &&
    activeLeaveType.value?.quota &&
    leaveDuration.value > activeLeaveType.value.remaining
  ) {
    ElMessage.warning("请假天数不能超过对应假期剩余天数");
    return false;
  }
  if (
    submit &&
    ["病假", "孕检假"].includes(selectedLeaveLabel.value) &&
    fileList.value.length === 0
  ) {
    ElMessage.warning("病假或孕检假提交前请至少上传 1 份附件");
    return false;
  }
  return true;
};

const resetForm = () => {
  editingBillNo.value = "";
  form.billNo = `QJ${dayjs().format("YYYYMMDD")}${String(Date.now()).slice(-4)}`;
  form.applyDate = dayjs().format("YYYY-MM-DD");
  form.leaveTypeKey = leaveTypes.value[0]?.key || "";
  form.otherType = "";
  form.startDate = "";
  form.startPeriod = "上午 9:00";
  form.endDate = "";
  form.endPeriod = "下午 18:00";
  form.reason = "";
  fileList.value = [];
};

const submitLeaveRequest = async (actionType) => {
  const leaveTypeCode = resolveSelectedLeaveTypeCode();
  const startTime = buildDateTime(form.startDate, form.startPeriod, "09:00:00");
  const endTime = buildDateTime(form.endDate, form.endPeriod, "18:00:00");
  const attachmentIds = fileList.value
    .map(
      (item) =>
        item?.response?.data?.attachmentId ||
        item?.response?.attachmentId ||
        item?.attachmentId ||
        item?.id,
    )
    .filter((id) => id !== undefined && id !== null && id !== "");

  const payload = {
    requestId: editingBillNo.value || undefined,
    leaveTypeCode,
    startTime,
    endTime,
    reason: form.reason,
    actionType,
    // 附件ID，逗号分隔，如 1001,1002
    attachmentIds: attachmentIds.length ? attachmentIds.join(",") : undefined,
  };

  await saveLeaveRequestSelf(payload);
  resetForm();
};

const hasUploadingFiles = computed(() =>
  (fileList.value || []).some((item) => item?.status === "uploading"),
);

const handleUploadSuccess = handleLeaveAttachmentUploadSuccess;

const handleSave = async () => {
  if (!validateForm(false)) {
    return;
  }
  if (hasUploadingFiles.value) {
    ElMessage.warning("附件上传中，请稍后再保存");
    return;
  }
  try {
    await submitLeaveRequest("save");
    ElMessage.success("请假草稿已保存");
    goLeaveList();
  } catch (error) {
    console.log(error);
  }
};

const handleSubmit = () => {
  if (!validateForm(true)) {
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
        await submitLeaveRequest("submit");
        ElMessage.success("请假申请已提交审批");
        goLeaveList();
      } catch (error) {
        console.log(error);
      }
    })
    .catch(() => {});
};

const goLeaveList = () => {
  router.push({ name: "my-leave-list" });
};

const openTimelineDialog = () => {
  timelineDialogVisible.value = true;
};
</script>

<template>
  <Layout>
    <div class="leave-application-page">
      <div class="page-toolbar">
        <div>
          <h2>我要请假</h2>
          <p>按需求原型展示请假创建、保存、提交与记录查看链路。</p>
        </div>
        <div class="page-toolbar__actions">
          <el-button @click="handleSave">保存</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
          >
            提交
          </el-button>
          <el-button
            type="success"
            plain
            @click="goLeaveList"
          >
            请假列表
          </el-button>
        </div>
      </div>

      <section class="notice-panel">
        <div class="notice-card">
          <span>本月已提交请假申请次数</span>
          <strong>{{ submittedCount }} 次</strong>
        </div>
        <div class="notice-card">
          <span>上一次请假时间</span>
          <strong>{{ lastLeaveTime }}</strong>
        </div>
        <div class="notice-card notice-card--link">
          <span>查看更多请假记录</span>
          <button
            type="button"
            @click="openTimelineDialog"
          >
            打开年度时间轴
          </button>
        </div>
      </section>

      <div class="application-layout">
        <main class="application-main">
          <section class="info-section">
            <div class="section-heading">基础信息</div>
            <div class="readonly-grid">
              <div class="readonly-cell readonly-cell--label">姓名</div>
              <div class="readonly-cell">{{ employeeInfo.name }}</div>
              <div class="readonly-cell readonly-cell--label">员工编码</div>
              <div class="readonly-cell">{{ employeeInfo.code }}</div>
              <div class="readonly-cell readonly-cell--label">所属组织</div>
              <div class="readonly-cell">{{ employeeInfo.organization }}</div>
            </div>
          </section>

          <section class="info-section leave-form-section">
            <div class="section-heading">请假信息</div>
            <el-form
              label-width="92px"
              label-position="left"
            >
              <el-form-item
                label="假期类型"
                required
              >
                <div class="leave-type-grid">
                  <LeaveTypeCard
                    v-for="item in displayLeaveTypes"
                    :key="item.key"
                    :item="item"
                    :active="form.leaveTypeKey === item.key"
                    @select="handleLeaveTypeSelect"
                  />

                  <template v-if="form.leaveTypeKey === 'other'">
                    <LeaveTypeCard
                      v-for="item in otherLeaveTypeCards"
                      :key="`other-${item.key}`"
                      :item="item"
                      :active="form.otherType === item.key"
                      @select="form.otherType = item.key"
                    />
                  </template>
                </div>
              </el-form-item>

              <div class="time-row">
                <el-form-item
                  label="开始时间"
                  required
                >
                  <div class="time-control">
                    <el-date-picker
                      v-model="form.startDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择开始日期"
                    />
                    <el-select
                      v-model="form.startPeriod"
                    >
                      <el-option
                        v-for="item in startPeriodOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </div>
                </el-form-item>
                <el-form-item
                  label="结束时间"
                  required
                >
                  <div class="time-control">
                    <el-date-picker
                      v-model="form.endDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择结束日期"
                    />
                    <el-select
                      v-model="form.endPeriod"
                    >
                      <el-option
                        v-for="item in endPeriodOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </div>
                </el-form-item>
              </div>

              <el-form-item label="请假时长">
                <div
                  class="duration-box"
                  :class="{ 'duration-box--error': !quotaEnough }"
                >
                  <strong>{{ leaveDuration.toFixed(1) }} 天</strong>
                  <span>{{ durationWarning }}</span>
                </div>
              </el-form-item>

              <el-form-item
                label="请假说明"
                required
              >
                <el-input
                  v-model="form.reason"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写请假原因、工作交接或其他需要说明的信息"
                />
              </el-form-item>

              <el-form-item label="附件">
                <el-upload
                  v-model:file-list="fileList"
                  action="#"
                  accept="*/*"
                  :http-request="uploadLeaveAttachment"
                  :before-upload="beforeLeaveAttachmentUpload"
                  :on-success="handleUploadSuccess"
                  :auto-upload="true"
                  multiple
                >
                  <el-button>上传附件</el-button>
                  <template #tip>
                    <div class="upload-tip">
                      病假、孕检假提交时至少上传 1 份附件，保存草稿可暂不上传。
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </section>
        </main>
      </div>

      <LeaveTimelineDialog
        v-model="timelineDialogVisible"
        :records="records"
      />
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.page-content) {
  padding-top: calc(50px + 16px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f4f6fb;
}

.leave-application-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.page-toolbar,
.notice-panel,
.info-section {
  border: 1px solid #dce5f1;
  border-radius: 4px;
  background: #fff;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.page-toolbar h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.page-toolbar p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.page-toolbar__actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.notice-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
  padding: 16px;
}

.notice-card {
  min-height: 76px;
  padding: 16px;
  border: 1px solid #d7e1ef;
  border-radius: 8px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef3fb 100%);
}

.notice-card span {
  display: block;
  color: #536783;
  font-size: 13px;
}

.notice-card strong {
  display: block;
  margin-top: 10px;
  color: #092247;
  font-size: 20px;
  line-height: 1;
}

.notice-card--link {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notice-card--link button {
  border: 0;
  background: transparent;
  color: #4679f5;
  cursor: pointer;
}

.application-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  margin-top: 14px;
  align-items: start;
}

.application-main {
  display: grid;
  gap: 14px;
}

.section-heading {
  padding: 16px 18px;
  border-bottom: 1px solid #dce5f1;
  color: #122448;
  font-size: 15px;
  font-weight: 600;
}

.readonly-grid {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 180px minmax(0, 1.4fr) 180px minmax(0, 1.3fr);
  padding: 18px;
}

.readonly-cell {
  min-height: 34px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #e2e8f2;
  border-left: 0;
  color: #122448;
  font-size: 13px;
}

.readonly-cell:first-child {
  border-left: 1px solid #e2e8f2;
}

.readonly-cell--label {
  background: #f2f5fa;
  font-weight: 600;
}

.leave-form-section :deep(.el-form) {
  padding: 18px;
}

.leave-type-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.compact-control {
  width: 280px;
}

.time-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
}

.time-control {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 10px;
}

.time-control :deep(.el-date-editor.el-input),
.time-control :deep(.el-select) {
  width: 100%;
}

.duration-box {
  width: 100%;
  min-height: 80px;
  padding: 14px 16px;
  border: 1px solid #f3c574;
  border-radius: 8px;
  background: #fff7e9;
}

.duration-box strong {
  display: block;
  color: #bf5b0c;
  font-size: 22px;
  line-height: 1.2;
}

.duration-box span {
  display: block;
  margin-top: 10px;
  color: #9b5e1e;
  font-size: 12px;
}

.duration-box--error {
  border-color: #f5b5b5;
  background: #fff5f5;
}

.duration-box--error strong {
  color: #c45656;
}

.duration-box--error span {
  color: #c45656;
}

.upload-tip {
  color: #7a879c;
  font-size: 12px;
  line-height: 1.8;
}

@media (max-width: 1400px) {
  .readonly-grid {
    grid-template-columns: 110px minmax(0, 1fr) 130px minmax(0, 1fr) 130px minmax(0, 1fr);
  }
}

@media (max-width: 1200px) {
  .application-layout,
  .time-row,
  .notice-panel {
    grid-template-columns: 1fr;
  }

  .readonly-grid {
    grid-template-columns: 120px minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-right: 12px !important;
    padding-left: 12px !important;
  }

  .page-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-toolbar__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .leave-type-grid,
  .time-control {
    grid-template-columns: 1fr;
  }

}
</style>
