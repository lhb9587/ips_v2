<script>
import { userComputed,workbenchComputed,layoutComputed } from "@/state/helpers";
import i18n from "../i18n";
import { switchoverAccount } from "@/api/user";
import { getSumForWorkbench } from "@/api/dashboard";
import { setToken } from "@/utils/auth";
import { useRoute } from "vue-router";
import { getUserInfo } from "@/utils/user";
import ToolList from "@/components/top-nav/tool-list";
import CreatWorkHour from "@/components/top-nav/workhour-creat";
import ReleaseSidebar from "@/components/sidebar/release-sidebar.vue";
import PinYinMatch from "pinyin-match";
import Tabs from "@/components/common/tabs";

/**
 * Nav-bar Component
 */
export default {
  data() {
    return {
      lang: "en",
      lan: i18n.locale,
      text: null,
      flag: null,
      value: null,
      creatwhModal: false,
      isReleaseDetail:false,
      matterNumber:0,
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
      //     title: "Spanish",
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
      locales: ["fr", "en", "ar"],
      showSwicthAccout: false,
      accountValue: "",
      avatarLoadError: false,
      accountKeyword: '',
      //显示类型
      showTypeTabsList:[
        {
          // label: "文件夹视图",
          value: "folder",
          icon: "bx bx-folder-open",
        },
        {
          // label: "列表视图",
          value: "list",
          icon: "bx bx-list-ul",
        },
      ],
      custShowTypeTabsList:[
        {
          // label: "文件夹视图",
          value: "folder",
          icon: "bx bx-folder-open",
        },
        {
          // label: "目录视图",
          value: "directory",
          icon: "mdi mdi-file-tree",
        },
        {
          // label: "列表视图",
          value: "list",
          icon: "bx bx-list-ul",
        },
      ],
    };
  },
  components: { CreatWorkHour, ReleaseSidebar,ToolList,Tabs },
  // mounted() {
  //   if (process.env.VUE_APP_I18N_LOCALE) {
  //     this.flag = this.$i18n.locale || process.env.VUE_APP_I18N_LOCALE;
  //     this.languages?.forEach((item) => {
  //       if (item.language == this.flag) {
  //         document
  //           .getElementById("header-lang-img")
  //           .setAttribute("src", item.flag);
  //       }
  //     });
  //   }
  // },
  methods: {
    getUserInfo,
    switchCaseShowType(value){
      this.$store.commit("layout/CHANGE_CASE_SHOWTYPE",value)
    },
    switchProjectShowType(value){
      this.$store.commit("layout/CHANGE_PROJECT_SHOWTYPE",value)
    },
    switchCustShowType(value){
      this.$store.commit("layout/CHANGE_CUST_SHOWTYPE",value)
    },
    switchMyTaskShowType(value){
      this.$store.commit("layout/CHANGE_MYTASK_SHOWTYPE",value)
    },
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
    handleAvatarError() {
      this.avatarLoadError = true;
    },
    closeSwicthAccout() {
      this.$refs.swtaPopover.hide();
    },
    clicksw() {
      this.showSwicthAccout = true;
    },
    switchAccount() {
      if (this.accountValue) {
        switchoverAccount({ userId: this.accountValue }).then((res) => {
          this.$store.commit("user/SET_TOKEN", res.tokenID);
          setToken(res.tokenID);
          // 直接跳转到首页，这将导致整个应用重新加载
          window.location.href = "/v2/";
        });
      }
    },
    toProfile() {
      this.$router.push({
        path: "/personal-profile",
      });
    },
    creatWorkTime() {
      this.creatwhModal = true;
    },
    logout() {
      this.$store.dispatch("user/logout");
    },
    toggleMenu() {
      this.$parent.toggleMenu();
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
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
    setLanguage(locale, country, flag) {
      this.lan = locale;
      this.text = country;
      this.flag = flag;
      document.getElementById("header-lang-img").setAttribute("src", flag);
      this.$i18n.locale = locale;
    },
    toFirstChild(item) {
      if (item.children?.length > 0) {
        this.toFirstChild(item.children[0]);
      } else {
        this.$router.push({
          path: item.path,
        });
      }
    },
    handleLink(item) {
      if (item.name === "case" || item.name === "project") {
        this.toFirstChild(item);
      }
    },
    onAccountFilter(keyword) {
      this.accountKeyword = keyword;
    },
  },
  computed: {
    ...userComputed,
    ...workbenchComputed,
    ...layoutComputed,
    matched() {
      const route = useRoute()?.matched;
      if (!route) return [];
      // 过滤掉连续重复的title项
      return route.filter((item, index, arr) => {
        if (index === 0) return true;
        return item.meta.title !== arr[index - 1].meta.title;
      });
    },
    currentRoute(){
      return this.$route?.path
    },
    filteredUserList() {
      // 你原有的 userList 数据请用 this.userList 替换
      const userList = this.userList || [];
      if (!this.accountKeyword) return userList;
      return userList.filter(item => {
        return (
          item.label.includes(this.accountKeyword) ||
          PinYinMatch.match(item.label, this.accountKeyword)
        );
      });
    }
  },
  watch:{
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
        <div 
          class="navbar-brand-box"
          v-if="!(menuBarCollapseMode === 'float' && leftSidebarCondensed)"
        >
          <!-- <router-link
            to="/"
            class="logo logo-dark"
          >
            <span class="logo-sm">
              <img
                src="@/assets/images/logo.svg"
                alt
                height="22"
              />
            </span>
            <span class="logo-lg">
              <img
                src="@/assets/images/logo-dark.png"
                alt
                height="17"
              />
            </span>
          </router-link> -->

          <router-link
            to="/"
            class="logo logo-light"
          >
            <span class="logo-sm">
              <img
                src="@/assets/images/logo-light.svg"
                alt
                height="22"
              />
            </span>
            <span class="logo-lg">
              <img
                src="@/assets/images/logo-light.png"
                style="width: 120px; height: 40px"
                alt
                height="19"
              />
            </span>
          </router-link>
        </div>

        <button
          id="vertical-menu-btn"
          type="button"
          class="btn btn-sm px-3 font-size-16 header-item"
          @click="toggleMenu"
        >
          <i class="fa fa-fw fa-bars"></i>
        </button>

        <div
          class="d-flex"
          style="align-items: center;min-width: 50px;"
        >
          <!-- <b-breadcrumb :items="routerItems" class="m-0"></b-breadcrumb> -->
          <el-breadcrumb
            class="app-breadcrumb"
            separator="/"
          >
            <el-breadcrumb-item
              v-for="(item, index) in matched"
              :key="item.name"
            >
              <span
                v-if="
                  item.redirect === 'noRedirect' || index == matched.length - 1
                "
                class="no-redirect"
                >{{ item.meta.title }}</span
              >
              <a
                v-else
                @click.prevent="handleLink(item)"
                >{{ item.meta.title }}</a
              >
              <!-- <a v-else>{{ item.meta.title }}</a> -->
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div 
          class="d-flex"
          id="storage-box"
          style="align-items: center;margin-left: 10px;"
          @click="showMatter"
          :style="{ 'opacity': (!isShowMatter && permissions.includes(496) && currentRoute == '/') ? 1 : 0, 'pointer-events': (!isShowMatter && permissions.includes(496) && currentRoute == '/') ? 'all' : 'none' }"
        >
          <el-button type="primary" v-if="(!isShowMatter && permissions.includes(496) && currentRoute == '/')">
            <span>待办</span>
            <span class="matter-number">{{ matterNumber }}</span>
          </el-button>
        </div>
        <div style="display: flex;align-items: center;" v-if="currentRoute === '/case/case-folders'">
          <Tabs
            :tabList="showTypeTabsList"
            :activeTab="caseShowType"
            @change="switchCaseShowType"
          />
        </div>
        <div style="display: flex;align-items: center;" v-if="currentRoute === '/project'">
          <Tabs
            :tabList="showTypeTabsList"
            :activeTab="projectShowType"
            @change="switchProjectShowType"
          />
        </div>
        <div style="display: flex;align-items: center;" v-if="currentRoute === '/customer/customer-overview'">
          <Tabs
            :tabList="custShowTypeTabsList"
            :activeTab="custShowType"
            @change="switchCustShowType"
          />
        </div>
        <div style="display: flex;align-items: center;" v-if="currentRoute === '/mytask'">
          <Tabs
            :tabList="showTypeTabsList"
            :activeTab="mytaskShowType"
            @change="switchMyTaskShowType"
          />
        </div>

        <!-- <b-dropdown
          variant="black"
          class="dropdown-mega d-lg-block ms-2"
          toggle-class="header-item"
          menu-class="dropdown-megamenu"
        >
          <template v-slot:button-content>
            {{ $t("navbar.dropdown.megamenu.text") }}
            <i class="mdi mdi-chevron-down"></i>
          </template>

          <div class="row">
            <div class="col-sm-8">
              <div class="row">
                <div class="col-md-4">
                  <h5 class="font-size-14 mt-0">
                    {{ $t("navbar.dropdown.megamenu.uicontent.title") }}
                  </h5>
                  <ul class="list-unstyled megamenu-list">
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.lightbox")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.uicontent.list.rangeslider"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.sweetalert")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.rating")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.forms")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.tables")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.charts")
                      }}</a>
                    </li>
                  </ul>
                </div>

                <div class="col-md-4">
                  <h5 class="font-size-14 mt-0">
                    {{ $t("navbar.dropdown.megamenu.application.title") }}
                  </h5>
                  <ul class="list-unstyled megamenu-list">
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.application.list.ecommerce"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.application.list.calendar")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.application.list.email")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.application.list.projects")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.application.list.tasks")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.application.list.contacts")
                      }}</a>
                    </li>
                  </ul>
                </div>

                <div class="col-md-4">
                  <h5 class="font-size-14 mt-0">
                    {{ $t("navbar.dropdown.megamenu.extrapages.title") }}
                  </h5>
                  <ul class="list-unstyled megamenu-list">
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.extrapages.list.lightsidebar"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.extrapages.list.compactsidebar"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.extrapages.list.horizontallayout"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.extrapages.list.maintenance"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.extrapages.list.comingsoon"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.extrapages.list.timeline")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.extrapages.list.faqs")
                      }}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="row">
                <div class="col-sm-6">
                  <h5 class="font-size-14 mt-0">
                    {{ $t("navbar.dropdown.megamenu.uicontent.title") }}
                  </h5>
                  <ul class="list-unstyled megamenu-list">
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.lightbox")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t(
                          "navbar.dropdown.megamenu.uicontent.list.rangeslider"
                        )
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.sweetalert")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.rating")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.forms")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.tables")
                      }}</a>
                    </li>
                    <li>
                      <a href="#">{{
                        $t("navbar.dropdown.megamenu.uicontent.list.charts")
                      }}</a>
                    </li>
                  </ul>
                </div>

                <div class="col-sm-5">
                  <div>
                    <img
                      src="@/assets/images/megamenu-img.png"
                      alt
                      class="img-fluid mx-auto d-block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-dropdown> -->
      </div>

      <!-- <div class="d-flex">
        <form class="app-search d-lg-block">
          <div class="position-relative">
            <input
              type="text"
              class="form-control"
              :placeholder="$t('navbar.search.text')"
            />
            <span class="bx bx-search-alt"></span>
          </div>
        </form>
      </div> -->

      <div class="d-flex">
        <!-- <b-dropdown
          class="d-inline-block d-lg-none ms-2"
          variant="black"
          menu-class="dropdown-menu-lg p-0"
          toggle-class="header-item noti-icon"
          right
        >
          <template v-slot:button-content>
            <i class="mdi mdi-magnify"></i>
          </template>

          <form class="p-3">
            <div class="form-group m-0">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search ..."
                  aria-label="Recipient's username"
                />
                <div class="input-group-append">
                  <button
                    class="btn btn-primary"
                    type="submit"
                  >
                    <i class="mdi mdi-magnify"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </b-dropdown> -->

        <!-- <div class="dropdown d-inline-block">
          <button
            type="button"
            class="btn header-item"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img
              id="header-lang-img"
              src="@/assets/images/flags/us.jpg"
              alt="Header Language"
              height="16"
            />
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            <b-link
              href="#"
              v-for="(entry, i) in languages"
              :key="`Lang${i}`"
              :value="entry"
              @click="setLanguage(entry.language, entry.title, entry.flag)"
              :class="{ active: lan === entry.language }"
              class="dropdown-item notify-item language"
            >
              <img
                :src="entry.flag"
                alt="user-image"
                class="me-1"
                height="12"
              />
              <span class="align-middle">{{ entry.title }}</span>
            </b-link>
          </div>
        </div> -->
        <div class="dropdown d-lg-inline-block ms-1">
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

        <!-- <div class="dropdown d-lg-inline-block ms-1">
          <button
            type="button"
            class="btn header-item noti-icon"
            @click="initFullScreen"
          >
            <i class="bx bx-fullscreen"></i>
          </button>
        </div> -->

        <!-- <b-dropdown
          right
          menu-class="dropdown-menu-lg p-0 dropdown-menu-end"
          toggle-class="header-item noti-icon"
          variant="black"
        >
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
                <a
                  href="#"
                  class="small"
                  >{{ $t("navbar.dropdown.notification.subtext") }}</a
                >
              </div>
            </div>
          </div>
          <SimpleBar style="max-height: 230px">
            <a
              href="#"
              class="text-reset notification-item"
            >
              <div class="d-flex">
                <div class="avatar-xs me-3">
                  <span
                    class="avatar-title bg-primary rounded-circle font-size-16"
                  >
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
            <a
              href="#"
              class="text-reset notification-item"
            >
              <div class="d-flex">
                <img
                  src="@/assets/images/users/avatar-3.jpg"
                  class="me-3 rounded-circle avatar-xs"
                  alt="user-pic"
                />
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
            <a
              href="#"
              class="text-reset notification-item"
            >
              <div class="d-flex">
                <div class="avatar-xs me-3">
                  <span
                    class="avatar-title bg-success rounded-circle font-size-16"
                  >
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
            <a
              href="#"
              class="text-reset notification-item"
            >
              <div class="d-flex">
                <img
                  src="@/assets/images/users/avatar-4.jpg"
                  class="me-3 rounded-circle avatar-xs"
                  alt="user-pic"
                />
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
            <a
              class="btn btn-sm btn-link font-size-14 text-center"
              href="#"
            >
              <i class="mdi mdi-arrow-right-circle me-1"></i>
              {{ $t("navbar.dropdown.notification.button") }}
            </a>
          </div>
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
            <span class="d-xl-inline-block ms-1 user-name">
              <div>{{ name }}</div>
            </span>
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
            popper-class="switch-account-popover"
            :show-arrow="false"
            ref="swtaPopover"
          >
            <el-select-v2
              v-model="accountValue"
              :options="filteredUserList"
              placeholder="请选择"
              style="width: 240px"
              filterable
              :filter-method="onAccountFilter"
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
          <button
            type="button"
            class="btn header-item noti-icon right-bar-toggle toggle-right"
            @click="toggleRightSidebar"
          >
            <!-- <i class="bx bx-cog bx-spin toggle-right"></i>  旋转-->
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
<style lang="scss" scoped>
.matter-number{
  min-width: 18px;
  height: 18px;
  background-color: #63c093;
  line-height: 18px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 4px;
  text-align: center;
  padding: 0 4px;
  display: inline-block;
}
</style>
<style lang="scss">
.switch-account-popover {
  top: 50px !important;
  right: 20px !important;
  left: auto !important;
}
.app-breadcrumb {
  .el-breadcrumb__separator {
    font-weight: normal;
  }
  .el-breadcrumb__inner:hover {
    color: #4458b6;
  }
}
.account-select{
  .el-select__input{
    width: 100% !important;
  }
}
@media screen and (max-width: 550px) {
  .user-name{
    display: none;
  }
}
</style>
