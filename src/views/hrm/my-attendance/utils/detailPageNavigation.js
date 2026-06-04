/** 假勤独立详情页关闭/返回，对齐合同独立详情页 contract-detail.vue 的处理方式。 */

export const ATTENDANCE_DETAIL_FROM = {
  APPROVAL_CENTER: "approval-center",
};

export const navigateAttendanceDetailBack = (router, route, defaultRoute) => {
  if (window.self !== window.top) {
    window.parent.postMessage({ code: "2" }, "*");
    return;
  }

  const { from, tab } = route.query || {};
  if (from === ATTENDANCE_DETAIL_FROM.APPROVAL_CENTER) {
    router.push({
      name: "approval-center",
      query: tab ? { tab } : {},
    });
    return;
  }

  router.push(defaultRoute);
};
