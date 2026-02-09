import caseManageRouter from '@/router/modules/caseManagement'
import financeRouter from '@/router/modules/finance'
import hrmRouter from '@/router/modules/hrm'
import customer from '@/router/modules/customer'
import releaseslist from '@/router/modules/releaseslist'
import businesstrip from '@/router/modules/businesstrip'
import management from '@/router/modules/management'
import project from '@/router/modules/project'
import mytask from '@/router/modules/mytask'
import schedule from '@/router/modules/schedule'

export default [
  {
    path: "/",
    name: "default",
    meta: { 
      authRequired: true,
      title: '工作台',
      keepAlive: true  // 添加 keepAlive 标记
    },
    component: () => import("@/views/dashboards/default"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/account/login"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/account/register"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/account/forgot-password"),
  },
  {
    path: "/logout",
    name: "logout",
    component: () => import("@/views/account/logout"),
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("@/views/404"),
  },

  //案件
  ...caseManageRouter,
  ...financeRouter,
  ...hrmRouter,
  ...customer,
  ...releaseslist,
  ...businesstrip,
  ...management,
  ...project,
  ...mytask,
  ...schedule,
  {
    path: "/case/case-management",
    name: "case-management",
    meta: { authRequired: true },
    component: () => import("@/views/case/case-management"),
  },
  {
    path: "/personal-profile",
    name: "personal-profile",
    meta: { title: "个人中心", authRequired: true },
    component: () => import("@/views/account/personal-profile"),
  },
  {
    path: "/loading",
    name: "loading",
    meta: { authRequired: true },
    component: () => import("@/views/loading"),
  },
  {
    path: "/excel_preview",
    name: "excel_preview",
    meta: { authRequired: true },
    component: () => import("@/views/excel"),
  },
];
