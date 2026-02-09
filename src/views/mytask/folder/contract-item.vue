<template>
  <div
    class="folder-item"
    :class="{ 'is-selected': selected }"
    @click.stop="$emit('select')"
  >
    <el-popover
      placement="right"
      :width="320"
      trigger="hover"
      popper-class="folder-popover"
      ref="folderPopRef"
      :show-after="100"
    >
      <template #reference>
        <div
          class="folder-icon-wrapper"
        >
          <div class="folder-icon-content">
            <i class="folder-icon bx bx-task"></i>
            <div class="folder-name">{{ detailInfo?.contractName }}</div>
          </div>
        </div>
      </template>

      <div class="popover-content">
        <!-- 标题区域 -->
        <div class="popover-header">
          <div class="popover-header-icon">
            <i class="popover-icon bx bx-task"></i>
          </div>
          <div class="popover-header-content">
            <h3 class="popover-title">{{ detailInfo?.contractName }}</h3>
            <div class="popover-subtitle">
              {{ detailInfo?.lastTaskName }}
            </div>
          </div>
        </div>

        <!-- 元数据区域 -->
        <div class="popover-metadata">
          <div class="metadata-item">
            <i class="bx bx-calendar metadata-icon"></i>
            <span class="metadata-label">创建日期:</span>
            <span class="deadline-text">{{
              detailInfo?.contractUploadDate
            }}</span>
          </div>
          <div class="metadata-item">
            <i class="bx bx-user metadata-icon"></i>
            <span class="metadata-label">呈批人:</span>
            <span class="deadline-text">{{ detailInfo?.projectInfo?.undertakerName }}</span>
          </div>
        </div>
        <!-- 标签区域 -->
        <div class="popover-tags">
          <el-tag
            class="task-status-tag status-pending"
            round
            >任务</el-tag
          >
        </div>
        <!-- 查看详情按钮 -->
        <div class="popover-action">
          <el-button
            class="view-details-btn"
            @click.stop="viewDetails"
            >查看详情</el-button
          >
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script setup>
import { ref, defineProps, defineEmits, computed } from "vue";
const props = defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
  detailInfo: {
    type: Object,
    default: () => {},
  },
});
const selected = computed(() => props.selected);
const detailInfo = computed(() => props.detailInfo);
const emit = defineEmits(["viewDetails"]);
const folderPopRef = ref();
const viewDetails = () => {
  folderPopRef.value?.hide();
  emit("viewDetails",detailInfo.value);
};
</script>
<style lang="scss" scoped>
.folder-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 142px;
  border-radius: 10px;
  &:hover {
    background-color: #e2e8f0;
  }

  .folder-icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 10px;
    /* 使用内阴影模拟描边，不影响布局与定位 */
    box-shadow: 0 0 0 0 transparent inset;
    transition: box-shadow 0.2s ease;
    .folder-icon-content {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      padding: 0 6px;
      .folder-icon {
        font-size: 48px;
        display: block;
        color: #155dfc;
      }
      .folder-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-top: 8px;
        margin-bottom: 4px;
        // 单行溢出显示省略号
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      .folder-number {
        font-size: 12px;
        display: block;
        text-align: center;
        background-color: #f2f5f9;
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid #e3e8f0;
        width: fit-content;
        color: #000;
        font-weight: 500;
      }
    }
  }
  /* 悬浮时显示描边，不改变布局 */
  &:hover .folder-icon-wrapper {
    box-shadow: 0 0 0 2px rgba(16, 23, 42, 0.25) inset;
  }
  /* 选中态边框颜色 */
  &.is-selected .folder-icon-wrapper {
    box-shadow: 0 0 0 2px #10172a inset;
    background-color: #e2e8f0;
  }
}

.folder-popover {
  padding: 0 !important;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px !important;
  .popover-content {
    padding: 20px 20px 0 20px;
    background: #fff;
    border-radius: 10px !important;
    // 标题区域
    .popover-header {
      gap: 12px;
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;

      .popover-header-icon {
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        background-color: #deeafc;

        .popover-icon {
          font-size: 20px;
          color: #155dfc;
        }
      }

      .popover-header-content {
        flex: 1;
        min-width: 0;

        .popover-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0 0 6px 0;
          line-height: 1.4;
        }

        .popover-subtitle {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
      }
    }

    // 元数据区域
    .popover-metadata {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      .metadata-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;

        .metadata-icon {
          font-size: 12px;
          color: #606266;
        }

        .metadata-label {
          color: #666;
        }

        .priority-tag {
          border-radius: 8px;
          font-size: 12px;
          padding: 2px 8px;
          height: auto;
          line-height: 1.5;
        }

        .deadline-text {
          color: #333;
          font-weight: 500;
        }
      }
    }

    // 子事项数量
    .popover-item-count {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
      padding: 6px 8px;
      border-radius: 6px;
      background-color: #fbf9fa;

      .metadata-icon {
        font-size: 16px;
        color: #606266;
      }
    }

    // 标签区域
    .popover-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .item-tag {
        background-color: #f5f5f5;
        border-color: #e4e7ed;
        color: #606266;
        border-radius: 8px;
        font-size: 12px;
        padding: 2px 10px;
        height: auto;
        line-height: 1.5;
      }

      .task-status-tag {
        border-radius: 8px;
        font-size: 12px;
        padding: 2px 10px;
        height: auto;
        line-height: 1.5;

        &.status-pending {
          background-color: #f5f5f5;
          border-color: #e4e7ed;
          color: #909399;
        }
      }
    }

    // 底部信息
    .popover-footer {
      padding-top: 12px;
      border-top: 2px solid #f0f0f0;

      .footer-item {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        font-size: 13px;
        color: #666;

        &:last-child {
          margin-bottom: 0;
        }

        &.footer-action {
          cursor: pointer;
          color: #666;
          transition: color 0.2s;

          &:hover {
            color: #409eff;
          }
        }

        .footer-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .footer-text {
          flex: 1;
          font-size: 12px;
        }
      }
    }
  }
  // 查看详情按钮
  .popover-action {
    border-top: 1px solid #dcdfe6;
    padding: 16px;
    .view-details-btn {
      width: 100%;
      border: 1px solid #dcdfe6;
      background: #fff;
      color: #606266;
      border-radius: 6px;
      padding: 10px;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        border-color: #c0c4cc;
        color: #409eff;
      }
    }
  }
}
</style>
