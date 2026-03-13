<template>
  <div class="card mb-0">
    <div
      class="card-body"
    >
      <h4 class="card-title mb-2">{{ appSectionTitle }}</h4>

      <div class="table-responsive">
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr v-if="!caseInfo.usAgency">
              <th
                scope="row"
                style="width: 10%"
              >
                申请人中文名称 :
              </th>
              <td style="width: 40%">
                {{ normalizeText(caseInfo.appCnName) }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                主体法律性质 :
              </th>
              <td style="width: 40%">{{ caseInfo.legalNature }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency && showIsChangeName">
              <th scope="row">是否变更名义 :</th>
              <td>{{ caseInfo.isChangeName }}</td>
              <th
                v-if="showPreChangeName"
                scope="row"
              >
                {{ preChangeNameLabel }} :
              </th>
              <td v-if="showPreChangeName">
                {{ caseInfo.preChangeAppCnName }}
              </td>
            </tr>
            <tr
              v-if="!caseInfo.usAgency && showIsChangeName && showPreChangeName"
            >
              <th scope="row">{{ preChangeMaterialLabel }}</th>
              <td colspan="3">-</td>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">申请人英文名称 :</th>
              <td>{{ caseInfo.appEnName }}</td>
              <th scope="row">国籍 :</th>
              <td>{{ caseInfo.appGJdq }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">身份证明文件名称 :</th>
              <td>{{ caseInfo.appCertificate }}</td>
              <template v-if="showCertCodeForNonNatural">
                <th scope="row">统一社会信用代码 :</th>
                <td>{{ caseInfo.certCode }}</td>
              </template>
              <template v-else>
                <th scope="row">身份证明文件号码 :</th>
                <td>{{ caseInfo.appCertificateNum }}</td>
              </template>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">申请人地址 :</th>
              <td>{{ caseInfo.appRegionalism }}</td>
              <th scope="row">申请人详细地址 :</th>
              <td>{{ caseInfo.appCnAddr }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency && caseInfo.appGJdq != '中国'">
              <th scope="row">国家或地区 :</th>
              <td>{{ caseInfo.appCountryOrRegion }}</td>
              <th scope="row">申请人英文地址 :</th>
              <td>{{ caseInfo.appEnAddr }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency && caseInfo.appGJdq == '中国'">
              <th scope="row">申请人英文地址 :</th>
              <td colspan="3">{{ caseInfo.appEnAddr }}</td>
            </tr>
            <tr v-if="showDomesticContact">
              <th scope="row">国内申请人联系地址 :</th>
              <td>{{ caseInfo.appContactAddr }}</td>
              <th scope="row">国内申请人联系邮编 :</th>
              <td>{{ caseInfo.appContactPostCode }}</td>
            </tr>
            <tr v-if="showIsIpAgent">
              <th scope="row">经营范围是否包括知识产权代理 :</th>
              <td colspan="3">{{ caseInfo.isIpAgent }}</td>
            </tr>
            <tr v-if="showAgentPerson">
              <th scope="row">代理人姓名 :</th>
              <td colspan="3">{{ caseInfo.agentPerson }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">委托书 :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1000')"
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
              <th
                v-if="showSubjectCertType"
                scope="row"
              >
                主体资格证明文件类型 :
              </th>
              <td v-if="showSubjectCertType">{{ caseInfo.subjectCertType }}</td>
            </tr>
            <tr v-if="showSubjectCertType">
              <th scope="row">统一社会信用代码 :</th>
              <td colspan="3">{{ caseInfo.certCode }}</td>
            </tr>
            <tr v-if="showAppCertLang">
              <th scope="row">主体/身份证明文件是否为中文 :</th>
              <td>{{ caseInfo.appCertFileIsCn }}</td>
              <th scope="row">申请人上传文件的语言类型 :</th>
              <td>{{ caseInfo.uploadFileLanguage }}</td>
            </tr>
            <tr v-if="showIdFileCn">
              <th scope="row">身份证明文件(中文) :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1001')"
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
              <th
                v-if="showIdFileForeign"
                scope="row"
              >
                身份证明原文件(外文) :
              </th>
              <td
                v-if="showIdFileForeign"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1002')"
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
            <tr v-if="showLicenseCaseFiles">
              <th scope="row">申请人（许可人）主体资格证明（中文） :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1003')"
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
              <th
                v-if="showForeignFileUpload"
                scope="row"
              >
                申请人（许可人）主体资格证明（英文） :
              </th>
              <td
                v-if="showForeignFileUpload"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1004')"
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
            <tr v-if="showLicenseCaseFiles">
              <th scope="row">申请人（许可人）身份证明文件(中文) :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1001')"
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
              <th
                v-if="showForeignFileUpload"
                scope="row"
              >
                申请人（许可人）身份证明原文件(外文) :
              </th>
              <td
                v-if="showForeignFileUpload"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1002')"
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
            <tr v-if="showGeneralSubjectFiles">
              <th scope="row">主体资格证明文件（中文） :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1003')"
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
              <th
                v-if="showForeignFileUpload"
                scope="row"
              >
                主体资格证明文件（英文） :
              </th>
              <td
                v-if="showForeignFileUpload"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1004')"
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
            <tr v-if="showTransferExtraFiles">
              <th scope="row">自然人死亡/企业或其他组织注销证明 :</th>
              <td>-</td>
              <th scope="row">同意转让声明或商标转移证明 :</th>
              <td>-</td>
            </tr>
            <tr v-if="showDescriptionFiles">
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
            <tr v-if="showPriorityType">
              <th scope="row">要求优先权 :</th>
              <td>{{ caseInfo.priorityType == "1" ? "是" : "否" }}</td>
              <th
                v-if="showPriorityDetail"
                scope="row"
              >
                要求优先权声明 :
              </th>
              <td v-if="showPriorityDetail">{{ caseInfo.priorityType }}</td>
            </tr>
            <tr v-if="showPriorityDetail">
              <th scope="row">优先权国家 :</th>
              <td>{{ caseInfo.priorityBaseCrty }}</td>
              <th scope="row">优先权日期 :</th>
              <td>{{ caseInfo.priorityAppDate }}</td>
            </tr>
            <tr v-if="showPriorityDetail">
              <th scope="row">优先权文件后补 :</th>
              <td>{{ caseInfo.isLoadPriorityFile == "1" ? "是" : "否" }}</td>
              <th scope="row">优先权申请号 :</th>
              <td>{{ caseInfo.priorityAppNum }}</td>
            </tr>
            <tr v-if="showPriorityDetail">
              <th scope="row">优先权证明文件 :</th>
              <td colspan="3">-</td>
            </tr>
            <tr v-if="showCorrection">
              <th scope="row">更正事项 :</th>
              <td colspan="3">{{ caseInfo.correction }}</td>
            </tr>
            <tr v-if="showDelayRenewal">
              <th scope="row">延迟续展 :</th>
              <td colspan="3">{{ caseInfo.delayRenewal ? "是" : "否" }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">邮箱 :</th>
              <td>{{ caseInfo.appContactEmail }}</td>
              <th scope="row">邮政编码 :</th>
              <td>{{ caseInfo.appContactZip }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">联系人 :</th>
              <td>{{ caseInfo.appContactPerson }}</td>
              <th scope="row">电话 :</th>
              <td>{{ caseInfo.appContactTel }}</td>
            </tr>
            <tr v-if="!caseInfo.usAgency">
              <th scope="row">共同申请 :</th>
              <td colspan="3">{{ caseInfo.ifShareTm == 1 ? "是" : "否" }}</td>
            </tr>
            <tr v-if="showJoinApps">
              <th scope="row">{{ joinAppsLabel }} :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <el-table
                  :data="caseInfo.joinApps"
                  :max-height="260"
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    width="70"
                  />
                  <el-table-column
                    v-if="caseInfo.caseType === '转让/移转'"
                    prop="type"
                    label="类型"
                    width="100"
                  />
                  <el-table-column
                    prop="cnName"
                    label="中文名称"
                  />
                  <el-table-column
                    prop="enName"
                    label="英文名称"
                  />
                  <el-table-column
                    prop="cardType"
                    label="证件名称"
                  />
                  <el-table-column
                    prop="cardNo"
                    label="证件号"
                  />
                  <el-table-column
                    prop="proofFile"
                    label="证明文件"
                  />
                </el-table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
  data() {
    return {
      trademarkList: [
        "商标注册",
        "答复临时驳回/审查意见（境外）",
        "提供使用声明/证据（境外）",
        "签署代理合同协议",
        "商标监控总卷/协议",
        "咨询",
        "其他",
        "投标",
      ],
      priorityTypes: [
        "答复临时驳回/审查意见（境外）",
        "商标注册",
        "分割申请",
        "提供使用声明/证据（境外）",
      ],
      agentPersonCaseTypes: [
        "答复临时驳回/审查意见（境外）",
        "提供使用声明/证据（境外）",
        "不予注册复审",
        "商标注册",
        "分割申请",
        "异议",
        "变名变址",
        "转让/移转",
        "续展",
        "删减商品项目",
        "变更注册申请代理机构",
        "更正商标申请事项",
        "注册驳回复审",
        "国际注册驳回复审",
        "无效宣告复审",
        "撤销商标复审",
        "异议答辩",
        "撤三答辩(提供使用证明)",
        "撤销通用名称答辩",
        "参与不予注册复审",
        "无效宣告答辩",
        "撤销复审答辩",
        "撤销三年停止使用申请",
        "撤销成为通用名称注册商标",
        "无效宣告申请",
        "撤回商标评审",
        "行政复议",
        "许可备案",
        "补发商标注册证",
        "补发商标变转续证明",
        "出具优先权证明文件",
        "出具商标注册证明",
        "商标注销",
        "撤回商标申请",
      ],
    };
  },
  computed: {
    appSectionTitle() {
      if (this.caseInfo.caseType === "转让/移转") return "申请人(受让人)信息";
      if (this.caseInfo.caseType === "许可备案") return "申请人(许可人)信息";
      return "申请人信息";
    },
    showIsChangeName() {
      return (
        !this.caseInfo.usAgency &&
        ["国际注册驳回复审", "注册驳回复审"].includes(this.caseInfo.caseType)
      );
    },
    showPreChangeName() {
      const val = Number(this.caseInfo.isChangeName);
      return (
        this.showIsChangeName &&
        this.caseInfo.submitType === "网上申请" &&
        [1, 2, 3].includes(val)
      );
    },
    preChangeNameLabel() {
      const map = {
        1: "变更前名义",
        2: "变更前代表人",
        3: "变更前其他信息",
      };
      return map[Number(this.caseInfo.isChangeName)] || "变更前信息";
    },
    preChangeMaterialLabel() {
      const v = Number(this.caseInfo.isChangeName);
      if (v === 1) return "名义变更证明 :";
      if (v === 2) return "变更代表人申请 :";
      return "相关材料 :";
    },
    showCertCodeForNonNatural() {
      return (
        !this.caseInfo.usAgency &&
        this.caseInfo.appGJdq === "中国" &&
        this.caseInfo.legalNature !== "自然人"
      );
    },
    showSubjectCertType() {
      return (
        !this.caseInfo.usAgency &&
        this.caseInfo.appGJdq === "中国" &&
        this.caseInfo.legalNature === "自然人"
      );
    },
    showDomesticContact() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "变名变址";
    },
    showIsIpAgent() {
      return (
        !this.caseInfo.usAgency &&
        [
          "答复临时驳回/审查意见（境外）",
          "商标注册",
          "提供使用声明/证据（境外）",
        ].includes(this.caseInfo.caseType) &&
        this.caseInfo.appFromto === "内-内"
      );
    },
    showAgentPerson() {
      return (
        !this.caseInfo.usAgency &&
        this.agentPersonCaseTypes.includes(this.caseInfo.caseType)
      );
    },
    showAppCertLang() {
      return !this.caseInfo.usAgency;
    },
    showIdFileCn() {
      return (
        !this.caseInfo.usAgency &&
        this.caseInfo.caseType !== "许可备案" &&
        this.caseInfo.legalNature === "自然人"
      );
    },
    showIdFileForeign() {
      return (
        this.showIdFileCn &&
        (this.caseInfo.appCertFileIsCn === "否" ||
          this.caseInfo.uploadFileLanguage === "外文")
      );
    },
    showSubjectFile() {
      return this.caseInfo.legalNature !== "自然人";
    },
    showForeignFileUpload() {
      return (
        this.caseInfo.uploadFileLanguage === "外文" ||
        this.caseInfo.appCertFileIsCn === "否"
      );
    },
    showLicenseCaseFiles() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "许可备案";
    },
    showGeneralSubjectFiles() {
      return (
        !this.caseInfo.usAgency &&
        this.caseInfo.caseType !== "许可备案" &&
        this.showSubjectFile
      );
    },
    showTransferExtraFiles() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "转让/移转";
    },
    showDescriptionFiles() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType !== "异议";
    },
    showPriorityType() {
      return (
        !this.caseInfo.usAgency &&
        this.priorityTypes.includes(this.caseInfo.caseType)
      );
    },
    showPriorityDetail() {
      return (
        this.showPriorityType && String(this.caseInfo.priorityType) === "1"
      );
    },
    showCorrection() {
      return (
        !this.caseInfo.usAgency &&
        this.caseInfo.caseType === "更正商标申请事项" &&
        this.caseInfo.submitType === "线下申请"
      );
    },
    showDelayRenewal() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "续展";
    },
    showJoinApps() {
      return (
        !this.caseInfo.usAgency &&
        Array.isArray(this.caseInfo.joinApps) &&
        this.caseInfo.joinApps?.length > 0
      );
    },
    joinAppsLabel() {
      return this.caseInfo.caseType === "变名变址"
        ? "变更后共同申请人"
        : "共同申请人";
    },
  },
  methods: {
    normalizeText(value) {
      return value ? String(value).replace(/\s+/g, "") : "";
    },
    toDisplay(value) {
      return value || "-";
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
