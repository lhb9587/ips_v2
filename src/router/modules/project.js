const managementRouter = [
  {
    path: "/project",
    name: "project",
    meta: { title: "项目", authRequired: true },
    children: [
      {
        path: "/project",
        name: "project",
        meta: { title: "项目", authRequired: true },
        component: () => import("@/views/project"),
      },
      {
        path: "/project/project-detail/:projectCode",
        name: "project-detail",
        meta: { title: "项目详情", authRequired: true },
        component: () => import("@/views/project/components/project-detail/index.vue"),
      },
      {
        path: "/project/task-detail/:taskCode",
        name: "task-detail",
        meta: { title: "事项详情", authRequired: true },
        component: () => import("@/views/project/components/task/index.vue"),
      },
      {
        path: "/project/subtask-detail/:taskCode",
        name: "subtask-detail",
        meta: { title: "子事项详情", authRequired: true },
        component: () => import("@/views/project/components/task/subtask-detail.vue"),
      },
    ],
  },
];
export default managementRouter;
