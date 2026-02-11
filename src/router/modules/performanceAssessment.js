const performanceAssessmentRouter = [
  {
    path: "/performance-assessment",
    name: "performance-assessment",
    meta: { title: "绩效评估", authRequired: true },
    component: () => import("@/views/performance-assessment/index"),
  },
];

export default performanceAssessmentRouter;
