<script>
import { layoutMethods, layoutComputed } from "@/state/helpers";
// import { SimpleBar } from "simplebar-vue3"

/**
 * Right sidebar component
 */
export default {
  components: {
    // SimpleBar,
  },
  data() {
    return {
      config: {
        handler: this.handleRightBarClick,
        middleware: this.middleware,
        events: ["click"],
      },
    };
  },
  methods: {
    ...layoutMethods,
    hide() {
      this.$parent.toggleRightSidebar();
    },
    handleRightBarClick() {
      this.$parent.hideRightSidebar();
    },
    middleware(event) {
      if (event.target.classList)
        return !event.target.classList.contains("toggle-right");
    },
  },
  computed: {
    ...layoutComputed,
    layout: {
      get() {
        return this.$store ? this.$store.state.layout.layoutType : {} || {};
      },
      set(layout) {
        this.changeLayoutType({
          layoutType: layout,
        });
      },
    },
    verson:{
      get() {
        return 'ips_v2'
      },
      set(value) {
        if(value === 'ips'){
          let url = '';
          const hostname = window.location.hostname;
          const port = window.location.port || 8000;
          if (hostname==='ips.wanhuida.cn') {
            url = `https://ips.wanhuida.cn/` // 正式
          } else if (hostname==='localhost') {
            url = `http://localhost:9527/` // 开发
          } else if(port == 8000) {
            url = `http://${hostname}:8000/` // 测试
          } else {
            url = `http://${hostname}:${port}/v1/` // 外包测试
          }
          window.location.href = url
        }
      },
    },
    width: {
      get() {
        return this.$store ? this.$store.state.layout.layoutWidth : {} || {};
      },
      set(width) {
        this.changeLayoutWidth({
          layoutWidth: width,
        });

        if (width == "boxed") {
          this.changeLeftSidebarType({
            leftSidebarType: "icon",
          });
        } else if (width == "fluid" || width == "scrollable") {
          this.changeLeftSidebarType({
            leftSidebarType: "dark",
          });
        }
      },
    },
    topbar: {
      get() {
        return this.$store ? this.$store.state.layout.topbar : {} || {};
      },
      set(topbar) {
        this.changeTopbar({
          topbar: topbar,
        });
      },
    },
    sidebarType: {
      get() {
        return this.$store
          ? this.$store.state.layout.leftSidebarType
          : {} || {};
      },
      set(type) {
        return this.changeLeftSidebarType({
          leftSidebarType: type,
        });
      },
    },
    loader: {
      get() {
        return this.$store ? this.$store.state.layout.loader : {} || {};
      },
      set(value) {
        return this.changeLoaderValue({
          loader: value,
        });
      },
    },
  },
};
</script>

<template>
  <div>
    <div v-click-outside="config" class="right-bar">
      <!-- <SimpleBar class="h-100"> -->
        <div class="rightbar-title px-3 py-4 d-flex">
          <h5 class="m-0">设置</h5>
          <a @click="handleRightBarClick" class="right-bar-toggle ms-auto" style="cursor: pointer;">
            <i class="mdi mdi-close noti-icon"></i>
          </a>
        </div>
        <hr class="mt-0" />
        <div class="p-3">
          <h6 class="mb-0">界面模式</h6>
          <hr class="mt-1" />

          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="verson"
              id="verson-radio1"
              value="ips_v2"
              v-model="verson"
            />
            <label class="form-check-label" for="verson-radio1">优化升级版</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="verson"
              id="verson-radio2"
              value="ips"
              v-model="verson"
            />
            <label class="form-check-label" for="verson-radio2"
              >经典版</label
            >
          </div>

          <h6 class="mb-0 mt-3">布局</h6>
          <hr class="mt-1" />

          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="layout"
              id="layout-radio1"
              value="vertical"
              v-model="layout"
            />
            <label class="form-check-label" for="layout-radio1">垂直</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="layout"
              id="layout-radio2"
              value="horizontal"
              v-model="layout"
            />
            <label class="form-check-label" for="layout-radio2"
              >水平</label
            >
          </div>

          <!-- Width -->
          <h6 class="mt-3">布局宽度</h6>
          <hr class="mt-1" />

          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="widthradio"
              id="width-radio1"
              value="fluid"
              v-model="width"
            />
            <label class="form-check-label" for="width-radio1">
              自适应宽度
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="widthradio"
              id="width-radio2"
              value="boxed"
              v-model="width"
            />
            <label class="form-check-label" for="width-radio2">
              固定宽度
            </label>
          </div>
          <!-- <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="widthradio"
              id="width-radio3"
              value="scrollable"
              v-model="width"
            />
            <label class="form-check-label" for="width-radio3">
              滚动视图
            </label>
          </div> -->
        </div>
      <!-- </SimpleBar> -->
    </div>
    <!-- Right bar overlay-->
    <div class="rightbar-overlay"></div>
  </div>
</template>