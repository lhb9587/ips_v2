<!-- 请假类型卡片，用于展示可选假期类型及额度信息。 -->
<script setup>
/* eslint-disable no-undef */
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
    class="leave-type-card"
    :class="[{ 'is-active': active }, `leave-type-card--${item.tone}`]"
    @click="$emit('select', item)"
  >
    <div class="leave-type-card__title">{{ item.label }}</div>
    <div
      v-if="item.quota"
      class="leave-type-card__quota"
    >
      剩余 {{ item.remaining.toFixed(1) }} / 在途 {{ item.transit.toFixed(1) }}
    </div>
    <div
      v-else
      class="leave-type-card__quota"
    >
      无预置额度，提交后进入审批
    </div>
    <div
      v-if="item.currentYear !== undefined"
      class="leave-type-card__tags"
    >
      <span>今年剩余 {{ item.currentYear.toFixed(1) }} 天</span>
      <span>去年结余 {{ item.lastYear.toFixed(1) }} 天</span>
    </div>
    <p>{{ item.description }}</p>
  </button>
</template>

<style lang="scss" scoped>
.leave-type-card {
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

.leave-type-card:hover,
.leave-type-card.is-active {
  border-color: #4778ef;
  box-shadow: 0 8px 18px rgba(61, 105, 210, 0.12);
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
  font-size: 14px;
  font-weight: 600;
}

.leave-type-card__quota {
  margin-top: 5px;
  color: #356fff;
  font-size: 12px;
}

.leave-type-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.leave-type-card__tags span {
  padding: 1px 7px;
  border-radius: 6px;
  background: #f1f5fb;
  color: #617089;
  font-size: 12px;
  line-height: 1.3;
}

.leave-type-card p {
  margin: 6px 0 0;
  color: #77849a;
  font-size: 12px;
  line-height: 1.4;
}
</style>
