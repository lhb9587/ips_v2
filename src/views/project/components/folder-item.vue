<template>
  <div
    class="folder-item"
    :class="{ 'is-selected': selected }"
    @click.stop="$emit('select')"
    @dblclick.capture.stop="handleDoubleClick"
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
          @dblclick.stop
        >
          <div class="folder-icon-content">
            <img
              v-if="userIcon"
              :src="`/ipdoc${userIcon}`"
              style="height: 72px; min-width: 48px; max-width: 108px"
            />
            <i
              v-else
              :class="icon"
              class="folder-icon"
              :style="{ color: iconColor }"
            ></i>
            <div class="folder-name">{{ title }}</div>
            <div class="folder-number-box">
              <div
                class="folder-number"
                v-if="itemCount"
              >
                {{ itemCount }}
              </div>
            </div>
          </div>
          <div
            class="fixed-icon"
            v-if="itemType !== '子事项' && itemCount > 0"
          >
            <i
              class="mdi mdi-chevron-right-circle"
              style="font-size: 16px"
            ></i>
          </div>
        </div>
      </template>

      <div class="popover-content">
        <!-- 标题区域 -->
        <div class="popover-header">
          <div
            class="popover-header-icon"
            :style="{ backgroundColor: iconBgColor }"
          >
            <i
              :class="icon"
              class="popover-icon"
              :style="{ color: iconColor }"
            ></i>
          </div>
          <div class="popover-header-content">
            <h3 class="popover-title">{{ title }}</h3>
            <div
              class="popover-subtitle"
              v-if="itemType !== '负责人'"
            >
              {{ owner }} · {{ statusTag }}
            </div>
            <div
              class="popover-subtitle"
              v-else
            >
              负责 {{ itemCount }} 个项目
            </div>
          </div>
        </div>

        <!-- 元数据区域 -->
        <div
          class="popover-metadata"
          v-if="itemType !== '负责人'"
        >
          <div class="metadata-item">
            <i class="bx bx-trending-up metadata-icon"></i>
            <span class="metadata-label">优先级:</span>
            <el-tag
              :type="priorityType"
              class="priority-tag"
              effect="dark"
              >{{ priority }}</el-tag
            >
          </div>
          <div
            class="metadata-item"
            v-if="dueDate"
          >
            <i
              class="bx bx-calendar metadata-icon"
              style="margin-bottom: 3px"
            ></i>
            <span class="metadata-label">截止:</span>
            <span class="deadline-text">{{ dueDate }}</span>
          </div>
        </div>

        <!-- 子事项数量 -->
        <div
          class="popover-item-count"
          v-if="itemCount"
        >
          <i class="bx bx-folder metadata-icon"></i>
          <span>包含 {{ itemCount }} 个子事项</span>
        </div>

        <!-- 标签区域 -->
        <div class="popover-tags">
          <el-tag
            class="item-tag"
            round
            >{{ itemType }}</el-tag
          >
          <el-tag
            class="status-tag"
            :class="statusTagClass"
            round
            v-if="itemType !== '负责人'"
            >{{ statusTag }}</el-tag
          >
        </div>
      </div>
      <!-- 查看详情按钮 -->
      <div
        class="popover-action"
        v-if="itemType !== '负责人'"
      >
        <el-button
          class="view-details-btn"
          @click.stop="viewDetails"
          >查看详情</el-button
        >
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: "FolderItem",
  props: {
    // 文件夹图标类名
    icon: {
      type: String,
      default: "bx bx-folder",
    },
    // 图标颜色
    iconColor: {
      type: String,
      default: "#1abc9c",
    },
    //图标背景颜色
    iconBgColor: {
      type: String,
    },
    // 标题
    title: {
      type: String,
      default: "",
    },
    // 负责人
    owner: {
      type: String,
      default: "",
    },
    // 优先级
    priority: {
      type: String,
      default: "高",
    },
    // 截止日期
    dueDate: {
      type: String,
      default: "",
    },
    // 事项数量
    itemCount: {
      type: [Number, String],
      default: 0,
    },
    // 类型标签
    itemType: {
      type: String,
      default: "项目",
    },
    // 状态标签
    statusTag: {
      type: String,
      default: "进行中",
    },
    // 客户头像
    userIcon: {
      type: String,
      default: "",
    },
    // 子分类图标
    categoryIcon: {
      type: String,
      default: "bx bx-folder",
    },
    // 操作图标
    actionIcon: {
      type: String,
      default: "bx bx-right-arrow-alt",
    },
    // 选中态：仅用于样式控制（选中时边框颜色为 #10172a）
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    priorityType() {
      const priorityMap = {
        高: "danger",
        中: "warning",
        低: "info",
        紧急: "danger",
      };
      return priorityMap[this.priority] || "info";
    },
    statusTagClass() {
      const statusMap = {
        已完成: "status-completed",
        进行中: "status-in-progress",
        测试中: "status-in-progress",
        待开始: "status-pending",
        已暂停: "status-paused",
        已取消: "status-cancelled",
      };
      return statusMap[this.statusTag] || "status-in-progress";
    },
  },
  data() {
    return {
      lastDoubleClickTime: 0,
      folderPopRef: null,
    };
  },
  methods: {
    handleDoubleClick(event) {
      // 使用时间戳防止重复触发（300ms 内的重复事件会被忽略）
      const now = Date.now();
      if (now - this.lastDoubleClickTime < 300) {
        event?.stopPropagation?.();
        return;
      }
      this.lastDoubleClickTime = now;
      this.$emit("dblclick", { title: this.title, event });
    },
    viewDetails() {
      this.$refs.folderPopRef?.hide();
      this.$emit("viewDetails");
    },
  },
};
</script>

<style lang="scss">
.folder-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 142px;
  border-radius: 10px;
  &:hover {
    background-color: #e2e8f0;
    // border: 2px solid #e3e8f0;
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
    .fixed-icon {
      position: absolute;
      top: 18px;
      right: 48px;
    }
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
      .folder-number-box {
        height: 24px;
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
    padding: 20px 20px 20px 20px;
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

        .popover-icon {
          font-size: 20px;
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
          font-size: 13px;
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
        font-size: 13px;

        .metadata-icon {
          font-size: 16px;
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

      .status-tag {
        border-radius: 8px;
        font-size: 12px;
        padding: 2px 10px;
        height: auto;
        line-height: 1.5;
        margin: 0;

        &.status-completed {
          background-color: #67c23a;
          border-color: #67c23a;
          color: #fff;
        }

        &.status-in-progress {
          background-color: #e6f3ff;
          border-color: #b3d9ff;
          color: #1890ff;
        }

        &.status-pending {
          background-color: #f5f5f5;
          border-color: #e4e7ed;
          color: #909399;
        }

        &.status-paused {
          background-color: #fdf6ec;
          border-color: #faecd8;
          color: #e6a23c;
        }

        &.status-cancelled {
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
