export const isHourBasedLeaveType = (leaveTypeName = "") => leaveTypeName === "调休假";

export const getLeaveTypeUnit = (leaveTypeName = "") =>
  isHourBasedLeaveType(leaveTypeName) ? "小时" : "天";

export const formatLeaveTypeLabel = (leaveTypeName = "") => {
  if (!leaveTypeName || leaveTypeName === "其他假期") {
    return leaveTypeName;
  }

  return `${leaveTypeName}（${getLeaveTypeUnit(leaveTypeName)}）`;
};
