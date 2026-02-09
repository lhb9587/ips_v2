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
            <i class="folder-icon bx bx-folder"></i>
            <div class="folder-name">{{ detailInfo.name }}</div>
            <div class="folder-number">
              {{ detailInfo.total || 0 }}
            </div>
          </div>
          <div
            class="fixed-icon"
            v-if="detailInfo.total > 0"
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
          <div class="popover-header-icon">
            <i
              class="bx bx-folder"
              style="font-size: 20px; color: #1abc9c"
            ></i>
          </div>
          <div>
            <h3 class="popover-title">{{ detailInfo.name }}</h3>
            <div class="popover-subtitle">{{ descMap[detailInfo.value] }}</div>
          </div>
        </div>
        <template
          v-if="
            detailInfo.value === 'mycase' || detailInfo.value === 'teamcase'
          "
        >
          <div class="info-item">
            <span class="icon bx bx-file"></span>
            案件总数：{{ detailInfo.total || 0 }}个
          </div>
          <div class="info-item" v-if="detailInfo?.fields?.length">
            <div style="margin-bottom: 4px">案件领域：</div>
            <div style="display: flex;gap: 6px;flex-wrap: wrap;">
              <el-tag
                plain
                type="info"
                :key="item.custId"
                v-for="item in detailInfo?.fields || []"
                >{{ item.domainName }}：{{ item.caseCount }}
              </el-tag>
            </div>
          </div>
        </template>
        <template v-if="detailInfo.value === 'relatedprj'">
          <div class="info-item">
            <span class="icon bx bx-folder"></span>
            包含{{ detailInfo.total || 0 }}个项目
          </div>
        </template>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: "FolderItem",
  props: {
    detailInfo: {
      type: Object,
      default: () => {},
    },
    // 选中态：仅用于样式控制（选中时边框颜色为 #10172a）
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      lastDoubleClickTime: 0,
      folderPopRef: null,
      descMap: {
        mycase: "我负责或协办的案件",
        teamcase: "团队所有成员的案件",
        relatedprj: "项目，包含所有项目任务和进度",
      },
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

<style lang="scss" scoped>
.folder-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 162px;
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
        color: #1abc9c;
      }
      .folder-name {
        font-size: 14px;
        font-weight: bold;
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
    padding: 20px 20px 20px 20px;
    background: #fff;
    border-radius: 10px !important;
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
        background-color: #e8e8ea;

        .popover-icon {
          font-size: 20px;
        }
      }
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
    .info-item {
      background: #f7f8fa;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 12px;

      .icon {
        margin-right: 4px;
      }
    }
  }
}
</style>
