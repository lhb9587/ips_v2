<script>
import { MetisMenu } from 'metismenujs';

import { menuItems } from "./menu";

import { layoutComputed } from "@/state/helpers";

/**
 * Sidenav component
 */
export default {
  data() {
    return {
      menuItems: menuItems,
      menuData: null,
      metisMenu: null,
      prevPermissions: null,
      subMenuFixedStyle: {},
      subMenuFixedKey: null,
      subMenuAllFixedTimer: null,
      subSubMenuFixedKey: null,
      subSubMenuFixedStyle: {},
      mainMenuFixedKey: null,
      mainMenuFixedStyle: {},
      mainMenuFixedTimer: null,
      isCollapsed: typeof document !== 'undefined' ? document.body.classList.contains('vertical-collpsed') : false,
    };
  },
  computed: {
    permissions(){
      const list = this.$store.state?.user?.permissions || []
      if (list.length > 0) {
        return this.$store.state.user.permissions
      }else{
        return []
      }
    },
    authMenuItems(){
      // const idlist = [2,3,4,5,22,84,85,213,299]
      const menus = this.filterMenusByPermissions(menuItems, this.permissions)
      return menus
    },
    ...layoutComputed
  },
  watch: {
    authMenuItems: {
      handler(newVal) {
        const currentPermissions = JSON.stringify(this.permissions);
        if (this.prevPermissions === currentPermissions) {
          return;
        }
        
        this.prevPermissions = currentPermissions;

        if (newVal) {
          this.$nextTick(() => {
            if (this.metisMenu) {
              this.metisMenu.dispose();
            }
            if (document.getElementById("side-menu")) {
              this.metisMenu = new MetisMenu("#side-menu");
            }
            this.initActiveMenu();
          });
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    /**
     * Returns true or false if given menu item has child or not
     * @param item menuItem
     */
    hasItems(item) {
      return item.subItems !== undefined ? item.subItems.length > 0 : false;
    },

    toggleMenu(event) {
      event.currentTarget.nextElementSibling.classList.toggle("mm-show");
    },

    //菜单权限控制
    filterMenusByPermissions(menus, idList) {  
      if (idList.length === 0) {
        return []
      }
      const menuList = menus.reduce((filteredMenus, menu) => {  
          // 检查当前菜单是否有permissions数组  
          if (!menu.permissions || menu.permissions.some(perm => idList?.includes(perm))) {  
              // 如果当前菜单没有permissions属性，或者当前菜单有权限  
              // 可能还有子菜单，递归处理子菜单  
              if (menu.subItems) {  
                  menu.subItems = this.filterMenusByPermissions(menu.subItems, idList);  
                  // 如果子菜单被过滤后为空，可以选择移除subItems属性（可选）  
                  if (menu.subItems.length === 0) {  
                      delete menu.subItems; // 可选步骤，取决于是否需要保留空数组或删除该属性  
                  }  
              }  
              // 添加当前菜单到结果数组  
              filteredMenus.push(menu);  
          }  
          // 注意：这里没有else if来处理只有子菜单有权限的情况，  
          // 因为如果当前菜单没有permissions或用户有权限，我们总是添加当前菜单（可能包含过滤后的子菜单）  
          // 不修改原始数组，只返回过滤后的新数组  
          return filteredMenus;  
      }, []);  
      
      return menuList;
  },
    initActiveMenu() {
      var links = document.getElementsByClassName("side-nav-link-ref");
      var matchingMenuItem = null;
      const paths = [];

      for (var i = 0; i < links.length; i++) {
        paths.push(links[i]["pathname"]);
      }
      var itemIndex = paths.indexOf(window.location.pathname);
      if (itemIndex === -1) {
        const strIndex = window.location.pathname.lastIndexOf("/");
        const item = window.location.pathname.substr(0, strIndex).toString();
        matchingMenuItem = links[paths.indexOf(item)];
      } else {
        matchingMenuItem = links[itemIndex];
      }
      if (matchingMenuItem) {
        matchingMenuItem.classList.add("active");
        var parent = matchingMenuItem.parentElement;

        if (parent) {
          parent.classList.add("mm-active");
          const parent2 = parent.parentElement.closest("ul");
          if (parent2 && parent2.id !== "side-menu") {
            parent2.classList.add("mm-show");

            const parent3 = parent2.parentElement;
            if (parent3) {
              parent3.classList.add("mm-active");
              var childAnchor = parent3.querySelector(".has-arrow");
              var childDropdown = parent3.querySelector(".has-dropdown");
              if (childAnchor) childAnchor.classList.add("mm-active");
              if (childDropdown) childDropdown.classList.add("mm-active");

              const parent4 = parent3.parentElement;
              if (parent4 && parent4.id !== "side-menu") {
                parent4.classList.add("mm-show");
                const parent5 = parent4.parentElement;
                if (parent5 && parent5.id !== "side-menu") {
                  parent5.classList.add("mm-active");
                  const childanchor = parent5.querySelector(".is-parent");
                  if (childanchor && parent5.id !== "side-menu") {
                    childanchor.classList.add("mm-active");
                  }
                }
              }
            }
          }
        }
      }
    },
    onSubMenuFixedEnter() {
      clearTimeout(this.subMenuAllFixedTimer);
    },
    onSubMenuFixedLeave(e) {
      // 鼠标进入一级菜单或二级菜单时不关闭
      if (this.isElementInMenu(e.relatedTarget, 'sub-menu', 'is-parent')) {
        return;
      }
      this.subMenuAllFixedTimer = setTimeout(() => {
        this.subMenuFixedKey = null;
        this.subSubMenuFixedKey = null;
      }, 200);
    },
    onSubSubMenuFixedEnter() {
      clearTimeout(this.subMenuAllFixedTimer);
      if (!this.subMenuFixedKey) {
        this.subMenuFixedKey = this.subSubMenuFixedKey ? this.subSubMenuFixedKey.split('-')[0] : null;
      }
    },
    onSubSubMenuFixedLeave(e) {
      // 鼠标进入二级菜单时不关闭
      if (this.isElementInMenu(e.relatedTarget, 'sub-menu', 'side-nav-link-a-ref')) {
        return;
      }
      this.subMenuAllFixedTimer = setTimeout(() => {
        this.subMenuFixedKey = null;
        this.subSubMenuFixedKey = null;
      }, 200);
    },
    isElementInMenu(target, ...classNames) {
      // 判断目标元素或其父元素是否有指定class
      while (target) {
        if (target.classList) {
          for (const cls of classNames) {
            if (target.classList.contains(cls)) return true;
          }
        }
        target = target.parentElement;
      }
      return false;
    },
    onSubMenuEnter(e, item) {
      clearTimeout(this.subMenuAllFixedTimer);
      if (document.body.classList.contains('vertical-collpsed')) {
        const rect = e.currentTarget.getBoundingClientRect();
        const menuItemHeight = 40; // 每项高度 40px
        const menuHeight = (item.subItems?.length || 1) * menuItemHeight;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let style = {
          position: 'fixed',
          left: rect.right + 'px',
          zIndex: 9999,
          minWidth: '190px',
          maxWidth: '320px',
          background: '$sidebar-dark-bg',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        };

        if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
          // 下方空间足够，向下展开
          style.top = rect.top + 'px';
        } else {
          // 上方空间更多，向上展开
          style.bottom = (window.innerHeight - rect.bottom + 1) + 'px';
        }

        this.subMenuFixedStyle = style;
        this.subMenuFixedKey = item.id;
      }
    },
    onSubMenuLeave(e) {
      if (!e?.relatedTarget) {
        return;
      }
      if (this.isElementInMenu(e.relatedTarget, 'sub-menu', 'is-parent')) {
        return;
      }
      this.subMenuAllFixedTimer = setTimeout(() => {
        this.subMenuFixedKey = null;
        this.subSubMenuFixedKey = null;
      }, 200);
    },
    onSubSubMenuEnter(e, subitem, parentItem) {
      clearTimeout(this.subMenuAllFixedTimer);
      if (document.body.classList.contains('vertical-collpsed')) {
        const rect = e.currentTarget.getBoundingClientRect();
        const menuItemHeight = 40; // 每项高度 40px
        const menuHeight = (subitem.subItems?.length || 1) * menuItemHeight;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let style = {
          position: 'fixed',
          left: rect.right + 'px',
          zIndex: 10000,
          minWidth: '190px',
          maxWidth: '320px',
          background: '$sidebar-dark-bg',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        };

        if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
          style.top = rect.top + 'px';
        } else {
          style.bottom = (window.innerHeight - rect.bottom + 1) + 'px';
        }

        this.subSubMenuFixedStyle = style;
        this.subSubMenuFixedKey = parentItem.id + '-' + subitem.id;
      }
    },
    onSubSubMenuLeave() {
      this.subMenuAllFixedTimer = setTimeout(() => {
        this.subMenuFixedKey = null;
        this.subSubMenuFixedKey = null;
      }, 200);
    },
    getSubMenuStyle(item) {
      if (this.subMenuFixedKey === item.id) {
        return this.subMenuFixedStyle;
      }
      return {};
    },
    getSubSubMenuStyle(subitem, parentItem) {
      if (this.subSubMenuFixedKey === parentItem.id + '-' + subitem.id) {
        return this.subSubMenuFixedStyle;
      }
      return {};
    },
    onMainMenuEnter(e, item) {
      if (document.body.classList.contains('vertical-collpsed')) {
        clearTimeout(this.mainMenuFixedTimer);
        const rect = e.currentTarget.getBoundingClientRect();
        let maxHeight = window.innerHeight - rect.top - 20;
        let top = rect.top;
        let alignBottom = false;
        if (maxHeight < 60 && rect.top > window.innerHeight / 2) {
          maxHeight = rect.bottom - 20;
          top = undefined;
          alignBottom = true;
        }
        this.mainMenuFixedStyle = {
          position: 'fixed',
          left: rect.right + 'px',
          height: '55px',
          width: '190px',
          zIndex: 9999,
          background: '#2E3548',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          fontWeight: 400,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          color: '#79829C',
        };
        if (alignBottom) {
          this.mainMenuFixedStyle.bottom = (window.innerHeight - rect.bottom + 1) + 'px';
        } else {
          this.mainMenuFixedStyle.top = top + 'px';
        }
        this.mainMenuFixedKey = item.id;
      }
    },
    onMainMenuLeave() {
      this.mainMenuFixedTimer = setTimeout(() => {
        this.mainMenuFixedKey = null;
      }, 200);
    },
    onMainMenuFixedEnter() {
      clearTimeout(this.mainMenuFixedTimer);
    },
    onMainMenuFixedLeave() {
      this.mainMenuFixedKey = null;
    },
  },
  beforeUnmount() {
    if (this.metisMenu) {
      this.metisMenu.dispose();
    }
    if (this._sidebarCollapseObserver) {
      this._sidebarCollapseObserver.disconnect();
    }
  },
  mounted() {
    // 监听body的vertical-collpsed类变化，菜单展开时关闭所有浮动菜单
    const body = document.body;
    this._sidebarCollapseObserver = new MutationObserver(() => {
      this.isCollapsed = body.classList.contains('vertical-collpsed');
      if (!this.isCollapsed) {
        this.subMenuFixedKey = null;
        this.subSubMenuFixedKey = null;
        this.mainMenuFixedKey = null;
      }
    });
    this._sidebarCollapseObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
  },
};
</script>

<template>
  <!-- ========== Left Sidebar Start ========== -->

  <!--- Sidemenu -->
  <div id="sidebar-menu">
    <!-- Left Menu Start -->
    <ul id="side-menu" class="metismenu list-unstyled">
      <template v-for="item in authMenuItems" :key="item.id">
        <!-- <li class="menu-title" v-if="item.isTitle" :key="item.id">
          {{ $t(item.label) }}
        </li> -->
        <li
            @mouseenter="hasItems(item) ? onSubMenuEnter($event, item) : onMainMenuEnter($event, item)"
            @mouseleave="hasItems(item) ? onSubMenuLeave() : onMainMenuLeave()">
          <a v-if="hasItems(item)" class="is-parent"
            :class="{ 'has-arrow': !item.badge, 'has-dropdown': item.badge }">
            <i :class="`bx ${item.icon}`" v-if="item.icon"></i>
            <span>{{ $t(item.label) }}</span>
            <span :class="`badge rounded-pill bg-${item.badge.variant} float-end`" v-if="item.badge">{{
              $t(item.badge.text) }}</span>
          </a>

          <router-link :to="item?.link || '/'" v-if="!hasItems(item)" class="side-nav-link-ref">
            <i :class="`bx ${item.icon}`" v-if="item.icon"></i>
            <span>{{ $t(item.label) }}</span>
            <span v-if="!item.link?.includes('workbench')" class="float-end icon iconfont icon-New new-menuItem" style="font-size: 14px"></span>
            <span :class="`badge rounded-pill bg-${item.badge.variant} float-end`" v-if="item.badge">{{
              $t(item.badge.text) }}</span>
          </router-link>

          <div v-if="mainMenuFixedKey === item.id && !hasItems(item)"
            :style="mainMenuFixedStyle"
            @mouseenter="onMainMenuFixedEnter"
            @mouseleave="onMainMenuFixedLeave"
            @click="$router.push(item.link || '/')"
            style="cursor:pointer;color: #fff;"
          >
            <span>{{ $t(item.label) }}</span>
          </div>

          <ul v-if="hasItems(item)" class="sub-menu mm-collapse" aria-expanded="false"
              :style="getSubMenuStyle(item)"
              @mouseenter="onSubMenuFixedEnter"
              @mouseleave="onSubMenuFixedLeave($event)">
            <li
              v-if="isCollapsed"
              class="side-nav-parent-label"
              style="color: #fff; padding: 8px 16px; cursor: default;"
            >
              {{ $t(item.label) }}
            </li>
            <li v-for="(subitem, index) of item.subItems" :key="index"
                @mouseenter="onSubSubMenuEnter($event, subitem, item)"
                @mouseleave="onSubSubMenuLeave($event)">
              <router-link :to="subitem?.link || '/'" v-if="!hasItems(subitem)" class="side-nav-link-ref">
                <span>{{ $t(subitem.label) }}</span>
                <span v-if="!subitem.link?.includes('workbench')" class="float-end icon iconfont icon-New new-menuItem" style="font-size: 14px"></span>
                <span :class="`badge rounded-pill bg-${subitem.badge.variant} float-end`" v-if="subitem.badge">{{
                  $t(subitem.badge.text) }}</span>
              </router-link>
              <a v-if="hasItems(subitem)" class="side-nav-link-a-ref has-arrow" >{{
                $t(subitem.label) }}</a>
              <ul v-if="hasItems(subitem)" class="sub-menu mm-collapse" aria-expanded="false"
                  :style="getSubSubMenuStyle(subitem, item)"
                  @mouseenter="onSubSubMenuFixedEnter"
                  @mouseleave="onSubSubMenuFixedLeave($event)">
                <li v-for="(subSubitem, index) of subitem.subItems" :key="index">
                  <router-link :to="subSubitem?.link || '/'" class="side-nav-link-ref">
                      <span>{{ $t(subSubitem.label) }}</span>
                      <span v-if="!subSubitem.link?.includes('workbench')" class="float-end icon iconfont icon-New new-menuItem" style="font-size: 14px"></span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
  <!-- Sidebar -->
</template>
<style scoped lang="scss">
.new-menuItem {
  color: #a7c3df !important;
  height: 14px;
}
</style>