<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Layout from "@/layouts/main";
import OvertimeDetailContent from "../overtime-list/components/OvertimeDetailContent.vue";

const route = useRoute();
const router = useRouter();

const buildFallbackDetail = () => ({
  billNo: route.params.billNo || "JB20260506001",
  applicant: "张员工",
  employeeCode: "EMP2026136",
  organization: "产品研发中心",
  position: "Java后端开发工程师",
  applyDate: "2026-05-06",
  overtimeDate: "2026-05-05",
  startTimeOnly: "19:00",
  endTimeOnly: "22:00",
  startTime: "2026-05-05 19:00",
  endTime: "2026-05-05 22:00",
  breakMinutes: 30,
  overtimeHours: 2.5,
  overtimeReason: "项目上线",
  overtimeType: "工作日加班",
  compensationType: "调休",
  status: "审批中",
  approver: "李经理",
  source: "员工自助",
  remark: "处理版本发布窗口及上线巡检。",
  comment: "已提交，等待直属上级审批",
});

const readDetail = () => {
  const storedDetail = sessionStorage.getItem("myOvertimeCurrentDetail");
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

const goOvertimeList = () => {
  router.push({ name: "my-overtime-list" });
};

const handleUpdateDetail = (record) => {
  currentDetail.value = { ...record };
  sessionStorage.setItem("myOvertimeCurrentDetail", JSON.stringify(record));
};

const handleDeleteDetail = () => {
  sessionStorage.removeItem("myOvertimeCurrentDetail");
  goOvertimeList();
};
</script>

<template>
  <Layout>
    <div class="overtime-detail-page">
      <OvertimeDetailContent
        :detailInfo="currentDetail"
        :showClose="false"
        :showBack="true"
        @back="goOvertimeList"
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

.overtime-detail-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}
</style>
