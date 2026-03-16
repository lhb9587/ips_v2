<template>
  <div :class="rootClass">
    <div :class="colClass">
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
            @error="$emit('image-error')"
          />
          <h5 class="mt-3 mb-3">{{ caseInfo.tmName }}</h5>
        </div>
        <h6>
          <span class="mdi mdi-arrow-right-drop-circle text-info float-end cursor-pointer"></span>
          案件详情
        </h6>

        <div
          class="mail-list mt-1"
          v-if="taskType == 1"
        >
          <a
            :class="componentName == 'Cover' ? 'active' : ''"
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'Info' ? 'active' : ''"
            @click="$emit('set-component', 'Info')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            :class="componentName == 'Trademark' ? 'active' : ''"
            @click="$emit('set-component', 'Trademark')"
            class="leftbar-item"
          >
            <i class="mdi mdi-alpha-a-circle-outline me-2"></i>商标信息
          </a>
          <a
            :class="componentName == 'Customer' ? 'active' : ''"
            @click="$emit('set-component', 'Customer')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
          </a>
          <a
            v-if="showAliMonthlyReportInfoNav"
            :class="componentName == 'AliMonthlyReportInfo' ? 'active' : ''"
            @click="$emit('set-component', 'AliMonthlyReportInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-file-chart-outline me-2"></i>阿里月报信息
          </a>
          <a
            :class="componentName == 'ApplicantInfo' ? 'active' : ''"
            @click="$emit('set-component', 'ApplicantInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-outline me-2"></i>申请人信息
          </a>
          <a
            v-if="!caseInfo.usAgency && caseInfo.caseType === '转让/移转'"
            :class="componentName == 'TransferorInfo' ? 'active' : ''"
            @click="$emit('set-component', 'TransferorInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-switch-outline me-2"></i>转让人信息
          </a>
          <a
            v-if="!caseInfo.usAgency && (caseInfo.caseType === '许可备案' || caseInfo.caseType === '许可备案提前终止')"
            :class="componentName == 'LicenseeInfo' ? 'active' : ''"
            @click="$emit('set-component', 'LicenseeInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-star-outline me-2"></i>被许可人信息
          </a>
          <a
            v-if="showLawReasonInfoNav"
            :class="componentName == 'LawReasonInfo' ? 'active' : ''"
            @click="$emit('set-component', 'LawReasonInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-scale-balance me-2"></i>法律条款和事实理由
          </a>
          <a
            v-if="showSupplementEvidenceInfoNav"
            :class="componentName == 'SupplementEvidenceInfo' ? 'active' : ''"
            @click="$emit('set-component', 'SupplementEvidenceInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-folder-multiple-image me-2"></i>补充证据
          </a>
          <a
            v-if="showRespondentInfoNav"
            :class="componentName == 'RespondentInfo' ? 'active' : ''"
            @click="$emit('set-component', 'RespondentInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-search-outline me-2"></i>{{ respondentInfoNavLabel }}
          </a>
          <a
            :class="componentName == 'OverseasInfo' ? 'active' : ''"
            @click="$emit('set-component', 'OverseasInfo')"
            class="leftbar-item"
            v-if="!(caseInfo.appFromto == '内-内' || caseInfo.appFromto == '外-内')"
          >
            <i class="mdi mdi-earth me-2"></i>境外信息
          </a>
          <a
            v-if="showOpponentInfoNav"
            :class="componentName == 'OpponentInfo' ? 'active' : ''"
            @click="$emit('set-component', 'OpponentInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-group-outline me-2"></i>异议人信息
          </a>
          <a
            v-if="showBaseRegisterInfoNav"
            :class="componentName == 'BaseRegisterInfo' ? 'active' : ''"
            @click="$emit('set-component', 'BaseRegisterInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-table-large me-2"></i>基础注册信息
          </a>
        </div>

        <div
          class="mail-list mt-1"
          v-if="taskType == 2"
        >
          <a
            :class="componentName == 'Cover' ? 'active' : ''"
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'LgBaseInfo' ? 'active' : ''"
            @click="$emit('set-component', 'LgBaseInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            v-if="caseInfo.caseTypeId == 94 || caseInfo.caseTypeId == 21"
            :class="componentName == 'LgTmInfo' ? 'active' : ''"
            @click="$emit('set-component', 'LgTmInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-alpha-a-circle-outline me-2"></i>商标信息
          </a>
          <a
            :class="componentName == 'LgCustInfo' ? 'active' : ''"
            @click="$emit('set-component', 'LgCustInfo')"
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
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'ProtectionBaseInfo' ? 'active' : ''"
            @click="$emit('set-component', 'ProtectionBaseInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            :class="componentName == 'ProtectionCustInfo' ? 'active' : ''"
            @click="$emit('set-component', 'ProtectionCustInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
          </a>
          <a
            :class="componentName == 'ProtectionInfringer' ? 'active' : ''"
            @click="$emit('set-component', 'ProtectionInfringer')"
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
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'PatentBaseInfo' ? 'active' : ''"
            @click="$emit('set-component', 'PatentBaseInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            :class="componentName == 'PatentInfo' ? 'active' : ''"
            @click="$emit('set-component', 'PatentInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>专利信息
          </a>
          <a
            :class="componentName == 'PatentCustInfo' ? 'active' : ''"
            @click="$emit('set-component', 'PatentCustInfo')"
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
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'DomainBaseInfo' ? 'active' : ''"
            @click="$emit('set-component', 'DomainBaseInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            :class="componentName == 'DomainCustInfo' ? 'active' : ''"
            @click="$emit('set-component', 'DomainCustInfo')"
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
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'CopyrightBaseInfo' ? 'active' : ''"
            @click="$emit('set-component', 'CopyrightBaseInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            :class="componentName == 'DomainCustInfo' ? 'active' : ''"
            @click="$emit('set-component', 'DomainCustInfo')"
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
            @click="$emit('set-component', 'Cover')"
            class="leftbar-item"
          >
            <i class="bx bx-customize me-2"></i>案件封面
          </a>
          <a
            :class="componentName == 'NonlitigationBaseInfo' ? 'active' : ''"
            @click="$emit('set-component', 'NonlitigationBaseInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-clipboard-text-outline me-2"></i>基础信息
          </a>
          <a
            :class="componentName == 'DomainCustInfo' ? 'active' : ''"
            @click="$emit('set-component', 'DomainCustInfo')"
            class="leftbar-item"
          >
            <i class="mdi mdi-account-plus-outline me-2"></i>客户信息
          </a>
        </div>

        <h6 class="mt-4">
          <span class="mdi mdi-arrow-right-drop-circle text-success float-end cursor-pointer"></span>
          案件进展
        </h6>

        <div class="mail-list mt-1">
          <a
            :class="componentName == 'Evolve' ? 'active' : ''"
            @click="$emit('set-component', 'Evolve')"
            class="leftbar-item"
          >
            <i class="mdi mdi-timeline-check-outline me-2"></i>详情进展
          </a>
          <a
            :class="componentName == 'TimeLimit' ? 'active' : ''"
            @click="$emit('set-component', 'TimeLimit')"
            class="leftbar-item"
          >
            <i class="mdi mdi-alarm me-2"></i>时限
          </a>
          <a
            :class="componentName == 'Documents' ? 'active' : ''"
            @click="$emit('set-component', 'Documents')"
            class="leftbar-item"
          >
            <i class="mdi mdi-email-outline me-2"></i>电子文档
          </a>
        </div>

        <h6 class="mt-4">
          <span class="mdi mdi-arrow-right-drop-circle text-success float-end cursor-pointer"></span>
          账单费用
        </h6>

        <div class="mail-list mt-1">
          <a
            :class="componentName == 'Bill' ? 'active' : ''"
            @click="$emit('set-component', 'Bill')"
            class="leftbar-item"
          >
            <i class="mdi mdi-file-document-outline me-2"></i>账单
            <span class="ms-1 float-end">({{ caseInfo.caseBillArray?.length || 0 }})</span>
          </a>
          <a
            :class="componentName == 'InsideBill' ? 'active' : ''"
            @click="$emit('set-component', 'InsideBill')"
            class="leftbar-item"
          >
            <i class="mdi mdi-file-account-outline me-2"></i>内部账单
            <span class="ms-1 float-end">({{ caseInfo.caseBillInternalArray?.length || 0 }})</span>
          </a>
          <a
            :class="componentName == 'Fee' ? 'active' : ''"
            @click="$emit('set-component', 'Fee')"
            class="leftbar-item"
          >
            <i class="mdi mdi-credit-card-check-outline me-2"></i>费用
            <span class="ms-1 float-end">({{ caseInfo.caseFeeArray?.length || 0 }})</span>
          </a>
          <a
            :class="componentName == 'OutsideBill' ? 'active' : ''"
            @click="$emit('set-component', 'OutsideBill')"
            class="leftbar-item"
          >
            <i class="mdi mdi-earth me-2"></i>境外账单
            <span class="ms-1 float-end">({{ abroadBillList.length || 0 }})</span>
          </a>
        </div>

        <h6
          class="mt-4 cursor-pointer leftbar-item"
          :class="componentName == 'Instruct' ? 'cp-active' : ''"
          @click="$emit('set-component', 'Instruct')"
        >
          特殊指示
        </h6>

        <h6
          class="mt-4 cursor-pointer"
          :class="componentName == 'CaseHandler' ? 'cp-active' : ''"
          @click="$emit('set-component', 'CaseHandler')"
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
            @click="$emit('set-component', 'CaseHandler')"
          >
            <img
              v-if="item.wkgIcon && !custGrpImgError"
              class="d-flex me-3 rounded-circle"
              :src="`/ipdoc${item.wkgIcon}`"
              alt=""
              height="36"
              width="36"
              @error="$emit('cust-grp-img-error')"
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
            @click="$emit('set-component', 'CaseHandler')"
          >
            <img
              class="d-flex me-3 rounded-circle"
              :src="`/ipdoc${item.wkgIcon}`"
              alt=""
              height="36"
              width="36"
              v-if="item.wkgIcon && !cbGrpImgError"
              @error="$emit('cb-grp-img-error')"
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
            @click="$emit('set-component', 'CaseHandler')"
            style="cursor: pointer"
          >
            <img
              class="d-flex me-3 rounded-circle"
              :src="`/ipdoc${item.wkgIcon}`"
              alt=""
              height="36"
              width="36"
              v-if="item.wkgIcon && !lcGrpImgError"
              @error="$emit('lc-grp-img-error')"
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

      <span
        class="detial-expanded"
        @click="$emit('toggle-expanded')"
      >
        <div class="expanded-div">
          <i
            :class="isExpanded ? 'bx bx-chevron-left' : 'bx bx-chevron-right'"
          ></i>
        </div>
      </span>

      <div
        :class="isExpanded ? 'email-rightbar mb-3' : 'mx-4'"
        class="h-100"
        style="overflow-y: auto"
      >
        <component
          :is="componentName"
          :caseInfo="caseInfo"
          :abroadBillList="abroadBillList"
          :feeList="feeList"
          :taskType="taskType"
          @change-component="$emit('set-component', $event)"
        ></component>
      </div>
    </div>
  </div>
</template>

<script>
import Cover from "@/components/sidebar/components/case/case-cover.vue";
import Info from "@/components/sidebar/components/case/trademark/info";
import TimeLimit from "@/components/sidebar/components/case/time-limit";
import Documents from "@/components/sidebar/components/case/document";
import Instruct from "@/components/sidebar/components/case/instruct";
import CaseHandler from "@/components/sidebar/components/case/case-handler";
import Evolve from "@/components/sidebar/components/case/case-evolve";
import Bill from "@/components/sidebar/components/case/bill";
import InsideBill from "@/components/sidebar/components/case/insideBill";
import Fee from "@/components/sidebar/components/case/fee";
import OutsideBill from "@/components/sidebar/components/case/outsideBill";
import Trademark from "@/components/sidebar/components/case/trademark/trademark-info";
import Customer from "@/components/sidebar/components/case/trademark/customer-info";
import AliMonthlyReportInfo from "@/components/sidebar/components/case/trademark/ali-monthly-report-info";
import ApplicantInfo from "@/components/sidebar/components/case/trademark/applicant-info";
import TransferorInfo from "@/components/sidebar/components/case/trademark/transferor-info";
import LicenseeInfo from "@/components/sidebar/components/case/trademark/licensee-info";
import LawReasonInfo from "@/components/sidebar/components/case/trademark/law-reason-info";
import SupplementEvidenceInfo from "@/components/sidebar/components/case/trademark/supplement-evidence-info";
import RespondentInfo from "@/components/sidebar/components/case/trademark/respondent-info";
import OpponentInfo from "@/components/sidebar/components/case/trademark/opponent-info";
import OverseasInfo from "@/components/sidebar/components/case/trademark/overseas-info";
import BaseRegisterInfo from "@/components/sidebar/components/case/trademark/base-register-info";

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

const RESPONDENT_SHOW_TYPE_CASES = ["异议", "无效宣告申请", "无效宣告答辩"];
const RESPONDENT_EXTRA_CASES = [
  "不予注册复审",
  "无效宣告复审",
  "撤销商标复审",
  "撤销复审答辩",
  "撤三答辩（提供使用证明）",
  "撤销通用名称答辩",
  "撤销三年停止使用申请",
  "参加不予注册复审",
];

export default {
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
    AliMonthlyReportInfo,
    ApplicantInfo,
    TransferorInfo,
    LicenseeInfo,
    LawReasonInfo,
    SupplementEvidenceInfo,
    RespondentInfo,
    OpponentInfo,
    OverseasInfo,
    BaseRegisterInfo,
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
  props: {
    taskType: {
      type: Number,
      required: true,
    },
    componentName: {
      type: String,
      required: true,
    },
    isExpanded: {
      type: Boolean,
      required: true,
    },
    abroadBillList: {
      type: Array,
      required: true,
    },
    feeList: {
      type: Array,
      required: true,
    },
    caseInfo: {
      type: Object,
      required: true,
    },
    imageLoadError: {
      type: Boolean,
      required: true,
    },
    custGrpImgError: {
      type: Boolean,
      required: true,
    },
    cbGrpImgError: {
      type: Boolean,
      required: true,
    },
    lcGrpImgError: {
      type: Boolean,
      required: true,
    },
    rootClass: {
      type: String,
      default: "row h-100 case-detail-content",
    },
    colClass: {
      type: String,
      default: "col-12 h-100 p-0",
    },
  },
  computed: {
    showAliMonthlyReportInfoNav() {
      return !!this.caseInfo.custName && this.caseInfo.custName.includes("阿里");
    },
    showLawReasonInfoNav() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "异议";
    },
    showSupplementEvidenceInfoNav() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "异议";
    },
    showOpponentInfoNav() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "异议答辩";
    },
    showBaseRegisterInfoNav() {
      const appFromto = this.caseInfo.appFromto || "";
      const isMadridRegister =
        this.caseInfo.madrid === true ||
        this.caseInfo.madrid === 1 ||
        this.caseInfo.madrid === "1";
      return !this.caseInfo.usAgency &&
        ["内-外", "外-外"].includes(appFromto) &&
        isMadridRegister &&
        this.caseInfo.caseType !== "出具优先权证明文件";
    },
    showRespondentInfoNav() {
      const caseType = this.caseInfo.caseType || "";
      return !this.caseInfo.usAgency && (
        RESPONDENT_SHOW_TYPE_CASES.includes(caseType) ||
        RESPONDENT_EXTRA_CASES.includes(caseType)
      );
    },
    respondentInfoNavLabel() {
      return this.caseInfo.caseType === "异议" ? "被异议人信息" : "被申请人信息";
    },
  },
  emits: [
    "set-component",
    "toggle-expanded",
    "image-error",
    "cust-grp-img-error",
    "cb-grp-img-error",
    "lc-grp-img-error",
  ],
};
</script>

<style scoped></style>

