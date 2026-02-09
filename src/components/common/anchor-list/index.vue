<template>
  <div
    class="anchor-list"
    :style="anchorStyle"
    @mousedown="onDragStart"
    @touchstart="onTouchStart"
    v-if="props.anchorPoints.length > 0"
  >
    <!-- 锚点列表 -->
    <div class="anchor-items">
      <div
        v-for="(item, index) in props.anchorPoints"
        :key="index"
        class="anchor-item"
        :class="{ active: activeAnchor === item.name }"
        @click="scrollToAnchor(item)"
      >
        <i
          :class="item.icon"
          class="anchor-icon"
        ></i>
        <span class="anchor-text">{{ item.name }}</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <!-- <div class="anchor-footer">
      <div class="footer-button" @click="scrollToTop">
        <i class="mdi mdi-eye footer-icon" ></i>
        <span class="footer-text">我的关注</span>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineProps} from "vue";

// Props
const props = defineProps({
  anchorPoints: {
    type: Array,
    default: () => [],
  },
});

// 响应式数据
const dragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const startPosX = ref(0);
const startPosY = ref(0);
const posX = ref(100); // 默认右边距100px
const posY = ref(100); // 默认底边距100px
const activeAnchor = ref(""); // 当前激活的锚点

// 从 localStorage 加载位置
const loadPosition = () => {
  try {
    const saved = localStorage.getItem("anchorListPosition");
    if (saved) {
      const { x, y } = JSON.parse(saved);
      posX.value = x;
      posY.value = y;
    }
  } catch (e) {
    // 如果解析失败，使用默认位置
    console.warn("Failed to load anchor list position from localStorage");
  }
};

// 保存位置到 localStorage
const savePosition = () => {
  try {
    localStorage.setItem(
      "anchorListPosition",
      JSON.stringify({
        x: posX.value,
        y: posY.value,
      })
    );
  } catch (e) {
    console.warn("Failed to save anchor list position to localStorage");
  }
};

// 计算样式
const anchorStyle = computed(() => ({
  right: `${posX.value}px`,
  bottom: `${posY.value}px`,
  transform: dragging.value ? "scale(1.05)" : "scale(1)",
  transition: dragging.value ? "none" : "all 0.3s ease",
}));

// 滚动到锚点
const scrollToAnchor = (item) => {
  // 通过文字内容查找对应的 .cpn-title 元素
  const titleElements = document.querySelectorAll(".cpn-title");
  const targetElement = Array.from(titleElements).find((element) => {
    const text = element.textContent?.trim() || element.innerText?.trim() || "";
    return text === item.name;
  });

  if (targetElement) {
    // 设置当前激活的锚点
    activeAnchor.value = item.name;

    // 获取页面滚动容器
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      // 计算目标位置，减去一些偏移量避免被略过
      const elementRect = targetElement.getBoundingClientRect();
      const containerRect = pageContent.getBoundingClientRect();
      const scrollTop =
        pageContent.scrollTop + elementRect.top - containerRect.top - 60; // 减去60px偏移

      pageContent.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    } else {
      // 如果没有找到滚动容器，使用默认的滚动方法
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
};

// 滚动到顶部
// const scrollToTop = () => {
//   const pageContent = document.querySelector('.page-content')
//   if (pageContent) {
//     pageContent.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     })
//   }
// }

// 拖拽功能
const onDragStart = (e) => {
  dragging.value = true;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  startPosX.value = posX.value;
  startPosY.value = posY.value;

  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
  e.preventDefault();
};

const onDragMove = (e) => {
  if (!dragging.value) return;

  const deltaX = dragStartX.value - e.clientX; // 反向，因为使用right定位
  const deltaY = dragStartY.value - e.clientY; // Y轴反向

  const newX = startPosX.value + deltaX;
  const newY = startPosY.value + deltaY;

  // 限制在视口范围内
  const maxX = window.innerWidth - 200; // 组件宽度约200px
  const maxY = window.innerHeight - 300; // 组件高度约300px

  posX.value = Math.max(0, Math.min(newX, maxX));
  posY.value = Math.max(0, Math.min(newY, maxY));
};

const onDragEnd = () => {
  dragging.value = false;
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
  savePosition(); // 保存位置到 localStorage
};

// 触摸事件
const onTouchStart = (e) => {
  dragging.value = true;
  dragStartX.value = e.touches[0].clientX;
  dragStartY.value = e.touches[0].clientY;
  startPosX.value = posX.value;
  startPosY.value = posY.value;

  document.addEventListener("touchmove", onTouchMove);
  document.addEventListener("touchend", onTouchEnd);
  e.preventDefault();
};

const onTouchMove = (e) => {
  if (!dragging.value) return;

  const deltaX = dragStartX.value - e.touches[0].clientX; // 反向，因为使用right定位
  const deltaY = dragStartY.value - e.touches[0].clientY;

  const newX = startPosX.value + deltaX;
  const newY = startPosY.value + deltaY;

  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 300;

  posX.value = Math.max(0, Math.min(newX, maxX));
  posY.value = Math.max(0, Math.min(newY, maxY));
};

const onTouchEnd = () => {
  dragging.value = false;
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
  savePosition(); // 保存位置到 localStorage
};

// 监听锚点列表变化，设置默认激活项
watch(() => props.anchorPoints, (newPoints) => {
  if (newPoints.length > 0 && !activeAnchor.value) {
    activeAnchor.value = newPoints[0].name;
  }
}, { immediate: true });

// 组件挂载时加载位置
onMounted(() => {
  loadPosition();
});

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
});
</script>

<style lang="scss" scoped>
.anchor-list {
  position: fixed;
  width: 150px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 199;
  user-select: none;
  cursor: move;

  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
  }
}

.anchor-items {
  padding: 12px 0;

  .anchor-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    margin: 0 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #2c3e50;
      color: white;

      .anchor-icon {
        color: white;
      }

      .anchor-text {
        color: white;
      }
    }

    .anchor-icon {
      font-size: 16px;
      color: #2c3e50;
      margin-right: 12px;
      width: 20px;
      text-align: center;
    }

    .anchor-text {
      font-size: 14px;
      color: #2c3e50;
      font-weight: 500;
    }
  }
}
</style>
