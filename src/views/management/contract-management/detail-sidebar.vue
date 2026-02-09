<template>
  <div>
    <BOffcanvas
      v-model="show"
      @hidden="handleHidden"
      :placement="'end'"
      backdrop="false"
      responsive="md"
      :no-close-on-esc="true"
    >
      <div
        class="drag-handle"
        @mousedown="handleDragStart"
        v-if="!isnotPc"
      ></div>
      <template #header>
        <div class="custom-offcanvas-header">
          <b-button
            variant="close"
            class="close-btn-custom"
            @click="handleHidden"
          ></b-button>
          <h5
            class="offcanvas-title"
            id="offcanvasRightLabel"
          >
            <span>{{ contractDetial.contractName }}</span>
            <span v-if="contractDetial.contractNo">
              - {{ contractDetial.contractNo }}</span
            >
          </h5>
          <b-button
            @click="toggleFullscreen"
            variant="soft-primary"
            class="fullscreen-btn"
            v-if="!isIframe"
          >
            合同全屏显示
          </b-button>
        </div>
      </template>
      <ContractDetailInfo
        :contractId="contractId"
        :type="2"
        @update-value="handleUpdate"
        @closeInfo="handleCloseInfo"
      />
    </BOffcanvas>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, computed } from "vue";
import { setSidebarWidth, getSidebarWidth } from "@/utils/user";
import ContractDetailInfo from "./components/contract-detailInfo.vue";

const emit = defineEmits([
  "update:showSidebar",
  "refresh",
  "update:contractId",
]);
const props = defineProps({
  contractId: {
    type: Number,
    required: true,
  },
});
const contractDetial = ref({});
const handleUpdate = (data) => {
  contractDetial.value = data;
};

const handleCloseInfo = () => {
  emit('update:showSidebar',false)
  emit('refresh')
}

const contractId = computed(() => props.contractId);
const show = ref(true);

const isIframe = computed(()=>{
  return window.self !== window.top
})

// 添加拖拽相关的状态
const dragging = ref(false);
const startX = ref(0);
const currentWidth = ref(0);
const initialWidth = ref(0);
const isFullWidth = ref(false);

const isnotPc = ref("ontouchstart" in window || navigator.maxTouchPoints > 0);

const handleHidden = () => {
  emit("update:showSidebar", false);
};
// 修改 handleDragStart 方法
const handleDragStart = (e) => {
  dragging.value = true;
  startX.value = e.clientX;
  const offcanvas = document.querySelector(".offcanvas-end");
  if (offcanvas) {
    currentWidth.value = offcanvas.offsetWidth;
  }
  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", handleDragEnd);
  // 防止文本选中
  document.body.style.userSelect = "none";
};
// 添加 handleDrag 方法
const handleDrag = (e) => {
  if (!dragging.value) return;
  const dx = startX.value - e.clientX;
  const minWidth = Math.max(window.innerWidth * 0.7, 400);
  const maxWidth = window.innerWidth - 70;
  const newWidth = Math.min(
    Math.max(currentWidth.value + dx, minWidth),
    maxWidth
  );
  const offcanvas = document.querySelector(".offcanvas-end");
  if (offcanvas) {
    offcanvas.style.width = `${newWidth}px`;
    const obj = getSidebarWidth() || {};
    const sidebarName = window.self !== window.top ? "contract-sidebar-iframe" : "contract-sidebar";
    obj[sidebarName] = newWidth;
    setSidebarWidth(JSON.stringify(obj));
  }
};
// 添加 handleDragEnd 方法
const handleDragEnd = () => {
  dragging.value = false;
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", handleDragEnd);
  document.body.style.userSelect = "";
  // 保存最终宽度
  const offcanvas = document.querySelector(".offcanvas-end");
  if (offcanvas) {
    currentWidth.value = offcanvas.offsetWidth;
  }
};
// 全屏功能
const toggleFullscreen = () => {
  const iframe = document.querySelector("iframe");
  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  } else if (iframe.mozRequestFullScreen) {
    // Firefox
    iframe.mozRequestFullScreen();
  } else if (iframe.webkitRequestFullscreen) {
    // Chrome, Safari and Opera
    iframe.webkitRequestFullscreen();
  } else if (iframe.msRequestFullscreen) {
    // IE/Edge
    iframe.msRequestFullscreen();
  }
};
// 在 onMounted 中添加初始化宽度的逻辑
onMounted(() => {
  const offcanvas = document.querySelector(".offcanvas-end");
  if (offcanvas) {
    const obj = getSidebarWidth() || {};
    const sidebarName = window.self !== window.top ? "contract-sidebar-iframe" : "contract-sidebar";
    if (obj[sidebarName]) {
      const width = obj[sidebarName];
      if (String(width).includes("%")) {
        offcanvas.style.width = width;
        initialWidth.value = width;
        currentWidth.value = width;
      } else {
        offcanvas.style.width = `${width}px`;
        initialWidth.value = `${width}px`;
        currentWidth.value = `${width}px`;
      }
      isFullWidth.value = width == window.innerWidth - 70;
    } else {
      // 设置默认宽度为窗口宽度减去70像素
      const calculatedWidth = window.innerWidth - 70;
      initialWidth.value = `${calculatedWidth}px`;
      currentWidth.value = initialWidth.value;
      offcanvas.style.width = `${calculatedWidth}px`;
      isFullWidth.value = true; // 标记为全宽状态
    }
  }
});
</script>

<style scoped lang="scss">
.drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
}

.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.drag-handle:active {
  background-color: rgba(0, 0, 0, 0.2);
}
.fullscreen-btn {
  margin-left: auto;
  cursor: pointer;
  font-size: 12px;
  padding: 5px 10px;
  line-height: 1;
}
</style>
