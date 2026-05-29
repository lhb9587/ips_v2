export const getLeaveRequestId = (detail = {}) => {
  const id = detail?.leaveRequestId ?? detail?.requestId;
  return id === undefined || id === null || id === "" ? null : id;
};

export const normalizeLeaveDetail = (detail = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...detail,
    details: Array.isArray(detail?.details)
      ? detail.details
      : Array.isArray(fallback?.details)
        ? fallback.details
        : [],
    attachments: Array.isArray(detail?.attachments)
      ? detail.attachments
      : Array.isArray(fallback?.attachments)
        ? fallback.attachments
        : [],
    approvalLogs: Array.isArray(detail?.approvalLogs)
      ? detail.approvalLogs
      : Array.isArray(fallback?.approvalLogs)
        ? fallback.approvalLogs
        : [],
  };

  const leaveRequestId = getLeaveRequestId(merged) ?? getLeaveRequestId(fallback);
  const requestNo =
    merged.requestNo || merged.billNo || fallback.requestNo || fallback.billNo || "";

  return {
    ...merged,
    ...(leaveRequestId !== null ? { leaveRequestId, requestId: leaveRequestId } : {}),
    ...(requestNo ? { requestNo, billNo: requestNo } : {}),
  };
};
