<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Layout from "@/layouts/main";
import SupplementDetailContent from "./components/SupplementDetailContent.vue";

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

const persistDetail = (record) => {
  detailInfo.value = { ...record };
  const records = readRecords();
  const index = records.findIndex((item) => item.billNo === record.billNo);
  if (index > -1) {
    records.splice(index, 1, record);
  } else {
    records.unshift(record);
  }
  localStorage.setItem(storageKey, JSON.stringify(records));
  sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(record));
};

const goBack = () => {
  router.push({ name: "my-supplement-list" });
};
</script>

<template>
  <Layout>
    <div class="supplement-detail-wrapper">
      <SupplementDetailContent
        :detailInfo="detailInfo"
        :showClose="false"
        :showBack="true"
        @back="goBack"
        @update-detail="persistDetail"
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

.supplement-detail-wrapper {
  min-height: calc(100vh - 120px);
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-right: 12px !important;
    padding-left: 12px !important;
  }
}
</style>
