<template>
  <div style="padding: 16px;">
    <ProjectDetail
      @close="handleHidden"
      :project-code="projectCode"
    />
  </div>
</template>
<script setup>
import { ref } from "vue";
import ProjectDetail from "./project-detail.vue";
import { useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();
const projectCode = ref(route.params.projectCode);
const handleHidden = () => {
  console.log("跳转");
  router.push("/project");
};
</script>
