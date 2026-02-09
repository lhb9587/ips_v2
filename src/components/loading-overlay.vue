<template>
  <div v-if="loading" class="loading-overlay" :style="{ top: scrollTop + 'px' }">
    <div class="loading-spinner"></div>
    <div class="loading-text">请等待</div>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    scrollTop: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  left: 0;
  right: 0;
  height: inherit;
  background-color: rgba(255, 255, 255, 0.9); /* 恢复原来的背景颜色 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 2px solid transparent; /* 将轨道设置为透明 */
  border-top: 2px solid #556ee6; /* 保持有颜色部分不变 */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #556ee6;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>