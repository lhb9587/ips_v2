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
      @show="handlePopoverShow"
    >
      <template #reference>
        <div
          class="folder-icon-wrapper"
          @dblclick.stop
        >
          <div class="folder-icon-content">
            <div v-if="detailInfo.userIcon" class="folder-img">
              <img
                :src="`/ipdoc${detailInfo.userIcon}`"
                style="max-height: 48px; min-width: 48px; max-width: 120px"
              />
            </div>
            <i
              v-else
              class="folder-icon bx bx-buildings"
            ></i>
            <div class="folder-name">{{ custInfo.fullname }}</div>
          </div>
          <div class="fixed-icon">
            <i
              class="mdi mdi-chevron-right-circle"
              style="font-size: 16px"
            ></i>
          </div>
        </div>
      </template>

      <div
        class="popover-content"
        v-loading="cardLoading"
      >
        <!-- 标题 -->
        <h3 class="title">{{ custInfo.fullname }}</h3>

        <!-- 描述 -->
        <p class="popover-description">
          {{ custInfo.info }}
        </p>

        <!-- 数据行 -->
        <div class="info-row">
          <div class="info-item">
            <span class="icon bx bx-file"></span>
            我的案件：{{ custInfo.myCaseCount || 0 }}
          </div>
          <div class="info-item">
            <span class="icon bx bx-file"></span>
            团队案件：{{ custInfo.teamCount || 0 }}
          </div>
        </div>

        <!-- 项目 -->
        <div class="project">
          <span class="icon bx bx-briefcase-alt-2"></span>
          包含 {{ custInfo.projectSumCount || 0 }} 个项目
        </div>

        <!-- 标签 -->
        <div class="tags">
          <span class="tag tag-client">客户</span>
          <el-tag
            type="danger"
            class="important-tag"
            effect="dark"
            v-if="custInfo.custGradeStr === '重要客户'"
            ><div style="display: flex; gap: 4px">
              <span class="bx bx-star"></span><span>重要</span>
            </div></el-tag
          >
          <span
            class="tag tag-active"
            v-if="custInfo.activeCust"
            >活跃</span
          >
        </div>
      </div>
      <!-- 查看详情按钮 -->
      <div class="popover-action">
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
  emits: ["select", "dblclick", "viewDetails", "popover-show"],
  props: {
    detailInfo: {
      type: Object,
      default: () => ({}),
    },
    // 选中态：仅用于样式控制（选中时边框颜色为 #10172a）
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    custInfo() {
      return {
        ...this.detailInfo,
        ...(this.detailInfo.customerDto || {}),
      };
    },
    cardLoading() {
      return Boolean(this.detailInfo.customerCardLoading);
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
    handlePopoverShow() {
      this.$emit("popover-show", this.detailInfo);
    },
    viewDetails() {
      this.$refs.folderPopRef?.hide();
      this.$emit("viewDetails");
    },
  },
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
      .folder-img{
        height: 48px;
        display: flex;
        align-items: center;
      }
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
    .title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }



    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .info-item {
        font-size: 13px;
        border-radius: 8px;
        padding: 8px 12px;
        color: #333;
        background: #f7f8fa;
        display: flex;
        align-items: center;
        .icon {
          margin-right: 4px;
        }
      }
    }

    .project {
      background: #f7f8fa;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 12px;

      .icon {
        margin-right: 4px;
      }
    }

    .tags {
      display: flex;
      gap: 8px;

      .tag {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 500;

        &.tag-client {
          background: #e6f4ff;
          color: #1677ff;
        }

        &.tag-important {
          background: #ffe8e6;
          color: #ff4d4f;
        }

        &.tag-active {
          background: #e6fffb;
          color: #13c2c2;
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
.important-tag {
  background-color: #d42422;
  border-radius: 8px;
}

// 描述文字
.popover-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
