<template>
  <el-form
    :model="localContractInfo"
    label-width="100px"
    ref="conEditFormRef"
  >
    <div class="contract-info-component">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          title="案件信息"
          name="project"
        >
          <div class="row">
            <div class="col-md-12">
              <el-form-item
                label="案件文号"
                prop="projectInfo.caseIdList"
                label-width="100px"
              >
                <div class="case-number-selector">
                  <div v-if="!localContractInfo.projectInfo.showRefno" class="no-case-selected">
                    <span class="hint-text">请点击添加案件按钮</span>
                    <el-button
                      size="small"
                      type="primary" 
                      @click="handleAddCase"
                    >
                      <i class="bx bx-plus"></i> 添加案件
                    </el-button>
                  </div>
                  <div v-else class="case-selected">
                    <div class="case-number-display">
                      <div class="case-count-info">
                        <i class="bx bx-file"></i>
                        <span class="count-text">已选择 {{ selectedCaseDetails.length }} 个案件</span>
                        <el-button 
                          size="small" 
                          type="text" 
                          @click="showCaseDetailsDialog = true"
                          title="查看案件详情"
                        >
                          <i class="bx bx-info-circle"></i> 查看详情
                        </el-button>
                        <el-button 
                          size="small" 
                          type="primary" 
                          plain 
                          @click="handleModifyCase"
                        >
                          修改
                        </el-button>
                      </div>
                      <div class="case-numbers-text">
                        {{ localContractInfo.projectInfo.showRefno }}
                      </div>
                      <div class="count-text">
                        客户名称：{{ formatCustomerNames }}
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>
          <div class="row" v-if="selectedCaseDetails.length">
            <div class="col-md-6">
              <el-form-item
                label="客户负责人"
                prop="projectInfo.customerManager"
                label-width="100px"
                :rules="[
                  {
                    required: customerManagerList.length > 0,
                    message: '请选择客户负责人',
                    trigger: 'change',
                  },
                ]"
              >
                <el-select
                  v-model="localContractInfo.projectInfo.customerManager"
                  placeholder="客户负责人"
                >
                  <el-option
                    v-for="item in customerManagerList"
                    :key="item.custUserId"
                    :label="item.custUserName"
                    :value="item.custUserId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
            <div class="col-md-6">
              <el-form-item
                  label="客户组"
                  prop="projectInfo.custWkgId"
                  label-width="100px"
                  :rules="[
                      {
                        required: customerWorkGroupList.length > 0,
                        message: '请选择客户组',
                        trigger: 'change',
                      },
                    ]"
                >
                  <el-select
                    v-model="localContractInfo.projectInfo.custWkgId"
                    placeholder="请选择客户组"
                  >
                    <el-option
                      v-for="item in customerWorkGroupList"
                      :key="item.custWkgId"
                      :label="item.custWkgName"
                      :value="parseInt(item.custWkgId)"
                    />
                  </el-select>
                </el-form-item>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <el-form-item
                label="项目编号"
                prop="projectNumber"
                label-width="100px"
              >
                <el-input
                  v-model="localContractInfo.projectNumber"
                  placeholder="请输入项目编号"
                  clearable
                />
              </el-form-item>
            </div>
            <div class="col-md-6">
              <el-form-item
                label="项目名称"
                prop="projectInfo.projectName"
                label-width="100px"
              >
                <el-input
                  v-model="localContractInfo.projectInfo.projectName"
                  placeholder="请输入项目名称"
                  clearable
                />
              </el-form-item>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <el-form-item
                label="呈批人"
                label-width="100px"
                prop="projectInfo.undertaker"
                :rules="[
                  {
                    required: true,
                    message: '请选择呈批人',
                    trigger: 'change',
                  },
                ]"
              >
                <el-select
                  v-model="localContractInfo.projectInfo.undertaker"
                  placeholder="请选择"
                  filterable
                  clearable
                  disabled
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="col-md-6">
              <el-form-item
                label="所属工作组"
                prop="projectInfo.wkgId"
                label-width="100px"
                :rules="[
                  {
                    required: true,
                    message: '请选择所属工作组',
                    trigger: 'change',
                  },
                ]"
              >
                <el-select
                  v-model="localContractInfo.projectInfo.wkgId"
                  placeholder="所属工作组"
                  filterable
                >
                  <el-option
                    v-for="item in workGroups"
                    :key="item.wkgId"
                    :label="item.groupName"
                    :value="item.wkgId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          title="合同基本信息"
          name="basic"
        >
          <div class="row">
            <div class="col-md-6">
              <el-form-item
                label="合同名称"
                prop="contractName"
                :rules="[
                  {
                    required: true,
                    message: '请输入合同名称',
                    trigger: 'change',
                  },
                ]"
              >
                <el-input
                  v-model="localContractInfo.contractName"
                  placeholder="请输入合同名称"
                ></el-input>
              </el-form-item>
            </div>
            <div class="col-md-6">
              <el-form-item
                label="合同类型"
                prop="conTypeId"
                :rules="[
                  {
                    required: true,
                    message: '请选择合同类型',
                    trigger: 'change',
                  },
                ]"
              >
                <el-cascader
                  :options="contractTypeList"
                  v-model="localContractInfo.conTypeId"
                  :show-all-levels="false"
                  style="width: 100%"
                  @change="handleChange"
                  :props="{
                    children: 'codeCategories',
                    label: 'categoryName',
                    value: 'conTypeId',
                    expandTrigger: 'hover',
                  }"
                  placement="bottom-end"
                  popper-class="contract-type-popper"
                >
                  <template #default="{ data }">
                    <div class="cascader-item">
                      <span class="label">{{ data.categoryName }}</span>
                      <el-tooltip v-if="data.description" :content="data.description" show-after="400" placement="right">
                        <i class="bx bx-help-circle info-icon"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </el-cascader>
              </el-form-item>
            </div>
          </div>
          <div class="row" style="margin-bottom: 20px;">
              <el-form-item
                label="合同中存在以下情形"
                class="no-margin-bottom"
                prop="checkItemList"
              :rules="[
                {
                  required: true,
                  type: 'array',
                  message: '请至少选择一项或选择均无',
                  trigger: 'change',
                },
              ]"
            >
              <el-checkbox-group
                v-model="localContractInfo.checkItemList"
                class="tip-checkbox-group"
                @change="handleCheckboxChange"
              >
                <el-checkbox
                  label="来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理"
                  :value="1"
                  :disabled="localContractInfo.checkItemList.includes(0)"
                />
                <el-checkbox
                  label="有风险代理约定"
                  :value="2"
                  :disabled="localContractInfo.checkItemList.includes(0)"
                />
                <el-checkbox
                  label="需要垫付程序性费用或保证金"
                  :value="3"
                  :disabled="localContractInfo.checkItemList.includes(0)"
                />
                <el-checkbox
                  label="约定账期超过6个月"
                  :value="4"
                  :disabled="localContractInfo.checkItemList.includes(0)"
                />
                <el-checkbox
                  label="服务收费标准低于通用报价20%以上"
                  :value="5"
                  :disabled="localContractInfo.checkItemList.includes(0)"
                />
                <div style="display: flex; gap: 10px">
                  <el-checkbox
                    label="其他"
                    :value="6"
                    :disabled="localContractInfo.checkItemList.includes(0)"
                  />
                  <div>
                    <el-input
                      v-if="localContractInfo.checkItemList?.includes(6)"
                      v-model="localContractInfo.remark"
                      placeholder="请输入"
                      clearable
                      width="200px"
                    />
                  </div>
                </div>
                <el-checkbox
                  label="均无"
                  :value="0"
                  :disabled="localContractInfo.checkItemList.length > 0 && !localContractInfo.checkItemList.includes(0)"
                />
              </el-checkbox-group
            ></el-form-item>
          </div>
          <div class="row">
            <div
              v-for="(item, index) in localContractInfo.signers"
              :key="index"
              class="col-md-6"
            >
              <el-form-item
                :label="item.partyType"
                :prop="`signers[${index}].custCompId`"
                :rules="[
                  {
                    required:
                      item.partyType === '甲方' || item.partyType === '乙方',
                    message: '请输入公司信息',
                    trigger: 'change',
                  },
                ]"
              >
                <div class="d-flex align-items-center w-100">
                  <el-select
                    v-model="item.custCompId"
                    placeholder="请输入公司信息"
                    filterable
                    clearable
                    :remote="!((conType?.includes('A') &&
                        item.partyType === '甲方') ||
                      (!conType?.includes('A') && item.partyType === '乙方'))
                    "
                    allow-create="true"
                    :remote-method="fetchCustList"
                    class="flex-grow-1"
                    @change="
                      (val) => handleCompanySelect(val, index)
                    "
                  >
                    <el-option
                      v-for="companyItem in (conType?.includes('A') &&
                        item.partyType === '甲方') ||
                      (!conType?.includes('A') && item.partyType === '乙方')
                        ? ourCompanyList
                        : customerList"
                      :key="companyItem.value"
                      :label="companyItem.label"
                      :value="companyItem.value"
                    />
                  </el-select>
                  <el-button
                    v-if="
                      index === localContractInfo.signers.length - 1 &&
                      index > 1
                    "
                    type="text"
                    class="delete-btn ms-2"
                    @click="removeParty(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </el-form-item>
            </div>
          </div>
          <div
            class="add-party"
            v-if="canAddMoreParties"
          >
            <el-button
              link
              type="primary"
              @click="addParty"
            >
              添加交易方
            </el-button>
          </div>
          <div class="row">
            <div class="col-md-6">
              <el-form-item
                label="是否有原件"
                prop="hasOriginal"
                :rules="[
                  {
                    required: true,
                    message: '请选择是否有原件',
                    trigger: 'change',
                  },
                ]"
              >
                <el-radio-group v-model="localContractInfo.hasOriginal" @change="changeOriginal">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
            <div class="col-md-6" v-if="localContractInfo.hasOriginal">
              <el-form-item
                 label="我方留存的原件份数"
                 prop="originalCopies"
                 :rules="[
                    {
                      required: true,
                      message: '请输入原件份数',
                      trigger: 'blur',
                    },
                  ]"
                  label-width="150px"
                >
                <el-input-number v-model="localContractInfo.originalCopies" :min="1" :max="100" />
              </el-form-item>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <el-form-item label="履行期限类型"
                prop="performanceTermType"
                :rules="[
                  {
                    required: true,
                    message: '请选择履行期限类型',
                    trigger: 'change',
                  },
                ]"
                label-width="110px"
              >
                <el-radio-group v-model="localContractInfo.performanceTermType">
                  <el-radio :label="0">定期</el-radio>
                  <el-radio :label="1">不定期</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
            <div class="col-md-6">
              <el-form-item 
                label="履行期限"
                prop="performanceDate"
                v-if="localContractInfo.performanceTermType === 0"
              >
                <template #label>
                  <span class="text-danger">*</span>
                  <span>履行期限</span>
                </template>
                <div class="d-flex gap-2">
                  <el-form-item
                    prop="performanceStartDate"
                    :rules="[
                      {
                        required: true,
                        message: '请选择开始日期',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-date-picker
                      v-model="localContractInfo.performanceStartDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="开始日期"
                      style="width: 150px;"
                    />
                  </el-form-item>
                  <span>至</span>
                  <el-form-item
                    prop="performanceEndDate"
                    :rules="[
                      {
                        required: true,
                        message: '请选择结束日期',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-date-picker
                      v-model="localContractInfo.performanceEndDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="结束日期"
                      style="width: 150px;"
                    />
                  </el-form-item>
                </div>
              </el-form-item>
              <el-form-item
                label="不定期说明"
                v-if="localContractInfo.performanceTermType === 1"
              >
                <el-input
                  v-model="localContractInfo.irregularExplanation"
                  placeholder="请输入不定期说明"
                  clearable
                />
              </el-form-item>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item
          title="合同内容简述"
          name="content"
        >
          <div class="row">
            <div class="col-md-6">
              <el-form-item
                label-width="80px"
                label="合同金额"
                prop="amount"
                :rules="[
                  {
                    required: true,
                    message: '请输入合同金额',
                    trigger: 'change',
                  },
                ]"
              >
                <el-input
                  v-model="localContractInfo.amount"
                  placeholder="请输入合同金额"
                  @mousewheel.prevent
                  :type="
                    localContractInfo.currency == '文字描述'
                      ? 'input'
                      : 'number'
                  "
                  :min="0"
                >
                  <template #append>
                    <el-select
                      style="width: 100px"
                      v-model="localContractInfo.currency"
                      @change="handleCurrencyChange"
                    >
                      <el-option
                        label="人民币"
                        value="人民币"
                      />
                      <el-option
                        label="美元"
                        value="美元"
                      />
                      <el-option
                        label="文字描述"
                        value="文字描述"
                      />
                    </el-select> </template
                ></el-input>
              </el-form-item>
            </div>
            <!-- <div class="col-md-6">
              <el-form-item label="付款方式">
                <el-select
                  v-model="localContractInfo.paymentMethod"
                  placeholder="请选择付款方式"
                >
                  <el-option
                    label="银行转账"
                    value="银行转账"
                  ></el-option>
                  <el-option
                    label="现金"
                    value="现金"
                  ></el-option>
                  <el-option
                    label="支票"
                    value="支票"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div> -->
          </div>
          <el-form-item
            label="合同简述"
            label-width="80px"
          >
            <el-input
              v-model="localContractInfo.serviceContent"
              type="textarea"
              placeholder="请输入服务内容"
              :autosize="{ minRows: 2, maxRows: 4 }"
            ></el-input> </el-form-item
        ></el-collapse-item>
        <el-collapse-item
          title="附件信息"
          name="attachments"
        >
          <el-form-item
            label="合同"
            label-width="80px"
            class="upload-item"
          >
            <el-upload
              name="file"
              ref="contractUploadRef"
              :data="contractUploadData"
              :action="uploadUrl"
              :auto-upload="false"
              :on-success="handleContractUploadSuccess"
              :on-remove="brforeContractRemoveFile"
              :on-exceed="handleContractExceed"
              :on-change="handleContractFileChange"
              :limit="1"
              :file-list="contractFileList"
              accept=".doc,.docx"
              v-if="contractInfo.canUploadContract"
            >
              <el-button
                size="small"
                type="primary"
                @click.stop.prevent="handleContractUploadClick"
                >点击上传合同</el-button
              >
              <template #tip>
                <span style="font-size: 11px; color: #d3d3d3; margin-left: 5px"
                  >(支持上传 DOC/DOCX 格式的可编辑文档（建议大小 ≤ 5MB），请勿上传只读或加密文件)</span
                >
              </template>
            </el-upload>
            <div v-else>
              <span
                class="clickable"
                @click="
                  viewFile(
                    contractInfo.attachmentCon?.filePath,
                    contractInfo.attachmentCon?.fileName
                  )
                "
              >
                {{ contractInfo.attachmentCon?.fileName }}
              </span>
            </div>
          </el-form-item>
          <el-form-item
            label="附件"
            label-width="80px"
            class="upload-item"
          >
            <el-upload
              name="file"
              :data="uploadFileData"
              :action="uploadUrl"
              :on-success="handleUploadSuccess"
              :on-remove="brforeRemoveFile"
              :file-list="fileList"
              multiple
              v-if="contractInfo.canUploadContract"
            >
              <el-button
                size="small"
                type="primary"
                >点击上传附件</el-button
              >
              <template #tip>
                <span style="font-size: 11px; color: #d3d3d3; margin-left: 5px"
                  >(建议文件大小不超过5MB)</span
                >
              </template>
            </el-upload>
            <div v-else class="attachment-list">
              <div 
                v-for="item in contractInfo.attachmentList" 
                :key="item.attachmentId"
                class="attachment-item"
              >
                <div class="attachment-content">
                  <span
                    class="clickable attachment-name"
                    @click="viewFile(item.filePath, item.fileName)"
                  >
                    {{ item.fileName }}
                  </span>
                </div>
              </div>
              <div v-if="!contractInfo.attachmentList || contractInfo.attachmentList.length === 0" class="no-attachments">
                暂无附件
              </div>
            </div>
          </el-form-item>
          <el-form-item
            label="呈批附加说明"
          >
            <el-input
              v-model="localContractInfo.approvaExplanation"
              type="textarea"
              placeholder="请输入呈批附加说明"
              :autosize="{ minRows: 2, maxRows: 4 }"
            ></el-input> </el-form-item
          ></el-collapse-item
        ></el-collapse
      >

      <!-- <div class="row">
        <div class="col-md-6">
          <el-form-item
            label="合同编号:"
            prop="contractNumber"
            label-width="80px"
          >
            {{ localContractInfo.contractNumber }}
          </el-form-item>
        </div>
      </div> -->
    </div>
    
    <!-- 案件选择弹框 -->
    <CaseSelectDialog 
      v-model="showCaseSelectDialog"
      :initial-agent-nums="currentShowRefno"
      @confirm="handleCaseSelectConfirm"
    />

    <!-- 案件详情弹框 -->
    <CaseDetailsDialog 
      v-model="showCaseDetailsDialog"
      :case-details="selectedCaseDetails"
      :case-type-list="caseTypeListOptions"
    />
  </el-form>
</template>

<script setup>
import {
  defineProps,
  ref,
  onMounted,
  defineExpose,
  computed,
  watch,
  nextTick,
} from "vue";
import {
  queryContractTypeList,
  getCustomerList,
  queryCompany,
  getCaseCustomerManager,
} from "@/api/contract";
import { getToken } from "@/utils/auth";

import { queryZZWorkGroupUrl } from "@/api/billApi";
import { queryGroupsByUserId } from "@/api/user";
import {
  queryList,
  queryCaseType,
} from "@/api/caseList.js";
import { uploadAttachments } from "@/api/serviceApi.config.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

import { useStore } from "vuex";
import CaseSelectDialog from './case-select-dialog.vue';
import CaseDetailsDialog from './case-details-dialog.vue';

const store = useStore();

const props = defineProps({
  contractInfo: {
    type: Object,
    required: true,
    default: () => {},
  },
});
const contractUploadRef = ref(null)
const activeNames = ref(["basic", "project", "content", "attachments"]);
const contractTypeList = ref([]);
const localContractInfo = ref({
  ...props.contractInfo,
  amount:
    props.contractInfo.currency === "文字描述"
      ? props.contractInfo.amountDescription
      : props.contractInfo.amount,
  projectInfo: {
    ...props.contractInfo.projectInfo,
    caseIdList: props.contractInfo.projectInfo?.caseIdList || [],
    custIdList: props.contractInfo.projectInfo?.custIdList || [],
    caseTypeList: props.contractInfo.projectInfo?.caseTypeList || [],
    appFromtoList: props.contractInfo.projectInfo?.appFromtoList || [],
    caseNameNameList: props.contractInfo.projectInfo?.caseNameNameList || [],
    showRefno: props.contractInfo.projectInfo?.showRefno || "",
    custWkgId: parseInt(props.contractInfo.projectInfo?.custWkgId) || 0,
  } || {
    caseIdList: [],
    custIdList: [],
    caseTypeList: [],
    appFromtoList: [],
    caseNameNameList: [],
    showRefno: "",
    custWkgId: 0,
  },
}); // 使用本地状态来管理合同信息
const fetchContractTypeList = () => {
  queryContractTypeList({}).then((res) => {
    contractTypeList.value = res.data;
  });
};

const formatCustomerNames = computed(() => {
  const caseInfoList = selectedCaseDetails.value || [];
  
  const custNames = caseInfoList
    .map(item => item.custName)
    .filter(name => name && name !== "未设置");
  
  return [...new Set(custNames)].join("、") || "";
});

const userList = computed(() => {
  return store.state.user.userList;
});
const fileList = ref([
  ...props.contractInfo.attachmentList.map((item) => {
    return {
      name: item.fileName,
      url: item.filePath,
      attachmentId: item.attachmentId,
    };
  }),
]);
const changeOriginal = (value) =>{
  if (value) {
    localContractInfo.value.originalCopies = 1
  } else {
    localContractInfo.value.originalCopies = undefined
  }
}
const customerManagerList = ref([]);
const customerWorkGroupList = ref([]);
const fetchCaseCustomerManager = (caseIds, type) => {
  if (caseIds && caseIds.length) {
    getCaseCustomerManager({ caseIds }).then((res) => {
      if (res.data?.length) {
        // 按custUserId去重客户负责人，并过滤掉空值
        const uniqueManagers = res.data.filter((manager, index, self) => 
          manager.custUserId && manager.custUserName && // 过滤掉空值
          index === self.findIndex(m => m.custUserId === manager.custUserId)
        );
        
        // 按custWkgId去重客户工作组，并过滤掉空值
        const uniqueWorkGroups = res.data.filter((item, index, self) => 
          item.custWkgId && item.custWkgName && // 过滤掉空值
          index === self.findIndex(w => w.custWkgId === item.custWkgId)
        );
        
        if (type !== "init") {
          localContractInfo.value.projectInfo.customerManager =
            uniqueManagers.length > 0 ? uniqueManagers[0].custUserId : undefined;
          // 设置默认客户工作组
          if (uniqueWorkGroups.length > 0) {
            localContractInfo.value.projectInfo.custWkgId = parseInt(uniqueWorkGroups[0].custWkgId);
          } else {
            localContractInfo.value.projectInfo.custWkgId = 0;
          }
        }
        customerManagerList.value = uniqueManagers;
        customerWorkGroupList.value = uniqueWorkGroups;
      }
    });
  } else {
    localContractInfo.value.projectInfo.customerManager = undefined;
    localContractInfo.value.projectInfo.custWkgId = 0;
    customerManagerList.value = [];
    customerWorkGroupList.value = [];
  }
};

// 监听案件文号变化
watch(
  () => localContractInfo.value.projectInfo.caseIdList,
  (newValue) => {
    if (!newValue || newValue.length === 0) {
      localContractInfo.value.projectInfo.custIdList = [];
      localContractInfo.value.projectInfo.caseTypeList = [];
      localContractInfo.value.projectInfo.appFromtoList = [];
      localContractInfo.value.projectInfo.caseNameNameList = [];
      localContractInfo.value.projectInfo.showRefno = "";
      localContractInfo.value.projectInfo.custWkgId = 0;
      selectedCaseDetails.value = [];
    }
  }
);

const caseTypeListOptions = ref([]);
const fetchCaseType = () => {
  queryCaseType().then((res) => {
    caseTypeListOptions.value = res.data;
  });
};

// 获取案件类型名称
const getCaseTypeName = (caseTypeId) => {
  if (!caseTypeId) return '';
  
  const findCaseType = (types, id) => {
    for (const type of types) {
      if (type.caseTypeId === id) {
        return type.caseType;
      }
      if (type.childrens && type.childrens.length > 0) {
        const found = findCaseType(type.childrens, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findCaseType(caseTypeListOptions.value, caseTypeId) || '';
};

//案件文号获取
const caseNumberOptions = ref([]);

const workGroups = ref([]);

//获取初始客户列表
const fetchCustomerList = () => {
  const idList = props.contractInfo.signers
    .filter((item) => item.custCompId && item.isOur !== 1)  // 排除isOur为1的记录
    .map((item) => item.custCompId);
  if (idList.length) {
    getCustomerList({ custIdList: idList }).then((res) => {
      customerList.value = res.data.map((item) => ({
        label: item.fullname,
        value: item.custId,
      }));
    });
  }
};

const fetchWorkGroups = () => {
  queryZZWorkGroupUrl().then((res) => {
    workGroups.value = res.data;
  });
};
const contractFileList = ref(
  props.contractInfo.attachmentCon
    ? [
        {
          name: props.contractInfo.attachmentCon.fileName,
          url: props.contractInfo.attachmentCon.filePath,
          attachmentId: props.contractInfo.attachmentCon.attachmentId,
        },
      ]
    : []
);
const uploadUrl = uploadAttachments; // 替换为实际的上传接口
const uploadFileData = ref({
  tokenID: getToken(),
  fileCategory: 2,
});
const contractUploadData = ref({
  tokenID: getToken(),
  fileCategory: 1,
});
const handleUploadSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    fileList.value.push(newFile)
  }
};

const brforeRemoveFile = (file) => {
  // 从 fileList 中移除文件
  fileList.value = fileList.value.filter(
    (item) => item.attachmentId !== (file.attachmentId || file.response?.data?.attachmentId)
  );
};
// 合同上传按钮点击处理
const handleContractUploadClick = (event) => {
  // 阻止默认行为和事件冒泡
  event.preventDefault();
  event.stopPropagation();
  
  ElMessageBox.alert('请将文档设置为【修订】模式，以便记录修改痕迹！', '提示', {
    confirmButtonText: '确定',
    type: 'info',
  }).then(() => {
    // 用户确认后，触发文件选择
    nextTick(() => {
      const fileInput = contractUploadRef.value?.$el?.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.click();
      } else {
        // 如果找不到input，尝试直接触发el-upload的点击
        const uploadEl = contractUploadRef.value?.$el;
        if (uploadEl) {
          const trigger = uploadEl.querySelector('.el-upload__input') || uploadEl.querySelector('input');
          if (trigger) {
            trigger.click();
          }
        }
      }
    });
  }).catch(() => {
    // 用户取消，不做任何操作
  });
};

// 文件选择后的处理
const handleContractFileChange = (file) => {
  if (file && file.raw) {
    // 验证文件类型，只允许 doc 和 docx
    const fileName = file.name || '';
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    const isValidType = fileExtension === 'doc' || fileExtension === 'docx';
    
    // 也可以通过 MIME 类型验证
    const isValidMimeType = file.raw.type === 'application/msword' || 
                           file.raw.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isValidType && !isValidMimeType) {
      // 文件类型不符合要求，清除文件并提示
      ElMessage.error('只能上传 DOC 或 DOCX 格式的文件！');
      contractUploadRef.value.clearFiles();
      contractFileList.value = [];
      return;
    }
    
    // 文件类型正确，自动上传文件
    contractUploadRef.value.submit();
  }
};

const handleContractUploadSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    contractFileList.value = [newFile];
  }
};
const handleContractExceed = (files) => {
  if (files && files.length > 0) {
    const file = files[0];
    // 验证文件类型，只允许 doc 和 docx
    const fileName = file.name || '';
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    const isValidType = fileExtension === 'doc' || fileExtension === 'docx';
    
    // 也可以通过 MIME 类型验证
    const isValidMimeType = file.type === 'application/msword' || 
                           file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isValidType && !isValidMimeType) {
      // 文件类型不符合要求，清除文件并提示
      ElMessage.error('只能上传 DOC 或 DOCX 格式的文件！');
      contractUploadRef.value.clearFiles();
      contractFileList.value = [];
      return;
    }
    
    // 文件替换
    contractUploadRef.value.clearFiles();
    contractUploadRef.value.handleStart(files[0]);
    // 自动上传新文件
    contractUploadRef.value.submit();
  }
};

const brforeContractRemoveFile = (file) => {
  // 从 contractFileList 中移除文件
  contractFileList.value = contractFileList.value.filter(
    (item) => item.attachmentId !== file.attachmentId
  );
};

// const beforeUpload = (file) => {
//   const isPDF = file.type === "application/pdf";
//   const isDOC =
//     file.type === "application/msword" ||
//     file.type ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
//   const isImage = file.type.startsWith("image/");
//   const isValidFormat = isPDF || isDOC || isImage;

//   if (!isValidFormat) {
//     ElMessage.warning("仅支持PDF/DOC/图片格式");
//   }
//   return isValidFormat;
// };

const findObjectByConTypeId = (dataArray, conTypeId) => {
  // 如果 conTypeId 是一个数组，使用数组的最后一个元素
  if (Array.isArray(conTypeId)) {
    conTypeId = conTypeId[conTypeId.length - 1];
  }

  // 内部递归函数用于查找对象
  function recursiveSearch(currentData) {
    // 检查当前对象是否具有所需的 conTypeId
    if (currentData.conTypeId === conTypeId) {
      return currentData;
    }

    // 如果有子类别，递归搜索它们
    if (currentData.codeCategories && currentData.codeCategories.length > 0) {
      for (const category of currentData.codeCategories) {
        const found = recursiveSearch(category);
        if (found) {
          return found;
        }
      }
    }

    // 如果没有找到，返回 null
    return null;
  }

  // 遍历数组中的每个元素
  for (const data of dataArray) {
    const found = recursiveSearch(data);
    if (found) {
      return found;
    }
  }

  // 如果没有找到，返回 null
  return null;
};
const handleChange = () => {
  // localContractInfo.value.checkItemList = [];
  localContractInfo.value.remark = "";
  localContractInfo.value.signers = [
    {
      custCompId: "",
      partyType: "甲方",
      signerName: "",
    },
    {
      custCompId: "",
      partyType: "乙方",
      signerName: "",
    },
  ];
};
const handleCheckboxChange = (values) => {
  console.log(values, "values");
  // 如果包含"均无"选项
  if (values.includes(0)) {
    // 清除其他所有选项，只保留"均无"
    localContractInfo.value.checkItemList = [0];
    // 清除备注
    if (localContractInfo.value.remark) {
      localContractInfo.value.remark = '';
    }
  }
};
const conType = computed(() => {
  const data = JSON.parse(JSON.stringify(contractTypeList.value));
  let type = "";
  if (data.length) {
    const result = findObjectByConTypeId(
      data,
      localContractInfo.value.conTypeId
    );
    console.log(result, "result");
    type = result?.categoryCode;
  }
  return type;
});

const handleCurrencyChange = (value) => {
  if (value !== "文字描述" && localContractInfo.value.amount) {
    const res = localContractInfo.value?.amount?.match(/\d+/);
    if (res) {
      localContractInfo.value.amount = res[0];
    }
  }
};
const conEditFormRef = ref(null);


// 获取表单数据的方法
const getFormData = (isSave) => {
  return new Promise((resolve) => {
    //提交后保存也需要表单校验
    if (isSave == 2 || props.contractInfo.outwardFlowVOList.length > 1) {
      conEditFormRef.value.validate((valid) => {
        if (valid) {
          if (contractFileList.value.length < 1) {
            ElMessage.warning("请上传合同");
            resolve(false);
          } else {
            // 使用深拷贝确保数据安全传递
            const formData = JSON.parse(JSON.stringify(localContractInfo.value));
            
            // 确保projectInfo和caseNameNameList存在
            if (!formData.projectInfo) {
              formData.projectInfo = {};
            }
            formData.projectInfo.caseNameNameList = localContractInfo.value.projectInfo.caseNameNameList || [];
            
            // 添加文件数据
            formData.fileList = fileList.value;
            formData.contractFileList = contractFileList.value;
            
            // 处理"均无"选项，如果只有均无，则清空checkItemList
            if (formData.checkItemList && formData.checkItemList.length === 1 && formData.checkItemList[0] === 0) {
              formData.checkItemList = [];
            }
            resolve(formData);
          }
        } else {
          ElMessage.warning("请填写必填项");
          resolve(false);
        }
      });
    } else {
      // 使用深拷贝确保数据安全传递
      const formData = JSON.parse(JSON.stringify(localContractInfo.value));
      
      // 确保projectInfo和caseNameNameList存在
      if (!formData.projectInfo) {
        formData.projectInfo = {};
      }
      formData.projectInfo.caseNameNameList = localContractInfo.value.projectInfo.caseNameNameList || [];
      
      // 添加文件数据
      formData.fileList = fileList.value;
      formData.contractFileList = contractFileList.value;
      resolve(formData);
    }
  });
};

// 暴露方法给父组件
defineExpose({
  getFormData,
});

onMounted(() => {
  fetchContractTypeList();
  fetchWorkGroups();
  fetchCaseType();
  fetchCustomerList();
  fetchOurCompanyList();
  // 初始化客户信息已在customerList中处理
  if (props.contractInfo?.projectInfo?.caseInfoList?.length > 0) {
    caseNumberOptions.value = props.contractInfo.projectInfo.caseInfoList;
  }
  //处理自定义客户
  if (props.contractInfo?.signers && props.contractInfo?.signers.length) {
    props.contractInfo?.signers.forEach((item) => {
      if (!item.custCompId && item.signerName) {
        item.custCompId = item.signerName;
      }
      
      // 确保每个签约方都有isOur属性
      if (item.isOur === undefined) {
        const isOurCompany = 
          (conType.value?.includes("A") && item.partyType === "甲方") ||
          (!conType.value?.includes("A") && item.partyType === "乙方")
            ? 1
            : 0;
        item.isOur = isOurCompany;
      }
    });
  }
  if (props.contractInfo?.projectInfo?.caseIdList) {
    fetchCaseCustomerManager(
      props.contractInfo?.projectInfo?.caseIdList,
      "init"
    );
  }
  
  // 初始化selectedCaseDetails
  if (props.contractInfo?.projectInfo?.caseInfoList?.length > 0) {
    selectedCaseDetails.value = props.contractInfo.projectInfo.caseInfoList.map(item => ({
      caseId: item.caseId,
      agentNum: item.agentNum,
      caseName: item.caseName,
      custName: item.custName,
      appFromto: item.appFromto,
      caseTypeStr: item.caseType
    }));
  }

  // 页面加载完成后，确保B类合同的特殊情形选项正确初始化
  nextTick(() => {
    if ((!localContractInfo.value.checkItemList || 
         localContractInfo.value.checkItemList.length === 0)) {
      localContractInfo.value.checkItemList = [0];
    }
  });
});

const partyRoles = ["丙方", "丁方", "戊方", "己方"];

const canAddMoreParties = computed(() => {
  return localContractInfo.value.signers.length - 2 < partyRoles.length;
});

const ourCompanyList = ref([]);

const customerList = ref([]);
//获取我方公司主体
const fetchOurCompanyList = () => {
  queryCompany().then((res) => {
    ourCompanyList.value = res.data.map((item) => ({
      label: item.companyNameCn,
      value: item.compId,
    }));
  });
};
const fetchCustList = (value) => {
  if (value) {
    const params = { pageNo: 1, pageSize: 100, sign: 1, parameter: value };
    queryList(params).then((res) => {
      customerList.value = res.data.map((item) => ({
        value: item.custId,
        label: item.fullname,
      }));
    });
  }
};

const addParty = () => {
  if (canAddMoreParties.value) {
    const partyType = partyRoles[localContractInfo.value.signers.length - 2];
    // 判断新添加的签约方是否为我方公司
    const isOurCompany = 
      (conType.value?.includes("A") && partyType === "甲方") ||
      (!conType.value?.includes("A") && partyType === "乙方")
        ? 1
        : 0;
    
    localContractInfo.value.signers.push({
      custCompId: "",
      partyType: partyType,
      signerName: "",
      isOur: isOurCompany
    });
  }
};

const removeParty = (index) => {
  localContractInfo.value.signers.splice(index, 1);
};

const handleCompanySelect = (value, index) => {
  const item = localContractInfo.value.signers[index];
  const isOurCompany =
    (conType.value?.includes("A") && item.partyType === "甲方") ||
    (!conType.value?.includes("A") && item.partyType === "乙方")
      ? 1
      : 0;

  let selectedOption;
  if (isOurCompany) {
    selectedOption = ourCompanyList.value.find(
      (option) => option.value === value
    );
  } else {
    selectedOption = customerList.value.find(
      (option) => option.value === value
    );
  }

  if (selectedOption) {
    localContractInfo.value.signers[index].signerName = selectedOption.label;
  } else if (value) {
    localContractInfo.value.signers[index].signerName = value;
  } else {
    localContractInfo.value.signers[index].signerName = "";
  }
  
  // 明确设置isOur属性
  localContractInfo.value.signers[index].isOur = isOurCompany;
};

// 修改初始化B类合同特殊情形的函数
// const initBContractCheckItems = () => {
//   if ((!localContractInfo.value.checkItemList || 
//        (Array.isArray(localContractInfo.value.checkItemList) && localContractInfo.value.checkItemList.length === 0))) {
//     // 只有当未选择任何项时，才设置为均无
//     localContractInfo.value.checkItemList = [0];
//   }
// };

// // 监听合同类型变化
// watch(conType, () => {
//   // 延迟执行，确保其他相关数据已更新
//   setTimeout(() => {
//     initBContractCheckItems();
//   }, 100);
// });

// 根据用户ID获取用户所属工作组
const fetchGroupsByUserId = (user_id) => {
  if (!user_id) return;
  
  // 清除当前选中的工作组，避免旧值干扰
  // localContractInfo.value.projectInfo.wkgId = null;
  
  queryGroupsByUserId({ userId: user_id }).then((res) => {
    if (res.data && res.data.length) {
      localContractInfo.value.projectInfo.wkgId = res.data[0].wkgId;
    }
  });
};

// 监听呈批人变化，联动更新工作组
watch(
  () => localContractInfo.value.projectInfo.undertaker,
  (newValue, oldValue) => {
    // 只有当新值与旧值不同，且新值存在时，才更新工作组
    if (newValue && newValue !== oldValue) {
      fetchGroupsByUserId(newValue);
    }
  }
);

// 弹框控制变量
const showCaseSelectDialog = ref(false);
const showCaseDetailsDialog = ref(false);
const selectedCaseDetails = ref([]);
const currentShowRefno = ref(''); // 当前要传入弹框的案件文号

// 处理修改按钮点击
const handleModifyCase = () => {
  // 将当前的showRefno传入弹框
  currentShowRefno.value = localContractInfo.value.projectInfo.showRefno || '';
  showCaseSelectDialog.value = true;
};

// 处理添加案件按钮点击
const handleAddCase = () => {
  // 清空当前案件文号，表示新增
  currentShowRefno.value = '';
  showCaseSelectDialog.value = true;
};

// 处理案件选择确认
const handleCaseSelectConfirm = ({ selectedCases, showRefno }) => {
  // 更新选中的案件详情
  selectedCaseDetails.value = selectedCases;
  
  // 更新合同表单中的案件信息
  localContractInfo.value.projectInfo.caseIdList = selectedCases.map(item => item.caseId);
  localContractInfo.value.projectInfo.custIdList = selectedCases.map(item => item.custId || null);
  localContractInfo.value.projectInfo.caseTypeList = selectedCases.map(item => item.caseTypeId || null);
  localContractInfo.value.projectInfo.appFromtoList = selectedCases.map(item => item.appFromto || null);
  localContractInfo.value.projectInfo.caseNameNameList = selectedCases.map(item => item.caseName || null);
  localContractInfo.value.projectInfo.showRefno = showRefno;
  
  // 更新案件信息列表用于显示
  localContractInfo.value.projectInfo.caseInfoList = selectedCases.map(item => ({
    caseId: item.caseId,
    agentNum: item.agentNum,
    caseName: item.caseName,
    custId: item.custId,
    custName: item.custName,
    appFromto: item.appFromto,
    caseType: item.caseTypeStr || getCaseTypeName(item.caseTypeId)
  }));
  
  // 获取客户负责人信息
  if (localContractInfo.value.projectInfo.caseIdList.length > 0) {
    fetchCaseCustomerManager(localContractInfo.value.projectInfo.caseIdList);
  }
};
</script>

<style lang="scss">
.upload-item {
  margin-bottom: 8px;
}
.contract-info-component {
  .el-collapse {
    border: none;
  }

  .el-collapse-item {
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
      padding: 16px 16px;
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
.no-margin-bottom {
  margin-bottom: 0 !important;
}

.required-label {
  position: relative;
  
  &::before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }
}

.select-wrapper {
  width: 100%;
}

.flex-grow-1 {
  flex-grow: 1;
  min-width: 0;
}

.delete-btn {
  flex-shrink: 0;
  padding: 0;
  margin-left: 8px;

  i {
    font-size: 16px;
    color: #f56c6c;
  }

  &:hover i {
    color: #f78989;
  }
}

.add-party {
  padding-left: 100px;
}
.contract-type-popper {
  .el-popper__arrow {
    right: 35px !important;
    left: auto !important;
  }
}

.cascader-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .label {
    flex: 1;
  }
  
  .info-icon {
    margin-left: 5px;
    font-size: 16px;
    color: #909399;
    cursor: pointer;
  }
}

/* 案件名称标签样式 */
.case-name-tag {
  margin: 4px;
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  font-size: 12px;
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  background-color: #f2f6fc;
  border: 1px solid #dae4fd;
  color: #409eff;
  
  &:hover {
    background-color: #ecf5ff;
  }
  
  :deep(.el-tag__close) {
    color: #409eff;
    right: -2px;
    
    &:hover {
      background-color: #409eff;
      color: #fff;
    }
  }
}

.case-name-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.case-tags-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  width: 100%;
  min-height: 32px;
  border-radius: 4px;
  padding: 3px 4px;
  background-color: #f8f9fa;
  border: 1px solid #e4e7ed;
  align-items: center;
}

.case-name-input-wrapper {
  display: flex;
  width: 100%;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.attachment-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-name {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}

.attachment-name:hover {
  text-decoration: underline;
}

.no-attachments {
  color: #909399;
  font-style: italic;
}

/* 案件详情区域样式 */
.case-details-section {
  background: #f8f9fa;
  border-radius: 6px;
  margin: 0 0 20px 0;
  border: 1px solid #e4e7ed;
  
  .case-details-header {
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }
  
  .case-details-content {
    padding: 16px;
    max-height: 280px;
    overflow-y: auto;
    position: relative;
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
  
  .case-detail-item {
    background: #fff;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e4e7ed;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .case-detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
      
      .case-number {
        font-weight: 600;
        color: #409eff;
        margin-right: 12px;
        font-size: 14px;
      }
      
      .case-name {
        color: #606266;
        font-size: 13px;
        flex: 1;
      }
    }
    
    .case-detail-info {
      .info-row {
        display: flex;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-item {
          flex: 1;
          display: flex;
          align-items: center;
          font-size: 13px;
          
          label {
            color: #909399;
            margin-right: 8px;
            min-width: 80px;
            font-weight: 500;
            margin: 0;
          }
          
          span {
            color: #606266;
            word-break: break-all;
          }
          
          &.info-item-wide {
            flex: 2.3;
          }
          
          &.info-item-narrow {
            flex: 1.2;
          }
        }
      }
    }
  }
}

/* 案件文号选择器样式 */
.case-number-selector {
  .no-case-selected {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 2px 16px;
    background: #f8f9fa;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    transition: all 0.2s;
    
    &:hover {
      border-color: #409eff;
      background: #ecf5ff;
    }
    
    .hint-text {
      color: #909399;
      font-size: 13px;
    }
  }
  
  .case-selected {
    padding: 12px 16px;
    background: #ecf5ff;
    border: 1px solid #b3d8ff;
    border-radius: 6px;
    
    .case-number-display {
      width: 100%;
      
      .case-count-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        flex-wrap: wrap;
        
        i {
          color: #409eff;
          font-size: 14px;
        }
        
        .count-text {
          font-weight: 600;
          color: #409eff;
          font-size: 13px;
        }
        
        .el-button {
          padding: 4px 8px;
          font-size: 12px;
          
          i {
            margin-right: 4px;
          }
        }
      }
      
      .case-numbers-text {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-all;
        white-space: normal;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 4px;
        border: 1px solid #e4e7ed;
        font-family: 'Courier New', monospace;
      }
    }
  }
}
</style>
