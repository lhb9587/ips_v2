import { queryCaseAbroadBillInfo, queryCaseFeeInfo, queryCaseInfo } from "@/api/caseList";
import { lawsuitUrl, queryPatentCaseInfo } from "@/api/caseDetail";
import { settingsSubscribe, querySubscribe } from "@/api/dashboard";

export default {
  data() {
    return {
      isExpanded: true,
      componentName: "Cover",
      abroadBillList: [],
      caseInfo: {},
      imageLoadError: false,
      custGrpImgError: false,
      cbGrpImgError: false,
      lcGrpImgError: false,
      feeList: [],
      subscribeStatus: false,
    };
  },
  watch: {
    caseId: {
      immediate: true,
      handler() {
        this.fetchCaseInfo();
        this.fetchCaseAbroadBillInfo();
        this.fetchFeeList();
        this.getSubscribe();
      },
    },
  },
  methods: {
    getSubscribe() {
      if (!this.caseId) return;
      querySubscribe({
        objInstId: this.caseId,
        objType: 1,
      }).then((res) => {
        if (res.success) {
          this.subscribeStatus = res.data;
        }
      });
    },
    handleSubscribe(type) {
      if (!this.caseId) return;
      settingsSubscribe({
        objInstId: this.caseId,
        objType: 1,
        subscribe: type,
      }).then((res) => {
        if (res.success) {
          this.$message.success("操作成功");
          this.getSubscribe();
        }
      });
    },
    checkComponent(name) {
      this.componentName = name;
    },
    handleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    handleCustGrpImgError() {
      this.custGrpImgError = true;
    },
    handleCbGrpImgError() {
      this.cbGrpImgError = true;
    },
    handleLcGrpImgError() {
      this.lcGrpImgError = true;
    },
    handleImageError() {
      this.imageLoadError = true;
    },
    fetchCaseAbroadBillInfo() {
      if (!this.caseId) return;
      queryCaseAbroadBillInfo({ caseId: this.caseId, pageSize: 99999 }).then((res) => {
        this.abroadBillList = res.data || [];
      });
    },
    fetchFeeList() {
      if (!this.caseId) return;
      queryCaseFeeInfo({ caseId: this.caseId }).then((res) => {
        this.feeList = res.data || [];
      });
    },
    fetchCaseInfo() {
      if (!this.caseId) return;
      if (this.taskType == 1) {
        queryCaseInfo({ caseIds: this.caseId })
          .then((res) => {
            if (res.success) {
              this.caseInfo = res.data;
            }
          })
          .catch((err) => {
            console.log(err, "err");
          });
      } else if ([2, 3, 5, 6, 7].includes(this.taskType)) {
        lawsuitUrl({ caseIds: this.caseId })
          .then((res) => {
            if (res.success) {
              this.caseInfo = res.data;
            }
          })
          .catch((err) => {
            console.log(err, "err");
          });
      } else if (this.taskType == 4) {
        queryPatentCaseInfo({ caseIds: this.caseId })
          .then((res) => {
            if (res.success) {
              this.caseInfo = res.data;
            }
          })
          .catch((err) => {
            console.log(err, "err");
          });
      }
    },
  },
};

