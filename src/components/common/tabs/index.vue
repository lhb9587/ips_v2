<template>
  <div class="tabs-container">
    <div
      v-for="(tab, index) in tabList"
      :key="tab.id || tab.value || index"
      class="tab-item"
      :class="{ active: activeTab === (tab.id || tab.value) }"
      @click="handleTabClick(tab)"
    >
      <i
        v-if="tab.icon"
        :class="tab.icon"
        style="font-size: 16px;line-height: 16px;"
      ></i>
      <span style="white-space: nowrap;margin-left: 4px;" v-if="tab.label">
        {{ tab.label }}
        <template v-if="tab.count !== undefined && tab.count !== null">
          ({{ tab.count }})
        </template>
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  // 标签列表，每个标签对象包含：id/value, label, icon(可选), count(可选)
  tabList: {
    type: Array,
    required: true,
    default: () => []
  },
  // 当前激活的标签 id 或 value
  activeTab: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['change', 'tab-click'])

const handleTabClick = (tab) => {
  const tabValue = tab.id || tab.value
  if (tabValue !== props.activeTab) {
    emit('change', tabValue, tab)
    emit('tab-click', tabValue, tab)
  }
}
</script>

<style lang="scss" scoped>
.tabs-container {
  background: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  position: relative;
  gap: 4px;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    color: #2c3e50;
    position: relative;
    z-index: 1;

    i {
      font-size: 14px;
    }

    &.active {
      background: white;
      color: #2c3e50;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
      color: #495057;
    }
  }
}
</style>
