const hrmRouter = [
  {
    path: "/hrm",
    name: "hrm",
    meta: { title: "人力资源", authRequired: true },
    children: [
      {
        path: "/hrm/attendance-management",
        name: "attendance-management",
        meta: { title: "假勤管理", authRequired: true },
        component: () => import("@/views/hrm/attendance-management/index"),
      },
      {
        path: "/hrm/leave-quota-management",
        name: "leave-quota-management",
        meta: { title: "假期额度维护", authRequired: true },
        component: () => import("@/views/hrm/leave-quota-management/index"),
      },
      {
        path: "/hrm/leave-management",
        name: "leave-management",
        meta: { title: "请假单", authRequired: true },
        component: () => import("@/views/hrm/leave-management/index"),
      },
      {
        path: "/hrm/supplement-management",
        name: "supplement-management",
        meta: { title: "补签卡", authRequired: true },
        component: () => import("@/views/hrm/supplement-management/index"),
      },
      {
        path: "/hrm/attendance-profile",
        name: "attendance-profile",
        meta: { title: "考勤档案", authRequired: true },
        component: () => import("@/views/hrm/attendance-profile/index"),
      },
      {
        path: "/hrm/my-attendance",
        name: "my-attendance",
        meta: { title: "我的考勤", authRequired: true },
        component: () => import("@/views/hrm/my-attendance/index"),
      },
      {
        path: "/hrm/my-attendance/leave-application",
        name: "my-leave-application",
        meta: { title: "我要请假", authRequired: true },
        component: () =>
          import("@/views/hrm/my-attendance/leave-application/index"),
      },
      {
        path: "/hrm/my-attendance/leave-list",
        name: "my-leave-list",
        meta: { title: "请假列表", authRequired: true },
        component: () => import("@/views/hrm/my-attendance/leave-list/index"),
      },
      {
        path: "/hrm/my-attendance/leave-detail/:billNo?",
        name: "my-leave-detail",
        meta: { title: "请假详情", authRequired: true },
        component: () => import("@/views/hrm/my-attendance/leave-detail/index"),
      },
      {
        path: "/hrm/my-attendance/supplement-application",
        name: "my-supplement-application",
        meta: { title: "我要补卡", authRequired: true },
        component: () =>
          import("@/views/hrm/my-attendance/supplement-application/index"),
      },
      {
        path: "/hrm/my-attendance/supplement-list",
        name: "my-supplement-list",
        meta: { title: "补签卡列表", authRequired: true },
        component: () =>
          import("@/views/hrm/my-attendance/supplement-list/index"),
      },
      {
        path: "/hrm/my-attendance/supplement-detail/:billNo?",
        name: "my-supplement-detail",
        meta: { title: "补签详情", authRequired: true },
        component: () =>
          import("@/views/hrm/my-attendance/supplement-detail/index"),
      },
      {
        path: "/hrm/staff-management",
        name: "staff-management",
        meta: { title: "人员管理", authRequired: true },
        component: () => import("@/views/hrm/staff-management/index"),
      },
    ],
  },
];

export default hrmRouter;
