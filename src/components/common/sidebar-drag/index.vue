<template>
  <div>
    <BOffcanvas
      v-model="visible"
      @hidden="handleHidden"
      :placement="placement"
      :backdrop="backdrop"
      :responsive="responsive"
      :no-close-on-esc="noCloseOnEsc"
      :no-header="noHeader"
      body-class="dragsidebar"
    >
      <div
        v-if="resizable"
        class="drag-handle"
        @mousedown="handleDragStart"
      ></div>

      <slot />
    </BOffcanvas>
  </div>
</template>

<script setup>
import {
  ref,
  defineEmits,
  onMounted,
  computed,
  watch,
  nextTick,
  defineProps,
} from "vue";
import { setSidebarWidth, getSidebarWidth } from "@/utils/user";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: "end",
  },
  backdrop: {
    type: Boolean,
    default: true,
  },
  responsive: {
    type: String,
    default: "md",
  },
  noCloseOnEsc: {
    type: Boolean,
    default: true,
  },
  noHeader: {
    type: Boolean,
    default: true,
  },
  sidebarName: {
    type: String,
    default: "common-sidebar",
  },
  width: {
    type: [Number, String],
    default: null,
  },
  minWidth: {
    type: [Number, String],
    default: null,
  },
  resizable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "close"]);
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const dragging = ref(false);
const startX = ref(0);
const currentWidth = ref(0);
const initialWidth = ref(0);

const getOffcanvasElement = () =>
  document.querySelector(".offcanvas-end")

const getNumericWidth = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.trim();
    if (/^\d+(\.\d+)?$/.test(normalized)) {
      return Number(normalized);
    }
    if (/^\d+(\.\d+)?px$/.test(normalized)) {
      return Number(normalized.replace("px", ""));
    }
  }
  return null;
};

const getMinWidth = () => {
  const customMinWidth = getNumericWidth(props.minWidth);
  if (customMinWidth) return customMinWidth;
  return Math.max(window.innerWidth * 0.7, 400);
};

const applyWidth = (value) => {
  const offcanvas = getOffcanvasElement();
  if (!offcanvas || !value) return;
  const widthValue =
    typeof value === "number" || /^\d+$/.test(value) ? `${value}px` : value;
  offcanvas.style.width = widthValue;
  currentWidth.value = offcanvas.offsetWidth;
};

const handleHidden = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleDragStart = (e) => {
  if (!props.resizable) return;
  const offcanvas = getOffcanvasElement();
  if (!offcanvas) return;
  dragging.value = true;
  startX.value = e.clientX;
  currentWidth.value = offcanvas.offsetWidth;
  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", handleDragEnd);
  document.body.style.userSelect = "none";
};

const handleDrag = (e) => {
  if (!dragging.value) return;
  const dx = startX.value - e.clientX;
  const minWidth = getMinWidth();
  const maxWidth = window.innerWidth - 70;
  const newWidth = Math.min(
    Math.max(currentWidth.value + dx, minWidth),
    maxWidth
  );
  const offcanvas = getOffcanvasElement();
  if (offcanvas) {
    offcanvas.style.width = `${newWidth}px`;
    const obj = getSidebarWidth() || {};
    obj[props.sidebarName] = newWidth;
    setSidebarWidth(JSON.stringify(obj));
  }
};

const handleDragEnd = () => {
  dragging.value = false;
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", handleDragEnd);
  document.body.style.userSelect = "";
  const offcanvas = getOffcanvasElement();
  if (offcanvas) {
    currentWidth.value = offcanvas.offsetWidth;
  }
};

const initWidth = () => {
  const obj = getSidebarWidth() || {};
  const storedWidth = obj[props.sidebarName];
  if (storedWidth) {
    applyWidth(storedWidth);
    initialWidth.value = storedWidth;
    return;
  }
  if (props.width) {
    applyWidth(props.width);
    initialWidth.value = props.width;
    return;
  }
  const defaultWidth = `${window.innerWidth * 0.8}px`;
  applyWidth(defaultWidth);
  initialWidth.value = defaultWidth;
};

onMounted(() => {
  nextTick(() => {
    initWidth();
  });
});

watch(
  () => props.width,
  (val) => {
    if (val) {
      applyWidth(val);
    }
  }
);
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
</style>
