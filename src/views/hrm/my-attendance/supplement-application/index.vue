<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Layout from "@/layouts/main";

const router = useRouter();

const storageKey = "mySupplementCardRecords";

const employeeInfo = {
  name: "张员工",
  code: "EMP2026136",
  position: "Java后端开发工程师",
  organization: "产品研发中心",
};

const supplementTypes = ["上班补签", "下班补签", "外出补签", "其他补签"];
const supplementReasons = [
  "忘记打卡",
  "外出公干",
  "参加公司团建",
  "体育活动",
];

const defaultRecords = [
  {
    billNo: "BQ202604025347",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    position: employeeInfo.position,
    organization: employeeInfo.organization,
    applyDate: "2026-04-02",
    status: "审批中",
    approver: "李经理",
    approvalComment: "部门负责人审批中",
    items: [
      {
        attendanceDate: "2026-04-02",
        timePoint: "09:00",
        type: "上班补签",
        reason: "忘记打卡",
        remark: "早会开始前到岗，忘记刷卡。",
      },
    ],
  },
  {
    billNo: "BQ202603181126",
    applicant: employeeInfo.name,
    employeeCode: employeeInfo.code,
    position: employeeInfo.position,
    organization: employeeInfo.organization,
    applyDate: "2026-03-18",
    status: "已通过",
    approver: "王主管",
    approvalComment: "审批通过",
    items: [
      {
        attendanceDate: "2026-03-18",
        timePoint: "18:00",
        type: "下班补签",
        reason: "外出公干",
        remark: "客户现场沟通后直接下班。",
      },
    ],
  },
];

const readRecords = () => {
  const storedRecords = localStorage.getItem(storageKey);
  if (!storedRecords) {
    return [...defaultRecords];
  }
  try {
    const records = JSON.parse(storedRecords);
    return Array.isArray(records) && records.length ? records : [...defaultRecords];
  } catch (error) {
    return [...defaultRecords];
  }
};

const records = ref(readRecords());

const form = reactive({
  billNo: `BQ${dayjs().format("YYYYMMDD")}${String(Date.now()).slice(-4)}`,
  applyDate: dayjs().format("YYYY-MM-DD"),
  applicant: employeeInfo.name,
  items: [
    {
      attendanceDate: "",
      timePoint: "",
      type: "",
      reason: "",
      remark: "",
    },
  ],
});

const currentItemSummary = computed(() => {
  const filledItems = form.items.filter(
    (item) => item.attendanceDate || item.timePoint || item.type || item.reason,
  );
  if (!filledItems.length) {
    return "请先填写至少一条补签卡信息。";
  }
  return `当前已录入 ${filledItems.length} 条补签卡信息，提交后进入审批流程。`;
});

const persistRecords = () => {
  localStorage.setItem(storageKey, JSON.stringify(records.value));
};

const createEmptyItem = () => ({
  attendanceDate: "",
  timePoint: "",
  type: "",
  reason: "",
  remark: "",
});

const addSupplementItem = () => {
  form.items.push(createEmptyItem());
};

const removeSupplementItem = (index) => {
  if (form.items.length === 1) {
    ElMessage.warning("至少保留一条补签卡信息");
    return;
  }
  form.items.splice(index, 1);
};

const buildRecord = (status) => ({
  billNo: form.billNo,
  applicant: form.applicant,
  employeeCode: employeeInfo.code,
  position: employeeInfo.position,
  organization: employeeInfo.organization,
  applyDate: form.applyDate,
  status,
  approver: status === "未提交" ? "未提交" : "李经理",
  approvalComment: status === "未提交" ? "草稿暂未进入审批" : "已提交，等待部门负责人审批",
  items: form.items.map((item) => ({ ...item })),
});

const validateForm = () => {
  const invalidIndex = form.items.findIndex(
    (item) => !item.attendanceDate || !item.timePoint || !item.type || !item.reason,
  );
  if (invalidIndex > -1) {
    ElMessage.warning(`请完善第 ${invalidIndex + 1} 条补签卡信息`);
    return false;
  }
  return true;
};

const resetForm = () => {
  form.billNo = `BQ${dayjs().format("YYYYMMDD")}${String(Date.now()).slice(-4)}`;
  form.applyDate = dayjs().format("YYYY-MM-DD");
  form.items = [createEmptyItem()];
};

const upsertRecord = (record) => {
  const index = records.value.findIndex((item) => item.billNo === record.billNo);
  if (index > -1) {
    records.value.splice(index, 1, record);
  } else {
    records.value.unshift(record);
  }
  persistRecords();
};

const handleSave = () => {
  if (!validateForm()) {
    return;
  }
  upsertRecord(buildRecord("未提交"));
  ElMessage.success("补签草稿已保存");
  resetForm();
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  ElMessageBox.confirm("确认提交当前补签申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    upsertRecord(buildRecord("审批中"));
    ElMessage.success("补签申请已提交审批");
    resetForm();
  });
};

const goSupplementList = () => {
  router.push({ name: "my-supplement-list" });
};
</script>

<template>
  <Layout>
    <div class="supplement-application-page">
      <div class="page-toolbar">
        <div>
          <h2>我要补卡</h2>
        </div>
        <div class="page-toolbar__actions">
          <el-button @click="handleSave">保存</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button type="success" plain @click="goSupplementList">
            补签卡列表
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
              <div class="readonly-cell readonly-cell--label">职位</div>
              <div class="readonly-cell">{{ employeeInfo.position }}</div>
              <div class="readonly-cell readonly-cell--label">所属组织</div>
              <div class="readonly-cell readonly-cell--wide">
                {{ employeeInfo.organization }}
              </div>
            </div>
          </section>

          <section class="info-section supplement-form-section">
            <div class="section-heading section-heading--with-action">
              <span>补签卡信息</span>
              <el-button type="primary" plain @click="addSupplementItem">
                新增补签卡
              </el-button>
            </div>
            <el-form label-width="108px" label-position="left">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="supplement-item"
              >
                <div class="supplement-item__header">
                  <strong>补签卡 {{ index + 1 }}</strong>
                  <el-button
                    link
                    type="danger"
                    @click="removeSupplementItem(index)"
                  >
                    删除
                  </el-button>
                </div>

                <div class="form-grid">
                  <el-form-item label="考勤日期" required>
                    <el-date-picker
                      v-model="item.attendanceDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择考勤日期"
                    />
                  </el-form-item>
                  <el-form-item label="补签时间点" required>
                    <el-time-select
                      v-model="item.timePoint"
                      start="00:00"
                      step="00:15"
                      end="23:45"
                      placeholder="请选择时间点"
                    />
                  </el-form-item>
                  <el-form-item label="补签卡类型" required>
                    <el-select
                      v-model="item.type"
                      placeholder="请选择补签卡类型"
                    >
                      <el-option
                        v-for="type in supplementTypes"
                        :key="type"
                        :label="type"
                        :value="type"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="补签卡原因" required>
                    <el-select
                      v-model="item.reason"
                      placeholder="请选择补签卡原因"
                    >
                      <el-option
                        v-for="reason in supplementReasons"
                        :key="reason"
                        :label="reason"
                        :value="reason"
                      />
                    </el-select>
                  </el-form-item>
                </div>

                <el-form-item label="备注">
                  <el-input
                    v-model="item.remark"
                    type="textarea"
                    :rows="3"
                    placeholder="请填写异常说明、补充依据或其他需要说明的信息"
                  />
                </el-form-item>
              </div>
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
              <div>录入摘要</div>
              <div>{{ currentItemSummary }}</div>
            </div>
          </section>
        </aside>
      </div>
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

.supplement-application-page {
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

.section-heading--with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.readonly-grid {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 160px minmax(0, 1.2fr) 120px minmax(0, 1.2fr);
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

.readonly-cell--wide {
  grid-column: span 5;
}

.supplement-form-section :deep(.el-form) {
  padding: 18px;
}

.supplement-item {
  padding: 16px;
  border: 1px solid #e2e8f2;
  border-radius: 4px;
  background: #fbfcff;
}

.supplement-item + .supplement-item {
  margin-top: 14px;
}

.supplement-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #122448;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
}

.form-grid :deep(.el-date-editor.el-input),
.form-grid :deep(.el-select) {
  width: 100%;
}

.bill-table {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
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
  line-height: 1.6;
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
    grid-template-columns: 110px minmax(0, 1fr) 120px minmax(0, 1fr) 100px minmax(0, 1fr);
  }
}

@media (max-width: 1200px) {
  .application-layout {
    grid-template-columns: 1fr;
  }

  .readonly-grid {
    grid-template-columns: 120px minmax(0, 1fr);
  }

  .readonly-cell--wide {
    grid-column: auto;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .bill-table {
    grid-template-columns: 110px minmax(0, 1fr);
  }
}
</style>
