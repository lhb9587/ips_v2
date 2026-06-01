import dayjs from "dayjs";
import { queryOvertimeRequestAdminDetail } from "@/api/attendance";

export const getOvertimeRequestId = (detail = {}) => {
  const id = detail?.overtimeRequestId ?? detail?.requestId;
  return id === undefined || id === null || id === "" ? null : id;
};

const parseTimeOnly = (datetime) => {
  if (!datetime) {
    return "";
  }
  const parsed = dayjs(datetime);
  if (parsed.isValid()) {
    return parsed.format("HH:mm");
  }
  const text = String(datetime);
  const spaceIndex = text.indexOf(" ");
  if (spaceIndex !== -1) {
    const timePart = text.slice(spaceIndex + 1);
    return timePart.length >= 5 ? timePart.slice(0, 5) : timePart;
  }
  return "";
};

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

const formatDateText = (value) => {
  if (!value) {
    return "";
  }
  const text = String(value);
  return text.includes("T") ? text.split("T")[0] : text.slice(0, 10);
};

export const buildOvertimeSaveDateTime = (overtimeDate, timeValue) => {
  if (!timeValue) {
    return "";
  }
  const text = String(timeValue).trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}/.test(text)) {
    const parsed = dayjs(text);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : text.slice(0, 16);
  }
  if (/^\d{2}:\d{2}$/.test(text)) {
    return overtimeDate ? `${overtimeDate} ${text}` : text;
  }
  const timeOnly = parseTimeOnly(text);
  return overtimeDate && timeOnly ? `${overtimeDate} ${timeOnly}` : text;
};

export const normalizeOvertimeDetail = (detail = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...detail,
    details: Array.isArray(detail?.details)
      ? detail.details
      : Array.isArray(fallback?.details)
        ? fallback.details
        : [],
    approvalLogs: Array.isArray(detail?.approvalLogs)
      ? detail.approvalLogs
      : Array.isArray(fallback?.approvalLogs)
        ? fallback.approvalLogs
        : [],
  };

  const firstDetail = merged.details[0] || {};
  const overtimeRequestId =
    getOvertimeRequestId(merged) ?? getOvertimeRequestId(fallback);
  const requestNo =
    merged.requestNo || merged.billNo || fallback.requestNo || fallback.billNo || "";

  const overtimeDate =
    formatDateText(merged.overtimeDate) ||
    formatDateText(firstDetail.overtimeDate) ||
    formatDateText(fallback.overtimeDate);

  const startTime =
    merged.overtimeStartTime ||
    merged.startTime ||
    firstDetail.startTime ||
    fallback.startTime ||
    "";
  const endTime =
    merged.overtimeEndTime ||
    merged.endTime ||
    firstDetail.endTime ||
    fallback.endTime ||
    "";

  const breakMinutes =
    merged.restMinutes ??
    merged.breakMinutes ??
    firstDetail.restMinutes ??
    fallback.breakMinutes ??
    0;

  const overtimeHours =
    merged.applyOvertimeHours ??
    merged.applyHours ??
    merged.overtimeHours ??
    firstDetail.applyHours ??
    fallback.overtimeHours ??
    0;

  const approvalInstanceId =
    merged.approvalInstanceId ?? merged.instanceId ?? fallback.approvalInstanceId ?? null;

  return {
    ...merged,
    ...(approvalInstanceId !== null
      ? {
          approvalInstanceId,
          instanceId: merged.instanceId ?? approvalInstanceId,
        }
      : {}),
    ...(overtimeRequestId !== null
      ? { overtimeRequestId, requestId: overtimeRequestId }
      : {}),
    ...(requestNo ? { requestNo, billNo: requestNo } : {}),
    applicant: merged.talentName || merged.applicant || fallback.applicant || "",
    employeeCode: merged.talentCode || merged.employeeCode || fallback.employeeCode || "",
    organization: merged.deptName || merged.organization || fallback.organization || "",
    position: merged.positionName || merged.position || fallback.position || "",
    overtimeDate,
    startTime: formatDateTimeText(startTime) || startTime,
    endTime: formatDateTimeText(endTime) || endTime,
    startTimeOnly: merged.startTimeOnly || parseTimeOnly(startTime),
    endTimeOnly: merged.endTimeOnly || parseTimeOnly(endTime),
    breakMinutes,
    overtimeHours,
    overtimeReason: merged.reason || merged.overtimeReason || fallback.overtimeReason || "",
    overtimeType:
      merged.overtimeTypeName || merged.overtimeType || fallback.overtimeType || "",
    compensationType: merged.compensationType || fallback.compensationType || "",
    status:
      merged.status ||
      merged.requestStatus ||
      merged.approvalStatus ||
      fallback.status ||
      "",
    requestStatus:
      merged.requestStatus ||
      merged.status ||
      fallback.requestStatus ||
      "",
    approvalStatus:
      merged.approvalStatus ||
      merged.requestStatus ||
      merged.status ||
      fallback.approvalStatus ||
      "",
    remark: merged.remark ?? fallback.remark ?? "",
    approver:
      merged.currentApproverNames ||
      merged.currentApproverName ||
      merged.approver ||
      fallback.approver ||
      "",
    applyDate:
      formatDateText(merged.submitTime) ||
      formatDateText(merged.applyTime) ||
      formatDateText(merged.createTime) ||
      fallback.applyDate ||
      "",
    source: merged.source || fallback.source || "员工自助",
  };
};

export const buildApprovalCenterOvertimeFallback = (row = {}) => ({
  instanceId: row.instanceId,
  approvalInstanceId: row.instanceId,
  taskId: row.taskId,
  requestNo: row.bizNo,
  billNo: row.bizNo,
  applicant: row.applicantName,
  employeeCode: row.applicantCode,
  organization: row.deptName,
  status: row.instanceStatus,
  canApprove: row.canApprove,
  canReject: row.canReject,
});

export async function fetchOvertimeRequestDetail(
  overtimeRequestId,
  fallback = {},
  config = { isLoading: false },
) {
  if (overtimeRequestId === undefined || overtimeRequestId === null || overtimeRequestId === "") {
    throw new Error("overtimeRequestId is required");
  }
  const res = await queryOvertimeRequestAdminDetail({ overtimeRequestId }, config);
  return normalizeOvertimeDetail(res?.data || {}, { ...fallback, overtimeRequestId });
}

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
  discarded: "已废弃",
  审批中: "审批中",
  已通过: "审批通过",
  已退回: "已退回",
  已驳回: "已退回",
  已废弃: "已废弃",
};

const normalizeApprovalFlowLabel = (value, labelMap) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  const text = String(value).trim();
  if (labelMap[text]) {
    return labelMap[text];
  }
  const lowerText = text.toLowerCase();
  if (labelMap[lowerText]) {
    return labelMap[lowerText];
  }
  return text;
};

const buildApprovalLogTitle = (log = {}) => {
  const rawActionType = log?.actionType;
  const rawActionResult = log?.actionResult;
  const actionTypeLabel = normalizeApprovalFlowLabel(
    rawActionType,
    APPROVAL_ACTION_TYPE_LABEL_MAP,
  );
  const actionResultLabel = normalizeApprovalFlowLabel(
    rawActionResult,
    APPROVAL_ACTION_RESULT_LABEL_MAP,
  );

  if (
    actionTypeLabel === "发起申请" &&
    ["提交申请", "审批中"].includes(actionResultLabel)
  ) {
    return "发起申请 · 提交申请";
  }
  if (actionTypeLabel === "直属上级审批" && actionResultLabel === "审批通过") {
    return "直属上级审批 · 审批通过";
  }
  if (actionTypeLabel === "审批退回") {
    return actionResultLabel ? `审批退回 · ${actionResultLabel}` : "审批退回";
  }
  if (actionTypeLabel === "废弃申请") {
    return actionResultLabel ? `废弃申请 · ${actionResultLabel}` : "废弃申请";
  }

  const titleParts = [actionTypeLabel, actionResultLabel].filter(Boolean);
  if (titleParts.length === 2 && titleParts[0] === titleParts[1]) {
    return titleParts[0];
  }
  return titleParts.join(" · ") || "审批记录";
};

const buildApprovalLogDescription = (log = {}, title = "") => {
  const comment = String(log?.actionComment || "").trim();
  const normalizedComment = normalizeApprovalFlowLabel(
    comment,
    APPROVAL_ACTION_RESULT_LABEL_MAP,
  );
  if (
    comment &&
    comment !== title &&
    normalizedComment !== title &&
    !["提交", "退回", "同意", "废弃"].includes(comment)
  ) {
    return comment;
  }

  if (title.includes("发起申请")) {
    return "提交加班申请，等待直属上级审批。";
  }
  if (title.includes("审批退回") || title.includes("已退回")) {
    return "审批已退回，请修改后重新提交。";
  }
  if (title.includes("审批通过")) {
    return "审批已通过。";
  }
  if (title.includes("废弃申请")) {
    return "申请人已废弃该加班单。";
  }
  return "";
};

export const buildOvertimeApprovalFlow = (detail = {}) => {
  const logs = Array.isArray(detail.approvalLogs) ? detail.approvalLogs : [];
  const status = detail.status || detail.requestStatus || "";
  const approvalStatus = detail.approvalStatus || status;
  const isPending = status === "审批中" || approvalStatus === "审批中";
  const applicant = detail.applicant || detail.talentName || "";
  const applyTime =
    formatDateTimeText(detail.applyTime) ||
    formatDateTimeText(detail.submitTime) ||
    formatDateTimeText(detail.createTime) ||
    detail.applyDate ||
    "";

  if (!logs.length) {
    if (status === "未提交") {
      return [
        {
          time: applyTime,
          title: "保存草稿",
          actor: applicant,
          description: "加班单暂未提交审批。",
          active: true,
        },
      ];
    }
    return [];
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
