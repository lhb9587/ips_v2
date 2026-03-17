<template>
  <div>
    <div class="card mb-0">
      <div class="card-body">
        <h4 class="card-title mb-2">商标信息</h4>

        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr v-if="!caseInfo.usAgency">
                <th
                  scope="row"
                  style="width: 10%"
                >
                  商标名称 :
                </th>
                <td style="width: 40%">{{ caseInfo.tmName }}</td>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  商标英文 :
                </th>
                <td style="width: 40%">{{ caseInfo.tmNameEn }}</td>
              </tr>
              <tr v-if="!caseInfo.usAgency">
                <th scope="row">商标图样 :</th>
                <td>
                  <img
                    style="width: 100px"
                    :src="tyimage"
                    alt=""
                  />
                </td>
                <template v-if="showTmDesignDeclare">
                  <th scope="row">商标设计说明 :</th>
                  <td>
                    {{ caseInfo.tmDesignDeclare }}
                  </td>
                </template>
              </tr>
              <tr v-if="showMadridToCn">
                <th scope="row">国际注册号 :</th>
                <td>{{ caseInfo.gjRegNumber }}</td>
                <th scope="row">国际注册日期 :</th>
                <td>{{ caseInfo.gjRegDate }}</td>
              </tr>
              <tr v-if="showMadridToCn">
                <th scope="row">后期指定日期 :</th>
                <td>{{ caseInfo.hqzdDate }}</td>
                <th scope="row">国际注销登记日期 :</th>
                <td>{{ caseInfo.interLogoutDate }}</td>
              </tr>
              <tr v-if="showMadridToCn">
                <th scope="row">国际注销通知书 :</th>
                <td
                  colspan="3"
                  class="nocopy"
                >
                  <p
                    v-for="item in getAddressAndName('300454')"
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
              <tr v-if="showPriorityProof">
                <th scope="row">商标号 :</th>
                <td>{{ caseInfo.regNumber }}</td>
                <th scope="row">申请日 :</th>
                <td>{{ caseInfo.appDate }}</td>
              </tr>
              <tr v-if="showPriorityProof">
                <th scope="row">递交日 :</th>
                <td>{{ caseInfo.submitDate }}</td>
                <th scope="row">申请号 :</th>
                <td>{{ caseInfo.appNumber }}</td>
              </tr>
              <tr v-if="showParentAppDateBase">
                <th scope="row">原注册申请日期 :</th>
                <td>{{ caseInfo.parentAppDate }}</td>
                <th
                  v-if="showRejectReviewBaseRegNumber"
                  scope="row"
                >
                  {{ rejectReviewLabel }} :
                </th>
                <td v-if="showRejectReviewBaseRegNumber">
                  {{ caseInfo.regNumber }}
                </td>
              </tr>
              <tr v-if="showRefBasic">
                <th scope="row">引证商标名称 :</th>
                <td>{{ caseInfo.quoteTm }}</td>
                <th scope="row">引证商标类别 :</th>
                <td>{{ caseInfo.quoteTmClass }}</td>
              </tr>
              <tr v-if="showRefBasic || showRefRegNumberExt">
                <th scope="row">引证商标注册号 :</th>
                <td>{{ caseInfo.quoteRegNumber }}</td>
                <th
                  v-if="showAppNumberExt"
                  scope="row"
                >
                  申请号 :
                </th>
                <td v-if="showAppNumberExt">{{ caseInfo.appNumber }}</td>
              </tr>
              <tr v-if="showOfficeDocGroup">
                <th scope="row">官方发文编号 :</th>
                <td>{{ caseInfo.tmOfficeNumber }}</td>
                <th scope="row">官文时限基准日期 :</th>
                <td>{{ caseInfo.docDate }}</td>
              </tr>
              <tr v-if="showGeneralSubmitDate">
                <th scope="row">递交日期 :</th>
                <td>{{ caseInfo.submitDate }}</td>
                <th scope="row">申请日期 :</th>
                <td>{{ caseInfo.appDate }}</td>
              </tr>
              <tr v-if="showGeneralSubmitDate">
                <th scope="row">申请号 :</th>
                <td>{{ caseInfo.appNumber }}</td>
                <th
                  v-if="showApprovalSet"
                  scope="row"
                >
                  初审公告号 :
                </th>
                <td v-if="showApprovalSet">{{ caseInfo.approvalNo }}</td>
              </tr>
              <tr v-if="showApprovalSet">
                <th scope="row">初审公告日期 :</th>
                <td>{{ caseInfo.approvalDate }}</td>
                <th scope="row">初审公告期号 :</th>
                <td>{{ caseInfo.approvalNumber }}</td>
              </tr>
              <tr v-if="showDivisionParentInfo">
                <th scope="row">原案申请号 :</th>
                <td>{{ caseInfo.parentAppNumber }}</td>
                <th scope="row">原案官方发文编号 :</th>
                <td>{{ caseInfo.parentDocNumber }}</td>
              </tr>
              <tr v-if="showDivisionParentInfo">
                <th scope="row">原案官方收文日期 :</th>
                <td colspan="3">{{ caseInfo.docDate }}</td>
              </tr>
              <tr v-if="showAdminReview">
                <th scope="row">不予的案件类型 :</th>
                <td>{{ caseInfo.reissueType }}</td>
                <th scope="row">不予发文编号 :</th>
                <td>{{ caseInfo.tmOfficeNumber }}</td>
              </tr>
              <tr v-if="showAdminReview">
                <th scope="row">官文时限基准日期 :</th>
                <td colspan="3">{{ caseInfo.docDate }}</td>
              </tr>
              <tr v-if="showWithdrawRegNo">
                <th scope="row">商标申请/注册号 :</th>
                <td colspan="3">{{ caseInfo.regNumber }}</td>
              </tr>
              <tr v-if="showWithdrawOriginalRegNo">
                <th scope="row">{{ withdrawRegNoLabel }} :</th>
                <td colspan="3">{{ caseInfo.regNumber }}</td>
              </tr>
              <tr v-if="showEarlyStop">
                <th scope="row">原商标使用许可备案号 :</th>
                <td>{{ caseInfo.parentDocNumber }}</td>
                <th scope="row">提前终止日期 :</th>
                <td>{{ caseInfo.earlyStopDate }}</td>
              </tr>
              <tr v-if="showEarlyStop">
                <th scope="row">提前终止理由 :</th>
                <td colspan="3">{{ caseInfo.reason }}</td>
              </tr>
              <tr v-if="showRegDate">
                <th scope="row">注册日期 :</th>
                <td>{{ caseInfo.regDate }}</td>
                <th
                  v-if="showJoinReviewApprovalNo"
                  scope="row"
                >
                  初审公告号 :
                </th>
                <td v-if="showJoinReviewApprovalNo">
                  {{ caseInfo.approvalNo }}
                </td>
              </tr>
              <tr v-if="showRegNumberOnly">
                <th scope="row">注册号 :</th>
                <td colspan="3">{{ caseInfo.regNumber }}</td>
              </tr>
              <tr v-if="showValidPeriod">
                <th scope="row">有效期起始日 :</th>
                <td>{{ caseInfo.validStartDate }}</td>
                <th scope="row">有效期截止日 :</th>
                <td>{{ caseInfo.validEndDate }}</td>
              </tr>
              <tr v-if="!caseInfo.usAgency">
                <th scope="row">商标国际分类 :</th>
                <td colspan="3">{{ caseInfo.goodClasses }}</td>
              </tr>
              <tr v-if="!caseInfo.usAgency">
                <th scope="row">{{ goodsLabel }} :</th>
                <td
                  colspan="3"
                  class="nocopy"
                >
                  <GoodsLiteTable :goods-list="caseInfo.goods" :app-fromto="caseInfo.appFromto" />
                </td>
              </tr>
              <tr v-if="showGoodsCheckFile">
                <th scope="row">商品查对文件 :</th>
                <td
                  colspan="3"
                  class="nocopy"
                >
                  <el-table
                    :data="checkGoodList"
                    :max-height="280"
                    :show-overflow-tooltip="true"
                  >
                    <el-table-column
                      type="index"
                      label="序号"
                      width="60"
                    />
                    <el-table-column
                      :prop="col.value"
                      :label="col.title"
                      v-for="col of checkGoodColumns"
                      :key="col.value"
                    />
                  </el-table>
                </td>
              </tr>
              <tr v-if="showTmlistAgency">
                <th scope="row">原代理组织 :</th>
                <td colspan="3">{{ caseInfo.respondentAgency }}</td>
              </tr>
              <tr v-if="!caseInfo.usAgency">
                <th scope="row">种类 :</th>
                <td>
                  <span v-if="caseInfo.tmType == 1">一般</span>
                  <span v-if="caseInfo.tmType == 2">集体</span>
                  <span v-if="caseInfo.tmType == 3">证明</span>
                </td>
                <th
                  v-if="showSolidFlag"
                  scope="row"
                >
                  是否三维标志 :
                </th>
                <td v-if="showSolidFlag">
                  {{ caseInfo.ifSolidTm == "1" ? "是" : "否" }}
                </td>
              </tr>
              <tr v-if="showMemberRule">
                <th scope="row">集体/证明商标使用管理规则 :</th>
                <td>{{ caseInfo.memberRule }}</td>
                <th scope="row">集体/证明商标使用管理规则(附件) :</th>
                <td class="nocopy">
                  <p
                    v-for="item in getAddressAndName('1005')"
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
              <tr v-if="showMemberList">
                <th scope="row">集体成员名单 :</th>
                <td>{{ caseInfo.memberNamelist }}</td>
                <th scope="row">集体成员名单(附件) :</th>
                <td class="nocopy">
                  <p
                    v-for="item in getAddressAndName('1006')"
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
              <tr v-if="showDetectAbility">
                <th scope="row">申请人是否具备检测能力 :</th>
                <td>{{ caseInfo.isAppWithDetectAbility === "是" ? "是" : "否" }}</td>
                <template v-if="showDetectAttach">
                  <th scope="row">申请人检测资质证书（附件） :</th>
                  <td class="nocopy">
                    <p
                      v-for="item in getAddressAndName('1007')"
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
                </template>
              </tr>
              <tr v-if="showDetectAttach">
                <th scope="row">申请人专业检测设备清单 :</th>
                <td class="nocopy">
                  <p
                    v-for="item in getAddressAndName('1008')"
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
                <th scope="row">申请人专业技术人员名单（附件） :</th>
                <td class="nocopy">
                  <p
                    v-for="item in getAddressAndName('1009')"
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
              <tr v-if="showDetectAttach">
                <th scope="row">申请人技术人员证书 :</th>
                <td
                  colspan="3"
                  class="nocopy"
                >
                  <p
                    v-for="item in getAddressAndName('1010')"
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
              <tr v-if="showColorVoice">
                <th scope="row">是否颜色组合 :</th>
                <td>{{ caseInfo.colorSign == "1" ? "是" : "否" }}</td>
                <th scope="row">指定颜色 :</th>
                <td>{{ caseInfo.assignColor ? "是" : "否" }}</td>
              </tr>
              <tr v-if="showColorVoice">
                <th scope="row">声音标志 :</th>
                <td>{{ caseInfo.tmVoice == "1" ? "是" : "否" }}</td>
                <th
                  v-if="caseInfo.tmVoice == '1'"
                  scope="row"
                >
                  声音文件 :
                </th>
                <td
                  v-if="caseInfo.tmVoice == '1'"
                  class="nocopy"
                >
                  <p
                    v-for="item in getAddressAndName('1016')"
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
              <tr v-if="showChangeNameAddr">
                <th scope="row">变更类型 :</th>
                <td>{{ caseInfo.changeType }}</td>
                <th scope="row">变更前名称（中文） :</th>
                <td>{{ caseInfo.preChangeCnName }}</td>
              </tr>
              <tr v-if="showChangeNameAddr">
                <th scope="row">变更前名称（英文） :</th>
                <td>{{ caseInfo.preChangeEnName }}</td>
                <template v-if="showChangeCertLang">
                  <th scope="row">变更证明文件是否为中文（网申） :</th>
                  <td>{{ caseInfo.appCertFileIsCn }}</td>
                </template>
              </tr>
              <tr
                v-if="showChangeNameAddr && caseInfo.changeType !== '变更地址'"
              >
                <template v-if="caseInfo.appCertFileIsCn === '否'">
                  <th scope="row">变更证明文件（英文） :</th>
                  <td class="nocopy">
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
                </template>
                <th scope="row">变更证明文件（中文） :</th>
                <td class="nocopy">
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
              <tr v-if="showJoinApps">
                <th scope="row">变更前共同申请人 :</th>
                <td colspan="3" class="nocopy">
                  <el-table
                    :data="caseInfo.joinApps"
                    :max-height="280"
                    :show-overflow-tooltip="true"
                  >
                    <el-table-column
                      label="序号"
                      type="index"
                      width="60"
                    />
                    <el-table-column
                      prop="type"
                      label="类型"
                      v-if="caseInfo.caseType === '转让/移转'"
                    />
                    <el-table-column
                      prop="nameCn"
                      label="中文名称"
                    />
                    <el-table-column
                      prop="nameEn"
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
                    >
                      <template #default="scope">
                        <span
                          v-for="item in scope.row.materialArray"
                          :key="item.address"
                        >
                          <a
                            style="color: #409eff"
                            target="_blank"
                            :href="`/ipdoc${item.address}`"
                            >{{ item.materialName }}</a
                          >
                        </span>
                      </template>
                    </el-table-column>
                  </el-table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="showQuoteTrademarkTable"
      class="card mt-2"
    >
      <div class="card-body">
        <h4 class="card-title mb-2">引证商标信息</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <!-- <th
                  scope="row"
                  style="width: 10%"
                >
                  引证商标列表 :
                </th> -->
                <td
                  colspan="3"
                  class="nocopy"
                >
                  <el-table
                    :data="quoteTableData"
                    :max-height="280"
                    :show-overflow-tooltip="true"
                  >
                    <el-table-column
                      type="index"
                      label="序号"
                      width="60"
                    />
                    <el-table-column
                      :prop="col.value"
                      :label="col.title"
                      v-for="col of quoteColumns"
                      :key="col.value"
                    />
                  </el-table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryImageGoodsList } from "@/api/caseList";
import GoodsLiteTable from "./goods-lite-table.vue";

export default {
  components: {
    GoodsLiteTable,
  },
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tyimage: "",
      quoteColumns: [
        {
          title: "引证商标号",
          value: "quoteRegNumber",
        },
        {
          title: "引证商标名称",
          value: "quoteTm",
        },
        {
          title: "引证商标类别",
          value: "quoteTmClass",
        },
        {
          title: "引证商标申请人",
          value: "quoteAppName",
        },
      ],
      checkGoodList: [],
      checkGoodColumns: [
        {
          title: "文件名称",
          value: "materialName",
        },
        {
          title: "上传时间",
          value: "createDate",
        },
        {
          title: "上传人",
          value: "creater",
        },
      ],
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
      tmlist: [
        "变名变址",
        "续展",
        "变更注册申请代理机构",
        "删减商品项目",
        "更正商标申请事项",
        "转让/移转",
      ],
      parentAppDateTypes: [
        "撤销三年停止使用申请",
        "异议",
        "异议答辩",
        "撤三答辩（提供使用证明）",
        "无效宣告复审",
        "撤销商标复审",
        "不予注册复审",
        "无效宣告申请",
        "参加不予注册复审",
        "撤销复审答辩",
        "无效宣告答辩",
      ],
      officeDocTypes: [
        "撤销复审答辩",
        "异议答辩",
        "无效宣告答辩",
        "国际注册驳回复审",
        "注册驳回复审",
        "不予注册复审",
        "无效宣告复审",
        "撤销商标复审",
        "撤三答辩（提供使用证明）",
        "参加不予注册复审",
      ],
      submitDateTypes: [
        "答复临时驳回/审查意见（境外）",
        "提供使用声明/证据（境外）",
        "马德里商标转国内注册",
        "出具商标注册证明",
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
        "商标注销",
        "撤回商标申请",
      ],
    };
  },
  computed: {
    caseType() {
      return this.caseInfo.caseType || "";
    },
    caseTypeId() {
      return Number(this.caseInfo.caseTypeId);
    },
    isForeignDirection() {
      return ["内-外", "外-外"].includes(this.caseInfo.appFromto);
    },
    goodsLabel() {
      return this.caseType === "商标注销"
        ? "注销商品服务项目\n(商品/服务项目)"
        : "商品/服务项目";
    },
    showMadridToCn() {
      return (
        !this.caseInfo.usAgency && this.caseType === "马德里商标转国内注册"
      );
    },
    showPriorityProof() {
      return !this.caseInfo.usAgency && this.caseType === "出具优先权证明文件";
    },
    showParentAppDateBase() {
      return (
        !this.caseInfo.usAgency &&
        this.parentAppDateTypes.includes(this.caseType)
      );
    },
    showRejectReviewBaseRegNumber() {
      return (
        !this.caseInfo.usAgency &&
        ["国际注册驳回复审", "注册驳回复审"].includes(this.caseType)
      );
    },
    rejectReviewLabel() {
      return this.caseType === "注册驳回复审"
        ? "原申请号/国际注册号"
        : "原商标申请号/国际注册号";
    },
    showTmDesignDeclare() {
      return !this.caseInfo.usAgency && this.caseType !== "变名变址";
    },
    showRefBasic() {
      return (
        !this.caseInfo.usAgency &&
        ["撤销复审答辩", "异议答辩", "无效宣告申请", "无效宣告答辩"].includes(
          this.caseType,
        )
      );
    },
    showRefRegNumberExt() {
      return (
        !this.caseInfo.usAgency &&
        [
          "撤销复审答辩",
          "异议答辩",
          "无效宣告答辩",
          "不予注册复审",
          "无效宣告复审",
          "撤销商标复审",
        ].includes(this.caseType)
      );
    },
    showAppNumberExt() {
      return (
        !this.caseInfo.usAgency &&
        ["撤销复审答辩", "异议答辩"].includes(this.caseType)
      );
    },
    showOfficeDocGroup() {
      return (
        !this.caseInfo.usAgency && this.officeDocTypes.includes(this.caseType)
      );
    },
    showGeneralSubmitDate() {
      return (
        !this.caseInfo.usAgency && this.submitDateTypes.includes(this.caseType)
      );
    },
    showApprovalSet() {
      return (
        !this.caseInfo.usAgency &&
        ([
          "马德里商标转国内注册",
          "异议",
          "异议答辩",
          "分割申请",
          "不予注册复审",
        ].includes(this.caseType) ||
          this.trademarkList.includes(this.caseType))
      );
    },
    showDivisionParentInfo() {
      return !this.caseInfo.usAgency && this.caseType === "分割申请";
    },
    showAdminReview() {
      return !this.caseInfo.usAgency && this.caseType === "行政复议";
    },
    showWithdrawRegNo() {
      return (
        !this.caseInfo.usAgency &&
        ["撤回商标申请", "撤回商标评审"].includes(this.caseType) &&
        this.caseInfo.changeType === "转让/移转商标"
      );
    },
    showWithdrawOriginalRegNo() {
      return (
        !this.caseInfo.usAgency &&
        ["撤回商标申请", "撤回商标评审"].includes(this.caseType) &&
        this.caseInfo.changeType !== "转让/移转商标"
      );
    },
    withdrawRegNoLabel() {
      return ["撤销三年不使用注册商标", "转让/移转商标"].includes(
        this.caseInfo.changeType,
      )
        ? "商标号"
        : "原商标号";
    },
    showEarlyStop() {
      return (
        !this.caseInfo.usAgency &&
        this.caseType === "许可备案提前终止" &&
        ![62, 48].includes(this.caseTypeId)
      );
    },
    showRegBase() {
      return (
        !this.caseInfo.usAgency &&
        this.caseType !== "出具优先权证明文件" &&
        this.caseType !== "异议" &&
        this.caseType !== "异议答辩" &&
        ![62, 48].includes(this.caseTypeId)
      );
    },
    showRegDate() {
      return (
        this.showRegBase &&
        ![
          "不予注册复审",
          "异议答辩",
          "注册驳回复审",
          "国际注册驳回复审",
          "撤回商标申请",
          "撤回商标评审",
          "参加不予注册复审",
        ].includes(this.caseType)
      );
    },
    showJoinReviewApprovalNo() {
      return this.showRegBase && this.caseType === "参加不予注册复审";
    },
    showRegNumberOnly() {
      return (
        this.showRegBase &&
        ![
          "不予注册复审",
          "异议答辩",
          "注册驳回复审",
          "国际注册驳回复审",
          "撤回商标申请",
          "撤回商标评审",
          "参加不予注册复审",
        ].includes(this.caseType)
      );
    },
    showValidPeriod() {
      return (
        this.showRegBase &&
        ![
          "参加不予注册复审",
          "不予注册复审",
          "商标注销",
          "异议答辩",
          "注册驳回复审",
          "国际注册驳回复审",
          "撤回商标申请",
          "撤回商标评审",
        ].includes(this.caseType)
      );
    },
    showGoodsCheckFile() {
      return !this.caseInfo.usAgency && this.isForeignDirection;
    },
    canFetchCheckGoodsList() {
      return this.showGoodsCheckFile && !!this.caseInfo.caseId;
    },
    showQuoteTrademarkTable() {
      return (
        !this.caseInfo.usAgency &&
        [
          "异议",
          "无效宣告申请",
          "不予注册复审",
          "参加不予注册复审",
          "异议答辩",
          "撤销复审答辩",
          "无效宣告答辩",
        ].includes(this.caseType)
      );
    },
    quoteTableData() {
      return Array.isArray(this.caseInfo.quotes) ? this.caseInfo.quotes : [];
    },
    showTmlistAgency() {
      return !this.caseInfo.usAgency && this.tmlist.includes(this.caseType);
    },
    showSolidFlag() {
      return (
        !this.caseInfo.usAgency && this.caseType !== "变更注册申请代理机构"
      );
    },
    showMemberRule() {
      return (
        !this.caseInfo.usAgency && ["2", "3"].includes(this.caseInfo.tmType)
      );
    },
    showMemberList() {
      return !this.caseInfo.usAgency && this.caseInfo.tmType == "2";
    },
    showDetectAbility() {
      return !this.caseInfo.usAgency && this.caseInfo.tmType == "3";
    },
    showDetectAttach() {
      return (
        this.showDetectAbility && this.caseInfo.isAppWithDetectAbility === "是"
      );
    },
    showColorVoice() {
      return (
        !this.caseInfo.usAgency && this.caseType !== "变更注册申请代理机构"
      );
    },
    showChangeNameAddr() {
      return !this.caseInfo.usAgency && this.caseType === "变名变址";
    },
    showChangeCertLang() {
      return this.showChangeNameAddr && this.caseInfo.changeType !== "变更地址";
    },
    showJoinApps() {
      return (
        this.showChangeNameAddr &&
        Array.isArray(this.caseInfo.joinApps) &&
        this.caseInfo.joinApps.length > 0
      );
    },
  },
  watch: {
    canFetchCheckGoodsList: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getCheckGoodsList();
        } else {
          this.checkGoodList = [];
        }
      },
    },
    "caseInfo.caseId"(newVal, oldVal) {
      if (newVal && newVal !== oldVal && this.canFetchCheckGoodsList) {
        this.getCheckGoodsList();
      }
    },
  },
  methods: {
    gettyimage() {
      if (this.caseInfo.imageFile) {
        if (/^tmFile|\/tmFile/.test(this.caseInfo.imageFile)) {
          this.tyimage = `${this.caseInfo.imageFile}`;
        } else {
          this.tyimage = `/ipdoc${this.caseInfo.imageFile}`;
        }
      }
    },
    getCheckGoodsList() {
      if (!this.canFetchCheckGoodsList) return;
      queryImageGoodsList({
        caseId: this.caseInfo.caseId,
        pageNo: 1,
        pageSize: 9999,
      })
        .then((res) => {
          const data = res?.data;
          if (Array.isArray(data)) {
            this.checkGoodList = data;
          } else if (Array.isArray(data?.list)) {
            this.checkGoodList = data.list;
          } else if (Array.isArray(data?.records)) {
            this.checkGoodList = data.records;
          } else if (Array.isArray(data?.rows)) {
            this.checkGoodList = data.rows;
          } else {
            this.checkGoodList = [];
          }
        })
        .catch((err) => {
          console.log(err);
          this.checkGoodList = [];
        });
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
    this.gettyimage();
    this.$addCopy();
  },
  beforeUnmount() {
    this.$destroyCopy();
  },
};
</script>

<style></style>
