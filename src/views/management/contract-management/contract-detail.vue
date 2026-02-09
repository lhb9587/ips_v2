<template>
  <Layout>
    <ContractDetailInfo
      :contractId="contractId"
      :type="1"
      @update-value="handleUpdate"
      @closeInfo="handleCloseInfo"
    />
  </Layout>
</template>
<script setup>
import { ref, onMounted } from "vue";
import Layout from "@/layouts/main";
import ContractDetailInfo from "./components/contract-detailInfo.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const router = useRouter();
const contractId = ref(route.params.contractId);

const store = useStore();

const handleUpdate = (data) => {
  console.log(data, "data");
};
const handleCloseInfo = () => {
  if (window.self !== window.top) {
    //退出
    const data = {
      code: "2",
    };
    window.parent.postMessage(data, "*");
  } else {
    router.push("/management/contract-management");
  }
};

onMounted(() => {
  // 检查url参数layout
  let layoutParam = "";
  if (route && route.query && route.query.layout) {
    layoutParam = route.query.layout;
  }
  if (layoutParam === "no") {
    store.dispatch("layout/changeLayoutType", {
      layoutType: "no",
    });
  }
});
</script>
