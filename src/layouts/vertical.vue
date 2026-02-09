<script>
import router from "@/router";
import { layoutComputed } from "@/state/helpers";
import { getMenuBarCollapseMode } from "@/utils/user";

import NavBar from "@/components/nav-bar";
import SideBar from "@/components/side-bar";
import RightBar from "@/components/right-bar";
import Footer from "@/components/footer";
// import { getLeftSidebarCondensed } from '@/utils/user'

/**
 * Vertical layout
 */
export default {
  components: { NavBar, SideBar, RightBar, Footer },
  data() {
    return {
      type: this.$store
        ? this.$store.state.layout.leftSidebarType
        : null || null,
      width: this.$store ? this.$store.state.layout.layoutWidth : null || null,
      isMenuCondensed: true,
      maxHeight: document.documentElement.clientHeight,
      observer: null,
    };
  },
  computed: {
    ...layoutComputed,
  },
  created: () => {
    document.body.removeAttribute("data-layout", "horizontal");
    document.body.removeAttribute("data-topbar", "dark");
    document.body.removeAttribute("data-layout-size", "boxed");
    document.body.classList.remove("auth-body-bg");
  },
  watch: {
    leftSidebarCondensed: {
      handler(newVal) {
        if (newVal) {
          document.body.classList.add("vertical-collpsed");
        } else {
          document.body.classList.remove("vertical-collpsed");
        }
        // 根据收起模式调整主内容区域左边距
        this.applyMainContentMargin();
      },
    },
  },
  methods: {
    toggleMenu() {
      document.body.classList.toggle("sidebar-enable");

      if (window.screen.width >= 992) {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
          document.body.classList.remove("vertical-collpsed");
        });
        document.body.classList.toggle("vertical-collpsed");
      } else {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
        });
        document.body.classList.remove("vertical-collpsed");
      }
      this.isMenuCondensed = !this.isMenuCondensed;
      this.$store.dispatch("layout/changeLeftSidebar", {
        leftSidebarCondensed: !this.leftSidebarCondensed,
      });
    },
    toggleRightSidebar() {
      document.body.classList.toggle("right-bar-enabled");
    },
    hideRightSidebar() {
      document.body.classList.remove("right-bar-enabled");
    },
    observeBodyClass() {
      const targetNode = document.body; // 监听 body
      const config = { childList: true }; // 只监听 class 属性变化

      this.observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains("offcanvas")) {
              this.$store.dispatch("layout/changeLeftSidebar", {
                leftSidebarCondensed: true,
              });
            }
          });
        }
      });
      this.observer.observe(targetNode, config);
    },
    applyMainContentMargin() {
      try {
        const mode = getMenuBarCollapseMode && getMenuBarCollapseMode();
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        if (this.leftSidebarCondensed && mode === 'float') {
          mainContent.style.marginLeft = '0px';
        } else {
          // 清理为样式表默认值，由样式系统决定
          mainContent.style.marginLeft = '';
        }
      } catch (e) {
        // 忽略本地存储读取等异常
      }
    },
  },
  mounted() {
    if (this.loader === true) {
      document.getElementById("preloader").style.display = "block";
      document.getElementById("status").style.display = "block";

      setTimeout(function () {
        document.getElementById("preloader").style.display = "none";
        document.getElementById("status").style.display = "none";
      }, 2500);
    } else {
      document.getElementById("preloader").style.display = "none";
      document.getElementById("status").style.display = "none";
    }
    if (this.leftSidebarCondensed) {
      document.body.classList.add("vertical-collpsed");
    } else {
      document.body.classList.remove("vertical-collpsed");
    }
    // 初始时也根据模式应用一次
    this.applyMainContentMargin();
    this.observeBodyClass(); // 监听 body 类的变化
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
};
</script>

<template>
  <div>
    <div id="preloader">
      <div id="status">
        <div class="spinner-chase">
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
        </div>
      </div>
    </div>
    <div id="layout-wrapper">
      <NavBar />
      <SideBar
        :is-condensed="isMenuCondensed"
        :type="leftSidebarType"
        :width="layoutWidth"
      />
      <!-- ============================================================== -->
      <!-- Start Page Content here -->
      <!-- ============================================================== -->

      <div class="main-content">
        <div
          class="page-content"
          :style="{ height: maxHeight + 'px', 'overflow-y': 'scroll' }"
        >
          <!-- Start Content-->
          <b-container fluid>
            <slot />
          </b-container>
        </div>
        <Footer />
      </div>
      <RightBar />
    </div>
  </div>
</template>
