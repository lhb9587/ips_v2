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
        path: "/hrm/my-attendance",
        name: "my-attendance",
        meta: { title: "我的考勤", authRequired: true },
        component: () => import("@/views/hrm/my-attendance/index"),
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
