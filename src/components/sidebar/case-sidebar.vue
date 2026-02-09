<script>
import Cover from "./components/case/case-cover.vue";
import Info from "./components/case/info";
import TimeLimit from "./components/case/time-limit";
import Documents from "./components/case/document";
import Instruct from "./components/case/instruct";
import CaseHandler from "./components/case/case-handler";
import Evolve from "./components/case/case-evolve";
import Bill from "./components/case/bill";
import InsideBill from "./components/case/insideBill";
import Fee from "./components/case/fee";
import OutsideBill from "./components/case/outsideBill";
import Trademark from "./components/case/trademark-info";
import Customer from "./components/case/customer-info";
import OverseasInfo from "./components/case/overseas-info";

//诉讼案件
import LgBaseInfo from "./components/case/litigation/base-info";
import LgCustInfo from "./components/case/litigation/cust-info";
import LgTmInfo from "./components/case/litigation/trademark-info";

//保护案件
import ProtectionBaseInfo from "./components/case/protection/base-info";
import ProtectionCustInfo from "./components/case/protection/cust-info";
import ProtectionInfringer from "./components/case/protection/infringer";

//专利案件
import PatentBaseInfo from "./components/case/patent/base-info";
import PatentCustInfo from "./components/case/patent/cust-info";
import PatentInfo from "./components/case/patent/patent-info";

//域名案件
import DomainBaseInfo from "./components/case/domain/base-info";
import DomainCustInfo from "./components/case/domain/cust-info";

//著作权案件
import CopyrightBaseInfo from "./components/case/copyright/base-info";

//非诉案件
import NonlitigationBaseInfo from "./components/case/nonlitigation/base-info";

import {
  queryCaseAbroadBillInfo,
  queryCaseInfo,
  queryCaseFeeInfo,
} from "@/api/caseList";
import { lawsuitUrl, queryPatentCaseInfo } from "@/api/caseDetail";
import { setSidebarWidth, getSidebarWidth } from "@/utils/user";
import { settingsSubscribe, querySubscribe } from "@/api/dashboard";
// const firstNameMap = {
//   1: "Info",
//   2: "LgBaseInfo",
//   3: "ProtectionBaseInfo",
//   4: "PatentBaseInfo",
//   5: "DomainBaseInfo",
//   6: "CopyrightBaseInfo",
//   7: "NonlitigationBaseInfo",
// };
export default {
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    // caseInfo: {
    //   type: Object,
    //   required: true,
    // },
    caseId: {
      type: Number,
      required: true,
    },
    taskType: {
      type: Number,
      required: true,
    },
  },
  components: {
    Cover,
    Info,
    TimeLimit,
    Documents,
    Instruct,
    CaseHandler,
    Evolve,
    Bill,
    InsideBill,
    Fee,
    OutsideBill,
    Trademark,
    Customer,
    OverseasInfo,
    LgBaseInfo,
    LgCustInfo,
    LgTmInfo,
    ProtectionBaseInfo,
    PatentBaseInfo,
    PatentCustInfo,
    PatentInfo,
    ProtectionCustInfo,
    ProtectionInfringer,
    DomainBaseInfo,
    DomainCustInfo,
    CopyrightBaseInfo,
    NonlitigationBaseInfo,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: "Cover",
      abroadBillList: [],
      caseInfo: {},
      imageLoadError: false,
      custGrpImgError: false,
      cbGrpImgError: false,
      lcGrpImgError: false,
      feeList: [],
      dragging: false,
      startX: 0,
      currentWidth: 0,
      initialWidth: 0,
      isFullWidth: false,
      subscribeStatus: false,
    };
  },
  computed: {
    isnotPc() {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    },
    permissions(){
      const list = this.$store.state?.user?.permissions || []
      return list
    },
  },
  watch: {
    // taskType: {
    //   handler(newVal) {
    //     this.componentName = firstNameMap[newVal] || "Info";
    //   },
    // },
    caseId: {
      handler() {
        this.fetchCaseInfo();
        this.fetchCaseAbroadBillInfo();
        this.fetchFeeList();
        this.getSubscribe();
        // const type = firstNameMap[this.taskType] || "Info";
        // this.componentName = type;
      },
    },
  },
  mounted() {
    this.show = this.showSidebar;
    this.fetchCaseInfo();
    this.fetchCaseAbroadBillInfo();
    this.fetchFeeList();
    this.getSubscribe();
    // const type = firstNameMap[this.taskType] || "Info";
    // this.componentName = type;
    // 获取初始宽度
    this.$nextTick(() => {
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        const obj = getSidebarWidth() || {};
        if (obj["case-sidebar"]) {
          const width = obj["case-sidebar"];
          const maxWidth = window.innerWidth - 70;
          if (String(width).includes("%")) {
            offcanvas.style.width = width;
            this.initialWidth = width;
            this.currentWidth = width;
          } else {
            const fromatWidth = width > maxWidth ? maxWidth : width
            offcanvas.style.width = `${fromatWidth}px`;
            this.initialWidth = `${fromatWidth}px`;
            this.currentWidth = `${fromatWidth}px`;
          }
          this.isFullWidth = width == maxWidth;
        } else {
          this.initialWidth = offcanvas.offsetWidth;
          this.currentWidth = this.initialWidth;
        }
      }
    });
  },
  // watch: {
  //   caseId: {
  //     handler(newVal) {
  //       if (newVal) {
  //         this.fetchCaseAbroadBillInfo();
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  methods: {
    getSubscribe() {
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
    toggleFullWidth() {
      this.isFullWidth = !this.isFullWidth;
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        const maxWidth = window.innerWidth - 70;
        offcanvas.style.width = this.isFullWidth ? maxWidth + "px" : "80%";
        const obj = getSidebarWidth() || {};
        obj["case-sidebar"] = this.isFullWidth ? maxWidth : "80%";
        setSidebarWidth(JSON.stringify(obj));
      }
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
    handleHidden() {
      this.$emit("update:showSidebar", false);
    },
    checkComponent(name) {
      this.componentName = name;
    },
    handleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    fetchCaseAbroadBillInfo() {
      queryCaseAbroadBillInfo({ caseId: this.caseId, pageSize: 99999 }).then(
        (res) => {
          this.abroadBillList = res.data || [];
        }
      );
    },
    fetchFeeList() {
      queryCaseFeeInfo({ caseId: this.caseId }).then((res) => {
        this.feeList = res.data || [];
      });
    },
    fetchCaseInfo() {
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
    handleDragStart(e) {
      this.dragging = true;
      this.startX = e.clientX;
      const offcanvas = document.querySelector(".offcanvas-end");
      this.currentWidth = offcanvas.offsetWidth;
      document.addEventListener("mousemove", this.handleDrag);
      document.addEventListener("mouseup", this.handleDragEnd);
      // 防止文本选中
      document.body.style.userSelect = "none";
    },
    handleDrag(e) {
      if (!this.dragging) return;
      const dx = this.startX - e.clientX;
      const minWidth = Math.max(window.innerWidth * 0.7, 400); // 取30%和400px中的较大值
      const maxWidth = window.innerWidth - 70;
      const newWidth = Math.min(
        Math.max(this.currentWidth + dx, minWidth),
        maxWidth
      );
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        offcanvas.style.width = `${newWidth}px`;
        const obj = getSidebarWidth() || {};
        obj["case-sidebar"] = newWidth;
        setSidebarWidth(JSON.stringify(obj));
      }
    },
    handleDragEnd() {
      this.dragging = false;
      document.removeEventListener("mousemove", this.handleDrag);
      document.removeEventListener("mouseup", this.handleDragEnd);
      document.body.style.userSelect = "";
      // 保存最终宽度
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        this.currentWidth = offcanvas.offsetWidth;
      }
    },
  },
};
</script>
<template>
  <div>
    <BOffcanvas
      v-model="show"
      @hidden="handleHidden"
      :placement="'end'"
      :backdrop="false"
      responsive="md"
      :no-close-on-esc="true"
    >
      <div
        class="drag-handle"
        @mousedown="handleDragStart"
        v-if="!isnotPc"
      ></div>
      <template #header>
        <div class="custom-offcanvas-header">
          <b-button
            variant="close"
            class="close-btn-custom"
            @click="handleHidden"
          ></b-button>
          <div
            class="offcanvas-title"
            id="offcanvasRightLabel"
            style="
              width: 100%;
              height: auto;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <h5 style="margin-bottom: 0">
              <span v-if="caseInfo.tmName"> {{ caseInfo.tmName }}； </span>
              <span v-if="caseInfo.agentNum"> {{ caseInfo.agentNum }}； </span>
              <span v-if="caseInfo.caseType"> {{ caseInfo.caseType }}； </span>
              <span v-if="caseInfo.appFromto">
                {{ caseInfo.appFromto }}；
              </span>
              <span v-if="caseInfo.appCnName">
                {{ caseInfo.appCnName }}；
              </span>
            </h5>
            <div>
              <el-tooltip
                v-if="!subscribeStatus"
                placement="bottom-start"
                content="点击关注此案件将出现在「我的关注」中；符合条件的案件变动将显示在「重要案件」中。"
                trigger="hover"
                effect="light"
              >
                <el-button
                  type="primary"
                  @click="handleSubscribe(1)"
                  >关注</el-button
                >
              </el-tooltip>
              <el-tooltip
                v-else
                placement="bottom-start"
                content="取消关注后，该案件将从「我的关注」中移除，且不再接收重要信息提醒。"
                trigger="hover"
                effect="light"
              >
              <el-button
                type="danger"
                @click="handleSubscribe(0)"
                >取消关注</el-button
              ></el-tooltip>
            </div>
          </div>
        </div>
      </template>
      <!-- 全屏切换按钮 -->
      <div
        v-if="show && isnotPc"
        class="full-width-toggle"
        @click="toggleFullWidth"
      >
        <i
          class="bx"
          :class="isFullWidth ? 'bx-chevron-right' : 'bx-chevron-left'"
          style="font-size: 20px"
        ></i>
      </div>
      <div class="row h-100">
        <!-- Right Sidebar -->
        <div class="col-12 h-100">
          <div
            v-if="isExpanded"
            class="email-leftbar card mb-0 h-100"
            style="overflow-y: auto"
          >
            <div class="text-center">
              <img
                v-if="caseInfo.imageFile && !imageLoadError"
                :src="`/ipdoc${caseInfo.imageFile}`"
                alt=""
                height="50"
                style="max-width: 200px"
                class="mx-auto d-block"
                @error="handleImageError"
              />
              <h5 class="mt-3 mb-3">{{ caseInfo.tmName }}</h5>
            </div>
            <h6>
              <span
                class="mdi mdi-arrow-right-drop-circle text-info float-end cursor-pointer"
              ></span
              >案件详情
            </h6>

            <div
              class="mail-list mt-1"
              v-if="taskType == 1"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="componentName == 'Info' ? 'active' : ''"
                @click="checkComponent('Info')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                :class="componentName == 'Trademark' ? 'active' : ''"
                @click="checkComponent('Trademark')"
                class="leftbar-item"
              >
                <i class="mdi mdi-alpha-a-circle-outline me-2"></i>商标信息
              </a>
              <a
                :class="componentName == 'Customer' ? 'active' : ''"
                @click="checkComponent('Customer')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
              <a
                :class="componentName == 'OverseasInfo' ? 'active' : ''"
                @click="checkComponent('OverseasInfo')"
                class="leftbar-item"
                v-if="
                  !(
                    caseInfo.appFromto == '内-内' ||
                    caseInfo.appFromto == '外-内'
                  )
                "
              >
                <i class="mdi mdi-earth me-2"></i>境外信息
              </a>
              <!-- <a
                
                :class="componentName == 'Files' ? 'active' : ''"
                @click="checkComponent('Files')"
              >
                <i class="mdi mdi-file-outline me-2"></i>档案管理
              </a> -->
            </div>
            <div
              class="mail-list mt-1"
              v-if="taskType == 2"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="componentName == 'LgBaseInfo' ? 'active' : ''"
                @click="checkComponent('LgBaseInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                v-if="caseInfo.caseTypeId == 94 || caseInfo.caseTypeId == 21"
                :class="componentName == 'LgTmInfo' ? 'active' : ''"
                @click="checkComponent('LgTmInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-alpha-a-circle-outline me-2"></i>商标信息
              </a>
              <a
                :class="componentName == 'LgCustInfo' ? 'active' : ''"
                @click="checkComponent('LgCustInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
            </div>

            <div
              class="mail-list mt-1"
              v-if="taskType == 3"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="componentName == 'ProtectionBaseInfo' ? 'active' : ''"
                @click="checkComponent('ProtectionBaseInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                :class="componentName == 'ProtectionCustInfo' ? 'active' : ''"
                @click="checkComponent('ProtectionCustInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
              <a
                :class="componentName == 'ProtectionInfringer' ? 'active' : ''"
                @click="checkComponent('ProtectionInfringer')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-alert-outline me-2"></i>侵权人信息
              </a>
            </div>
            <div
              class="mail-list mt-1"
              v-if="taskType == 4"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="componentName == 'PatentBaseInfo' ? 'active' : ''"
                @click="checkComponent('PatentBaseInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                :class="componentName == 'PatentInfo' ? 'active' : ''"
                @click="checkComponent('PatentInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>专利信息
              </a>
              <a
                :class="componentName == 'PatentCustInfo' ? 'active' : ''"
                @click="checkComponent('PatentCustInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
            </div>
            <div
              class="mail-list mt-1"
              v-if="taskType == 5"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="componentName == 'DomainBaseInfo' ? 'active' : ''"
                @click="checkComponent('DomainBaseInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                :class="componentName == 'DomainCustInfo' ? 'active' : ''"
                @click="checkComponent('DomainCustInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
            </div>
            <div
              class="mail-list mt-1"
              v-if="taskType == 6"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="componentName == 'CopyrightBaseInfo' ? 'active' : ''"
                @click="checkComponent('CopyrightBaseInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                :class="componentName == 'DomainCustInfo' ? 'active' : ''"
                @click="checkComponent('DomainCustInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
            </div>
            <div
              class="mail-list mt-1"
              v-if="taskType == 7"
            >
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>案件封面
              </a>
              <a
                :class="
                  componentName == 'NonlitigationBaseInfo' ? 'active' : ''
                "
                @click="checkComponent('NonlitigationBaseInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
              </a>
              <a
                :class="componentName == 'DomainCustInfo' ? 'active' : ''"
                @click="checkComponent('DomainCustInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
              </a>
            </div>
            <h6 class="mt-4">
              <span
                class="mdi mdi-arrow-right-drop-circle text-success float-end cursor-pointer"
              ></span
              >案件进展
            </h6>

            <div class="mail-list mt-1">
              <a
                :class="componentName == 'Evolve' ? 'active' : ''"
                @click="checkComponent('Evolve')"
                class="leftbar-item"
              >
                <i class="mdi mdi-timeline-check-outline me-2"></i>详情进展
              </a>
              <a
                :class="componentName == 'TimeLimit' ? 'active' : ''"
                @click="checkComponent('TimeLimit')"
                class="leftbar-item"
              >
                <i class="mdi mdi-alarm me-2"></i>时限
              </a>
              <a
                :class="componentName == 'Documents' ? 'active' : ''"
                @click="checkComponent('Documents')"
                class="leftbar-item"
              >
                <i class="mdi mdi-email-outline me-2"></i>电子文档
              </a>
            </div>

            <h6 class="mt-4">
              <span
                class="mdi mdi-arrow-right-drop-circle text-success float-end cursor-pointer"
              ></span
              >账单费用
            </h6>

            <div class="mail-list mt-1">
              <a
                :class="componentName == 'Bill' ? 'active' : ''"
                @click="checkComponent('Bill')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-document-outline me-2"></i>账单
                <span class="ms-1 float-end"
                  >({{ caseInfo.caseBillArray?.length || 0 }})</span
                >
              </a>
              <a
                :class="componentName == 'InsideBill' ? 'active' : ''"
                @click="checkComponent('InsideBill')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-account-outline me-2"></i>内部账单
                <span class="ms-1 float-end"
                  >({{ caseInfo.caseBillInternalArray?.length || 0 }})</span
                >
              </a>
              <!-- <a  :class="componentName == 'TrawSheet' ? 'active' : ''" @click="checkComponent('TrawSheet')">
              <i class="mdi mdi-file-document-edit-outline me-2"></i>草单
              <span class="ms-1 float-end">({{ caseInfo.caseBillRecordArray.length || 0 }})</span>
            </a> -->
              <a
                :class="componentName == 'Fee' ? 'active' : ''"
                @click="checkComponent('Fee')"
                class="leftbar-item"
              >
                <i class="mdi mdi-credit-card-check-outline me-2"></i>费用
                <span class="ms-1 float-end"
                  >({{ caseInfo.caseFeeArray?.length || 0 }})</span
                >
              </a>
              <!-- <a  :class="componentName == 'Invoice' ? 'active' : ''" @click="checkComponent('Invoice')">
              <i class="mdi mdi-file-powerpoint-outline me-2"></i>发票
              <span class="ms-1 float-end">({{ caseInfo.receiptList?.length || 0 }})</span>
            </a> -->
              <a
                :class="componentName == 'OutsideBill' ? 'active' : ''"
                @click="checkComponent('OutsideBill')"
                class="leftbar-item"
              >
                <i class="mdi mdi-earth me-2"></i>境外账单
                <span class="ms-1 float-end"
                  >({{ abroadBillList.length || 0 }})</span
                >
              </a>
            </div>

            <h6
              class="mt-4 cursor-pointer leftbar-item"
              :class="componentName == 'Instruct' ? 'cp-active' : ''"
              @click="checkComponent('Instruct')"
            >
              特殊指示
            </h6>

            <h6
              class="mt-4 cursor-pointer"
              :class="componentName == 'CaseHandler' ? 'cp-active' : ''"
              @click="checkComponent('CaseHandler')"
            >
              办案人
            </h6>

            <div
              class="mt-2"
              v-for="item of caseInfo.trademarkCaseCustWorkgroups"
              :key="item.groupId"
            >
              <div
                class="d-flex"
                style="cursor: pointer"
                @click="checkComponent('CaseHandler')"
              >
                <img
                  v-if="item.wkgIcon && !custGrpImgError"
                  class="d-flex me-3 rounded-circle"
                  :src="`/ipdoc${item.wkgIcon}`"
                  alt=""
                  height="36"
                  width="36"
                  @error="handleCustGrpImgError"
                />
                <img
                  v-else
                  class="d-flex me-3 rounded-circle"
                  src="@/assets/images/users/defaultavatar.png"
                  alt=""
                  height="36"
                  width="36"
                />
                <div class="flex-grow-1 chat-user-box">
                  <div class="user-title m-0">{{ item.groupName }}</div>
                  <div class="text-muted">客户组</div>
                </div>
              </div>
            </div>
            <div
              class="mt-2"
              v-for="item of caseInfo.trademarkCaseCBWorkgroups"
              :key="item.groupId"
            >
              <div
                class="d-flex"
                style="cursor: pointer"
                @click="checkComponent('CaseHandler')"
              >
                <img
                  class="d-flex me-3 rounded-circle"
                  :src="`/ipdoc${item.wkgIcon}`"
                  alt=""
                  height="36"
                  width="36"
                  v-if="item.wkgIcon && !cbGrpImgError"
                  @error="handleCbGrpImgError"
                />
                <img
                  v-else
                  class="d-flex me-3 rounded-circle"
                  src="@/assets/images/users/defaultavatar.png"
                  alt=""
                  height="36"
                  width="36"
                />
                <div class="flex-grow-1 chat-user-box">
                  <div class="user-title m-0">{{ item.groupName }}</div>
                  <div class="text-muted">承办组</div>
                </div>
              </div>
            </div>
            <div
              class="mt-2"
              v-for="item of caseInfo.trademarkCaseLCWorkgroups"
              :key="item.groupId"
            >
              <div
                class="d-flex"
                @click="checkComponent('CaseHandler')"
                style="cursor: pointer"
              >
                <img
                  class="d-flex me-3 rounded-circle"
                  :src="`/ipdoc${item.wkgIcon}`"
                  alt=""
                  height="36"
                  width="36"
                  v-if="item.wkgIcon && !lcGrpImgError"
                  @error="handleLcGrpImgError"
                />
                <img
                  v-else
                  class="d-flex me-3 rounded-circle"
                  src="@/assets/images/users/defaultavatar.png"
                  alt=""
                  height="36"
                  width="36"
                />
                <div class="flex-grow-1 chat-user-box">
                  <div class="user-title m-0">{{ item.groupName }}</div>
                  <div class="text-muted">流程组</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 展开功能 -->
          <span
            class="detial-expanded"
            @click="handleExpanded()"
          >
            <div class="expanded-div">
              <i
                :class="
                  isExpanded ? 'bx bx-chevron-left' : 'bx bx-chevron-right'
                "
              ></i>
            </div>
          </span>

          <!-- <span class="mdi mdi-arrow-right-drop-circle text-info cursor-pointer"></span> -->
          <div
            :class="isExpanded ? 'email-rightbar mb-3' : 'mx-4'"
            class="h-100"
            style="overflow-y: auto"
          >
            <!-- 动态组件调用 -->
            <component
              :is="componentName"
              :caseInfo="caseInfo"
              :abroadBillList="abroadBillList"
              :feeList="feeList"
              :taskType="taskType"
              @change-component="checkComponent"
            ></component>
          </div>
        </div>
      </div>
    </BOffcanvas>
  </div>
</template>

<style scoped>
.drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
}

.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.drag-handle:active {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
