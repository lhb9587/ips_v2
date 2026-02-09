<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";
import { SimpleBar } from "simplebar-vue3";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import { calendarEvents, categories } from "./data-calendar";
import { getUserInfo } from "@/utils/user";
import { unique, saveTableConfig, downLoadAll } from "@/utils";
import dayjs from "dayjs";
import { userComputed } from "@/state/helpers";
import {
  submitBusinessTrip,
  checkListType,
  countTripDays,
  getBtList,
  getBtById,
  deleteBtById,
  saveBusinessTrip,
  auditBusinessTrip,
} from "@/api/businessTrip";
import { querycustSelectClass } from "@/api/caseDetail";
// import { Delete, Edit, InfoFilled } from "@element-plus/icons-vue";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import ViewDetail from "./viewDetail.vue";
import { queryList, querySimilarCustomer } from "@/api/caseList";
import { deriveList } from "@/api/caseList";

/**
 * Calendar component
 */
export default {
  name: "businesstrip",
  components: {
    FullCalendar,
    Layout,
    SimpleBar,
    Delete,
    Edit,
    // InfoFilled,
    ViewDetail,
    GridView,
    TopListTool,
    Pagination,
    ListSearch,
  },
  data() {
    return {
      auditCommentPopoverVisible: false,
      auditComment: '',
      auditDialogVisible: false,
      currentAuditType: null,
      noLayoutStyle: {},
      title: "Calendar",
      calendarEvents: calendarEvents,
      calendarOptions: {
        headerToolbar: {
          left: "calendarViewButton,listViewButton customButton prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,listMonth",
        },
        customButtons: {
          customButton: {
            text: "出差报备创建",
            click: () => {
              this.drawerStatus = true;
            },
          },
          listViewButton: {
            text: "列表视图",
            click: () => {
              this.toggleViewMode();
            },
          },
          calendarViewButton: {
            text: "日历视图",
          }
        },
        buttonText: {
          today: "本月",
          dayGridWeek: "周",
          month: "月",
          list: "列表",
        },
        buttonHints: {
          prev: '上个月',
          next: '下个月',
          today: '本月',
          month: '月',
          year: '年',
          week: '周',
          day: '日',
          list: '列表'
        },
        allDayText: '全天',
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          multiMonthPlugin,
          interactionPlugin,
          bootstrapPlugin,
          listPlugin,
        ],
        locale: "zh-cn",
        initialView: "dayGridMonth",
        themeSystem: "bootstrap",
        initialEvents: [],
        editable: false,
        eventStartEditable: false,
        eventDurationEditable: false,
        droppable: false,
        eventResizableFromStart: false,
        eventClick: this.editEvent,
        weekends: true,
        selectable: false,
        selectMirror: false,
        dayMaxEvents: true,
        views: {
          multiMonthYear: {
            type: "multiMonth",
            multiMonthMaxColumns: 2,
            duration: { years: 1 },
            buttonText: "年",
          },
          listMonth: {
            titleFormat: { year: 'numeric', month: 'long' },
            eventContent: (arg) => {
              // 获取状态样式
              const getStatusStyle = (status) => {
                switch(status) {
                  case '已完成':
                    return 'color: #67C23A'; // 绿色
                  case '审核退回':
                    return 'color: #F56C6C'; // 红色
                  case '待提交':
                    return 'color: #f8edda'; // 蓝色
                  case '待审核':
                    return 'color: #dca550'; // 橙色
                  default:
                    return '';
                }
              };

              return {
                html: `
                  <div class="list-event-content">
                    <div class="event-title">
                      <span class="trip-days">${this.formatTitle(arg.event.extendedProps)}</span>
                    </div>
                    ${
                      `<div class="status-tag" style="${getStatusStyle(arg.event.extendedProps.wfStatus)}">
                          ${arg.event.extendedProps.wfStatus}
                      </div>`
                    }
                  </div>
                `
              };
            }
          },
        },
        height: document.documentElement.clientHeight - 136,
        datesSet: this.handleDatesSet,
        noEventsText: "暂无数据",
        moreLinkText: '更多',
      },
      categories: categories,
      userValue: "",
      drawerStatus: false,
      appData: {},
      userName: getUserInfo().name,
      rules: {
        tripType: [{ required: true, message: "此项为必填项" }],
        transport: [{ required: true, message: "此项为必填项" }],
        tripWay: [{ required: true, message: "此项为必填项" }],
        departureCity: [{ required: true, message: "此项为必填项" }],
        destinationCity: [{ required: true, message: "此项为必填项" }],
        startDate: [{ required: true, message: "此项为必填项" }],
        endDate: [{ required: true, message: "此项为必填项" }],
        tripReason: [{ required: true, message: "此项为必填项" }],
        meetingName: [{ required: true, message: "此项为必填项" }],
        custIdStr: [{ required: true, message: "此项为必填项" }],
      },
      resizeObserver: null,
      tripTypeList: [],
      custList: [],
      btUserOptions: [],
      btUserList: [],
      selectedUser: {
        userId: getUserInfo().userId,
      },
      btList: [],
      listType: undefined,
      originalListType: undefined,
      avatarLoadErrorList: [],
      readonly: false,
      custVisible: false,
      noMatch: false,
      defaultStartTime: new Date(2000, 1, 1, 9, 0, 0),
      defaultEndTime: new Date(2000, 1, 1, 18, 0, 0),
      submitLoading: false,
      passLoading: false,
      rejectLoading: false,
      viewMode: 'calendar',
      gridName: 'BusinessTripListGrid',
      bussId: 63,
      columnList: [],
      activeClass: [],
      rowHeight: 40,
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 50,
      },
      pageSizesList: [10, 50, 200, 500, 1000],
      formInline: {},
      diminput: '',
      tagList: [],
      requestData: undefined,
    };
  },
  computed: {
    ...userComputed,
    listHeight() {
      const layout = this.$store.state.layout.layoutType;
      const windowHeight = document.documentElement.clientHeight;
      if (layout === "vertical") {
        return windowHeight - 180;
      } else {
        return windowHeight - 235;
      }
    },
    auditable() {
      return (
        this.appData.btId &&
        this.selectedUser.userId !== getUserInfo().userId &&
        this.listType == 1 &&
        this.appData.wfStatus == "待审核"
      );
    },
    editable() {
      return (
        this.appData.btId &&
        this.selectedUser.userId == getUserInfo().userId &&
        (this.appData.wfStatus == "待审核" || this.appData.wfStatus == "待提交" || this.appData.wfStatus == "审核退回")
      );
    },
  },
  watch: {
    listType(newVal) {
      if (newVal == 1) {
        this.fetchBtUserList();
      } else {
        this.fetchBtList();
      }
    },
    selectedUser(newVal) {
      if (newVal.userId && this.viewMode === 'calendar') {
        this.fetchBtList();
      }
    },
    'appData.startDate': {
      handler() {
        this.calculateTripDays();
      }
    },
    'appData.endDate': {
      handler() {
        this.calculateTripDays();
      }
    }
  },
  methods: {
    dayjs,
    unique,
    formatTitle(info){
      if (info.tripType == 2162) {
        return info.tripTypeStr + ' - ' + info.meetingName
      } else if (info.tripType == 2163) {
        return info.tripTypeStr + ' - ' + info.custIdStr
      } else if (info.tripType == 2164) {
        return info.tripReason
      }else {
        return ''
      }
    },
    auditHandle(type) {
      this.currentAuditType = type;
      this.auditComment = '';
      this.auditDialogVisible = true;
    },
    submitAudit() {
      if (this.currentAuditType) {
        this.passLoading = true;
      }else{
        this.rejectLoading = true;
      }
      const params = {
        btId: this.appData.btId,
        result: this.currentAuditType,
        taskId: this.appData.taskId,
        auditComment: this.auditComment
      };
      auditBusinessTrip(params).then((res) => {
        this.passLoading = false
        this.rejectLoading = false
        if (res.success) {
          this.$message.success("操作成功");
          this.fetchBtList();
          this.resetData();
          this.auditDialogVisible = false;
          this.auditComment = '';
        }
      });
    },
    changeTripType() {
      this.appData.custIdStr = undefined;
      this.appData.custId = undefined;
      this.appData.custIntroductor = undefined;
      this.appData.tripReason = undefined;
      this.appData.meetingName = undefined;
    },
    debounce(fn, wait) {
      return (v) => {
        if (this.timer !== null) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          fn(v);
        }, wait);
      };
    },
    remoteQueryCust(v) {
      this.remotepaternalUnit(v, "客户");
    },
    changeCust(custInfo) {
      this.appData.custIntroductor = undefined;
      this.appData.custId = custInfo.custId;
      this.appData.custIdStr = custInfo.fullname;
    },
    custBlur() {
      this.custVisible = false;
      this.noMatch = false;
      setTimeout(() => {
        if (!this.appData.custId && this.appData.custIdStr) {
          const title =
            this.custList.length > 1 ? "已存在相似客户" : "该客户不存在";
          this.$confirm(`${title}，是否创建新客户`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.noMatch = true;
              this.appData.custIntroductor = this.name;
              this.appData.custId = undefined;
            })
            .catch(() => {
              this.appData.custIdStr = null;
              this.noMatch = false;
            });
        }
      }, 500);
    },
    remotepaternalUnit(query, type) {
      if (!query && type === "客户") {
        this.appData.fullname = undefined;
        this.appData.custIntroductor = undefined;
        this.appData.custId = undefined;
        this.appData.custIdStr = undefined;
      }
      if (query) {
        Promise.all([
          queryList({
            pageNo: 1,
            pageSize: 50,
            sign: 1,
            parameter: query,
          }),
          querySimilarCustomer({ fullname: query }),
        ]).then((res) => {
          const conList = this.unique(
            res[0].data.concat(
              res[1].data.map((item) => ({
                custId: item.custId,
                fullname: item.custIdStr,
                name: item.name,
              }))
            ),
            "custId"
          );
          this.custList = conList;
          this.$forceUpdate();
        });
      } else {
        this.custList = [];
      }
    },
    handleAvatarError(userIcon) {
      this.avatarLoadErrorList = [...this.avatarLoadErrorList, userIcon];
    },
    handleUserChange(userId) {
      if (userId) {
        this.btUserList = this.btUserOptions.filter(
          (item) => item.userId == userId
        );
      } else {
        this.btUserList = this.btUserOptions;
      }
      this.selectedUser = this.btUserList[0];
    },
    //重置数据
    resetData() {
      this.drawerStatus = false;
      setTimeout(() => {
        this.$refs.appForm?.resetFields();
        this.readonly = false;
        this.appData = {};
        this.noMatch = false;
      }, 200);
    },

    //获取出差类型
    fetchTripTypeList() {
      querycustSelectClass({ classId: 1180 }).then((res) => {
        if (res.success) {
          this.tripTypeList = res.data[1180] || [];
        }
      });
    },

    //获取出差人员
    fetchBtUserList() {
      const params = {
        startDate: this.startDate,
        endDate: this.endDate,
      };
      countTripDays(params).then((res) => {
        if (res.success) {
          this.btUserOptions = res.data || [];
          this.btUserList = res.data || [];
          this.selectedUser = res.data[0] || {};
          // this.fetchBtList();
        }
      });
    },
    //获取出差列表
    fetchBtList() {
      const params = {
        pageNo: this.viewMode === 'table' ? this.listQuery.pageNo : 1,
        pageSize: this.viewMode === 'table' ? this.listQuery.pageSize : 99999,
        keywords: this.diminput || undefined,
        ...this.formInline,
      };
      
      // 只有在日历视图时才传递时间和userId参数
      if (this.viewMode === 'calendar') {
        params.startDate = this.startDate;
        params.endDate = this.endDate;
        params.userId = this.selectedUser.userId;
      }
      getBtList(params).then((res) => {
        if (res.success) {
          // 格式化数据，添加sid字段用于GridView
          const dataList = res.data || [];
          dataList.forEach((item, index) => {
            item.sid = index;
          });

          // 保存列表数据
          this.btList = dataList;
          this.total = res.total || 0;

          // 如果是日历视图，更新日历事件
          if (this.viewMode === 'calendar' && this.$refs.fullCalendar) {
            // 获取日历实例
            const calendarApi = this.$refs.fullCalendar.getApi();

            // 格式化数据
            const events = dataList.map((item) => ({
              id: item.btId,
              title: item.tripTypeStr,
              start: dayjs(item.startDate).format("YYYY-MM-DD HH:mm:ss"),
              end: dayjs(item.endDate).format("YYYY-MM-DD HH:mm:ss"),
              className: "bg-primary text-white",
              extendedProps: {
                ...item, // 保存完整的出差信息
              },
            }));

            // 一次性设置所有事件
            calendarApi.setOption("events", events);
          }
        }
      });
    },
    //检查权限
    checkListType() {
      checkListType().then((res) => {
        if (res.success) {
          this.listType = res.data.listType || 0;
          this.originalListType = res.data.listType || 0;
        }
      });
    },

    //提交
    confirmClick(type) {
      this.$refs.appForm.validate((valid) => {
        if (valid) {
          if (this.appData.tripDays < 1){
            return this.$message.error("出差天数不能小于1天");
          }
          if (
            this.appData?.companions?.length > 0 &&
            Array.isArray(this.appData.companions)
          ) {
            this.appData.companions = this.appData.companions?.join(",");
          }
          if (type == "save") {
            saveBusinessTrip(this.appData).then((res) => {
              if (res.success) {
                this.resetData();
                this.$message.success("保存成功");
                if (this.listType == 1) {
                  this.fetchBtUserList();
                } else {
                  this.fetchBtList();
                }
              }
            });
          } else if (type == "submit") {
            this.submitLoading = true;
            submitBusinessTrip(this.appData).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.resetData();
                this.$message.success("提交成功");
                if (this.listType == 1) {
                  this.fetchBtUserList();
                } else {
                  this.fetchBtList();
                }
              }
            }).catch(()=>{
              this.submitLoading = false;
            })
          }
        } else {
          return false;
        }
      });
    },
    /**
     * 删除
     */
    deleteEvent() {
      ElMessageBox.confirm("确认要删除该出差申请吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteBtById({ btId: this.appData.btId }).then((res) => {
          if (res.success) {
            this.fetchBtList();
            this.$message.success("删除成功");
            this.resetData();
          }
        });
      });
    },
    /**
     * 打开详情
     */
    editEvent(info) {
      const morePopover = document.querySelector(".fc-more-popover");
      if (morePopover) {
        morePopover.remove();
      }
      this.fetchEventDetail(info.event);
      this.drawerStatus = true;
      this.readonly = true;
    },
    fetchEventDetail(info) {
      getBtById({ btId: info.id }).then((res) => {
        res.data.tripType = Number(res.data.tripType);
        res.data.companions = res.data.companions
          ?.split(",")
          .map((item) => Number(item));
        if (res.data.custId) {
          this.remotepaternalUnit(res.data.custIdStr, "客户");
        }
        this.appData = res.data;
      });
    },
    chatUsername(data) {
      this.selectedUser = data;
    },

    // 初始化 ResizeObserver
    initResizeObserver() {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      const calendarEl = document.querySelector(".app-calendar");
      if (calendarEl) {
        this.resizeObserver.observe(calendarEl);
      }
    },

    // 处理resize事件
    handleResize() {
      if (this.$refs.fullCalendar) {
        const calendarApi = this.$refs.fullCalendar.getApi();
        if (calendarApi) {
          // 更新日历大小
          calendarApi.updateSize();
        }
      }
    },

    // 处理日期切换事件
    handleDatesSet(dateInfo) {
      const calendarApi = this.$refs.fullCalendar.getApi();
      // 获取当前日期
      const currentDate = calendarApi.getDate();
      if (
        dateInfo.view.type == "dayGridMonth" ||
        dateInfo.view.type == "listMonth"
      ) {
        this.startDate = dayjs(currentDate)
          .startOf("month")
          .format("YYYY-MM-DD");
        this.endDate = dayjs(currentDate).endOf("month").format("YYYY-MM-DD");
      } else if (dateInfo.view.type == "multiMonthYear") {
        this.startDate = dayjs(currentDate)
          .startOf("year")
          .format("YYYY-MM-DD");
        this.endDate = dayjs(currentDate).endOf("year").format("YYYY-MM-DD");
      }
      if (this.listType == 1) {
        this.fetchBtUserList()
      }else{
        this.fetchBtList();
      }
    },

    calculateTripDays() {
      if (this.appData.startDate && this.appData.endDate) {
        const start = dayjs(this.appData.startDate);
        const end = dayjs(this.appData.endDate);

        // 计算时间差（小时）
        const diffHours = end.diff(start, 'hour');

        // 将小时转换为天（24小时为1天）
        const days = Math.ceil(diffHours / 24);

        // 如果计算结���大于0，则更新天数
        if (days > 0) {
          this.appData.tripDays = days;
        } else {
          this.appData.tripDays = 0;
        }
      } else {
        this.appData.tripDays = 0;
      }
    },

    // 禁用开始日期
    disabledStartDate(date) {
      if (this.appData.endDate) {
        // 允许选择同一天，但不能超过结束日期
        return dayjs(date).isAfter(dayjs(this.appData.endDate), 'day');
      }
      return false;
    },

    // 禁用结束日期
    disabledEndDate(date) {
      if (this.appData.startDate) {
        // 允许选择同一天，但不能早于开始日期
        return dayjs(date).isBefore(dayjs(this.appData.startDate), 'day');
      }
      return false;
    },

    // 切换视图模式
    toggleViewMode() {
      const oldMode = this.viewMode;
      this.viewMode = this.viewMode === 'calendar' ? 'table' : 'calendar';
      
      if (oldMode === 'table' && this.viewMode === 'calendar') {
        // 从列表切换回日历时，清空高级筛选条件
        this.formInline = {};
        this.diminput = '';
        // 恢复原始的listType值
        this.listType = this.originalListType;
        this.fetchBtList();
      } else if (oldMode === 'calendar' && this.viewMode === 'table') {
        // 从日历切换到列表时，将listType置为undefined
        this.listType = undefined;
      }
    },

    // 查看详情（表格列表视图）
    viewDetail(params) {
      this.fetchEventDetail({ id: params.data.btId });
      this.drawerStatus = true;
      this.readonly = true;
    },

    // GridView 配置方法
    setColumn(list) {
      this.columnList = list;
    },

    changeBorder(newVal) {
      newVal
        ? this.activeClass.push("Borderline")
        : this.activeClass.splice(
            this.activeClass.findIndex((i) => i === "Borderline"),
            1
          );
      saveTableConfig("isBorderline", this.gridName, newVal);
    },

    changeRowStyle(newVal) {
      newVal
        ? this.activeClass.push("zebra")
        : this.activeClass.splice(
            this.activeClass.findIndex((i) => i === "zebra"),
            1
          );
      saveTableConfig("iszebra", this.gridName, newVal);
    },

    changeRowHeight(height) {
      this.rowHeight = height;
      saveTableConfig("rowHeight", this.gridName, height);
    },

    calculateGridHeight() {
      const layout = this.$store.state.layout.layoutType;
      const windowHeight = document.documentElement.clientHeight;
      if (layout === "vertical") {
        return windowHeight - 230;
      } else if (layout === 'no') {
        return windowHeight - 150;
      } else {
        return windowHeight - 305;
      }
    },

    // 模糊搜索
    fuzzySearch() {
      this.listQuery.pageNo = 1;
      this.formInline = {};
      this.fetchBtList();
    },

    // 高级搜索
    handleSearch(typeStr) {
      this.diminput = "";
      this.formInline = { ...typeStr.data };
      this.tagList = typeStr.tagList || [];
      this.listQuery.pageNo = 1;
      this.fetchBtList();
      this.requestData = {
        ...typeStr.data,
      };
    },

    // 导出数据
    exportData() {
      deriveList({
        ...this.formInline,
        bussId: 63,
        keywords: this.diminput || undefined,
        startDate: this.startDate,
        endDate: this.endDate,
        userId: this.selectedUser.userId,
      }).then((res) => {
        if (res.success) {
          const data = {
            url: `/${res.data}`,
          };
          downLoadAll(data);
        }
      });
    },
  },
  mounted() {
    this.initResizeObserver();
    this.checkListType();
    this.fetchTripTypeList();
    // 检查url参数layout
    let layoutParam = '';
    if (this.$route && this.$route.query && this.$route.query.layout) {
      layoutParam = this.$route.query.layout;
    }
    if (layoutParam === 'no') {
      this.$store.dispatch('layout/changeLayoutType', {
        layoutType: 'no',
      });
      const windowHeight = document.documentElement.clientHeight - 25 + 'px';
      this.noLayoutStyle = {
        height: windowHeight,
        padding: '15px'
      }
    }
  },
  beforeUnmount() {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<template>
  <Layout>
    <!-- <PageHeader :title="title" :items="items" /> -->
    <div class="d-flex gap-3 layout-page" :style="noLayoutStyle">
      <div
        style="width: 20%; min-width: 180px"
        v-if="listType == 1 && viewMode === 'calendar'"
      >
        <div class="card mb-0">
          <div class="card-body" :style="noLayoutStyle">
            <div class="d-flex gap-2">
              <div class="flex-grow-1">
                <el-select
                  v-model="userValue"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                  @change="handleUserChange"
                  filterable
                >
                  <el-option
                    v-for="item in btUserOptions"
                    :key="item.userId"
                    :label="item.fullname"
                    :value="item.userId"
                  />
                </el-select>
              </div>
            </div>
            <div
              id="external-events"
              class="mt-2"
              :style="{ height: listHeight + 'px' }"
            >
              <SimpleBar
                id="chat-list"
                style="height: 100%"
              >
                <ul class="list-unstyled chat-list">
                  <li
                    class
                    v-for="data of btUserList"
                    :key="data.userId"
                    @click="chatUsername(data)"
                    :class="{ active: selectedUser.userId == data.userId }"
                  >
                    <a href="javascript: void(0);">
                      <div class="d-flex">
                        <div
                          class="align-self-center me-3"
                          v-if="
                            data.userIcon &&
                            !avatarLoadErrorList.includes(data.userIcon)
                          "
                        >
                          <img
                            :src="`/ipdoc${data.userIcon}`"
                            class="rounded-circle avatar-xs"
                            @error="handleAvatarError(data.userIcon)"
                          />
                        </div>
                        <div
                          class="avatar-xs align-self-center me-3"
                          v-if="
                            !data.userIcon ||
                            avatarLoadErrorList.includes(data.userIcon)
                          "
                        >
                          <span
                            class="avatar-title rounded-circle bg-soft bg-primary text-primary"
                            >{{ data.fullname?.charAt(0) }}</span
                          >
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                          <h5
                            class="text-truncate font-size-14 mb-1 font-weight-semibold"
                            style="line-height: 32px"
                          >
                            {{ data.fullname }}
                          </h5>
                          <!-- <p class="text-truncate mb-0">
                            {{ data.message }}
                          </p> -->
                        </div>
                        <div
                          class="font-size-14"
                          style="line-height: 32px"
                        >
                          {{ data.tripDays + "天" }}
                        </div>
                      </div>
                    </a>
                  </li>
                </ul>
              </SimpleBar>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-grow-1">
        <div class="card mb-0">
          <div class="card-body" :class="viewMode === 'table' ? '' : 'pt-0'" :style="noLayoutStyle">
            <!-- 视图切换按钮和工具栏 -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex" style="gap: 10px">
                <el-button-group v-if="viewMode === 'table'">
                  <el-button @click="toggleViewMode">日历视图</el-button>
                  <el-button type="primary">列表视图</el-button>
                </el-button-group>
                <el-button 
                  type="primary" 
                  @click="drawerStatus = true"
                  v-if="viewMode === 'table'"
                >
                  <i class="bx bx-edit-alt font-size-16 align-middle me-2"></i>
                  出差报备创建
                </el-button>
                <el-input
                  v-if="viewMode === 'table'"
                  v-model="diminput"
                  style="width: 200px"
                  placeholder="搜索..."
                  clearable
                  @keyup.enter="fuzzySearch"
                  class="top-search"
                >
                  <template #prepend>
                    <el-button @click="fuzzySearch">
                      <i class="bx bx-search-alt"></i>
                    </el-button>
                  </template>
                </el-input>
                <ListSearch
                  v-if="viewMode === 'table'"
                  name="businesstriplist"
                  :buss-id="63"
                  :is-show="true"
                  @search="handleSearch"
                  ref="searchRef"
                >
                </ListSearch>
                <el-button
                  v-if="viewMode === 'table'"
                  variant="soft-primary"
                  @click="exportData"
                >
                  <i class="bx bx-export align-middle me-2"></i>
                  导出
                </el-button>
              </div>
              <div class="flex-shrink-0" v-if="viewMode === 'table'">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    keywords: diminput,
                  }"
                >
                </TopListTool>
              </div>
            </div>

            <!-- 日历视图 -->
            <div class="app-calendar" v-if="viewMode === 'calendar'">
              <FullCalendar
                ref="fullCalendar"
                :options="calendarOptions"
              ></FullCalendar>
            </div>

            <!-- 表格列表视图 -->
            <div v-if="viewMode === 'table'">
              <GridView
                :gridName="gridName"
                :bussId="bussId"
                :height="calculateGridHeight()"
                :rowHeight="rowHeight"
                :activeClass="activeClass"
                :columnDefs="columnList"
                :grid-data="btList"
                :rowClick="viewDetail"
              />
              <div class="" v-if="total > 0" style="padding-top: 10px">
                <Pagination
                  :total="total"
                  v-model:page="listQuery.pageNo"
                  v-model:limit="listQuery.pageSize"
                  @pagination="fetchBtList"
                  :pageSizes="pageSizesList"
                ></Pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-drawer
      v-model="drawerStatus"
      :modal="false"
      size="50%"
      @close="resetData"
    >
      <ViewDetail
        v-if="readonly"
        :appData="appData"
      />
      <el-form
        v-else
        :model="appData"
        label-width="auto"
        :rules="rules"
        ref="appForm"
      >
        <div
          class="row"
          v-if="appData.btId"
        >
          <div class="col-md-6">
            <el-form-item label="申请人:">
              <div class="item-content">
                {{ userName }}
              </div>
            </el-form-item>
          </div>
          <div class="col-md-6">
            <el-form-item label="申请时间:">
              <div class="item-content">
                {{ dayjs(appData.createDate).format("YYYY-MM-DD HH:mm:ss") }}
              </div>
            </el-form-item>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <el-form-item
              label="出差类型:"
              prop="tripType"
            >
              <el-select
                v-model="appData.tripType"
                placeholder="请选择"
                @change="changeTripType"
              >
                <el-option
                  v-for="item in tripTypeList"
                  :key="item.id"
                  :label="item.typeName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </div>
          <div
            class="col-md-6"
            v-if="appData.tripType == 2162"
          >
            <el-form-item
              label="会议名称:"
              prop="meetingName"
            >
              <el-input
                v-model="appData.meetingName"
                placeholder="请输入"
              />
            </el-form-item>
          </div>
          <div
            class="col-md-6"
            v-if="appData.tripType == 2163"
          >
            <el-form-item label="客户名称" prop="custIdStr">
              <el-popover
                placement="bottom"
                width="600"
                trigger="click"
                :visible="custVisible"
              >
                <template #reference>
                  <el-input
                    placeholder="请输入客户名称"
                    v-model="appData.custIdStr"
                    @input="(v) => debounce((v) => remoteQueryCust(v), 500)(v)"
                    @focus="custVisible = true"
                    @blur="() => custBlur()"
                  ></el-input>
                </template>
                <el-table
                  :data="custList"
                  @cell-click="changeCust"
                  :row-style="{ height: '30px' }"
                  :max-height="300"
                  :header-cell-style="{
                    borderColor: '#cacaca',
                    color: '#666',
                    'font-size': '14px',
                    'text-align': 'center',
                    height: '30px',
                    padding: '0',
                    'background-color': '#f9f9f9',
                    'font-weight': '400',
                  }"
                  :cell-style="{
                    borderColor: '#cacaca',
                    'text-align': 'center',
                    padding: '0',
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                  }"
                  highlight-current-row
                  style="width: 100%; border-color: #cacaca"
                  border
                  :show-overflow-tooltip="true"
                >
                  <el-table-column
                    prop="fullname"
                    label="全称"
                    width="170"
                  >
                  </el-table-column>
                  <el-table-column
                    prop="name"
                    label="简称"
                    width="170"
                  ></el-table-column>
                  <el-table-column
                    prop="status"
                    label="状态"
                    width="174"
                  >
                    <template #default="scope">
                      <span>
                        {{
                          scope.row.status
                            ? scope.row.status
                            : scope.row.custId
                            ? "已存在"
                            : "不存在"
                        }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-popover>
              <div
                v-show="noMatch"
                style="
                  font-size: 12px !important;
                  color: #e6a23c;
                  height: 16px;
                  line-height: 16px;
                "
              >
                客户不存在，将创建新客户
              </div>
              <!-- <div
              v-show="shouldShowPopover"
              style="
                font-size: 12px !important;
                color: #e6a23c;
                height: 16px;
                line-height: 16px;
              "
            >
              请选择客户
            </div> -->
            </el-form-item>
          </div>
        </div>
        <el-form-item
          label="出差事由:"
          prop="tripReason"
          v-if="appData.tripType == 2164"
        >
          <el-input
            v-model="appData.tripReason"
            type="textarea"
            placeholder="请输入"
            :autosize="{ minRows: 2 }"
          />
        </el-form-item>
        <el-form-item
          label="交通工具"
          prop="transport"
        >
          <el-radio-group v-model="appData.transport">
            <el-radio value="飞机">飞机</el-radio>
            <el-radio value="火车">火车</el-radio>
            <el-radio value="汽车">汽车</el-radio>
            <el-radio value="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="row">
          <div class="col-md-6">
            <el-form-item
              label="单程往返"
              prop="tripWay"
            >
              <el-radio-group v-model="appData.tripWay">
                <el-radio value="单程">单程</el-radio>
                <el-radio value="往返">往返</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="col-md-6">
            <el-form-item
              label="同行人"
              prop="companions"
            >
              <el-select
                v-model="appData.companions"
                placeholder="请选择"
                multiple
                filterable
              >
                <el-option
                  v-for="item in userList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <el-form-item
              label="出发城市"
              prop="departureCity"
            >
              <el-input
                v-model="appData.departureCity"
                placeholder="请输入"
              />
            </el-form-item>
          </div>
          <div class="col-md-6">
            <el-form-item
              label="目的城市"
              prop="destinationCity"
            >
              <el-input
                v-model="appData.destinationCity"
                placeholder="请输入"
              />
            </el-form-item>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <el-form-item
              label="开始时间"
              prop="startDate"
            >
              <el-date-picker
                v-model="appData.startDate"
                type="datetime"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm"
                format="YYYY-MM-DD HH:mm"
                placeholder="年-月-日 时:分"
                :disabledDate="disabledStartDate"
                :default-time="defaultStartTime"
              />
            </el-form-item>
          </div>
          <div class="col-md-6">
            <el-form-item
              label="结束时间"
              prop="endDate"
            >
              <el-date-picker
                v-model="appData.endDate"
                type="datetime"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm"
                format="YYYY-MM-DD HH:mm"
                placeholder="年-月-日 时:分"
                :disabledDate="disabledEndDate"
                :default-time="defaultEndTime"
              />
            </el-form-item>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <el-form-item
              label="出差天数"
              prop="tripDays"
            >
              {{ appData.tripDays || 0 }} 天
            </el-form-item>
          </div>
        </div>
        <el-form-item
          label="出差备注"
          prop="remarks"
        >
          <el-input
            v-model="appData.remarks"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
      <template #header>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <span
            v-if="appData.btId"
            style="font-size: 16px"
            class="gap-3 d-flex"
            >出差申请
            <!-- <span v-if="appData.wfStatus" class="d-flex align-items-center">
              <el-tag
                type="primary"
                v-if="appData.wfStatus == '待提交'"
                >{{ appData.wfStatus }}</el-tag
              >
              <el-tag
                type="warning"
                v-if="appData.wfStatus == '待审核'"
                >{{ appData.wfStatus }}</el-tag
              >
              <el-tag
                type="danger"
                v-if="appData.wfStatus == '审核退回'"
                >{{ appData.wfStatus }}</el-tag
              >
              <el-tag
                type="success"
                v-if="appData.wfStatus == '已完成'"
                >{{ appData.wfStatus }}</el-tag
              >
              <el-popover
                v-if="(appData.wfStatus == '审核退回' || appData.wfStatus == '已完成') && appData.btId"
                placement="bottom"
                :width="300"
                trigger="hover"
              >
                <template #reference>
                  <span style="display: flex; align-items: center; margin-left: 8px; cursor: pointer; color: #556ee6; vertical-align: middle;">
                    <el-icon :size="16">
                      <InfoFilled />
                    </el-icon>
                  </span>
                </template>
                <div>
                  <div style="margin-bottom: 12px; word-break: break-all;">{{ appData.auditComment || '暂无审核意见' }}</div>
                </div>
              </el-popover>
            </span> -->
          </span>
          <span
            v-else
            style="font-size: 16px"
            >出差申请-
            <span>
              <span> 新增 </span>
            </span>
          </span>
          <div v-if="editable">
            <el-button
              size="small"
              link
              style="color: #909399"
              @click="deleteEvent"
              ><Delete style="width: 14px; height: 14px" />删除</el-button
            >
            <el-button
              link
              size="small"
              @click="readonly = false"
              style="color: #556ee6"
              v-if="readonly"
              ><Edit style="width: 14px; height: 14px" />编辑</el-button
            >
            <el-button
              link
              size="small"
              style="color: #909399"
              @click="readonly = true"
              v-else
              >取消</el-button
            >
          </div>
        </div>
      </template>
      <template #footer>
        <div class="d-flex gap-2 justify-content-end">
          <div
            style="flex: auto"
            v-if="!readonly"
          >
            <el-button
              type="primary"
              @click="confirmClick('save')"
              >保存</el-button
            >
            <el-button
              type="success"
              :loading="submitLoading"
              v-if="appData.wfStatus == '待提交' || appData.wfStatus == '审核退回' || !appData.btId"
              @click="confirmClick('submit')"
              >提交</el-button
            >
          </div>
          <div
            style="flex: auto"
            v-if="auditable"
          >
            <el-button
              type="info"
              :loading="rejectLoading"
              @click="auditHandle(0)"
              plain
              >退回</el-button
            >
            <el-button
              type="primary"
              :loading="passLoading"
              @click="auditHandle(1)"
              >通过</el-button
            >
          </div>
        </div>
      </template>
    </el-drawer>

    <el-dialog
      v-model="auditDialogVisible"
      :title="currentAuditType === 1 ? '审核通过' : '审核退回'"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="审核意见">
          <el-input
            v-model="auditComment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见（非必填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitAudit"
            :loading="currentAuditType === 1 ? passLoading : rejectLoading"
          >
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </Layout>
</template>

<style scoped>
.chat-list .active a {
  background-color: #556ee61a !important;
}
</style>
<style>
.fc-toolbar {
  margin: 0 !important;
}
.fc-view {
  margin-top: 16px;
}
.fc-event {
  cursor: pointer !important;
}
.item-content {
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 0 10px;
  width: 100%;
  min-height: 32px;
}
.fc .fc-list-empty {
  background-color: inherit;
}
.fc .fc-list-event:hover td{
  background-color: inherit !important;
}

/* 自定义列表视图样式 */
.fc-list-event td {
  padding: 8px 14px !important;
}

.fc-list-event-title {
  font-size: 14px;
}

.fc-list-event-title .text-muted {
  color: #6c757d !important;
  font-size: 12px;
  margin-top: 4px;
}

.font-weight-semibold {
  font-weight: 600;
}

.gap-2 {
  gap: 0.5rem;
}

/* 隐藏列表视图中的状态点 */
.fc .fc-list-event-graphic {
  display: none !important;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  margin-left: 8px;
  font-size: 12px;
  font-weight: normal;
  width: 64px;
}

/* 确保状态标���垂直对齐 */
.font-weight-semibold {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 列表事件内容布局 */
.list-event-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
}

/* 事件标题样式 */
.event-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;  /* 水平居中 */
}

/* 状态标签样式 */
.status-tag {
  margin-left: auto;  /* 推到最右侧 */
  padding-left: 16px;
  font-size: 12px;
  white-space: nowrap;
}

/* 移除列表视图中的状态点 */
.fc .fc-list-event-graphic {
  display: none !important;
}

/* 调整列表项内容布局 */
.fc .fc-list-event td {
  padding: 0 14px !important;
  vertical-align: middle;
}

.fc .fc-listViewButton-button {
  background-color: #f8f9fa !important;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
}

.fc .fc-listViewButton-button:hover {
  background-color: #f5f7fa !important;
  border-color: rgb(197.7,225.9,255) !important;
  color: #556EE6 !important;
}

.fc .fc-listViewButton-button:focus {
  /* box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25) !important; */
}
</style>
