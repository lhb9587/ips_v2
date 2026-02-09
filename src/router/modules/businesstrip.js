const businesstripRouter = [
  {
    path: "/businesstrip-management",
    name: "businesstrip-management",
    meta: { title: "出差管理", authRequired: true },
    component: () => import("@/views/hrm/businesstrip-management/index"),
  },
];

export default businesstripRouter;
