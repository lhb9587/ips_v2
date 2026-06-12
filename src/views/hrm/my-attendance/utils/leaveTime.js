import dayjs from "dayjs";

export const LEAVE_START_TIME2_OPTIONS = [
  { label: "上午 9:00", value: "9:00:00" },
  { label: "上午 11:45", value: "11:45:00" },
];

export const LEAVE_END_TIME2_OPTIONS = [
  { label: "下午 14:00", value: "14:00:00" },
  { label: "下午 18:00", value: "18:00:00" },
];

export const normalizeLeaveTime2 = (timeText, isEnd = false) => {
  const text = String(timeText || "").trim();
  if (!text) {
    return isEnd ? "18:00:00" : "9:00:00";
  }

  const options = isEnd ? LEAVE_END_TIME2_OPTIONS : LEAVE_START_TIME2_OPTIONS;
  const matched = options.find((item) => item.value === text);
  if (matched) {
    return matched.value;
  }

  const parts = text.split(":");
  if (parts.length >= 2) {
    const normalized = `${Number(parts[0])}:${String(parts[1]).padStart(2, "0")}:${String(parts[2] || "00").padStart(2, "0")}`;
    const byValue = options.find((item) => item.value === normalized);
    if (byValue) {
      return byValue.value;
    }
    const hour = Number(parts[0]);
    const minute = Number(parts[1] || 0);
    if (isEnd) {
      return hour >= 18 ? "18:00:00" : "14:00:00";
    }
    if (hour > 11 || (hour === 11 && minute >= 45)) {
      return "11:45:00";
    }
    return "9:00:00";
  }

  if (text === "下午") {
    return isEnd ? "18:00:00" : "11:45:00";
  }
  if (text === "上午") {
    return isEnd ? "14:00:00" : "9:00:00";
  }

  return isEnd ? "18:00:00" : "9:00:00";
};

export const formatLeaveTime2Label = (time2, isEnd = false) => {
  const options = isEnd ? LEAVE_END_TIME2_OPTIONS : LEAVE_START_TIME2_OPTIONS;
  const normalized = normalizeLeaveTime2(time2, isEnd);
  return options.find((item) => item.value === normalized)?.label || time2;
};

export const parseLeaveDateTimeField = (timeText, isEnd = false) => {
  const text = String(timeText || "").trim();
  if (!text) {
    return { date: "", time2: isEnd ? "18:00:00" : "9:00:00" };
  }

  if (text.includes("上午") || text.includes("下午")) {
    const parts = text.split(/\s+/).filter(Boolean);
    const date = parts[0] || "";
    const periodIndex = parts.findIndex((part) => part === "上午" || part === "下午");
    if (periodIndex >= 0) {
      const period = parts[periodIndex];
      const timePart = parts[periodIndex + 1];
      if (timePart && timePart.includes(":")) {
        return { date, time2: normalizeLeaveTime2(timePart, isEnd) };
      }
      return { date, time2: normalizeLeaveTime2(period, isEnd) };
    }
  }

  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const parsed = dayjs(normalized);
  if (!parsed.isValid()) {
    return { date: "", time2: isEnd ? "18:00:00" : "9:00:00" };
  }

  const time2 = `${parsed.hour()}:${String(parsed.minute()).padStart(2, "0")}:${String(parsed.second()).padStart(2, "0")}`;
  return {
    date: parsed.format("YYYY-MM-DD"),
    time2: normalizeLeaveTime2(time2, isEnd),
  };
};

export const resolveLeaveTimeFields = (detail = {}) => {
  const startParsed = parseLeaveDateTimeField(detail.startTime, false);
  const endParsed = parseLeaveDateTimeField(detail.endTime, true);
  const startDate = detail.startDate || startParsed.date;
  const endDate = detail.endDate || endParsed.date;

  return {
    startTime: startDate,
    startTime2: normalizeLeaveTime2(detail.startTime2 || startParsed.time2, false),
    endTime: endDate,
    endTime2: normalizeLeaveTime2(detail.endTime2 || endParsed.time2, true),
  };
};

export const formatLeaveTimeDisplay = (detail = {}, isEnd = false) => {
  const fields = resolveLeaveTimeFields(detail);
  const date = isEnd ? fields.endTime : fields.startTime;
  const time2 = isEnd ? fields.endTime2 : fields.startTime2;
  if (!date) {
    return "";
  }
  return `${date} ${formatLeaveTime2Label(time2, isEnd)}`;
};
