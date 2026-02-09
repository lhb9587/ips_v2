const financeRouter = [
  {
    path: "/finance",
    name: "finance",
    meta: { title: "财务", authRequired: true },
    children: [
      {
        path: "/finance/bill-management",
        name: "bill-management",
        meta: { title: "账单管理", authRequired: true },
        children: [
          {
            path: "/finance/bill-management/bill",
            name: "bill",
            meta: { title: "账单", authRequired: true },
            component: () =>
              import("@/views/finance/bill-management/bill/index"),
          },
          {
            path: "/finance/bill-management/bill-internal",
            name: "bill-internal",
            meta: { title: "内部账单", authRequired: true },
            component: () =>
              import("@/views/finance/bill-management/bill-internal/index"),
          },
        ],
      },
      {
        path: "/finance/invoice-management",
        name: "invoice-management",
        meta: { title: "发票管理", authRequired: true },
        children: [
          {
            path: "/finance/invoice-management/invoice_opener",
            name: "invoice_opener",
            meta: { title: "发具开票", authRequired: true },
            component: () =>
              import("@/views/finance/invoice-management/invoice_opener/index"),
          },
        ],
      },
      {
        path: "/finance/bill-overseas",
        name: "bill-overseas",
        meta: { title: "境外账单", authRequired: true },
        component: () => import("@/views/finance/bill-overseas/index"),
      },
      {
        path: "/finance/finance-fee",
        name: "finance-fee",
        meta: { title: "费用", authRequired: true },
        component: () => import("@/views/finance/finance-fee/index"),
      },
    ],
  },
];

export default financeRouter;
