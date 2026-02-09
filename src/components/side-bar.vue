<script>
import { SimpleBar } from "simplebar-vue3";

import SideNav from "./side-nav";
import { layoutComputed } from "@/state/helpers";
import { getMenuBarCollapseMode } from "@/utils/user";
import FloatBtnMenu from "@/components/common/float-btn-menu/demo.vue"

/**
 * Sidebar component
 */
export default {
  components: { SimpleBar, SideNav, FloatBtnMenu },
  props: {
    isCondensed: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...layoutComputed,
  },
  data() {
    return {
      settings: {
        minScrollbarLength: 60,
      },
      collapseMode: "icon", // 默认收起模式：icon(图标栏) | float(悬浮按钮)
    };
  },
  methods: {
    onRoutechange() {
      setTimeout(() => {
        if (document.getElementsByClassName("mm-active").length > 0) {
          const currentPosition =
            document.getElementsByClassName("mm-active")[0].offsetTop;
          if (currentPosition > 500)
            if (this.$refs.isSimplebar)
              this.$refs.isSimplebar.value.getScrollElement().scrollTop =
                currentPosition + 300;
        }
      }, 300);
    },
    // 切换收起模式
    toggleCollapseMode() {
      this.collapseMode = this.collapseMode === "icon" ? "float" : "icon";
      this.$store.dispatch("layout/changeMenuBarCollapseMode", {
        menuBarCollapseMode: this.collapseMode,
      });
    },
    // 初始化收起模式
    initCollapseMode() {
      const savedMode = getMenuBarCollapseMode();
      if (savedMode) {
        this.collapseMode = savedMode;
      }
    },
  },
  mounted() {
    this.initCollapseMode();
  },
  watch: {
    $route: {
      handler: "onRoutechange",
      immediate: true,
      deep: true,
    },
    type: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.body.setAttribute("data-sidebar", "dark");
              document.body.removeAttribute("data-topbar");
              document.body.removeAttribute("data-sidebar-size");
              document.body.removeAttribute("data-keep-enlarged");
              document.body.classList.remove("vertical-collpsed");
              break;
            case "light":
              document.body.setAttribute("data-topbar", "dark");
              document.body.removeAttribute("data-sidebar");
              document.body.removeAttribute("data-sidebar-size");
              document.body.classList.remove("vertical-collpsed");
              break;
            case "compact":
              document.body.setAttribute("data-sidebar-size", "small");
              document.body.setAttribute("data-sidebar", "dark");
              document.body.classList.remove("vertical-collpsed");
              document.body.removeAttribute("data-topbar", "dark");
              break;
            case "icon":
              document.body.setAttribute("data-keep-enlarged", "true");
              document.body.classList.add("vertical-collpsed");
              document.body.setAttribute("data-sidebar", "dark");
              document.body.removeAttribute("data-topbar", "dark");
              break;
            case "colored":
              document.body.setAttribute("data-sidebar", "colored");
              document.body.removeAttribute("data-keep-enlarged");
              document.body.classList.remove("vertical-collpsed");
              document.body.removeAttribute("data-sidebar-size");
              break;
            default:
              document.body.setAttribute("data-sidebar", "dark");
              break;
          }
        }
      },
    },
    width: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "boxed":
              document.body.setAttribute("data-layout-size", "boxed");
              document.body.removeAttribute("data-layout-scrollable");
              break;
            case "fluid":
              document.body.setAttribute("data-layout-mode", "fluid");
              document.body.removeAttribute("data-layout-size");
              document.body.removeAttribute("data-layout-scrollable");
              break;
            case "scrollable":
              document.body.setAttribute("data-layout-scrollable", "true");
              document.body.removeAttribute("data-layout-mode");
              document.body.removeAttribute("data-layout-size");
              break;
            default:
              document.body.setAttribute("data-layout-mode", "fluid");
              break;
          }
        }
      },
    },
  },
};
</script>

<template>
  <!-- ========== Left Sidebar Start ========== -->
  <div 
    class="vertical-menu" 
    v-if="!(menuBarCollapseMode === 'float' && leftSidebarCondensed)"
  >
    <div class="side-bar">
      <SimpleBar
        :settings="settings"
        class="h-100"
        ref="currentMenu"
        id="my-element"
      >
        <SideNav />
      </SimpleBar>
    </div>
    <div class="bottom-btn-box" v-if="!leftSidebarCondensed">
      <el-tooltip content="点击切换收起后的显示方式" placement="right">
        <div
          class="bottom-btn"
          @click="toggleCollapseMode"
        >
          <template v-if="collapseMode === 'icon'">
            <i class="icon iconfont icon-quanping icon-item"></i>
            <span>收起模式：图标栏</span>
          </template>
          <template v-else>
            <div style="width: 20px;height: 21px;text-align: center;">
              <i
              class="dripicons-menu"
                style="font-size: 14px"
              ></i>
            </div>
            <span>收起模式：悬浮按钮</span>
          </template>
        </div>
      </el-tooltip>
    </div>

    <!-- <SimpleBar v-else class="h-100">
      <SideNav />
    </SimpleBar> -->
  </div>
  <div class="float-btn" v-if="menuBarCollapseMode === 'float' && leftSidebarCondensed">
    <FloatBtnMenu/>
  </div>

  <!-- Left Sidebar End -->
</template>

<style lang="scss" scoped>
.side-bar {
  height: calc(100% - 48px);
}
.bottom-btn-box {
  padding: 4px 24px;
  height: 48px;
  width: 250px;
  z-index: 1001;
  .bottom-btn {
    user-select: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    height: 36px;
    border-radius: 8px;
    align-items: center;
    padding: 0 10px;
    gap: 4px;
    &:hover {
      background-color: #79829c;
    }
    .icon-item {
      font-size: 20px;
    }
  }
}
</style>
