import dayjs from "dayjs";
import { querySupplementRequestAdminDetail } from "@/api/attendance";

export const getSupplementRequestId = (detail = {}) => {
  const id = detail?.supplementRequestId ?? detail?.requestId;
  return id === undefined || id === null || id === "" ? null : id;
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

export const formatSupplementAttendanceTime = (item = {}) => {
  if (item.attendanceDateTime) {
    return formatDateTimeText(item.attendanceDateTime);
  }
  if (item.attendanceTime) {
    return formatDateTimeText(item.attendanceTime);
  }
  const { attendanceDate, timePoint } = item;
  if (attendanceDate && timePoint) {
    return `${attendanceDate} ${timePoint}`;
  }
  if (attendanceDate) {
    return attendanceDate;
  }
  return "";
};

export const normalizeSupplementItem = (item = {}) => ({
  attendanceTime: formatSupplementAttendanceTime(item),
  reasonCode: item.reasonCode || "",
  reason: item.reasonName || item.reason || "",
  remark: item.remark || "",
});

export const createEmptySupplementItem = () => ({
  attendanceTime: "",
  reasonCode: "",
  reason: "",
  remark: "",
});

export const isSupplementItemFilled = (item) =>
  !!(item?.attendanceTime || item?.reasonCode || item?.reason);

export const isSupplementItemValid = (item) =>
  !!(item?.attendanceTime && item?.reasonCode);

export const normalizeSupplementRecord = (record = {}) => ({
  ...record,
  items: Array.isArray(record.items)
    ? record.items.map((item) => normalizeSupplementItem(item))
    : [],
});

export const normalizeSupplementListRow = (item = {}, index = 0, pageNo = 1, pageSize = 20) => {
  const supplementItem = normalizeSupplementItem({
    attendanceDateTime: item.attendanceDateTime,
    reasonCode: item.reasonCode,
    reasonName: item.reasonName,
    remark: item.remark,
  });
  const supplementRequestId = getSupplementRequestId(item);
  const requestNo = item.requestNo || item.billNo || "";
  const approver =
    item.currentApproverNames ||
    item.currentApproverName ||
    item.approver ||
    "";

  return {
    ...item,
    ...(supplementRequestId !== null
      ? { supplementRequestId, requestId: supplementRequestId }
      : {}),
    billNo: requestNo,
    requestNo,
    applicant: item.talentName || item.applicant || "",
    employeeName: item.talentName || item.employeeName || item.applicant || "",
    employeeCode: item.talentCode || item.employeeCode || "",
    organization: item.deptName || item.organization || "",
    position: item.posName || item.positionName || item.position || "",
    attendanceTime: supplementItem.attendanceTime || "--",
    reason: supplementItem.reason || "--",
    reasonCode: supplementItem.reasonCode || "",
    status: item.status || item.billStatus || "",
    billStatus: item.status || item.billStatus || "",
    approver,
    remark: item.remark || "--",
    applyDate:
      formatDateText(item.applyTime) ||
      formatDateText(item.submitTime) ||
      formatDateText(item.createTime) ||
      "--",
    items: [supplementItem],
    sid: (pageNo - 1) * pageSize + index,
  };
};

export const normalizeSupplementDetail = (detail = {}, fallback = {}) => {
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
  const supplementRequestId =
    getSupplementRequestId(merged) ?? getSupplementRequestId(fallback);
  const requestNo = merged.requestNo || merged.billNo || fallback.requestNo || fallback.billNo || "";
  const supplementItem = normalizeSupplementItem({
    attendanceDateTime: firstDetail.attendanceDateTime || merged.attendanceDateTime,
    reasonCode: firstDetail.reasonCode || merged.reasonCode,
    reasonName: firstDetail.reasonName || merged.reasonName,
    remark: firstDetail.remark ?? merged.remark ?? "",
  });
  const approverNames = Array.isArray(merged.currentApproverNames)
    ? merged.currentApproverNames.join("、")
    : merged.currentApproverNames || merged.currentApproverName || merged.approver || "";

  return {
    ...merged,
    ...(supplementRequestId !== null
      ? { supplementRequestId, requestId: supplementRequestId }
      : {}),
    ...(requestNo ? { requestNo, billNo: requestNo } : {}),
    applicant: merged.talentName || merged.applicant || fallback.applicant || "",
    employeeCode: merged.talentCode || merged.employeeCode || fallback.employeeCode || "",
    organization: merged.deptName || merged.organization || fallback.organization || "",
    position: merged.positionName || merged.position || fallback.position || "",
    applyDate:
      formatDateText(merged.applyTime) ||
      formatDateText(merged.submitTime) ||
      formatDateText(merged.createTime) ||
      fallback.applyDate ||
      "",
    status: merged.status || fallback.status || "",
    approver: approverNames,
    approvalComment:
      merged.approvalLogs?.[merged.approvalLogs.length - 1]?.actionComment ||
      merged.approvalComment ||
      fallback.approvalComment ||
      "",
    items: [supplementItem],
    canEdit: merged.canEdit === true,
    canSubmit: merged.canSubmit === true,
    canDelete: merged.canDelete === true,
    canAbandon: merged.canAbandon === true,
    canApprove: merged.canApprove === true,
    canReject: merged.canReject === true,
    canReverseApprove: merged.canReverseApprove === true,
    taskId: merged.taskId ?? merged.task?.taskId ?? null,
  };
};

export const buildApprovalCenterSupplementFallback = (row = {}) => ({
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

export async function fetchSupplementRequestDetail(
  supplementRequestId,
  fallback = {},
  config = { isLoading: false },
) {
  if (supplementRequestId === undefined || supplementRequestId === null || supplementRequestId === "") {
    throw new Error("supplementRequestId is required");
  }
  const res = await querySupplementRequestAdminDetail({ supplementRequestId }, config);
  return normalizeSupplementDetail(res?.data || {}, { ...fallback, supplementRequestId });
}

export const buildSupplementSavePayload = (formItem, options = {}) => ({
  supplementRequestId: options.supplementRequestId || undefined,
  talentCode: options.talentCode || undefined,
  attendanceDateTime: formatSupplementAttendanceTime(formItem),
  reasonCode: formItem.reasonCode,
  remark: formItem.remark?.trim() || undefined,
  actionType: options.actionType || "save",
});

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

export const buildSupplementApprovalFlow = (detail = {}) => {
  const logs = Array.isArray(detail?.approvalLogs) ? detail.approvalLogs : [];
  const status = detail?.status || "";
  const isPending = status === "审批中";

  if (!logs.length) {
    if (status === "未提交") {
      return [
        {
          time: formatDateTimeText(detail.applyTime) || detail.applyDate || "",
          title: "保存草稿",
          actor: detail.applicant || "",
          description: "补签单暂未提交审批。",
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

export const buildSupplementRequestIdsPayload = (rows = []) => {
  const ids = [
    ...new Set(rows.map((item) => getSupplementRequestId(item)).filter((id) => id || id === 0)),
  ];
  if (!ids.length) {
    return null;
  }
  if (ids.length === 1) {
    return { supplementRequestId: ids[0] };
  }
  return { supplementRequestIds: ids.join(",") };
};
