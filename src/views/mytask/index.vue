<template>
  <Layout>
    <MyTaskFolder v-if="mytaskShowType === 'folder'" />
    <TableList v-if="mytaskShowType === 'list'" />
  </Layout>
</template>
<script setup>
import { computed } from "vue";
import Layout from "@/layouts/main.vue";
import MyTaskFolder from "./folder/index.vue";
import TableList from "./table/index.vue";
import { useStore } from "vuex";
const store = useStore();

const mytaskShowType = computed(() => {
  return store.state.layout.mytaskShowType;
});
</script>
