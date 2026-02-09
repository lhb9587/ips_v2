<script>
import { layoutMethods } from "@/state/helpers";
import { menuItems } from "./menu.js";
// import { getUserInfo } from "@/utils/user";

export default {
  data() {
    return {
      menuItems: menuItems,
      prevPermissions: null,
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
    }
  },
  mounted() {
    var links = document.getElementsByClassName("side-nav-link-ref");
    var matchingMenuItem = null;
    for (var i = 0; i < links.length; i++) {
      if (window.location.pathname === links[i].pathname) {
        matchingMenuItem = links[i];
        break;
      }
    }

    if (matchingMenuItem) {
      matchingMenuItem.classList.add("active");
      var parent = matchingMenuItem.parentElement;

      /**
       * TODO: This is hard coded way of expading/activating parent menu dropdown and working till level 3.
       * We should come up with non hard coded approach
       */

      if (parent) {
        parent.classList.add("active");
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.add("active");
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.add("active");
            const parent4 = parent3.parentElement;
            if (parent4) {
              parent4.classList.add("active");
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.add("active");
                const parent6 = parent5.parentElement;
                if (parent6) {
                  parent6.classList.add("active");
                }
              }
            }
          }
        }
      }
    }
  },
  watch: {
    authMenuItems: {
      handler() {
        const currentPermissions = JSON.stringify(this.permissions);
        if (this.prevPermissions === currentPermissions) {
          return;
        }
        this.prevPermissions = currentPermissions;
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    ...layoutMethods,
    /**
     * Menu clicked show the submenu
     */
    onMenuClick(event) {
      event.preventDefault();
      // const nextEl = event.target.nextSibling;
      // if (nextEl && !nextEl.classList.contains("show")) {
      //   const parentEl = event.target.parentNode;
      //   if (parentEl) {
      //     parentEl.classList.remove("show");
      //   }
      //   nextEl.classList.add("show");
      // } else if (nextEl) {
      //   nextEl.classList.remove("show");
      // }
      // return false;
    },
    /**
     * Returns true or false if given menu item has child or not
     * @param item menuItem
     */
    hasItems(item) {
      return item.subItems !== undefined ? item.subItems.length > 0 : false;
    },
    //菜单权限控制
    filterMenusByPermissions(menus, idList) {  
      if (idList.length === 0) {
        return []
      }
      const menuList = menus.reduce((filteredMenus, menu) => {  
          // 检查当前菜单是否有permissions数组  
          if (!menu.permissions || menu.permissions.some(perm => idList.includes(perm))) {  
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
  },
};
</script>
<template>
  <div class="topnav">
    <b-container fluid>
      <nav class="navbar navbar-light navbar-expand-lg topnav-menu active">
        <div
          class="collapse navbar-collapse active"
          id="topnav-menu-content"
        >
          <ul class="navbar-nav">
            <!-- Menu data -->
            <template
              v-for="(item,index) of authMenuItems"
              :key="index"
            >
              <li class="nav-item dropdown">
                <router-link
                  class="nav-link dropdown-toggle arrow-none"
                  v-if="!item.subItems"
                  id="topnav-components"
                  :to="item.link"
                  role="button"
                >
                  <i :class="`bx ${item.icon} me-2`"></i>{{ $t(item.label) }}
                  <div
                    class="arrow-down"
                    v-if="hasItems(item)"
                  ></div>
                </router-link>

                <a
                  v-if="item.subItems"
                  class="nav-link dropdown-toggle arrow-none"
                  @click="onMenuClick($event)"
                  id="topnav-components"
                  role="button"
                >
                  <i :class="`bx ${item.icon} me-1`"></i>
                  {{ $t(item.label) }}
                  <div class="arrow-down"></div>
                </a>

                <div
                  class="dropdown-menu"
                  aria-labelledby="topnav-dashboard"
                  v-if="hasItems(item)"
                  
                >
                  <template v-for="(subitem, index) of item.subItems">
                    <router-link
                      class="col dropdown-item side-nav-link-ref"
                      :key="index"
                      v-if=" !hasItems(subitem)"
                      :to="subitem.link"
                      >{{ $t(subitem.label) }}</router-link
                    >
                    <!-- <div
                      v-if="item.subItems.length >= 11"
                      :key="index"
                    >
                      <div
                        v-if="index % 3 == 0"
                        class="row"
                      >
                        <div class="col-lg-4">
                          <router-link
                            class="dropdown-item side-nav-link-ref"
                            :to="subitem.link"
                            >{{ $t(item.subItems[index].label) }}</router-link
                          >
                        </div>
                        <div
                          class="col-lg-4"
                          v-if="item.subItems[index + 1].link"
                        >
                          <router-link
                            class="dropdown-item side-nav-link-ref"
                            :to="item.subItems[index + 1].link"
                            >{{
                              $t(item.subItems[index + 1].label)
                            }}</router-link
                          >
                        </div>
                        <div
                          class="col-lg-4"
                          v-if="item.subItems[index + 2].link"
                        >
                          <router-link
                            class="dropdown-item side-nav-link-ref"
                            :to="item.subItems[index + 2].link"
                            >{{
                              $t(item.subItems[index + 2].label)
                            }}</router-link
                          >
                        </div>
                      </div>
                    </div> -->
                    <!-- <div
                      v-if="item.subItems.length >= 11"
                      :key="index"
                    >
                      <div
                        v-if="index % 3 == 0"
                        class="row"
                      >
                        <template
                          v-for="(subitem, subIndex) in item.subItems.slice(
                            index,
                            index + 3
                          )"
                          :key="subIndex"
                        >
                          <div
                            class="col-lg-4"
                            v-if="subitem.link"
                          >
                            <router-link
                              class="dropdown-item side-nav-link-ref"
                              :to="subitem.link"
                            >
                              {{ $t(subitem.label) }}
                            </router-link>
                          </div></template
                        >
                      </div>
                    </div> -->

                    <div
                      class="dropdown"
                      v-if="hasItems(subitem)"
                      :key="index"
                    >
                      <a
                        class="dropdown-item dropdown-toggle"
                        href="#"
                        @click="onMenuClick($event)"
                        >{{ $t(subitem.label) }}
                        <div class="arrow-down"></div>
                      </a>
                      <div class="dropdown-menu">
                        <template
                          v-for="(subSubitem, index) of subitem.subItems"
                        >
                          <router-link
                            class="dropdown-item side-nav-link-ref"
                            :key="index"
                            v-if="!hasItems(subSubitem)"
                            :to="subSubitem.link"
                            >{{ $t(subSubitem.label) }}</router-link
                          >
                          <div
                            class="dropdown"
                            v-if="hasItems(subSubitem)"
                            :key="index"
                          >
                            <a
                              class="dropdown-item dropdown-toggle"
                              href="#"
                              @click="onMenuClick($event)"
                              >{{ $t(subSubitem.label) }}
                              <div class="arrow-down"></div>
                            </a>
                            <div class="dropdown-menu">
                              <template
                                v-for="(
                                  subSubSubitem, index
                                ) of subSubitem.subItems"
                                :key="index"
                              >
                                <router-link
                                  class="dropdown-item side-nav-link-ref"
                                  :to="subSubSubitem.link"
                                  routerLinkActive="active"
                                  >{{ $t(subSubSubitem.label) }}</router-link
                                >
                              </template>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </template>
                </div>
              </li>
            </template>
          </ul>
        </div>
      </nav>
    </b-container>
  </div>
</template>
