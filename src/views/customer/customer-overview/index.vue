<template>
  <Layout>
    <FolderView v-if="custShowType === 'folder'" />
    <Directory v-if="custShowType === 'directory'" />
    <CustList v-if="custShowType === 'list'" />
  </Layout>
</template>
<script setup>
import { computed } from "vue";
import FolderView from "./components/folder/index.vue";
import Directory from "./components/directory/index.vue";
import CustList from "@/views/customer/customer-info/index.vue"
import Layout from "@/layouts/main.vue";
import { useStore } from "vuex";
const store = useStore();

const custShowType = computed(() => {
  return store.state.layout.custShowType;
});
</script>
