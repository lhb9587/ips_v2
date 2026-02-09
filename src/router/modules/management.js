const managementRouter = [
  {
    path: "/management",
    name: "management",
    meta: { title: "管理", authRequired: true },
    children: [
      {
        path: "/management/contract-management",
        name: "contract-management",
        meta: { title: "合同管理", authRequired: true },
        component: () => import("@/views/management/contract-management/index"),
      },
      {
        path: "/management/contract-detail/:contractId",
        name: "contract-detail",
        meta: { title: "合同详情", authRequired: true },
        component: () => import("@/views/management/contract-management/contract-detail"),
      },
    ],
  },
];
export default managementRouter;
