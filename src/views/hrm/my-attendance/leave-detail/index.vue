<!-- 请假详情页，用于承接请假列表跳转后的独立详情展示。 -->
<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Layout from "@/layouts/main";
import LeaveDetailContent from "../leave-list/components/LeaveDetailContent.vue";
import { queryLeaveRequestAdminDetail } from "@/api/attendance";
import {
  getLeaveRequestId,
  normalizeLeaveDetail,
} from "@/views/hrm/my-attendance/utils/leaveDetail";
import { navigateAttendanceDetailBack } from "@/views/hrm/my-attendance/utils/detailPageNavigation";

const route = useRoute();
const router = useRouter();

const readDetail = () => {
  const storedDetail = sessionStorage.getItem("myLeaveCurrentDetail");
  const billNo = route.params.billNo;
  if (!storedDetail) {
    return billNo ? { requestNo: billNo, billNo } : {};
  }
  try {
    const detail = normalizeLeaveDetail(JSON.parse(storedDetail));
    const requestNo = detail.requestNo || detail.billNo;
    if (!route.params.billNo || requestNo === route.params.billNo) {
      return detail;
    }
    return billNo ? { requestNo: billNo, billNo } : {};
  } catch (error) {
    return billNo ? { requestNo: billNo, billNo } : {};
  }
};

const currentDetail = ref(readDetail());

const fetchDetailById = async () => {
  const leaveRequestId =
    getLeaveRequestId(currentDetail.value) ?? route.query.leaveRequestId ?? null;
  if (leaveRequestId === null) {
    return;
  }
  try {
    const res = await queryLeaveRequestAdminDetail(
      { leaveRequestId },
      { isLoading: false },
    );
    const detail = normalizeLeaveDetail(res?.data || {}, currentDetail.value);
    currentDetail.value = detail;
    sessionStorage.setItem("myLeaveCurrentDetail", JSON.stringify(detail));
  } catch (error) {
    console.log(error);
  }
};

const goLeaveList = () => {
  navigateAttendanceDetailBack(router, route, { name: "my-leave-list" });
};

const handleCloseInfo = () => {
  goLeaveList();
};

const handleUpdateDetail = (record) => {
  const detail = normalizeLeaveDetail(record);
  currentDetail.value = detail;
  sessionStorage.setItem("myLeaveCurrentDetail", JSON.stringify(detail));
};

onMounted(() => {
  fetchDetailById();
});
</script>

<template>
  <Layout>
    <div class="leave-detail-page">
      <LeaveDetailContent
        :detailInfo="currentDetail"
        :showClose="false"
        :showBack="true"
        @back="goLeaveList"
        @close="handleCloseInfo"
        @approval-done="handleCloseInfo"
        @update-detail="handleUpdateDetail"
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
</style>
