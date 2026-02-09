import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import vClickOutside from "click-outside-vue3";
import { registerScrollSpy } from "vue3-scroll-spy";

import Maska from "maska";
import i18n from "./i18n";
// import { initFirebaseBackend } from "./authUtils";
// import { configureFakeBackend } from "./helpers/fake-backend";

import BootstrapVueNext from "bootstrap-vue-next";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import "./components/ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";


// UI框架 element-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import "./permission"; // permission control

// const firebaseConfig = {
//   apiKey: process.env.VUE_APP_APIKEY,
//   authDomain: process.env.VUE_APP_AUTHDOMAIN,
//   databaseURL: process.env.VUE_APP_VUE_APP_DATABASEURL,
//   projectId: process.env.VUE_APP_PROJECTId,
//   storageBucket: process.env.VUE_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.VUE_APP_MESSAGINGSENDERID,
//   appId: process.env.VUE_APP_APPId,
//   measurementId: process.env.VUE_APP_MEASUREMENTID,
// };

// if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
//   initFirebaseBackend(firebaseConfig);
// } else {
//   configureFakeBackend();
// }

import "sweetalert2/dist/sweetalert2.min.css";
import "@vueform/slider/themes/default.css";

import store from "./state/store";

import "../src/design/app.scss";

// import infiniteScroll from "vue-infinite-scroll";

import elTableInfiniteScroll from "el-table-infinite-scroll";

import vue3TreeOrg from "vue3-tree-org";
import "vue3-tree-org/lib/vue3-tree-org.css";
import drawerDrag from "./utils/drawer-drag";

//阿里icon
import "@/assets/ali_fonts/iconfont.css"

import CustomerSidebar from '@/components/sidebar/customer-sidebar.vue'
import CaseSidebar from '@/components/sidebar/case-sidebar.vue'

// const debounce = (fn, delay) => {
//   let timer;
//   return (...args) => {
//     if (timer) {
//       clearTimeout(timer);
//     }
//     timer = setTimeout(() => {
//       fn(...args);
//     }, delay);
//   };
// };

// const _ResizeObserver = window.ResizeObserver;
// window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
//   constructor(callback) {
//     callback = debounce(callback, 200);
//     super(callback);
//   }
// };

import VueGridLayout from 'vue-grid-layout'

import { addCopyFunction,destroyCopyFunction } from "@/utils";

const app = createApp(App);
app.config.globalProperties.$addCopy = addCopyFunction;
app.config.globalProperties.$destroyCopy = destroyCopyFunction;
app.config.errorHandler = function (err) {  
  console.log('Error: ', err);  
};
app.directive("drawerDrag",drawerDrag)
app.config.globalProperties.$trans = i18n.global.t;
app.use(store);
app.use(router);
// app.use(infiniteScroll);
app.use(elTableInfiniteScroll);
app.use(require("vue-chartist"));
app.use(BootstrapVueNext);
app.use(ElementPlus);
app.use(VueApexCharts);
app.use(vClickOutside);
app.use(i18n);
app.use(registerScrollSpy);
app.use(Maska);
app.use(vue3TreeOrg);
app.use(VueGridLayout);
app.component('CustomerSidebar', CustomerSidebar)
app.component('CaseSidebar', CaseSidebar)
app.mount("#app");
