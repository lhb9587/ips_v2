<script setup>
import { ref, defineProps } from "vue";
const props = defineProps({
  releaseInfo: {
    type: Object,
    default: () => {},
  },
});

const releaseInfo = ref(props.releaseInfo);
</script>
<template>
  <div class="card mb-0">
    <div
      class="card-body"
      style="padding: 24px"
    >
      <h1 style="font-size: 1.5rem">
        <span v-if="releaseInfo.version">v{{ releaseInfo.version }}:</span>
        {{ releaseInfo.title }}
      </h1>
      <div class="article-meta">
        <span>{{ releaseInfo.releaseDate }}</span>
      </div>
      <el-divider style="width: 100px" />
      <h1 style="margin: 20px 0; font-size: 1.5rem" v-if="releaseInfo.summary">更新内容</h1>
      <div
        v-if="releaseInfo.summary"
        style="margin: 20px; font-size: 16px"
      >
        <div>
          <ol>
            <li
              v-for="(content, index) in releaseInfo.summary.split('\n')"
              :key="index"
            >
              {{ content }}
            </li>
          </ol>
        </div>
      </div>
      <h1 style="margin: 40px 0 20px; font-size: 1.5rem" v-if="releaseInfo.content">内容</h1>
      <div v-html="releaseInfo.content" class="rel-content"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-meta {
  margin: 20px 0;
  color: #999;
}
</style>
<style lang="scss">
.rel-content{
  img{
    max-width: 100%;
  }
}
</style>
