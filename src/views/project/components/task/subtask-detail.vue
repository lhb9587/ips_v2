<template>
  <div style="padding: 16px;">
    <TaskDetail
      :taskCode="taskCode"
      @close="handleHidden"
      :taskType="3"
    />
  </div>
</template>
<script setup>
import { ref } from "vue";
import TaskDetail from "./task-detail.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const taskCode = ref(route.params.taskCode);
const handleHidden = () => {
  router.push("/project");
};
</script>
