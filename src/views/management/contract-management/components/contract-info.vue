<template>
  <div class="contract-info-component">
    <!-- 基本信息卡片 -->
    <el-collapse v-model="activeNames">
      <!-- 案件信息卡片 -->
      <el-collapse-item
        title="案件信息"
        name="project"
      >
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr v-if="contractInfo.projectInfo?.caseInfoList">
              <th>案件文号 :</th>
              <td>
                <div class="case-number-info">
                  <span class="case-numbers">{{
                    contractInfo.projectInfo?.showRefno || "-"
                  }}</span>
                  <el-button
                    v-if="contractInfo.projectInfo?.caseInfoList?.length > 0"
                    size="small"
                    type="text"
                    @click="showCaseDetailsDialog = true"
                    class="detail-btn"
                  >
                    <i class="bx bx-info-circle"></i> 查看详情
                  </el-button>
                </div>
              </td>
              <th>客户负责人 :</th>
              <td>{{ contractInfo.projectInfo?.customerManagerName }}</td>
            </tr>
            <tr v-if="contractInfo.projectInfo?.caseInfoList">
              <th>客户 :</th>
              <td>
                <div class="cust-info">
                  <div>{{ formatCustomerNames }}</div>
                  <div>
                    <span>信用等级：</span>
                    <span>
                      {{
                        contractInfo.projectInfo?.customerInfoList[0]?.level
                      }}</span
                    >
                  </div>
                  <div
                    style="color: red"
                    v-if="
                      contractInfo.projectInfo?.customerInfoList[0]
                        ?.notAdvanceFlag
                    "
                  >
                    *不可垫付*
                  </div>
                  <div>
                    <el-popover
                      placement="top-start"
                      v-if="contractInfo.projectInfo?.customerInfoList[0]?.memo"
                      title="信用等级理由及批示"
                      :width="300"
                      ><div>
                        {{
                          contractInfo.projectInfo?.customerInfoList[0]?.memo
                        }}
                      </div>
                      <template #reference>
                        <el-button
                          size="small"
                          type="text"
                          style="padding-right: 4px"
                        >
                          <div style="padding-bottom: 2px; margin-right: 4px">
                            <i class="bx bx-info-circle" style="font-size: 14px;"></i>
                          </div>
                          理由
                        </el-button>
                      </template>
                    </el-popover>
                    <el-popover
                      placement="top-start"
                      title="附件信息"
                      :width="250"
                      v-if="customerDocList.length"
                    >
                      <template
                        v-for="(doc, idx) in customerDocList"
                        :key="doc.id || idx"
                      >
                        <div>
                          <span
                            class="clickable"
                            @click="handleClickMaterial(doc)"
                            >{{ doc.materialName }}</span
                          >
                        </div>
                      </template>
                      <template #reference>
                        <el-button
                          size="small"
                          type="text"
                          style="margin: 0; padding: 5px 0"
                        >
                          <i
                            class="bx bx-link-alt"
                            style="font-size: 14px"
                          ></i>
                        </el-button>
                      </template>
                    </el-popover>
                  </div>
                </div>
              </td>
              <th>客户组 :</th>
              <td>
                {{ contractInfo.projectInfo?.custWkgName || "-" }}
              </td>
            </tr>
            <!-- <tr v-if="contractInfo.projectInfo?.caseInfoList">
              <th>客户 :</th>
              <td>
                {{ formatCustomerNames }}
              </td>
              <th>案件类型 :</th>
              <td>
                {{ formatCaseTypes }}
              </td>
            </tr> -->
            <!-- <tr v-if="contractInfo.projectInfo?.caseInfoList">
              <th>申请方向 :</th>
              <td>{{ formatAppFromtos }}</td>
              <th>案件名称 :</th>
              <td>{{ formatCaseNames }}</td>
            </tr> -->
            <tr>
              <th>项目编号 :</th>
              <td>{{ contractInfo.projectNumber }}</td>
              <th>项目名称 :</th>
              <td>{{ contractInfo.projectInfo?.projectName }}</td>
            </tr>
            <tr>
              <th style="width: 10%">呈批人 :</th>
              <td style="width: 40%">
                {{ contractInfo.projectInfo?.undertakerName }}
              </td>
              <th style="width: 10%">所属工作组 :</th>
              <td style="width: 40%">
                {{ contractInfo.projectInfo?.wkgName }}
              </td>
            </tr>
          </tbody>
        </table>
      </el-collapse-item>
      <el-collapse-item
        title="合同基本信息"
        name="basic"
      >
        <div class="card-content">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th style="width: 10%">合同名称 :</th>
                <td style="width: 40%">{{ contractInfo.contractName }}</td>
                <th style="width: 10%">合同类型 :</th>
                <td style="width: 40%">{{ contractInfo.contractType }}</td>
              </tr>
              <tr>
                <th>合同编号 :</th>
                <td>{{ contractInfo.contractNo }}</td>
                <th>签订日期 :</th>
                <td>{{ contractInfo.signDate }}</td>
              </tr>
              <tr v-if="contractInfo?.checkItemList?.length">
                <th>合同中存在以下情形 :</th>
                <td colspan="3">
                  <!-- {{
                    tipsRender(contractInfo.checkItemList, contractInfo.remark)
                  }} -->
                  <el-checkbox-group
                    v-model="localContractInfo.checkItemList"
                    class="tip-checkbox-group"
                    @change="handleCheckboxChange"
                  >
                    <el-checkbox
                      label="来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理"
                      :value="1"
                      :disabled="true"
                    />
                    <el-checkbox
                      label="有风险代理约定"
                      :value="2"
                      :disabled="true"
                    />
                    <el-checkbox
                      label="需要垫付程序性费用或保证金"
                      :value="3"
                      :disabled="true"
                    />
                    <el-checkbox
                      label="约定账期超过6个月"
                      :value="4"
                      :disabled="true"
                    />
                    <el-checkbox
                      label="服务收费标准低于通用报价20%以上"
                      :value="5"
                      :disabled="true"
                    />
                    <div style="display: flex; gap: 10px">
                      <el-checkbox
                        label="其他"
                        :value="6"
                        :disabled="true"
                      />
                      <div>
                        <el-input
                          v-if="contractInfo.checkItemList?.includes(6)"
                          v-model="localContractInfo.remark"
                          width="200px"
                          :disabled="true"
                        />
                      </div>
                    </div>
                    <el-checkbox
                      label="均无"
                      :value="0"
                      :disabled="true"
                    />
                  </el-checkbox-group>
                </td>
              </tr>
              <tr
                v-for="(chunk, index) in signerChunks"
                :key="index"
              >
                <template
                  v-for="(signer, idx) in chunk"
                  :key="signer.id"
                >
                  <th>{{ signer.partyType }} :</th>
                  <td>{{ signer.signerName }}</td>
                  <template v-if="chunk.length === 1 && idx === 0">
                    <th></th>
                    <td></td>
                  </template>
                </template>
              </tr>
              <tr>
                <th>是否有原件 :</th>
                <td :colspan="contractInfo.hasOriginal ? 1 : 3">
                  {{ contractInfo.isHasOriginal }}
                </td>
                <template v-if="contractInfo.hasOriginal">
                  <th>我方留存的原件份数 :</th>
                  <td>{{ contractInfo.originalCopies }}</td>
                </template>
              </tr>
              <tr>
                <th>履行期限类型 :</th>
                <td :colspan="1">{{ contractInfo.isPerformanceTermType }}</td>
                <template v-if="contractInfo.performanceTermType === 0">
                  <th>履行期限 :</th>
                  <td
                    v-if="
                      contractInfo.performanceStartDate &&
                      contractInfo.performanceEndDate
                    "
                  >
                    {{ contractInfo.performanceStartDate }} 至
                    {{ contractInfo.performanceEndDate }}
                  </td>
                </template>
                <template v-if="contractInfo.performanceTermType === 1">
                  <th>不定期说明 :</th>
                  <td>{{ contractInfo.irregularExplanation }}</td>
                </template>
              </tr>
              <template v-if="contractInfo.hasOriginal">
                <tr
                  v-if="
                    contractInfo.isArchived === 0 ||
                    contractInfo.isArchived === 1
                  "
                >
                  <th>原件是否交档案保存 :</th>
                  <td :colspan="3">
                    {{ contractInfo.isArchived === 0 ? "否" : "是" }}
                  </td>
                </tr>
                <tr
                  v-if="
                    contractInfo.archiveKeeperName && contractInfo.archiveDate
                  "
                >
                  <th>原件保管人 :</th>
                  <td>{{ contractInfo.archiveKeeperName }}</td>
                  <th>交存日期 :</th>
                  <td colspan="3">
                    {{ dayjs(contractInfo.archiveDate).format("YYYY-MM-DD") }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </el-collapse-item>
      <!-- 合同内容卡片 -->
      <el-collapse-item
        title="合同内容简述"
        name="content"
      >
        <div class="info-card">
          <div class="card-content">
            <table class="table table-nowrap mb-0">
              <tbody>
                <tr>
                  <th style="width: 10%">合同金额 :</th>
                  <td colspan="3">
                    {{
                      formatAmount(
                        contractInfo.amount,
                        contractInfo.currency,
                        contractInfo.amountDescription
                      )
                    }}
                  </td>
                  <!-- <th style="width: 10%">付款方式 :</th>
                  <td style="width: 40%">
                    {{ contractInfo.paymentMethod }}
                  </td> -->
                </tr>
                <tr>
                  <th>合同简述：</th>
                  <td
                    colspan="3"
                    style="white-space: normal"
                  >
                    {{ contractInfo.serviceContent }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-collapse-item>
      <!-- 附件信息卡片 -->
      <el-collapse-item
        title="原始合同附件"
        name="attachments"
      >
        <template #title>
          <div class="title-container">
            <span class="main-title">原始合同附件</span>
            <span class="subtitle">本区展示呈批人首次提交的合同版本及附件</span>
          </div>
        </template>
        <div class="info-card">
          <div class="card-content">
            <table class="table table-nowrap mb-0">
              <tbody>
                <tr>
                  <th style="width: 10%">合同 :</th>
                  <td
                    colspan="3"
                    style="white-space: normal; width: 90%"
                    class="nocopy"
                  >
                    <span
                      class="clickable"
                      style="display: flex; align-items: center; gap: 4px"
                      ><span
                        @click="
                          viewFile(
                            contractInfo.sourceFile?.filePath,
                            contractInfo.sourceFile?.fileName
                          )
                        "
                      >
                        {{ contractInfo.sourceFile?.fileName }}
                      </span>
                      <span
                        class="bx bx-download"
                        style="font-size: 18px"
                        v-if="contractInfo.sourceFile?.fileName"
                        @click="
                          downLoad(
                            contractInfo.sourceFile?.filePath,
                            contractInfo.sourceFile?.fileName
                          )
                        "
                      ></span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>附件 :</th>
                  <td
                    colspan="3"
                    style="white-space: normal"
                    class="nocopy"
                  >
                    <div
                      v-for="item in contractInfo.attachmentList"
                      :key="item.attachmentId"
                      @click="viewFile(item.filePath, item.fileName)"
                      class="clickable"
                      style="margin-bottom: 4px"
                    >
                      {{ item.fileName }}
                    </div>
                    <div
                      v-if="
                        !contractInfo.attachmentList ||
                        contractInfo.attachmentList.length === 0
                      "
                      class="no-attachments"
                    >
                      暂无附件
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>呈批附加说明 :</th>
                  <td
                    colspan="3"
                    style="white-space: normal"
                  >
                    {{ contractInfo.approvaExplanation }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div></el-collapse-item
      >
    </el-collapse>

    <!-- 案件详情弹框 -->
    <CaseDetailsDialog
      v-model="showCaseDetailsDialog"
      :case-details="contractInfo.projectInfo?.caseInfoList || []"
      :case-type-list="[]"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from "vue";
import { viewFile, downLoad } from "@/utils";
import CaseDetailsDialog from "./case-details-dialog.vue";
import dayjs from "dayjs";

const props = defineProps({
  contractInfo: {
    type: Object,
    required: true,
    default: () => {},
  },
});

const localContractInfo = computed(() => props.contractInfo);
const activeNames = ref(["project", "basic", "content", "attachments"]);
const showCaseDetailsDialog = ref(false);

// const tipsMap = {
//   1: "来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理",
//   2: "有风险代理约定",
//   3: "需要垫付程序性费用或保证金",
//   4: "约定账期超过6个月",
//   5: "服务收费标准低于通用报价20%以上",
// };

const formatAmount = (amount, type, desc) => {
  if (type == "文字描述") {
    return desc;
  } else {
    return amount ? `${amount} ${type}` : "";
  }
};

// const tipsRender = (tips, remark = "") => {
//   if (!tips?.length) return "";
//   const ips = JSON.parse(JSON.stringify(tips));
//   ips.sort((a, b) => a - b);
//   const contents = ips.map((item) => tipsMap[item]).join("、");
//   const result = remark ? contents + remark : contents;
//   return result;
// };

// 将签署方数据按每行两个进行分组
const signerChunks = computed(() => {
  const chunks = [];
  if (props.contractInfo.signers && props.contractInfo.signers.length) {
    for (let i = 0; i < props.contractInfo.signers.length; i += 2) {
      chunks.push(props.contractInfo.signers.slice(i, i + 2));
    }
  }
  return chunks;
});

const formatCustomerNames = computed(() => {
  const caseInfoList = props.contractInfo.projectInfo?.caseInfoList || [];
  if (!caseInfoList.length) return "-";

  const custNames = caseInfoList
    .map((item) => item.custName)
    .filter((name) => name && name !== "未设置");

  return [...new Set(custNames)].join("、") || "-";
});

// 附件信息（客户信息里的 docList）
const customerDocList = computed(() => {
  return (
    props.contractInfo.projectInfo?.customerInfoList?.[0]?.docList || []
  ).filter((item) => !!item && !!item.materialName);
});

const handleClickMaterial = (doc) => {
  // 若有可预览/下载的路径与文件名，优先预览
  if (doc?.address || doc?.materialName) {
    viewFile(doc.address, doc.materialName);
    return;
  }
};
</script>

<style lang="scss" scoped>
.contract-info-component {
  :deep(.el-collapse) {
    border: none;
  }

  :deep(.el-collapse-item) {
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ebeef5;

    .el-collapse-item__header {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      background: #f5f7fa;
      border-bottom: none;
    }

    .el-collapse-item__content {
      padding: 0 16px 16px;
    }
  }

  .info-card {
    background: #fff;
  }

  .files {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}

.title-container {
  display: flex;
  align-items: center;
}

.main-title {
  margin-right: 12px;
}

.subtitle {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.no-attachments {
  color: #909399;
  font-style: italic;
}

.material-link {
  cursor: pointer;
  color: #409eff;
}

.case-number-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .case-numbers {
    flex: 1;
    word-break: break-all;
    line-height: 1.4;
  }

  .detail-btn {
    flex-shrink: 0;
    padding: 4px 8px;
    font-size: 12px;

    i {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}
.cust-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
