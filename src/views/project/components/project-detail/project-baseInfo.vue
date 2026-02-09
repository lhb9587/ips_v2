<template>
  <div class="project-base-info">
    <div class="section-header">
      <i class="bx bx-file section-icon"></i>
      <span class="section-title">项目信息</span>
    </div>
    <div class="info-field">
      <div class="field-label">
        <i class="bx bx-link-alt"></i>
        关联客户
      </div>
      <div class="field-value">{{ baseInfo.custName }}</div>
    </div>
    <div class="info-field">
      <div class="field-label">
        <i class="bx bx-detail"></i>
        项目描述
      </div>
      <div class="field-value multiline">
        {{ baseInfo.description }}
      </div>
    </div>
    <div class="info-field">
      <div class="field-label">
        <i class="bx bx-purchase-tag-alt"></i>
        项目标签
      </div>
      <div class="tags">
        <span
          v-for="tag in baseInfo.prjTagList"
          :key="tag.ptaId"
          class="tag-chip"
        >
          {{ tag.tagName }}
        </span>
      </div>
    </div>
    <div class="info-row">
      <div class="info-field">
        <div class="field-label">
          <i class="bx bx-layer"></i>
          项目状态
        </div>
        <div class="field-value">{{ statusListMap[baseInfo.status] }}</div>
      </div>
      <div class="info-field">
        <div class="field-label">
          <i class="bx bx-target-lock"></i>
          优先级
        </div>
        <div class="field-value">{{ priorityListMap[baseInfo.priority] }}</div>
      </div>
    </div>
    <div class="info-row">
      <div class="info-field">
        <div class="field-label">
          <i class="bx bx-user-circle"></i>
          创建人
        </div>
        <div class="field-value">{{ baseInfo.creatorName }}</div>
      </div>
      <div class="info-field">
        <div class="field-label">
          <i class="bx bx-user-voice"></i>
          负责人
        </div>
        <div class="field-value">{{ baseInfo.ownerName }}</div>
      </div>
    </div>
    <div class="info-field">
      <div class="field-label">
        <i class="bx bx-group"></i>
        参与人
      </div>
      <div class="tags">
        <span
          v-for="participant in baseInfo.memberList"
          :key="participant.userId"
          class="tag-chip"
        >
          {{ participant.userName }}
        </span>
      </div>
    </div>
    <div class="info-row">
      <div class="info-field">
        <div class="field-label">
          <i class="bx bx-calendar"></i>
          开始日期
        </div>
        <div class="field-value">{{ baseInfo.startDate }}</div>
      </div>
      <div class="info-field">
        <div class="field-label">
          <i class="bx bx-calendar-exclamation"></i>
          截止日期
        </div>
        <div class="field-value">{{ baseInfo.dueDate }}</div>
      </div>
    </div>
    <div class="info-field">
      <div class="field-label">
        <i class="bx bx-time"></i>
        创建时间
      </div>
      <div class="field-value">{{ baseInfo.createdAt }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { statusListMap, priorityListMap } from "../../dataMap.js";
const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
});
const baseInfo = computed(() => props.detailInfo);
</script>

<style scoped lang="scss">
.project-base-info {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  .section-icon {
    font-size: 18px;
    color: #303133;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #232f41;
  }
}
.info-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.info-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  .field-label {
    font-size: 13px;
    color: #7b8aab;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .field-value {
    background: #fff;
    border: 1px solid #edf0fb;
    color: #1f2d3d;
    border-radius: 12px;
    padding: 8px 12px;
    font-size: 14px;
    min-height: 39px;
  }
  .field-value.multiline {
    line-height: 1.6;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: transparent;
    border: none;
    padding: 0;
  }
}
.tag-chip {
  padding: 2px 8px;
  background: #f0f4ff;
  border: 1px solid #d7e2ff;
  border-radius: 8px;
  font-size: 12px;
  color: #4b5da7;
  height: fit-content;
}
@media (max-width: 992px) {
  .info-row {
    grid-template-columns: 1fr;
  }
}
</style>
