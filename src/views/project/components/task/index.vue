<template>
  <div style="padding: 16px">
    <TaskDetail
      :taskCode="taskCode"
      @close="handleHidden"
      :taskType="1"
    />
  </div>
</template>
<script setup>
import { ref } from "vue";
import TaskDetail from "./task-detail.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const taskCode = ref(route.params.taskCode);
const router = useRouter();
const handleHidden = () => {
  router.push("/project");
};
</script>
