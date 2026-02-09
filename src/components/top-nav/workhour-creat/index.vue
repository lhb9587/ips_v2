<script>
import {
  queryWorkType,
  queryActiveWorkgroupBossUserList,
  queryRecentCase,
  getCaseHistory,
  queryRecentMeeting,
  queryIfHehuoren,
  queryList,
  querySimilarCustomer,
  addTaskHours,
} from "@/api/caseList";
import {
  queryCaseWorkgroupUrl,
  delCaseMaterialUrl,
  queryCustomerContactByCustIdUrl,
} from "@/api/caseDetail";
import { queryChargeItemBynameCnUrl } from "@/api/billApi";
import { creatematerialUrl } from "@/api/serviceApi.config.js";
import { queryWorkByUserId, queryChargeItemList } from "@/api/systemList";
import { queryCustomerContactListUrl } from "@/api/customerList";
import dayjs from "dayjs";
import TimerInput from "@/components/common/timer-input";
import { userComputed } from "@/state/helpers";
import { extractTree, downLoadAll, getProgID, viewPdf, unique } from "@/utils";
import { getToken } from "@/utils/auth";

export default {
  components: { TimerInput },
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      formTime: {
        hourDate: dayjs().format("YYYY-MM-DD"),
        hasBusinessTrip: 0,
        shangjiList: [
          {
            domain: undefined,
            lxren: undefined,
            lxfs: undefined,
            sjdesc: undefined,
          },
        ],
        hasSj: 0,
      },
      workTypeList: [],
      activityKinds: [],
      defaultParams: {
        value: "workType",
        label: "workTypeName",
        children: "childrens",
      },
      groupList: [],
      partnerList: [],
      menuItems: [
        { label: "最近记录工时", value: 1 },
        { label: "最近立案", value: 2 },
        { label: "最近处理", value: 3 },
      ],
      ruleId: 1,
      historyList: [],
      agentCaseLists: [],
      visible: false,
      isPartner: false,
      agentList: [],
      nameCaseLists: [],
      descList: [],
      defaultDescList: [],
      contentShow: false,
      agentVisible: false,
      caseNameShow: false,
      uploadFileData: {
        tokenID: getToken(),
        hoursFile: 1,
      },
      custVisible: false,
      creatematerialUrl,
      fileList: [],
      domainOptions: [
        "保护",
        "诉讼",
        "商标",
        "专利",
        "域名",
        "著作权",
        "非诉",
        "无",
      ],
      custContactList: [], //客户联系人
      customerContacts: [],
      caseTableLoading: false,
      creatwhModal: false,
      timed: false,
      custList: [],
      noMatch: false,
      timer: null,
    };
  },
  computed: {
    ...userComputed,
    isWorkHourAdmin() {
      return this.roles.find((item) => item.name === "工时管理员");
    }, //是否是工时管理员
    custRequre() {
      return (
        this.formTime.workType &&
        this.activityKinds.length &&
        this.extractTree(this.activityKinds, "childrens", [
          "workType",
          "workTypeName",
          "hdFlag",
        ]).find((item) => item.workType === this.formTime.workType) &&
        this.extractTree(this.activityKinds, "childrens", [
          "workType",
          "workTypeName",
          "hdFlag",
        ]).find((item) => item.workType === this.formTime.workType).hdFlag == 9
      );
    }, //是否是客户需求
    computedDesc() {
      return (
        (this.formTime.workType &&
          this.activityKinds.length &&
          this.extractTree(this.activityKinds, "childrens", [
            "workType",
            "workTypeName",
            "memo",
          ]).find((item) => item.workType === this.formTime.workType) &&
          this.extractTree(this.activityKinds, "childrens", [
            "workType",
            "workTypeName",
            "memo",
          ]).find((item) => item.workType === this.formTime.workType).memo) ||
        ""
      );
    },
  },
  watch: {
    "formTime.noCaseAuditUserId": {
      handler(n) {
        if (n && this.partnerList.find((item) => item.userId == n)) {
          this.formTime.wkgId = this.partnerList.find(
            (item) => item.userId == n
          ).wkgId;
        }
      },
    },
    "formTime.workType": {
      handler() {
        this.formTime.hasSj = 0;
        this.formTime.innerUserList = undefined;
        this.formTime.baifangType = undefined;
        this.formTime.innerUserList = undefined;
        this.formTime.meId = undefined;
        this.formTime.bussDomainList = undefined;
        this.formTime.custmemo = undefined;
        this.formTime.noCaseAuditUserId = undefined;
      },
    },
  },
  methods: {
    extractTree,
    downLoadAll,
    viewPdf,
    unique,
    custBlur() {
      this.custVisible = false;
      this.noMatch = false;
      setTimeout(() => {
        if (!this.formTime.custId && this.formTime.custName) {
          const title =
            this.custList.length > 1 ? "已存在相似客户" : "该客户不存在";
          this.$confirm(`${title}，是否创建新客户`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.noMatch = true;
              this.formTime.fullname = this.formTime.custName;
              this.formTime.custIntroductor = this.name;
            })
            .catch(() => {
              this.formTime.custName = null;
              this.noMatch = false;
            });
        }
      }, 500);
    },
    handleStartTiming() {
      this.timed = true;
    },
    handleHidden() {
      this.$emit("update:showModal", false);
    },
    saveCreat() {
      if (this.custRequre && !this.formTime.custId && !this.formTime.fullname) {
        this.$message.error("请填写客户名称！");
        return;
      }
      if (
        !this.isPartner &&
        !this.formTime.noCaseAuditUserId &&
        this.formTime.workType
      ) {
        this.$message.error("请选择活动工时审核人！");
        return;
      }
      if (!this.formTime.workContent) {
        this.$message.error("请填写工作描述！");
        return;
      }
      if (!this.formTime.userId) {
        this.$message.error("请选择记录人！");
        return;
      }
      if (!this.formTime.hourDate) {
        this.$message.error("请填写工时日期！");
        return;
      }
      if (!this.formTime.time) {
        this.$message.error("请填写工作时长！");
        return;
      }
      if (this.formTime.fullname) {
        this.formTime.custId = undefined;
        this.formTime.custIntroductor = this.name;
      }
      if (!(this.formTime.agentNum || this.formTime.workType)) {
        this.$message.error("请填写案件文号或活动类型！");
        return;
      }
      const dateData = {
        hourDate: this.formTime.hourDate,
        beginDate: this.formTime.beginDate,
        endDate: this.formTime.endDate,
      };
      if (dateData.beginDate) {
        dateData.beginDate = dateData.hourDate + " " + dateData.beginDate;
        dateData.beginDate = dateData.beginDate.replace(/\//g, "-");
      }
      if (dateData.endDate) {
        dateData.endDate = dateData.hourDate + " " + dateData.endDate;
        dateData.endDate = dateData.endDate.replace(/\//g, "-");
      }
      let innerUserList = [];
      let custContactList = [];
      if (this.formTime.innerUserList && this.formTime.innerUserList.length) {
        innerUserList = this.userList.filter((item) =>
          this.formTime.innerUserList.includes(item.userId)
        );
      }
      if (
        this.formTime.custContactList &&
        this.formTime.custContactList.length
      ) {
        custContactList = this.custContactList
          .filter((item) => this.formTime.custContactList.includes(item.id))
          .map((item) => ({
            custContactId: typeof item.id === "number" ? item.id : undefined,
            name: item.value,
            email: item.value1,
          }));
      }
      if (+this.formTime?.time?.substring(0, 2) > 3) {
        this.$confirm("时长过长，是否创建!", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          addTaskHours({
            ...this.formTime,
            ...dateData,
            innerUserList,
            custContactList,
          }).then((res) => {
            if (res.success) {
              this.$message.success("工时创建成功！");
              this.handleHidden();
            }
            // this.$store.commit(
            //   "caseInformation/SET_HOURS_ID",
            //   res.data.hoursId
            // );
            // if (this.$route.path !== "/workbench/worktime") {
            //   this.$router.push("/workbench/worktime");
            // }
          });
        });
      } else {
        addTaskHours({
          ...this.formTime,
          ...dateData,
          innerUserList,
          custContactList,
        }).then((res) => {
          if (res.success) {
            this.$message.success("工时创建成功！");
            this.handleHidden();
          }
          // this.$store.commit("caseInformation/SET_HOURS_ID", res.data.hoursId);
          // if (this.$route.path !== "/workbench/worktime") {
          //   this.$router.push("/workbench/worktime");
          // }
        });
      }
    },
    changeCust(custInfo) {
      this.formTime.fullname = undefined;
      this.formTime.custIntroductor = undefined;
      this.formTime.custId = custInfo.custId;
      this.formTime.custName = custInfo.fullname;
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
    remoteCustContactMethod(val) {
      if (!val || !this.formTime.custId) return;
      this.custContactList = [];
      if (
        this.formTime.custContactList?.filter(
          (item) => typeof item === "number"
        ).length
      ) {
        queryCustomerContactListUrl({
          custId: this.formTime.custId,
          customerContactIds: this.formTime.custContactList
            .filter((item) => typeof item === "number")
            .join(","),
          isCustomer: "1",
          pageSize: 50,
        }).then((res1) => {
          this.custContactList = res1.data.map((item) => ({
            id: item.custContactId,
            value: item.name,
            value1: item.email,
            value2: "已存在",
          }));
          if (
            this.formTime.custContactList.filter(
              (item) => typeof item === "string"
            ).length
          ) {
            this.custContactList = this.custContactList.concat(
              this.formTime.custContactList
                .filter((item) => typeof item === "string")
                .map((item) => ({
                  id: item,
                  value: item,
                  value1: "",
                  value2: "不存在",
                }))
            );
          }

          queryCustomerContactListUrl({
            custId: this.formTime.custId,
            name: val,
            isCustomer: "1",
            pageSize: 50,
          }).then((res2) => {
            if (res2.data && res2.data.length) {
              this.custContactList = this.unique(
                this.custContactList.concat(
                  res2.data.map((item) => ({
                    id: item.custContactId,
                    value: item.name,
                    value1: item.email,
                    value2: "已存在",
                  }))
                ),
                "id"
              );
            } else {
              this.custContactList = this.unique(
                this.custContactList.concat([
                  {
                    id: val,
                    value: val,
                    value1: "",
                    value2: "不存在",
                  },
                ]),
                "id"
              );
            }
          });
        });
      } else {
        queryCustomerContactListUrl({
          custId: this.formTime.custId,
          name: val,
          isCustomer: "1",
          pageSize: 50,
        }).then((res2) => {
          if (res2.data && res2.data.length) {
            this.custContactList = this.unique(
              this.custContactList.concat(
                res2.data.map((item) => ({
                  id: item.custContactId,
                  value: item.name,
                  value1: item.email,
                  value2: "已存在",
                }))
              ),
              "id"
            );
          } else {
            this.custContactList = this.unique(
              this.custContactList.concat([
                {
                  id: val,
                  value: val,
                  value1: "",
                  value2: "不存在",
                },
              ]),
              "id"
            );
          }
        });
      }
    },
    getAppTitleList() {
      return {
        id: "-1",
        value: "姓名",
        value1: "联系方式",
        value2: "是否存在",
      };
    },
    fetchIfHehuoren() {
      queryIfHehuoren().then((res) => {
        this.isPartner = !!res.data;
      });
    },
    downLoad(data) {
      const res = data.response?.data[0];
      const url = res?.address || res?.url;
      const downData = {
        url: `/ipdoc${url}`,
        success() {},
      };
      if (res.mailId) {
        downData.downLoad = res.materialName;
      }
      this.downLoadAll(downData);
    },
    onPreview(data) {
      let url = data.response?.data[0]?.address;
      if (!url) {
        return false;
      }
      if (
        getProgID(url) ||
        ["eml", "msg"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
      ) {
        if (
          ["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
        ) {
          this.viewPdf(`${url}`);
        } else {
          let flag = "";
          const res = data.response?.data[0];
          if (res?.mailId) {
            flag = "mailId";
          } else if (res?.materialId) {
            flag = "materialId";
          }
          url = url.replace(/&/g, "%26");
          window.open(
            `/#/preView?address=ipdoc${url}&${flag}=${res[flag]}`.replace(
              /[+]/g,
              "%2B"
            )
          );
        }
        // doEditInOffice(url, getProgID(url))
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
    brforeRemoveFile(file, fileList) {
      let delmaterialId;
      if (file.response) {
        delmaterialId = file.response.data[0].materialId;
      } else {
        delmaterialId = file.materialId;
      }
      delmaterialId &&
        delCaseMaterialUrl({
          materialId: delmaterialId,
          hoursFile: 1,
        }).then((res) => {
          this.$message.success(res.message);
          // this.formTime.materialIdList = fileList.map((item) => {
          //   if (item.materialId) {
          //     return item.materialId;
          //   } else {
          //     return item.response.data[0].materialId;
          //   }
          // });
          this.fileList = fileList;
        });
    },
    successCallback(res, file, fileList) {
      this.formTime.materialIdList = fileList.map((item) => {
        if (item.materialId) {
          return item.materialId;
        } else {
          return item.response.data[0].materialId;
        }
      });
      this.fileList.push(
        res.data.map((item) => ({
          name: item.materialName,
          url: item.address,
          materialId: item.materialId,
        }))[0]
      );
    },
    addData() {
      this.formTime.shangjiList.push({
        domain: "",
        lxren: "",
        lxfs: "",
        sjdesc: "",
      });
    },
    deleteData(index) {
      if (this.formTime.shangjiList.length == 1) {
        return false;
      }
      this.formTime.shangjiList.splice(index, 1);
    },
    searchContent() {
      if (!this.formTime.workContent) {
        this.descList = this.defaultDescList;
        return;
      }
      queryChargeItemBynameCnUrl({
        nameCn: this.formTime.workContent,
        caodan: 2,
        caseId: this.formTime.caseId,
      }).then((res) => {
        this.descList = res.data;
      });
    },
    fatchGridDataDefault() {
      queryChargeItemList({
        chargeType: 1,
        caseTypeIds: [[2]],
        pageSize: 100,
      }).then((res) => {
        this.defaultDescList = res.data.map((item) => ({
          nameCn: item.nameEn,
        }));
        this.descList = res.data.map((item) => ({
          nameCn: item.nameEn,
        }));
      });
    },
    fwtableClick(row) {
      this.formTime.workContent = row.nameCn || "";
    },
    disabledDate(time) {
      return (
        time.getTime() > Date.now() ||
        time.getTime() < Date.now() - 6 * 24 * 60 * 60 * 1000
      );
    },
    fetchRecentMeetingList(val) {
      queryRecentMeeting({ title: val }).then((res) => {
        this.recentMeetingList = res.data || [];
      });
    },
    changeWorkType(v) {
      if (v && v.length) {
        this.formTime.workType = v[v.length - 1];
        if (this.formTime.workType === 2069) {
          this.formTime.bussDomain = "";
        }
        if (this.formTime.workType === 2071) {
          this.formTime.baifangType = "";
          this.formTime.qitaDes = "";
        }
        this.formTime.agentNum = undefined;
        this.formTime.caseName = undefined;
        this.formTime.caseId = undefined;
      } else {
        this.formTime.workType = undefined;
      }
    },
    clickCaseInfo(row) {
      this.formTime.agentNum = row.agentNum;
      this.formTime.caseId = row.caseId;
      this.formTime.wkgId = row.wkgId;
      this.formTime.caseName = row.caseName;
      this.formTime.custId = row.custId;
      this.formTime.custName = row.custName || row.name;
      this.remotepaternalUnit(row.custName || row.name, () => {});
    },
    searchCaseByAgent(value) {
      let keyWord = value || "";
      if (!keyWord) {
        return;
      }
      this.fetchCaseList(keyWord, "agent");
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
          this.formTime.agentNum = res.data[0].agentNum;
          this.formTime.caseName = res.data[0].caseName;
          this.formTime.custId = res.data[0].custId;
          this.formTime.custName = res.data[0].custName;
          this.formTime.caseId = res.data[0].caseId;
          this.formTime.wkgId = res.data[0].wkgId;
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
    handleCommand(val) {
      this.ruleId = val;
      queryRecentCase({ ruleId: this.ruleId }).then((res) => {
        this.agentList = res.data;
      });
    },
    fetchAgentList() {
      queryRecentCase({ ruleId: this.ruleId }).then((res) => {
        this.agentList = res.data;
        this.nameCaseLists = res.data;
      });
    },
    queryHistoryList(v, f) {
      if (f == "agent") {
        if (!v.target.value) {
          queryRecentCase({ ruleId: this.ruleId }).then((res) => {
            this.agentList = res.data;
          });
        }
      }
    },
    twiceSearch() {
      let fuzzy = this.inputContent;
      if (fuzzy) {
        this.twiceData = this.agentCaseLists.filter((item) => {
          return item.agentNum.includes(fuzzy);
        });
      } else {
        this.twiceData = this.agentCaseLists;
      }
    },
    fetchPartnerList() {
      queryActiveWorkgroupBossUserList().then((res) => {
        this.partnerList = res.data;
      });
    },
    fetchGroupList() {
      queryCaseWorkgroupUrl({ status: 1 }).then((res) => {
        this.groupList = res.data;
      });
    },
    fetwkgId() {
      queryWorkByUserId({ userId: this.userId }).then((res) => {
        if (res.data.groups && res.data.groups.length) {
          this.formTime.wkgId = res.data?.groups[0].wkgId;
        }
      });
    },
    computedTime() {
      if (this.formTime.beginDate && this.formTime.endDate) {
        let beginHour = +this.formTime.beginDate.split(":")[0] || 0;
        let beginMinite = +this.formTime.beginDate.split(":")[1] || 0;
        let endHour = +this.formTime.endDate.split(":")[0] || 0;
        let endMinite = +this.formTime.endDate.split(":")[1] || 0;
        console.log(beginHour, beginMinite, endHour, endMinite);
        if (endHour - beginHour < 0) {
          this.formTime.time = "";
          return;
        }
        if (endMinite - beginMinite < 0) {
          endMinite += 60;
          endHour--;
          if (endHour < 0) {
            this.formTime.time = "";
            return;
          }
        }
        this.formTime.time =
          this.add0(endHour - beginHour) +
          ":" +
          this.add0(endMinite - beginMinite);
        console.log(this.formTime.time, "this.formTime.time");
      }
    },
    beginTimeChange(value) {
      this.formTime.beginDate = value;
      if (this.formTime.endDate) {
        let beginHour = +this.formTime.beginDate.split(":")[0] || 0;
        let beginMinite = +this.formTime.beginDate.split(":")[1] || 0;
        let endHour = +this.formTime.endDate.split(":")[0] || 0;
        let endMinite = +this.formTime.endDate.split(":")[1] || 0;
        console.log(beginHour, beginMinite, endHour, endMinite);
        if (endHour - beginHour < 0) {
          this.formTime.time = "";
          return;
        }
        if (endMinite - beginMinite < 0) {
          endMinite += 60;
          endHour--;
          if (endHour < 0) {
            this.formTime.time = "";
            return;
          }
        }
        this.formTime.time =
          this.add0(endHour - beginHour) +
          ":" +
          this.add0(endMinite - beginMinite);
        console.log(this.formTime.time, "this.formTime.time");
      }
    },
    endTimeChange(value) {
      this.formTime.endDate = value;
      if (this.formTime.beginDate) {
        let beginHour = +this.formTime.beginDate.split(":")[0] || 0;
        let beginMinite = +this.formTime.beginDate.split(":")[1] || 0;
        let endHour = +this.formTime.endDate.split(":")[0] || 0;
        let endMinite = +this.formTime.endDate.split(":")[1] || 0;
        console.log(beginHour, beginMinite, endHour, endMinite);
        if (endHour - beginHour < 0) {
          this.formTime.time = "";
          return;
        }
        if (endMinite - beginMinite < 0) {
          endMinite += 60;
          endHour--;
          if (endHour < 0) {
            this.formTime.time = "";
            return;
          }
        }
        this.formTime.time =
          this.add0(endHour - beginHour) +
          ":" +
          this.add0(endMinite - beginMinite);
        console.log(this.formTime.time, "this.formTime.time");
      }
    },
    timeChange(value) {
      this.formTime.time = value;
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
    remoteQueryCust(v) {
      this.remotepaternalUnit(v, () => {}, "客户");
    },
    remotepaternalUnit(query, cb, type) {
      if (!query && type === "客户") {
        this.formTime.fullname = undefined;
        this.formTime.custIntroductor = undefined;
        this.formTime.custId = undefined;
        this.formTime.custName = undefined;
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
    fetchWorkType() {
      queryWorkType().then((res) => {
        this.activityKinds = res.data;
      });
    },
  },
  created() {
    this.creatwhModal = this.showModal;
  },
  mounted() {
    this.fetchWorkType();
    this.fetchGroupList();
    this.fetwkgId();
    this.fetchPartnerList();
    this.fetchAgentList();
    this.fetchRecentMeetingList();
    this.fatchGridDataDefault();
    this.fetchIfHehuoren();
    this.formTime.userId = this.userId;
  },
};
</script>
<template>
  <b-modal
    v-model="creatwhModal"
    @hidden="handleHidden"
    :no-close-on-backdrop="true"
    title="新建工时"
    centered
    size="lg"
    hide-footer
    :no-fade="true"
    :no-close-on-esc="true"
    body-class="creatwh-modal"
  >
    <el-form
      :model="formTime"
      ref="whRef"
      label-width="130"
      class="ruleForm p-3"
    >
      <div class="row rowItem">
        <div class="col-md-6">
          <el-form-item
            label="活动类型"
            prop="caseId"
            :class="{ requireItem: !formTime.agentNum }"
          >
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
                  display: flex;
                  align-items: center;
                "
              ></i>
            </el-tooltip>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item
            label="客户名称"
            :class="{ requireItem: custRequre }"
          >
            <el-popover
              placement="bottom-start"
              width="600"
              trigger="click"
              :visible="custVisible"
            >
              <template #reference>
                <el-input
                  placeholder="请输入客户名称"
                  v-model="formTime.custName"
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
      <div
        class="row rowItem"
        v-if="!formTime.workType"
      >
        <div class="col-md-6">
          <el-form-item
            label="案件文号"
            class="requireItem"
          >
            <el-popover
              placement="bottom-start"
              width="600"
              trigger="click"
              :visible="agentVisible"
            >
              <template #reference>
                <el-input
                  placeholder="请输入案号"
                  v-model="formTime.agentNum"
                  style="width: 84%; margin-right: 12px"
                  @input="(v) => debounce((v) => searchCaseByAgent(v), 500)(v)"
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
                  style="font-size: 22px; border: none"
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
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="案件名称">
            <el-popover
              placement="bottom-start"
              width="600"
              trigger="click"
              :visible="caseNameShow"
            >
              <template #reference>
                <el-input
                  placeholder="请输入案件名称"
                  v-model="formTime.caseName"
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
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-if="formTime.workType === 2069"
      >
        <div class="col-md-6">
          <el-form-item label="拜访方式">
            <el-select
              clearable
              v-model="formTime.baifangType"
              placeholder="请选择"
            >
              <el-option
                v-for="item in ['客户来访', '我方拜访', '其他']"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div
          class="col-md-6"
          v-if="formTime.baifangType === '其他'"
        >
          <el-form-item
            label="其他说明:"
            class="postInfo-container-item"
          >
            <el-input v-model="formTime.qitaDes"></el-input>
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-if="formTime.workType === 2071"
      >
        <div class="col-md-6">
          <el-form-item label="业务领域">
            <el-select
              clearable
              multiple
              v-model="formTime.bussDomainList"
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
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="非定向或涉及多客户开发">
            <el-input
              type="textarea"
              :autosize="{ minRows: 1 }"
              placeholder="请填写情况说明"
              v-model="formTime.custmemo"
            ></el-input>
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-if="[2069, 2070, 2071].includes(formTime.workType)"
      >
        <div class="col-md-6">
          <el-form-item label="参与会议">
            <el-select
              clearable
              class="select-input"
              remote
              filterable
              :remote-method="fetchRecentMeetingList"
              v-model="formTime.meId"
              placeholder="请输入关键词"
            >
              <el-option
                v-for="item in recentMeetingList"
                :key="item.meId"
                :label="item.title"
                :value="item.meId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-if="formTime.workType"
      >
        <div class="col-md-6">
          <el-form-item label="内部参会人员">
            <el-select-v2
              v-model="formTime.innerUserList"
              :options="userList || []"
              placeholder="请选择参会人员"
              filterable
              clearable
              multiple
            />
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="客户联系人:">
            <el-select
              multiple
              v-model="formTime.custContactList"
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
                :label="itm.value"
                :value="itm.id"
              >
                <div style="display: flex">
                  <div
                    style="width: 150px; border-right: 1px solid #c0c4cc"
                    class="select-content"
                  >
                    <el-tooltip
                      :content="itm.value"
                      placement="top"
                      >{{ itm.value }}</el-tooltip
                    >
                  </div>

                  <div
                    style="
                      width: 220px;
                      border-right: 1px solid #c0c4cc;
                      padding-left: 8px;
                      padding-right: 8px;
                      margin-top: -1px;
                    "
                    class="select-content"
                  >
                    <span v-if="itm.value2 === '已存在'"
                      ><el-tooltip
                        :content="itm.value1"
                        placement="top"
                        >{{ itm.value1 }}</el-tooltip
                      ></span
                    >
                    <el-input
                      @click.stop
                      v-else
                      v-model="custContactList[idx].value1"
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
                formTime.custContactList &&
                formTime.custContactList.find(
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
          </el-form-item>
        </div>
      </div>
      <div class="row rowItem">
        <div class="col-md-6">
          <el-form-item
            label="工作日期"
            class="requireItem"
          >
            <el-date-picker
              v-model="formTime.hourDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择工作日期"
              :clearable="false"
              :disabled-date="disabledDate"
              style="width: 100%"
          /></el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="开始时间">
            <TimerInput
              v-model="formTime.beginDate"
              placeholder="请输入开始时间"
              @inputBlur="beginTimeChange"
            />
          </el-form-item>
        </div>
      </div>
      <div class="row rowItem">
        <div class="col-md-6">
          <el-form-item
            label="工作时长"
            class="requireItem"
          >
            <TimerInput
              v-model="formTime.time"
              placeholder="00:00"
              :value="formTime.time"
              @inputBlur="timeChange"
            />
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="结束时间">
            <TimerInput
              v-model="formTime.endDate"
              placeholder="请输入结束时间"
              @inputBlur="endTimeChange"
            />
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-if="isWorkHourAdmin"
      >
        <div
          class="col-md-6"
          v-if="formTime.workType"
        >
          <el-form-item label="发现商机">
            <el-radio-group v-model="formTime.hasSj">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item
            label="记录人"
            class="requireItem"
          >
            <el-select-v2
              v-model="formTime.userId"
              :options="userList || []"
              placeholder="请选择记录人"
              filterable
              clearable
            />
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-else
      >
        <div
          class="col-md-6"
          v-if="formTime.workType"
        >
          <el-form-item label="发现商机">
            <el-radio-group v-model="formTime.hasSj">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div
          class="col-md-6"
          v-if="!formTime.workType"
        >
          <el-form-item
            label="记录人"
            class="requireItem"
          >
            <el-select-v2
              v-model="formTime.userId"
              :options="userList || []"
              placeholder="请选择记录人"
              filterable
              clearable
            />
          </el-form-item>
        </div>
      </div>

      <div class="row rowItem">
        <div class="col-md-6">
          <el-form-item label="所属工作组">
            <el-select
              filterable
              clearable
              v-model="formTime.wkgId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in groupList"
                :key="item.wkgId"
                :label="item.groupName"
                :value="item.wkgId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>
      <div class="row rowItem">
        <div class="col-md-6">
          <el-form-item label="出差路途">
            <el-checkbox
              v-model="formTime.hasBusinessTrip"
              :true-value="1"
              :false-label="0"
            ></el-checkbox>
          </el-form-item>
        </div>
      </div>
      <div
        class="row rowItem"
        v-if="formTime.workType"
      >
        <div class="col-md-6">
          <el-form-item
            label="活动工时审核人"
            :class="[!isPartner ? 'requireItem' : '']"
          >
            <el-select
              v-model="formTime.noCaseAuditUserId"
              filterable
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in partnerList"
                :key="item.userId"
                :label="item.fullname"
                :value="item.userId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>
      <div v-if="formTime.hasSj == 1">
        <el-divider content-position="left"
          ><span style="font-weight: bold">商机线索</span></el-divider
        >
        <el-row>
          <el-table
            class="el-table1"
            :data="formTime.shangjiList"
            style="width: 99.5%"
            border
            maxHeight="280"
          >
            <el-table-column
              label="领域"
              width="100px"
            >
              <template #default="scope">
                <el-select
                  size="small"
                  default-first-option
                  v-model="scope.row.domain"
                  placeholder="领域"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="itm in domainOptions"
                    :key="itm"
                    :label="itm"
                    :value="itm"
                  >
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="商机描述"
              width="auto"
            >
              <template #default="scope">
                <el-input
                  placeholder="请输入商机描述"
                  type="textarea"
                  rows="1"
                  size="small"
                  v-model="scope.row.sjdesc"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="100px"
              align="center"
            >
              <template #default="scope">
                <div
                  class="row"
                  style="justify-content: center"
                >
                  <el-button
                    size="small"
                    type="primary"
                    circle
                    @click="addData"
                  >
                    <i class="bx bx-plus-circle"></i
                  ></el-button>
                  <el-button
                    size="small"
                    type="danger"
                    circle
                    @click="deleteData(scope.$index)"
                  >
                    <i class="mdi mdi-delete-outline"></i
                  ></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </div>
      <div>
        <el-divider content-position="left"
          ><span
            style="font-weight: bold"
            class="require"
            >工作描述</span
          ></el-divider
        >
        <div>
          <el-popover
            style="width: 400px"
            placement="top"
            trigger="click"
            popper-class="desc-popover"
          >
            <el-table
              size="small"
              @row-click="
                (val) => {
                  fwtableClick(val);
                }
              "
              :data="descList"
              style="height: 250px; overflow: scroll"
            >
              <el-table-column
                width="500"
                property="nameCn"
                label="工作描述"
              ></el-table-column>
            </el-table>
            <template #reference>
              <el-input
                style="width: 100%"
                @input="(v) => debounce((v) => searchContent(v), 500)(v)"
                type="textarea"
                v-model="formTime.workContent"
                :autosize="{ minRows: 4 }"
                placeholder="[工作描述]:"
                @focus="contentShow = true"
              ></el-input>
            </template>
          </el-popover>
        </div>
      </div>
      <div>
        <el-upload
          name="attachFile"
          :data="uploadFileData"
          :action="creatematerialUrl"
          :on-preview="onPreview"
          :on-remove="brforeRemoveFile"
          :on-success="successCallback"
          :auto-upload="true"
          multiple
          :file-list="fileList"
        >
          <div class="upload-btn">
            <i class="bx bx-upload"></i>
            <span>上传附件</span>
          </div>
        </el-upload>
      </div>
    </el-form>
    <div class="w-100 modal-footer">
      <div class="text-end">
        <b-button
          variant="light"
          @click="handleHidden"
          >取消</b-button
        >
        <a
          class="btn btn-primary ms-1"
          @click="saveCreat()"
        >
          创建
        </a>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
.is-active {
  background-color: #f5f7fa;
  color: #556ee6;
}
.requireItem {
  .el-form-item__label:before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
  }
}
.require:before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}
.desc-popover {
  width: 600px !important;
}
.upload-btn {
  margin: 10px 0 5px 0;
  width: 120px;
  height: 30px;
  border: 1px solid #aaaaaa;
  color: #aaaaaa;
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 4px;

  &:hover {
    border: 1px solid #66b1ff;
    color: #66b1ff;
  }
}
.custContact-select {
  min-width: 500px;
  .select-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .el-select-dropdown__list {
    padding: 0;
  }
  .el-select-dropdown__item {
    border-bottom: 1px solid #c0c4cc;
    height: 40px;
    line-height: 40px;
  }
  .el-select-dropdown__item:last-child {
    border-bottom: none;
  }
}
.rowItem {
  margin-right: 24px;
}
.ruleForm {
  max-height: calc(80vh - 88px);
  overflow-y: auto;
}
.creatwh-modal {
  padding: 0;
}
</style>
