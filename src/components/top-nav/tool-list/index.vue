<template>
  <div class="px-lg-2">
    <div class="row no-gutters">
      <div class="col" v-if="permissions.includes(441)">
        <a
          class="dropdown-icon-item"
          @click="goKnowledgebase"
        >
          <img
            src="@/assets/images/home/knowledgebase.png"
            alt="knowledgebase"
          />
          <span>AI 知识库</span>
        </a>
      </div>
      <div class="col" v-if="permissions.includes(482)">
        <a
          class="dropdown-icon-item"
          @click="goFactRetrieval"
        >
          <img
            src="@/assets/images/home/fact_retrieval.png"
            alt="fact_retrieval"
          />
          <span>事实检索</span>
        </a>
      </div>
      <div class="col" v-if="permissions.includes(501)">
        <a
          class="dropdown-icon-item"
          @click="goEmailMonitoring"
        >
          <img
            src="@/assets/images/home/emali.png"
            alt="emali"
          />
          <span>邮件监控</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { userComputed } from "@/state/helpers";

export default {
  name: "ToolList",
  data() {
    return {};
  },
  computed: {
    ...userComputed
  },
  methods: {
    goKnowledgebase() {
      window.open("/KnowledgeBase/#/home", "_blank");
    },
    goFactRetrieval() {
      window.open("/ExternalLinker", "_blank");
    },
    goEmailMonitoring() {
      window.open('/EmailMonitoring', '_blank');
    },
  },

};
</script>

<style>
.dropdown-icon-item {
  cursor: pointer;
  max-width: 100px;
}
</style>
