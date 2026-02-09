import axios from "axios";
import jsFileDownload from "js-file-download";
import { setTableConfig, getTableConfig } from "@/utils/user";
import { writeFile } from "xlsx";
import clipboard3 from "vue-clipboard3";
const { toClipboard } = clipboard3();

export function sort(a, b) {
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  if (Number(a) + "" !== "NaN") {
    return a - b;
  } else if (typeof a == "string") {
    return a.localeCompare(b, "zh");
  } else {
    return 0;
  }
}

export function transformation(arr, val, valType, labelStr) {
  if (arr && arr.length) {
    let item = arr.find((item) => item[valType] == val);
    if (item) {
      return item[labelStr];
    } else {
      return "";
    }
  }
  return "";
}

export function getProgID(fileName) {
  let ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

  switch (ext) {
    case "ppt":
    case "pptx":
    case "ppsx":
    case "pot":
    case "potx":
    case "pptm":
      return "PowerPoint.Show";
    case "doc":
    case "docx":
    case "dot":
    case "dotx":
      return "Word.Document";
    case "xls":
    case "xlt":
    case "xlsx":
    case "xlst":
    case "xlsm":
    case "xltx":
      return "Excel.Sheet";
    default:
      return "";
  }
}
export function viewPdf(url, flag) {
  let caseList = require("@/api/caseList");
  return new Promise((resolve) => {
    caseList.viewPdf({ address: `${url}` }).then((res) => {
      resolve(res.data.pdfAddress);
      if (!flag) {
        window.open(`/ipdoc${res.data.pdfAddress}`.replace(/[+]/g, "%2B"));
      }
    });
  });
}
export function contractViewPdf(url, flag) {
  let list = require("@/api/contract");
  return new Promise((resolve) => {
    list.contractViewPdf({ wordFilePath : `${url}` }).then((res) => {
      resolve(res.data.pdfAddress);
      if (!flag) {
        window.open(`/ipdoc${res.data.pdfAddress}`.replace(/[+]/g, "%2B"));
      }
    });
  });
}
/**
 *
 * @param {Array} arrs 树形数据
 * @param {string} childs 树形数据子数据的属性名,常用'children'
 * @param {Array} attrArr 需要提取的公共属性数组(默认是除了childs的全部属性)
 * @returns
 *
 * @author wang
 */
export function extractTree(arrs = [], childs, attrArr) {
  let attrList = [];
  if (!Array.isArray(arrs) && !arrs.length) return [];
  if (typeof childs !== "string") return [];
  if (!Array.isArray(attrArr) || (Array.isArray(attrArr) && !attrArr.length)) {
    attrList = (arrs[0] && Object.keys(arrs[0])) || [];
    attrList.splice(attrList.indexOf(childs), 1);
  } else {
    attrList = attrArr;
  }
  const list = [];
  const getObj = (arr) => {
    arr.forEach(function (row) {
      const obj = {};
      attrList.forEach((item) => {
        obj[item] = row[item];
      });
      list.push(obj);
      if (row[childs]) {
        getObj(row[childs]);
      }
    });
    return list;
  };
  return getObj(arrs);
}

export function formatAmount(amount) {
  if (Number(amount) < 0) {
    if (Number(amount)) {
      amount = -amount;
      amount = "" + Number(amount).toFixed(2);
      // amount = '' + (Number(amount)+0.004).toFixed(2);
      let x = amount.split(".");
      let x1 = x[0];
      let x2 = "." + x[1];
      let rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "," + "$2");
      }
      return "-" + x1 + x2;
    } else {
      return -amount;
    }
  } else {
    if (Number(amount)) {
      // amount = '' + (Number(amount)+0.004).toFixed(2);
      amount = "" + Number(amount).toFixed(2);
      let x = amount.split(".");
      let x1 = x[0];
      let x2 = "." + x[1];
      let rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + "," + "$2");
      }
      return x1 + x2;
    } else {
      return amount;
    }
  }
  // return amount
}

export function formatAmountValue(value) {
  if (value == null || value === "") return "";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  // 如果金额大于等于 1 千万，保留两位小数并附加 '亿'
  if (absValue >= 100000000) {
    return sign + Math.trunc(absValue / 1000000) / 100 + "亿+";
  }
  // 如果金额在 1 万到 1 千万之间，不保留小数并附加 '万'
  if (absValue >= 100000) {
    return sign + Math.trunc(absValue / 10000) + "万+";
  }
  // 显示原始值
  return sign + absValue;
}
export function fomatFloat(num, n) {
  var f = parseFloat(num);
  if (isNaN(f)) {
    return false;
  }
  f = Math.round(num * Math.pow(10, n + 1)) / Math.pow(10, n + 1); // n 幂
  f = Math.round(f * Math.pow(10, n)) / Math.pow(10, n); // n 幂
  var s = f.toString();
  var rs = s.indexOf(".");
  //判定如果是整数，增加小数点再补0
  if (rs < 0) {
    rs = s.length;
    s += ".";
  }
  while (s.length <= rs + n) {
    s += "0";
  }
  return s;
}

/**
 * 去除传参空字段
 * @param {Object} obj1
 *
 */
export function cleanNullAttr(obj1) {
  const obj = JSON.parse(JSON.stringify(obj1));
  for (let key in obj) {
    if (
      Object.prototype.toString.call(obj[key]) == "[object Array]" &&
      (!obj[key].length || !obj[key].filter(Boolean).length)
    ) {
      obj[key] = [];
    } else if (!obj[key] && obj[key] !== 0 && obj[key] !== false) {
      obj[key] = undefined;
    }
  }
  return obj;
}

export function downLoadAll(data) {
  axios
    .get(data.url, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
    .then((res) => {
      if (data.downLoad) {
        jsFileDownload(
          res.data,
          data.downLoad + "." + data.url.replace(/.+\./, "")
        );
      } else {
        jsFileDownload(
          res.data,
          data.url.split("/")[data.url.split("/").length - 1]
        );
      }
      if (data.success && typeof data.success == "function") {
        data.success();
      }
    })
    .catch((e) => {
      if (data.error) {
        data.error(e);
      }
    });
}

export function unique(data, key) {
  const hash = {};
  const data2 = data.reduce((preVal, curVal) => {
    hash[String(curVal[key])]
      ? ""
      : (hash[String(curVal[key])] = true && preVal.push(curVal));
    return preVal;
  }, []);
  return data2;
}

export function getMenuName(obj, childrenStr = "childrens") {
  var arr = [];
  arr.push(obj);
  for (var i = 0, len = obj.length; i < len; i++) {
    arr.push(obj[i][childrenStr]);
    if (obj[i][childrenStr] != null && obj[i][childrenStr].length > 0) {
      var factorial = function () {
        var _obj = arguments[0];
        for (var j = 0, _len = _obj.length; j < _len; j++) {
          arr.push(_obj[j][childrenStr]);
          if (_obj[j][childrenStr] != null && _obj[j][childrenStr].length > 0) {
            factorial(_obj[j][childrenStr]);
          }
        }
      };
      factorial(obj[i][childrenStr]);
    }
  }
  var result = [];
  for (let i = 0; i < arr.length; i++) {
    result = result.concat(arr[i]);
  }
  return result.filter((item) => item !== undefined && item !== null);
}

/**
 * @param {Object} Obj
 * @param {String} key
 * @param {Array || Number} array
 * @returns {Array || Number}
 */
export function getTwoDimensionalArray(Obj, key, array, props) {
  // console.log(Obj, key, array, props);
  if (props && props.children) {
    var childrenStr = props.children;
  }
  var parent;
  if (props && props.parent) {
    parent = props.parent;
  } else {
    parent = "parent";
  }
  let menuNameList = getMenuName(Obj, childrenStr);

  function familyTree(arr, pid) {
    var temp = [];
    var forFn = function (arr, pid) {
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (item[key] == pid) {
          temp.push(item);
          forFn(arr, item[parent]);
        }
      }
    };
    forFn(arr, pid);
    return temp;
  }

  if (Object.prototype.toString.call(array).includes("Array")) {
    return array.map((item) =>
      familyTree(menuNameList, item)
        .map((item) => item[key])
        .reverse()
    );
  } else {
    return familyTree(menuNameList, array)
      .map((item) => item[key])
      .reverse();
  }
}

export function getLanglist(array) {
  array = array.filter((item) => !!item);
  let arr = [];
  array.forEach((item) => {
    arr.push(...item);
  });
  return arr;
}

export function saveTableConfig(configName, gridName, newVal) {
  let config = getTableConfig() || [];
  if (config.length > 0) {
    const index = config.findIndex((item) => item.name == gridName);
    if (index > -1) {
      config[index][configName] = newVal;
    } else {
      config.push({ name: gridName, [configName]: newVal });
    }
  } else {
    config.push({ name: gridName, [configName]: newVal });
  }
  setTableConfig(JSON.stringify(config));
}

export function addCopyFunction() {
  document.getElementsByTagName("body")[0].onmouseover = function (e) {
    const hascopyIcon = Array.from(e.target.children).some(
      (child) =>
        child.classList.contains("bx-copy-alt") ||
        child.classList.contains("bx-check-circle")
    );
    if (e.target.nodeName === "TD" && e.target.innerText && !hascopyIcon) {
      const noCopyEles =
        !e?.target?.className?.includes("el-table__cell") &&
        !e?.target?.className?.includes("nocopy");
      if (!noCopyEles) {
        return false;
      }
      const span1 = document.createElement("span");
      span1.className = "bx bx-copy-alt";
      span1.style.cursor = "pointer";
      span1.style.marginLeft = "8px";
      span1.style.color = "#556ee6";
      span1.style.fontSize = "14px";
      span1.onclick = function () {
        toClipboard(e.target.innerText);
        span1.className = "bx bx-check-circle";
        span1.style.color = "#00CC00";
      };
      e.target.appendChild(span1);
    }
  };
  document.getElementsByTagName("body")[0].onmouseout = function (e) {
    if (
      e.target?.nodeName === "TD" &&
      e.target?.innerText &&
      e.toElement?.className != "bx bx-copy-alt"
    ) {
      if (e.target?.getElementsByClassName("bx-copy-alt")[0]) {
        e.target?.removeChild(
          e.target?.getElementsByClassName("bx-copy-alt")[0]
        );
      } else if (e.target?.getElementsByClassName("bx-check-circle")[0]) {
        e.target?.removeChild(
          e.target?.getElementsByClassName("bx-check-circle")[0]
        );
      }
    }
  };
}
export function destroyCopyFunction() {
  document.getElementsByTagName("body")[0].onmouseover = null;
}

//导出excel
export function ExportExcel(headers, data, fileName = "导出结果.xlsx") {
  const _headers = headers
    .map((item, i) =>
      Object.assign(
        {},
        {
          key: item.key,
          title: item.title,
          position: String.fromCharCode(65 + i) + 1,
        }
      )
    )
    .reduce(
      (prev, next) =>
        Object.assign({}, prev, {
          [next.position]: { key: next.key, v: next.title },
        }),
      {}
    );

  const _data = data
    .map((item, i) =>
      headers.map((key, j) =>
        Object.assign(
          {},
          {
            content: item[key.key],
            position: String.fromCharCode(65 + j) + (i + 2),
          }
        )
      )
    )
    // 对刚才的结果进行降维处理（二维数组变成一维数组）
    .reduce((prev, next) => prev.concat(next))
    // 转换成 worksheet 需要的结构
    .reduce(
      (prev, next) =>
        Object.assign({}, prev, { [next.position]: { v: next.content } }),
      {}
    );

  Object.keys(_data).forEach((item) => {
    if (!isNaN(Number(_data[item]["v"]))) {
      _data[item]["v"] = Number(_data[item]["v"]) || "";
      _data[item]["t"] = "n";
    }
  });
  // 合并 headers 和 data
  const output = Object.assign({}, _headers, _data);
  // 获取所有单元格的位置
  const outputPos = Object.keys(output);
  // 计算出范围 ,["A1",..., "H2"]
  const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

  // 构建 workbook 对象
  const wb = {
    SheetNames: ["mySheet"],
    Sheets: {
      mySheet: Object.assign({}, output, {
        "!ref": ref,
        // eslint-disable-next-line
        "!cols": headers.map((item) => ({ wpx: 100 })),
      }),
    },
  };
  // 导出 Excel
  writeFile(wb, fileName);
}
function getSum(list, type) {
  if (list && list.length > 0) {
    return `${formatAmount(
      list
        .map((item) => item[type])
        .filter((item) => !!item)
        .reduce((x, y) => Number(x) + Number(y), 0)
    )}`;
  }
  return "";
}
export function formatBottomRowData(
  gridData,
  columnDefs = [],
  columnDisplay = []
) {
  console.log(gridData.length, "gridData");
  console.log(columnDefs.length, "columnDefs");
  console.log(columnDisplay.length, "columnDisplay");

  if (columnDefs.length && columnDisplay.length && gridData.length > 0) {
    let obj = {};
    console.log("执行了");

    columnDefs.forEach((column) => {
      if (column.children) {
        // 处理带子项的列 children (二级列)
        column.children.forEach((child) => {
          if (columnDisplay.includes(child.field)) {
            obj[child.field] = getSum(gridData, child.field);
          } else {
            obj[child.field] = "";
          }
        });
      } else {
        // 处理没有子项的列 children (一级列)
        if (columnDisplay.includes(column.value)) {
          const num = getSum(gridData, column.value);
          obj[column.value] = num;
        } else {
          obj[column.value] = "";
        }
      }
    });

    return [obj];
  }

  return [];
}

//查看文件
export function viewFile(url,name) {
  if (["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())) {
    viewPdf(`${url}`);
  } else if (
    ["pdf","jpg", "png"].some((item) => url.replace(/.+\./, "").toLocaleLowerCase() == item)
  ) {
    window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
  } else {
    downLoad(url,name);
  }
}
//合同查看文件
export function contractViewFile(url,name) {
  if (["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())) {
    contractViewPdf(`${url}`);
  } else if (
    ["pdf","jpg", "png"].some((item) => url.replace(/.+\./, "").toLocaleLowerCase() == item)
  ) {
    window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
  } else {
    downLoad(url,name);
  }
}
//下载文件
export function downLoad(url,name) {
  const link = document.createElement("a");
  link.href = `/ipdoc${url}`;
  link.setAttribute("download", name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//判断是否为pc端
export function checkIsPc(){
  return !('ontouchstart' in window || navigator.maxTouchPoints > 0)
}
