<template>
  <div 
    class="card h-100 w-100"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <LoadingOverlay :loading="loading" />
    <div class="card-body h-100 w-100">
      <div class="float-end ml-2">
        <span class="badge rounded-pill font-size-12 badge-soft-primary">{{
          total
        }}</span>
      </div>
      <span class="drag-column-header">
        <h4 class="card-title todo-header">
          <span>案件待办</span>
          <el-popover
            placement="bottom-start"
            title="案件待办"
            :width="350"
            trigger="hover"
            :content="cardDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i v-show="cardDesc&&mouseInner" class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;margin-left: 4px;"></i>
            </template>
          </el-popover>
        </h4>
      </span>
      <el-divider style="margin: 15px 0" />
      <div
        v-if="dataList.length > 0"
        :style="{ height: contentHeight + 'px', overflow: 'auto' }"
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="busy"
        :infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
      >
        <div
          v-for="(task, index) in dataList"
          :key="index"
          class="card task-box"
          :style="{'margin-bottom':'10px','cursor':[100,102,108,150,151].includes(task.pageId)?'pointer':'default'}"
          @click="handleClick(task)"
        >
          <div class="card-body">
            <div>
              <h5 class="font-size-15">
                <a
                  href="javascript: void(0);"
                  class="text-dark"
                  >{{ task.proceeName }}</a
                >
              </h5>
            </div>
            <div class="float-end ml-2">
              <div class="text-end">
                <div
                  class="font-size-14"
                  style="font-weight: 400"
                >
                  {{ task.custName }}
                </div>
              </div>
            </div>
            <div class="text-muted">
              {{ task.tmName ? task.tmName : task.caseType }}
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无数据" :image-size="90"/>
    </div>
    <b-modal
      v-model="preFilingApprovalModal"
      title="预立案审批"
      centered
      hide-footer
      @close="closeModal"
      size="lg"
      style="z-index: 1040"
    >
      <div class="table-responsive">
        <table
          class="table table-td-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                案件类型 :
              </th>
              <td style="width: 35%">{{ detailInfo.caseType }}</td>
              <th
                scope="row"
                style="width: 15%"
              >
                预立卷文号 :
              </th>
              <td style="width: 35%" class="clickable" @click="showCaseDetail">{{ detailInfo.agentNum }}</td>
            </tr>
            <tr>
              <th scope="row">客户名称 :</th>
              <td class="clickable" @click="isCustomerDetail = true">{{ detailInfo.name }}</td>
              <th scope="row">客户信用等级 :</th>
              <td>{{ detailInfo.level }}</td>
            </tr>
            <tr>
              <th scope="row">商标名称 :</th>
              <td colspan="3">{{ detailInfo.tmName }}</td>
            </tr>
            <tr>
              <th scope="row">上传文件 :</th>
              <td colspan="3">
                <div
                  v-for="(item, key) in materialList"
                  :key="key"
                >
                  <p class="fileName">
                    <a
                      :href="`/ipdoc${item.address}`"
                      target="_blank"
                      >{{ item.name }}</a
                    >
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">提交说明 :</th>
              <td colspan="3">{{ detailInfo.data?.appNote }}</td>
            </tr>
            <tr>
              <th scope="row">提交人 :</th>
              <td>{{ detailInfo.data?.submitUser }}</td>
              <th scope="row">提交日期 :</th>
              <td>{{ detailInfo.data?.submitDate }}</td>
            </tr>
            <tr>
              <th scope="row">审批人 :</th>
              <td colspan="3">{{ userName }}</td>
            </tr>
            <tr>
              <th scope="row">审批意见 :</th>
              <td colspan="3">
                <el-input
                  id="auditNote"
                  type="textarea"
                  v-model="auditNote"
                  placeholder="请输入审批意见"
                  :rows="3"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-end mt-3">
        <b-button
          variant="light"
          @click="closeModal"
          >取消</b-button
        >
        <b-button
          variant="danger"
          class="ms-1"
          @click="passOrReturnHandle(0)"
          >退回</b-button
        >
        <b-button
          variant="success"
          class="ms-1"
          @click="passOrReturnHandle(1)"
          >通过</b-button
        >
      </div>
    </b-modal>
    <b-modal
      v-model="lowCreditModal"
      title="低信用审核"
      centered
      hide-footer
      size="lg"
    >
      <el-alert
        title="客户信用较差，通过审核将对未来产生的坏账负责，请慎重操作！"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="table-responsive">
        <table
          class="table table-td-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                客户 :
              </th>
              <td style="width: 85%">{{ detailInfo.custName }}</td>
            </tr>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                案件类型 :
              </th>
              <td style="width: 85%">{{ detailInfo.caseType }}</td>
            </tr>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                案件个数 :
              </th>
              <td style="width: 85%">{{ detailInfo.caseNumber }}</td>
            </tr>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                商标名称 :
              </th>
              <td style="width: 85%">{{ detailInfo.tmName }}</td>
            </tr>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                备注 :
              </th>
              <td style="width: 85%">{{ detailInfo.memo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-end mt-3">
        <b-button
          variant="danger"
          class="ms-1"
          @click="lowCreditAuditHandle(0)"
          >退回</b-button
        >
        <b-button
          variant="success"
          class="ms-1"
          @click="lowCreditAuditHandle(1)"
          >通过</b-button
        >
      </div>
    </b-modal>
    <CaseSidebar
      v-if="isCaseDetail"
      :showSidebar="isCaseDetail"
      @update:showSidebar="handleSidebarUpdate"
      :caseId="detailInfo.caseId"
      :taskType="1"
    />
    <CustomerSidebar
      :custId="detailInfo.custId"
      v-if="isCustomerDetail"
      :showSidebar="isCustomerDetail"
      @update:showSidebar="handleCustomerUpdate"
    />
  </div>
</template>

<script>
import {
  queryAlltask,
  preCaseApproval,
  passOrReturn,
  lowCreditAudit,
  queryMaterialByCaseIdUrl,
} from "@/api/caseList";
import dayjs from "dayjs";
import LoadingOverlay from "@/components/common/loading";
import { mapState } from "vuex";
export default {
  components: { LoadingOverlay },
  props: {
    containerHegiht: {
      type: Number,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      dataList: [],
      busy: false,
      total: 0,
      pageNo: 1,
      loading: false,
      detailInfo: {},
      auditNote: undefined,
      preFilingApprovalModal: false,
      lowCreditModal: false,
      materialList: [],
      isCaseDetail: false,
      isCustomerDetail: false,
      mouseInner: false,
    };
  },
  watch: {
    userId: {
      handler() {
        this.fetchData();
      },
    },
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
      userName: (state) => state.user.name,
    }),
    contentHeight() {
      return this.containerHegiht - 86;
    },
  },
  methods: {
    dayjs,
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow"
        ];
        let isLeave = true;
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
        if (event.relatedTarget.classList.length == 0) {
          isLeave = false;
        }
        if (isLeave) {
          this.$nextTick(() => {
            if (this.$refs.descPopoverRef) {
              this.$refs.descPopoverRef.hide();
            }
            setTimeout(() => {
              this.mouseInner = false;
            }, 100);
          });
        }
      }else{
        this.mouseInner = false;
      }
    },
    showCaseDetail() {
      this.isCaseDetail = true;
    },
    handleClick(task) {
      if (task.pageId == 102) {
        this.fetchpreCaseApproInfo(task.taskId);
        this.fetchMaterialByCaseId(task.caseId);
        this.preFilingApprovalModal = true;
      } else if (task.pageId == 108) {
        this.detailInfo = task;
        this.lowCreditModal = true;
      } else if (
        task.pageId == 100 ||
        task.pageId == 150 ||
        task.pageId == 151
      ) {
        this.detailInfo = task;
        this.isCaseDetail = true;
      }
    },
    fetchpreCaseApproInfo(taskId) {
      const params = {
        taskId,
        userId: this.userId,
      };
      preCaseApproval(params).then((res) => {
        if (res.success) {
          this.detailInfo = res.data;
        }
      });
    },
    closeModal() {
      this.preFilingApprovalModal = false;
    },
    passOrReturnHandle(result) {
      const data = {
        taskId: this.detailInfo.taskId,
        userId: this.userId,
        result,
        taskType: this.detailInfo.taskType,
        caseId: this.detailInfo.caseId,
        auditUserId: this.detailInfo?.data?.userId,
        auditId: this.detailInfo?.data?.auditId,
        auditNote: this.auditNote,
        submitUserId: this.detailInfo?.data?.submitUserId,
        draftNumber: this.detailInfo?.data?.draftNumber,
        tmCaseId: this.detailInfo.tmCaseId,
      };
      passOrReturn(data).then((res) => {
        if (res.success) {
          this.preFilingApprovalModal = false;
          res.message && this.$message.success(res.message);
          this.fetchData();
        }
      });
    },
    lowCreditAuditHandle(audit) {
      const data = {
        taskIdList: [this.detailInfo.taskId],
        userId: this.userId,
        result: audit,
      };
      lowCreditAudit(data).then((res) => {
        if (res.success) {
          this.lowCreditModal = false;
          res.message && this.$message.success(res.message);
          this.fetchData();
        }
      });
    },
    fetchMaterialByCaseId(caseId) {
      queryMaterialByCaseIdUrl({ caseIds: caseId }).then((res) => {
        if (res.data) {
          this.materialList = res.data[0]?.materialArray || [];
        }
      });
    },
    loadMore() {
      this.loading = true;
      this.busy = true;
      this.pageNo++;
      const params = {
        pageNo: this.pageNo,
        pageSize: 10,
        userId: this.userId,
        taskType: 1,
      };
      queryAlltask(params).then((res) => {
        this.dataList = this.dataList.concat(res.data) || [];
        this.loading = false;
        if (this.dataList?.length == res.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
    },
    handleSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    handleCustomerUpdate(value) {
      this.isCustomerDetail = value;
    },
    fetchData() {
      this.loading = true;
      const params = {
        pageSize: 100,
        pageNo: 1,
        userId: this.userId,
        taskType: 1,
      };
      queryAlltask(params).then((res) => {
        this.dataList = res.data || [];
        this.total = res.total;
        this.loading = false;
        if (this.dataList?.length == res.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
    },
  },
  created() {
    if (this.userId) {
      this.fetchData();
    }
  },
};
</script>

<style scoped lang="scss">
.todo-header {
  display: flex;
  align-items: center;
}
</style>
