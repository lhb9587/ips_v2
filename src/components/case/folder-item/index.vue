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
    >
      <template #reference>
        <div
          class="folder-icon-wrapper"
          @dblclick.stop
        >
          <div class="folder-icon-content">
            <img
              v-if="subtitle === '领域'"
              :src="getDomainIcon(title)"
              style="width: 48px; height: 48px"
            />
            <img
              v-else-if="userIcon"
              :src="`/ipdoc${userIcon}`"
              style="max-height: 48px; min-width: 48px; max-width: 120px"
            />
            <i
              v-else
              :class="icon"
              class="folder-icon"
              :style="{ color: iconColor }"
            ></i>
            <div class="folder-name">{{ title }}</div>
            <div class="folder-number">{{ caseCount }}</div>
          </div>
          <div class="fixed-icon">
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
          <img
            v-if="subtitle === '领域'"
            :src="getDomainIcon(title)"
            style="width: 36px; height: 36px"
          />
          <div
            class="popover-header-icon"
            v-else
          >
            <i
              :class="icon"
              style="font-size: 20px"
            ></i>
          </div>
          <div>
            <h3 class="popover-title">{{ title }}</h3>
            <el-tag
              type="info"
              class="popover-subtitle"
              >{{ subtitle }}</el-tag
            >
            <el-tag
              type="danger"
              class="important-tag"
              v-if="custGradeStr"
              effect="dark"
              ><div style="display: flex; gap: 4px">
                <span class="bx bx-star"></span><span>重要</span>
              </div></el-tag
            >
          </div>
        </div>

        <!-- 描述文字 -->
        <div class="popover-description">{{ description }}</div>

        <!-- 数据框区域 -->
        <div class="data-boxes">
          <div class="data-box">
            <i
              :class="caseCountIcon"
              class="data-box-icon"
            ></i>
            <div class="data-box-content">
              <div class="data-box-number">{{ caseCount }}</div>
              <div class="data-box-label">案件数量</div>
            </div>
          </div>
          <div
            class="data-box"
            v-if="categoryCount && categoryLabel"
          >
            <i
              :class="categoryIcon"
              class="data-box-icon"
            ></i>
            <div class="data-box-content">
              <div class="data-box-number">{{ categoryCount }}</div>
              <div class="data-box-label">{{ categoryLabel }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import DomainIcon from "@/assets/images/case/domain.png";
import CopyrightIcon from "@/assets/images/case/copyright.png";
import PatentIcon from "@/assets/images/case/patent.png";
import ProtectionIcon from "@/assets/images/case/protection.png";
import LitigationIcon from "@/assets/images/case/litigation.png";
import TrademarkIcon from "@/assets/images/case/trademark.png";
import NonlitigationIcon from "@/assets/images/case/nonlitigation.png";
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
    // 标题
    title: {
      type: String,
      default: "",
    },
    // 副标题
    subtitle: {
      type: String,
      default: "领域",
    },
    // 描述
    description: {
      type: String,
      default: "",
    },
    // 案件数量
    caseCount: {
      type: [Number, String],
      default: 0,
    },
    // 案件数量图标
    caseCountIcon: {
      type: String,
      default: "bx bx-file",
    },
    // 子分类数量
    categoryCount: {
      type: [Number, String],
      default: 0,
    },
    // 子分类标题
    categoryLabel: {
      type: String,
      default: "",
    },
    // 客户等级
    custGradeStr: {
      type: String,
      default: "",
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
  data() {
    return {
      lastDoubleClickTime: 0,
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
    getDomainIcon(title) {
      const iconMap = {
        域名: DomainIcon,
        著作权: CopyrightIcon,
        专利: PatentIcon,
        保护: ProtectionIcon,
        诉讼: LitigationIcon,
        商标: TrademarkIcon,
        非诉: NonlitigationIcon,
      };
      return iconMap[title] || TrademarkIcon;
    },
  },
};
</script>

<style lang="scss">
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
    padding: 20px;
    background: #fff;
    border-radius: 10px !important;
    // 标题区域
    .popover-header {
      gap: 12px;
      display: flex;
      margin-bottom: 16px;
      .popover-header-icon {
        border-radius: 6px;
        background-color: #e8e8ea;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
      }
      .popover-title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin: 0 0 4px 0;
        line-height: 1.4;
      }

      .popover-subtitle {
        color: #000;
        font-weight: bold;
        margin-right: 8px;
        border-radius: 8px;
      }
      .important-tag {
        background-color: #d42422;
        border-radius: 8px;
      }
    }

    // 描述文字
    .popover-description {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 16px;
      -webkit-line-clamp: 3;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // 数据框区域
    .data-boxes {
      display: flex;
      gap: 12px;

      .data-box {
        flex: 0.5;
        background-color: #f5f5f5;
        border-radius: 6px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;

        .data-box-icon {
          font-size: 20px;
          color: #606266;
          flex-shrink: 0;
        }

        .data-box-content {
          flex: 1;

          .data-box-number {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            line-height: 1.2;
            margin-bottom: 4px;
          }

          .data-box-label {
            font-size: 12px;
            color: #666;
            line-height: 1.2;
          }
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
}
</style>
