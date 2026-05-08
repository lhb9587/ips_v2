<!-- 加班申请页，负责创建、保存和提交员工加班单。 -->
<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";

const router = useRouter();

const employeeInfo = {
  name: "张员工",
  code: "EMP2026136",
  organization: "产品研发中心",
  position: "Java后端开发工程师",
};

const records = ref([
  {
    billNo: "JB20260506001",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    organization: employeeInfo.organization,
    position: employeeInfo.position,
    applyDate: "2026-05-06",
    overtimeDate: "2026-05-05",
    startTimeOnly: "19:00",
    endTimeOnly: "22:00",
    startTime: "2026-05-05 19:00",
    endTime: "2026-05-05 22:00",
    breakMinutes: 30,
    overtimeHours: 2.5,
    overtimeReason: "项目上线",
    status: "审批中",
    approver: "李经理",
    source: "员工自助",
    remark: "处理版本发布窗口及上线巡检。",
    comment: "已提交，等待直属上级审批",
  },
  {
    billNo: "JB20260428002",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    organization: employeeInfo.organization,
    position: employeeInfo.position,
    applyDate: "2026-04-28",
    overtimeDate: "2026-04-27",
    startTimeOnly: "18:30",
    endTimeOnly: "21:30",
    startTime: "2026-04-27 18:30",
    endTime: "2026-04-27 21:30",
    breakMinutes: 0,
    overtimeHours: 3,
    overtimeReason: "客户支持",
    status: "已通过",
    approver: "王主管",
    source: "员工自助",
    remark: "配合客户完成夜间联调支持。",
    comment: "审批通过",
  },
  {
    billNo: "JB20260416003",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    organization: employeeInfo.organization,
    position: employeeInfo.position,
    applyDate: "2026-04-16",
    overtimeDate: "2026-04-16",
    startTimeOnly: "18:00",
    endTimeOnly: "20:00",
    startTime: "2026-04-16 18:00",
    endTime: "2026-04-16 20:00",
    breakMinutes: 0,
    overtimeHours: 2,
    overtimeReason: "其他原因",
    status: "未提交",
    approver: "未提交",
    source: "员工自助",
    remark: "整理阶段性方案并补充交付材料。",
    comment: "草稿暂未进入审批",
  },
]);

const form = reactive({
  billNo: `JB${dayjs().format("YYYYMMDD")}0001`,
  applyDate: dayjs().format("YYYY-MM-DD"),
  applicant: employeeInfo.name,
  overtimeDate: "",
  startTime: "",
  endTime: "",
  breakMinutes: 0,
  overtimeReason: "",
  remark: "",
});

const computedOvertimeHours = computed(() => {
  if (!form.startTime || !form.endTime) {
    return 0;
  }
  const start = dayjs(`2000-01-01 ${form.startTime}`);
  let end = dayjs(`2000-01-01 ${form.endTime}`);
  if (!start.isValid() || !end.isValid()) {
    return 0;
  }
  if (end.isBefore(start)) {
    end = end.add(1, "day");
  }
  const durationMinutes = end.diff(start, "minute") - Number(form.breakMinutes || 0);
  if (durationMinutes <= 0) {
    return 0;
  }
  return Number((durationMinutes / 60).toFixed(1));
});

const durationHint = computed(() => {
  if (!form.startTime || !form.endTime) {
    return "请选择加班开始和结束时间，系统将自动计算申请加班小时数。";
  }
  if (computedOvertimeHours.value <= 0) {
    return "休息时长不能大于等于加班时段总时长，请调整后再提交。";
  }
  return "审批通过后按 1:1 生成调休假，未使用额度 3 个月后失效。";
});

const buildRecord = (status) => ({
  billNo: form.billNo,
  applicant: form.applicant,
  employeeCode: employeeInfo.code,
  organization: employeeInfo.organization,
  position: employeeInfo.position,
  applyDate: form.applyDate,
  overtimeDate: form.overtimeDate,
  startTimeOnly: form.startTime,
  endTimeOnly: form.endTime,
  startTime: `${form.overtimeDate} ${form.startTime}`,
  endTime: `${form.overtimeDate} ${form.endTime}`,
  breakMinutes: Number(form.breakMinutes || 0),
  overtimeHours: computedOvertimeHours.value,
  overtimeReason: form.overtimeReason,
  status,
  approver: status === "未提交" ? "未提交" : "李经理",
  source: "员工自助",
  remark: form.remark,
  comment: status === "未提交" ? "草稿暂未进入审批" : "已提交，等待直属上级审批",
});

const resetForm = () => {
  form.billNo = `JB${dayjs().format("YYYYMMDD")}${String(Date.now()).slice(-4)}`;
  form.applyDate = dayjs().format("YYYY-MM-DD");
  form.overtimeDate = "";
  form.startTime = "";
  form.endTime = "";
  form.breakMinutes = 0;
  form.overtimeReason = "";
  form.remark = "";
};

const validateForm = () => {
  if (!form.overtimeDate) {
    ElMessage.warning("请选择加班日期");
    return false;
  }
  if (!form.startTime || !form.endTime) {
    ElMessage.warning("请填写加班开始和结束时间");
    return false;
  }
  if (computedOvertimeHours.value <= 0) {
    ElMessage.warning("申请加班小时数需大于 0");
    return false;
  }
  if (!form.overtimeReason.trim()) {
    ElMessage.warning("请填写加班原因");
    return false;
  }
  if (!form.remark.trim()) {
    ElMessage.warning("请填写备注说明");
    return false;
  }
  return true;
};

const handleSave = () => {
  if (!validateForm()) {
    return;
  }
  records.value.unshift(buildRecord("未提交"));
  ElMessage.success("加班草稿已保存");
  resetForm();
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  ElMessageBox.confirm("确认提交当前加班申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    records.value.unshift(buildRecord("审批中"));
    ElMessage.success("加班申请已提交审批");
    resetForm();
  });
};

const handleOpenList = () => {
  router.push({ name: "my-overtime-list" });
};

</script>

<template>
  <Layout>
    <div class="overtime-application-page">
      <div class="page-toolbar">
        <div>
          <h2>我要加班</h2>
          <p>按需求原型展示加班申请创建、保存、提交、列表查看与套打输出链路。</p>
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
            @click="handleOpenList"
          >
            加班列表
          </el-button>
        </div>
      </div>

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
              <div class="readonly-cell readonly-cell--label">职位</div>
              <div class="readonly-cell  readonly-cell--wrap">
                {{ employeeInfo.position }}
              </div>
            </div>
          </section>

          <section class="info-section">
            <div class="section-heading">加班信息</div>
            <el-form
              label-width="110px"
              label-position="left"
              class="overtime-form"
            >
              <div class="time-row">
                <el-form-item
                  label="加班日期"
                  required
                >
                  <el-date-picker
                    v-model="form.overtimeDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择加班日期"
                  />
                </el-form-item>
                <el-form-item label="休息时长（分）">
                  <el-input-number
                    v-model="form.breakMinutes"
                    :min="0"
                    :step="30"
                    controls-position="right"
                  />
                </el-form-item>
              </div>

              <div class="time-row">
                <el-form-item
                  label="开始时间"
                  required
                >
                  <el-time-picker
                    v-model="form.startTime"
                    value-format="HH:mm"
                    format="HH:mm"
                    placeholder="请选择开始时间"
                  />
                </el-form-item>
                <el-form-item
                  label="结束时间"
                  required
                >
                  <el-time-picker
                    v-model="form.endTime"
                    value-format="HH:mm"
                    format="HH:mm"
                    placeholder="请选择结束时间"
                  />
                </el-form-item>
              </div>

              <el-form-item label="申请加班小时数">
                <div class="duration-box">
                  <strong>{{ computedOvertimeHours.toFixed(1) }} 小时</strong>
                  <span>{{ durationHint }}</span>
                </div>
              </el-form-item>

              <el-form-item
                label="加班原因"
                required
              >
                <el-input
                  v-model="form.overtimeReason"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写加班原因，例如项目上线、紧急交付、客户支持等"
                />
              </el-form-item>

              <el-form-item
                label="备注"
                required
              >
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写加班事项说明、工作内容或交接安排"
                />
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
          <section class="info-section tip-section">
            <div class="section-heading">规则提示</div>
            <div class="tip-list">
              <div>1. 审批通过后按加班时长与调休时长 1:1 生成调休假。</div>
              <div>2. 未使用的调休假自生成之日起 3 个月后失效。</div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
:deep(.page-content) {
  padding-top: calc(50px + 16px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f4f6fb;
}

.overtime-application-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.page-toolbar,
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
  grid-template-columns: 120px minmax(0, 1fr) 160px minmax(0, 1fr);
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

.readonly-cell:nth-child(4n + 1) {
  border-left: 1px solid #e2e8f2;
}

.readonly-cell--label {
  background: #f2f5fa;
  font-weight: 600;
}

.readonly-cell--span {
  grid-column: span 3;
}

.readonly-cell--wrap {
  min-height: 34px;
  line-height: 1.6;
  white-space: nowrap;
  word-break: keep-all;
  overflow-wrap: normal;
}

.overtime-form {
  padding: 18px;
}

.overtime-form :deep(.el-input),
.overtime-form :deep(.el-select),
.overtime-form :deep(.el-date-editor.el-input),
.overtime-form :deep(.el-time-editor.el-input),
.overtime-form :deep(.el-input-number),
.overtime-form :deep(.el-textarea) {
  width: 100%;
}

.time-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
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
  line-height: 1.7;
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

.tip-list {
  display: grid;
  gap: 10px;
  padding: 18px;
  color: #586881;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1400px) {
  .application-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
}

@media (max-width: 1200px) {
  .application-layout,
  .time-row {
    grid-template-columns: 1fr;
  }

  .readonly-grid {
    grid-template-columns: 120px minmax(0, 1fr);
  }

  .readonly-cell--span {
    grid-column: span 1;
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

  .bill-table {
    grid-template-columns: 110px minmax(0, 1fr);
  }
}
</style>
