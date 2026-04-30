<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import LeaveTypeCard from "./components/LeaveTypeCard.vue";
import LeaveTimelineDialog from "./components/LeaveTimelineDialog.vue";

const router = useRouter();

const employeeInfo = {
  name: "张员工",
  code: "EMP2026136",
  organization: "产品研发中心",
};

const leaveTypes = ref([
  {
    key: "annual",
    label: "法定年假",
    remaining: 6,
    transit: 1,
    currentYear: 5,
    lastYear: 1,
    quota: true,
    tone: "blue",
    description: "适用于年度休假安排，提交后同步占用可用年假余额。",
  },
  {
    key: "seniority",
    label: "司龄假",
    remaining: 3,
    transit: 0,
    currentYear: 2,
    lastYear: 1,
    quota: true,
    tone: "teal",
    description: "结合员工司龄发放，可按半天为单位申请。",
  },
  {
    key: "rest",
    label: "调休假",
    remaining: 2.5,
    transit: 0,
    quota: true,
    tone: "sky",
    description: "使用已审批通过的调休加班时长，少于 4 小时时不可申请。",
  },
  {
    key: "personal",
    label: "事假",
    remaining: 5,
    transit: 0,
    quota: true,
    tone: "orange",
    description: "用于个人事务处理，额度不足时不允许提交。",
  },
  {
    key: "sick",
    label: "病假",
    remaining: 8,
    transit: 0,
    quota: false,
    tone: "red",
    description: "病假申请需填写请假说明并可补充诊疗附件。",
  },
  {
    key: "other",
    label: "其他假期",
    remaining: 2,
    transit: 0,
    quota: false,
    tone: "purple",
    description: "承接特殊假期场景，原则阶段统一按固定额度展示。",
  },
]);

const records = ref([
  {
    billNo: "QJ202604025347",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    applyDate: "2026-04-02",
    leaveType: "法定年假",
    startTime: "2026-04-02 上午",
    endTime: "2026-04-02 下午",
    duration: 1,
    unit: "天",
    status: "审批中",
    approver: "李经理",
    reason: "家庭事务安排。",
    comment: "部门负责人审批中",
  },
  {
    billNo: "QJ202603181126",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    applyDate: "2026-03-18",
    leaveType: "病假",
    startTime: "2026-03-18 上午",
    endTime: "2026-03-19 下午",
    duration: 2,
    unit: "天",
    status: "已通过",
    approver: "王主管",
    reason: "身体不适就医。",
    comment: "审批通过",
  },
  {
    billNo: "QJ202603150823",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    applyDate: "2026-03-15",
    leaveType: "事假",
    startTime: "2026-03-15 上午",
    endTime: "2026-03-15 下午",
    duration: 1,
    unit: "天",
    status: "未提交",
    approver: "未提交",
    reason: "个人事务安排。",
    comment: "草稿暂未进入审批",
  },
]);

const form = reactive({
  billNo: `QJ${dayjs().format("YYYYMMDD")}5347`,
  applyDate: dayjs().format("YYYY-MM-DD"),
  applicant: employeeInfo.name,
  leaveTypeKey: "annual",
  otherType: "",
  startDate: "",
  startPeriod: "上午",
  endDate: "",
  endPeriod: "下午",
  reason: "",
});

const fileList = ref([]);
const editingBillNo = ref("");
const timelineDialogVisible = ref(false);

const periodOptions = ["上午", "下午"];
const otherTypeOptions = ["婚假", "丧假", "孕检假", "产假", "工伤假", "陪产假"];

const activeLeaveType = computed(() =>
  leaveTypes.value.find((item) => item.key === form.leaveTypeKey),
);

const selectedLeaveLabel = computed(() => {
  if (form.leaveTypeKey === "other" && form.otherType) {
    return form.otherType;
  }
  return activeLeaveType.value?.label || "";
});

const submittedCount = computed(
  () => records.value.filter((item) => item.status !== "未提交").length,
);

const lastLeaveTime = computed(() => records.value[0]?.startTime || "--");

const leaveDuration = computed(() => {
  if (!form.startDate || !form.endDate) {
    return 0;
  }

  const start = dayjs(form.startDate);
  const end = dayjs(form.endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
    return 0;
  }

  let days = end.diff(start, "day") + 1;
  if (form.startPeriod === "下午") {
    days -= 0.5;
  }
  if (form.endPeriod === "上午") {
    days -= 0.5;
  }
  return Math.max(days, 0.5);
});

const durationWarning = computed(() => {
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

const buildRecord = (status) => ({
  billNo: form.billNo,
  applicant: form.applicant,
  employeeCode: employeeInfo.code,
  applyDate: form.applyDate,
  leaveType: selectedLeaveLabel.value,
  startTime: `${dayjs(form.startDate).format("YYYY-MM-DD")} ${form.startPeriod}`,
  endTime: `${dayjs(form.endDate).format("YYYY-MM-DD")} ${form.endPeriod}`,
  duration: leaveDuration.value,
  unit: "天",
  status,
  approver: status === "未提交" ? "未提交" : "李经理",
  reason: form.reason,
  comment: status === "未提交" ? "草稿暂未进入审批" : "已提交，等待部门负责人审批",
});

const validateForm = (submit = false) => {
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
  form.leaveTypeKey = "annual";
  form.otherType = "";
  form.startDate = "";
  form.startPeriod = "上午";
  form.endDate = "";
  form.endPeriod = "下午";
  form.reason = "";
  fileList.value = [];
};

const upsertRecord = (record) => {
  const index = records.value.findIndex((item) => item.billNo === editingBillNo.value);
  if (index > -1) {
    records.value.splice(index, 1, record);
  } else {
    records.value.unshift(record);
  }
};

const handleSave = () => {
  if (!validateForm(false)) {
    return;
  }
  upsertRecord(buildRecord("未提交"));
  ElMessage.success("请假草稿已保存");
  resetForm();
};

const handleSubmit = () => {
  if (!validateForm(true)) {
    return;
  }
  ElMessageBox.confirm("确认提交当前请假申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const record = buildRecord("审批中");
    upsertRecord(record);
    if (activeLeaveType.value?.quota) {
      activeLeaveType.value.remaining = Number(
        Math.max(activeLeaveType.value.remaining - leaveDuration.value, 0).toFixed(1),
      );
      activeLeaveType.value.transit = Number(
        (activeLeaveType.value.transit + leaveDuration.value).toFixed(1),
      );
    }
    ElMessage.success("请假申请已提交审批");
    resetForm();
  });
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
                    v-for="item in leaveTypes"
                    :key="item.key"
                    :item="item"
                    :active="form.leaveTypeKey === item.key"
                    @select="form.leaveTypeKey = item.key"
                  />
                </div>
              </el-form-item>

              <el-form-item
                v-if="form.leaveTypeKey === 'other'"
                label="其他假期"
                required
              >
                <el-select
                  v-model="form.otherType"
                  placeholder="请选择其他假期类型"
                  class="compact-control"
                >
                  <el-option
                    v-for="item in otherTypeOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
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
                    <el-select v-model="form.startPeriod">
                      <el-option
                        v-for="item in periodOptions"
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
                    <el-select v-model="form.endPeriod">
                      <el-option
                        v-for="item in periodOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </div>
                </el-form-item>
              </div>

              <el-form-item label="请假时长">
                <div class="duration-box">
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
                  :auto-upload="false"
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

        <aside class="application-side">
          <section class="info-section">
            <div class="section-heading">单据信息</div>
            <div class="bill-table">
              <div>单据编号</div>
              <div>{{ form.billNo }}</div>
              <div>申请人</div>
              <div>{{ form.applicant }}</div>
              <div>申请日期</div>
              <div>{{ form.applyDate }}</div>
            </div>
          </section>
        </aside>
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
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 16px;
  margin-top: 14px;
  align-items: start;
}

.application-main,
.application-side {
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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

.upload-tip {
  color: #7a879c;
  font-size: 12px;
  line-height: 1.8;
}

.bill-table {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  padding: 18px;
}

.bill-table div {
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #e2e8f2;
  border-top: 0;
  color: #122448;
  font-size: 13px;
}

.bill-table div:nth-child(-n + 2) {
  border-top: 1px solid #e2e8f2;
}

.bill-table div:nth-child(odd) {
  background: #f2f5fa;
  font-weight: 600;
}

@media (max-width: 1400px) {
  .application-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }

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

  .bill-table {
    grid-template-columns: 110px minmax(0, 1fr);
  }
}
</style>
