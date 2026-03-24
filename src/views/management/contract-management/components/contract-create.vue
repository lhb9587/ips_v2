<template>
  <div>
    <div class="contract-create">
      <el-form
        :model="contractForm"
        ref="contractFormRef"
        label-width="120px"
      >
        <div class="form-card">
          <div class="card-header">
            <span>案件信息</span>
          </div>
          <div class="card-content">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item
                  label="案件文号"
                  prop="projectInfo.caseIdList"
                >
                  <div class="case-number-selector">
                    <div
                      v-if="!contractForm.projectInfo.showRefno"
                      class="no-case-selected"
                    >
                      <span class="hint-text">请点击添加案件按钮</span>
                      <el-button
                        size="small"
                        type="primary"
                        @click="handleAddCase"
                      >
                        <i class="bx bx-plus"></i> 添加案件
                      </el-button>
                    </div>
                    <div
                      v-else
                      class="case-selected"
                    >
                      <div class="case-number-display">
                        <div class="case-count-info">
                          <i class="bx bx-file"></i>
                          <span class="count-text"
                            >已选择
                            {{ selectedCaseDetails.length }} 个案件</span
                          >
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
                          {{ contractForm.projectInfo.showRefno }}
                        </div>
                        <div class="count-text">
                          客户名称：{{ formatCustomerNames }}
                        </div>
                      </div>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row
              :gutter="20"
              v-if="selectedCaseDetails.length"
            >
              <el-col :span="12">
                <el-form-item
                  label="客户负责人"
                  prop="projectInfo.customerManager"
                  :rules="[
                    {
                      required: customerManagerList.length > 0,
                      message: '请选择客户负责人',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-select
                    v-model="contractForm.projectInfo.customerManager"
                    placeholder="请选择客户负责人"
                  >
                    <el-option
                      v-for="item in customerManagerList"
                      :key="item.custUserId"
                      :label="item.custUserName"
                      :value="item.custUserId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="客户组"
                  prop="projectInfo.custWkgId"
                  :rules="[
                    {
                      required: customerWorkGroupList.length > 0,
                      message: '请选择客户组',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-select
                    v-model="contractForm.projectInfo.custWkgId"
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
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="项目编号"
                  prop="projectNumber"
                >
                  <el-input
                    v-model="contractForm.projectNumber"
                    placeholder="请输入项目编号"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="项目名称"
                  prop="projectInfo.projectName"
                >
                  <el-input
                    v-model="contractForm.projectInfo.projectName"
                    placeholder="请输入项目名称"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="呈批人"
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
                    v-model="contractForm.projectInfo.undertaker"
                    placeholder="请选择呈批人"
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
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="所属工作组"
                  prop="projectInfo.wkgId"
                  :rules="[
                    {
                      required: true,
                      message: '请选择所属工作组',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-select
                    v-model="contractForm.projectInfo.wkgId"
                    placeholder="所属工作组"
                    filterable
                    @change="changeWorkGroup"
                  >
                    <el-option
                      v-for="item in workGroups"
                      :key="item.wkgId"
                      :label="item.groupName"
                      :value="item.wkgId"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20"> </el-row>
          </div>
        </div>
        <div class="form-card">
          <div class="card-header">
            <span>合同基本信息</span>
          </div>
          <div class="card-content">
            <el-row :gutter="20">
              <el-col :span="12">
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
                    v-model="contractForm.contractName"
                    placeholder="请输入合同名称"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="合同类型"
                  prop="conTypeId"
                  :rules="[
                    {
                      required: true,
                      message: '请选择合同分类',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-cascader
                    :options="contractTypeList"
                    v-model="contractForm.conTypeId"
                    @change="typeHandleChange"
                    style="width: 100%"
                    :props="{
                      children: 'codeCategories',
                      label: 'categoryName',
                      value: 'conTypeId',
                      expandTrigger: 'hover',
                    }"
                  >
                    <template #default="{ data }">
                      <div class="cascader-item">
                        <span class="label">{{ data.categoryName }}</span>
                        <el-tooltip
                          v-if="data.description"
                          :content="data.description"
                          show-after="400"
                          placement="right"
                        >
                          <i class="bx bx-help-circle info-icon"></i>
                        </el-tooltip>
                      </div>
                    </template>
                  </el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
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
              <template #label>
                <span>合同中存在以下情形</span>
              </template>
              <el-checkbox-group
                v-model="contractForm.checkItemList"
                class="tip-checkbox-group"
                @change="handleCheckboxChange"
              >
                <el-checkbox
                  label="来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理"
                  value="1"
                  :disabled="contractForm.checkItemList.includes('0')"
                />
                <el-checkbox
                  label="有风险代理约定"
                  value="2"
                  :disabled="contractForm.checkItemList.includes('0')"
                />
                <el-checkbox
                  label="需要垫付程序性费用或保证金"
                  value="3"
                  :disabled="contractForm.checkItemList.includes('0')"
                />
                <el-checkbox
                  label="约定账期超过6个月"
                  value="4"
                  :disabled="contractForm.checkItemList.includes('0')"
                />
                <el-checkbox
                  label="服务收费标准低于通用报价20%以上"
                  value="5"
                  :disabled="contractForm.checkItemList.includes('0')"
                />
                <div style="display: flex; gap: 10px">
                  <el-checkbox
                    label="其他"
                    value="6"
                    :disabled="contractForm.checkItemList.includes('0')"
                  />
                  <div>
                    <el-input
                      v-if="contractForm.checkItemList?.includes('6')"
                      v-model="contractForm.remark"
                      placeholder="请输入"
                      clearable
                      width="200px"
                    />
                  </div>
                </div>
                <el-checkbox
                  label="均无"
                  value="0"
                  :disabled="
                    contractForm.checkItemList.length > 0 &&
                    !contractForm.checkItemList.includes('0')
                  "
                /> </el-checkbox-group
            ></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
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
                  <el-radio-group v-model="contractForm.hasOriginal" @change="changeOriginal">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="我方留存的原件份数"
                  prop="originalCopies"
                  v-if="contractForm.hasOriginal === 1"
                  :rules="[
                    {
                      required: true,
                      message: '请输入原件份数',
                      trigger: 'blur',
                    },
                  ]"
                  label-width="150px"
                >
                  <el-input-number
                    v-model="contractForm.originalCopies"
                    :min="1"
                    :max="100"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="履行期限类型"
                  prop="performanceTermType"
                  :rules="[
                    {
                      required: true,
                      message: '请选择履行期限类型',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-radio-group v-model="contractForm.performanceTermType">
                    <el-radio :label="0">定期</el-radio>
                    <el-radio :label="1">不定期</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  prop="performanceDate"
                  v-if="contractForm.performanceTermType === 0"
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
                        v-model="contractForm.performanceStartDate"
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
                        v-model="contractForm.performanceEndDate"
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
                  v-if="contractForm.performanceTermType === 1"
                >
                  <el-input
                    v-model="contractForm.irregularExplanation"
                    placeholder="请输入不定期说明"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <span>合同主体</span>
          </div>
          <div class="card-content">
            <div class="select-wrapper">
              <el-form-item
                v-for="(item, index) in contractForm.signers"
                :key="index"
                :label="item.partyType"
                :prop="`signers[${index}].custCompId`"
                class="flex-grow-1"
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
                    :remote="!((istypeA &&
                        item.partyType === '甲方') ||
                      (!istypeA && item.partyType === '乙方'))"
                    allow-create="true"
                    :remote-method="fetchCustList"
                    class="flex-grow-1"
                    @change="
                      (val) => handleCompanySelect(val, index, item.partyType)
                    "
                  >
                    <el-option
                      v-for="companyItem in (istypeA &&
                        item.partyType === '甲方') ||
                      (!istypeA && item.partyType === '乙方')
                        ? ourCompanyList
                        : customerList"
                      :key="companyItem.value"
                      :label="companyItem.label"
                      :value="companyItem.value"
                    />
                  </el-select>
                  <el-button
                    v-if="
                      index === contractForm.signers.length - 1 && index > 1
                    "
                    type="text"
                    class="delete-btn ms-2"
                    @click="removeParty(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </el-form-item>
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
            </div>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <span>合同内容简述</span>
          </div>

          <div class="card-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
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
                    v-model="contractForm.amount"
                    placeholder="请输入合同金额"
                    @mousewheel.prevent
                    :type="
                      contractForm.currency == '文字描述' ? 'input' : 'number'
                    "
                    :min="0"
                  >
                    <template #append>
                      <el-select
                        style="width: 100px"
                        v-model="contractForm.currency"
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
              </el-col>
            </el-row>
            <el-form-item
              label="合同简述"
              prop="serviceContent"
            >
              <el-input
                v-model="contractForm.serviceContent"
                type="textarea"
                placeholder="请输入合同内容简述"
                :autosize="{ minRows: 2, maxRows: 4 }"
              ></el-input>
            </el-form-item>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <span>附件信息</span>
          </div>

          <div class="card-content">
            <el-form-item
              label="合同上传"
              class="upload-item"
              prop="contractName"
              :rules="[
                {
                  required: true,
                  message: '请上传合同',
                  trigger: 'change',
                },
              ]"
            >
              <el-upload
                ref="contractUploadRef"
                name="file"
                :data="contractUploadData"
                :action="uploadUrl"
                :auto-upload="false"
                :on-success="handleContractUploadSuccess"
                :on-remove="brforeContractRemoveFile"
                :file-list="contractFileList"
                :limit="1"
                :on-exceed="handleContractExceed"
                :on-change="handleContractFileChange"
                accept=".doc,.docx"
              >
                <el-button
                  size="small"
                  type="primary"
                  @click.stop.prevent="handleContractUploadClick"
                  >点击上传合同</el-button
                >
                <template #tip>
                  <span
                    style="font-size: 11px; color: #d3d3d3; margin-left: 5px"
                    >(支持上传 DOC/DOCX 格式的可编辑文档（建议大小 ≤
                    5MB），请勿上传只读或加密文件)</span
                  >
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item
              label="附件上传"
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
              >
                <el-button
                  size="small"
                  type="primary"
                  >点击上传附件</el-button
                >
                <template #tip>
                  <span
                    style="font-size: 11px; color: #d3d3d3; margin-left: 5px"
                    >(建议文件大小不超过5MB)</span
                  >
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item
              label="呈批附加说明"
            >
              <el-input
                v-model="contractForm.approvaExplanation"
                type="textarea"
                placeholder="请输入呈批附加说明"
                :autosize="{ minRows: 2, maxRows: 4 }"
              ></el-input>
            </el-form-item>
          </div>
        </div>
      </el-form>
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
      :case-type-list="caseTypeList"
    />

    <div class="modal-footer">
      <el-button @click="$emit('hiddenModal')">取消</el-button>

      <!-- 保存按钮 -->
      <el-button
        type="primary"
        @click="submitForm(1)"
        :loading="submitting"
        title="保存当前合同信息为待提交状态"
        class="action-btn-with-tip"
      >
        保存
      </el-button>

      <!-- 保存并新建按钮 -->
      <el-button
        type="primary"
        @click="handleSaveAndContinue"
        :loading="submitting"
        plain
        title="保存当前合同审批并新建合同审批，保留案件信息"
        class="action-btn-with-tip"
      >
        保存并新建 <i class="bx bx-info-circle"></i>
      </el-button>

      <!-- 提交按钮 -->
      <el-button
        type="success"
        @click="submitForm(2)"
        :loading="submitting"
        title="提交合同进入审核流程"
        class="action-btn-with-tip"
      >
        提交
      </el-button>

      <!-- 提交并新建按钮 -->
      <el-button
        type="success"
        @click="handleSubmitAndContinue"
        :loading="submitting"
        plain
        title="提交当前合同审批并新建合同审批，保留案件信息"
        class="action-btn-with-tip"
      >
        提交并新建 <i class="bx bx-info-circle"></i>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  saveContract,
  queryContractTypeList,
  queryCompany,
  getCaseCustomerManager,
} from "@/api/contract";
import { getToken } from "@/utils/auth";

import { uploadAttachments } from "@/api/serviceApi.config.js";
import { queryGroupsByUserId } from "@/api/user";
import { queryCaseType, queryList } from "@/api/caseList.js";
import { queryZZWorkGroupUrl } from "@/api/billApi";
import { useStore } from "vuex";
import CaseSelectDialog from "./case-select-dialog.vue";
import CaseDetailsDialog from "./case-details-dialog.vue";

const store = useStore();

const contractUploadRef = ref(null);
const contractFormRef = ref(null);
const contractTypeList = ref([]);
const ourCompanyList = ref([]);
const submitting = ref(false);
const contractForm = ref({
  contractName: "",
  conTypeId: "",
  amount: "",
  paymentMethod: "",
  serviceContent: "",
  currency: "人民币",
  checkItemList: [],
  signers: [
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
  ],
  projectInfo: {
    undertaker: store.state.user.userId,
    caseIdList: [],
    custIdList: [],
    caseTypeList: [],
    appFromtoList: [],
    caseNameNameList: [],
    showRefno: "", // 处理后的案件文号
    custWkgId: 0, // 客户组
  },
});
const userList = computed(() => {
  return store.state.user.userList;
});
const workGroups = ref([]);
const fileList = ref([]);
const contractFileList = ref([]);
const uploadUrl = uploadAttachments; // 替换为实际的上传接口
const uploadFileData = ref({
  tokenID: getToken(),
  fileCategory: 2,
});
const contractUploadData = ref({
  tokenID: getToken(),
  fileCategory: 1,
});
const partyRoles = ["丙方", "丁方", "戊方", "己方"];
const canAddMoreParties = computed(() => {
  return contractForm.value.signers.length - 2 < partyRoles.length;
});
const caseTypeList = ref([]);
const customerList = ref([]);
const istypeA = computed(() => {
  return (
    contractForm.value.conTypeId && contractForm.value.conTypeId.includes(1)
  );
});

const formatCustomerNames = computed(() => {
  const caseInfoList = selectedCaseDetails.value || [];
  
  const custNames = caseInfoList
    .map(item => item.custName)
    .filter(name => name && name !== "未设置");
  
  return [...new Set(custNames)].join("、") || "";
});

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
const handleCurrencyChange = (value) => {
  if (value !== "文字描述" && contractForm.value.amount) {
    const res = contractForm.value.amount.match(/\d+/);
    console.log(res[0]);
    if (res) {
      contractForm.value.amount = res[0];
    }
  }
};
const handleCheckboxChange = (values) => {
  // 如果包含"均无"选项
  if (values.includes("0")) {
    // 清除其他所有选项，只保留"均无"
    contractForm.value.checkItemList = ["0"];
    // 清除备注
    if (contractForm.value.remark) {
      contractForm.value.remark = "";
    }
  }
};

const changeWorkGroup = (value) => {
  console.log(value, "value");
};

const changeOriginal = (value) =>{
  if (value) {
    contractForm.value.originalCopies = 1
  } else {
    contractForm.value.originalCopies = undefined
  }
}
const customerManagerList = ref([]);
const customerWorkGroupList = ref([]);
const fetchCaseCustomerManager = (caseIds) => {
  if (caseIds && caseIds.length) {
    getCaseCustomerManager({ caseIds }).then((res) => {
      if (res.data?.length) {
        // 按custUserId去重客户负责人，并过滤掉空值
        const uniqueManagers = res.data.filter(
          (manager, index, self) =>
            manager.custUserId &&
            manager.custUserName && // 过滤掉空值
            index === self.findIndex((m) => m.custUserId === manager.custUserId)
        );

        // 按custWkgId去重客户工作组，并过滤掉空值
        const uniqueWorkGroups = res.data.filter(
          (item, index, self) =>
            item.custWkgId &&
            item.custWkgName && // 过滤掉空值
            index === self.findIndex((w) => w.custWkgId === item.custWkgId)
        );

        contractForm.value.projectInfo.customerManager =
          uniqueManagers.length > 0 ? uniqueManagers[0].custUserId : undefined;
        customerManagerList.value = uniqueManagers;

        // 设置客户工作组选项和默认值
        customerWorkGroupList.value = uniqueWorkGroups;
        if (uniqueWorkGroups.length > 0) {
          contractForm.value.projectInfo.custWkgId = parseInt(
            uniqueWorkGroups[0].custWkgId
          );
        } else {
          contractForm.value.projectInfo.custWkgId = 0;
        }
      }
    });
  } else {
    contractForm.value.projectInfo.customerManager = undefined;
    contractForm.value.projectInfo.custWkgId = 0;
    customerManagerList.value = [];
    customerWorkGroupList.value = [];
  }
};
// 监听案件列表变化（已经在handleCaseSelectConfirm中处理，这里保留用于其他情况）
watch(
  () => contractForm.value.projectInfo.caseIdList,
  (newValue) => {
    if (!newValue || newValue.length === 0) {
      contractForm.value.projectInfo.custIdList = [];
      contractForm.value.projectInfo.caseTypeList = [];
      contractForm.value.projectInfo.appFromtoList = [];
      contractForm.value.projectInfo.caseNameNameList = [];
      contractForm.value.projectInfo.showRefno = "";
      selectedCaseDetails.value = [];
    }
  }
);
const fetchWorkGroups = () => {
  queryZZWorkGroupUrl().then((res) => {
    workGroups.value = res.data;
  });
};
const fetchCaseType = () => {
  queryCaseType().then((res) => {
    caseTypeList.value = res.data;
  });
};
// 弹框控制变量
const showCaseSelectDialog = ref(false);
const showCaseDetailsDialog = ref(false);
const selectedCaseDetails = ref([]);
const currentShowRefno = ref(""); // 当前要传入弹框的案件文号

// 处理修改按钮点击
const handleModifyCase = () => {
  // 将当前的showRefno传入弹框
  currentShowRefno.value = contractForm.value.projectInfo.showRefno || "";
  showCaseSelectDialog.value = true;
};

// 处理添加案件按钮点击
const handleAddCase = () => {
  // 清空当前案件文号，表示新增
  currentShowRefno.value = "";
  showCaseSelectDialog.value = true;
};

// 处理案件选择确认
const handleCaseSelectConfirm = ({ selectedCases, showRefno }) => {
  // 更新选中的案件详情
  selectedCaseDetails.value = selectedCases;

  // 更新合同表单中的案件信息
  contractForm.value.projectInfo.caseIdList = selectedCases.map(
    (item) => item.caseId
  );
  contractForm.value.projectInfo.custIdList = selectedCases.map(
    (item) => item.custId || null
  );
  contractForm.value.projectInfo.caseTypeList = selectedCases.map(
    (item) => item.caseTypeId || null
  );
  contractForm.value.projectInfo.appFromtoList = selectedCases.map(
    (item) => item.appFromto || null
  );
  contractForm.value.projectInfo.caseNameNameList = selectedCases.map(
    (item) => item.caseName || null
  );
  contractForm.value.projectInfo.showRefno = showRefno;

  // 获取客户负责人信息
  if (contractForm.value.projectInfo.caseIdList.length > 0) {
    fetchCaseCustomerManager(contractForm.value.projectInfo.caseIdList);
  }
};
const typeHandleChange = () => {
  contractForm.value.remark = undefined;
  contractForm.value.signers = [
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
const addParty = () => {
  if (canAddMoreParties.value) {
    contractForm.value.signers.push({
      custCompId: "",
      partyType: partyRoles[contractForm.value.signers.length - 2],
      signerName: "",
    });
  }
};
const removeParty = (index) => {
  contractForm.value.signers.splice(index, 1);
};
const is2DArray = (arr) => {
  if (arr.length === 0) {
    return false; // 空数组可以视为一维数组
  }
  const firstElement = arr[0];
  return Array.isArray(firstElement);
};
const isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};
const emits = defineEmits(["hiddenModal", "refresh"]);

// 添加防抖函数
const debounce = (fn, delay = 500) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 实际的表单提交逻辑
const doSubmitForm = (isSave, continueCreate = false) => {
  if (submitting.value) return; // 如果正在提交，则不执行

  submitting.value = true; // 设置提交状态

  // if (contractFileList.value.length < 1) {
  //   ElMessage.warning("请上传合同");
  //   submitting.value = false;
  //   return;
  // }

  // 无论是保存还是提交，都需要验证提交人和呈批人是否为同一人
  if (contractForm.value.projectInfo.undertaker != store.state.user.userId) {
    ElMessage.warning("提交人和呈批人须为同一人");
    submitting.value = false;
    return;
  }

  let data = JSON.parse(JSON.stringify(contractForm.value));
  data.isSave = isSave;
  if (is2DArray(data.projectInfo?.caseTypeList)) {
    data.projectInfo.caseTypeList = data.projectInfo.caseTypeList.map(
      (subArray) => subArray[subArray.length - 1]
    );
  }

  // 处理"均无"选项，如果只有均无，则清空checkItemList
  if (
    data.checkItemList &&
    data.checkItemList.length === 1 &&
    data.checkItemList[0] === "0"
  ) {
    data.checkItemList = [];
  }

  const conTypeId = data.conTypeId;
  data.conTypeId =
    conTypeId && conTypeId.length ? conTypeId[conTypeId.length - 1] : null;
  let attIds = [];
  let contractFileIds = [];
  if (fileList.value.length > 0) {
    attIds = fileList.value.map((item) => item.attachmentId);
  }
  if (contractFileList.value.length > 0) {
    contractFileIds = contractFileList.value.map((item) => item.attachmentId);
  }
  if (data.currency == "文字描述") {
    data.amountDescription = data.amount;
    delete data.amount;
  }
  data.attachmentIds = [...attIds, ...contractFileIds];

  //处理自定义客户
  if (data.signers && data.signers.length) {
    data.signers.forEach((item) => {
      if (!isNumber(item.custCompId)) {
        item.custCompId = null;
      }
    });
  }
  saveContract(data)
    .then((res) => {
      if (res.success) {
        if (continueCreate) {
          // 根据操作类型显示不同的成功提示
          if (isSave === 1) {
            ElMessage.success(
              "保存成功！案件信息已保留，您可以继续填写合同信息"
            );
          } else {
            ElMessage.success(
              "提交成功！案件信息已保留，您可以继续填写合同信息"
            );
          }

          // 保存公共信息
          const commonInfo = {
            projectInfo: {
              undertaker: contractForm.value.projectInfo.undertaker,
              wkgId: contractForm.value.projectInfo.wkgId,
              caseIdList: contractForm.value.projectInfo.caseIdList,
              custIdList: contractForm.value.projectInfo.custIdList,
              caseTypeList: contractForm.value.projectInfo.caseTypeList,
              appFromtoList: contractForm.value.projectInfo.appFromtoList,
              caseNameNameList: contractForm.value.projectInfo.caseNameNameList,
              customerManager: contractForm.value.projectInfo.customerManager,
              custWkgId: contractForm.value.projectInfo.custWkgId,
              showRefno: contractForm.value.projectInfo.showRefno,
            },
          };

          // 先清除验证状态
          if (contractFormRef.value) {
            contractFormRef.value.clearValidate();
          }

          // 重置表单
          resetForm(false); // 传递false表示不要再次清除验证

          // 恢复公共信息
          contractForm.value.projectInfo = {
            ...contractForm.value.projectInfo,
            ...commonInfo.projectInfo,
          };

          // 重置上传文件列表
          fileList.value = [];
          contractFileList.value = [];

          // 使用setTimeout确保所有DOM更新完成后再清除验证
          setTimeout(() => {
            // 彻底清除所有验证
            if (contractFormRef.value) {
              contractFormRef.value.clearValidate();

              // 如果Element Plus的clearValidate不够彻底，直接移除DOM上的错误类
              const formEl = contractFormRef.value.$el;
              if (formEl) {
                // 移除所有验证失败的类
                const errorItems = formEl.querySelectorAll(".is-error");
                errorItems.forEach((item) => {
                  item.classList.remove("is-error");
                });

                // 移除所有验证消息
                const errorMessages = formEl.querySelectorAll(
                  ".el-form-item__error"
                );
                errorMessages.forEach((message) => {
                  message.style.display = "none";
                });
              }
            }
          }, 100);

          // 通知父组件刷新列表数据
          emits("refresh");
        } else {
          // 不继续创建，关闭模态框
          res.message && ElMessage.success(res.message);
          emits("hiddenModal");
          resetForm();
          emits("refresh");
        }
      }
    })
    .catch((error) => {
      console.error("保存合同出错:", error);
      ElMessage.error("保存失败，请稍后再试");
    })
    .finally(() => {
      submitting.value = false; // 无论成功失败，都重置提交状态
    });
};

// 使用防抖包装提交函数
const debouncedSubmit = debounce(doSubmitForm, 500);

const submitForm = (isSave, continueCreate = false) => {
  // 避免重复提交
  if (submitting.value) return;

  // 检查提交人和呈批人是否为同一人
  if (contractForm.value.projectInfo.undertaker != store.state.user.userId) {
    ElMessage.warning("提交人和呈批人须为同一人");
    return;
  }

  // 根据 isSave 判断是否需要校验
  if (isSave === 2) {
    // 提交时需要校验
    contractFormRef.value.validate((valid) => {
      if (valid) {
        debouncedSubmit(isSave, continueCreate);
      } else {
        ElMessage.warning("请填写必填项");
        return false;
      }
    });
  } else {
    // 保存时提交
    if (!contractForm.value?.projectInfo?.undertaker) {
      ElMessage.warning("请选择呈批人");
      return false;
    } else {
      debouncedSubmit(isSave, continueCreate);
    }
  }
};

const resetForm = (clearValidate = true) => {
  // 先清除验证状态
  if (clearValidate && contractFormRef.value) {
    contractFormRef.value.clearValidate();
  }

  contractForm.value = {
    contractName: "",
    conTypeId: "",
    amount: "",
    paymentMethod: "",
    serviceContent: "",
    approvaExplanation: "",
    currency: "人民币",
    checkItemList: [],
    signers: [
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
    ],
    projectInfo: {
      undertaker: store.state.user.userId, // 使用之前的呈批人或默认为当前用户
      caseIdList: [],
      custIdList: [],
      caseTypeList: [],
      appFromtoList: [],
      caseNameNameList: [],
      showRefno: "",
      custWkgId: 0,
    },
  };
  fileList.value = [];
  contractFileList.value = [];
};
const fetchContractTypeList = () => {
  queryContractTypeList({}).then((res) => {
    contractTypeList.value = res.data;
  });
};

const handleUploadSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    fileList.value.push(newFile);
  }
};

const brforeRemoveFile = (file) => {
  // 从 fileList 中移除文件
  fileList.value = fileList.value.filter(
    (item) =>
      item.attachmentId !==
      (file.attachmentId || file.response.data.attachmentId)
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
    ElMessage.success("上传成功");
  }
};

const brforeContractRemoveFile = (file) => {
  // 从 contractFileList 中移除文件
  contractFileList.value = contractFileList.value.filter(
    (item) => item.attachmentId !== file.attachmentId
  );
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

const fetchGroupsByUserId = (user_id) => {
  queryGroupsByUserId({ userId: user_id }).then((res) => {
    if (res.data.length) {
      contractForm.value.projectInfo.wkgId = res.data[0].wkgId;
    }
  });
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

const handleCompanySelect = (value, index) => {
  // 根据选择的value找到对应的label作为签字人姓名
  let selectedOption;
  const item = contractForm.value.signers[index];
  const isOurCompany =
    (istypeA.value && item.partyType === "甲方") ||
    (!istypeA.value && item.partyType === "乙方")
      ? 1
      : 0;
  if (
    (istypeA.value && item.partyType === "甲方") ||
    (!istypeA.value && item.partyType === "乙方")
  ) {
    selectedOption = ourCompanyList.value.find(
      (option) => option.value === value
    );
  } else {
    selectedOption = customerList.value.find(
      (option) => option.value === value
    );
  }

  if (selectedOption) {
    contractForm.value.signers[index].signerName = selectedOption.label;
  } else if (value) {
    // 如果是手动输入的值，将其作为签字人姓名
    contractForm.value.signers[index].signerName = value;
  } else {
    contractForm.value.signers[index].signerName = "";
  }
  contractForm.value.signers[index].isOur = isOurCompany;
};

// 单独处理保存并新建点击事件
const handleSaveAndContinue = (event) => {
  event.stopPropagation(); // 阻止事件冒泡

  // 检查提交人和呈批人是否为同一人
  if (contractForm.value.projectInfo.undertaker != store.state.user.userId) {
    ElMessage.warning("提交人和呈批人须为同一人");
    return;
  }

  // 保存并继续新建不需要表单验证
  if (!contractForm.value?.projectInfo?.undertaker) {
    ElMessage.warning("请选择呈批人");
    return false;
  } else {
    debouncedSubmit(1, true);
  }
};

// 单独处理提交并新建点击事件
const handleSubmitAndContinue = (event) => {
  event.stopPropagation(); // 阻止事件冒泡

  // 检查提交人和呈批人是否为同一人
  if (contractForm.value.projectInfo.undertaker != store.state.user.userId) {
    ElMessage.warning("提交人和呈批人须为同一人");
    return;
  }

  // 提交仍然需要表单验证
  contractFormRef.value.validate((valid) => {
    if (valid) {
      debouncedSubmit(2, true);
    } else {
      ElMessage.warning("请填写必填项");
      // 只标记必填项，但不滚动到错误位置
      return false;
    }
  });
};

// 监听呈批人变化，联动更新工作组
watch(
  () => contractForm.value.projectInfo.undertaker,
  (newValue, oldValue) => {
    // 只有当新值与旧值不同，且不是在表单重置或恢复公共信息过程中触发的，才更新工作组
    if (newValue && newValue !== oldValue) {
      fetchGroupsByUserId(newValue);
    }
  }
);

onMounted(() => {
  fetchContractTypeList();
  fetchCaseType();
  fetchWorkGroups();
  fetchOurCompanyList();
  fetchGroupsByUserId(store.state.user.userId);
});
</script>

<style scoped lang="scss">
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  .el-button {
    margin-left: 12px;
  }

  .el-dropdown {
    margin-left: 12px;

    :deep(.el-button) {
      margin-left: 0;
    }
  }
}
.upload-item {
  margin-bottom: 8px;
}
.contract-create {
  height: calc(80vh - 66px);
  overflow-y: auto;
  background: #f5f7fa;
  padding: 24px;
  .form-card {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 24px;
    &:last-child {
      margin-bottom: 0;
    }
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    .card-header {
      padding: 16px 24px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      align-items: center;

      span {
        font-size: 16px;
        font-weight: 500;
        color: #1f2f3d;
      }
    }
    .card-content {
      padding: 24px;
      :deep(.el-form-item) {
        margin-bottom: 22px;
        // &:last-child {
        //   margin-bottom: 0;
        // }
      }
    }
  }
}
:deep(.amount-type-dropdown) {
  min-width: 100px !important;

  .el-select-dropdown__item {
    padding: 0 8px;
    text-align: center;
  }
}
.amount-type-select {
  width: 100px;
  margin: 0;
}
.select-wrapper {
  width: 100%;
}

.flex-grow-1 {
  flex-grow: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.delete-btn {
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.add-party {
  padding-left: 120px;
}
.delete-btn {
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
.tip-checkbox-group {
  display: flex;
  flex-direction: column;
}
.no-margin-bottom {
  margin-bottom: 8px !important;
}

.required-label {
  position: relative;

  &::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
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
        font-family: "Courier New", monospace;
      }
    }
  }
}

/* 带提示的按钮样式 */
.action-btn-with-tip {
  position: relative;

  i.bx-info-circle {
    margin-left: 6px;
    font-size: 14px;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &:hover i.bx-info-circle {
    opacity: 1;
    transform: scale(1.1);
  }
}
.text-danger {
  color: #f56c6c;
  margin-right: 4px;
}
</style>
