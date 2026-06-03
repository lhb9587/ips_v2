<!-- 补签卡详情页，用于承接补签列表跳转后的独立详情展示。 -->
<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import SupplementDetailContent from "./components/SupplementDetailContent.vue";
import {
  fetchSupplementRequestDetail,
  getSupplementRequestId,
  normalizeSupplementDetail,
} from "@/views/hrm/my-attendance/utils/supplementDetail";

const route = useRoute();
const router = useRouter();

const detailInfo = ref({});
const detailLoading = ref(false);

const resolveSupplementRequestId = () => {
  const queryId = route.query.supplementRequestId;
  if (queryId === undefined || queryId === null || queryId === "") {
    return null;
  }
  return queryId;
};

const readSessionDetail = () => {
  const storedDetail = sessionStorage.getItem("mySupplementCurrentDetail");
  if (!storedDetail) {
    return null;
  }
  try {
    const detail = JSON.parse(storedDetail);
    if (route.params.billNo && detail.billNo && detail.billNo !== route.params.billNo) {
      return null;
    }
    return detail;
  } catch (error) {
    return null;
  }
};

const fetchDetail = async () => {
  const supplementRequestId =
    resolveSupplementRequestId() ?? getSupplementRequestId(readSessionDetail() || {});
  if (supplementRequestId === null) {
    ElMessage.warning("缺少补签单ID，无法打开详情");
    goBack();
    return;
  }
  detailLoading.value = true;
  try {
    detailInfo.value = await fetchSupplementRequestDetail(supplementRequestId, {
      requestNo: route.params.billNo,
      billNo: route.params.billNo,
    });
  } catch (error) {
    console.log(error);
  } finally {
    detailLoading.value = false;
  }
};

const goBack = () => {
  router.push({ name: "my-supplement-list" });
};

const handleUpdateDetail = (record) => {
  detailInfo.value = normalizeSupplementDetail(record, detailInfo.value);
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <Layout>
    <div
      v-loading="detailLoading"
      class="supplement-detail-wrapper"
    >
      <SupplementDetailContent
        v-if="getSupplementRequestId(detailInfo) !== null || detailInfo?.billNo"
        :detailInfo="detailInfo"
        :showClose="false"
        :showBack="true"
        @back="goBack"
        @update-detail="handleUpdateDetail"
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
