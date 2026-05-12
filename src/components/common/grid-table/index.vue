<script setup>
import { AgGridVue } from "ag-grid-vue3";
//   import { getFilterModel, saveFilterModel } from '@/utils/aggrid'
import {
  computed,
  onMounted,
  ref,
  onBeforeUnmount,
  defineProps,
  defineExpose,
  watch,
  nextTick,
  onUnmounted,
  createVNode,
  render,
} from "vue";
import clipboard3 from "vue-clipboard3";
import { sort, formatBottomRowData } from "@/utils";
import { savePreference } from "@/api/caseList";
import { getUserInfo } from "@/utils/user";
import i18n from "@/i18n";
const { t } = i18n.global;

const props = defineProps({
  //表格底部总计key值
  columnDisplay: {
    type: Array,
    default: () => [],
  },
  bussId: {
    type: Number,
  },
  sizeToFit: {
    type: Boolean,
    default: false,
  },
  //自定义样式类名
  activeClass: {
    type: Array,
    default: () => [],
  },

  // 表头是否分组
  autoGroupColumnDef: {
    type: Boolean,
    default: false,
  },
  //是否有子表格
  masterDetail: {
    type: Boolean,
    default: false,
  },
  hasDetailGrid: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  // 表格名称，用于记忆列宽、顺序、搜索条件等
  gridName: {
    type: String,
    default: "",
  },
  // 表格高度
  height: {
    type: Number,
    default: 500,
  },
  // 行高
  rowHeight: {
    type: Number,
  },
  // 列头
  columnDefs: {
    default: () => [],
  },
  // 数据
  gridData: {
    type: Array,
    default: () => [],
  },
  // 单击事件
  rowClick: {
    type: Function,
    default: () => {
      //console.log('rowClicked')
    },
  },
  // 双击事件
  rowDoubleClicked: {
    type: Function,
    default: () => {},
  },
  // 表格配置
  gridOptions: {
    type: Object,
    default: () => {},
  },
  statusBar: {
    type: Object,
    default: () => {},
  },
  detailCellRendererParams: {
    type: Object,
    default: () => {},
  },
  // 右键菜单
  contextmenuList: {
    type: Array,
    default: () => [],
  },
  rowSelection: {
    type: String,
    default: "multiple",
  },
  // 是否自动添加左侧多选列，开启后列头展示全选框
  showSelectionColumn: {
    type: Boolean,
    default: false,
  },
  selectionColumnOptions: {
    type: Object,
    default: () => ({}),
  },
  // 单元格渲染
  cellRenderer: {
    type: [Function, undefined],
  },
});
const defaultColDef = {
  boo: "null",
  title: "序号",
  value: "sid",
  width: "60",
};
const selectionColumnDef = {
  title: "",
  value: "__selection__",
  field: "__selection__",
  width: 48,
  minWidth: 48,
  maxWidth: 48,
  pinned: "left",
  lockPosition: "left",
  suppressMovable: true,
  resizable: false,
  sortable: false,
  filter: false,
  menuTabs: [],
  checkboxSelection: true,
  headerCheckboxSelection: true,
  headerCheckboxSelectionFilteredOnly: false,
  suppressColumnsToolPanel: true,
};
const getColumnList = (list = []) => {
  if (!props.showSelectionColumn) {
    return list;
  }
  const hasSelectionColumn = list.some(
    (item) =>
      item.value === selectionColumnDef.value ||
      item.field === selectionColumnDef.field,
  );
  if (hasSelectionColumn) {
    return list;
  }
  return [
    {
      ...selectionColumnDef,
      ...props.selectionColumnOptions,
    },
    ...list,
  ];
};
watch(
  () => props.columnDefs,
  (newValue) => {
    if (newValue.length > 0) {
      if (props.hasDetailGrid) {
        init(getColumnList([defaultColDef, ...newValue]));
      } else {
        init(getColumnList(newValue));
      }
      // setColumnWidth();
    }
  },
);
watch(
  () => [props.columnDefs, props.gridData],
  (newVal) => {
    if (newVal[0].length > 0 && newVal[1].length > 0) {
      setTimeout(() => {
        setColumnWidth();
      }, 100);
      if (props.columnDisplay.length > 0) {
        pinnedBottomRowData.value = formatBottomRowData(
          gridData.value,
          props.columnDefs,
          props.columnDisplay,
        );
        console.log("pinnedBottomRowData", pinnedBottomRowData.value);
      }
      // window.addEventListener("resize", initTableWidth);
    }
  },
);
watch(
  () => props.rowHeight,
  async () => {
    await nextTick();
    gridApi.value?.resetRowHeights();
  },
);
// 表格数据
const gridData = computed(() => props.gridData);
// grid表格api
const gridApi = ref();
// grid列头api
//   let columnApi = {}
// 复制方法
const { toClipboard } = clipboard3();

const pinnedBottomRowData = ref([]);

const autoGroupColumnDef = {
  headerName: "分组",
  field: "group",
  // headerCheckboxSelection: false,
  // cellRendererParams: { checkbox: false },
};
// grid汉化
const localeText = {
  selectAll: t("gridtable.selectAll"),
  searchOoo: t("gridtable.searchOoo"),
  blanks: t("gridtable.blanks"),
  pinColumn: t("gridtable.pinColumn"),
  pinLeft: t("gridtable.pinLeft"),
  pinRight: t("gridtable.pinRight"),
  noPin: t("gridtable.noPin"),
  autosizeThiscolumn: t("gridtable.autosizeThiscolumn"),
  autosizeAllColumns: t("gridtable.autosizeAllColumns"),
  groupBy: t("gridtable.groupBy"),
  ungroupBy: t("gridtable.ungroupBy"),
  resetColumns: t("gridtable.resetColumns"),
  noRowsToShow: t("gridtable.noRowsToShow"),
  equals: t("gridtable.equals"),
  notEqual: t("gridtable.notEqual"),
  lessThan: t("gridtable.lessThan"),
  greaterThan: t("gridtable.greaterThan"),
  inRange: t("gridtable.inRange"),
  inRangeStart: t("gridtable.inRangeStart"),
  inRangeEnd: t("gridtable.inRangeEnd"),
  andCondition: t("gridtable.andCondition"),
  orCondition: t("gridtable.orCondition"),
  rowGroupColumnsEmptyMessage: t("gridtable.rowGroupColumnsEmptyMessage"),
  groups: t("gridtable.groups"),
  expandAll: t("gridtable.expandAll"),
  collapseAll: t("gridtable.collapseAll"),
  selectedRows: t("gridtable.selectedRows"),
  totalAndFilteredRows: t("gridtable.totalAndFilteredRows"),
  copy: t("gridtable.copy"),
  paste: t("gridtable.paste"),
};

const defaultContextmenuList = [
  {
    name: "复制",
    action: "copy",
    suppressCloseOnSelect: true,
    icon: '<i class="mdi mdi-check-circle" style="color: green;font-size:16px"></i>',
  },
];

// 清空筛选按钮状态
//   const brushRightHasFilter = ref(false)
const columns = ref([]);

// 刷新表格
const refreshEvenRowsCurrencyData = (params) => {
  // this.currentPageSize = params.api.rowModel.rootNode.allChildrenCount
  // gridApi.value.rowModel.rootNode.childrenAfterFilter &&
  //   gridApi.value.rowModel.rootNode.childrenAfterFilter.length &&
  //   gridApi.value.rowModel.rootNode.childrenAfterFilter.forEach((rowNode) => {
  //     setTimeout(() => {
  //       rowNode.setDataValue('sid', rowNode.rowIndex + 1)
  //     }, 0)
  //   })
  if (gridApi.value) {
    if (params.type == "filterChanged") {
      const filters = params.api.getFilterModel();
      let list = Object.keys(filters);
      hasFilter.value = list.length > 0;
    }
  }
};
// 表格渲染完成事件
// const initTableWidth = () => {
//   setTimeout(() => {
//     const params = initparams.value;
//     setColumns240(params)
//     params.columnApi.autoSizeAllColumns(false);
//     const tableWidth =
//       document.querySelector(".ag-header-viewport").clientWidth || 1747;
//     const allColumnsWidth = params.columnApi?.columnModel?.bodyWidth;
//     if (allColumnsWidth < tableWidth) {
//       //根据gridView宽度自适应
//       setTimeout(() => {
//         if (params.api) {
//           params.api.sizeColumnsToFit();
//         }
//       }, 500);
//     }
//     setTimeout(() => {
//       cancelColumnMaxWidth(params);
//       props.gridName && saveColumnsWidth(params);
//     }, 1000);
//   }, 1000);
// };
const initparams = ref();
const onGridReady = (params) => {
  initparams.value = params;
  gridApi.value = params.api;
  // if (gridApi.value) {
  //   gridApi.value.addEventListener('firstDataRendered', onFirstDataRendered);
  // }
};

// 设置列宽
let saveColumnsTimer;
const setColumnWidth = () => {
  const params = initparams.value;
  let obj = JSON.parse(localStorage.getItem("TABLE_HEADER")) || {};
  if (obj[props.gridName] || "") {
    cancelColumnMaxWidth(params);
  } else {
    params.columnApi.autoSizeAllColumns(false);

    const tableWidth =
      document.querySelector(".ag-header-viewport").clientWidth || 1747;
    const allColumnsWidth = params.columnApi.columnModel.bodyWidth;
    if (allColumnsWidth < tableWidth) {
      //根据gridView宽度自适应
      setTimeout(() => {
        if (params.api) {
          cancelColumnMaxWidth(params);
          params.api.sizeColumnsToFit();
        }
      }, 500);
    }
    saveColumnsTimer = setTimeout(() => {
      cancelColumnMaxWidth(params);
      props.gridName && saveColumnsWidth(params);
    }, 1000);
  }
};

const resetColumnWidth = () => {
  const params = initparams.value;
  setColumns240(params);
  if (!params?.columnApi || !params?.api) {
    return; // 如果 API 未准备好则直接返回
  }

  params.columnApi.autoSizeAllColumns(false);
  const tableWidth =
    document.querySelector(".ag-header-viewport")?.clientWidth || 1747;
  const allColumnsWidth = params.columnApi.columnModel.bodyWidth;

  if (allColumnsWidth < tableWidth) {
    //根据gridView宽度自适应
    setTimeout(() => {
      if (params.api) {
        cancelColumnMaxWidth(params);
        params.api.sizeColumnsToFit();
      }
    }, 500);
  }

  saveColumnsTimer = setTimeout(() => {
    cancelColumnMaxWidth(params);
    props.gridName && saveColumnsWidth(params);
  }, 1000);
};

//卸载时清除定时器
onUnmounted(() => {
  clearTimeout(saveColumnsTimer);
  clearTimeout(moveTimer);
  clearTimeout(resizedTimer);
});
//取消单元格最大宽度
const cancelColumnMaxWidth = (params) => {
  let colDefs = params.api.getColumnDefs() || [];
  colDefs.forEach((colDef) => {
    colDef.maxWidth = undefined; // 或者设置为null
  });
  params.api.setColumnDefs(colDefs);
};
//设置最大宽度为240
const setColumns240 = (params) => {
  let colDefs = params.api.getColumnDefs() || [];
  colDefs.forEach((colDef) => {
    colDef.maxWidth = 240; // 或者设置为null
  });
  params.api.setColumnDefs(colDefs);
};
//保存列宽
const saveColumnsWidth = (params) => {
  let tableHeader = params.columnApi.columnModel
    .getColumnState()
    .filter((item) => item.colId !== selectionColumnDef.value)
    .map((item) => ({
      width: item.width,
      prop: item.colId,
    }));
  let obj = JSON.parse(localStorage.getItem("TABLE_HEADER")) || {};
  obj[props.gridName] = tableHeader;
  localStorage.setItem("TABLE_HEADER", JSON.stringify(obj));
};
// 计算列宽
const getLoactionWidth = (label, value) => {
  if (label == "序号" || label == "类别") {
    return "80px";
  }
  if (!localStorage.getItem("TABLE_HEADER")) {
    return "auto";
  } else {
    let obj = JSON.parse(localStorage.getItem("TABLE_HEADER"));
    if (obj[props.gridName]) {
      let localWidth;
      obj[props.gridName].map((item) => {
        if (item.prop === value) {
          localWidth = item.width;
        }
      });
      return localWidth;
    } else {
      return "auto";
    }
  }
};
//获取最大列宽
const getColumnMaxWidth = () => {
  if (!localStorage.getItem("TABLE_HEADER")) {
    return 240;
  } else {
    let obj = JSON.parse(localStorage.getItem("TABLE_HEADER"));
    if (obj[props.gridName]) {
      return null;
    } else {
      return 240;
    }
  }
};
onMounted(() => {
  init(getColumnList(props.columnDefs));

  // 创建ResizeObserver实例
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (
        entry.target.classList.contains("grid-table-wrapper") &&
        gridApi.value
      ) {
        // 确保 grid API 已经准备好
        nextTick(() => {
          resetColumnWidth();
        });
      }
    }
  });

  // 监听grid-table-wrapper元素的尺寸变化
  const gridWrapper = document.querySelector(".grid-table-wrapper");
  if (gridWrapper) {
    resizeObserver.observe(gridWrapper);
  }

  // 将 observer 清理移到 onBeforeUnmount
  onBeforeUnmount(() => {
    resizeObserver.disconnect();
    gridApi.value = null;
  });
});

const refreshCellsfn = () => {
  var p = {
    force: true,
  };
  gridApi.value.refreshCells(p);
};

const init = (list) => {
  columns.value = list.map((item) => ({
    ...item,
    headerName: item.title,
    field: item.field || item.value,
    width:
      item.width ??
      (getLoactionWidth(item.title, item.value) == "auto"
        ? 200
        : getLoactionWidth(item.title, item.value)),
    resizable: item.resizable ?? true,
    sortable: item.sortable ?? true,
    maxWidth: item.maxWidth ?? getColumnMaxWidth(),
    minWidth:
      item.minWidth ?? (item.value === "sid" ? 60 : 120),
    editable: item.editable || false,
    singleClickEdit: item.singleClickEdit ?? false,
    flex: item.flex,
    filter: item.filter ?? "agSetColumnFilter",
    menuTabs: item.menuTabs || ["filterMenuTab", "generalMenuTab", "columnsMenuTab"],
    cellRenderer: item.cellRenderer ?? (item.checkboxSelection ? undefined : cellRenderer),
    enableRowGroup: item.enableRowGroup ?? true,
    rowGroup: item.rowGroup,
    comparator: (a, b) => {
      return sort(a, b, item.value);
    },
  }));
  // }
};
// 渲染方法，优先使用父组件传递过来的方法，没有则默认渲染文本
const cellRenderer = (params) => {
  if (props.cellRenderer) {
    return props.cellRenderer(params);
  } else {
    if (params.colDef.field === "sid") {
      return props.hasDetailGrid ? getSidDiv(params) : params.rowIndex + 1;
    }
    return `<span title="${params.value}">${
      params.value || params.value === 0 ? params.value : ""
    }</span>`;
  }
};
// 右键菜单
const getContextMenuItems = (params) => {
  if (!params?.node?.data) {
    return [];
  }
  return getRowContextmenuList().map((item) => ({
    suppressCloseOnSelect: true,
    name: item.name,
    action: () => {
      if (item.action === "copy") {
        copy(params, params.value);
      } else {
        item.action(params.node?.data, params.value);
      }
    },
    icon:
      copyText.value == params.value && rowIndex.value == params.node.rowIndex
        ? item.icon
        : "",
  }));
};
const getRowContextmenuList = () => {
  return [...defaultContextmenuList, ...(props.contextmenuList || [])];
};
const copyText = ref("");
const rowIndex = ref(undefined);
const copy = (params, value) => {
  if (value) {
    // copyText.value = value
    // rowIndex.value = params.node?.rowIndex || undefined
    handleCopy(params, value);
  }
};
const handleCopy = async (params, value) => {
  if (value) {
    try {
      await toClipboard(value);
      copyText.value = value;
      rowIndex.value = params.node?.rowIndex || undefined;

      // 1秒后关闭菜单
      // setTimeout(() => {
      //   if(params.api) {
      //     params.api.hidePopupMenu()
      //     // 重置状态
      //     copyText.value = ''
      //     rowIndex.value = undefined
      //   }
      // }, 1000)
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }
};
const getRowList = () => {
  const selectedNodes = gridApi.value.getSelectedNodes();
  const selectedData = selectedNodes.map((node) => node.data);
  return selectedData || [];
};
const getRowNode = () => {
  const selectedNodes = gridApi.value.getSelectedNodes();
  return selectedNodes || [];
};
const stopEditing = () => {
  gridApi.value.stopEditing(false);
};

//列移动的顺序
const userId = getUserInfo()?.userId;
let moveTimer;
const onColumnMoved = (params) => {
  if (!props.bussId) {
    return false;
  }
  if (!moveTimer) {
    moveTimer = setTimeout(() => {
      save();
      moveTimer = null;
    }, 500);
  }
  const save = () => {
    const columnsState = params.columnApi.columnModel.getColumnState();
    const columnMovedList = [];
    columnsState.map((item) => {
      let label = "";
      props.columnDefs.map((col) => {
        if (col.value === item.colId) {
          label = col.title;
        }
      });
      columnMovedList.push({ value: item.colId, title: label });
    });
    console.log(columnMovedList, "columnMovedList");
    const filterCol = columnMovedList.filter((item) => {
      return (
        item.value !== "sid" &&
        item.value !== "handle" &&
        item.value !== selectionColumnDef.value
      );
    });
    savePreference({
      userId,
      bussId: props.bussId,
      list2: filterCol,
    });
  };
};
//列宽度设置
let resizedTimer;
const onColumnResized = (params) => {
  if (!props.gridName) {
    return false;
  }
  if (
    params.finished &&
    params.type === "columnResized" &&
    params.source === "uiColumnResized"
  ) {
    if (!resizedTimer) {
      resizedTimer = setTimeout(() => {
        saveWidth(params);
        resizedTimer = null;
      }, 500);
    }
  }
  const saveWidth = () => {
    let tableHeader = params.columnApi.columnModel
      .getColumnState()
      .filter((item) => item.colId !== selectionColumnDef.value)
      .map((item) => ({
        // label: props.gridName,
        width: item.width,
        prop: item.colId,
      }));
    let obj = JSON.parse(localStorage.getItem("TABLE_HEADER")) || {};
    obj[props.gridName] = tableHeader;
    localStorage.setItem("TABLE_HEADER", JSON.stringify(obj));
  };
};
const getSidDiv = (params) => {
  const vnode = params.node?.data?.feeDetails
    ? createVNode(
        "div",
        {
          onClick: () => rowClicked(params),
        },
        [
          createVNode("i", {
            class: {
              "mdi mdi-chevron-right": !params.node.expanded,
              "mdi mdi-chevron-down": params.node.expanded,
            },
          }),
          createVNode(
            "span",
            {
              title: `${params.rowIndex + 1}`,
            },
            `${params.rowIndex + 1}`,
          ),
        ],
      )
    : createVNode("div", {}, [
        createVNode(
          "span",
          {
            title: `${params.rowIndex + 1}`,
          },
          `${params.rowIndex + 1}`,
        ),
      ]);

  const container = document.createElement("div");
  render(vnode, container);
  return container.firstChild;
};
const rowClicked = (params) => {
  if (params.node.expanded) {
    params.node.setExpanded(false);
  } else {
    params.node.setExpanded(true);
  }
  columns.value.push({});
  columns.value.pop();
};
const onBodyScrollEnd = () => {
  // console.log(event, "event");
};

const onRowClicked = (params) => {
  if (
    props.showSelectionColumn &&
    params?.event?.target?.closest?.(".ag-selection-checkbox")
  ) {
    return;
  }
  props.rowClick(params);
};

const tableHeight = computed(() => {
  return props.height;
});
const hasFilter = ref(false);
const filterBrushfn = () => {
  gridApi.value.setFilterModel(null);
};

// 向父级暴露数据，setup语法糖默认关闭，父组件获取不到组件实例
defineExpose({
  getRowList,
  getRowNode,
  init,
  stopEditing,
  refreshCellsfn,
});
</script>

<template>
  <div class="grid-table-wrapper">
    <div
      class="filter-brush"
      v-show="hasFilter"
      @click="filterBrushfn"
    >
      <i
        class="bx bx-brush-alt"
        style="font-size: 16px"
      ></i>
    </div>
    <AgGridVue
      :style="'width:100%;height:' + tableHeight + 'px'"
      class="ag-theme-alpine"
      :class="activeClass.join(' ')"
      :columnDefs="columns"
      :rowData="gridData"
      :rowSelection="rowSelection"
      @grid-ready="onGridReady"
      :rowDeselection="true"
      :enableRangeSelection="true"
      :suppressCopyRowsToClipboard="true"
      @bodyScrollEnd="onBodyScrollEnd"
      :statusBar="props.statusBar"
      :gridOptions="props.gridOptions"
      :getContextMenuItems="getContextMenuItems"
      @sortChanged="refreshEvenRowsCurrencyData"
      @filterChanged="refreshEvenRowsCurrencyData"
      @rowClicked="onRowClicked"
      @rowDoubleClicked="props.rowDoubleClicked"
      animateRows
      :suppressDragLeaveHidesColumns="true"
      :suppressMakeColumnVisibleAfterUnGroup="true"
      :groupSelectsChildren="false"
      :suppressAggFuncInHeader="true"
      :rowGroupPanelShow="props.autoGroupColumnDef ? 'always' : false"
      :autoGroupColumnDef="autoGroupColumnDef"
      :groupDefaultExpanded="props.autoGroupColumnDef ? -1 : 0"
      :groupAllowUnbalanced="true"
      :masterDetail="props.masterDetail"
      :localeText="localeText"
      :rowHeight="props.rowHeight"
      @column-moved="onColumnMoved"
      @column-resized="onColumnResized"
      :suppressColumnVirtualisation="true"
      :pinnedBottomRowData="pinnedBottomRowData"
      :detailCellRendererParams="props.detailCellRendererParams"
      :detailRowHeight="250"
      v-loading="isLoading"
      element-loading-text="请等待"
    >
    </AgGridVue>
  </div>
</template>

<style scoped lang="scss">
.ag-theme-alpine {
  margin-bottom: 10px;
  --ag-borders: none;
  :deep(.ag-status-bar) {
    height: 38px;
  }
}
.zebra {
  margin-bottom: 10px;
  --ag-odd-row-background-color: #eff2f7;
}
.Borderline {
  --ag-borders: solid 1px;
}
:deep(.rotateClass) {
  transform: rotate(90deg);
  transition: transform 5s ease-in-out;
}
:deep(.ag-menu-list) {
  background-color: #fff;
}
:deep(.ag-menu-option):hover {
  background-color: #f5f7fa;
  .ag-menu-option-text {
    color: #556ee6;
  }
}
.grid-table-wrapper {
  position: relative;
}
.filter-brush {
  position: absolute;
  top: 15px;
  z-index: 2;
  left: -4px;
  color: red;
  cursor: pointer;
}
</style>
<style>
.ag-floating-bottom {
  .ag-row-even {
    background-color: #eff2f7;
  }
}
</style>
