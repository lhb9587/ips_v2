<template>
  <Layout>
    <ProjectDetail
      @close="handleHidden"
      :project-code="projectCode"
    />
  </Layout>
</template>
<script setup>
import { ref } from "vue";
import ProjectDetail from "./project-detail.vue";
import { useRoute, useRouter } from "vue-router";
import Layout from "@/layouts/main";

const route = useRoute();
const router = useRouter();
const projectCode = ref(route.params.projectCode);
const handleHidden = () => {
  console.log("跳转");
  router.push("/project");
};
</script>
