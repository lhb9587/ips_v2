<!-- 加班选项卡片组件，用于展示加班申请中的业务选项内容。 -->
<script setup>
import { defineEmits, defineProps } from "vue";

defineProps({
  item: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["select"]);
</script>

<template>
  <button
    type="button"
    class="overtime-option-card"
    :class="[{ 'is-active': active }, `overtime-option-card--${item.tone}`]"
    @click="$emit('select', item)"
  >
    <div class="overtime-option-card__title">{{ item.label }}</div>
    <div
      v-if="item.helper"
      class="overtime-option-card__helper"
    >
      {{ item.helper }}
    </div>
    <p>{{ item.description }}</p>
  </button>
</template>

<style scoped lang="scss">
.overtime-option-card {
  width: 100%;
  min-height: 82px;
  padding: 10px 14px;
  border: 1px solid #d8e2f1;
  border-left-width: 4px;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.overtime-option-card:hover,
.overtime-option-card.is-active {
  border-color: #4778ef;
  box-shadow: 0 8px 18px rgba(61, 105, 210, 0.12);
}

.overtime-option-card--blue {
  border-left-color: #4c7df2;
}

.overtime-option-card--teal {
  border-left-color: #2e8c91;
}

.overtime-option-card--orange {
  border-left-color: #ed8b32;
}

.overtime-option-card--red {
  border-left-color: #df4d43;
}

.overtime-option-card--purple {
  border-left-color: #7652f2;
}

.overtime-option-card__title {
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.overtime-option-card__helper {
  margin-top: 5px;
  color: #356fff;
  font-size: 12px;
}

.overtime-option-card p {
  margin: 6px 0 0;
  color: #77849a;
  font-size: 12px;
  line-height: 1.4;
}
</style>
