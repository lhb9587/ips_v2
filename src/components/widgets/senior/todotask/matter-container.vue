<template>
  <div
    id="matter-container"
    class="matter-container"
    :class="{ collapsed: isExpanded }"
  >
    <div class="matter-content">
      <div
        v-if="!isrow"
        class="matter-content-norow"
      >
        <div class="norow-item">
          <FeeMatter :containerHegiht="norowcontainerHegiht" />
          <CaseMatter :containerHegiht="norowcontainerHegiht" />
        </div>
        <div class="norow-item">
          <BillMatter :containerHegiht="norowcontainerHegiht" />
          <BusinessMatter :containerHegiht="norowcontainerHegiht" />
        </div>
      </div>
      <div
        v-else
        class="matter-content-row"
      >
        <FeeMatter :containerHegiht="containerHegiht" />
        <CaseMatter :containerHegiht="containerHegiht" />
        <BillMatter :containerHegiht="containerHegiht" />
        <BusinessMatter :containerHegiht="containerHegiht" />
      </div>
    </div>
    <span
      class="matter-expanded"
      @click="handleExpanded"
    >
      <div class="matter-expanded-div">
        <i class="bx bx-chevron-up"></i>
      </div>
    </span>
  </div>
</template>

<script>
import FeeMatter from "./fee-matter.vue";
import CaseMatter from "./case-matter.vue";
import BillMatter from "./bill-matter.vue";
import BusinessMatter from "./business-trip.vue";
import { workbenchComputed } from "@/state/helpers";
export default {
  name: "MatterContainer",
  components: {
    FeeMatter,
    CaseMatter,
    BillMatter,
    BusinessMatter,
  },
  props: {
    containerHegiht: {
      type: Number,
    },
  },
  data() {
    return {
      isExpanded: false,
      isrow: true,
    };
  },
  computed: {
    ...workbenchComputed,
    norowcontainerHegiht() {
      return (this.containerHegiht - 20)/2;
    }
  },
  methods: {
    handleExpanded() {
      this.isExpanded = !this.isExpanded;
      const container = document.getElementById("matter-container");
      const button = document.getElementById("storage-box");

      if (this.isExpanded) {
        // 获取当前容器和目标按钮的位置信息
        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        // 计算位移和缩放
        const translateX =
          buttonRect.left -
          containerRect.left +
          (buttonRect.width / 2 - containerRect.width / 2);
        const translateY =
          buttonRect.top -
          containerRect.top +
          (buttonRect.height / 2 - containerRect.height / 2);
        const scale = buttonRect.width / containerRect.width;

        // 应用动画
        container.style.transition = "all 0.3s ease-in-out";
        container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        container.style.opacity = "0";

        // 动画结束后隐藏容器
        setTimeout(() => {
          container.style.display = "none";
          // 从布局中移除组件
          this.$store.commit("workbench/UPDATE_SHOW_MATTER", false);
        }, 300);
      } else {
        // 重置样式，显示容器
        container.style.display = "block";
        container.style.opacity = "1";
        container.style.transform = "none";
      }
    },
  },
  mounted() {
    const container = document.getElementById("matter-container");
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        this.isrow = width > 956;
      }
    });
    this.resizeObserver.observe(container);
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<style scoped lang="scss">
.matter-container {
  position: relative;
  height: 100%;
  width: 100%;
  transform-origin: center;
  will-change: transform, opacity;

  .matter-content {
    height: 100%;
    width: 100%;
    .matter-content-row {
      display: flex;
      gap: 20px;
      height: 100%;
    }
    .matter-content-norow {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      .norow-item {
        height: calc((100% - 20px) / 2);
        display: flex;
        gap: 20px;
      }
    }
  }
}

.matter-expanded {
  position: absolute;
  bottom: -20px;
  right: 0;
  z-index: 1;

  .matter-expanded-div {
    cursor: pointer;
    width: 50px;
    height: 18px;
    background-color: rgba(166, 176, 207, 0.3);
    border-radius: 2px 2px 5px 5px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(166, 176, 207, 0.5);
    }

    i {
      font-size: 18px;
      padding: 0 16px;
      color: #ffffff;
    }
  }
}
</style>
