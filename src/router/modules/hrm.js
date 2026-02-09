const hrmRouter = [
    {
      path: "/hrm",
      name: "hrm",
      meta: { title: "人力资源", authRequired: true },
      children: [
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
  