<script>
import {
  queryWorkHourTask,
  queryWorkHours,
  auditWorkHours,
  queryWorkType,
  getCaseHistory,
  queryRecentCase,
  queryList,
  querySimilarCustomer,
  queryRecentMeeting,
} from "@/api/caseList";
import { queryCustomerContactByCustIdUrl } from "@/api/caseDetail";
import { queryCustomerContactListUrl } from "@/api/customerList";
import GridView from "@/components/common/grid-table/index.vue";
import {
  formatAmount,
  getProgID,
  viewPdf,
  extractTree,
  unique,
  downLoadAll,
} from "@/utils";
import TimerInput from "@/components/common/timer-input";
import Pagination from "@/components/common/pagination/index.vue";
import { getUserInfo } from "@/utils/user";
import { userComputed } from "@/state/helpers";

export default {
  props: {
    tableHeight: {
      type: Number,
    },
  },
  components: {
    GridView,
    TimerInput,
    Pagination,
  },
  data() {
    return {
      columnList: [
        {
          title: "客户",
          value: "custName",
          rowGroup: true,
          enableRowGroup: true,
        },
        {
          title: "案件文号",
          value: "agentNum",
          rowGroup: true,
          enableRowGroup: true,
        },
        {
          title: "案件名称",
          value: "caseName",
        },
        {
          title: "案件类型",
          value: "caseType",
        },
        {
          title: "员工",
          value: "whUserName",
        },
        {
          title: "工时日期",
          value: "hourDate",
        },
        {
          title: "操作",
          value: "operate",
        },
      ],
      sjColumns: [
        { title: "领域", value: "domain", width: 100 },
        {
          title: "商机描述",
          value: "sjdesc",
        },
      ],
      gridData: [],
      showApproval: false,
      approvalInfo: {},
      fileList: [],
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
      isLoading: false,
      workTypeList: [],
      activityKinds: [],
      defaultParams: {
        value: "workType",
        label: "workTypeName",
        children: "childrens",
      },
      agentVisible: false,
      agentList: [],
      caseTableLoading: false,
      menuItems: [
        { label: "最近记录工时", value: 1 },
        { label: "最近立案", value: 2 },
        { label: "最近处理", value: 3 },
      ],
      custContactList: [], //客户联系人
      ruleId: 1,
      custVisible: false,
      timer: null,
      custList: [],
      noMatch: false,
      customerContacts: [],
      caseNameShow: false,
      nameCaseLists: [],
      recentMeetingList: [],
    };
  },
  computed: {
    ...userComputed,
    computedDesc() {
      return (
        (this.approvalInfo.workType &&
          this.activityKinds.length &&
          this.extractTree(this.activityKinds, "childrens", [
            "workType",
            "workTypeName",
            "memo",
          ]).find((item) => item.workType === this.approvalInfo.workType) &&
          this.extractTree(this.activityKinds, "childrens", [
            "workType",
            "workTypeName",
            "memo",
          ]).find((item) => item.workType === this.approvalInfo.workType)
            .memo) ||
        ""
      );
    },
    isown() {
      return getUserInfo()?.userId == this.approvalInfo.userId;
    },
  },
  watch: {
    // "approvalInfo.workType": {
    //   handler() {
    //     this.approvalInfo.innerUserList = undefined;
    //     this.approvalInfo.baifangType = undefined;
    //     this.approvalInfo.innerUserList = undefined;
    //     this.approvalInfo.meId = undefined;
    //     this.approvalInfo.bussDomainList = undefined;
    //     this.approvalInfo.custmemo = undefined;
    //     this.approvalInfo.noCaseAuditUserId = undefined;
    //   },
    // },
    showApproval: {
      handler(value) {
        if (value) {
          const element = document.querySelector(".content-body");
          element.addEventListener("scroll", function () {});
        }
      },
    },
    custRequre() {
      return (
        this.approvalInfo.workType &&
        this.activityKinds.length &&
        this.extractTree(this.activityKinds, "childrens", [
          "workType",
          "workTypeName",
          "hdFlag",
        ]).find((item) => item.workType === this.approvalInfo.workType) &&
        this.extractTree(this.activityKinds, "childrens", [
          "workType",
          "workTypeName",
          "hdFlag",
        ]).find((item) => item.workType === this.approvalInfo.workType)
          .hdFlag == 9
      );
    },
  },
  methods: {
    extractTree,
    formatAmount,
    unique,
    downLoadAll,
    fetchLocalPageSize() {
      const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
      const routeName = 'workTimeMatter';
      const savedData = pageSizeData.find(item => item.name === routeName);
      if (savedData) {
        return savedData.pageSize
      }else {
        return 10
      }
    },
    custBlur() {
      this.custVisible = false;
      this.noMatch = false;
      setTimeout(() => {
        if (!this.approvalInfo.custId && this.approvalInfo.custName) {
          const title =
            this.custList.length > 1 ? "已存在相似客户" : "该客户不存在";
          this.$confirm(`${title}，是否创建新客户`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.noMatch = true;
              this.approvalInfo.fullname = this.approvalInfo.custName;
              this.approvalInfo.custIntroductor = this.$store.getters.name;
            })
            .catch(() => {
              this.approvalInfo.custName = null;
              this.noMatch = false;
            });
        }
      }, 500);
    },
    changeCust(custInfo) {
      this.approvalInfo.fullname = undefined;
      this.approvalInfo.custIntroductor = undefined;
      this.approvalInfo.custId = custInfo.custId;
      this.approvalInfo.custName = custInfo.fullname;
      queryCustomerContactByCustIdUrl({
        custId: custInfo.custId,
      }).then((res) => {
        this.$nextTick(() => {
          this.customerContacts = res.data.customerContacts
            .filter((item) => item.name)
            .map((item) => ({
              value: item.name,
              email: item.email,
            }));
        });
      });
    },
    fetchRecentMeetingList(val) {
      queryRecentMeeting({ title: val }).then((res) => {
        this.recentMeetingList = res.data || [];
      });
    },
    passWorkTime() {
      if (
        this.custRequre &&
        !this.approvalInfo.custId &&
        !this.approvalInfo.fullname
      ) {
        this.$message.error("请填写客户名称！");
        return;
      }
      if (!this.approvalInfo.hourDate) {
        this.$message.error("请填写工时日期！");
        return;
      }
      if (!this.approvalInfo.time || this.approvalInfo.time == "00:00") {
        this.$message.error("请填写工作时长！");
        return;
      }
      if (this.approvalInfo.fullname) {
        this.approvalInfo.custId = undefined;
        this.approvalInfo.custIntroductor = this.name;
      }
      if (!(this.approvalInfo.agentNum || this.approvalInfo.workType)) {
        this.$message.error("请填写案件文号或活动类型！");
        return;
      }
      const dateData = {
        hourDate: this.approvalInfo.hourDate,
        beginDate: this.approvalInfo.beginDate,
        endDate: this.approvalInfo.endDate,
      };
      if (dateData.beginDate) {
        dateData.beginDate = dateData.hourDate + " " + dateData.beginDate;
        dateData.beginDate = dateData.beginDate.replace(/\//g, "-");
      }
      if (dateData.endDate) {
        dateData.endDate = dateData.hourDate + " " + dateData.endDate;
        dateData.endDate = dateData.endDate.replace(/\//g, "-");
      }
      if (
        this.approvalInfo.custContactList &&
        this.approvalInfo.custContactList.length
      ) {
        this.approvalInfo.custContactList = this.custContactList
          .filter((item) =>
            this.approvalInfo.custContactList.includes(item.custContactId)
          )
          .map((item) => ({
            custContactId:
              typeof item.custContactId === "number"
                ? item.custContactId
                : undefined,
            name: item.name,
            email: item.email,
          }));
      }
      if (this.approvalInfo.innerUserList && this.approvalInfo.innerUserList.length) {
        this.approvalInfo.innerUserList = this.userList.filter((item) =>
          this.approvalInfo.innerUserList.includes(item.userId)
        );
      }
      auditWorkHours({
        workHoursList: [{ ...this.approvalInfo, ...dateData }],
        result: 1,
      }).then(() => {
        this.$message.success("审核成功！");
        this.showApproval = false;
        this.fetchTaskData();
        // this.$emit("getsum");
      });
    },
    disabledDate(time) {
      return (
        time.getTime() > Date.now() ||
        time.getTime() < Date.now() - 6 * 24 * 60 * 60 * 1000
      );
    },
    fetchAgentList() {
      queryRecentCase({ ruleId: this.ruleId }).then((res) => {
        this.agentList = res.data;
        this.nameCaseLists = res.data;
      });
    },
    remoteQueryCust(v) {
      this.remotepaternalUnit(v, () => {}, "客户");
    },
    remotepaternalUnit(query, cb, type) {
      if (!query && type === "客户") {
        this.approvalInfo.fullname = undefined;
        this.approvalInfo.custIntroductor = undefined;
        this.approvalInfo.custId = undefined;
        this.approvalInfo.custName = undefined;
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
                fullname: item.custName,
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
    handleCommand(val) {
      this.ruleId = val;
      queryRecentCase({ ruleId: this.ruleId }).then((res) => {
        this.agentList = res.data;
      });
    },
    clickCaseInfo(row) {
      this.approvalInfo.agentNum = row.agentNum;
      this.approvalInfo.caseId = row.caseId;
      this.approvalInfo.caseName = row.caseName;
      this.approvalInfo.custId = row.custId;
      this.approvalInfo.custName = row.custName || row.name;
      this.remotepaternalUnit(row.custName || row.name, () => {});
    },
    searchCaseByAgent(value) {
      if (!value) {
        return;
      }
      this.fetchCaseList(value, "agent");
    },
    fetchCaseList(keyWord, type) {
      this.caseTableLoading = true;
      getCaseHistory({
        businessList: [2, 3, 4, 5, 6, 11, 23],
        pageNo: 1,
        pageSize: 100,
        keyWord,
      }).then((res) => {
        if (res.data && res.data.length == 1) {
          this.approvalInfo.agentNum = res.data[0].agentNum;
          this.approvalInfo.caseName = res.data[0].caseName;
          this.approvalInfo.custId = res.data[0].custId;
          this.approvalInfo.custName = res.data[0].custName;
          this.approvalInfo.caseId = res.data[0].caseId;
          this.approvalInfo.wkgId = res.data[0].wkgId;
        }
        if (type == "agent") {
          this.agentList = res.data;
        } else {
          this.nameCaseLists = res.data;
        }
        this.caseTableLoading = false;
      });
    },
    searchCaseByCaseName(value) {
      let keyWord = value || "";
      if (!keyWord) {
        return;
      }
      this.fetchCaseList(keyWord, "caseName");
    },
    fetchWorkType() {
      queryWorkType().then((res) => {
        this.activityKinds = res.data;
      });
    },
    remoteCustContactMethod(val) {
      if (!val || !this.approvalInfo.custId) return;
      this.custContactList = [];
      if (
        this.approvalInfo.custContactList.filter(
          (item) => typeof item === "number"
        ).length
      ) {
        queryCustomerContactListUrl({
          custId: this.approvalInfo.custId,
          customerContactIds: this.approvalInfo.custContactList
            .filter((item) => typeof item === "number")
            .join(","),
          isCustomer: "1",
          pageSize: 50,
        }).then((res1) => {
          this.custContactList = res1.data.map((item) => ({
            custContactId: item.custContactId,
            name: item.name,
            email: item.email,
            value2: "已存在",
          }));
          if (
            this.approvalInfo.custContactList.filter(
              (item) => typeof item === "string"
            ).length
          ) {
            this.custContactList = this.custContactList.concat(
              this.approvalInfo.custContactList
                .filter((item) => typeof item === "string")
                .map((item) => ({
                  custContactId: item,
                  name: item,
                  email: "",
                  value2: "不存在",
                }))
            );
          }

          queryCustomerContactListUrl({
            custId: this.approvalInfo.custId,
            name: val,
            isCustomer: "1",
            pageSize: 50,
          }).then((res2) => {
            if (res2.data && res2.data.length) {
              this.custContactList = this.unique(
                this.custContactList.concat(
                  res2.data.map((item) => ({
                    custContactId: item.custContactId,
                    name: item.name,
                    email: item.email,
                    value2: "已存在",
                  }))
                ),
                "custContactId"
              );
            } else {
              this.custContactList = this.unique(
                this.custContactList.concat([
                  {
                    custContactId: val,
                    name: val,
                    email: "",
                    value2: "不存在",
                  },
                ]),
                "custContactId"
              );
            }
          });
        });
      } else {
        queryCustomerContactListUrl({
          custId: this.approvalInfo.custId,
          name: val,
          isCustomer: "1",
          pageSize: 50,
        }).then((res2) => {
          if (res2.data && res2.data.length) {
            this.custContactList = this.unique(
              this.custContactList.concat(
                res2.data.map((item) => ({
                  custContactId: item.custContactId,
                  name: item.name,
                  email: item.email,
                  value2: "已存在",
                }))
              ),
              "custContactId"
            );
          } else {
            this.custContactList = this.unique(
              this.custContactList.concat([
                {
                  custContactId: val,
                  name: val,
                  email: "",
                  value2: "不存在",
                },
              ]),
              "custContactId"
            );
          }
        });
      }
    },
    changeWorkType(value) {
      if (value && value.length) {
        this.approvalInfo.workType = value[value.length - 1];
      } else {
        this.approvalInfo.workType = undefined;
      }
      this.approvalInfo.agentNum = undefined;
      this.approvalInfo.caseName = undefined;
      this.approvalInfo.caseId = undefined;
    },
    changeAppTime(value) {
      this.approvalInfo.approvedTime = value;
    },
    beginTimeChange(value) {
      this.approvalInfo.beginDate = value;
      if (this.approvalInfo.endDate) {
        let beginHour = +this.approvalInfo.beginDate.split(":")[0] || 0;
        let beginMinite = +this.approvalInfo.beginDate.split(":")[1] || 0;
        let endHour = +this.approvalInfo.endDate.split(":")[0] || 0;
        let endMinite = +this.approvalInfo.endDate.split(":")[1] || 0;
        if (endHour - beginHour < 0) {
          this.approvalInfo.time = "";
          return;
        }
        if (endMinite - beginMinite < 0) {
          endMinite += 60;
          endHour--;
          if (endHour < 0) {
            this.approvalInfo.time = "";
            return;
          }
        }
        this.approvalInfo.time =
          this.add0(endHour - beginHour) +
          ":" +
          this.add0(endMinite - beginMinite);
      }
    },
    add0(m) {
      return m < 10 ? "0" + m : m;
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
    endTimeChange(value) {
      this.approvalInfo.endDate = value;
      if (this.approvalInfo.beginDate) {
        let beginHour = +this.approvalInfo.beginDate.split(":")[0] || 0;
        let beginMinite = +this.approvalInfo.beginDate.split(":")[1] || 0;
        let endHour = +this.approvalInfo.endDate.split(":")[0] || 0;
        let endMinite = +this.approvalInfo.endDate.split(":")[1] || 0;
        if (endHour - beginHour < 0) {
          this.approvalInfo.time = "";
          return;
        }
        if (endMinite - beginMinite < 0) {
          endMinite += 60;
          endHour--;
          if (endHour < 0) {
            this.approvalInfo.time = "";
            return;
          }
        }
        this.approvalInfo.time =
          this.add0(endHour - beginHour) +
          ":" +
          this.add0(endMinite - beginMinite);
      }
    },
    timeChange(value) {
      this.approvalInfo.time = value;
    },
    ChangeStrToMinutes(str) {
      if (str) {
        let arrminutes = str.split(":");
        if (arrminutes.length == 2) {
          let minutes = parseInt(arrminutes[0]) * 60 + parseInt(arrminutes[1]);
          return minutes;
        } else {
          return 0;
        }
      }
    },
    fetchAppravalInfo(hoursId) {
      const params = { hoursId };
      queryWorkHours(params).then((res) => {
        const workhoursInfo = res.data?.workhoursList[0] || {};
        this.approvalInfo = workhoursInfo;
        this.approvalInfo.approvedTime = this.approvalInfo.time;
        this.approvalInfo.approvedDesc = this.approvalInfo.workContent;
        this.approvalInfo.billRate = this.approvalInfo.criterionRate;
        this.approvalInfo.approvedAmountCust = this.approvalInfo.amount;
        if (this.approvalInfo.beginDate) {
          this.approvalInfo.beginDate = this.approvalInfo.beginDate
            .split(" ")[1]
            .substring(0, 5);
        }
        if (this.approvalInfo.endDate) {
          this.approvalInfo.endDate = this.approvalInfo.endDate
            .split(" ")[1]
            .substring(0, 5);
        }
        if (this.approvalInfo.workType) {
          if (
            this.activityKinds.find((item) =>
              item.childrens.find(
                (i) => i.workType == this.approvalInfo.workType
              )
            )
          ) {
            this.workTypeList = [
              this.activityKinds.find((item) =>
                item.childrens.find(
                  (i) => i.workType == this.approvalInfo.workType
                )
              ).workType,
              this.approvalInfo.workType,
            ];
          }
        } else {
          this.workTypeList = [];
          this.approvalInfo.workType = "";
        }
        if (
          this.approvalInfo.materialList &&
          this.approvalInfo.materialList?.length > 0
        ) {
          this.fileList = this.approvalInfo.materialList.map((item) => ({
            name: item.materialName,
            materialId: item.materialId,
            address: item.address,
          }));
        } else {
          this.fileList = [];
        }
        if (
          this.approvalInfo.innerUserList &&
          this.approvalInfo.innerUserList.length
        ) {
          this.approvalInfo.innerUserList = this.approvalInfo.innerUserList.map(
            (item) => item.userId
          );
        }
        if (
          this.approvalInfo.custContactList &&
          this.approvalInfo.custContactList.length
        ) {
          this.custContactList = workhoursInfo.custContactList.map((item) => ({
            custContactId: item.custContactId,
            name: item.name,
            email: item.email,
            value2: "已存在",
          }));
          this.approvalInfo.custContactList = workhoursInfo.custContactList.map(
            (item) => item.custContactId
          );
        }
      });
    },
    onPreview(data) {
      let url = data.address;
      if (
        getProgID(url) ||
        ["eml", "msg"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
      ) {
        if (
          ["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
        ) {
          viewPdf(`${url}`);
        } else {
          let flag = "";
          if (data.mailId) {
            flag = "mailId";
          } else if (data.materialId) {
            flag = "materialId";
          }
          url = url.replace(/&/g, "%26");
          window.open(
            `#/preView?address=/ipdoc${url}&${flag}=${data[flag]}`.replace(
              /[+]/g,
              "%2B"
            )
          );
        }
      } else if (
        ["pdf", "jpg", "png"].some(
          (item) => url.replace(/.+\./, "").toLocaleLowerCase() == item
        )
      ) {
        window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
      } else {
        this.downLoad(data);
      }
    },
    downLoad(data) {
      const url = data.address || data.url;
      const downData = {
        url: `/ipdoc${url}`,
        success() {},
      };
      if (data.mailId) {
        downData.downLoad = data.materialName;
      }
      this.downLoadAll(downData);
    },
    closeApprovalModal() {
      this.showApproval = false;
      this.approvalInfo = {};
    },
    fetchTaskData() {
      this.isLoading = true;
      const data = {
        ...this.listQuery,
      };
      queryWorkHourTask(data, { isLoading: false })
        .then((res) => {
          this.gridData = res.data || [];
          this.total = res.total || 0;
          this.isLoading = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    cellRenderer(params) {
      if (params.colDef.field == "operate" && params.data) {
        const clikView = (hoursId) => {
          this.fetchAppravalInfo(hoursId);
          this.fetchRecentMeetingList();
          this.showApproval = true;
        };
        window.clikView = clikView;
        const operateRender = `<button class="btn btn-soft-primary btn-sm btn-rounded" onclick='clikView(${params.data?.hoursId})'>处理</button>`;
        return operateRender;
      }
      return `<span title="${params.value}">${
        params.value || params.value === 0 ? params.value : ""
      }</span>`;
    },
  },
  created() {
    this.listQuery.pageSize = this.fetchLocalPageSize();
    this.fetchTaskData();
    this.fetchWorkType();
    this.fetchAgentList();
  },
};
</script>
<template>
  <GridView
    gridName="workTimeMatter"
    :height="tableHeight"
    :rowHeight="40"
    :columnDefs="columnList"
    :gridData="gridData"
    :cellRenderer="cellRenderer"
    rowSelection="singleRow"
    :isLoading="isLoading"
    :autoGroupColumnDef="true"
  />
  <div
    class="mt-3"
    v-if="total"
  >
    <Pagination
      :total="total"
      v-model:page="listQuery.pageNo"
      v-model:limit="listQuery.pageSize"
      @pagination="fetchTaskData"
      :pageSizes="pageSizesList"
      storageName="workTimeMatter"
    ></Pagination>
  </div>
  <b-modal
    title="工时审核"
    v-model="showApproval"
    hide-footer
    centered
    size="lg"
    @close="closeApprovalModal"
    body-class="work-time-modal"
  >
    <div class="content-body p-3">
      <div class="table-responsive">
        <table
          class="table mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 15%">活动类型 :</th>
              <!-- <td style="width: 35%">{{ approvalInfo.workTypeName }}</td> -->
              <td style="width: 35%">
                <el-cascader
                  clearable
                  filterable
                  :show-all-levels="false"
                  v-model="workTypeList"
                  :options="activityKinds"
                  :props="defaultParams"
                  placeholder="请选择"
                  @change="changeWorkType"
                  :style="{
                    width: computedDesc ? '84%' : '100%',
                    'margin-right': computedDesc ? '12px' : 0,
                  }"
                ></el-cascader>
                <el-tooltip
                  v-if="computedDesc"
                  class="item-settings"
                  effect="light"
                  :content="computedDesc"
                  placement="top"
                >
                  <i
                    class="dripicons-information"
                    style="
                      font-size: 18px;
                      border: none;
                      cursor: pointer;
                      vertical-align: middle;
                    "
                  ></i>
                </el-tooltip>
              </td>
              <th style="width: 15%">客户名称 :</th>
              <td v-if="isown">
                <el-popover
                  placement="bottom-start"
                  width="600"
                  trigger="click"
                  :visible="custVisible"
                >
                  <template #reference>
                    <el-input
                      placeholder="请输入客户名称"
                      v-model="approvalInfo.custName"
                      @input="
                        (v) => debounce((v) => remoteQueryCust(v), 500)(v)
                      "
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
              </td>
              <td
                v-else
                style="width: 35%"
              >
                {{ approvalInfo.custName }}
              </td>
            </tr>
            <tr v-if="!approvalInfo.workType">
              <th>案件文号 :</th>
              <td>
                <el-popover
                  placement="bottom-start"
                  width="600"
                  trigger="click"
                  :visible="agentVisible"
                >
                  <template #reference>
                    <el-input
                      placeholder="请输入案号"
                      v-model="approvalInfo.agentNum"
                      style="width: 84%; margin-right: 12px"
                      @input="
                        (v) => debounce((v) => searchCaseByAgent(v), 500)(v)
                      "
                      @focus="agentVisible = true"
                      @blur="agentVisible = false"
                    ></el-input>
                  </template>
                  <el-table
                    :data="agentList"
                    @cell-click="clickCaseInfo"
                    :row-style="{ height: '30px' }"
                    :max-height="300"
                    v-loading="caseTableLoading"
                    element-loading-text="加载中"
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
                      prop="agentNum"
                      label="案件文号"
                      width="170"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="caseName"
                      label="案件名称"
                      width="170"
                    ></el-table-column>
                    <el-table-column
                      prop="name"
                      label="客户"
                      width="174"
                    >
                      <template #default="scope">
                        <span>{{
                          scope.row.name ? scope.row.name : scope.row.custName
                        }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-popover>

                <el-tooltip
                  class="item-settings"
                  effect="light"
                  content="案件推荐规则"
                  placement="top"
                >
                  <el-dropdown
                    @command="
                      (command) => {
                        handleCommand(command);
                      }
                    "
                    trigger="click"
                  >
                    <i
                      class="bx bx-cog"
                      style="font-size: 22px; border: none; margin-top: 4px"
                    ></i>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="item in menuItems"
                          :key="item.value"
                          :command="item.value"
                          :class="{ 'is-active': item.value == ruleId }"
                          >{{ item.label }}</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-tooltip>
              </td>
              <th>案件名称 :</th>
              <td v-if="isown">
                <el-popover
                  placement="bottom-start"
                  width="600"
                  trigger="click"
                  :visible="caseNameShow"
                >
                  <template #reference>
                    <el-input
                      placeholder="请输入案件名称"
                      v-model="approvalInfo.caseName"
                      @input="
                        (v) => debounce((v) => searchCaseByCaseName(v), 500)(v)
                      "
                      @focus="caseNameShow = true"
                      @blur="caseNameShow = false"
                    ></el-input>
                  </template>
                  <el-table
                    :data="nameCaseLists"
                    @cell-click="clickCaseInfo"
                    :row-style="{ height: '30px' }"
                    :max-height="300"
                    v-loading="caseTableLoading"
                    element-loading-text="加载中"
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
                      prop="agentNum"
                      label="案件文号"
                      width="170"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="caseName"
                      label="案件名称"
                      width="170"
                    ></el-table-column>
                    <el-table-column
                      prop="name"
                      label="客户"
                      width="174"
                    >
                      <template #default="scope">
                        <span>{{
                          scope.row.name ? scope.row.name : scope.row.custName
                        }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-popover>
              </td>
              <td v-else>{{ approvalInfo.caseName }}</td>
            </tr>
            <tr v-if="approvalInfo.workType === 2069">
              <th>拜访方式 :</th>
              <td
                v-if="isown"
                :colspan="approvalInfo.baifangType === '其他' ? 1 : 3"
              >
                <el-select
                  clearable
                  v-model="approvalInfo.baifangType"
                  placeholder="请选择"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in ['客户来访', '我方拜访', '其他']"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </td>
              <td
                v-else
                :colspan="approvalInfo.baifangType === '其他' ? 1 : 3"
              >
                {{ approvalInfo.baifangType }}
              </td>
              <template v-if="approvalInfo.baifangType === '其他'">
                <th>其他说明 :</th>
                <td>
                  {{ approvalInfo.qitaDes }}
                </td>
              </template>
            </tr>
            <tr v-if="approvalInfo.workType === 2071">
              <th>业务领域 :</th>
              <td v-if="isown">
                <el-select
                  clearable
                  multiple
                  v-model="approvalInfo.bussDomainList"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in ['商标', '专利', '其他', '不确定']"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </td>
              <td v-else>{{ approvalInfo.bussDomain }}</td>
              <th>非定向或涉及<br />多客户开发 :</th>
              <td v-if="isown">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 1 }"
                  placeholder="请填写情况说明"
                  v-model="approvalInfo.custmemo"
                ></el-input>
              </td>
              <td v-else>{{ approvalInfo.custmemo }}</td>
            </tr>
            <tr v-if="[2069, 2070, 2071].includes(approvalInfo.workType)">
              <th>参与会议 :</th>
              <td
                v-if="isown"
                colspan="3"
              >
                <el-select
                  clearable
                  class="select-input"
                  remote
                  filterable
                  :remote-method="fetchRecentMeetingList"
                  v-model="approvalInfo.meId"
                  placeholder="请输入关键词"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in recentMeetingList"
                    :key="item.meId"
                    :label="item.title"
                    :value="item.meId"
                  >
                  </el-option>
                </el-select>
              </td>
              <td
                v-else
                colspan="3"
              >
                {{ approvalInfo.title }}
              </td>
            </tr>
            <tr v-if="approvalInfo.workType">
              <th style="white-space: nowrap">内部参会人员 :</th>
              <td v-if="isown">
                <el-select-v2
                  v-model="approvalInfo.innerUserList"
                  :options="userList || []"
                  placeholder="请选择参会人员"
                  filterable
                  clearable
                  multiple
                />
              </td>
              <td v-else>
                {{
                  approvalInfo?.innerUserList
                    .map((item) => item.fullname)
                    .join("；")
                }}
              </td>
              <th>客户联系人 :</th>
              <td v-if="isown">
                <el-select
                  multiple
                  v-model="approvalInfo.custContactList"
                  filterable
                  remote
                  clearable
                  placeholder="请输入关键词"
                  :remote-method="remoteCustContactMethod"
                  popper-class="custContact-select"
                >
                  <template #header>
                    <div style="display: flex; margin: 0 10px 0 10px">
                      <div style="width: 150px">姓名</div>
                      <div style="width: 220px">联系方式</div>
                      <div style="width: 80px">是否存在</div>
                    </div>
                  </template>
                  <el-option
                    v-for="(itm, idx) in custContactList"
                    :key="idx"
                    :label="itm.name"
                    :value="itm.custContactId"
                  >
                    <div style="display: flex; height: 40px">
                      <div
                        style="width: 150px; border-right: 1px solid #c0c4cc"
                        class="select-content"
                      >
                        <el-tooltip
                          :content="itm.name"
                          placement="top"
                          >{{ itm.name }}</el-tooltip
                        >
                      </div>

                      <div
                        style="
                          width: 220px;
                          border-right: 1px solid #c0c4cc;
                          padding-left: 8px;
                          padding-right: 8px;
                        "
                        class="select-content"
                      >
                        <span v-if="itm.value2 === '已存在'"
                          ><el-tooltip
                            :content="itm.email"
                            placement="top"
                            >{{ itm.email }}</el-tooltip
                          ></span
                        >
                        <el-input
                          @click.stop
                          v-else
                          style="margin-bottom: 4px"
                          v-model="custContactList[idx].email"
                          placeholder="请输入"
                        ></el-input>
                      </div>
                      <div
                        style="width: 80px; padding-left: 8px"
                        class="select-content"
                      >
                        {{ itm.value2 }}
                      </div>
                    </div>
                  </el-option>
                </el-select>
                <div
                  v-show="
                    approvalInfo.custContactList &&
                    approvalInfo.custContactList.find(
                      (item) => typeof item === 'string'
                    )
                  "
                  style="
                    font-size: 12px !important;
                    color: #e6a23c;
                    height: 16px;
                    line-height: 16px;
                  "
                >
                  部分客户联系人不存在，将自动创建
                </div>
              </td>
              <td v-else>
                {{
                  approvalInfo.custContactList
                    .map((item) => item.name)
                    .join("；")
                }}
              </td>
            </tr>
            <!-- <tr v-if="!approvalInfo.workType">
              <th>案件文号 :</th>
              <td>{{ approvalInfo.agentNum }}</td>
              <th>案件名称 :</th>
              <td style="white-space: normal">{{ approvalInfo.caseName }}</td>
            </tr> -->
            <tr>
              <th>工作日期 :</th>
              <td v-if="isown">
                <el-date-picker
                  v-model="approvalInfo.hourDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择工作日期"
                  :clearable="false"
                  :disabled-date="disabledDate"
                  style="width: 100%"
                />
              </td>
              <td v-else>{{ approvalInfo.hourDate }}</td>
              <th>开始时间 :</th>
              <td v-if="isown">
                <TimerInput
                  v-model="approvalInfo.beginDate"
                  placeholder="请输入开始时间"
                  @inputBlur="beginTimeChange"
                />
              </td>
              <td v-else>{{ approvalInfo.beginDate }}</td>
            </tr>
            <tr>
              <th>工作时长 :</th>
              <td v-if="isown">
                <TimerInput
                  v-model="approvalInfo.time"
                  placeholder="00:00"
                  @inputBlur="timeChange"
                />
              </td>
              <td v-else>{{ approvalInfo.time }}</td>
              <th>结束时间 :</th>
              <td v-if="isown">
                <TimerInput
                  v-model="approvalInfo.endDate"
                  placeholder="请输入结束时间"
                  @inputBlur="endTimeChange"
                />
              </td>
              <td v-else>{{ approvalInfo.endDate }}</td>
            </tr>
            <tr>
              <th>员工 :</th>
              <td>{{ approvalInfo.whUserName }}</td>
              <th>员工角色 :</th>
              <td>{{ approvalInfo.roleName }}</td>
            </tr>
            <tr>
              <th>标准费率 :</th>
              <td>{{ approvalInfo.criterionRate }}</td>
              <th>金额 :</th>
              <td>{{ formatAmount(approvalInfo.amount) }}</td>
            </tr>
            <tr>
              <th>所属工作组 :</th>
              <td :colspan="approvalInfo.wfStatus === '未核销' ? 1 : 3">
                {{ approvalInfo.groupName }}
              </td>
              <template v-if="approvalInfo.wfStatus === '未核销'">
                <th>核定金额 :</th>
                <td>
                  {{ formatAmount(approvalInfo.approvedAmountCust) }}
                </td>
              </template>
            </tr>
            <tr
              v-if="
                approvalInfo.wfStatus === '待审核' ||
                approvalInfo.wfStatus === '未核销'
              "
            >
              <th>核定工时 :</th>
              <td>
                <TimerInput
                  @inputBlur="changeAppTime"
                  v-model="approvalInfo.approvedTime"
                  :value="approvalInfo.approvedTime"
                  placeholder="00:00"
                />
              </td>
              <th>核定费率 :</th>
              <td v-if="isown">
                <el-input
                  v-model="approvalInfo.criterionRate"
                  placeholder="请输入"
                />
              </td>
              <td v-else>{{ approvalInfo.criterionRate }}</td>
            </tr>
            <tr
              v-if="
                approvalInfo.wfStatus === '待审核' ||
                approvalInfo.wfStatus === '未核销'
              "
            >
              <th v-if="approvalInfo.workType">发现商机 :</th>
              <td v-if="approvalInfo.workType">
                {{ approvalInfo.hasSj ? "是" : "否" }}
              </td>
              <th>记录人 :</th>
              <td colspan="3">{{ approvalInfo.recordUserName }}</td>
            </tr>
            <tr>
              <th>出差路途 :</th>
              <td
                colspan="3"
                v-if="isown"
              >
                <el-checkbox
                  v-model="approvalInfo.hasBusinessTrip"
                  :true-value="1"
                  :false-label="0"
                ></el-checkbox>
              </td>
              <td
                v-else
                colspan="3"
              >
                {{ approvalInfo.hasBusinessTripStr }}
              </td>
            </tr>
            <tr v-if="approvalInfo.workType">
              <th style="white-space: nowrap">活动工时审核人 :</th>
              <td colspan="3">{{ approvalInfo.taskUserName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="approvalInfo.hasSj">
        <el-divider content-position="left"
          ><span style="font-size: 16px; color: #495057"
            >商机线索</span
          ></el-divider
        >
        <el-table
          :data="approvalInfo.shangjiList"
          :max-height="200"
          :fit="true"
          :border="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of sjColumns"
            :key="col.value"
            :width="col.width"
          />
        </el-table>
      </div>
      <div>
        <el-divider content-position="left"
          ><span style="font-size: 16px; color: #495057"
            >工作描述</span
          ></el-divider
        >
        <el-row style="border: none">
          {{ approvalInfo.workContent }}
        </el-row>
      </div>
      <div>
        <el-divider content-position="left"
          ><span style="font-size: 16px; color: #495057"
            >核定描述</span
          ></el-divider
        >
        <el-row>
          <el-input
            type="textarea"
            v-model="approvalInfo.approvedDesc"
            :autosize="{ minRows: 4 }"
            placeholder="[核定描述]:"
          ></el-input>
        </el-row>
      </div>
      <div>
        <el-divider content-position="left"
          ><span style="font-size: 16px; color: #495057"
            >审核备注</span
          ></el-divider
        >
        <el-row>
          <el-input
            type="textarea"
            v-model="approvalInfo.shenheremark"
            :autosize="{ minRows: 4 }"
            placeholder="[审核备注]:"
          ></el-input>
        </el-row>
      </div>
      <div v-if="fileList.length">
        <el-divider content-position="left"
          ><h4 class="card-title">附件</h4></el-divider
        >
        <div>
          <div
            v-for="(item, index) in fileList"
            @click="onPreview(item)"
            :key="index"
          >
            <div class="clickable">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-end modal-footer">
      <b-button
        variant="light"
        @click="closeApprovalModal"
        >取消</b-button
      >
      <b-button
        variant="success"
        class="ms-1"
        @click="passWorkTime"
        >通过</b-button
      >
    </div>
  </b-modal>
</template>

<style lang="scss">
.work-time-modal {
  padding: 0;
}
.content-body {
  max-height: calc(80vh - 88px);
  overflow-y: auto;
}
</style>
