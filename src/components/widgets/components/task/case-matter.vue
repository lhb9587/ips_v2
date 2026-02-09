<script>
// import OrdinaryTable from "@/components/common/OrdinaryTable/index";
import {
  queryAlltask,
  queryMaterialByCaseIdUrl,
  lowCreditAudit,
  passOrReturn,
  preCaseApproval,
} from "@/api/caseList";
import GridView from "@/components/common/grid-table/index.vue";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import Pagination from "@/components/common/pagination/index.vue";
// import { userComputed } from '@/state/helpers'
import { mapState } from "vuex";

export default {
  props: {
    tableHeight:{
      type: Number,
    }
  },
  components: {
    CaseSidebar,
    GridView,
    Pagination,
  },
  data() {
    return {
      columnList: [
        { title: "案件文号", value: "agentNum" },
        {
          title: "案件类型",
          value: "caseType",
        },
        {
          title: "案件名称",
          value: "tmName",
        },
        {
          title: "客户",
          value: "custName",
        },
        {
          title: "申请人",
          value: "appCnName",
        },
        {
          title: "案件最新进展",
          value: "proceeName",
        },
        {
          title: "案件阶段",
          value: "stageName",
        },
        {
          title: "操作",
          value: "operate",
        },
      ],
      gridData: [],
      preFilingApprovalModal: false,
      detailInfo: {},
      materialList: [],
      lowCreditModal: false,
      isCaseDetail: false,
      auditNote: "",
      rowInfo: {},
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
      isLoading: false,
      isCustomerDetail: false,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
      userName: (state) => state.user.name,
    }),
  },
  watch: {
    userId: {
      handler() {
        this.fetchTaskData();
      },
    },
    containerHegiht:{
      handler(values){
        console.log(values,'height2222');
      }
    }
  },
  methods: {
    fetchLocalPageSize() {
      const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
      const routeName = 'mtCaseMatter';
      const savedData = pageSizeData.find(item => item.name === routeName);
      if (savedData) {
        return savedData.pageSize
      }else {
        return 10
      }
    },
    passOrReturn(result) {
      const data = {
        taskId: this.rowInfo.taskId,
        userId: this.userId,
        result,
        taskType: this.rowInfo.taskType,
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
          this.fetchTaskData();
          // this.$emit("getsum");
        }
      });
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
    fetchTaskData() {
      this.isLoading = true
      const data = {
        ...this.listQuery,
        userId: this.userId,
        taskType: 1,
      };
      queryAlltask(data,{ isLoading : false })
        .then((res) => {
          this.gridData = res.data || [];
          this.total = res.total || 0;
          this.isLoading = false
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cellRenderer(params) {
      if (params.colDef.field == "operate") {
        const clikView = (data) => {
          this.rowInfo = data;
          if (data.pageId == 102) {
            this.fetchpreCaseApproInfo(data.taskId);
            this.fetchMaterialByCaseId(data.caseId);
            this.preFilingApprovalModal = true;
          } else if (data.pageId == 108) {
            this.detailInfo = data;
            this.lowCreditModal = true;
          } else if (
            data.pageId == 100 ||
            data.pageId == 150 ||
            data.pageId == 151
          ) {
            this.isCaseDetail = true;
          }
        };
        window.clikView = clikView;
        const info = JSON.stringify(params.data);
        const operateRender = `<button class="btn btn-soft-primary btn-sm btn-rounded" onclick='clikView(${info})'>处理</button>`;
        if ([102, 108, 100, 150, 151].includes(params.data?.pageId)) {
          return operateRender;
        } else {
          return "";
        }
      }
      return `<span title="${params.value}">${
        params.value || params.value === 0 ? params.value : ""
      }</span>`;
    },
    fetchMaterialByCaseId(caseId) {
      queryMaterialByCaseIdUrl({ caseIds: caseId }).then((res) => {
        if (res.data) {
          this.materialList = res.data[0]?.materialArray || [];
        }
      });
    },
    closeModal() {
      this.preFilingApprovalModal = false;
    },
    lowCreditAudit(audit) {
      const data = {
        taskIdList: [this.rowInfo.taskId],
        userId: this.userId,
        result: audit,
      };
      lowCreditAudit(data).then((res) => {
        if (res.success) {
          this.lowCreditModal = false;
          res.message && this.$message.success(res.message);
          this.fetchTaskData();
          // this.$emit("getsum");
        }
      });
    },
    handleSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    handleCustomerUpdate(value) {
      this.isCustomerDetail = value;
    },
  },
  created() {
    this.listQuery.pageSize = this.fetchLocalPageSize();
    if (this.userId) {
      this.fetchTaskData();
    }
  },
};
</script>
<template>
  <!-- <el-table
    :data="gridData"
    :max-height="300"
    :fit="true"
  >
    <el-table-column
      :prop="col.value"
      :label="col.title"
      v-for="col of columns"
      :key="col.value"
    />
  </el-table> -->
  <GridView
    gridName="mtCaseMatter"
    :height="tableHeight"
    :rowHeight="40"
    :columnDefs="columnList"
    :gridData="gridData"
    :cellRenderer="cellRenderer"  
    rowSelection="singleRow"
    v-if="columnList.length>0"
    :isLoading="isLoading"
  />
  <div class="mt-3" v-if="total">
    <Pagination
      :total="total"
      v-model:page="listQuery.pageNo"
      v-model:limit="listQuery.pageSize"
      @pagination="fetchTaskData"
      :pageSizes="pageSizesList"
      storageName="mtCaseMatter"
    ></Pagination>
  </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="handleSidebarUpdate"
    :caseId="rowInfo.caseId"
    :taskType="1"
  />
  <CustomerSidebar
    :custId="detailInfo.custId"
    v-if="isCustomerDetail"
    :showSidebar="isCustomerDetail"
    @update:showSidebar="handleCustomerUpdate"
  />
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
            <td style="width: 35%" class="clickable">{{ detailInfo.agentNum }}</td>
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
        @click="passOrReturn(0)"
        >退回</b-button
      >
      <b-button
        variant="success"
        class="ms-1"
        @click="passOrReturn(1)"
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
    style="z-index: 1040"
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
        @click="lowCreditAudit(0)"
        >退回</b-button
      >
      <b-button
        variant="success"
        class="ms-1"
        @click="lowCreditAudit(1)"
        >通过</b-button
      >
    </div>
  </b-modal>
</template>
