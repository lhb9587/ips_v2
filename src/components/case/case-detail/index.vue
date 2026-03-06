<script>
import Cover from "@/components/sidebar/components/case/case-cover.vue";
import Info from "@/components/sidebar/components/case/info";
import TimeLimit from "@/components/sidebar/components/case/time-limit";
import Documents from "@/components/sidebar/components/case/document";
import Instruct from "@/components/sidebar/components/case/instruct";
import CaseHandler from "@/components/sidebar/components/case/case-handler";
import Evolve from "@/components/sidebar/components/case/case-evolve";
import Bill from "@/components/sidebar/components/case/bill";
import InsideBill from "@/components/sidebar/components/case/insideBill";
import Fee from "@/components/sidebar/components/case/fee";
import OutsideBill from "@/components/sidebar/components/case/outsideBill";
import Trademark from "@/components/sidebar/components/case/trademark-info";
import Customer from "@/components/sidebar/components/case/customer-info";
import OverseasInfo from "@/components/sidebar/components/case/overseas-info";

//诉讼案件
import LgBaseInfo from "@/components/sidebar/components/case/litigation/base-info";
import LgCustInfo from "@/components/sidebar/components/case/litigation/cust-info";
import LgTmInfo from "@/components/sidebar/components/case/litigation/trademark-info";

//保护案件
import ProtectionBaseInfo from "@/components/sidebar/components/case/protection/base-info";
import ProtectionCustInfo from "@/components/sidebar/components/case/protection/cust-info";
import ProtectionInfringer from "@/components/sidebar/components/case/protection/infringer";

//专利案件
import PatentBaseInfo from "@/components/sidebar/components/case/patent/base-info";
import PatentCustInfo from "@/components/sidebar/components/case/patent/cust-info";
import PatentInfo from "@/components/sidebar/components/case/patent/patent-info";

//域名案件
import DomainBaseInfo from "@/components/sidebar/components/case/domain/base-info";
import DomainCustInfo from "@/components/sidebar/components/case/domain/cust-info";

//著作权案件
import CopyrightBaseInfo from "@/components/sidebar/components/case/copyright/base-info";

//非诉案件
import NonlitigationBaseInfo from "@/components/sidebar/components/case/nonlitigation/base-info";

import {
  queryCaseAbroadBillInfo,
  queryCaseInfo,
  queryCaseFeeInfo,
} from "@/api/caseList";
import { lawsuitUrl, queryPatentCaseInfo } from "@/api/caseDetail";
import { settingsSubscribe, querySubscribe } from "@/api/dashboard";
import { useRoute } from "vue-router";
// const firstNameMap = {
//   1: "Info",
//   2: "LgBaseInfo",
//   3: "ProtectionBaseInfo",
//   4: "PatentBaseInfo",
//   5: "DomainBaseInfo",
//   6: "CopyrightBaseInfo",
//   7: "NonlitigationBaseInfo",
// };
import Layout from "@/layouts/main";

export default {
  setup() {
    const route = useRoute();
    return {
      caseId: Number(route.params.caseId),
      taskType: Number(route.query.taskType),
    };
  },
  //   props: {
  //     caseId: {
  //       type: Number,
  //       required: true,
  //     },
  //     taskType: {
  //       type: Number,
  //       required: true,
  //     },
  //   },
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
    Layout
  },
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
  computed: {
    permissions() {
      const list = this.$store.state?.user?.permissions || [];
      return list;
    },
  },
  watch: {
    caseId: {
      handler() {
        this.fetchCaseInfo();
        this.fetchCaseAbroadBillInfo();
        this.fetchFeeList();
        this.getSubscribe();
      },
    },
  },
  mounted() {
    this.fetchCaseInfo();
    this.fetchCaseAbroadBillInfo();
    this.fetchFeeList();
    this.getSubscribe();
  },
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
    backtoList() {
      // this.$router.push({ name: "case-folders" });
      this.$router.back();
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
  },
};
</script>
<template>
  <Layout>
    <div>
      <div class="case-detail-header">
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
          <h5 style="margin-bottom: 0;display: flex;align-items: center;gap: 6px;">
            <!-- <i
              class="mdi mdi-backspace-outline case-detail-back"
              @click="backtoList"
            ></i> -->
            <button type="button" class="detail-close-btn" aria-label="关闭" @click="backtoList">
              <svg class="detail-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              <span class="detail-close-text">关闭</span>
            </button>
            <span v-if="caseInfo.tmName"> {{ caseInfo.tmName }}； </span>
            <span v-if="caseInfo.agentNum"> {{ caseInfo.agentNum }}； </span>
            <span v-if="caseInfo.caseType"> {{ caseInfo.caseType }}； </span>
            <span v-if="caseInfo.appFromto"> {{ caseInfo.appFromto }}； </span>
            <span v-if="caseInfo.appCnName"> {{ caseInfo.appCnName }}； </span>
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
              ></el-tooltip
            >
          </div>
        </div>
      </div>
      <div class="row h-100 case-detail-content">
        <!-- Right Sidebar -->
        <div class="col-12 h-100 p-0">
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
    </div>
  </Layout>
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

.case-detail-header {
  background-color: #fff;
  padding: 8px 16px;
  position: relative;
}
.case-detail-content {
  padding: 16px;
}
.case-detail-back {
  font-size: 18px;
  cursor: pointer;
  margin-right: 8px;
}
.detail-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 8px 0 8px;
  color: var(--pa-text, #1d2a3a);
  background: var(--pa-page-bg, #f3f6fb);
  border: 1px solid var(--pa-border, #e1e7f2);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.15s;
  flex-shrink: 0;
  font-size: 14px;
}
.detail-close-btn:hover {
  color: var(--pa-text, #1d2a3a);
  background: #e8ecf4;
  border-color: #d0d8e8;
  transform: scale(1.02);
}
.detail-close-btn:active {
  transform: scale(0.98);
}
.detail-close-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.detail-close-text {
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
