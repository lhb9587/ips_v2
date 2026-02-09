export function formatNumberWithCommas(input) {
  // 检查输入是否为数字（包括可以转换为数字的字符串）
  if (typeof input === "number" || (!isNaN(input) && input.trim() !== "")) {
    // 转换为数字
    const num = Number(input);
    // 检查是否为有限数字
    if (Number.isFinite(num)) {
      // 使用 toLocaleString 方法添加千位符
      return num.toLocaleString();
    }
  }
  // 如果输入不是数字，返回 0
  return "0";
}
export function formatNumber(num) {
  if (num == null || isNaN(num)) return "0";

  const absNum = Math.abs(num);

  // 单位（注意：去掉十万，百万才开始显示单位）
  const units = [
    { value: 1e8, symbol: "亿" },
    { value: 1e7, symbol: "千万" },
    { value: 1e6, symbol: "百万" },
  ];

  // 1. 超过百万 → 按单位显示
  for (const u of units) {
    if (absNum >= u.value) {
      const formatted = (num / u.value).toFixed(2);
      // 如果小数部分为"00"，则只显示整数部分
      if (formatted.endsWith(".00")) {
        return `${parseInt(formatted)}${u.symbol}`;
      }
      return `${formatted}${u.symbol}`;
    }
  }

  // 2. 小于百万 → 千分位显示
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // 如果小数部分为"00"，则只显示整数部分
  if (formatted.endsWith(".00")) {
    return formatted.substring(0, formatted.length - 3);
  }

  return formatted;
}
