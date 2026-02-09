const mytaskRouter = [
    {
      path: "/schedule",
      name: "schedule",
      meta: { title: "日程", authRequired: true },
      component: () => import("@/views/schedule/index"),
    },
  ];
  
  export default mytaskRouter;
  