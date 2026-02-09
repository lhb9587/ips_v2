const mytaskRouter = [
    {
      path: "/mytask",
      name: "mytask",
      meta: { title: "我的任务", authRequired: true },
      component: () => import("@/views/mytask/index"),
    },
  ];
  
  export default mytaskRouter;
  