<script>
import ManagementTitle from "@/components/widgets/management-title";
import ColumnChart from "@/components/common/charts/columns/index.vue";
import ColumnStackChart from "@/components/common/charts/columns-stack/index.vue";
import ColumnGroupChart from "@/components/common/charts/columns-group/index.vue";
import LineGroupChart from "@/components/common/charts/line-grouped/index.vue";
import PieChart from "@/components/common/charts/pie/index.vue";
import RingChart from "@/components/common/charts/ring/index.vue";
import Table from "@/components/common/charts/table/index.vue";
import ColumnLineChart from "@/components/common/charts/columns-line/index.vue";
import TableMult from "@/components/common/charts/table-mult/index.vue";
import TablePartner from "@/components/common/charts/table-partner/index.vue";
import TableScrollload from "@/components/common/charts/table-scrolload/index.vue";
import LoadingOverlay from "@/components/common/loading";
import Insight from "@/components/widgets/components/config/insight/index.vue";
// import ChartFilers from "@/components/widgets/components/config/chartFilers/index.vue";

import { getChartData, queryFilter } from "@/api/dashboard";
import { ArrowRight } from "@element-plus/icons-vue";
import { ExportExcel, unique } from "@/utils";
import { throttle } from "lodash";
import { workbenchComputed } from "@/state/helpers";
import { queryCustomerNameId } from "@/api/caseList";
import dayjs from "dayjs";
import { checkIsPc } from "@/utils"

export default {
  name: "ConfigContainer",
  props: {
    defaultPanelId: {
      charts: Number,
    },
    isEnlarge: {
      type: Boolean,
      default: false,
    },
    close: {
      type: Function,
    },
    onlyShowModal: {
      type: Boolean,
      default: false,
    },
    chartTitle: {
      type: String,
      default: "",
    },
    groupName: {
      type: String,
      default: "经营状况",
    },
    chartDesc: {
      type: String,
      default: "",
    },
  },
  components: {
    ColumnChart,
    ColumnLineChart,
    ColumnStackChart,
    ColumnGroupChart,
    LineGroupChart,
    PieChart,
    RingChart,
    ManagementTitle,
    Table,
    TableMult,
    TablePartner,
    TableScrollload,
    LoadingOverlay,
    Insight,
    // ChartFilers,
  },
  data() {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
      { length: currentYear - 2000 + 1 },
      (_, i) => currentYear - i
    );
    const isPc = checkIsPc()
    return {
      isPc,
      ArrowRightIcon: ArrowRight,
      showConfig: false,
      enlarge: false,
      chartData: [],
      insightLargeShow: false,
      drillVisible: false,
      breadcrumbList: [],
      drillName: "",
      chartstype: "",
      tableCol: [],
      drillPanels: [],
      panelId: this.defaultPanelId,
      loading: false,
      headers: [],
      dimensionType: "string",
      dimensionItem: undefined,
      insightVisible: false,
      caseTotalTrendList: [
        {
          label: "申请方向",
          value: 203,
        },
        {
          label: "各业务领域",
          value: 202,
        },
        {
          label: "申请人国籍",
          value: 201,
        },
      ],
      personnelStructureList: [
        {
          label: "学历",
          value: 908,
        },
        {
          label: "性别",
          value: 907,
        },
        {
          label: "年龄",
          value: 909,
        },
      ],
      custBycaseList: [
        {
          label: "账单收入",
          value: 318,
        },
        {
          label: "案量",
          value: 319,
        },
      ],
      queryModuleData: {}, //筛选
      defaultqueryModuleData: {},
      filterList: [],
      dateFilter: "",
      customDate: "",
      customDateRange: [],
      thisYear: [
        dayjs().startOf("year").format("YYYY-MM-DD"),
        dayjs().format("YYYY-MM-DD"),
      ],
      thisHalfYear: [
        dayjs().subtract(6, "month").format("YYYY-MM-DD"),
        dayjs().format("YYYY-MM-DD"),
      ],
      thisMonth: [
        dayjs().startOf("month").format("YYYY-MM-DD"),
        dayjs().endOf("month").format("YYYY-MM-DD"),
      ],
      nextStrillItem: undefined,
      allChartsData: [],
      hasFinanceAudit: true,
      hasAdjustStatus: true,
      defaultDrillPanels: [],
      tableShow: false,
      seriesName: undefined,
      nextStrillchildProperty: undefined,
      previousFilters: [], // 前几个钻取的Item属性
      previousYFilters: [], // 前几个钻取的Y属性
      customOptions: [],
      queryList: [], //存储筛选条件
      selectValue: 3,
      yearOptions, // 年份选项
      customYears: [yearOptions[0], yearOptions[1], yearOptions[2]], //对比年份
      hasYearCompare: false, //是否有年份对比筛选
      pageNo: 1,
      pageSize: 100,
      showDateRangeDesc: true,
      collectFilters: false,
      showFilterPopover: false,
      resizeObserver: null, // 新增
    };
  },
  computed: {
    ...workbenchComputed,
    chartEmpty() {
      const isGroupEmptyFunc = () => {
        if (this.chartstype === "table-mult") {
          return false;
        }
        let isGroupEmpty = false;

        if (this.chartData) {
          for (let index = 0; index < this.chartData.length; index++) {
            if (
              this.chartData[index].datas &&
              this.chartData[index].datas.length > 0
            ) {
              isGroupEmpty = false;
              break;
            } else {
              isGroupEmpty = true;
            }
          }
        }
        return isGroupEmpty;
      };
      return !this.chartData || !this.chartData?.length || isGroupEmptyFunc();
    },
    customLabel() {
      return `自定义(${this.customYears.length})`;
    },
    isnotPc() {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    },
  },
  watch: {
    enlarge: {
      handler(newValue) {
        if (newValue) {
          const pageContent = document.querySelector(".page-content");
          pageContent.style.overflow = "hidden";
          // 获取滚动条的位置
          const scrollTopPosition = pageContent.scrollTop;
          setTimeout(() => {
            const enlargeDialogModal = document.querySelector(
              ".enlarge-dialog-modal"
            );
            // 设置元素的 inset 属性，低版本浏览器无 inset 时回退为 top/right/bottom/left
            if (enlargeDialogModal && enlargeDialogModal.style) {
              if ('inset' in enlargeDialogModal.style) {
                enlargeDialogModal.style.setProperty(
                  'inset',
                  `${scrollTopPosition}px 0 0 0`
                );
              } else {
                enlargeDialogModal.style.top = `${scrollTopPosition}px`;
                enlargeDialogModal.style.right = '0';
                enlargeDialogModal.style.bottom = '0';
                enlargeDialogModal.style.left = '0';
              }
            }
          }, 0);
        } else {
          const pageContent = document.querySelector(".page-content");
          pageContent.style.overflow = "auto";
        }
      },
    },
    toExamineValue() {
      if (this.hasFinanceAudit) {
        this.changeFilter();
      }
    },
    statusValue() {
      if (this.hasAdjustStatus) {
        this.changeFilter();
      }
    },
    hasFinanceAudit(newvalue) {
      if (this.enlarge) {
        this.$store.dispatch("workbench/updateHasFinanceAuditOnTop", newvalue);
      }
    },
    hasAdjustStatus(newvalue) {
      if (this.enlarge) {
        this.$store.dispatch("workbench/updateHasAdjustStatusOnTop", newvalue);
      }
    },
  },
  methods: {
    ExportExcel,
    tableChange() {
      this.tableShow = !this.tableShow;
    },
    quickOptions(yearNum) {
      const years = yearNum.split(",").map(Number); // 将字符串转换为数字数组
      const options = [];

      // 检查是否包含1（本年对比）
      if (years.includes(1)) {
        options.push({ label: "本年", value: 1 });
      }

      // 检查其他年份（2,3,4等）
      for (let i = 2; i <= Math.max(...years); i++) {
        if (years.includes(i)) {
          options.push({ label: `近${i}年对比`, value: i });
        }
      }

      return options;
    },
    // 添加处理date-range-desc显示逻辑的方法
    handleDateRangeDescDisplay() {
      this.collectFilters = false;
      this.showDateRangeDesc = true;
      this.$nextTick(() => {
        // 使用ref引用获取DOM元素
        const chartsTopLeft = this.$refs.chartsTopLeft;
        const dateRangeDesc = this.$refs.dateRangeDesc;
        const chartsTitle = this.$refs.chartsTitle;
        const helpIcon = this.$refs.helpIcon;

        // 确保所有需要的元素都存在
        if (!chartsTopLeft || !chartsTitle) return;

        // 计算各元素的宽度
        const containerWidth = chartsTopLeft.offsetWidth;
        const titleWidth = chartsTitle.offsetWidth;
        const iconWidth = helpIcon ? helpIcon.offsetWidth : 0;
        const dateDescWidth = dateRangeDesc?.scrollWidth || 0; // 使用scrollWidth获取实际内容宽度
        // 计算剩余空间
        const spacing = 24; // 元素间间距估计值
        const availableWidth =
          containerWidth - titleWidth - iconWidth - spacing;
          // console.log(availableWidth,'availableWidth');
        this.collectFilters = availableWidth <= 0
        // 根据可用空间决定是否显示date-range-desc
        if(dateDescWidth){
          this.showDateRangeDesc = availableWidth >= dateDescWidth;
        }
      });
    },

    changeCustomyear(val, property) {
      // 只有在不是selectValue驱动时才置空
      if (
        this.selectValue &&
        !(
          (this.selectValue === 1 &&
            val.length === 1 &&
            val[0] === this.yearOptions[0]) ||
          (this.selectValue === 2 &&
            val.length === 2 &&
            val[0] === this.yearOptions[0] &&
            val[1] === this.yearOptions[1]) ||
          (this.selectValue === 3 &&
            val.length === 3 &&
            val[0] === this.yearOptions[0] &&
            val[1] === this.yearOptions[1] &&
            val[2] === this.yearOptions[2]) ||
          (this.selectValue === 5 &&
            val.length === 5 &&
            val[0] === this.yearOptions[0] &&
            val[1] === this.yearOptions[1] &&
            val[2] === this.yearOptions[2] &&
            val[3] === this.yearOptions[3] &&
            val[4] === this.yearOptions[4])
        )
      ) {
        this.selectValue = "";
      }
      // 新增逻辑：当selectValue为空且customYears长度为0时，自动选择本年对比
      if (!this.selectValue && val.length === 0) {
        // this.selectValue = this.quickOptions[0];
        this.customYears = [this.yearOptions[0]];
      }
      this.queryModuleData[property] = this.customYears;
      this.fetchData();
    },
    //只更改状态 不搜索
    changeCustomyearNoSearch(val, property) {
      if (
        this.selectValue &&
        !(
          (this.selectValue === 1 &&
            val.length === 1 &&
            val[0] === this.yearOptions[0]) ||
          (this.selectValue === 2 &&
            val.length === 2 &&
            val[0] === this.yearOptions[0] &&
            val[1] === this.yearOptions[1]) ||
          (this.selectValue === 3 &&
            val.length === 3 &&
            val[0] === this.yearOptions[0] &&
            val[1] === this.yearOptions[1] &&
            val[2] === this.yearOptions[2])
        )
      ) {
        this.selectValue = "";
      }
      // 新增逻辑：当selectValue为空且customYears长度为0时，自动选择本年对比
      if (!this.selectValue && val.length === 0) {
        this.selectValue = 1;
        this.customYears = [this.yearOptions[0]];
      }
      this.queryModuleData[property] = this.customYears;
    },
    changeQuickCustomyear(val, property) {
      this.formatCustomyear(val, property);
      this.fetchData();
    },
    formatCustomyear(val, property) {
      if (val === 1) {
        this.customYears = [this.yearOptions[0]];
      } else if (val === 2) {
        this.customYears = [this.yearOptions[0], this.yearOptions[1]];
      } else if (val === 3) {
        this.customYears = [
          this.yearOptions[0],
          this.yearOptions[1],
          this.yearOptions[2],
        ];
      } else if (val === 5) {
        this.customYears = [
          this.yearOptions[0],
          this.yearOptions[1],
          this.yearOptions[2],
          this.yearOptions[3],
          this.yearOptions[4],
        ];
      }
      this.queryModuleData[property] = this.customYears;
    },
    customerRemoteMethod(value) {
      if (!value) {
        return false;
      }
      const data = {
        pageNo: 1,
        pageSize: 100,
        isCustomer: 1,
        keyword: value,
      };
      queryCustomerNameId(data).then((res) => {
        const list = unique(
          [
            ...new Set([
              ...res.data.map((item) => ({
                id: item.custId,
                name: item.name,
              })),
            ]),
          ],
          "id"
        );
        this.customOptions = list;
      });
    },
    //恢复图表
    resetChart() {
      this.breadcrumbList = [];
      this.panelId = this.defaultPanelId;
      this.drillName = undefined;
      this.dimensionItem = undefined;
      this.nextStrillchildProperty = undefined;
      this.seriesName = undefined;
      this.tableShow = false;
      this.queryModuleData = {};
      this.previousFilters = [];
      this.previousYFilters = [];
      this.fetchFilters();
    },
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popper__arrow",
          "el-select__popper",
          "el-select-dropdown__list",
          "el-select-dropdown__item",
          "el-select-dropdown__footer",
          "el-scrollbar__view",
          "el-popper", // 日期选择器
          "is-pure",
          "el-picker__popper",
          "el-picker-panel__content",
          "el-date-range-picker__content",
          "el-date-table-cell",
          "el-date-table-cell__text",
          "loading-overlay",
        ];
        let isLeave = true;
        // console.log(
        //   event.relatedTarget.classList,
        //   "event.relatedTarget.classList"
        // );
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
        if (event.relatedTarget.classList.length == 0) {
          isLeave = false;
        }
        if (isLeave) {
          this.$nextTick(() => {
            this.$refs.selectRef?.forEach((select) => {
              select?.blur();
            });
            this.$refs.dateFilterRef?.forEach((select) => {
              select?.blur();
            });
            this.$refs.datePickerRef?.forEach((select) => {
              select?.blur();
            });
            this.$refs.custSelectRef?.forEach((select) => {
              select?.blur();
            });
            if (this.$refs?.personnelStructureRef) {
              this.$refs.personnelStructureRef?.blur();
            }
            if (this.$refs.caseTotalTrendRef) {
              this.$refs.caseTotalTrendRef?.blur();
            }
            if (this.$refs.descPopoverRef) {
              this.$refs.descPopoverRef.hide();
            }
            if (this.$refs.filterIconRef) {
              this.$refs.filterIconRef.hide();
            }
            setTimeout(() => {
              this.showConfig = this.enlarge;
            }, 100);
          });
        }
      } else {
        this.showConfig = true;
      }
    },
    handleMouseEnter() {
      if (this.isnotPc) {
        return;
      }
      this.showConfig = true;
      this.handleDateRangeDescDisplay();
    },
    changePanel(value) {
      this.panelId = value;
      this.fetchData();
    },
    enlargeChart() {
      this.enlarge = true;
      this.$store.dispatch(
        "workbench/updateHasFinanceAuditOnTop",
        this.hasFinanceAudit
      );
      this.$store.dispatch(
        "workbench/updateHasAdjustStatusOnTop",
        this.hasAdjustStatus
      );
    },
    closeChart() {
      this.enlarge = false;
      this.showConfig = false;
      this.$store.dispatch("workbench/updateHasFinanceAuditOnTop", true);
      this.$store.dispatch("workbench/updateHasAdjustStatusOnTop", true);
      if (this.close !== undefined) {
        this.close();
      }
    },
    insightModalHandle() {
      this.insightVisible = true;
    },
    exportChart() {
      if (this.allChartsData.chartDatas) {
        let tableHeader = [];
        let tableData = [];
        let colNameArr = this.allChartsData.colName
          ? this.allChartsData?.colName?.split("#")
          : [];
        let dataKey = [];
        // 针对不同数据格式进行处理
        if (
          this.allChartsData.panelType == "bar-grouped" ||
          this.allChartsData.panelType == "bar-stacked" ||
          this.allChartsData.panelType == "line-grouped"
        ) {
          dataKey = Object.keys(this.allChartsData.chartDatas[0].datas[0]);
          const column = ["legend"].concat(dataKey);
          column.map((item, index) => {
            tableHeader.push({
              key: item,
              title: colNameArr[index],
            });
          });
          this.allChartsData.chartDatas.forEach((item) => {
            const legend = { legend: item.legend };
            item.datas.forEach((itm) => {
              tableData.push(
                JSON.parse(JSON.stringify(Object.assign(legend, itm)))
              );
            });
          });
        } else if (
          this.allChartsData.panelType == "table-mult" ||
          this.allChartsData.panelType == "ag-grid-mult"
        ) {
          this.allChartsData.headers.map((item) => {
            tableHeader.push({
              key: item.field,
              title: item.name,
            });
          });
          tableData = this.chartData;
        } else {
          dataKey = Object.keys(this.allChartsData.chartDatas[0].datas[0]);
          dataKey.map((item, index) => {
            tableHeader.push({
              key: item,
              title: colNameArr[index],
            });
          });
          tableData = this.allChartsData.chartDatas[0].datas;
        }
        this.ExportExcel(
          tableHeader,
          tableData,
          this.allChartsData.panelName + ".xlsx"
        );
      }
    },
    async setDrillType() {
      if (this.dimensionItem == "belongToDate") {
        this.dimensionType = "date";
      } else {
        this.dimensionType = "string";
      }
      await queryFilter({ panelId: this.panelId, isSeniorPanel: 1 }).then(
        (res) => {
          // const type =
          //   res.data.find((item) => item.property == this.dimensionItem)
          //     ?.filterType || "string";
          // if (["recentYear", "specialScope"].includes(type)) {
          //   this.dimensionType = "date";
          // } else {
          //   this.dimensionType = "string";
          // }
          // const nextFilterList = [];
          // res.data.forEach((item) => {
          //   if (this.filterList.find((i) => i.property == item.property)) {
          //     nextFilterList.push(item);
          //   }
          // });
          this.filterList = res.data;
          //审核、调整状态
          this.hasFinanceAudit = res.data.some(
            (obj) => obj.property === "financeAudit"
          );
          this.hasAdjustStatus = res.data.some(
            (obj) => obj.property === "adjustStatus"
          );
          // this.filterList = nextFilterList;

          //特殊处理时间对比选择器
          res.data.forEach((item) => {
            if (item.filterType === "recentYearCustom") {
              const selectedYear = this.seriesName || this.drillName;
              if (!isNaN(Number(selectedYear))) {
                // 是一个数字（年份）
                this.customYears = [Number(selectedYear)];
                this.changeCustomyearNoSearch(
                  Number(selectedYear),
                  item.property
                );
              }
            }
          });
          //是否有年份对比筛选
          this.hasYearCompare = res.data.some(
            (obj) => obj.filterType === "recentYearCustom"
          );
        }
      );
    },
    insightHandle() {
      this.insightLargeShow = true;
    },
    formatYear(value) {
      return [`${value}-01-01`, `${value}-12-31`];
    },
    fetchData() {
      this.showDateRangeDesc = true;
      this.collectFilters = false;
      this.loading = true;
      let params = {
        panelId: this.panelId,
        isSeniorPanel: 1,
        ...this.queryModuleData,
      };
      if (this.panelId == 4123) {
        params = { ...params, pageNo: 1, pageSize: this.pageSize };
      }
      if (this.drillName && this.dimensionItem) {
        params[this.dimensionItem] =
          this.dimensionType == "date"
            ? this.formatYear(this.drillName)
            : this.drillName;
      }
      //添加钻取条件
      if (this.previousFilters.length) {
        this.previousFilters.forEach((item) => {
          params = { ...params, ...item };
        });
      }
      if (this.previousYFilters.length) {
        this.previousYFilters.forEach((item) => {
          params = { ...params, ...item };
        });
        delete params["perPanelId"];
      }
      // 在下钻时（this.seriesName有值）将PropertyY属性添加在搜索条件中，
      // 特殊项格式化（取消）
      if (this.nextStrillchildProperty && this.seriesName) {
        params[this.nextStrillchildProperty] = this.seriesName;
      }
      if (this.hasFinanceAudit) {
        params.financeAudit = this.toExamineValue;
      }
      if (this.hasAdjustStatus) {
        params.adjustStatus = this.statusValue;
      }
      // 清除 key 为 undefined 的属性
      Object.keys(params).forEach((key) => {
        if (key == "undefined") {
          delete params[key];
        }
      });

      getChartData(params)
        .then((res) => {
          this.loading = false;
          //重置下钻seriesName属性
          this.seriesName = undefined;

          if (!res.data || Object.keys(res.data).length === 0) {
            this.chartData = [];
            return false;
          }
          this.allChartsData = res.data;
          //是否显示日期范围描述
          if ((this.showConfig || this.isnotPc) && !this.enlarge) {
            this.handleDateRangeDescDisplay();
          }
          this.nextStrillItem = res.data?.dimensionItem || undefined;
          this.nextStrillchildProperty = res.data?.childPropertyY || undefined;
          this.chartData = res.data?.chartDatas || [];
          this.chartstype = res.data?.panelType || undefined;
          // this.chartTitle = res.data?.panelName || undefined;
          // this.drillPanels = res.data.drillPanels.slice(0, 1) || [];
          this.drillPanels = res.data?.drillPanels || [];
          this.defaultDrillPanels = res.data?.drillPanels || [];
          if (this.chartstype !== "table-mult") {
            const list = res.data?.colName?.split("#") || [];
            let dataKeys = Object.keys(res.data?.chartDatas[0]?.datas[0] || []);
            if (
              this.chartstype === "bar-grouped" ||
              this.chartstype === "bar-stacked" ||
              this.chartstype === "line-grouped"
            ) {
              dataKeys = ["legend"].concat(dataKeys);
            }
            const cols = [];
            dataKeys.forEach((item, index) => {
              cols.push({
                title: list[index],
                value: item,
              });
            });
            this.tableCol = cols;
          }

          if (res.data?.panelType === "table-mult") {
            this.headers = res.data?.headers || [];
          }
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    loadMoreData() {
      this.pageNo++;
      this.loading = true;
      const params = {
        panelId: this.panelId,
        isSeniorPanel: 1,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        ...this.queryModuleData,
      };
      if (this.drillName && this.dimensionItem) {
        params[this.dimensionItem] =
          this.dimensionType == "date"
            ? this.formatYear(this.drillName)
            : this.drillName;
      }
      // 清除 key 为 undefined 的属性
      Object.keys(params).forEach((key) => {
        if (key == "undefined") {
          delete params[key];
        }
      });
      getChartData(params)
        .then((res) => {
          this.loading = false;
          this.chartData = this.chartData.concat(res.data.chartDatas);
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    drillHandle(params) {
      if (this.insightVisible) {
        return false;
      }
      if (!this.drillPanels || !this.drillPanels.length) {
        return false;
      } else {
        this.drillName = params.name;
        this.seriesName = this.nextStrillchildProperty
          ? params.seriesName
          : undefined;
        if (this.panelId == 605) {
          this.drillPanels = this.defaultDrillPanels.filter((item) =>
            item.panelName?.includes(params.name)
          );
        }
        if (this.drillPanels.length > 1) {
          this.drillVisible = true;
        } else {
          this.startDrill(this.drillPanels[0]);
        }
      }
    },
    //特别注意下钻参数和筛选参数不能相同，否则会出现逻辑错误
    startDrill(values) {
      if (this.panelId == values.panelId) {
        return false;
      }
      this.panelId = values.panelId;
      this.dimensionItem = this.nextStrillItem;
      const list = JSON.parse(JSON.stringify(this.queryModuleData));
      //保存筛选参数
      this.queryList.push({
        panelId: values.panelId,
        querys: list,
        customDate: this.customDate,
        customDateRange: this.customDateRange,
        dateFilter: this.dateFilter,
        selectValue: this.selectValue,
        customYears: this.customYears,
      });
      this.setDrillType().then(() => {
        this.breadcrumbList.push({
          name: this.drillName,
          seriesName: this.seriesName,
          dimension: values.panelName,
          dimensionItem: this.dimensionItem,
          panelId: values.panelId,
          [this.dimensionItem]:
            this.dimensionType == "date"
              ? this.formatYear(this.drillName)
              : this.drillName,
        });
        //保存钻取条件
        this.previousFilters.push({
          [this.dimensionItem]:
            this.dimensionType == "date" //放在setDrillType里面
              ? this.formatYear(this.drillName)
              : this.drillName,
        });
        const noYpanelIds = [
          4011, 4016, 4091, 4095, 4098, 4103, 4104, 4106, 4107, 4108,
        ];
        if (!noYpanelIds.includes(values.panelId)) {
          if (this.nextStrillchildProperty && this.seriesName) {
            this.breadcrumbList.forEach((item) => {
              if (item.panelId == values.panelId) {
                item[this.nextStrillchildProperty] = this.seriesName;
              }
            });
            //把Y属性数组存起来
            this.previousYFilters.push({
              [this.nextStrillchildProperty]: this.seriesName,
              perPanelId: values.panelId,
            });
          }
        }
        this.fetchData();
        this.drillVisible = false;
      });
    },
    // backToStart() {
    //   this.breadcrumbList = [];
    //   this.panelId = this.defaultPanelId;
    //   this.dimensionItem = undefined;
    //   this.drillName = undefined;
    //   this.nextStrillchildProperty = undefined;
    //   this.seriesName = undefined;
    //   this.previousFilters = [];
    //   this.previousYFilters = [];
    //   const params = {
    //     panelId: this.panelId,
    //     isSeniorPanel: 1,
    //   };
    //   queryFilter(params).then((res) => {
    //     this.filterList = res.data;
    //     this.fetchData();
    //   });
    // },
    delDrill(item) {
      this.pageNo = 1;
      this.breadcrumbList = this.breadcrumbList.filter(
        (i) => i.panelId !== item.panelId
      );
      this.previousFilters.pop();
      this.previousYFilters = this.previousYFilters.filter(
        (i) => i.perPanelId !== item.panelId
      );
      if (this.breadcrumbList && this.breadcrumbList.length > 0) {
        this.panelId =
          this.breadcrumbList[this.breadcrumbList.length - 1].panelId;
        this.drillName =
          this.breadcrumbList[this.breadcrumbList.length - 1].name;
        this.dimensionItem =
          this.breadcrumbList[this.breadcrumbList.length - 1].dimensionItem;
        //给上一级的筛选条件赋值
      } else {
        this.panelId = this.defaultPanelId;
        this.dimensionItem = undefined;
        this.drillName = undefined;
        this.nextStrillchildProperty = undefined;
        this.seriesName = undefined;
        this.previousFilters = [];
        this.previousYFilters = [];
      }
      //设置筛选项
      this.queryModuleData = this.queryList[this.queryList.length - 1].querys;
      //两个特殊的筛选项赋值
      this.customDate = this.queryList[this.queryList.length - 1].customDate;
      this.customDateRange =
        this.queryList[this.queryList.length - 1].customDateRange;
      this.dateFilter = this.queryList[this.queryList.length - 1].dateFilter;
      //自定义年份筛选
      this.selectValue = this.queryList[this.queryList.length - 1].selectValue;
      this.customYears = this.queryList[this.queryList.length - 1].customYears;

      this.queryList.pop();
      const params = {
        panelId: this.panelId,
        isSeniorPanel: 1,
      };
      queryFilter(params).then((res) => {
        this.filterList = res.data;
        // const newQueryModuleData = {};
        // res.data.forEach((item)=>{
        //     Object.keys(this.queryModuleData).forEach((key) => {
        //       if (item.property == key) {
        //         newQueryModuleData[key] = this.queryModuleData[key];
        //       }
        //     });
        // })
        // this.queryModuleData = newQueryModuleData;
        //审核、调整状态
        this.hasFinanceAudit = res.data.some(
          (obj) => obj.property === "financeAudit"
        );
        this.hasAdjustStatus = res.data.some(
          (obj) => obj.property === "adjustStatus"
        );
        //是否有年份对比筛选
        this.hasYearCompare = res.data.some(
          (obj) => obj.filterType === "recentYearCustom"
        );
        this.fetchData();
      });
    },

    //筛选
    fetchFilters() {
      const params = {
        panelId: this.panelId,
        isSeniorPanel: 1,
      };
      queryFilter(params).then((res) => {
        this.filterList = res.data;
        res.data.forEach((item) => {
          if (item.filterType == "specialScope") {
            this.specialScopeFormatDate(item.defaultFilter, item.property);
            this.dateFilter = Number(item.defaultFilter);
          } else if (item.filterType == "recentYear") {
            this.recentYearFormatDate(item.defaultFilter, item.property);
            this.dateFilter = Number(item.defaultFilter);
          } else if (item.filterType == "recentYearCustom") {
            this.formatCustomyear(Number(item.defaultFilter), item.property);
            this.selectValue = Number(item.defaultFilter);
          } else {
            if (item.defaultFilter) {
              this.queryModuleData[item.property] = item.defaultFilter;
              this.defaultqueryModuleData[item.property] = item.defaultFilter;
            }
          }
        });

        //审核、调整状态
        this.hasFinanceAudit = res.data.some(
          (obj) => obj.property === "financeAudit"
        );
        this.hasAdjustStatus = res.data.some(
          (obj) => obj.property === "adjustStatus"
        );
        //是否有年份对比筛选
        this.hasYearCompare = res.data.some(
          (obj) => obj.filterType === "recentYearCustom"
        );
        this.fetchData();
      });
    },
    changeFilter() {
      //   this.$emit("fetchData", this.queryModuleData);
      this.fetchData();
    },

    // 获取本季开始日期和结束日期
    getQuarter() {
      const now = dayjs();
      // 获取当前月份
      const currentMonth = now.month();

      // 计算当前季度的起始月份和结束月份
      let startMonth, endMonth;
      if (currentMonth < 3) {
        startMonth = 0; // 1月
        endMonth = 2; // 3月
      } else if (currentMonth < 6) {
        startMonth = 3; // 4月
        endMonth = 5; // 6月
      } else if (currentMonth < 9) {
        startMonth = 6; // 7月
        endMonth = 8; // 9月
      } else {
        startMonth = 9; // 10月
        endMonth = 11; // 12月
      }
      // 获取当前季度的起始日期和结束日期
      const quarterStart = dayjs().month(startMonth).startOf("month");
      const quarterEnd = dayjs().month(endMonth).endOf("month");

      const formattedStart = quarterStart.format("YYYY-MM-DD");
      const formattedEnd = quarterEnd.format("YYYY-MM-DD");
      return [formattedStart, formattedEnd];
    },
    specialScopeFormatDate(value, property) {
      if (value == 1) {
        this.queryModuleData[property] = this.thisMonth;
      } else if (value == 2) {
        this.queryModuleData[property] = this.getQuarter();
      } else if (value == 3) {
        this.queryModuleData[property] = this.thisYear;
      } else if (value == 4) {
        this.queryModuleData[property] = this.thisHalfYear;
      } else if (value > 1979) {
        this.queryModuleData[property] = [
          dayjs(value + "-01-01").format("YYYY-MM-DD"),
          dayjs(value + "-12-31").format("YYYY-MM-DD"),
        ];
      }
    },
    recentYearFormatDate(value, property) {
      const currentYear = dayjs().year();
      const currentDay = dayjs().format("YYYY-MM-DD");
      // console.log([
      //   `${currentYear - (value - 1)}-01-01`,
      //   currentDay,
      // ],'currentYear-currentDay')
      this.queryModuleData[property] = [
        `${currentYear - (value - 1)}-01-01`,
        currentDay,
      ];
    },
    changeDate(value, type, property) {
      if (type == "specialScope") {
        this.specialScopeFormatDate(value, property);
      } else if (type == "recentYear") {
        this.recentYearFormatDate(value, property);
      }
      //   this.$emit("fetchData", this.queryModuleData);
      this.fetchData();
    },
    changeCustomDate(value, property) {
      if (value && value !== "自定义时间范围") {
        const formatDate = value?.split(",");
        this.queryModuleData[property] = formatDate;
        this.fetchData();
      } else if (!value) {
        this.queryModuleData[property] = null;
        this.fetchData();
      }
    },
    changeCustomDateRange(value, property) {
      if (value) {
        this.queryModuleData[property] = value;
        this.fetchData();
      }
    },
    containerWidthChange() {
      if (this.showConfig) {
        this.handleDateRangeDescDisplay();
      }
    },
  },

  mounted() {
    if (this.onlyShowModal) {
      this.enlarge = true;
    }
    this.fetchFilters();
    this.throttledExportChart = throttle(this.exportChart, 2000);
    // 新增：监听config-container宽度变化
    this.$nextTick(() => {
      const container = this.$refs.configContainer;
      if (container) {
        this.resizeObserver = new ResizeObserver(() => {
          this.containerWidthChange();
        });
        this.resizeObserver.observe(container);
      }
    });
  },

  beforeUnmount() {
    const pageContent = document.querySelector(".page-content");
    pageContent.style.overflow = "auto";
    if (this.resizeObserver && this.$refs.configContainer) {
      this.resizeObserver.unobserve(this.$refs.configContainer);
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<template>
  <div
    class="card mb-0 w-100 h-100"
    v-if="!onlyShowModal"
  >
    <LoadingOverlay :loading="loading"></LoadingOverlay>
    <!--工作台组件-->
    <div
      class="config-container w-100 h-100 card-body"
      ref="configContainer"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="charts-top-sm">
        <div
          class="charts-top-left"
          ref="chartsTopLeft"
        >
          <span
            class="charts-title"
            ref="chartsTitle"
          >
            {{ chartTitle }}
          </span>
          <el-popover
            placement="bottom-start"
            :title="chartTitle"
            :width="350"
            trigger="hover"
            :content="chartDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i
                v-show="chartDesc && (showConfig || isnotPc)"
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer"
                ref="helpIcon"
              ></i>
            </template>
          </el-popover>
          <el-popover
            placement="bottom-start"
            :width="350"
            trigger="hover"
            :content="allChartsData.statisticalScope"
            ref="descPopoverRef"
          >
            <template #reference>
              <i
                v-show="!showDateRangeDesc && (showConfig || isnotPc) && allChartsData.statisticalScope"
                class="bx bx bx-calendar"
                style="font-size: 16px; cursor: pointer"
                ref="dateDescIcon"
              ></i>
            </template>
          </el-popover>
          <div
            v-show="showDateRangeDesc && (showConfig || isnotPc)"
            class="date-range-desc"
            ref="dateRangeDesc"
          >
            {{ allChartsData.statisticalScope || "" }}
          </div>
        </div>
        <div v-show="showConfig || isnotPc">
          <div class="config-container d-flex gap-1">
            <!-- 筛选项合并为悬浮icon -->
            <template v-if="collectFilters">
              <el-popover 
                placement="bottom"
                width="auto"
                trigger="click"
                ref="filterIconRef"
                :teleported="false"
                :persistent="true"
              >
                <template #reference>
                  
                  <div class="config-item">
                    <el-tooltip
                    effect="dark"
                    content="筛选"
                    placement="top"
                  >
                    <i class="mdi mdi-filter-outline item-icon" style="font-size: 20px; cursor: pointer" ref="filterIcon"></i>
                  </el-tooltip>
                 
                  </div>
                </template>
                <div class="filters gap-2 d-flex" style="padding: 8px 0; min-width: 220px">
                  <div class="extra-filter">
                    <el-select
                      v-if="panelId == 201 || panelId == 202 || panelId == 203"
                      v-model="panelId"
                      size="small"
                      style="width: 100px"
                      @change="changePanel"
                      ref="caseTotalTrendRef"
                      @mousedown.stop
                    >
                      <el-option
                        v-for="item in caseTotalTrendList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <el-select
                      v-if="panelId == 907 || panelId == 908 || panelId == 909"
                      v-model="panelId"
                      size="small"
                      style="width: 60px"
                      @change="changePanel"
                      ref="personnelStructureRef"
                      @mousedown.stop
                    >
                      <el-option
                        v-for="item in personnelStructureList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <el-select
                      v-if="panelId == 318 || panelId == 319"
                      v-model="panelId"
                      size="small"
                      style="width: 90px"
                      @change="changePanel"
                      ref="caseTotalTrendRef"
                      @mousedown.stop
                    >
                      <el-option
                        v-for="item in custBycaseList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                  <div class="filter-wrapper">
                    <template v-for="item in filterList" :key="item.filterId">
                      <!-- 这里复制原filters下的所有筛选控件 -->
                      <el-select
                        v-if="item.filterType === 'select'"
                        v-model="queryModuleData[item.property]"
                        size="small"
                        style="width: 90px"
                        @change="changeFilter"
                        ref="selectRef"
                        :offset="8"
                        @mousedown.stop
                      >
                        <el-option
                          v-for="itm in item.values"
                          :key="itm.id"
                          :label="itm.value"
                          :value="itm.id"
                        />
                      </el-select>
                      <el-select
                        v-if="item.filterType === 'specialScope' || item.filterType === 'recentYear'"
                        v-model="dateFilter"
                        size="small"
                        ref="dateFilterRef"
                        style="width: 80px"
                        :offset="8"
                        @change="(value) => changeDate(value, item.filterType, item.property)"
                        @mousedown.stop
                      >
                        <el-option
                          v-for="itm in item.values"
                          :key="itm.id"
                          :label="itm.value"
                          :value="itm.id"
                        />
                      </el-select>
                      <el-select
                        v-if="item.filterType === 'selectMany' && item.property == 'custId'"
                        v-model="queryModuleData[item.property]"
                        remote
                        clearable
                        filterable
                        size="small"
                        style="width: 100px"
                        @change="changeFilter"
                        placeholder="输入客户名称"
                        :remote-method="customerRemoteMethod"
                        class="cust-select"
                        ref="custSelectRef"
                        @mousedown.stop
                      >
                        <el-option
                          v-for="itm in customOptions"
                          :key="itm.id"
                          :label="itm.name"
                          :value="itm.id"
                        >
                        </el-option>
                      </el-select>
                      <el-cascader
                        v-if="item.filterType === 'cascader'"
                        v-model="queryModuleData[item.property]"
                        :options="item.values"
                        filterable
                        :show-all-levels="false"
                        :props="{children: 'children',label: 'label',value: 'value',expandTrigger: 'hover',}"
                        @change="changeFilter"
                        size="small"
                        clearable
                        @mousedown.stop
                      />
                      <el-select
                        v-if="item.filterType === 'customDate'"
                        v-model="customDate"
                        size="small"
                        ref="dateFilterRef"
                        style="width: 80px"
                        clearable
                        @change="(value) => changeCustomDate(value, item.property)"
                        @mousedown.stop
                      >
                        <el-option
                          v-for="itm in item.values"
                          :key="itm.id"
                          :label="itm.value"
                          :value="itm.id"
                        />
                      </el-select>
                      <el-date-picker
                        v-if="item.filterType === 'customDate' && customDate === '自定义时间范围'"
                        v-model="customDateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        size="small"
                        ref="datePickerRef"
                        @change="(value) => changeCustomDateRange(value, item.property)"
                        style="width: 220px"
                        value-format="YYYY-MM-DD"
                        popper-class="data-range-picker"
                        @mousedown.stop
                      />
                      <el-select
                        v-model="selectValue"
                        style="width: 140px"
                        ref="datePickerRef"
                        popper-class="custom-year-select"
                        :multiple="false"
                        :clearable="false"
                        :filterable="false"
                        :collapse-tags="false"
                        :collapse-tags-tooltip="false"
                        size="small"
                        :placeholder="customLabel"
                        v-if="item.filterType === 'recentYearCustom' && !item.noShow"
                        @change="(val) => changeQuickCustomyear(val, item.property)"
                        @mousedown.stop
                      >
                        <el-option
                          v-for="item in quickOptions(item.yearNum)"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                        <template #footer>
                          <div class="custom-years-title">自定义选择年份</div>
                          <div style="max-height: 160px; overflow-y: auto">
                            <el-checkbox-group
                              v-model="customYears"
                              class="custom-years-group"
                              @change="(val) => changeCustomyear(val, item.property)"
                            >
                              <el-checkbox
                                v-for="year in yearOptions"
                                :key="year"
                                :label="year"
                                :value="year"
                                :disabled="customYears.length >= 5 && !customYears.includes(year)"
                                >{{ year }}年</el-checkbox
                              >
                            </el-checkbox-group>
                          </div>
                          <div class="custom-years-tip" :class="{ limit: customYears.length >= 5 }">
                            最多选择5个年份
                          </div>
                        </template>
                      </el-select>
                    </template>
                  </div>
                </div>
              </el-popover>
            </template>
            <!-- 正常筛选项 -->
            <div class="filters gap-2 d-flex" v-else>
              <div class="extra-filter">
                <el-select
                  v-if="panelId == 201 || panelId == 202 || panelId == 203"
                  v-model="panelId"
                  size="small"
                  style="width: 100px"
                  @change="changePanel"
                  ref="caseTotalTrendRef"
                >
                  <el-option
                    v-for="item in caseTotalTrendList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-select
                  v-if="panelId == 907 || panelId == 908 || panelId == 909"
                  v-model="panelId"
                  size="small"
                  style="width: 60px"
                  @change="changePanel"
                  ref="personnelStructureRef"
                >
                  <el-option
                    v-for="item in personnelStructureList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-select
                  v-if="panelId == 318 || panelId == 319"
                  v-model="panelId"
                  size="small"
                  style="width: 90px"
                  @change="changePanel"
                  ref="caseTotalTrendRef"
                >
                  <el-option
                    v-for="item in custBycaseList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="filter-wrapper">
                <template v-for="item in filterList" :key="item.filterId">
                  <!-- 这里复制原filters下的所有筛选控件 -->
                  <el-select
                    v-if="item.filterType === 'select'"
                    v-model="queryModuleData[item.property]"
                    size="small"
                    style="width: 90px"
                    @change="changeFilter"
                    ref="selectRef"
                    :offset="8"
                  >
                    <el-option
                      v-for="itm in item.values"
                      :key="itm.id"
                      :label="itm.value"
                      :value="itm.id"
                    />
                  </el-select>
                  <el-select
                    v-if="
                      item.filterType === 'specialScope' ||
                      item.filterType === 'recentYear'
                    "
                    v-model="dateFilter"
                    size="small"
                    ref="dateFilterRef"
                    style="width: 80px"
                    :offset="8"
                    @change="
                      (value) =>
                        changeDate(value, item.filterType, item.property)
                    "
                  >
                    <el-option
                      v-for="itm in item.values"
                      :key="itm.id"
                      :label="itm.value"
                      :value="itm.id"
                    />
                  </el-select>
                  <el-select
                    v-if="
                      item.filterType === 'selectMany' &&
                      item.property == 'custId'
                    "
                    v-model="queryModuleData[item.property]"
                    remote
                    clearable
                    filterable
                    size="small"
                    style="width: 100px"
                    @change="changeFilter"
                    placeholder="输入客户名称"
                    :remote-method="customerRemoteMethod"
                    class="cust-select"
                    ref="custSelectRef"
                  >
                    <el-option
                      v-for="itm in customOptions"
                      :key="itm.id"
                      :label="itm.name"
                      :value="itm.id"
                    >
                    </el-option>
                  </el-select>
                  <el-cascader
                    v-if="item.filterType === 'cascader'"
                    v-model="queryModuleData[item.property]"
                    :options="item.values"
                    filterable
                    :show-all-levels="false"
                    :props="{
                      children: 'children',
                      label: 'label',
                      value: 'value',
                      expandTrigger: 'hover',
                    }"
                    @change="changeFilter"
                    size="small"
                    clearable
                  />
                  <el-select
                    v-if="item.filterType === 'customDate'"
                    v-model="customDate"
                    size="small"
                    ref="dateFilterRef"
                    style="width: 80px"
                    clearable
                    @change="(value) => changeCustomDate(value, item.property)"
                  >
                    <el-option
                      v-for="itm in item.values"
                      :key="itm.id"
                      :label="itm.value"
                      :value="itm.id"
                    />
                  </el-select>
                  <el-date-picker
                    v-if="
                      item.filterType === 'customDate' &&
                      customDate === '自定义时间范围'
                    "
                    v-model="customDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    size="small"
                    ref="datePickerRef"
                    @change="
                      (value) => changeCustomDateRange(value, item.property)
                    "
                    style="width: 220px"
                    value-format="YYYY-MM-DD"
                    popper-class="data-range-picker"
                  />
                  <el-select
                    v-model="selectValue"
                    style="width: 140px"
                    ref="datePickerRef"
                    popper-class="custom-year-select"
                    :multiple="false"
                    :clearable="false"
                    :filterable="false"
                    :collapse-tags="false"
                    :collapse-tags-tooltip="false"
                    size="small"
                    :placeholder="customLabel"
                    v-if="
                      item.filterType === 'recentYearCustom' && !item.noShow
                    "
                    @change="(val) => changeQuickCustomyear(val, item.property)"
                  >
                    <el-option
                      v-for="item in quickOptions(item.yearNum)"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                    <template #footer>
                      <div class="custom-years-title">自定义选择年份</div>
                      <div style="max-height: 160px; overflow-y: auto">
                        <el-checkbox-group
                          v-model="customYears"
                          class="custom-years-group"
                          @change="
                            (val) => changeCustomyear(val, item.property)
                          "
                        >
                          <el-checkbox
                            v-for="year in yearOptions"
                            :key="year"
                            :label="year"
                            :value="year"
                            :disabled="
                              customYears.length >= 5 &&
                              !customYears.includes(year)
                            "
                            >{{ year }}年</el-checkbox
                          >
                        </el-checkbox-group>
                      </div>
                      <div
                        class="custom-years-tip"
                        :class="{ limit: customYears.length >= 5 }"
                      >
                        最多选择5个年份
                      </div>
                    </template>
                  </el-select>
                </template>
              </div>
            </div>
            <div class="d-flex gap-2">
              <el-tooltip
                effect="dark"
                content="还原"
                placement="top"
              >
                <div
                  class="config-item"
                  @click="resetChart"
                >
                  <i
                    class="mdi mdi-refresh item-icon"
                    style="font-size: 20px"
                  ></i>
                </div>
              </el-tooltip>
              <el-tooltip
                effect="dark"
                content="表格"
                placement="top"
                v-if="chartstype !== 'table' && chartstype !== 'table-mult'"
              >
                <div
                  class="config-item"
                  @click="tableChange"
                >
                  <i
                    class="bx bx-table item-icon"
                    :style="{ color: tableShow ? '#556ee6' : '' }"
                    style="font-size: 20px"
                  ></i>
                </div>
              </el-tooltip>
              <!-- <el-tooltip
              effect="dark"
              content="洞察"
              placement="top"
              v-if="!chartEmpty"
            >
              <div
                class="config-item"
                @click="insightModalHandle"
              >
                <i class="icon iconfont icon-zhishidianwajue item-icon"></i>
              </div>
            </el-tooltip> -->
              <el-tooltip
                effect="dark"
                content="导出"
                placement="top"
              >
                <div
                  class="config-item"
                  @click="throttledExportChart"
                >
                  <i
                    class="bx bx-export item-icon"
                    style="font-size: 20px"
                  ></i>
                </div>
              </el-tooltip>
              <el-tooltip
                effect="dark"
                content="放大"
                placement="top"
              >
                <div
                  class="config-item"
                  @click="enlargeChart"
                  v-if="isPc"
                >
                  <i
                    class="icon iconfont icon-quanping item-icon"
                    style="font-size: 20px; font-weight: 600"
                  ></i></div
              ></el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div
        class="chart-breadcrumb"
        v-if="breadcrumbList.length"
      >
        <el-breadcrumb :separator-icon="ArrowRightIcon">
          <el-breadcrumb-item
            class="breadcrumb-all"
            @click="resetChart"
            >总览</el-breadcrumb-item
          >
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbList"
            :key="index"
          >
            <!-- 605-收支余特殊显示 -->
            <span v-if="item.seriesName">
              {{ item.name }} - {{ item.seriesName }}
            </span>
            <span v-else> {{ item.dimension }} - {{ item.name }} </span>
            <i
              class="mdi mdi-close chart-breadcrumb-close"
              v-if="index == breadcrumbList.length - 1"
              @click="delDrill(item)"
            ></i>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div
        v-if="chartEmpty"
        style="display: flex; align-items: center; height: 100%"
      >
        <img
          :src="require('@/assets/images/nocharts.svg')"
          style="width: 100%; height: 230px"
        />
      </div>
      <template v-else>
        <template v-if="tableShow">
          <Table
            :chartData="chartData"
            :tableCol="tableCol"
            :loading="loading"
          />
        </template>
        <template v-else>
          <ColumnChart
            :chartData="chartData"
            v-if="chartstype === 'bar' || chartstype === 'line'"
            @drill-handle="drillHandle"
          />
          <ColumnLineChart
            :chartData="chartData"
            v-if="chartstype === 'bar-line'"
            @drill-handle="drillHandle"
          />
          <ColumnGroupChart
            :chartData="chartData"
            v-if="chartstype === 'bar-grouped'"
            @drill-handle="drillHandle"
            :hasYearCompare="hasYearCompare"
          />
          <LineGroupChart
            :chartData="chartData"
            v-if="chartstype === 'line-grouped'"
            @drill-handle="drillHandle"
          />
          <ColumnStackChart
            :chartData="chartData"
            v-if="chartstype === 'bar-stacked'"
            :panelId="panelId"
            @drill-handle="drillHandle"
          />
          <PieChart
            :chartData="chartData"
            v-if="chartstype === 'pie'"
            @drill-handle="drillHandle"
          />
          <RingChart
            :chartData="chartData"
            v-if="chartstype === 'donut'"
            @drill-handle="drillHandle"
            :centerFontSize="16"
          />
          <Table
            :chartData="chartData"
            v-if="chartstype === 'table'"
            :tableCol="tableCol"
            @drill-handle="drillHandle"
            :loading="loading"
          />
          <TableMult
            :chartData="chartData"
            v-if="
              chartstype === 'table-mult' &&
              panelId !== 4116 &&
              panelId !== 4123
            "
            :tableCol="headers"
            @drill-handle="drillHandle"
            :loading="loading"
            :panelId="panelId"
          />
          <TablePartner
            :chartData="chartData"
            v-if="chartstype === 'table-mult' && panelId == 4116"
            :tableCol="headers"
            @drill-handle="drillHandle"
            :loading="loading"
            @update:chartData="(val) => (chartData = val)"
          />
          <TableScrollload
            :chartData="chartData"
            v-if="chartstype === 'table-mult' && panelId == 4123"
            :tableCol="headers"
            @drill-handle="drillHandle"
            @loadMoreData="loadMoreData"
            :pageSize="pageSize"
          />
        </template>
      </template>
    </div>
  </div>
  <!-- 放大图表 -->
  <el-dialog
    v-if="enlarge"
    v-model="enlarge"
    width="100%"
    :show-close="false"
    :modal="false"
    append-to=".page-content"
    custom-class="enlarge-dialog"
    modal-class="enlarge-dialog-modal"
    :lock-scroll="true"
    :close-on-press-escape="false"
  >
    <ManagementTitle :groupName="groupName" />
    <div
      class="card mb-0 mt-4 w-100 h-100"
      style="border-top: 2px solid #5a6dde"
    >
      <LoadingOverlay :loading="loading" />
      <div
        class="config-container w-100 h-100 card-body"
        @mouseenter="showConfig = true"
        style="position: relative"
      >
        <div class="charts-top-lg">
          <div
            class="charts-top-left"
            ref="chartsTopLeftDialog"
          >
            <span
              class="charts-title"
              ref="chartsTitleDialog"
            >
              {{ chartTitle }}
            </span>
            <el-popover
              placement="bottom-start"
              :title="chartTitle"
              :width="350"
              trigger="hover"
              :content="chartDesc"
              ref="descPopoverRefDialog"
            >
              <template #reference>
                <i
                  v-show="chartDesc"
                  class="bx bx-help-circle"
                  style="font-size: 16px; cursor: pointer"
                  ref="helpIconDialog"
                ></i>
              </template>
            </el-popover>
            <div
              class="date-range-desc"
              ref="dateRangeDescDialog"
            >
              {{ allChartsData.statisticalScope || "" }}
            </div>
          </div>
          <div
            :style="{ right: insightLargeShow ? '31%' : '20px' }"
          >
            <div class="d-flex gap-1">
              <div class="filters d-flex gap-2">
                <div class="extra-filter">
                  <el-select
                    v-if="panelId == 201 || panelId == 202 || panelId == 203"
                    v-model="panelId"
                    size="small"
                    style="width: 100px"
                    @change="changePanel"
                  >
                    <el-option
                      v-for="item in caseTotalTrendList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-if="panelId == 907 || panelId == 908 || panelId == 909"
                    v-model="panelId"
                    size="small"
                    style="width: 60px"
                    @change="changePanel"
                  >
                    <el-option
                      v-for="item in personnelStructureList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-if="panelId == 318 || panelId == 319"
                    v-model="panelId"
                    size="small"
                    style="width: 90px"
                    @change="changePanel"
                    ref="caseTotalTrendRef"
                  >
                    <el-option
                      v-for="item in custBycaseList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <!-- <ChartFilers
                :panelId="panelId"
                @fetchData="filterHandle"
              /> -->
                <!-- 放大筛选 -->
                <div class="filter-wrapper">
                  <template
                    v-for="item in filterList"
                    :key="item.filterId"
                  >
                    <el-date-picker
                      v-if="item.filterType === 'date'"
                      v-model="queryModuleData[item.property]"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      size="small"
                      ref="datePickerRef"
                      @change="changeFilter"
                      style="width: 220px"
                      value-format="YYYY-MM-DD"
                      popper-class="data-range-picker"
                      :clearable="false"
                      :unlink-panels="true"
                    />
                    <el-select
                      v-if="item.filterType === 'select'"
                      v-model="queryModuleData[item.property]"
                      size="small"
                      style="width: 90px"
                      @change="changeFilter"
                      ref="selectRef"
                    >
                      <el-option
                        v-for="itm in item.values"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      />
                    </el-select>
                    <el-select
                      v-if="
                        item.filterType === 'specialScope' ||
                        item.filterType === 'recentYear'
                      "
                      v-model="dateFilter"
                      size="small"
                      style="width: 80px"
                      ref="dateFilterRef"
                      @change="
                        (value) =>
                          changeDate(value, item.filterType, item.property)
                      "
                    >
                      <el-option
                        v-for="itm in item.values"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      />
                    </el-select>
                    <el-select
                      v-if="
                        item.filterType === 'selectMany' &&
                        item.property == 'custId'
                      "
                      v-model="queryModuleData[item.property]"
                      remote
                      clearable
                      filterable
                      size="small"
                      style="width: 100px"
                      @change="changeFilter"
                      placeholder="输入客户名称"
                      :remote-method="customerRemoteMethod"
                      class="cust-select"
                    >
                      <el-option
                        v-for="itm in customOptions"
                        :key="itm.id"
                        :label="itm.name"
                        :value="itm.id"
                      >
                      </el-option>
                    </el-select>
                    <el-cascader
                      v-if="item.filterType === 'cascader'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      filterable
                      :show-all-levels="false"
                      :props="{
                        children: 'children',
                        label: 'label',
                        value: 'value',
                        expandTrigger: 'hover',
                      }"
                      @change="changeFilter"
                      size="small"
                      clearable
                    />
                    <el-select
                      v-if="item.filterType === 'customDate'"
                      v-model="customDate"
                      size="small"
                      ref="dateFilterRef"
                      style="width: 80px"
                      @change="
                        (value) => changeCustomDate(value, item.property)
                      "
                    >
                      <el-option
                        v-for="itm in item.values"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      />
                    </el-select>
                    <el-date-picker
                      v-if="
                        item.filterType === 'customDate' &&
                        customDate === '自定义时间范围'
                      "
                      v-model="customDateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      size="small"
                      ref="datePickerRef"
                      @change="
                        (value) => changeCustomDateRange(value, item.property)
                      "
                      style="width: 220px"
                      value-format="YYYY-MM-DD"
                      popper-class="data-range-picker"
                    />
                    <el-select
                      v-model="selectValue"
                      style="width: 140px"
                      ref="datePickerRef"
                      popper-class="custom-year-select"
                      :multiple="false"
                      :clearable="false"
                      :filterable="false"
                      :collapse-tags="false"
                      :collapse-tags-tooltip="false"
                      size="small"
                      :placeholder="customLabel"
                      v-if="
                        item.filterType === 'recentYearCustom' && !item.noShow
                      "
                      @change="
                        (val) => changeQuickCustomyear(val, item.property)
                      "
                    >
                      <el-option
                        v-for="item in quickOptions(item.yearNum)"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                      <template #footer>
                        <div class="custom-years-title">自定义选择年份</div>
                        <div style="max-height: 160px; overflow-y: auto">
                          <el-checkbox-group
                            v-model="customYears"
                            class="custom-years-group"
                            @change="
                              (val) => changeCustomyear(val, item.property)
                            "
                          >
                            <el-checkbox
                              v-for="year in yearOptions"
                              :key="year"
                              :label="year"
                              :value="year"
                              :disabled="
                                customYears.length >= 5 &&
                                !customYears.includes(year)
                              "
                              >{{ year }}年</el-checkbox
                            >
                          </el-checkbox-group>
                        </div>
                        <div
                          class="custom-years-tip"
                          :class="{ limit: customYears.length >= 5 }"
                        >
                          最多选择5个年份
                        </div>
                      </template>
                    </el-select>
                  </template>
                </div>
              </div>
              <div class="d-flex gap-3">
                <el-tooltip
                  effect="dark"
                  content="还原"
                  placement="top"
                >
                  <div
                    class="config-item"
                    @click="resetChart"
                  >
                    <i
                      class="mdi mdi-refresh item-icon"
                      style="font-size: 20px"
                    ></i>
                  </div>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  content="表格"
                  placement="top"
                  v-if="chartstype !== 'table' && chartstype !== 'table-mult'"
                >
                  <div
                    class="config-item"
                    @click="tableChange"
                  >
                    <i
                      class="bx bx-table item-icon"
                      :style="{ color: tableShow ? '#556ee6' : '' }"
                      style="font-size: 20px"
                    ></i>
                  </div>
                </el-tooltip>
                <!-- <el-tooltip
                effect="dark"
                content="洞察"
                placement="top"
                v-if="!chartEmpty"
              >
                <div
                  class="config-item"
                  @click="insightHandle"
                >
                  <i class="icon iconfont icon-zhishidianwajue item-icon"></i>
                </div>
              </el-tooltip> -->
                <el-tooltip
                  effect="dark"
                  content="导出"
                  placement="top"
                >
                  <div
                    class="config-item"
                    @click="throttledExportChart"
                  >
                    <i
                      class="bx bx-export item-icon"
                      style="font-size: 20px"
                    ></i></div
                ></el-tooltip>
                <el-tooltip
                  effect="dark"
                  content="收缩"
                  placement="top"
                >
                  <div
                    class="config-item"
                    @click="closeChart"
                  >
                    <i
                      class="icon iconfont icon-tuichuquanping item-icon"
                      style="font-size: 20px; font-weight: 600"
                    ></i></div
                ></el-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div
          class="charts-content"
          :style="{ width: insightLargeShow ? '70%' : '100%' }"
        >
          <div
            class="chart-breadcrumb"
            v-if="breadcrumbList.length"
          >
            <el-breadcrumb :separator-icon="ArrowRightIcon">
              <el-breadcrumb-item
                class="breadcrumb-all"
                @click="resetChart"
                >总览</el-breadcrumb-item
              >
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumbList"
                :key="index"
              >
                <!-- 605-收支余特殊显示 -->
                <span v-if="item.seriesName">
                  {{ item.name }} - {{ item.seriesName }}
                </span>
                <span v-else> {{ item.dimension }} - {{ item.name }} </span>
                <i
                  class="mdi mdi-close chart-breadcrumb-close"
                  v-if="index == breadcrumbList.length - 1"
                  @click="delDrill(item)"
                ></i>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div
            id="insight-chart"
            class="h-100"
          >
            <div
              v-if="chartEmpty"
              style="display: flex; align-items: center; height: 100%"
            >
              <img
                :src="require('@/assets/images/nocharts.svg')"
                style="width: 100%; height: 230px"
              />
            </div>
            <template v-else>
              <template v-if="tableShow">
                <Table
                  :chartData="chartData"
                  :tableCol="tableCol"
                  :loading="loading"
                />
              </template>
              <template v-else>
                <ColumnChart
                  :chart-data="chartData"
                  :charts-type="chartstype"
                  @drill-handle="drillHandle"
                  v-if="chartstype === 'bar' || chartstype === 'line'"
                />
                <ColumnLineChart
                  :chartData="chartData"
                  v-if="chartstype === 'bar-line'"
                  @drill-handle="drillHandle"
                />
                <ColumnGroupChart
                  :chartData="chartData"
                  v-if="chartstype === 'bar-grouped'"
                  @drill-handle="drillHandle"
                  :hasYearCompare="hasYearCompare"
                />
                <LineGroupChart
                  :chartData="chartData"
                  v-if="chartstype === 'line-grouped'"
                  @drill-handle="drillHandle"
                />
                <ColumnStackChart
                  :chart-data="chartData"
                  v-if="chartstype === 'bar-stacked'"
                  @drill-handle="drillHandle"
                  :panelId="panelId"
                />
                <PieChart
                  :chartData="chartData"
                  v-if="chartstype === 'pie'"
                  @drill-handle="drillHandle"
                />
                <RingChart
                  :chartData="chartData"
                  v-if="chartstype === 'donut'"
                  @drill-handle="drillHandle"
                  :centerFontSize="28"
                />
                <Table
                  :chartData="chartData"
                  v-if="chartstype === 'table'"
                  :tableCol="tableCol"
                  @drill-handle="drillHandle"
                  :loading="loading"
                />
                <TableMult
                  :chartData="chartData"
                  v-if="
                    chartstype === 'table-mult' &&
                    panelId !== 4116 &&
                    panelId !== 4123
                  "
                  :tableCol="headers"
                  @drill-handle="drillHandle"
                  :loading="loading"
                  :panelId="panelId"
                />
                <TablePartner
                  :chartData="chartData"
                  v-if="chartstype === 'table-mult' && panelId == 4116"
                  :tableCol="headers"
                  @drill-handle="drillHandle"
                  :loading="loading"
                  @update:chartData="(val) => (chartData = val)"
                />
                <TableScrollload
                  :chartData="chartData"
                  v-if="chartstype === 'table-mult' && panelId == 4123"
                  :tableCol="headers"
                  @drill-handle="drillHandle"
                  @loadMoreData="loadMoreData"
                  :pageSize="pageSize"
                />
              </template>
            </template>
          </div>
        </div>
        <div
          class="h-100 insight-wrapper"
          v-if="insightLargeShow"
        >
          <div class="h-100 insight-content">
            <Insight />
            <div style="position: absolute; top: 6px; right: 0">
              <i
                style="font-size: 24px; cursor: pointer"
                class="mdi mdi-close"
                @click="insightLargeShow = false"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog
    v-model="drillVisible"
    width="auto"
    align-center
    :modal="false"
    :show-close="false"
    class="drill-dialog"
    :append-to-body="enlarge"
  >
    <span class="drill-title">选择下钻维度</span>
    <el-divider style="margin: 12px 0" />
    <div>
      <div
        v-for="(item, index) in drillPanels"
        :key="index"
        @click="startDrill(item)"
      >
        <div
          class="d-flex justify-content-between align-items-center drill-item gap-3"
        >
          <div class="drill-item-name">{{ item.panelName }}</div>
          <div class="d-flex align-items-center">
            <div>下钻</div>
            <div style="height: 20px">
              <i
                class="bx bx-chevron-right"
                style="font-size: 20px"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog
    v-model="insightVisible"
    align-center
    append-to-body
    class="insight-dialog"
    destroy-on-close
    width="1000"
  >
    <div class="d-flex w-100 h-100">
      <div
        style="width: 60%"
        min-wdth="400px"
        class="h-100"
        id="insight-chart"
      >
        <div class="insight-header">{{ chartTitle }}</div>
        <div
          style="width: 100%; height: 100%; display: flex; align-items: center"
        >
          <div style="width: 100%; height: 80%">
            <ColumnChart
              :chart-data="chartData"
              @drill-handle="drillHandle"
              v-if="chartstype === 'bar' || chartstype === 'line'"
            />
            <ColumnLineChart
              :chartData="chartData"
              v-if="chartstype === 'bar-line'"
              @drill-handle="drillHandle"
            />
            <ColumnGroupChart
              :chartData="chartData"
              v-if="chartstype === 'bar-grouped'"
              @drill-handle="drillHandle"
            />
            <LineGroupChart
              :chartData="chartData"
              v-if="chartstype === 'line-grouped'"
              @drill-handle="drillHandle"
            />
            <PieChart
              :chartData="chartData"
              v-if="chartstype === 'pie'"
              @drill-handle="drillHandle"
            />
            <RingChart
              :chartData="chartData"
              v-if="chartstype === 'donut'"
              @drill-handle="drillHandle"
              :centerFontSize="16"
            />
            <Table
              :chartData="chartData"
              v-if="chartstype === 'table'"
              :tableCol="tableCol"
              @drill-handle="drillHandle"
              :loading="loading"
            />
            <TableMult
              :chartData="chartData"
              v-if="chartstype === 'table-mult'"
              :tableCol="headers"
              @drill-handle="drillHandle"
              :loading="loading"
            />
          </div>
        </div>
      </div>
      <div style="width: 40%; min-width: 350px">
        <Insight />
      </div></div
  ></el-dialog>
</template>

<style lang="scss" scoped>
.config-container {
  position: relative;
}
// .charts-config {
//   position: absolute;
//   top: 18px; /* 根据需要调整 */
//   right: 20px; /* 根据需要调整 */
// }
.charts-top-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  flex: 1 1 0%;
  min-width: 0;
}
.charts-top-sm {
  position: absolute;
  z-index: 2024;
  display: flex;
  justify-content: space-between;
  width: calc(100% - 32px);
  flex-wrap: nowrap;
  align-items: flex-start;
}
.charts-top-lg {
  position: absolute;
  z-index: 2024;
  display: flex;
  justify-content: space-between;
  width: calc(100% - 32px);
}
.charts-title {
  font-weight: bold;
  font-size: 15px;
  white-space: nowrap;
}
.insight-header {
  font-size: 15px;
  font-weight: bold;
  position: absolute;
  z-index: 2024;
  line-height: 40px;
}
.chart-breadcrumb {
  position: absolute;
  top: 46px;
  z-index: 2024;
  .el-breadcrumb {
    font-size: 13px;
    color: #757575;
    .el-breadcrumb__item {
      margin-bottom: 6px;
    }
  }
  :deep(.breadcrumb-all) {
    .el-breadcrumb__inner {
      color: #556ee6;
    }
    cursor: pointer;
  }
  .chart-breadcrumb-close {
    font-size: 14px;
    margin-left: 4px;
  }
  .chart-breadcrumb-close:hover {
    background-color: #757575;
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    display: inline-block;
  }
}
.config-item {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #f0f2f6;
    border-radius: 10%;
  }
  .item-icon {
    color: #9f9f9f;
    &:hover {
      color: #556ee6;
    }
  }
}
.enlarge-dialog {
  width: 800px;
}
.charts-content {
  height: calc(100vh - 200px);
}
.insight-header {
  height: 48px;
}
.insight-wrapper {
  width: 30%;
  position: absolute;
  right: 0;
  top: 0;
  margin-right: 16px;
}
.insight-content {
  position: relative;
}
.filter-wrapper {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
}
</style>
<style lang="scss">
.data-range-picker {
  //处理日期面板溢出浏览器问题
  margin-left: -100px;
}
.enlarge-dialog-modal {
  z-index: 200 !important;
  position: absolute !important;
  width: 100%;
  height: 100vh;
  .el-overlay-dialog {
    position: absolute !important;
    height: 100vh;
    .el-dialog {
      height: calc(100vh - 50px);
      margin-top: 50px;
      margin-bottom: 0;
      background-color: #f8f8fb;
      padding: 0 24px 24px;
    }
  }
}
.drill-dialog {
  min-width: 250px;
  .el-dialog__header {
    padding-bottom: 0 !important;
  }
  .drill-title {
    font-size: 15px;
    font-weight: bold;
    color: #111111;
  }
  .drill-item {
    height: 32px;
    cursor: pointer;
    padding: 0 8px;
    .drill-item-name {
      color: #000000;
    }
  }
  .drill-item:hover {
    background-color: #d7e0f6;
    border-radius: 5px;
  }
}
.insight-dialog {
  padding-top: 0;
  height: 500px;
  border-top: 2px solid #5a6dde;
  .el-dialog__header {
    padding-bottom: 0 !important;
  }
  .el-dialog__close {
    font-size: 20px;
  }
  .el-dialog__headerbtn {
    top: 4px;
  }
  .el-dialog__body {
    height: 100%;
  }
}
.cust-select {
  .el-select__input {
    width: 100% !important;
  }
}
.custom-year-select .el-select-dropdown__item.custom-group-label {
  cursor: default;
  background: #f5f5f5;
  font-weight: 600;
  color: #888;
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.custom-years-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}
.custom-years-group {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}
.custom-years-tip {
  text-align: left;
  color: #b0b0b0;
  font-size: 12px;
}
.date-range-desc {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.charts-top-left {
  @media screen and (min-width: 500px) {
    .date-range-desc {
      display: inline-block;
    }
  }
}
</style>
