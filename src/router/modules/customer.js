const customerRouter = [
    {
      path: "/customer",
      name: "customer",
      meta: { title: "客户", authRequired: true },
      children: [
        {
          path: "/customer/customer-overview",
          name: "customer-overview",
          meta: { title: "客户", authRequired: true },
          component: () => import("@/views/customer/customer-overview/index"),
        },
        {
          path: "/customer/customer-info",
          name: "customer-info",
          meta: { title: "客户信息", authRequired: true },
          component: () => import("@/views/customer/customer-info/index"),
        },
      ],
    },
  ];
  
  export default customerRouter;
  