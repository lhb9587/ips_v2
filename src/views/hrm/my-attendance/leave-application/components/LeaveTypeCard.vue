<!-- 请假类型卡片，用于展示可选假期类型及额度信息。 -->
<script setup>
import { computed } from "vue";

/* eslint-disable no-undef */
const props = defineProps({
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

const isExpandCard = computed(() => props.item.key === "other");
const showActive = computed(() => props.active && !isExpandCard.value);
</script>

<template>
  <button
    type="button"
    class="leave-type-card"
    :class="[
      { 'is-active': showActive, 'is-expand': isExpandCard },
      `leave-type-card--${item.tone}`,
    ]"
    @click="$emit('select', item)"
  >
    <div class="leave-type-card__title">
      <template v-if="isExpandCard">
        其他假期<span class="leave-type-card__arrow">>></span>
      </template>
      <template v-else>{{ item.label }}</template>
    </div>
    <div
      v-if="item.showQuotaLine"
      class="leave-type-card__quota"
    >
      <template v-if="item.showLastYear">
        去年结余{{ Number(item.lastYear || 0).toFixed(1) }}/
      </template>
      今年剩余{{ Number(item.remaining || 0).toFixed(1) }}/在途{{ Number(item.frozenQuota || 0).toFixed(1) }}
    </div>
  </button>
</template>

<style lang="scss" scoped>
.leave-type-card {
  position: relative;
  width: 100%;
  min-height: 66px;
  padding: 8px 12px;
  border: 1px solid #d8e2f1;
  border-left-width: 4px;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.leave-type-card:hover {
  border-color: #91b0f5;
  background: #f8faff;
}

.leave-type-card.is-expand {
  .leave-type-card__arrow {
    margin-left: 2px;
    color: #77849a;
    font-weight: 400;
    letter-spacing: -1px;
  }
}

.leave-type-card.is-active {
  border-color: #4778ef;
  border-width: 2px;
  padding: 7px 11px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e8efff 100%);
  box-shadow:
    0 0 0 1px rgba(71, 120, 239, 0.28),
    0 6px 16px rgba(71, 120, 239, 0.18);

  &::after {
    content: "";
    position: absolute;
    top: 7px;
    right: 7px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4778ef
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E")
      center / 11px no-repeat;
  }

  .leave-type-card__title {
    color: #356fff;
    font-weight: 700;
    padding-right: 22px;
  }
}

.leave-type-card--teal {
  border-left-color: #2e8c91;
}

.leave-type-card--blue {
  border-left-color: #4c7df2;
}

.leave-type-card--sky {
  border-left-color: #6aa6c9;
}

.leave-type-card--orange {
  border-left-color: #ed8b32;
}

.leave-type-card--red {
  border-left-color: #df4d43;
}

.leave-type-card--purple {
  border-left-color: #7652f2;
}

.leave-type-card__title {
  color: #122448;
  font-size: 13px;
  font-weight: 600;
}

.leave-type-card__quota {
  margin-top: 4px;
  color: #356fff;
  font-size: 11px;
}
</style>
