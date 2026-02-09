<template>
  <div class="task-detail-info">
    <div class="content-title">属性</div>
    <div class="form-content">
      <!-- 状态 -->
      <div class="form-row">
        <div class="form-label">状态</div>
        <div class="form-value">{{ statusListMap[detailInfo.status] }}</div>
      </div>

      <!-- 开始日期 -->
      <div class="form-row">
        <div class="form-label">开始日期</div>
        <div class="form-value">{{ detailInfo.startDate }}</div>
      </div>

      <!-- 截止日期 -->
      <div class="form-row">
        <div class="form-label">截止日期</div>
        <div class="form-value">{{ detailInfo.dueDate }}</div>
      </div>

      <!-- 优先级 -->
      <div class="form-row">
        <div class="form-label">优先级</div>
        <div class="form-value">{{ priorityListMap[detailInfo.priority] }}</div>
      </div>

      <!-- 创建人 -->
      <div class="form-row">
        <div class="form-label">创建人</div>
        <div class="form-value">{{ detailInfo.creatorName }}</div>
      </div>

      <!-- 负责人 -->
      <div class="form-row">
        <div class="form-label">负责人</div>
        <div class="form-value">{{ detailInfo.ownerName }}</div>
      </div>

      <!-- 参与人 -->
      <div class="form-section">
        <div class="section-header">
          <i
            class="bx bx-group"
            style="font-size: 16px"
          ></i>
          <span>参与人</span>
        </div>
        <!-- <div
          v-if="inheritedParticipants.length > 0"
          class="inherited-participants"
        >
          <div class="inherited-bracket">└</div>
          <div class="inherited-text">
            从项目继承: {{ inheritedParticipants.join("、") }}
          </div>
        </div> -->
        <div
          v-if="detailInfo.memberList && detailInfo.memberList.length > 0"
          class="tags-display"
        >
          <el-tag
            v-for="(member, index) in detailInfo.memberList"
            :key="index"
            type="info"
            style="margin-right: 6px; margin-bottom: 6px"
          >
            {{ member.userName }}
          </el-tag>
        </div>
      </div>

      <!-- 标签 -->
      <div class="form-section">
        <div class="section-header">
          <span>标签</span>
        </div>
        <div class="tags-input-wrapper">
          <div
            v-if="detailInfo.tagList && detailInfo.tagList.length > 0"
            class="tags-display"
          >
            <el-tag
              v-for="(tag, index) in detailInfo.tagList"
              :key="index"
              type="info"
              style="margin-right: 6px; margin-bottom: 6px"
            >
              {{ tag.tagName || tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, computed } from "vue";
import { statusListMap, priorityListMap } from "../../dataMap.js";
const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => {},
  },
});

const detailInfo = computed(() => props.detailInfo);
onMounted(() => {
  console.log(props.detailInfo, "props.detailInfo");
});
</script>

<style lang="scss" scoped>
.task-detail-info {
  margin-top: 16px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  width: 100%;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  width: 100%;
}

.content-title {
  font-weight: bold;
  margin-bottom: 16px;
  color: #606266;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .form-label {
    width: 80px;
    font-size: 14px;
    color: #606266;
    flex-shrink: 0;
  }

  .form-value {
    font-weight: 600;
  }
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    i {
      font-size: 16px;
    }
  }

  .inherited-participants {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .inherited-bracket {
      color: #909399;
      font-size: 18px;
      line-height: 1.4;
      font-weight: normal;
    }

    .inherited-text {
      font-size: 12px;
      line-height: 1.4;
      flex: 1;
    }
  }

  .select-participants-btn {
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 14px;
    }
  }

  .tags-input-wrapper {
    margin-bottom: 8px;
  }

  .tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .quick-tags {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .quick-tags-label {
      font-size: 12px;
      color: #909399;
    }

    .quick-tags-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .quick-tag-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 0;

        i {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
