<template>
  <div
    class="pa-select"
    :class="{ open: isOpen, filled: hasValue }"
    ref="root"
  >
    <button type="button" class="pa-select-trigger" @click="toggle">
      <span class="pa-select-label">{{ displayLabel }}</span>
      <i class="bx bx-chevron-down" aria-hidden="true"></i>
    </button>
    <div v-if="isOpen" class="pa-select-panel">
      <ul class="pa-select-list">
        <li
          v-for="option in options"
          :key="option"
          class="pa-select-item"
          :class="{ active: option === modelValue }"
          @click="select(option)"
        >
          <span>{{ option }}</span>
          <i class="bx bx-check" aria-hidden="true"></i>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
/* global defineProps, defineEmits */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const root = ref(null);

const displayLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return props.placeholder;
  }
  return String(props.modelValue) || props.placeholder;
});

const hasValue = computed(() => {
  return displayLabel.value !== props.placeholder;
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const select = (option) => {
  emit("update:modelValue", option);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (!root.value) return;
  if (!root.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
