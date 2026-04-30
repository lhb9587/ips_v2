<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";

const route = useRoute();
const router = useRouter();

const storageKey = "mySupplementCardRecords";

const buildFallbackDetail = () => ({
  billNo: route.params.billNo || "BQ202604025347",
  applicant: "张员工",
  employeeCode: "EMP2026136",
  position: "Java后端开发工程师",
  organization: "产品研发中心",
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
});

const readRecords = () => {
  const storedRecords = localStorage.getItem(storageKey);
  if (!storedRecords) {
    return [];
  }
  try {
    const records = JSON.parse(storedRecords);
    return Array.isArray(records) ? records : [];
  } catch (error) {
    return [];
  }
};

const readDetail = () => {
  const storedDetail = sessionStorage.getItem("mySupplementCurrentDetail");
  if (storedDetail) {
    try {
      const detail = JSON.parse(storedDetail);
      if (!route.params.billNo || detail.billNo === route.params.billNo) {
        return detail;
      }
    } catch (error) {
      return buildFallbackDetail();
    }
  }

  const matchedRecord = readRecords().find(
    (record) => record.billNo === route.params.billNo,
  );
  return matchedRecord || buildFallbackDetail();
};

const detailInfo = ref(readDetail());

const approvalSteps = computed(() => [
  {
    title: "申请人提交",
    description:
      detailInfo.value.status === "未提交"
        ? "补签单暂未提交审批。"
        : `${detailInfo.value.applicant} 已提交补签申请。`,
    status: detailInfo.value.status === "未提交" ? "wait" : "finish",
  },
  {
    title: "部门负责人审批",
    description: detailInfo.value.approvalComment || "等待部门负责人审批。",
    status:
      detailInfo.value.status === "已通过"
        ? "finish"
        : detailInfo.value.status === "审批中"
          ? "process"
          : "wait",
  },
  {
    title: "审批完成",
    description:
      detailInfo.value.status === "已通过"
        ? "补签审批通过后影响异常处理结果和考勤计算结果。"
        : "审批完成后更新异常处理结果。",
    status: detailInfo.value.status === "已通过" ? "finish" : "wait",
  },
]);

const statusTagType = computed(() => {
  const map = {
    未提交: "info",
    审批中: "warning",
    已通过: "success",
    已废弃: "danger",
  };
  return map[detailInfo.value.status] || "info";
});

const persistDetail = () => {
  const records = readRecords();
  const index = records.findIndex((record) => record.billNo === detailInfo.value.billNo);
  if (index > -1) {
    records.splice(index, 1, detailInfo.value);
  } else {
    records.unshift(detailInfo.value);
  }
  localStorage.setItem(storageKey, JSON.stringify(records));
  sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(detailInfo.value));
};

const goBack = () => {
  router.push({ name: "my-supplement-list" });
};

const handleSubmit = () => {
  if (detailInfo.value.status !== "未提交") {
    ElMessage.warning("当前补签单无需提交");
    return;
  }
  detailInfo.value.status = "审批中";
  detailInfo.value.approver = "李经理";
  detailInfo.value.approvalComment = "已提交，等待部门负责人审批";
  persistDetail();
  ElMessage.success("补签单已提交");
};

const handleDiscard = () => {
  if (detailInfo.value.status === "已通过") {
    ElMessage.warning("已通过的补签单不可废弃");
    return;
  }
  ElMessageBox.confirm("确定要废弃当前补签单吗？", "废弃确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    detailInfo.value.status = "已废弃";
    detailInfo.value.approvalComment = "申请人已废弃该补签单";
    persistDetail();
    ElMessage.success("补签单已废弃");
  });
};
</script>

<template>
  <Layout>
    <div class="supplement-detail-page">
      <div class="page-toolbar">
        <div>
          <h2>补签详情</h2>
          <p>查看补签单据、补签卡明细、审批状态与审批意见。</p>
        </div>
        <div class="page-toolbar__actions">
          <el-button @click="goBack">返回补签卡列表</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button type="danger" plain @click="handleDiscard">废弃</el-button>
        </div>
      </div>

      <div class="detail-layout">
        <main class="detail-main">
          <section class="detail-card">
            <div class="detail-card__title">补签单信息</div>
            <div class="detail-grid">
              <div>单据编号</div>
              <div>{{ detailInfo.billNo }}</div>
              <div>申请日期</div>
              <div>{{ detailInfo.applyDate }}</div>
              <div>姓名</div>
              <div>{{ detailInfo.applicant }}</div>
              <div>员工编码</div>
              <div>{{ detailInfo.employeeCode }}</div>
              <div>职位</div>
              <div>{{ detailInfo.position }}</div>
              <div>所属组织</div>
              <div>{{ detailInfo.organization }}</div>
            </div>
          </section>

          <section class="detail-card">
            <div class="detail-card__title">补签卡信息</div>
            <el-table :data="detailInfo.items" border>
              <el-table-column type="index" label="#" width="54" />
              <el-table-column prop="attendanceDate" label="考勤日期" width="130" />
              <el-table-column prop="timePoint" label="补签时间点" width="130" />
              <el-table-column prop="type" label="补签卡类型" width="140" />
              <el-table-column prop="reason" label="补签卡原因" width="150" />
              <el-table-column prop="remark" label="备注" min-width="220" />
            </el-table>
          </section>
        </main>

        <aside class="detail-side">
          <section class="detail-card">
            <div class="detail-card__title">审批状态</div>
            <div class="status-box">
              <span>当前状态</span>
              <el-tag :type="statusTagType">{{ detailInfo.status }}</el-tag>
            </div>
            <div class="approval-comment">
              <span>审批意见</span>
              <p>{{ detailInfo.approvalComment || "--" }}</p>
            </div>
            <el-steps direction="vertical" :active="1" finish-status="success">
              <el-step
                v-for="step in approvalSteps"
                :key="step.title"
                :title="step.title"
                :description="step.description"
                :status="step.status"
              />
            </el-steps>
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

.supplement-detail-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.page-toolbar,
.detail-card {
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

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  margin-top: 14px;
  align-items: start;
}

.detail-main {
  display: grid;
  gap: 14px;
}

.detail-card {
  overflow: hidden;
}

.detail-card__title {
  padding: 16px 18px;
  border-bottom: 1px solid #dce5f1;
  color: #122448;
  font-size: 15px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 130px minmax(0, 1fr);
  padding: 18px;
}

.detail-grid div {
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #e2e8f2;
  border-top: 0;
  border-left: 0;
  color: #122448;
  font-size: 13px;
}

.detail-grid div:nth-child(-n + 4) {
  border-top: 1px solid #e2e8f2;
}

.detail-grid div:nth-child(4n + 1) {
  border-left: 1px solid #e2e8f2;
}

.detail-grid div:nth-child(odd) {
  background: #f2f5fa;
  font-weight: 600;
}

.detail-card :deep(.el-table) {
  margin: 18px;
  width: calc(100% - 36px);
}

.detail-side .detail-card {
  padding-bottom: 18px;
}

.status-box,
.approval-comment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 18px 0;
  padding: 14px;
  border: 1px solid #e2e8f2;
  background: #fbfcff;
  color: #122448;
  font-size: 13px;
}

.approval-comment {
  display: block;
}

.approval-comment span {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.approval-comment p {
  margin: 0;
  color: #63718a;
  line-height: 1.7;
}

.detail-side :deep(.el-steps) {
  margin: 22px 18px 0;
}

@media (max-width: 1200px) {
  .detail-layout {
    grid-template-columns: 1fr;
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

  .detail-grid {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .detail-grid div:nth-child(-n + 4) {
    border-top: 0;
  }

  .detail-grid div:nth-child(-n + 2) {
    border-top: 1px solid #e2e8f2;
  }

  .detail-grid div:nth-child(4n + 1) {
    border-left: 0;
  }

  .detail-grid div:nth-child(odd) {
    border-left: 1px solid #e2e8f2;
  }
}
</style>
