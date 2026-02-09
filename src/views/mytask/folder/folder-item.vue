<template>
  <div class="card-wrapper">
    <div
      class="paper"
      :class="theme"
    >
      <div
        v-for="item in contentList"
        :key="item"
        class="paper-item"
        @click="() => $emit('viewDetails', item)"
      >
        {{ item.contractName || item.name }}
      </div>
    </div>

    <div
      class="corner"
      :class="theme"
    ></div>
    <div
      class="folder"
      :class="theme"
    >
      <div class="btn">{{ title }}</div>

      <div class="count-tag">{{ count }}</div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, computed } from "vue";
const props = defineProps({
  title: {
    type: String,
  },
  count: {
    type: Number,
    default: 0,
  },
  contentList: {
    type: Array,
    default: () => [],
  },
  theme: {
    type: String,
    default: "blue", //文件的颜色，blue和purple
  },
});
const title = computed(() => props.title);
const count = computed(() => props.count);
const contentList = computed(() => props.contentList);
</script>

<style lang="scss" scoped>
.folder-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
  padding: 0 48px;

  /* 响应式布局：根据宽度调整每行显示的元素数量 */
  @media (min-width: 1426px) {
    grid-template-columns: repeat(4, minmax(280px, 1fr));
  }

  @media (min-width: 950px) and (max-width: 1425px) {
    grid-template-columns: repeat(3, minmax(280px, 1fr));
  }

  @media (max-width: 949px) {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}
.card-wrapper {
  padding: 32px;
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 3;
  cursor: pointer;
}

/* 上面的白色纸张 */
.paper {
  width: 75%;
  margin: 0 auto;
  padding: 6px 8px;
  border-radius: 10px;
  box-shadow: 0 8px 24px -4px #0f172a4d;
  position: relative;
  z-index: 2;
  transform: translateY(10px);
  height: 100px;
  backdrop-filter: blur(24px);
  border: 1px solid #fff6;

  &.blue {
    background: linear-gradient(
      135deg,
      rgba(147, 197, 253, 0.2) 0%,
      rgba(191, 219, 254, 0.15) 50%,
      rgba(255, 255, 255, 0.85) 100%
    );
  }

  &.purple {
    background: linear-gradient(
      135deg,
      rgba(196, 181, 253, 0.2) 0%,
      rgba(221, 214, 254, 0.15) 50%,
      rgba(255, 255, 255, 0.85) 100%
    );
  }

  .paper-item {
    font-size: 11px;
    color: #333;
    padding: 6px;
    border-radius: 4px;
    &:hover {
      background-color: #ffffff80;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
.corner {
  position: absolute;
  bottom: calc(100% - 139px); /* 相对于card-wrapper的底部，但刚好在folder上方 */
  left: 32px;
  height: 20px;
  width: 40%;
  z-index: 1;
  border-radius: 10px 10px 0 0;
  &.blue {
    background: linear-gradient(
      to top left,
      #7daafd 0%,
      #6092fb 30%,
      #155dfc 100%
    );
  }
  &.purple {
    background: linear-gradient(
      to top left,
      #c390fe 0%,
      #ad46ff 30%,
      #9810fa 100%
    );
  }
}
/* 蓝色文件夹 */
.folder {
  width: 100%;
  height: 100%;
  //   background: linear-gradient(135deg, #51a2ff,#2b7fff, #155dfc);
  border-radius: 10px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 94, 255, 0.3);
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;

  &.blue {
    background: linear-gradient(
      to bottom right,
      #7daafd 0%,
      #6092fb 40%,
      #155dfc 100%
    );
  }
  &.purple {
    background: linear-gradient(
      to bottom right,
      #c390fe 0%,
      #ad46ff 50%,
      #9810fa 100%
    );
  }

  .btn {
    padding: 8px 20px;
    border-radius: 12px;
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    backdrop-filter: blur(4px);
    border: 2px solid;
    border-color: #ffffff80;
  }

  .count-tag {
    position: absolute;
    right: 12px;
    bottom: 12px;
    background: #fff;
    color: #333;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
