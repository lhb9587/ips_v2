<template>
  <div>
    <div class="row h-100">
      <div class="d-flex">
        <div
          class="contract-preview"
          v-show="isExpanded"
        >
          <div
            class="contract-preview-content"
            v-if="pdfUrl && !pdfLoading"
          >
            <div class="floating-edit-button">
              <el-button
                type="primary"
                circle
                size="large"
                class="mb-2"
                @click="handleRefresh"
                title="刷新"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-button
                v-if="
                  contractDetial.canOnlyEdit &&
                  !isLatestTaskWithdraw &&
                  isDocFile
                "
                type="primary"
                circle
                size="large"
                @click="handleOnlyOfficeEdit"
                title="在线编辑保存后，请点击刷新按钮"
                style="margin-left: 0"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
            <iframe
              ref="pdfIframe"
              :src="pdfUrlWithTimestamp"
              width="100%"
              height="100%"
              frameborder="0"
            ></iframe>
          </div>
          <LoadingOverlay
            :loading="true"
            v-if="pdfLoading"
          />
        </div>

        <!-- 展开功能 -->
        <div style="width: 18px">
          <span
            class="detial-expanded"
            @click="isExpandedFunc"
          >
            <div class="expanded-div">
              <i
                :class="
                  isExpanded ? 'bx bx-chevron-left' : 'bx bx-chevron-right'
                "
              ></i>
            </div>
          </span>
        </div>

        <div
          class="contract-info"
          :style="{ maxHeight: contractInfoMaxHeight }"
        >
          <div
            class="card"
            v-if="!editing && relatedContracts.length > 1"
          >
            <div class="card-body">
              <div>
                <div class="d-flex justify-content-between">
                  <h4 class="card-title">
                    同案件合同 ({{ relatedContracts.length }})
                  </h4>
                </div>
                <div class="related-contracts-container">
                  <div class="related-contracts-list">
                    <div
                      v-for="contract in relatedContracts"
                      :key="contract.contractId"
                      class="related-contract-item"
                      :class="{
                        'current-contract':
                          Number(contract.contractId) === Number(contractId),
                      }"
                      @click="switchToContract(contract.contractId)"
                    >
                      <div class="contract-card-content">
                        <div class="contract-details">
                          <div class="contract-name">
                            {{ contract.contractName }}
                          </div>
                          <div class="contract-meta-info">
                            <div class="contract-type">
                              {{ contract.contractType }}
                            </div>
                            <div class="contract-undertaker">
                              {{ contract.undertakerName }}
                            </div>
                          </div>
                          <div
                            class="contract-status"
                            v-if="contract.currentState"
                            :class="
                              contract.currentState === '已完成'
                                ? 'approved'
                                : 'pending'
                            "
                          >
                            <i
                              :class="
                                contract.currentState === '已完成'
                                  ? 'bx bx-check-circle'
                                  : 'bx bx-time-five'
                              "
                            ></i>
                            {{ contract.currentState }}
                          </div>
                          <div
                            v-else-if="contract.handlerName"
                            class="mt-3"
                          >
                            <div class="contract-meta-info">
                              <div class="contract-undertaker">
                                处理人：{{ contract.handlerName }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div>
                <div class="d-flex justify-content-between mb-2">
                  <h4 class="card-title">合同信息</h4>
                  <div v-if="contractDetial.canEdit">
                    <el-button
                      v-if="contractDetial.canDelete"
                      size="small"
                      link
                      style="color: #909399"
                      @click="deleteContractFunc"
                      ><Delete
                        style="width: 14px; height: 14px"
                      />删除</el-button
                    >
                    <el-button
                      link
                      v-if="!editing"
                      size="small"
                      style="color: #556ee6"
                      @click="editing = true"
                      ><Edit style="width: 14px; height: 14px" />编辑</el-button
                    >
                    <el-button
                      link
                      size="small"
                      style="color: #909399"
                      @click="editing = false"
                      v-if="editing"
                      >取消</el-button
                    >
                  </div>
                </div>
                <ContractInfo
                  :contractInfo="contractDetial"
                  v-if="!editing"
                />
                <ContractEdit
                  :contractInfo="contractDetial"
                  v-else
                  ref="contractEditRef"
                />
              </div>
            </div>
          </div>
          <ContractFee :contractId="props.contractId" :contractDetial="contractDetial" />
          <ContractProcess :progressData="progressData" />
          <!-- <AttachmentsInfo :contractDetial="contractDetial" /> -->
        </div>
      </div>
    </div>
    <!-- 浮动按钮区域 -->
    <div class="floating-buttons">
      <div class="flex-grow-1"></div>
      <!-- 新增合同预览和编辑按钮 -->
      <b-button
        size="sm"
        variant="light"
        @click="handleHidden"
        >取消</b-button
      >
      <b-button
        size="sm"
        variant="info"
        @click="handlePreviewContract"
        v-if="pdfUrl && !pdfLoading"
        class="contract-action-btn"
      >
        <i class="bx bx-show-alt me-1"></i>最新合同预览
      </b-button>
      <b-button
        size="sm"
        variant="outline-primary"
        @click="handleOnlyOfficeEdit"
        v-if="
          contractDetial.canOnlyEdit &&
          !isLatestTaskWithdraw &&
          isDocFile
        "
        class="contract-action-btn"
      >
        <i class="bx bx-edit me-1"></i>在线编辑合同
      </b-button>
      <b-button
          size="sm"
          variant="dark"
          v-if="contractDetial.previewXdAttachmentCon?.filePath"
          @click="
          downLoad(
            contractDetial.previewXdAttachmentCon?.filePath,
            contractDetial.previewXdAttachmentCon?.fileName
          )
        "
          :disabled="submitting"
      >修订版合同DOC文件下载</b-button
      >
      <b-button
        size="sm"
        variant="dark"
        v-if="contractDetial.revisionAttachments?.filePath"
        @click="
          downLoad(
            contractDetial.revisionAttachments?.filePath,
            contractDetial.revisionAttachments?.fileName
          )
        "
        :disabled="submitting"
        >合同DOC文件下载</b-button
      >
      <b-button
        size="sm"
        variant="dark"
        v-if="contractDetial.revisionPdfAttachments?.filePath"
        @click="
          downLoad(
            contractDetial.revisionPdfAttachments?.filePath,
            contractDetial.revisionPdfAttachments?.fileName
          )
        "
        :disabled="submitting"
        >合同PDF文件下载</b-button
      >
      <b-button
        size="sm"
        variant="secondary"
        v-if="withdrawAuditApplyPermission"
        @click="showWithdrawAuditApplyDialog"
        :disabled="submitting"
        >撤回申请</b-button
      >
      <b-button
        size="sm"
        variant="danger"
        v-if="withdrawPermission"
        @click="showWithdrawDialog"
        :disabled="submitting"
        >注销合同号</b-button
      >
      <b-button
        size="sm"
        variant="danger"
        v-if="rejectPermission"
        @click="showRejectDialog"
        :disabled="submitting"
        >审核退回</b-button
      >
      <!-- <b-button
          size="sm"
          variant="warning"
          v-if="addReviewPermission"
          @click="showAddReviewDialog"
          :disabled="submitting"
          >加审</b-button
        > -->
      <b-button
        size="sm"
        variant="warning"
        v-if="doubleAddReviewPermission"
        @click="showDoubleAddReviewDialog"
        :disabled="submitting"
        >双重加审</b-button
      >
      <b-button
        size="sm"
        variant="success"
        v-if="passPermission"
        @click="showApproveDialog"
        :disabled="submitting"
        >审核通过</b-button
      >
      <b-button
        size="sm"
        variant="success"
        v-if="conUploadPermission"
        @click="showRecordDialog"
        :disabled="submitting"
        >签署版合同上传</b-button
      >
      <b-button
        size="sm"
        variant="success"
        v-if="noStampPermission"
        @click="showNoStampApplyDialog"
        :disabled="submitting"
        >无需用印</b-button
      >
      <b-button
        size="sm"
        variant="primary"
        v-if="stampApplyPermission"
        @click="showStampApplyDialog"
        :disabled="submitting"
        >用印申请</b-button
      >
      <b-button
        size="sm"
        variant="success"
        v-if="stampPermission"
        @click="debounceAction(() => handleCompleted(6))"
        :disabled="submitting"
        >用印完成</b-button
      >
      <b-button
        size="sm"
        variant="primary"
        @click="debounceAction(() => saveInfo(1))"
        v-if="editing"
        :disabled="submitting"
        >保存</b-button
      >
      <b-button
        size="sm"
        variant="success"
        v-if="submitPermission"
        @click="debounceAction(() => saveInfo(2))"
        :disabled="submitting"
        >提交</b-button
      >
      <!-- <b-button
          size="sm"
          variant="success"
          @click="doubleHeaderTableVisible = true"
          >测试</b-button
        > -->
    </div>
    <!-- 审核通过弹框 -->
    <el-dialog
      v-model="approveDialogVisible"
      width="500px"
    >
      <template #header>
        <div
          class="my-header"
          style="display: flex; align-items: center"
        >
          <span style="font-size: 20px">审核通过</span>
          <el-popover
            placement="bottom-start"
            title="B类合同有以下情形请仔细检查："
            :width="350"
            trigger="hover"
            popper-style="{'width':'auto'}"
            v-if="isShowTipinfo"
          >
            <template #reference>
              <i
                class="bx bx-error-circle"
                style="
                  font-size: 16px;
                  cursor: pointer;
                  margin-left: 4px;
                  color: #dca550;
                "
              ></i>
            </template>
            <div>
              <div>
                1.来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理的；
              </div>
              <div>2.有风险代理约定的；</div>
              <div>3.需要垫付程序性费用或保证金的；</div>
              <div>4.约定账期超过6个月的；</div>
              <div>5.服务收费标准低于通用报价20%以上的。</div>
            </div>
          </el-popover>
        </div>
      </template>
      <div class="approve-form">
        <el-form
          ref="approveFormRef"
          :model="approveFormInfo"
          label-width="80px"
        >
          <el-form-item
            label="审核意见"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="approveFormInfo.remark"
              :rows="3"
              placeholder="请输入审核意见（选填）"
            />
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleApproveFileSuccess"
              :on-remove="approveFileRemoveFile"
              :file-list="approveFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="debounceAction(handleApprove)"
            :loading="submitting"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 用印申请弹框 -->
    <el-dialog
      v-model="stampApplyDialogVisible"
      width="500px"
    >
      <template #header>
        <div
          class="my-header"
          style="display: flex; align-items: center"
        >
          <span style="font-size: 20px">用印申请</span>
        </div>
      </template>
      <div class="approve-form">
        <el-form
          ref="stampApplyFormRef"
          :model="approveFormInfo"
          label-width="80px"
        >
          <el-form-item
            label="用印说明"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="approveFormInfo.remark"
              :rows="3"
              placeholder="请输入用印说明（选填）"
            />
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleApproveFileSuccess"
              :on-remove="approveFileRemoveFile"
              :file-list="approveFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item
            label="用印人:"
          >
            <!-- <el-select
              v-model="approveFormInfo.handler"
              placeholder="请选择用印人"
            >
              <el-option
                v-for="item in taskHandlers"
                :key="item.value"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select> -->
            {{ approveFormInfo.handler }}
            <el-alert
              style="margin-top: 6px"
              v-show="showEmptyHandlerTip"
              title="该合同主体用印人为空，请联系许莺！"
              type="warning"
              :closable="false"
              show-icon
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="stampApplyDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="debounceAction(handleStampApply)"
            :loading="submitting"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 无需用印弹框 -->
    <el-dialog
      v-model="noStampApplyDialogVisible"
      width="650px"
      @close="closeNoStampApplyDialog"
      align-center
    >
      <template #header>
        <div
          class="my-header"
          style="display: flex; align-items: center"
        >
          <span style="font-size: 20px">无需用印</span>
        </div>
      </template>
      <div class="approve-form">
        <el-form
          ref="noStampApplyFormRef"
          :model="noStampApplyFormInfo"
          label-width="130px"
        >
          <el-form-item
            label="无需用印说明"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="noStampApplyFormInfo.remark"
              :rows="3"
              placeholder="请输入无需用印说明（选填）"
            />
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleNoStampFileSuccess"
              :on-remove="noStampFileRemoveFile"
              :file-list="noStampApplyFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item
            label="是否需要上传签署版合同"
            prop="isSignedContract"
            label-width="180px"
          >
            <el-radio-group v-model="noStampApplyFormInfo.isSignedContract">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="noStampApplyFormInfo.isSignedContract === 1">
            <div class="info-tip">
              <i class="bx bx-info-circle"></i>
              以下信息为非必填项，如需在本步骤中同时完成签署版合同上传，可填写签订日期并上传电子版。
            </div>
            <el-form-item
              label="签订日期"
              prop="signDate"
            >
              <el-date-picker
                v-model="noStampApplyFormInfo.signDate"
                type="date"
                placeholder="请选择签订日期（选填）"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item
              label="上传合同电子版"
              prop="fileList"
            >
              <el-upload
                name="file"
                class="upload-demo"
                :data="signAttUploadFileData"
                :action="uploadUrl"
                :on-success="handleNoStampContractFileSuccess"
                :on-remove="noStampContractFileRemoveFile"
                :file-list="noStampApplyFormInfo.signAttachmentIdList"
                multiple
                accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
              >
                <el-button type="primary">选择文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">可选择上传签署版合同电子文件</div>
                </template>
              </el-upload>
            </el-form-item>
            <div class="row">
              <div class="col-md-6">
                <el-form-item
                  label="是否有原件"
                  prop="hasOriginal"
                >
                  <el-radio-group
                    v-model="noStampApplyFormInfo.hasOriginal"
                    @change="noStampChangeOriginal"
                  >
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <div
                class="col-md-6"
                v-if="noStampApplyFormInfo.hasOriginal"
              >
                <el-form-item
                  label="我方留存的原件份数"
                  prop="originalCopies"
                  v-if="noStampApplyFormInfo.hasOriginal === 1"
                  label-width="150px"
                >
                  <el-input-number
                    v-model="noStampApplyFormInfo.originalCopies"
                    :min="1"
                    :max="100"
                  />
                </el-form-item>
              </div>
            </div>
            <template v-if="noStampApplyFormInfo.hasOriginal">
              <el-form-item
                label="原件是否交档案保存"
                prop="isArchived"
                :rules="[
                  {
                    required: true,
                    message: '请选择原件是否交档案保存',
                    trigger: 'change',
                  },
                ]"
                label-width="150px"
              >
                <el-radio-group
                  v-model="noStampApplyFormInfo.isArchived"
                  @change="IsArchivednoStampApplyChange"
                >
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="原件保管人"
                prop="archiveKeeper"
                :rules="[
                  {
                    required: true,
                    message: '请选择原件保管人',
                    trigger: 'change',
                  },
                ]"
              >
                <el-select-v2
                  v-model="noStampApplyFormInfo.archiveKeeper"
                  placeholder="请选择"
                  style="width: 220px"
                  :options="filteredUserList"
                  filterable
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="交存日期"
                prop="archiveDate"
              >
                <el-date-picker
                  v-model="noStampApplyFormInfo.archiveDate"
                  type="date"
                  placeholder="请选择交存日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </template>
          </template>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeNoStampApplyDialog">取消</el-button>
          <el-button
            type="primary"
            @click="debounceAction(handleNoStampApply)"
            :loading="submitting"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="doubleHeaderTableVisible"
      width="800px"
    >
      <DoubleHeaderTable />
    </el-dialog>

    <!-- 审核退回弹框 -->
    <el-dialog
      title="审核退回"
      v-model="rejectDialogVisible"
      width="500px"
    >
      <div class="reject-form">
        <el-form
          ref="rejectFormRef"
          :model="rejectFormInfo"
          :rules="rejectRules"
          label-width="80px"
        >
          <el-form-item
            label="退回原因"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="rejectFormInfo.remark"
              :rows="3"
              placeholder="请输入退回原因"
            />
          </el-form-item>
          <el-form-item
            label="退回至"
            prop="isSendBack"
          >
            <el-select
              v-model="rejectFormInfo.isSendBack"
              style="width: 200px"
            >
              <el-option
                v-for="item in returnOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleRejectFileSuccess"
              :on-remove="rejectFileRemoveFile"
              :file-list="rejectFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="debounceAction(handleReject)"
            :loading="submitting"
            >确认退回</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 加审弹框 -->
    <el-dialog
      v-model="addReviewDialogVisible"
      width="500px"
    >
      <template #header>
        <div
          class="my-header"
          style="display: flex; align-items: center"
        >
          <span style="font-size: 20px">审核通过</span>
          <el-popover
            placement="bottom-start"
            title="B类合同有以下情形请仔细检查："
            :width="350"
            trigger="hover"
            popper-style="{'width':'auto'}"
            v-if="isShowTipinfo"
          >
            <template #reference>
              <i
                class="bx bx-error-circle"
                style="
                  font-size: 16px;
                  cursor: pointer;
                  margin-left: 4px;
                  color: #dca550;
                "
              ></i>
            </template>
            <div>
              <div>
                1.来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理的；
              </div>
              <div>2.有风险代理约定的；</div>
              <div>3.需要垫付程序性费用或保证金的；</div>
              <div>4.约定账期超过6个月的；</div>
              <div>5.服务收费标准低于通用报价20%以上的。</div>
            </div>
          </el-popover>
        </div>
      </template>
      <div class="add-review-form">
        <el-form
          ref="addReviewFormRef"
          :model="addReviewFormInfo"
          :rules="addReviewRules"
          label-width="100px"
        >
          <el-form-item
            label="审核意见"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="addReviewFormInfo.remark"
              :rows="3"
              placeholder="请输入审核意见"
            />
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleAddReviewFileSuccess"
              :on-remove="addReviewFileRemoveFile"
              :file-list="addReviewFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item
            label="是否需要上级加审"
            prop="isInvestigate"
            :rules="[
              {
                required: true,
                message: '请选择是否需要上级加审',
                trigger: 'change',
              },
            ]"
            label-width="140px"
          >
            <el-radio-group v-model="addReviewFormInfo.isInvestigate">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="上级负责人"
            prop="princpalList"
            v-if="addReviewFormInfo.isInvestigate"
          >
            <el-select
              v-model="addReviewFormInfo.princpalList"
              placeholder="请选择上级负责人"
            >
              <el-option
                v-for="item in taskHandlers"
                :key="item.value"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addReviewDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="debounceAction(handleAddReview)"
            :loading="submitting"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- 双重加审弹框 -->
    <el-dialog
      title="双重加审"
      v-model="doubleAddReviewDialogVisible"
      width="500px"
    >
      <div class="add-review-form">
        <el-form
          ref="doubleAddReviewFormRef"
          :model="doubleAddReviewFormInfo"
          :rules="doubleAddReviewRules"
          label-width="100px"
        >
          <el-form-item
            label="加审说明"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="doubleAddReviewFormInfo.remark"
              :rows="3"
              placeholder="请输入加审说明"
            />
          </el-form-item>
          <el-form-item
            label="合规管委会"
            prop="handler"
          >
            <el-select
              v-model="doubleAddReviewFormInfo.handler"
              placeholder="请选择合规管委会审核人"
            >
              <el-option
                v-for="item in taskHandlers"
                :key="item.value"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleDualRevFileSuccess"
              :on-remove="dualRevRemoveFile"
              :file-list="doubleAddReviewFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item
            label="上级负责人"
            prop="princpalList"
          >
            <el-select
              v-model="doubleAddReviewFormInfo.princpalList"
              placeholder="请选择上级负责人"
            >
              <el-option
                v-for="item in seniorTaskHandlers"
                :key="item.value"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item> -->
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="doubleAddReviewDialogVisible = false"
            >取消</el-button
          >
          <el-button
            type="primary"
            @click="debounceAction(handleDoubleAddReview)"
            :loading="submitting"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 注销合同弹框 -->
    <el-dialog
      title="注销合同号"
      v-model="withdrawDialogVisible"
      width="500px"
    >
      <div class="withdraw-form">
        <el-form
          ref="withdrawFormRef"
          :model="withdrawFormInfo"
          :rules="withdrawRules"
          label-width="80px"
        >
          <el-form-item
            label="注销原因"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="withdrawFormInfo.remark"
              :rows="3"
              placeholder="请输入注销原因"
            />
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleWithdrawFileSuccess"
              :on-remove="withdrawFileRemoveFile"
              :file-list="withdrawFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="withdrawDialogVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="debounceAction(handleWithdraw)"
            :loading="submitting"
            >确认注销</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 撤回申请弹框 -->
    <el-dialog
      title="撤回申请"
      v-model="withdrawAuditApplyDialogVisible"
      width="500px"
    >
      <div class="withdraw-form">
        <el-form
          ref="withdrawAuditApplyFormRef"
          :model="withdrawAuditApplyFormInfo"
          label-width="80px"
        >
          <el-form-item
            label="撤回原因"
            prop="remark"
          >
            <el-input
              type="textarea"
              v-model="withdrawAuditApplyFormInfo.remark"
              :rows="3"
              placeholder="请输入撤回原因"
            />
          </el-form-item>
          <el-form-item label="上传附件">
            <el-upload
              name="file"
              class="upload-demo"
              :data="attUploadFileData"
              :action="uploadUrl"
              :on-success="handleWithdrawAuditApplyFileSuccess"
              :on-remove="withdrawAuditApplyFileRemoveFile"
              :file-list="withdrawAuditApplyFormInfo.attachmentIdList"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">可上传任意格式文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="withdrawAuditApplyDialogVisible = false"
            >取消</el-button
          >
          <el-button
            type="danger"
            @click="debounceAction(handleWithdrawAuditApply)"
            :loading="submitting"
            >确认撤回</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 上传合同电子版弹框 -->
    <el-dialog
      title="签署版合同上传"
      v-model="recordDialogVisible"
      width="570px"
    >
      <div class="withdraw-form">
        <el-form
          ref="recordFormRef"
          :model="recordFormInfo"
          label-width="130px"
        >
          <el-form-item
            label="签订日期"
            prop="signDate"
            :rules="[
              { required: true, message: '请选择签订日期', trigger: 'change' },
            ]"
          >
            <el-date-picker
              v-model="recordFormInfo.signDate"
              type="date"
              placeholder="请选择签订日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item
            label="上传合同电子版"
            prop="signDate"
            :rules="[
              {
                required: true,
                message: '请上传合同电子版',
                trigger: 'change',
              },
            ]"
          >
            <el-upload
              name="file"
              class="upload-demo"
              :data="signAttUploadFileData"
              :action="uploadUrl"
              :on-success="handleRecordFileSuccess"
              :on-remove="recordFileRemoveFile"
              :file-list="recordFormInfo.signAttachmentIdList"
              multiple
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
          </el-form-item>
          <div class="row">
            <div class="col-md-6">
              <el-form-item
                label="是否有原件"
                prop="hasOriginal"
              >
                <el-radio-group
                  v-model="recordFormInfo.hasOriginal"
                  @change="recordChangeOriginal"
                >
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
            <div
              class="col-md-6"
              v-if="recordFormInfo.hasOriginal"
            >
              <el-form-item
                label="我方留存的原件份数"
                prop="originalCopies"
                label-width="150px"
              >
                <el-input-number
                  v-model="recordFormInfo.originalCopies"
                  :min="1"
                  :max="100"
                />
              </el-form-item>
            </div>
          </div>
          <template v-if="recordFormInfo.hasOriginal">
            <el-form-item
              label="原件是否交档案保存"
              prop="isArchived"
              :rules="[
                {
                  required: true,
                  message: '请选择原件是否交档案保存',
                  trigger: 'change',
                },
              ]"
              label-width="150px"
            >
              <el-radio-group
                v-model="recordFormInfo.isArchived"
                @change="handleIsArchivedChange"
              >
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="原件保管人"
              prop="archiveKeeper"
              :rules="[
                {
                  required: true,
                  message: '请选择原件保管人',
                  trigger: 'change',
                },
              ]"
            >
              <el-select-v2
                v-model="recordFormInfo.archiveKeeper"
                placeholder="请选择"
                style="width: 220px"
                :options="origCustList"
                filterable
                clearable
              />
            </el-form-item>
            <el-form-item
              label="交存日期"
              prop="archiveDate"
            >
              <el-date-picker
                v-model="recordFormInfo.archiveDate"
                type="date"
                placeholder="请选择交存日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </template>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quitRecordDialog">取消</el-button>
          <el-button
            type="success"
            @click="debounceAction(handleRecord)"
            :loading="submitting"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, defineEmits, onMounted, defineProps, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ContractInfo from "@/views/management/contract-management/components/contract-info.vue";
import ContractProcess from "@/views/management/contract-management/components/contract-process.vue";
import ContractEdit from "@/views/management/contract-management/components/contract-edit.vue";
import DoubleHeaderTable from "@/views/management/contract-management/components/doubleHeaderTable.vue";
import ContractFee from "@/views/management/contract-management/components/contract-fee.vue";
import {
  getContractDetail,
  saveContract,
  deleteContract,
  auditContract,
  queryTaskHandlers,
  getContractsByAgentNum,
} from "@/api/contract";
import { Delete, Edit, Refresh } from "@element-plus/icons-vue";
import { useStore } from "vuex";
import { getProgID, doEditInOffice } from "@/utils/editInOffice";
import { uploadAttachments } from "@/api/serviceApi.config.js";
import LoadingOverlay from "@/components/common/loading";
import { getToken } from "@/utils/auth";
import dayjs from "dayjs";

const store = useStore();
import { contractViewPdf, downLoad } from "@/utils";

const isExpanded = ref(false);

const props = defineProps({
  contractId: {
    type: Number,
    required: true,
  },
  type: {
    type: Number,
    default: 1,
  },
});

const updateData = (values) => {
  emit("updateValue", values);
};
// const returnOptions = [
//   {
//     label: "退回上一级",
//     value: 2,
//   },
//   {
//     label: "退回呈批人",
//     value: 1,
//   },
// ];

const returnOptions = computed(()=>{
  let list = [
    {
      label: "退回上一级",
      value: 2,
    },
    {
      label: "退回呈批人",
      value: 1,
    },
  ]
  const task = contractDetial.value.outwardFlowVOList || [];
  if (task.length > 0 && task[task.length - 1].taskName.includes('双重加审')) {
    // 如果当前任务是双重加审，则删除退回至呈批人
    list = list.filter(item => item.value !== 1);
  }
  return list;
})
const uploadUrl = uploadAttachments; // 替换为实际的上传接口

const editing = ref(false);
const emit = defineEmits(["updateValue", "closeInfo"]);
const contractId = ref(props.contractId);

// 监听props变化，更新本地ref
watch(
  () => props.contractId,
  (newVal) => {
    if (!editing.value) {
      contractId.value = newVal;
      fetchDetail();
    }
  }
);

const contractDetial = ref({});
watch(contractId, () => {
  fetchDetail();
});

const progressData = computed(() => {
  return contractDetial.value.outwardFlowVOList || [];
});

const showEmptyHandlerTip = ref(false);

// const userList = computed(() => {
//   console.log(store.state.user.userList,'store.state.user.userList');
//   return store.state.user.userList;
// });

const handleHidden = () => {
  emit("closeInfo", false);
};

// 弹框显示状态
const approveDialogVisible = ref(false);
const stampApplyDialogVisible = ref(false);
const noStampApplyDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const addReviewDialogVisible = ref(false);
const doubleAddReviewDialogVisible = ref(false);
const withdrawDialogVisible = ref(false);
const withdrawAuditApplyDialogVisible = ref(false);
const recordDialogVisible = ref(false);
const doubleHeaderTableVisible = ref(false);
const rejectFormRef = ref(null);
const addReviewFormRef = ref(null);
const doubleAddReviewFormRef = ref(null);
const withdrawFormRef = ref(null);
const withdrawAuditApplyFormRef = ref(null);
const recordFormRef = ref(null);
const approveFormRef = ref(null);
const stampApplyFormRef = ref(null);
const noStampApplyFormRef = ref(null);

// 表单数据
const approveFormInfo = ref({
  attachmentIdList: [],
});

const noStampApplyFormInfo = ref({
  remark: "",
  attachmentIdList: [],
  signAttachmentIdList: [],
  signDate: undefined,
});

const rejectFormInfo = ref({
  isSendBack: 2,
  attachmentIdList: [],
});

const recordFormInfo = ref({
  signAttachmentIdList: [],
});

const addReviewFormInfo = ref({
  attachmentIdList: [],
});

const doubleAddReviewFormInfo = ref({
  attachmentIdList:[]
});

const withdrawFormInfo = ref({
  remark: "",
  attachmentIdList: [],
});

const withdrawAuditApplyFormInfo = ref({
  remark: "",
  attachmentIdList: [],
});

// 表单校验规则
const rejectRules = {
  remark: [{ required: true, message: "请输入退回原因", trigger: "change" }],
};

// const approveRules = {
//   handler: [{ required: true, message: "请选择用印人", trigger: "change" }],
// };

const addReviewRules = {
  princpalList: [
    { required: true, message: "请选择上级负责人", trigger: "change" },
  ],
};

const doubleAddReviewRules = {
  remark: [{ required: true, message: "请输入加审说明", trigger: "change" }],
  handler: [{ required: true, message: "请选择审核人", trigger: "change" }],
  princpalList: [
    { required: true, message: "请选择上级负责人", trigger: "change" },
  ],
};

const withdrawRules = {
  remark: [{ required: true, message: "请输入注销原因", trigger: "change" }],
};
//无需用印变更是否有原件
const noStampChangeOriginal = (value) => {
  if (value) {
    noStampApplyFormInfo.value.originalCopies = 1;
  } else {
    noStampApplyFormInfo.value.originalCopies = undefined;
  }
};
//签署合同版上传变更是否有原件
const recordChangeOriginal = (value) => {
  if (value) {
    recordFormInfo.value.originalCopies = 1;
  } else {
    recordFormInfo.value.originalCopies = undefined;
  }
};
// 审核人选项
const taskHandlers = ref([]);
// const seniorTaskHandlers = ref([]);
// 显示弹框方法
const showApproveDialog = () => {
  if (addReviewPermission.value) {
    addReviewDialogVisible.value = true;
    fetchTaskHandlers(3);
  } else {
    approveDialogVisible.value = true;
  }
};

const showStampApplyDialog = () => {
  stampApplyDialogVisible.value = true;
  if (
    contractDetial.value.contractSealer &&
    contractDetial.value.contractSealer.length > 0
  ) {
    // taskHandlers.value = contractDetial.value.contractSealer.map((sealer) => ({
    //   userName: sealer.contractSealer,
    //   userId: sealer.contractSealerUserId,
    // }));
    const contractSealers = contractDetial.value.contractSealer || []
    const names = contractSealers.map(item => item.contractSealer).join('、')
    approveFormInfo.value.handler = names
    if (contractSealers.length === 1) {
      approveFormInfo.value.handlerId = contractSealers[0].contractSealerUserId
    }
  }
  // fetchTaskHandlers(11);
};

const showNoStampApplyDialog = () => {
  noStampApplyFormInfo.value.isSignedContract = 1;
  noStampApplyFormInfo.value.hasOriginal = contractDetial.value.hasOriginal;
  noStampApplyFormInfo.value.originalCopies =
    contractDetial.value.originalCopies;
  noStampApplyFormInfo.value.archiveDate = dayjs().format("YYYY-MM-DD");
  noStampApplyFormInfo.value.isArchived = 1;
  noStampApplyDialogVisible.value = true;
};

const showRejectDialog = () => {
  rejectDialogVisible.value = true;
};

// const showAddReviewDialog = () => {
//   addReviewDialogVisible.value = true;
//   fetchTaskHandlers(3);
// };

const showDoubleAddReviewDialog = () => {
  doubleAddReviewDialogVisible.value = true;
  fetchTaskHandlers(4);
  // fetchSeniorTaskHandlers(3);
};

const showRecordDialog = () => {
  recordFormInfo.value.hasOriginal = contractDetial.value.hasOriginal;
  recordFormInfo.value.originalCopies = contractDetial.value.originalCopies;
  recordFormInfo.value.isArchived = 1;
  recordFormInfo.value.archiveDate = dayjs().format("YYYY-MM-DD");
  recordDialogVisible.value = true;
};
const quitRecordDialog = () => {
  recordDialogVisible.value = false;
  recordFormInfo.value = {
    signDate: undefined,
    signAttachmentIdList: [],
  };
};

const showWithdrawDialog = () => {
  withdrawDialogVisible.value = true;
};

const showWithdrawAuditApplyDialog = () => {
  withdrawAuditApplyDialogVisible.value = true;
};

const isShowTipinfo = computed(() => {
  const task = contractDetial.value.outwardFlowVOList || [];
  if (task.length > 0) {
    return task[task.length - 1].taskName == "合同合规审查";
  }
  return false;
});

const origCustList = computed(() => {
  const list = store.state.user.userList || [];

  // 根据原件是否交档案保存的选择来过滤选项
  if (recordFormInfo.value.isArchived === 1) {
    // 选择"是"时，只显示"金国莹"和"杜梦楠"
    return list.filter(
      (user) => user.label === "金国莹" || user.label === "杜梦楠"
    );
  } else {
    // 选择"否"时，显示除"金国莹"和"杜梦楠"外的所有员工
    return list.filter(
      (user) => user.label !== "金国莹" && user.label !== "杜梦楠"
    );
  }
});

// 为"无需用印"弹框创建过滤后的用户列表
const filteredUserList = computed(() => {
  const list = store.state.user.userList || [];

  // 根据原件是否交档案保存的选择来过滤选项
  if (noStampApplyFormInfo.value.isArchived === 1) {
    // 选择"是"时，只显示"金国莹"和"杜梦楠"
    return list.filter(
      (user) => user.label === "金国莹" || user.label === "杜梦楠"
    );
  } else {
    // 选择"否"时，显示除"金国莹"和"杜梦楠"外的所有员工
    return list.filter(
      (user) => user.label !== "金国莹" && user.label !== "杜梦楠"
    );
  }
});

// 处理是否交存变化
const handleIsArchivedChange = (value) => {
  if (value === 1) {
    recordFormInfo.value.archiveKeeper = undefined;
    // recordFormInfo.value.archiveDate = undefined;
  } else {
    //当value的值为0时，archiveDate默认值为当日日期
    recordFormInfo.value.archiveKeeper = undefined;
  }
};
// 无需用印处理是否交存变化
const IsArchivednoStampApplyChange = (value) => {
  if (value === 1) {
    noStampApplyFormInfo.value.archiveKeeper = undefined;
  } else {
    //当value的值为0时，archiveDate默认值为当日日期
    noStampApplyFormInfo.value.archiveKeeper = undefined;
  }
};

// 判断最新流程是否为合同撤回
const isLatestTaskWithdraw = computed(() => {
  const tasks = contractDetial.value.outwardFlowVOList || [];
  if (tasks.length > 0) {
    return tasks[tasks.length - 1].taskName === "合同撤回";
  }
  return false;
});

// 判断当前文件是否为DOC/DOCX格式，支持在线编辑
const isDocFile = computed(() => {
  const filePath = contractDetial.value.attachmentCon?.filePath;
  if (!filePath) return false;

  const fileExt = filePath.replace(/.+\./, "").toLowerCase();
  return ["doc", "docx"].includes(fileExt);
});

const pdfUrl = ref("");
const pdfLoading = ref(false);
const pdfTimestamp = ref(Date.now());

const isExpandedFunc = async () => {
  if (!isExpanded.value) {
    await fetchPdfUrl();
  }
  isExpanded.value = !isExpanded.value;
};

// 计算带时间戳的PDF URL
const pdfUrlWithTimestamp = computed(() => {
  if (!pdfUrl.value) return "";
  const separator = pdfUrl.value.includes("?") ? "&" : "?";
  return `/ipdoc${pdfUrl.value}${separator}t=${pdfTimestamp.value}`;
});

// 获取PDF URL
const fetchPdfUrl = async () => {
  try {
    pdfLoading.value = true;
    const attachmentCon = contractDetial.value.previewAttachmentCon;

    if (!attachmentCon?.filePath) {
      ElMessage.warning("未找到合同文件");
      return;
    }

    const url = attachmentCon.filePath;
    const fileExt = url.replace(/.+\./, "").toLowerCase();

    if (["doc", "docx"].includes(fileExt)) {
      const res = await contractViewPdf(url, true);
      pdfUrl.value = res;
    } else {
      pdfUrl.value = url;
    }
    // 更新时间戳以避免缓存问题
    pdfTimestamp.value = Date.now();
    return pdfUrl.value;
  } catch (error) {
    console.error("获取PDF URL失败:", error);
    ElMessage.error("获取文件失败，请稍后重试");
    throw error;
  } finally {
    pdfLoading.value = false;
  }
};

// 刷新iframe内容
const handleRefresh = async () => {
  const iframe = document.querySelector("iframe");
  if (!iframe) return;

  try {
    pdfLoading.value = true;

    // 先清空iframe内容
    iframe.src = "about:blank";

    // 获取新的URL
    const newPdfUrl = await fetchPdfUrl();
    if (!newPdfUrl) return;

    // 构造完整的URL
    const baseUrl = window.location.origin; // 获取当前域名
    const fullUrl = `${baseUrl}/ipdoc${newPdfUrl}`;

    // 添加时间戳参数
    const url = new URL(fullUrl);
    url.searchParams.set("t", Date.now());

    // 延迟设置新URL以确保清空操作完成
    setTimeout(() => {
      iframe.src = url.toString();
    }, 100);
  } catch (error) {
    console.error("刷新失败:", error);
    ElMessage.error("刷新失败，请稍后重试");
  } finally {
    pdfLoading.value = false;
  }
};

watch(
  () => contractDetial.value,
  (newUrl) => {
    if (newUrl.previewAttachmentCon?.filePath) {
      // const url = newUrl.attachmentCon.filePath;
      // if (
      //   ["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
      // ) {
      //   contractViewPdf(url, true).then((res) => {
      //     pdfUrl.value = res;
      //   });
      // } else {
      //   pdfUrl.value = url;
      // }
      fetchPdfUrl();
    }
  }
);

// 添加提交状态控制
const submitting = ref(false);

// 防抖动作处理函数
const debounceAction = (action) => {
  if (submitting.value) return;
  submitting.value = true;

  // 执行操作前先禁用按钮
  try {
    action();
  } catch (error) {
    console.error("操作执行出错:", error);
    ElMessage.error("操作失败，请稍后再试");
    submitting.value = false;
  }

  // 3秒后恢复按钮状态，防止API没有正确返回时按钮永久禁用
  setTimeout(() => {
    submitting.value = false;
  }, 3000);
};

// 原有函数扩展，添加状态重置
const handleApprove = () => {
  console.log(
    approveFormInfo.value.attachmentIdList,
    "approveFormInfo.value.attachmentIdList"
  );

  const params = {
    contractId: contractDetial.value.contractId,
    result: 1,
    taskId: contractDetial.value.lastTaskId,
    attachmentIdList: approveFormInfo.value.attachmentIdList.map(
      (item) => item.attachmentId
    ),
    remark: approveFormInfo.value.remark,
  };
  console.log(params, "params");
  auditContract(params)
    .then((res) => {
      if (res.success) {
        ElMessage.success("操作成功");
        approveDialogVisible.value = false;
        approveFormInfo.value = {
          remark: "",
          attachmentIdList: [],
        };
        handleHidden();
      }
      submitting.value = false;
    })
    .catch((error) => {
      console.error("审核通过失败:", error);
      ElMessage.error("操作失败，请稍后再试");
      submitting.value = false;
    });
};

//获取审核人员列表
const fetchTaskHandlers = async (type) => {
  const params = {
    contractId: contractDetial.value.contractId,
    taskId: contractDetial.value.lastTaskId,
    conValue: type,
  };
  const res = await queryTaskHandlers(params);
  if (res.success) {
    taskHandlers.value = res.data || [];
    if (res.data.length > 0) {
      if (type == 3) {
        // addReviewFormInfo.value.princpalList = res.data[0].userId;
      } else if (type == 4 && taskHandlers.value.length === 1) {
        doubleAddReviewFormInfo.value.handler = taskHandlers.value[0].userId;
      }
      // } else if (type == 11) {
      //   approveFormInfo.value.handler = res.data[0].userId;
      // }
    }
  }
};

//获取上级负责人列表
// const fetchSeniorTaskHandlers = async (type) => {
//   const params = {
//     contractId: contractDetial.value.contractId,
//     taskId: contractDetial.value.lastTaskId,
//     conValue: type,
//   };
//   const res = await queryTaskHandlers(params);
//   if (res.success) {
//     seniorTaskHandlers.value = res.data || [];
//     if (res.data.length > 0) {
//       if (type == 4) {
//         doubleAddReviewFormInfo.value.princpalList = res.data[0].userId;
//       }
//     }
//   }
// };

const handleReject = () => {
  rejectFormRef.value.validate((valid) => {
    if (valid) {
      let result = 2;

      // 判断是否需要根据startWithdrawBeforeTaskNo获取conValue
      if (contractDetial.value.startWithdrawBeforeTaskNo) {
        // 在processDefineList中查找对应的nextNo和conValue
        const targetTask = contractDetial.value.processDefineList.find(
          (item) =>
            item.nextNo === contractDetial.value.startWithdrawBeforeTaskNo
        );

        // 如果找到对应的任务，使用其conValue，否则使用默认值2
        result = targetTask ? targetTask.conValue : 2;
      }
      const params = {
        contractId: contractDetial.value.contractId,
        result: result,
        taskId: contractDetial.value.lastTaskId,
        attachmentIdList: rejectFormInfo.value.attachmentIdList.map(
          (item) => item.attachmentId
        ),
        remark: rejectFormInfo.value.remark,
        isSendBack: rejectFormInfo.value.isSendBack,
      };
      auditContract(params)
        .then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
            rejectDialogVisible.value = false;
            rejectFormInfo.value = {
              remark: "",
              isSendBack: 2,
              attachmentIdList: [],
            };
            handleHidden();
          }
          submitting.value = false;
        })
        .catch((error) => {
          console.error("审核退回失败:", error);
          ElMessage.error("操作失败，请稍后再试");
          submitting.value = false;
        });
    } else {
      submitting.value = false;
    }
  });
};

//获取操作权限
//提交权限
const submitPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.progress == "呈批"
  );
});
//通过权限
const passPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 1
  );
});
// 签署版合同上传
const conUploadPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 5
  );
});
//用印完成
const stampPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 6
  );
});
//驳回权限
const rejectPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 2
  );
});
//加审权限
const addReviewPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 3
  );
});
//双重加审权限
const doubleAddReviewPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 4
  );
});
// 无需用印权限
const noStampPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 10
  );
});
//用印申请权限
const stampApplyPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 11
  );
});
//注销权限
const withdrawPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.progress == "合同号注销呈批" || item.conValue == 18
  );
});
//撤回审核申请权限
const withdrawAuditApplyPermission = computed(() => {
  return contractDetial.value.processDefineList?.some(
    (item) => item.conValue == 12
  );
});

const handleCompleted = (type) => {
  const params = {
    contractId: contractDetial.value.contractId,
    result: type,
    taskId: contractDetial.value.lastTaskId,
  };
  auditContract(params)
    .then((res) => {
      if (res.success) {
        ElMessage.success("操作成功");
        handleHidden();
      }
      submitting.value = false;
    })
    .catch((error) => {
      console.error("操作失败:", error);
      ElMessage.error("操作失败，请稍后再试");
      submitting.value = false;
    });
};

const handleAddReview = () => {
  addReviewFormRef.value.validate((valid) => {
    if (valid) {
      const params = {
        contractId: contractDetial.value.contractId,
        result: 1,
        taskId: contractDetial.value.lastTaskId,
        remark: addReviewFormInfo.value.remark,
        isInvestigate: addReviewFormInfo.value.isInvestigate,
        attachmentIdList: addReviewFormInfo.value.attachmentIdList.map(
          (item) => item.attachmentId
        ),
        princpalList: addReviewFormInfo.value.isInvestigate
          ? addReviewFormInfo.value.princpalList
          : undefined,
      };
      auditContract(params)
        .then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
            addReviewDialogVisible.value = false;
            addReviewFormInfo.value = {
              remark: undefined,
              princpalList: undefined,
              attachmentIdList: [],
            };
            handleHidden();
          }
          submitting.value = false;
        })
        .catch((error) => {
          console.error("加审失败:", error);
          ElMessage.error("操作失败，请稍后再试");
          submitting.value = false;
        });
    } else {
      submitting.value = false;
    }
  });
};
const handleDoubleAddReview = () => {
  doubleAddReviewFormRef.value.validate((valid) => {
    if (valid) {
      const params = {
        contractId: contractDetial.value.contractId,
        result: 4,
        taskId: contractDetial.value.lastTaskId,
        handler: doubleAddReviewFormInfo.value.handler,
        remark: doubleAddReviewFormInfo.value.remark,
        attachmentIdList: doubleAddReviewFormInfo.value.attachmentIdList.map(
          (item) => item.attachmentId
        ),
        // princpalList: doubleAddReviewFormInfo.value.princpalList,
      };
      auditContract(params)
        .then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
            doubleAddReviewDialogVisible.value = false;
            doubleAddReviewFormInfo.value = {
              remark: undefined,
              handler: undefined,
              princpalList: undefined,
              attachmentIdList:[]
            };
            handleHidden();
          }
          submitting.value = false;
        })
        .catch((error) => {
          console.error("双重加审失败:", error);
          ElMessage.error("操作失败，请稍后再试");
          submitting.value = false;
        });
    } else {
      submitting.value = false;
    }
  });
};

const handleWithdraw = () => {
  withdrawFormRef.value.validate((valid) => {
    if (valid) {
      const params = {
        contractId: contractDetial.value.contractId,
        taskId: contractDetial.value.lastTaskId,
        result: 18,
        attachmentIdList: withdrawFormInfo.value.attachmentIdList.map(
          (item) => item.attachmentId
        ),
        remark: withdrawFormInfo.value.remark,
      };
      auditContract(params)
        .then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
            withdrawDialogVisible.value = false;
            withdrawFormInfo.value = {
              remark: "",
              attachmentIdList: [],
            };
            handleHidden();
          }
          submitting.value = false;
        })
        .catch((error) => {
          console.error("失败:", error);
          ElMessage.error("操作失败，请稍后再试");
          submitting.value = false;
        });
    } else {
      submitting.value = false;
    }
  });
};

const handleWithdrawAuditApply = () => {
  withdrawAuditApplyFormRef.value.validate((valid) => {
    if (valid) {
      const params = {
        contractId: contractDetial.value.contractId,
        taskId: contractDetial.value.lastTaskId,
        result: 12,
        attachmentIdList: withdrawAuditApplyFormInfo.value.attachmentIdList.map(
          (item) => item.attachmentId
        ),
        remark: withdrawAuditApplyFormInfo.value.remark,
      };
      auditContract(params)
        .then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
            withdrawAuditApplyDialogVisible.value = false;
            withdrawAuditApplyFormInfo.value = {
              remark: "",
              attachmentIdList: [],
            };
            handleHidden();
          }
          submitting.value = false;
        })
        .catch((error) => {
          console.error("失败:", error);
          ElMessage.error("操作失败，请稍后再试");
          submitting.value = false;
        });
    } else {
      submitting.value = false;
    }
  });
};

//上传合同电子版完成
const handleRecord = () => {
  recordFormRef.value.validate((valid) => {
    if (valid) {
      if (!recordFormInfo.value.signAttachmentIdList.length) {
        return ElMessage.error("请上传合同电子版");
      }
      const params = {
        contractId: contractDetial.value.contractId,
        taskId: contractDetial.value.lastTaskId,
        result: 5,
        signDate: recordFormInfo.value.signDate,
        signAttachmentIdList: recordFormInfo.value.signAttachmentIdList.map(
          (item) => item.attachmentId
        ),
        hasOriginal: recordFormInfo.value.hasOriginal,
      };
      if (recordFormInfo.value.hasOriginal) {
        params.originalCopies = recordFormInfo.value.originalCopies
        params.isArchived = recordFormInfo.value.isArchived
        params.archiveKeeper = recordFormInfo.value.archiveKeeper
        params.archiveDate = recordFormInfo.value.archiveDate
      }
      auditContract(params)
        .then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
            recordDialogVisible.value = false;
            recordFormInfo.value = {
              attachmentIdList: [],
            };
            handleHidden();
          }
          submitting.value = false;
        })
        .catch((error) => {
          console.error("上传合同电子版失败:", error);
          ElMessage.error("操作失败，请稍后再试");
          submitting.value = false;
        });
    } else {
      submitting.value = false;
    }
  });
};
const contractEditRef = ref(null);
const fetchDetail = () => {
  getContractDetail({ contractId: contractId.value }).then((res) => {
    const data = res.data[0] || {};
    contractDetial.value = data;
    updateData(data);
    if (
      contractDetial.value.isRegisteredPersonnel &&
      contractDetial.value.isArchived === 1
    ) {
      ElMessageBox.alert("呈批人已提交原件，请及时确认。", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
    }
  });
};

const is2DArray = (arr) => {
  if (arr.length === 0) {
    return false; // 空数组可以视为一维数组
  }
  const firstElement = arr[0];
  return Array.isArray(firstElement);
};
const deleteContractFunc = () => {
  ElMessageBox.confirm("确认要删除吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteContract({ contractId: contractDetial.value.contractId }).then(
      (res) => {
        if (res.success) {
          handleHidden();
          ElMessage.success("删除成功");
        }
      }
    );
  });
};
const isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};

// 保存信息
const saveInfo = async (isSave) => {
  try {
    if (isSave == 2 && !editing.value) {
      // 提交
      const data = JSON.parse(JSON.stringify(contractDetial.value));
      // if (data.projectInfo.undertaker != store.state.user.userId) {
      //   ElMessage.warning("提交人和呈批人须为同一人");
      //   submitting.value = false;
      //   return;
      // }
      if (!data.contractName) {
        ElMessage.warning("请填写合同名称");
        submitting.value = false;
        return;
      }
      if (!data.conTypeId) {
        ElMessage.warning("请选择合同类型");
        submitting.value = false;
        return;
      }
      if (!(data.signers[0].custCompId || data.signers[0].signerName)) {
        ElMessage.warning("请选择甲方");
        submitting.value = false;
        return;
      }
      if (!(data.signers[1].custCompId || data.signers[1].signerName)) {
        ElMessage.warning("请选择乙方");
        submitting.value = false;
        return;
      }
      if (!data.amount) {
        ElMessage.warning("请填写合同金额");
        submitting.value = false;
        return;
      }
      const params = {
        isSave: isSave,
        contractId: data.contractId,
        contractName: data.contractName,
        conTypeId: data.conTypeId,
        checkItemList: data.checkItemList,
        remark: data.remark,
        signers: data.signers,
        projectNumber: data.projectNumber,
        projectInfo: {
          undertaker: data.projectInfo.undertaker,
          wkgId: data.projectInfo.wkgId,
          caseIdList: data.projectInfo.caseIdList,
          custIdList: data.projectInfo.custIdList,
          caseTypeList: data.projectInfo.caseTypeList,
          appFromtoList: data.projectInfo.appFromtoList,
          customerManager: data.projectInfo.customerManager,
          projectName: data.projectInfo.projectName,
          showRefno: data.projectInfo.showRefno,
          custWkgId: data.projectInfo.custWkgId,
        },
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        serviceContent: data.serviceContent,
        amountDescription: data.amountDescription,
        amount: data.amount,
        hasOriginal: data.hasOriginal,
        originalCopies: data.originalCopies,
        performanceTermType: data.performanceTermType,
        performanceStartDate: data.performanceStartDate,
        performanceEndDate: data.performanceEndDate,
        approvaExplanation: data.approvaExplanation,
        irregularExplanation: data.irregularExplanation,
      };
      let attIds = [];
      if (data.attachmentList.length > 0) {
        attIds = data.attachmentList.map((item) => item.attachmentId);
      }
      params.attachmentIds = data.attachmentCon?.attachmentId
        ? [...attIds, data.attachmentCon.attachmentId]
        : [...attIds];
      const res = await saveContract(params);
      if (res.success) {
        ElMessage.success("保存成功");
        handleHidden();
      }
    } else {
      // 保存
      try {
        const datas = await contractEditRef.value.getFormData(isSave);
        const formData = JSON.parse(JSON.stringify(datas));
        if (!formData) {
          submitting.value = false;
          return; // 如果表单验证失败或没有上传合同，直接返回
        }

        // 无论是保存还是提交，都检查提交人和呈批人是否为同一人
        // if (formData.projectInfo.undertaker != store.state.user.userId) {
        //   ElMessage.warning("提交人和呈批人须为同一人");
        //   submitting.value = false;
        //   return;
        // }

        const data = {
          contractId: formData.contractId,
          contractName: formData.contractName,
          conTypeId: formData.conTypeId
            ? Array.isArray(formData.conTypeId)
              ? formData.conTypeId[formData.conTypeId.length - 1]
              : formData.conTypeId
            : null,
          checkItemList: formData.checkItemList,
          remark: formData.remark,
          signers: formData.signers,
          projectNumber: formData.projectNumber,
          projectInfo: {
            undertaker: formData.projectInfo.undertaker,
            wkgId: formData.projectInfo.wkgId,
            caseIdList: formData.projectInfo.caseIdList,
            custIdList: formData.projectInfo.custIdList,
            caseTypeList: formData.projectInfo.caseTypeList,
            appFromtoList: formData.projectInfo.appFromtoList,
            customerManager: formData.projectInfo.customerManager,
            caseNameNameList: formData.projectInfo.caseNameNameList,
            projectName: formData.projectInfo.projectName,
            showRefno: formData.projectInfo.showRefno,
            custWkgId: formData.projectInfo.custWkgId,
          },
          currency: formData.currency,
          paymentMethod: formData.paymentMethod,
          serviceContent: formData.serviceContent,
          isSave: isSave,
          hasOriginal: formData.hasOriginal,
          originalCopies: formData.originalCopies,
          performanceTermType: formData.performanceTermType,
          performanceStartDate: formData.performanceStartDate,
          performanceEndDate: formData.performanceEndDate,
          approvaExplanation: formData.approvaExplanation,
          irregularExplanation: formData.irregularExplanation,
        };
        //处理自定义客户
        if (data.signers && data.signers.length) {
          data.signers.forEach((item) => {
            if (!isNumber(item.custCompId)) {
              item.custCompId = null;
            }
          });
        }
        if (formData.currency == "文字描述") {
          data.amountDescription = formData.amount;
        } else {
          data.amount = formData.amount;
        }

        if (is2DArray(data.projectInfo?.caseTypeList)) {
          data.projectInfo.caseTypeList = data.projectInfo.caseTypeList.map(
            (subArray) => subArray[subArray.length - 1]
          );
        }

        let attIds = [];
        let contractFileIds = [];
        if (formData.fileList.length > 0) {
          attIds = formData.fileList.map((item) => item.attachmentId);
        }
        if (formData.contractFileList.length > 0) {
          contractFileIds = formData.contractFileList.map(
            (item) => item.attachmentId
          );
        }
        data.attachmentIds = [...attIds, ...contractFileIds];

        // 这里可以处理保存逻辑
        const res = await saveContract(data);
        if (res.success) {
          ElMessage.success("保存成功");
          handleHidden();
        }
      } catch (error) {
        console.error("保存合同时出错:", error);
        ElMessage.error("保存失败，请稍后再试");
      }
    }
  } catch (error) {
    console.error("保存信息失败:", error);
  } finally {
    submitting.value = false;
  }
};

//附件上传
const attUploadFileData = ref({
  tokenID: getToken(),
  fileCategory: 2,
});
// 合同电子版上传
const signAttUploadFileData = ref({
  tokenID: getToken(),
  fileCategory: 1,
});

// 添加编辑按钮的处理方法
const handleOnlyOfficeEdit = () => {
  ElMessageBox.alert('请确认文档为【修订】模式再进行审查！', '提示', {
    confirmButtonText: '确定',
    type: 'info',
    callback: () => {
      const webDavUrl = contractDetial.value.attachmentCon.filePath;
      const progID = getProgID(webDavUrl);
      doEditInOffice(webDavUrl, progID);
    }
  });
};

//审核通过携带附件
const handleApproveFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    approveFormInfo.value.attachmentIdList.push(newFile);
  }
};

//双重加审携带附件
const handleDualRevFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    doubleAddReviewFormInfo.value.attachmentIdList.push(newFile);
  }
};

//移除审核通过携带附件
const approveFileRemoveFile = (file) => {
  console.log(file, "files");
  approveFormInfo.value.attachmentIdList =
    approveFormInfo.value.attachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response.data.attachmentId)
    );
};

//移除双重加审携带附件
const dualRevRemoveFile = (file) => {
  doubleAddReviewFormInfo.value.attachmentIdList =
  doubleAddReviewFormInfo.value.attachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response.data.attachmentId)
    );
};

//加审携带附件
const handleAddReviewFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    addReviewFormInfo.value.attachmentIdList.push(newFile);
  }
};

//移除加审携带附件
const addReviewFileRemoveFile = (file) => {
  addReviewFormInfo.value.attachmentIdList =
    addReviewFormInfo.value.attachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response.data.attachmentId)
    );
};

//审核驳回携带附件
const handleRejectFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    rejectFormInfo.value.attachmentIdList.push(newFile);
  }
};

//移除审核驳回携带附件
const rejectFileRemoveFile = (file) => {
  rejectFormInfo.value.attachmentIdList =
    rejectFormInfo.value.attachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response.data.attachmentId)
    );
};

//注销合同携带附件
const handleWithdrawFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    withdrawFormInfo.value.attachmentIdList.push(newFile);
  }
};

//撤回审核申请携带附件
const handleWithdrawAuditApplyFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    withdrawAuditApplyFormInfo.value.attachmentIdList.push(newFile);
  }
};

//上传合同电子版成功
const handleRecordFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    // 将新文件添加到 signAttachmentIdList 中
    recordFormInfo.value.signAttachmentIdList.push(newFile);
  }
};

//移除注销合同携带附件
const withdrawFileRemoveFile = (file) => {
  withdrawFormInfo.value.attachmentIdList =
    withdrawFormInfo.value.attachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response.data.attachmentId)
    );
};

//移除上传合同电子版
const recordFileRemoveFile = (file) => {
  recordFormInfo.value.signAttachmentIdList =
    recordFormInfo.value.signAttachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response.data.attachmentId)
    );
};

// 合同预览方法
const handlePreviewContract = async () => {
  await fetchPdfUrl();
  // 注释掉全屏功能，改为在新标签页中打开PDF
  // if (!isExpanded.value) {
  //   isExpanded.value = true;
  //   // 给一个短暂的延迟，确保DOM更新后再触发全屏
  //   setTimeout(() => {
  //     toggleFullscreen();
  //   }, 300);
  // } else {
  //   toggleFullscreen();
  // }
  if (!pdfUrl.value) {
    ElMessage.warning("PDF文件正在加载中，请稍后再试");
    return;
  }

  // 构造完整的PDF URL
  const fullPdfUrl = pdfUrlWithTimestamp.value;

  // 在新标签页中打开PDF
  window.open(fullPdfUrl, "_blank");
};

// 相关合同列表
const relatedContracts = ref([]);

// 获取相关合同
const fetchRelatedContracts = async () => {
  try {
    const res = await getContractsByAgentNum({
      contractId: contractId.value,
    });

    if (res.success && res.data) {
      relatedContracts.value = res.data.map((contract) => ({
        contractId: contract.contractId || 0,
        contractName: contract.contractName || "",
        contractType: contract.contractType || "",
        undertakerName: contract.undertakerName || "",
        currentState: contract.currentState || "",
        handlerName: contract.handlerName || "",
      }));
    } else {
      relatedContracts.value = [];
    }
  } catch (error) {
    console.error("获取相关合同失败:", error);
    relatedContracts.value = [];
  }
};

// 切换到其他合同
const switchToContract = (newContractId) => {
  if (newContractId === contractId.value || newContractId === 0) return;

  // 更新当前合同ID
  contractId.value = newContractId;

  // 通知父组件更新contractId
  emit("update:contractId", newContractId);
};

// 在获取合同详情后，获取相关合同
watch(
  () => contractDetial.value,
  (newVal) => {
    if (newVal && newVal.contractId) {
      fetchRelatedContracts();
    }
  },
  { deep: true }
);

onMounted(() => {
  fetchDetail();
});

// 添加用印申请处理函数
const handleStampApply = () => {
  if (!approveFormInfo.value.handler && !taskHandlers.value.length) {
    showEmptyHandlerTip.value = true;
    return;
  }
  const params = {
    contractId: contractDetial.value.contractId,
    result: 11, // 用印申请的值
    taskId: contractDetial.value.lastTaskId,
    attachmentIdList: approveFormInfo.value.attachmentIdList.map(
      (item) => item.attachmentId
    ),
    remark: approveFormInfo.value.remark,
    handler: approveFormInfo.value.handlerId,
  };

  auditContract(params)
    .then((res) => {
      if (res.success) {
        ElMessage.success("用印申请提交成功");
        stampApplyDialogVisible.value = false;
        approveFormInfo.value = {
          remark: "",
          attachmentIdList: [],
          handler: undefined,
        };
        handleHidden();
      }
      submitting.value = false;
    })
    .catch((error) => {
      console.error("用印申请提交失败:", error);
      ElMessage.error("操作失败，请稍后再试");
      submitting.value = false;
    });
};

// 添加无需用印附件上传成功处理函数
const handleNoStampFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    noStampApplyFormInfo.value.attachmentIdList.push(newFile);
  }
};

// 添加无需用印附件移除处理函数
const noStampFileRemoveFile = (file) => {
  noStampApplyFormInfo.value.attachmentIdList =
    noStampApplyFormInfo.value.attachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response?.data?.attachmentId)
    );
};

// 添加无需用印电子版上传成功处理函数
const handleNoStampContractFileSuccess = (response) => {
  if (response.data) {
    const newFile = {
      name: response.data.fileName,
      url: response.data.filePath,
      attachmentId: response.data.attachmentId,
    };
    noStampApplyFormInfo.value.signAttachmentIdList.push(newFile);
  }
};

// 添加无需用印电子版移除处理函数
const noStampContractFileRemoveFile = (file) => {
  noStampApplyFormInfo.value.signAttachmentIdList =
    noStampApplyFormInfo.value.signAttachmentIdList.filter(
      (item) =>
        item.attachmentId !==
        (file.attachmentId || file.response?.data?.attachmentId)
    );
};
//关闭无需用印
const closeNoStampApplyDialog = () => {
  noStampApplyDialogVisible.value = false;
  noStampApplyFormInfo.value = {
    remark: "",
    attachmentIdList: [],
    signAttachmentIdList: [],
    signDate: undefined,
    archiveKeeper: undefined,
  };
};
// 添加无需用印处理函数
const handleNoStampApply = () => {
  // 检查签订日期和电子版是否同时存在或同时不存在
  const hasSignDate = !!noStampApplyFormInfo.value.signDate;
  const hasAttachments =
    noStampApplyFormInfo.value.signAttachmentIdList &&
    noStampApplyFormInfo.value.signAttachmentIdList.length > 0;

  // 如果只填写了其中一项，则提示错误
  if ((hasSignDate && !hasAttachments) || (!hasSignDate && hasAttachments)) {
    ElMessage.warning("签订日期和合同电子版必须同时填写或同时不填写");
    submitting.value = false;
    return;
  }

  const params = {
    contractId: contractDetial.value.contractId,
    result: 10, // 无需用印的值
    taskId: contractDetial.value.lastTaskId,
    attachmentIdList: noStampApplyFormInfo.value.attachmentIdList.map(
      (item) => item.attachmentId
    ),
    remark: noStampApplyFormInfo.value.remark,
    isSignedContract: noStampApplyFormInfo.value.isSignedContract,
  };

  // 如果同时提供了签订日期和电子版，则添加到参数中
  if (
    hasSignDate &&
    hasAttachments &&
    noStampApplyFormInfo.value.isSignedContract
  ) {
    params.signDate = noStampApplyFormInfo.value.signDate;
    params.signAttachmentIdList =
      noStampApplyFormInfo.value.signAttachmentIdList.map(
        (item) => item.attachmentId
      );
    params.hasOriginal = noStampApplyFormInfo.value.hasOriginal;
    if (noStampApplyFormInfo.value.hasOriginal) {
      params.originalCopies = noStampApplyFormInfo.value.originalCopies;
      params.isArchived = noStampApplyFormInfo.value.isArchived;
      params.archiveKeeper = noStampApplyFormInfo.value.archiveKeeper;
      params.archiveDate = noStampApplyFormInfo.value.archiveDate;
    }
    noStampApplyFormRef.value.validate((valid) => {
      if (!valid) {
        submitting.value = false;
        return;
      }
      // 校验通过，执行提交
      doNoStampApplySubmit(params);
    });
  } else {
    // 不需要校验，直接提交
    doNoStampApplySubmit(params);
  }
};

const doNoStampApplySubmit = (params) => {
  auditContract(params)
    .then((res) => {
      if (res.success) {
        ElMessage.success("无需用印提交成功");
        noStampApplyDialogVisible.value = false;
        // 重置表单
        noStampApplyFormInfo.value = {
          remark: "",
          attachmentIdList: [],
          signAttachmentIdList: [],
          signDate: undefined,
          archiveKeeper: undefined,
        };
        handleHidden();
      }
      submitting.value = false;
    })
    .catch((error) => {
      console.error("无需用印提交失败:", error);
      ElMessage.error("操作失败，请稍后再试");
      submitting.value = false;
    });
};

// 动态最大高度
const contractInfoMaxHeight = computed(() => {
  if (window.self !== window.top) {
    if (props.type === 1) {
      return "calc(100vh - 60px)";
    } else {
      return "calc(100vh - 130px)";
    }
  } else {
    return "calc(100vh - 130px)";
  }
});
</script>

<style lang="scss" scoped>
.contract-preview {
  position: relative;
  min-width: 700px;
  padding: 0; /* 去掉内边距 */
  margin: 0; /* 去掉边距 */
  border-radius: 4px;
  margin-left: 16px; /* 去掉左侧间距 */
  .contract-preview-content {
    width: 100%;
    height: 100%;
  }
}
.contract-info {
  flex: 1; /* 使两部分均分可用空间 */
  padding: 0; /* 去掉内边距 */
  margin: 0; /* 去掉边距 */
  border-radius: 4px;
  margin-left: 8px; /* 去掉左侧间距 */
  overflow-y: auto;
  min-width: 350px;
  /* max-height: calc(100vh - 130px);  移除静态max-height */
}

.fullscreen-btn {
  margin-left: auto;
  cursor: pointer;
  font-size: 12px;
  padding: 5px 10px;
  line-height: 1;
}
/* 浮动按钮样式 */
.floating-buttons {
  position: fixed; /* 固定定位 */
  bottom: 20px; /* 距离底部20px */
  right: 20px; /* 距离右侧20px */
  display: flex; /* 水平排列 */
  gap: 10px; /* 按钮之间的间距 */
  width: calc(100% - 40px); /* 宽度减去左右边距 */
  justify-content: flex-end; /* 默认靠右对齐 */
}

.contract-action-btn {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.contract-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.flex-grow-1 {
  flex-grow: 1;
}

/* 添加浮动编辑按钮的样式 */
.floating-edit-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding-right: 10px;
}

/* 可选：添加悬停效果 */
.floating-edit-button .el-button {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.floating-edit-button .el-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}
.upload-demo {
  width: 100%;
}

/* 同案件合同样式 */
.card {
  margin-bottom: 16px;
  overflow: visible; /* 确保边框效果可见 */
}

.info-tip {
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
  padding: 8px 12px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
}

.info-tip i {
  font-size: 16px;
  color: #409eff;
  margin-right: 5px;
}

.card-body {
  overflow: visible; /* 确保边框效果可见 */
}

.related-contracts-container {
  width: 100%;
  // margin-bottom: 10px;
  overflow: visible; /* 改为visible允许边框显示 */
  padding: 2px; /* 额外添加内边距防止边框被裁剪 */
}

.related-contracts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px; /* 调整间距 */
  padding: 2px; /* 添加内边距以容纳边框效果 */
  width: 100%;
  box-sizing: border-box;
  overflow: visible; /* 确保边框效果可见 */
}

.related-contract-item {
  display: flex;
  flex-direction: column;
  height: 110px;
  border-radius: 8px;
  background-color: #f5f7fa;
  border: 1px solid #e6e9f0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1; /* 添加z-index确保悬停效果可见 */
  margin: 1px; /* 添加边距确保边框显示 */
}

.related-contract-item:hover {
  background-color: #eef3ff;
  border-color: #2e5bff;
  border-width: 1px;
  margin: 0; /* 悬停时减少边距补偿边框增加的宽度 */
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(46, 91, 255, 0.2);
  z-index: 2; /* 悬停时提高z-index确保边框不被遮挡 */
}

.related-contract-item.current-contract {
  background-color: #f0f8ff; /* 更温和的背景色 */
  border: 1px solid #bed4ff; /* 更柔和的边框颜色 */
  position: relative;
  box-shadow: 0 1px 3px rgba(46, 91, 255, 0.1);
}

.related-contract-item.current-contract::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #5786ff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.related-contract-item.current-contract .contract-name {
  color: #3370ff;
  font-weight: 500;
}

.related-contract-item.current-contract .contract-meta-info {
  color: #5786ff;
}

.related-contract-item.current-contract .contract-reviewer {
  color: #5786ff;
}

.contract-card-content {
  display: flex;
  padding: 12px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.contract-details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
}

.contract-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  margin-bottom: 8px;
  max-height: 36px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.contract-meta-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  width: 100%;
  line-height: 1.2;
}

.contract-reviewer {
  width: 100%;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contract-type,
.contract-undertaker {
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: normal;
}

.contract-undertaker {
  text-align: right;
}

.contract-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  margin-top: auto;
  align-self: flex-start;
}

.contract-status i {
  font-size: 12px;
  margin-right: 4px;
  flex-shrink: 0;
}

.contract-status.pending {
  background-color: #fff5e6;
  color: #ff8a00;
}

.contract-status.approved {
  background-color: #d1fbe7;
  color: #02a762;
}

.contract-status.view {
  background-color: #3370ff;
  color: #fff;
}

@media (min-width: 1600px) {
  .related-contracts-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .related-contracts-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .related-contracts-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .related-contracts-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .related-contract-item {
    height: 125px;
  }

  .contract-reviewer {
    font-size: 10px;
  }
}

@media (max-width: 767px) {
  .related-contracts-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .related-contract-item {
    height: 130px;
  }

  .contract-name {
    font-size: 11px;
    -webkit-line-clamp: 2;
  }

  .contract-type,
  .contract-undertaker,
  .contract-reviewer {
    font-size: 10px;
  }

  .contract-status {
    font-size: 10px;
    padding: 2px 6px;
  }
}

@media (max-width: 480px) {
  .related-contracts-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
