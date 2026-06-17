import dayjs from "dayjs";

const formatDateTimeText = (value) => {
  if (!value) {
    return "";
  }
  const parsed = dayjs(value);
  if (parsed.isValid()) {
    return parsed.format("YYYY-MM-DD HH:mm");
  }
  return String(value);
};

export const formatLeaveApplyDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  const parsed = dayjs(value);
  if (parsed.isValid()) {
    return parsed.format("YYYY-MM-DD");
  }
  const text = String(value).trim();
  if (text.includes("T")) {
    return text.split("T")[0];
  }
  return text.length >= 10 ? text.slice(0, 10) : text;
};

const normalizeApprovalLog = (log = {}) => ({
  ...log,
  time: formatDateTimeText(log?.actionTime) || String(log?.actionTime || ""),
  stepName: log?.stepName || "",
  actionType: log?.actionType || "",
  actionComment: log?.actionComment || "",
  actor: log?.operatorName || "",
});

export const buildLeaveApprovalFlow = (detail = {}) => {
  const logs = Array.isArray(detail?.approvalLogs) ? detail.approvalLogs : [];
  const requestStatus = detail?.requestStatus || detail?.status || "";
  const isPending = requestStatus === "审批中";

  const sortedLogs = [...logs].sort((left, right) => {
    const leftTime = dayjs(left?.actionTime).valueOf();
    const rightTime = dayjs(right?.actionTime).valueOf();
    if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
      return 0;
    }
    return leftTime - rightTime;
  });

  return sortedLogs.map((log, index) => ({
    ...normalizeApprovalLog(log),
    active: isPending && index === sortedLogs.length - 1,
  }));
};

export const getLeaveRequestId = (detail = {}) => {
  const id = detail?.leaveRequestId ?? detail?.requestId;
  return id === undefined || id === null || id === "" ? null : id;
};

export const buildLeaveRequestIdsPayload = (rows = []) => {
  const ids = [
    ...new Set(rows.map((item) => getLeaveRequestId(item)).filter((id) => id || id === 0)),
  ];
  if (!ids.length) {
    return null;
  }
  return { leaveRequestIds: ids.join(",") };
};

export const LEAVE_CALC_DURATION_REQUEST_CONFIG = {
  isLoading: false,
  showErrorMessage: false,
};

export const parseLeaveCalcDurationResult = (res = {}) => {
  const data = res?.data || {};
  return {
    calcSuccess: true,
    duration: Number(data.duration || 0),
    quotaEnough: data.quotaEnough !== false,
    message: data.message || "",
  };
};

export const parseLeaveCalcDurationError = (error) => {
  const message = String(error?.response?.data?.message || error?.message || "").trim();

  if (!message) {
    return null;
  }
  return {
    calcSuccess: false,
    duration: 0,
    quotaEnough: false,
    message,
  };
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
  const applyDate = formatLeaveApplyDate(
    merged.applyTime || merged.applyDate || fallback.applyTime || fallback.applyDate,
  );

  return {
    ...merged,
    ...(leaveRequestId !== null ? { leaveRequestId, requestId: leaveRequestId } : {}),
    ...(requestNo ? { requestNo, billNo: requestNo } : {}),
    ...(applyDate ? { applyDate } : {}),
  };
};
