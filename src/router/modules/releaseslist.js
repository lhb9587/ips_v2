const publishlistRouter = [
    {
      path: "/releaseslist",
      name: "releaseslist",
      meta: { title: "发布列表", authRequired: true },
      component: () => import("@/views/releaseslist/index"),
    },
  ];
  
  export default publishlistRouter;
  