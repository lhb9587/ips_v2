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
  if (value === undefined || value === null || value === "") {
    return "";
  }
  const parsed = dayjs(value);
  if (parsed.isValid()) {
    return parsed.format("YYYY-MM-DD");
  }
  const text = String(value).trim();
  return text.includes("T") ? text.split("T")[0] : text.slice(0, 10);
};

const normalizeApprovalLog = (log = {}) => ({
  ...log,
  time: formatDateTimeText(log?.actionTime) || String(log?.actionTime || ""),
  stepName: log?.stepName || "",
  actionType: log?.actionType || "",
  actionComment: log?.actionComment || "",
  actor: log?.operatorName || "",
});

const resolveOvertimeApplyTime = (detail = {}) =>
  formatDateTimeText(detail.applyTime) ||
  detail.applyDate ||
  formatDateTimeText(detail.submitTime) ||
  formatDateTimeText(detail.createTime) ||
  "";

export const buildOvertimeApprovalFlow = (detail = {}) => {
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

const getApiFirstDetail = (apiDetail = {}) =>
  (Array.isArray(apiDetail?.details) ? apiDetail.details : [])[0] || {};

const resolveOvertimeDate = (apiDetail = {}) => {
  const firstDetail = getApiFirstDetail(apiDetail);
  return (
    formatDateText(apiDetail.overtimeDate) ||
    formatDateText(firstDetail.overtimeDate) ||
    formatDateText(apiDetail.overtimeStartTime) ||
    formatDateText(apiDetail.startTime) ||
    formatDateText(firstDetail.startTime) ||
    ""
  );
};

const resolveOvertimeStartTime = (apiDetail = {}) => {
  const firstDetail = getApiFirstDetail(apiDetail);
  return apiDetail.overtimeStartTime || apiDetail.startTime || firstDetail.startTime || "";
};

const resolveOvertimeEndTime = (apiDetail = {}) => {
  const firstDetail = getApiFirstDetail(apiDetail);
  return apiDetail.overtimeEndTime || apiDetail.endTime || firstDetail.endTime || "";
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

export const formatOvertimeDateTimeValue = (value) => buildOvertimeSaveDateTime(null, value);

export const resolveOvertimeDateFromDateTime = (dateTime) => {
  const formatted = formatOvertimeDateTimeValue(dateTime);
  if (!formatted) {
    return "";
  }
  const parsed = dayjs(formatted);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : formatDateText(formatted);
};

export const normalizeOvertimeDetail = (apiDetail = {}) => {
  const firstDetail = getApiFirstDetail(apiDetail);
  const overtimeRequestId = getOvertimeRequestId(apiDetail);
  const requestNo = apiDetail.requestNo || apiDetail.billNo || "";
  const overtimeDate = resolveOvertimeDate(apiDetail);
  const startTime = resolveOvertimeStartTime(apiDetail);
  const endTime = resolveOvertimeEndTime(apiDetail);
  const breakMinutes =
    apiDetail.restMinutes ?? apiDetail.breakMinutes ?? firstDetail.restMinutes ?? 0;
  const overtimeHours =
    apiDetail.applyOvertimeHours ??
    apiDetail.applyHours ??
    apiDetail.overtimeHours ??
    firstDetail.applyHours ??
    0;
  const approvalInstanceId = apiDetail.approvalInstanceId ?? apiDetail.instanceId ?? null;

  return {
    ...apiDetail,
    details: Array.isArray(apiDetail.details) ? apiDetail.details : [],
    approvalLogs: Array.isArray(apiDetail.approvalLogs) ? apiDetail.approvalLogs : [],
    ...(approvalInstanceId !== null
      ? {
          approvalInstanceId,
          instanceId: apiDetail.instanceId ?? approvalInstanceId,
        }
      : {}),
    ...(overtimeRequestId !== null
      ? { overtimeRequestId, requestId: overtimeRequestId }
      : {}),
    ...(requestNo ? { requestNo, billNo: requestNo } : {}),
    talentName: apiDetail.talentName || apiDetail.applicant || "",
    applicant: apiDetail.talentName || apiDetail.applicant || "",
    employeeCode: apiDetail.talentCode || apiDetail.employeeCode || "",
    organization: apiDetail.deptName || apiDetail.organization || "",
    position: apiDetail.positionName || apiDetail.position || "",
    overtimeDate,
    startTime: formatDateTimeText(startTime) || startTime,
    endTime: formatDateTimeText(endTime) || endTime,
    startTimeOnly: apiDetail.startTimeOnly || parseTimeOnly(startTime),
    endTimeOnly: apiDetail.endTimeOnly || parseTimeOnly(endTime),
    breakMinutes,
    overtimeHours,
    overtimeReason: apiDetail.reason || apiDetail.overtimeReason || "",
    overtimeType: apiDetail.overtimeTypeName || apiDetail.overtimeType || "",
    compensationType: apiDetail.compensationType || "",
    status: apiDetail.status || apiDetail.requestStatus || apiDetail.approvalStatus || "",
    requestStatus: apiDetail.requestStatus || apiDetail.status || "",
    approvalStatus:
      apiDetail.approvalStatus || apiDetail.requestStatus || apiDetail.status || "",
    remark: apiDetail.remark ?? "",
    approver:
      apiDetail.currentApproverNames ||
      apiDetail.currentApproverName ||
      apiDetail.approver ||
      "",
    applyDate:
      formatDateText(apiDetail.submitTime) ||
      formatDateText(apiDetail.applyTime) ||
      formatDateText(apiDetail.createTime) ||
      "",
    applyTime:
      resolveOvertimeApplyTime(apiDetail),
    currentApproverNames:
      apiDetail.currentApproverNames ||
      apiDetail.currentApproverName ||
      apiDetail.approver ||
      "",
    source: apiDetail.source || "员工自助",
  };
};

const mergeApprovalCenterExtras = (detail = {}, extra = {}) => ({
  ...detail,
  taskId: detail.taskId ?? extra.taskId ?? null,
  canApprove: detail.canApprove ?? extra.canApprove,
  canReject: detail.canReject ?? extra.canReject,
});

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
  config = { isLoading: false },
) {
  if (overtimeRequestId === undefined || overtimeRequestId === null || overtimeRequestId === "") {
    throw new Error("overtimeRequestId is required");
  }
  const res = await queryOvertimeRequestAdminDetail({ overtimeRequestId }, config);
  return normalizeOvertimeDetail(res?.data || {});
}

export async function fetchOvertimeRequestDetailForApproval(
  overtimeRequestId,
  approvalRow = {},
  config = { isLoading: false },
) {
  const detail = await fetchOvertimeRequestDetail(overtimeRequestId, config);
  return mergeApprovalCenterExtras(
    detail,
    buildApprovalCenterOvertimeFallback(approvalRow),
  );
}
