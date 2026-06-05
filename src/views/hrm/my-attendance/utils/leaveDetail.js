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

const APPROVAL_ACTION_TYPE_LABEL_MAP = {
  submit: "发起申请",
  提交: "发起申请",
  approve: "直属上级审批",
  同意: "直属上级审批",
  审批: "直属上级审批",
  审批通过: "直属上级审批",
  reject: "审批退回",
  退回: "审批退回",
  abandon: "废弃申请",
  废弃: "废弃申请",
  direct_pass: "提交生效",
  提交生效: "提交生效",
  reverse_approve: "反审批",
  反审批: "反审批",
};

const APPROVAL_ACTION_RESULT_LABEL_MAP = {
  submitted: "提交申请",
  submit: "提交申请",
  approved: "审批通过",
  passed: "审批通过",
  pass: "审批通过",
  rejected: "已退回",
  reject: "已退回",
  returned: "已退回",
  pending: "审批中",
  processing: "审批中",
  abandoned: "已废弃",
  abandon: "已废弃",
};

const buildApprovalLogTitle = (log = {}) => {
  const actionType = String(log?.actionType || "").trim();
  const actionResult = String(log?.actionResult || "").trim();
  const typeLabel = APPROVAL_ACTION_TYPE_LABEL_MAP[actionType] || actionType;
  const resultLabel = APPROVAL_ACTION_RESULT_LABEL_MAP[actionResult] || actionResult;
  if (typeLabel && resultLabel) {
    return `${typeLabel} · ${resultLabel}`;
  }
  return typeLabel || resultLabel || "审批记录";
};

const buildApprovalLogDescription = (log = {}, title = "") => {
  if (log?.actionComment) {
    return log.actionComment;
  }
  return title;
};

export const buildLeaveApprovalFlow = (detail = {}) => {
  const logs = Array.isArray(detail?.approvalLogs) ? detail.approvalLogs : [];
  const requestStatus = detail?.requestStatus || detail?.status || "";
  const talentName = detail?.talentName || detail?.applicant || "";
  const isPending = requestStatus === "审批中";

  if (!logs.length) {
    if (requestStatus === "未提交") {
      return [
        {
          time: formatDateTimeText(detail.applyTime) || detail.applyDate || "",
          title: "保存草稿",
          actor: talentName,
          description: "请假单暂未提交审批。",
          active: true,
        },
      ];
    }

    if (requestStatus === "已废弃") {
      return [
        {
          time: formatDateTimeText(detail.applyTime) || detail.applyDate || "",
          title: "废弃申请",
          actor: talentName,
          description: detail.approvalStatus || "",
          active: true,
        },
      ];
    }

    const applyTime = formatDateTimeText(detail.applyTime) || detail.applyDate || "";
    return [
      {
        time: applyTime,
        title: "发起申请",
        actor: talentName,
        description: `提交${detail.leaveTypeName || detail.leaveType || ""}申请，等待直属上级审批。`,
        active: true,
      },
      {
        time: applyTime,
        title:
          requestStatus === "已通过"
            ? "直属上级审批 · 审批通过"
            : "直属上级审批",
        actor: detail.currentApproverNames || detail.approver || "",
        description: detail.approvalStatus || "",
        active: isPending,
      },
    ];
  }

  const sortedLogs = [...logs].sort((left, right) => {
    const leftTime = dayjs(left?.actionTime).valueOf();
    const rightTime = dayjs(right?.actionTime).valueOf();
    if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
      return 0;
    }
    return leftTime - rightTime;
  });

  return sortedLogs.map((log, index) => {
    const title = buildApprovalLogTitle(log);
    const isLast = index === sortedLogs.length - 1;
    return {
      time: formatDateTimeText(log?.actionTime) || String(log?.actionTime || ""),
      title,
      actor: log?.operatorName || "",
      description: buildApprovalLogDescription(log, title),
      active: isLast && isPending,
    };
  });
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
