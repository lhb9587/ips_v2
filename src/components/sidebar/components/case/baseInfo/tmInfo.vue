<template>
  <div class="table-responsive">
    <table
      class="table table-nowrap mb-0"
      style="width: 100%"
    >
      <tbody>
        <tr v-if="caseInfo.usAgency">
          <th
            scope="row"
            style="width: 10%"
          >
            案件名称 :
          </th>
          <td style="width: 40%">{{ caseInfo.caseName }}</td>
          <th
            scope="row"
            style="width: 10%"
          >
            案件文号 :
          </th>
          <td style="width: 40%">{{ caseInfo.agentNum }}</td>
        </tr>
        <tr v-if="caseInfo.usAgency && isForeignDirection">
          <th scope="row">合作所评分 :</th>
          <td>{{ caseInfo.score }}分</td>
          <th scope="row">合作所评价 :</th>
          <td>{{ caseInfo.evaluate }}</td>
        </tr>
        <tr v-if="caseInfo.usAgency">
          <th scope="row">案件备注 :</th>
          <td colspan="3">{{ caseInfo.remarks }}</td>
        </tr>

        <tr v-if="!caseInfo.usAgency">
          <th
            scope="row"
            style="width: 10%"
          >
            案件类型 :
          </th>
          <td style="width: 40%">{{ caseInfo.caseType }}</td>
          <th
            scope="row"
            style="width: 10%"
          >
            申请方向 :
          </th>
          <td style="width: 40%">{{ caseInfo.appFromto }}</td>
        </tr>
        <tr v-if="showWithdrawCaseType">
          <th scope="row">撤回案件类型 :</th>
          <td colspan="3">{{ caseInfo.changeType }}</td>
        </tr>
        <tr v-if="!caseInfo.usAgency">
          <th scope="row">所属项目 :</th>
          <td>{{ caseInfo.project }}</td>
          <th scope="row">合同编号 :</th>
          <td>{{ caseInfo.contractNumber || caseInfo.contractNo }}</td>
        </tr>
        <tr v-if="!caseInfo.usAgency">
          <th scope="row">案件文号 :</th>
          <td>{{ caseInfo.agentNum }}</td>
          <th scope="row">机密案件 :</th>
          <td>{{ caseInfo.ifSec ? "是" : "否" }}</td>
        </tr>
        <tr v-if="!caseInfo.usAgency">
          <th scope="row">申请方式 :</th>
          <td>{{ caseInfo.submitType }}</td>
          <th scope="row">代理机构 :</th>
          <td>{{ caseInfo.whdAgencyName }}</td>
        </tr>
        <tr v-if="!caseInfo.usAgency">
          <th scope="row">他所代交 :</th>
          <td>{{ caseInfo.otherAgency == "1" ? "是" : "否" }}</td>
          <th scope="row">案件等级 :</th>
          <td>{{ caseInfo.caseLevelStr }}</td>
        </tr>
        <tr v-if="!caseInfo.usAgency && caseInfo.otherAgency == '1'">
          <th scope="row">代交所名称 :</th>
          <td colspan="3">
            {{ caseInfo.replaceAgencyName || caseInfo.otherAgencyName }}
          </td>
        </tr>
        <tr v-if="!caseInfo.usAgency && isForeignDirection">
          <th scope="row">合作所评分 :</th>
          <td>{{ caseInfo.score }}分</td>
          <th scope="row">合作所评价 :</th>
          <td>{{ caseInfo.evaluate }}</td>
        </tr>
        <tr v-if="showLicensingBase">
          <th scope="row">是否再许可 :</th>
          <td>{{ caseInfo.relicensing }}</td>
          <th scope="row">许可类型 :</th>
          <td>{{ caseInfo.licenseType }}</td>
        </tr>
        <tr v-if="showLicensingBase && isYes(caseInfo.relicensing)">
          <th scope="row">许可原备案号 :</th>
          <td>{{ caseInfo.parentDocNumber }}</td>
          <th scope="row">再许可授权书 :</th>
          <td>{{ caseInfo.relicensing }}</td>
        </tr>
        <tr v-if="showLicensingBase">
          <th scope="row">许可使用合同生效日期 :</th>
          <td>{{ caseInfo.permitEffectiveDate }}</td>
          <th scope="row">许可使用合同终止日期 :</th>
          <td>{{ caseInfo.permitInvalidDate }}</td>
        </tr>
        <tr v-if="showChangeAgency">
          <th scope="row">是否填写变更后代理机构名称 :</th>
          <td>{{ caseInfo.isPreChangeAgencyName == 1 ? "是" : "否" }}</td>
          <template v-if="showPreChangeAgencyName">
            <th scope="row">变更后代理机构名称 :</th>
            <td>
              {{ caseInfo.preChangeAgencyName }}
            </td>
          </template>
        </tr>
        <tr v-if="showCorrectionCase">
          <template v-if="showCorrection">
            <th scope="row">更正事项 :</th>
            <td>{{ caseInfo.correction }}</td>
          </template>
          <th scope="row">更正前信息 :</th>
          <td>{{ caseInfo.beforeChangeMessage }}</td>
        </tr>
        <tr v-if="showCorrectionCase">
          <th scope="row">更正后信息 :</th>
          <td colspan="3">{{ caseInfo.afterChangeMessage }}</td>
        </tr>
        <tr v-if="showIssueRegCert">
          <th scope="row">申请补正理由 :</th>
          <td colspan="3">{{ caseInfo.reason }}</td>
        </tr>
        <tr v-if="showTmCancel">
          <th scope="row">注销类型 :</th>
          <td>{{ caseInfo.changeType }}</td>
          <th scope="row">申请人名义是否发生变更 :</th>
          <td>{{ caseInfo.isDlbz ? "是" : "否" }}</td>
        </tr>
        <tr v-if="showTmCancel && isYes(caseInfo.isDlbz)">
          <th scope="row">变更证明文件类型 :</th>
          <td colspan="3">{{ caseInfo.appCertFileIsCn }}</td>
        </tr>
        <tr v-if="showTmCancel">
          <th scope="row">未交回原注册证原因 :</th>
          <td colspan="3">{{ caseInfo.reason }}</td>
        </tr>
        <tr v-if="showTmCancel && caseInfo.appCertFileIsCn == '是'">
          <th scope="row">变更证明文件（中文） :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('1032')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showTmCancel && caseInfo.appCertFileIsCn == '否'">
          <th scope="row">变更证明文件原件彩色扫描件 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('1033')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showWithdrawReview">
          <th scope="row">原申请日期 :</th>
          <td>{{ caseInfo.reviewCaseAppDate }}</td>
          <th scope="row">原申请编号 :</th>
          <td>{{ caseInfo.parentAppNumber }}</td>
        </tr>
        <tr v-if="showReissueReason">
          <th scope="row">申请补证理由 :</th>
          <td>{{ caseInfo.reason }}</td>
          <template v-if="showReissueProofType">
            <th scope="row">证明类型 :</th>
            <td>{{ caseInfo.reissueType }}</td>
          </template>
        </tr>
        <tr v-if="showReissueChangeProof">
          <th scope="row">变更前注册人名义/地址 :</th>
          <td>{{ caseInfo.transferorCnName }}</td>
          <th scope="row">变更后注册人名义/地址 :</th>
          <td>{{ caseInfo.transferorEnName }}</td>
        </tr>
        <tr v-if="showReissueTransferProof">
          <th scope="row">转让人名称 :</th>
          <td>{{ caseInfo.transferorCnAdress }}</td>
          <th scope="row">受让人名称 :</th>
          <td>{{ caseInfo.transferorEnAdress }}</td>
        </tr>
        <tr v-if="showWithdrawTmApp">
          <th scope="row">撤回理由 :</th>
          <td>{{ caseInfo.withdraw }}</td>
          <template v-if="showWithdrawParentAppNo">
            <th scope="row">{{ withdrawAppNoLabel }} :</th>
            <td>{{ caseInfo.parentAppNumber }}</td>
          </template>
        </tr>
        <tr v-if="showWithdrawTmApp">
          <template v-if="showWithdrawTransferAppNo">
            <th scope="row">原转让申请号 :</th>
            <td>{{ caseInfo.parentAppNumber }}</td>
          </template>
          <th scope="row">撤回理由描述 :</th>
          <td>{{ caseInfo.reason }}</td>
        </tr>
        <tr v-if="showWithdrawTmApp">
          <template v-if="showWithdrawParentAppDate">
            <th scope="row">原撤销申请日期 :</th>
            <td>{{ caseInfo.parentAppDate }}</td>
          </template>
          <th scope="row">申请人名称是否已变更 :</th>
          <td>{{ caseInfo.isDlbz }}</td>
        </tr>
        <tr v-if="showWithdrawTmApp && showWithdrawTransferorName">
          <th scope="row">转让人中文名称 :</th>
          <td colspan="3">{{ caseInfo.transferorCnName }}</td>
        </tr>
        <tr v-if="showNeedFamousMark">
          <th scope="row">请求驰名商标保护 :</th>
          <td>{{ caseInfo.chiming }}</td>
          <template v-if="showAbsoluteReason">
            <th scope="row">仅涉及绝对理由 :</th>
            <td>{{ caseInfo.absoluteReason ? "是" : "否" }}</td>
          </template>
        </tr>
        <tr v-if="showCommonApplicationMarks">
          <th scope="row">申请书标注 :</th>
          <td colspan="3">{{ caseInfo.applicationMarks }}</td>
        </tr>
        <tr v-if="showCommonSupplement">
          <th scope="row">之后是否交补充材料 :</th>
          <td>{{ caseInfo.supplement ? "是" : "否" }}</td>
        </tr>
        <tr v-if="showOverseaEvidenceCase">
          <th scope="row">使用声明/证据类型 :</th>
          <td>{{ caseInfo.evidenceTypeStr }}</td>
          <th scope="row">是否提交使用声明/证据 :</th>
          <td>{{ caseInfo.ifEvidenceStr }}</td>
        </tr>
        <tr v-if="showOverseaEvidenceCase">
          <th scope="row">使用声明/证据说明 :</th>
          <td colspan="3">{{ caseInfo.statementOfEvidence }}</td>
        </tr>
        <tr v-if="showCancelThreeYears">
          <th scope="row">撤销理由 :</th>
          <td colspan="3">{{ caseInfo.reason }}</td>
        </tr>
        <tr v-if="showCancelThreeYears">
          <th scope="row">理由 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('327')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showCancelThreeYears">
          <th scope="row">证据材料 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('322')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showCancelThreeYears">
          <th scope="row">材料目录/证据目录 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('326')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showCancelThreeYears">
          <th scope="row">相关说明文件 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('1020')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showTransferCase">
          <th scope="row">转让/移转 :</th>
          <td colspan="3">{{ caseInfo.transfer }}</td>
        </tr>
        <tr v-if="showInvalidationApply">
          <th scope="row">法律条款 :</th>
          <td>{{ caseInfo.lawList }}</td>
          <th scope="row">同意通讯地址延及本案后续程序 :</th>
          <td>{{ caseInfo.empowerAddrCase ? "是" : "否" }}</td>
        </tr>
        <tr v-if="showInvalidationApply">
          <th scope="row">事实理由 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('327')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showInvalidationApply">
          <th scope="row">证据目录 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('326')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showInvalidationApply">
          <th scope="row">证据内容 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('300012')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showInvalidationApply">
          <th scope="row">有关说明文件 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('1020')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="showInvalidationApply">
          <th scope="row">正副本是否一致 :</th>
          <td colspan="3">{{ caseInfo.justNegativeAgre ? "是" : "否" }}</td>
        </tr>
        <tr v-if="showInvalidationApply && !caseInfo.justNegativeAgre">
          <th scope="row">涉密证据材料 :</th>
          <td
            colspan="3"
            class="nocopy"
          >
            <p
              v-for="item in getAddressAndName('301677')"
              :key="item.address"
              style="margin-bottom: 0"
            >
              <a
                style="color: #409eff"
                target="_blank"
                :href="`/ipdoc${item.address}`"
              >
                {{ item.name }}
              </a>
            </p>
          </td>
        </tr>
        <tr v-if="!caseInfo.usAgency">
          <th scope="row">案件备注 :</th>
          <td colspan="3">{{ caseInfo.remarks }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    caseType() {
      return this.caseInfo.caseType || "";
    },
    isForeignDirection() {
      return ["内-外", "外-外"].includes(this.caseInfo.appFromto);
    },
    caseTypeStr() {
      return (
        this.caseInfo.caseType_str || this.caseInfo.caseTypeStr || this.caseType
      );
    },
    showLicensingBase() {
      return !this.caseInfo.usAgency && this.caseType === "许可备案";
    },
    showChangeAgency() {
      return (
        !this.caseInfo.usAgency && this.caseType === "变更注册申请代理机构"
      );
    },
    showPreChangeAgencyName() {
      return (
        this.showChangeAgency &&
        Number(this.caseInfo.isPreChangeAgencyName) === 1
      );
    },
    showCorrectionCase() {
      return !this.caseInfo.usAgency && this.caseType === "更正商标申请事项";
    },
    showCorrection() {
      return this.showCorrectionCase && this.caseInfo.submitType === "线下申请";
    },
    showIssueRegCert() {
      return !this.caseInfo.usAgency && this.caseType === "出具商标注册证明";
    },
    showTmCancel() {
      return !this.caseInfo.usAgency && this.caseType === "商标注销";
    },
    showWithdrawReview() {
      return !this.caseInfo.usAgency && this.caseType === "撤回商标评审";
    },
    showWithdrawCaseType() {
      return (
        !this.caseInfo.usAgency &&
        ["撤回商标申请", "撤回商标评审"].includes(this.caseType)
      );
    },
    showReissueReason() {
      return (
        !this.caseInfo.usAgency &&
        ["补发商标注册证", "补发商标变转续证明"].includes(this.caseType)
      );
    },
    showReissueProofType() {
      return !this.caseInfo.usAgency && this.caseType === "补发商标变转续证明";
    },
    showReissueChangeProof() {
      return (
        this.showReissueProofType && this.caseInfo.reissueType === "变更证明"
      );
    },
    showReissueTransferProof() {
      return (
        this.showReissueProofType && this.caseInfo.reissueType === "转让证明"
      );
    },
    showWithdrawTmApp() {
      return !this.caseInfo.usAgency && this.caseType === "撤回商标申请";
    },
    showWithdrawParentAppNo() {
      return (
        this.showWithdrawTmApp &&
        this.caseTypeStr !== "撤回商标异议" &&
        this.caseInfo.changeType !== "转让/移转商标"
      );
    },
    showWithdrawTransferAppNo() {
      return (
        this.showWithdrawTmApp &&
        this.caseTypeStr !== "撤回商标异议" &&
        this.caseInfo.changeType === "转让/移转商标"
      );
    },
    showWithdrawParentAppDate() {
      return (
        this.showWithdrawTmApp &&
        this.caseTypeStr === "撤回撤销三年不使用注册商标"
      );
    },
    showWithdrawTransferorName() {
      return (
        this.showWithdrawTmApp && this.caseInfo.changeType === "转让/移转商标"
      );
    },
    withdrawAppNoLabel() {
      return this.caseTypeStr === "撤回撤销三年不使用注册商标"
        ? "原撤销申请号"
        : "原申请号";
    },
    showNeedFamousMark() {
      return (
        !this.caseInfo.usAgency &&
        ["异议", "无效宣告申请", "不予注册复审"].includes(this.caseType)
      );
    },
    showAbsoluteReason() {
      return !this.caseInfo.usAgency && this.caseType === "无效宣告申请";
    },
    showCommonApplicationMarks() {
      return (
        !this.caseInfo.usAgency &&
        !["国际注册驳回复审", "注册驳回复审"].includes(this.caseType)
      );
    },
    showCommonSupplement() {
      return (
        !this.caseInfo.usAgency &&
        [
          "异议",
          "异议答辩",
          "无效宣告申请",
          "无效宣告答辩",
          "不予注册复审",
          "撤销商标复审",
          "无效宣告复审",
          "撤销复审答辩",
          "撤三答辩（提供使用证明）",
          "撤销三年停止使用申请",
        ].includes(this.caseType)
      );
    },
    showOverseaEvidenceCase() {
      return (
        !this.caseInfo.usAgency && this.caseType === "提供使用声明/证据（境外）"
      );
    },
    showCancelThreeYears() {
      return (
        !this.caseInfo.usAgency && this.caseType === "撤销三年停止使用申请"
      );
    },
    showTransferCase() {
      return !this.caseInfo.usAgency && this.caseType === "转让/移转";
    },
    showInvalidationApply() {
      return !this.caseInfo.usAgency && this.caseType === "无效宣告申请";
    },
  },
  methods: {
    isYes(value) {
      return value === "是" || value === 1 || value === "1" || value === true;
    },
    getAddressAndName(materialTypeId) {
      if (this.caseInfo.materials) {
        return this.caseInfo.materials.filter(
          (item) => item.materialTypeId == materialTypeId,
        );
      }
      return [];
    },
  },
  created() {
    this.$addCopy();
  },
  beforeUnmount() {
    this.$destroyCopy();
  },
};
</script>

<style></style>
