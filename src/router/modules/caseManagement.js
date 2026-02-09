const caseManageRouter = [
  {
    path: "/case",
    name: "case",
    meta: { title: "案件",authRequired: true },
    // redirect: to => {
    //   const firstChild = to.matched[0].children[0].path;
    //   return { path: firstChild };
    // },
    children: [
      // {
      //   path: "/case/case-trademark",
      //   name: "case-trademark",
      //   meta: { title:"商标案件",authRequired: true },
      //   component: () => import("@/views/case/trademark/index"),
      // },
      // {
      //   path: "/case/case-patent",
      //   name: "case-patent",
      //   meta: { title:"专利案件",authRequired: true },
      //   component: () => import("@/views/case/patent/index"),
      // },
      // {
      //   path: "/case/case-litigation",
      //   name: "case-litigation",
      //   meta: { title:"诉讼案件",authRequired: true },
      //   component: () => import("@/views/case/litigation/index"),
      // },
      // {
      //   path: "/case/case-protection",
      //   name: "case-protection",
      //   meta: { title:"保护案件",authRequired: true },
      //   component: () => import("@/views/case/protection/index"),
      // },
      // {
      //   path: "/case/case-domain",
      //   name: "case-domain",
      //   meta: { title:"域名案件",authRequired: true },
      //   component: () => import("@/views/case/domain/index"),
      // },
      // {
      //   path: "/case/case-copyright",
      //   name: "case-copyright",
      //   meta: { title:"著作权案件",authRequired: true },
      //   component: () => import("@/views/case/copyright/index"),
      // },
      // {
      //   path: "/case/case-nonlitigation",
      //   name: "case-nonlitigation",
      //   meta: { title:"非诉案件",authRequired: true },
      //   component: () => import("@/views/case/nonlitigation/index"),
      // },
      // {
      //   path: "/case/case-allcases",
      //   name: "case-allcases",
      //   meta: { title:"全部案件",authRequired: true },
      //   component: () => import("@/views/case/allcases/index"),
      // },
      {
        path: "/case/case-folders",
        name: "case-folders",
        meta: { title:"案件",authRequired: true, keepAlive: true},
        component: () => import("@/views/case/folders/index"),
      },
      {
        path: "/case/case-detail/:caseId",
        name: "case-detail",
        meta: { title:"案件详情",authRequired: true },
        component: () => import("@/components/case/case-detail/index"),
      },
    ],
  },
];

export default caseManageRouter;
