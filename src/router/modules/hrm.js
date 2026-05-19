const hrmRouter = [
  {
    path: "/hrm",
    name: "hrm",
    meta: { title: "人力资源", authRequired: true },
    children: [
      {
        path: "/hrm/attendance-management",
        name: "attendance-management-root",
        meta: { title: "假勤管理", authRequired: true },
        component: () => import("@/views/common/route-view.vue"),
        children: [
          {
            path: "/hrm/attendance-management",
            name: "attendance-management",
            meta: { title: "假勤管理", authRequired: true },
            component: () => import("@/views/hrm/attendance-management/index"),
          },
          {
            path: "/hrm/schedule-list",
            name: "schedule-list-root",
            meta: { title: "排班列表", authRequired: true },
            component: () => import("@/views/common/route-view.vue"),
            children: [
              {
                path: "/hrm/schedule-list",
                name: "schedule-list",
                meta: { title: "排班列表", authRequired: true },
                component: () => import("@/views/hrm/schedule-list/index"),
              },
              {
                path: "unscheduled-list",
                name: "schedule-unscheduled-list",
                meta: { title: "未排班列表", authRequired: true },
                hidden: true,
                component: () => import("@/views/hrm/schedule-unscheduled-list/index"),
              },
              {
                path: "vertical-list",
                name: "schedule-vertical-list",
                meta: { title: "纵向显示", authRequired: true },
                hidden: true,
                component: () => import("@/views/hrm/schedule-vertical-list/index"),
              },
              {
                path: "swap-list",
                name: "schedule-swap-list",
                meta: { title: "调班单", authRequired: true },
                hidden: true,
                component: () => import("@/views/hrm/schedule-swap-list/index"),
              },
            ],
          },
          {
            path: "/hrm/schedule-wizard",
            name: "schedule-wizard",
            meta: { title: "排班向导", authRequired: true },
            component: () => import("@/views/hrm/schedule-wizard/index"),
          },
          {
            path: "/hrm/leave-quota-management",
            name: "leave-quota-management-root",
            meta: { title: "假期额度维护", authRequired: true },
            component: () => import("@/views/common/route-view.vue"),
            children: [
              {
                path: "/hrm/leave-quota-management",
                name: "leave-quota-management",
                meta: { title: "假期额度维护", authRequired: true },
                component: () => import("@/views/hrm/leave-quota-management/index"),
              },
              {
                path: "ledger",
                name: "leave-quota-management-ledger",
                meta: { title: "额度日志信息", authRequired: true },
                hidden: true,
                component: () => import("@/views/hrm/leave-quota-management/ledger"),
              },
            ],
          },
          {
            path: "/hrm/leave-management",
            name: "leave-management",
            meta: { title: "请假单", authRequired: true },
            component: () => import("@/views/hrm/leave-management/index"),
          },
          {
            path: "/hrm/overtime-management",
            name: "overtime-management",
            meta: { title: "加班单", authRequired: true },
            component: () => import("@/views/hrm/overtime-management/index"),
          },
          {
            path: "/hrm/supplement-management",
            name: "supplement-management",
            meta: { title: "补签卡", authRequired: true },
            component: () => import("@/views/hrm/supplement-management/index"),
          },
          {
            path: "/hrm/attendance-profile",
            name: "attendance-profile-root",
            meta: { title: "考勤档案", authRequired: true },
            component: () => import("@/views/common/route-view.vue"),
            children: [
              {
                path: "/hrm/attendance-profile",
                name: "attendance-profile",
                meta: { title: "考勤档案", authRequired: true },
                component: () => import("@/views/hrm/attendance-profile/index"),
              },
              {
                path: "history",
                name: "attendance-profile-history",
                meta: { title: "档案历史", authRequired: true },
                hidden: true,
                component: () => import("@/views/hrm/attendance-profile/history"),
              },
            ],
          },
          {
            path: "/hrm/attendance-record",
            name: "attendance-record",
            meta: { title: "打卡记录", authRequired: true },
            component: () => import("@/views/hrm/attendance-record/index"),
          },
          {
            path: "/hrm/attendance-summary",
            name: "attendance-summary",
            meta: { title: "出勤记录", authRequired: true },
            component: () => import("@/views/hrm/attendance-summary/index"),
          },
          {
            path: "/hrm/attendance-calculation",
            name: "attendance-calculation",
            meta: { title: "考勤计算", authRequired: true },
            component: () => import("@/views/hrm/attendance-calculation/index"),
          },
          {
            path: "/hrm/attendance-group",
            name: "attendance-group",
            meta: { title: "考勤组", authRequired: true },
            component: () => import("@/views/hrm/attendance-group/index"),
          },
        ],
      },
      {
        path: "/hrm/my-attendance",
        name: "my-attendance-root",
        meta: { title: "我的考勤", authRequired: true },
        component: () => import("@/views/common/route-view.vue"),
        children: [
          {
            path: "/hrm/my-attendance",
            name: "my-attendance",
            meta: { title: "我的考勤", authRequired: true },
            component: () => import("@/views/hrm/my-attendance/index"),
          },
          {
            path: "calendar",
            name: "my-attendance-calendar",
            meta: { title: "考勤日历", authRequired: true },
            component: () => import("@/views/hrm/my-attendance/calendar/index"),
          },
          {
            path: "leave-application",
            name: "my-leave-application",
            meta: { title: "我要请假", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/leave-application/index"),
          },
          {
            path: "leave-list",
            name: "my-leave-list",
            meta: { title: "请假列表", authRequired: true },
            component: () => import("@/views/hrm/my-attendance/leave-list/index"),
          },
          {
            path: "leave-detail/:billNo?",
            name: "my-leave-detail",
            meta: { title: "请假详情", authRequired: true },
            component: () => import("@/views/hrm/my-attendance/leave-detail/index"),
          },
          {
            path: "overtime-application",
            name: "my-overtime-application",
            meta: { title: "我要加班", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/overtime-application/index"),
          },
          {
            path: "overtime-list",
            name: "my-overtime-list",
            meta: { title: "加班列表", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/overtime-list/index"),
          },
          {
            path: "overtime-detail/:billNo?",
            name: "my-overtime-detail",
            meta: { title: "加班详情", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/overtime-detail/index"),
          },
          {
            path: "supplement-application",
            name: "my-supplement-application",
            meta: { title: "我要补卡", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/supplement-application/index"),
          },
          {
            path: "supplement-list",
            name: "my-supplement-list",
            meta: { title: "补签卡列表", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/supplement-list/index"),
          },
          {
            path: "supplement-detail/:billNo?",
            name: "my-supplement-detail",
            meta: { title: "补签详情", authRequired: true },
            component: () =>
              import("@/views/hrm/my-attendance/supplement-detail/index"),
          },
        ],
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

