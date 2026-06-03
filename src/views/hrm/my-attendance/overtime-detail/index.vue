<!-- 加班详情页，用于承接加班列表跳转后的独立详情展示。 -->
<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import OvertimeDetailContent from "../overtime-list/components/OvertimeDetailContent.vue";
import {
  fetchOvertimeRequestDetail,
  normalizeOvertimeDetail,
} from "@/views/hrm/my-attendance/utils/overtimeDetail";

const route = useRoute();
const router = useRouter();

const currentDetail = ref({});
const detailLoading = ref(false);

const resolveOvertimeRequestId = () => {
  const queryId = route.query.overtimeRequestId;
  if (queryId === undefined || queryId === null || queryId === "") {
    return null;
  }
  return queryId;
};

const fetchDetail = async () => {
  const overtimeRequestId = resolveOvertimeRequestId();
  if (overtimeRequestId === null) {
    ElMessage.warning("缺少加班单ID，无法打开详情");
    goOvertimeList();
    return;
  }
  detailLoading.value = true;
  try {
    currentDetail.value = await fetchOvertimeRequestDetail(overtimeRequestId);
  } catch (error) {
    console.log(error);
  } finally {
    detailLoading.value = false;
  }
};

const goOvertimeList = () => {
  router.push({ name: "my-overtime-list" });
};

const handleUpdateDetail = (record) => {
  currentDetail.value = normalizeOvertimeDetail(record);
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <Layout>
    <div
      v-loading="detailLoading"
      class="overtime-detail-page"
    >
      <OvertimeDetailContent
        v-if="currentDetail?.overtimeRequestId || currentDetail?.billNo"
        :detailInfo="currentDetail"
        :showClose="false"
        :showBack="true"
        @back="goOvertimeList"
        @update-detail="handleUpdateDetail"
      />
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.overtime-detail-page {
  padding: 16px;
  min-height: 240px;
}
</style>
