<script>
// import i18n from "../i18n";

import { layoutComputed,userComputed,workbenchComputed } from "@/state/helpers";
import { switchoverAccount } from "@/api/user";
import { getSumForWorkbench } from "@/api/dashboard";
import i18n from "../i18n";
import { setToken } from "@/utils/auth";
import CreatWorkHour from "@/components/top-nav/workhour-creat";
import ReleaseSidebar from "@/components/sidebar/release-sidebar.vue";
import ToolList from "@/components/top-nav/tool-list";

/**
 * Horizontal-topbar component
 */
export default {
  props: {
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
    ...userComputed,
    ...workbenchComputed,
    currentRoute(){
      return this.$route.path
    }
  },
  components: {
    ReleaseSidebar,
    CreatWorkHour,
    ToolList
  },
  data() {
    return {
      // languages: [
      //   {
      //     flag: require("@/assets/images/flags/us.jpg"),
      //     language: "en",
      //     title: "English",
      //   },
      //   {
      //     flag: require("@/assets/images/flags/french.jpg"),
      //     language: "fr",
      //     title: "French",
      //   },
      //   {
      //     flag: require("@/assets/images/flags/spain.jpg"),
      //     language: "es",
      //     title: "spanish",
      //   },
      //   {
      //     flag: require("@/assets/images/flags/chaina.png"),
      //     language: "zh",
      //     title: "Chinese",
      //   },
      //   {
      //     flag: require("@/assets/images/flags/arabic.png"),
      //     language: "ar",
      //     title: "Arabic",
      //   },
      // ],
      lang: "zh",
      lan: i18n.locale,
      text: null,
      flag: null,
      value: null,
      avatarLoadError: false,
      showSwicthAccout: false,
      accountValue: "",
      isReleaseDetail:false,
      creatwhModal: false,
      matterNumber: 0
    };
  },
  // mounted() {
  //   if (process.env.VUE_APP_I18N_LOCALE) {
  //     this.flag = this.$i18n.locale || process.env.VUE_APP_I18N_LOCALE;
  //     this.languages.forEach((item) => {
  //       if (item.language == this.flag) {
  //         document.getElementById("header-lang-img").setAttribute("src", item.flag);
  //       }
  //     });
  //   }
  // },
  methods: {
    fetchMatterNumber(){
      getSumForWorkbench().then(res=>{
        this.matterNumber = res.data.matterSum || 0;
      })
    },
    showMatter(){
      this.$store.commit("workbench/UPDATE_SHOW_MATTER", true);
    },
    toggleReleasesSidebar() {
      this.isReleaseDetail = true
    },
    releaseSidebarUpdate(value) {
      this.isReleaseDetail = value
    },
    creatwhModalUpdate(value) {
      this.creatwhModal = value;
    },
    creatWorkTime() {
      this.creatwhModal = true;
    },
    toProfile() {
      this.$router.push({
        path: "/personal-profile",
      });
    },
    clicksw() {
      this.showSwicthAccout = true;
    },
    logout() {
      this.$store.dispatch("user/logout");
    },
    switchAccount() {
      if (this.accountValue) {
        switchoverAccount({ userId: this.accountValue }).then((res) => {
          this.$store.commit("user/SET_TOKEN", res.tokenID);
          setToken(res.tokenID);
          // 直接跳转到首页，这将导致整个应用重新加载
          window.location.href = '/v2/';
        });
      }
    },
    handleAvatarError() {
      this.avatarLoadError = true;
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    toggleMenu() {
      let element = document.getElementById("topnav-menu-content");
      element.classList.toggle("show");
    },
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */ !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    // setLanguage(locale, country, flag) {
    //   this.lan = locale;
    //   this.text = country;
    //   this.flag = flag;
    //   document.getElementById("header-lang-img").setAttribute("src", flag);
    //   this.$i18n.locale = locale;
    // },
  },
  watch: {
    type: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.body.setAttribute("data-topbar", "dark");
              document.body.removeAttribute("data-layout-scrollable");
              break;
            case "light":
              document.body.setAttribute("data-topbar", "light");
              document.body.removeAttribute("data-layout-size", "boxed");
              document.body.removeAttribute("data-layout-scrollable");
              break;
            case "colored":
              document.body.setAttribute("data-topbar", "colored");
              document.body.removeAttribute("data-layout-size", "boxed");
              break;
            default:
              document.body.setAttribute("data-topbar", "dark");
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
              document.body.removeAttribute("data-layout-scrollable");
              document.body.removeAttribute("data-layout-size");
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
    isShowMatter(){
      this.fetchMatterNumber();
    }
  },
  mounted(){
    this.fetchMatterNumber();
  }
};
</script>

<template>
  <header id="page-topbar">
    <div class="navbar-header">
      <div class="d-flex">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <router-link to="/" class="logo logo-dark">
            <span class="logo-sm">
              <img src="@/assets/images/logo.svg" alt height="22" />
            </span>
            <span class="logo-lg">
              <img src="@/assets/images/logo-dark.png" alt height="17" />
            </span>
          </router-link>

          <router-link to="/" class="logo logo-light">
            <span class="logo-sm">
              <img src="@/assets/images/logo-light.svg" alt height="22" />
            </span>
            <span class="logo-lg">
              <img src="@/assets/images/logo-light.png" alt height="40" width="110" />
            </span>
          </router-link>
        </div>

        <button id="toggle" type="button" class="btn btn-sm me-2 font-size-16 d-lg-none header-item" @click="toggleMenu">
          <i class="fa fa-fw fa-bars"></i>
        </button>
        <div 
          class="d-flex"
          id="storage-box"
          style="align-items: center;margin-left: 10px;"
          @click="showMatter"
          :style="{ 'opacity': (!isShowMatter && permissions.includes(496) && currentRoute == '/') ? 1 : 0, 'pointer-events': (!isShowMatter && permissions.includes(496) && currentRoute == '/') ? 'all' : 'none' }"
        >
          <el-button type="primary">
            <span>待办</span>
            <span class="matter-number">{{ matterNumber }}</span>
          </el-button>
        </div>
      </div>

      <div class="d-flex">
        <b-dropdown class="d-inline-block d-lg-none ms-2" variant="black"
          menu-class="dropdown-menu-lg p-0 dropdown-menu-end" toggle-class="header-item noti-icon" right>
          <template v-slot:button-content>
            <i class="mdi mdi-magnify"></i>
          </template>

          <form class="p-3">
            <div class="form-group m-0">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Search ..." aria-label="Recipient's username" />
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit">
                    <i class="mdi mdi-magnify"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </b-dropdown>
        <!-- 语言切换 -->
        <!-- <div class="dropdown d-inline-block">
          <button type="button" class="btn header-item" data-bs-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <img id="header-lang-img" src="@/assets/images/flags/us.jpg" alt="Header Language" height="16" />
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            <b-link href="#" v-for="(entry, i) in languages" :key="`Lang${i}`" :value="entry"
              @click="setLanguage(entry.language, entry.title, entry.flag)" :class="{ active: lan === entry.language }"
              class="dropdown-item notify-item language">
              <img :src="entry.flag" alt="user-image" class="me-1" height="12" />
              <span class="align-middle">{{ entry.title }}</span>
            </b-link>
          </div>
        </div> -->
        <div class="dropdown d-none d-lg-inline-block ms-1">
          <div
            class="btn header-item noti-icon"
            @click="creatWorkTime"
          >
            <i class="mdi mdi-clock-time-three-outline"></i>
          </div>
        </div>
        <b-dropdown
          class="d-lg-inline-block noti-icon"
          menu-class="dropdown-menu-lg dropdown-menu-end"
          right
          toggle-class="header-item"
          variant="black"
          v-if="permissions.includes(441) || permissions.includes(482) || permissions.includes(501)"
        >
          <template v-slot:button-content>
            <i class="bx bx-customize"></i>
          </template>
          <ToolList />
        </b-dropdown>
        <!-- <div class="dropdown d-none d-lg-inline-block ms-1">
          <button type="button" class="btn header-item noti-icon" @click="initFullScreen">
            <i class="bx bx-fullscreen"></i>
          </button>
        </div> -->

        <!-- <b-dropdown menu-class="dropdown-menu-lg p-0 dropdown-menu-end" toggle-class="header-item noti-icon"
          variant="black">
          <template v-slot:button-content>
            <i class="bx bx-bell bx-tada"></i>
            <span class="badge bg-danger rounded-pill">{{
              $t("navbar.dropdown.notification.badge")
            }}</span>
          </template>

          <div class="p-3">
            <div class="row align-items-center">
              <div class="col">
                <h6 class="m-0">
                  {{ $t("navbar.dropdown.notification.text") }}
                </h6>
              </div>
              <div class="col-auto">
                <a href="#" class="small">{{
                  $t("navbar.dropdown.notification.subtext")
                }}</a>
              </div>
            </div>
          </div>
          <SimpleBar style="max-height: 230px">
            <a href="#" class="text-reset notification-item">
              <div class="d-flex">
                <div class="avatar-xs me-3">
                  <span class="avatar-title bg-primary rounded-circle font-size-16">
                    <i class="bx bx-cart"></i>
                  </span>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mt-0 mb-1">
                    {{ $t("navbar.dropdown.notification.order.title") }}
                  </h6>
                  <div class="font-size-12 text-muted">
                    <p class="mb-1">
                      {{ $t("navbar.dropdown.notification.order.text") }}
                    </p>
                    <p class="mb-0">
                      <i class="mdi mdi-clock-outline"></i>
                      {{ $t("navbar.dropdown.notification.order.time") }}
                    </p>
                  </div>
                </div>
              </div>
            </a>
            <a href="#" class="text-reset notification-item">
              <div class="d-flex">
                <img src="@/assets/images/users/avatar-3.jpg" class="me-3 rounded-circle avatar-xs" alt="user-pic" />
                <div class="flex-grow-1">
                  <h6 class="mt-0 mb-1">
                    {{ $t("navbar.dropdown.notification.james.title") }}
                  </h6>
                  <div class="font-size-12 text-muted">
                    <p class="mb-1">
                      {{ $t("navbar.dropdown.notification.james.text") }}
                    </p>
                    <p class="mb-0">
                      <i class="mdi mdi-clock-outline"></i>
                      {{ $t("navbar.dropdown.notification.james.time") }}
                    </p>
                  </div>
                </div>
              </div>
            </a>
            <a href="#" class="text-reset notification-item">
              <div class="d-flex">
                <div class="avatar-xs me-3">
                  <span class="avatar-title bg-success rounded-circle font-size-16">
                    <i class="bx bx-badge-check"></i>
                  </span>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mt-0 mb-1">
                    {{ $t("navbar.dropdown.notification.item.title") }}
                  </h6>
                  <div class="font-size-12 text-muted">
                    <p class="mb-1">
                      {{ $t("navbar.dropdown.notification.item.text") }}
                    </p>
                    <p class="mb-0">
                      <i class="mdi mdi-clock-outline"></i>
                      {{ $t("navbar.dropdown.notification.item.time") }}
                    </p>
                  </div>
                </div>
              </div>
            </a>
            <a href="#" class="text-reset notification-item">
              <div class="d-flex">
                <img src="@/assets/images/users/avatar-4.jpg" class="me-3 rounded-circle avatar-xs" alt="user-pic" />
                <div class="flex-grow-1">
                  <h6 class="mt-0 mb-1">
                    {{ $t("navbar.dropdown.notification.salena.title") }}
                  </h6>
                  <div class="font-size-12 text-muted">
                    <p class="mb-1">
                      {{ $t("navbar.dropdown.notification.salena.text") }}
                    </p>
                    <p class="mb-0">
                      <i class="mdi mdi-clock-outline"></i>
                      {{ $t("navbar.dropdown.notification.salena.time") }}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </SimpleBar>
          <div class="p-2 border-top d-grid">
            <a class="btn btn-sm btn-link font-size-14 text-center" href="#">
              <i class="mdi mdi-arrow-right-circle me-1"></i>
              <span key="t-view-more">
                {{ $t("navbar.dropdown.notification.button") }}</span>
            </a>
          </div>
        </b-dropdown> -->

        <!-- <b-dropdown right variant="black" toggle-class="header-item">
          <template v-slot:button-content>
            <img class="rounded-circle header-profile-user" src="@/assets/images/users/avatar-1.jpg"
              alt="Header Avatar" />
            <span class="d-none d-xl-inline-block ms-1">{{
              $t("navbar.dropdown.henry.text")
            }}</span>
            <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
          </template>
          <b-dropdown-item>
            <router-link to="/contacts/profile" v-slot="{ navigate }" custom>
              <span @click="navigate" @keypress.enter="navigate">
                <i class="bx bx-user font-size-16 align-middle me-1"></i>
                {{ $t("navbar.dropdown.henry.list.profile") }}
              </span>
            </router-link>
          </b-dropdown-item>
          <b-dropdown-item href="#">
            <i class="bx bx-wallet font-size-16 align-middle me-1"></i>
            {{ $t("navbar.dropdown.henry.list.mywallet") }}
          </b-dropdown-item>
          <b-dropdown-item class="d-block" href="#">
            <span class="badge bg-success float-end">11</span>
            <i class="bx bx-wrench font-size-16 align-middle me-1"></i>
            {{ $t("navbar.dropdown.henry.list.settings") }}
          </b-dropdown-item>
          <b-dropdown-item href="#">
            <i class="bx bx-lock-open font-size-16 align-middle me-1"></i>
            {{ $t("navbar.dropdown.henry.list.lockscreen") }}
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <a href="/logout" class="dropdown-item text-danger">
            <i class="bx bx-power-off font-size-16 align-middle me-1 text-danger"></i>
            {{ $t("navbar.dropdown.henry.list.logout") }}
          </a>
        </b-dropdown> -->
        <div class="dropdown d-inline-block">
          <button
            type="button"
            class="btn header-item noti-icon right-bar-toggle toggle-right"
            @click="toggleReleasesSidebar"
          >
            <i class="bx bx-help-circle"></i>
          </button>
        </div>
        <b-dropdown
          right
          variant="black"
          toggle-class="header-item"
          menu-class="dropdown-menu-end"
          ref="dropdownMenu"
        >
          <template v-slot:button-content>
            <img
              v-if="avatar && !avatarLoadError"
              class="rounded-circle header-profile-user"
              :src="`/ipdoc/${avatar}`"
              @error="handleAvatarError"
            />
            <img
              v-else
              class="rounded-circle header-profile-user"
              src="@/assets/images/users/defaultavatar.png"
              alt=""
            />
            <span class="d-none d-xl-inline-block ms-1">
              <div>{{ name }}</div>
            </span>
            <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
          </template>
          <!-- item-->
          <b-dropdown-item v-on:click="toProfile">
            <span>
              <i class="bx bx-user font-size-16 align-middle me-1"></i>
              {{ $t("navbar.dropdown.henry.list.profile") }}
            </span>
          </b-dropdown-item>
          <b-dropdown-item
            link-class="swtich-account"
            v-on:click="clicksw"
            v-if="permissions.includes(0)"
          >
            <i
              class="mdi mdi-account-convert-outline font-size-16 align-middle me-1"
            ></i>
            切换账户
          </b-dropdown-item>
          <el-popover
            :visible="showSwicthAccout"
            placement="bottom"
            :width="268"
            popper-class="hor-switch-account-popover"
            :show-arrow="false"
            ref="swtaPopover"
          >
            <el-select-v2
              v-model="accountValue"
              :options="
                userList?.filter((item) => !['李明'].includes(item.label)) || []
              "
              placeholder="请选择"
              style="width: 240px"
              filterable
              clearable
              class="account-select"
            />
            <div class="text-center mt-3">
              <b-button
                variant="light"
                @click="showSwicthAccout = false"
                >取消</b-button
              >
              <a
                href="javascript: void(0);"
                class="btn btn-primary ms-1"
                @click="switchAccount"
              >
                确认
              </a>
            </div>
          </el-popover>

          <b-dropdown-divider></b-dropdown-divider>
          <a
            href="javascript: void(0);"
            class="dropdown-item text-danger"
            @click="logout"
          >
            <i
              class="bx bx-power-off font-size-16 align-middle me-1 text-danger"
            ></i>
            {{ $t("navbar.dropdown.henry.list.logout") }}
          </a>
        </b-dropdown>

        <div class="dropdown d-inline-block">
          <button type="button" class="btn header-item noti-icon right-bar-toggle toggle-right"
            @click="toggleRightSidebar">
            <i class="bx bx-cog toggle-right"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
  <CreatWorkHour
    v-if="creatwhModal"
    :showModal="creatwhModal"
    @update:showModal="creatwhModalUpdate"
  />
  <ReleaseSidebar
    v-if="isReleaseDetail"
    :showSidebar="isReleaseDetail"
    @update:showSidebar="releaseSidebarUpdate"
  />
</template>
<style lang="scss">
.hor-switch-account-popover {
  top: 50px !important;
  right: 50px !important;
  left: auto !important;
}
.app-breadcrumb{
  .el-breadcrumb__separator{
    font-weight:normal
  }
  .el-breadcrumb__inner:hover{
    color: #4458b6;
  }
}
.account-select{
  .el-select__input{
    width: 100% !important;
  }
}
.matter-number{
  width: auto;
  min-width: 18px;
  height: 18px;
  background-color: #63c093;
  line-height: 1;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 4px;
  text-align: center;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  vertical-align: middle;
}
</style>
