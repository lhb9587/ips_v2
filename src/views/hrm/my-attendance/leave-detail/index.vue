<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Layout from "@/layouts/main";
import LeaveDetailContent from "../leave-list/components/LeaveDetailContent.vue";

const route = useRoute();
const router = useRouter();

const buildFallbackDetail = () => ({
  billNo: route.params.billNo || "QJ2026032501",
  applicant: "张员工",
  employeeCode: "EMP2026136",
  organization: "产品研发中心",
  applyDate: "2026-03-25",
  leaveType: "法定年假",
  startTime: "2026-04-02 上午",
  endTime: "2026-04-02 下午",
  duration: 1,
  unit: "天",
  status: "审批中",
  approver: "陈经理",
  reason: "清明节前后返乡，提前完成本周迭代交接。",
  attachments: ["工作交接说明.docx"],
  comment: "审批中",
});

const readDetail = () => {
  const storedDetail = sessionStorage.getItem("myLeaveCurrentDetail");
  if (!storedDetail) {
    return buildFallbackDetail();
  }
  try {
    const detail = JSON.parse(storedDetail);
    if (!route.params.billNo || detail.billNo === route.params.billNo) {
      return detail;
    }
    return buildFallbackDetail();
  } catch (error) {
    return buildFallbackDetail();
  }
};

const currentDetail = ref(readDetail());

const goLeaveList = () => {
  router.push({ name: "my-leave-list" });
};

const handleUpdateDetail = (record) => {
  currentDetail.value = { ...record };
  sessionStorage.setItem("myLeaveCurrentDetail", JSON.stringify(record));
};

const handleDeleteDetail = () => {
  sessionStorage.removeItem("myLeaveCurrentDetail");
  goLeaveList();
};
</script>

<template>
  <Layout>
    <div class="leave-detail-page">
      <div class="leave-detail-page__toolbar">
        <div>
          <h2>请假详情页</h2>
          <p>{{ currentDetail.billNo }}</p>
        </div>
        <el-button @click="goLeaveList">返回请假列表</el-button>
      </div>

      <LeaveDetailContent
        :detailInfo="currentDetail"
        :showClose="false"
        @update-detail="handleUpdateDetail"
        @delete-detail="handleDeleteDetail"
      />
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

.leave-detail-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.leave-detail-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 16px 18px;
  border: 1px solid #dce5f1;
  border-radius: 4px;
  background: #fff;
}

.leave-detail-page__toolbar h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.leave-detail-page__toolbar p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

@media (max-width: 768px) {
  .leave-detail-page__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
