<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  templates: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const selectedTemplate = ref("");

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      selectedTemplate.value = props.templates[0]?.value || "";
    }
  },
  { immediate: true },
);

const handleConfirm = () => {
  const template =
    props.templates.find((item) => item.value === selectedTemplate.value) || null;
  emit("confirm", template);
  visible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="520px"
    title="选择套打模板"
    append-to-body
    destroy-on-close
  >
    <div class="template-dialog">
      <el-radio-group
        v-model="selectedTemplate"
        class="template-dialog__list"
      >
        <el-radio
          v-for="item in templates"
          :key="item.value"
          :label="item.value"
          border
          class="template-dialog__item"
        >
          <div class="template-dialog__name">{{ item.label }}</div>
          <div class="template-dialog__desc">{{ item.description }}</div>
        </el-radio>
      </el-radio-group>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
      >
        确认输出
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.template-dialog__list {
  width: 100%;
  display: grid;
  gap: 12px;
}

.template-dialog__item {
  width: 100%;
  height: auto;
  margin-right: 0;
}

.template-dialog__name {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.template-dialog__desc {
  margin-top: 6px;
  color: #6c7b92;
  font-size: 12px;
  line-height: 1.6;
}
</style>
