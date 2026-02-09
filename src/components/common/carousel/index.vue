<template>
  <div class="carousel-wrap" @click="handleClick">
    <div class="carousel-alert">
      <div class="carousel-content">
        <i class="mdi mdi-bell-ring-outline carousel-icon"></i>
        <span class="carousel-customer">{{ currentMessage.customer }}：</span>
        <span class="carousel-text">{{ currentMessage.text }}</span>
      </div>
      <el-button class="carousel-count" size="small" round plain type="warning">
        {{ messages.length }}条消息
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => ([
      { id: 1, customer: '华为', text: '华为商标注册需补充材料' },
      { id: 2, customer: '腾讯', text: '腾讯专利年费即将到期' },
      { id: 3, customer: '阿里巴巴', text: '阿里巴巴案件有新进展' },
    ])
  }
});

const currentIndex = ref(0);
const currentMessage = computed(() => props.messages[currentIndex.value]);
let timer = null;

const startCarousel = () => {
  timer = setInterval(() => {
    if (props.messages.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % props.messages.length;
    }
  }, 3000);
}

const handleClick = () => {
}

onMounted(() => {
  startCarousel();
});
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped>
.carousel-wrap {
  width: 100%;
  padding: 0 8px;
}
.carousel-alert {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  min-height: 36px;
  width: 500px;
  height: 36px;
  box-sizing: border-box;
  justify-content: space-between;
}
.carousel-content {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #222;
  font-weight: 400;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.carousel-icon {
  color: #e6a23c;
  font-size: 18px;
  margin-right: 6px;
  flex-shrink: 0;
}
.carousel-customer {
  font-weight: 700;
  color: #222;
  margin-right: 2px;
}
.carousel-text {
  color: #222;
  flex-shrink: 0;
}
.carousel-count {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #ad6800;
  font-weight: 600;
  font-size: 12px;
  min-width: 80px;
  margin-left: 16px;
  box-shadow: none;
}
</style>
