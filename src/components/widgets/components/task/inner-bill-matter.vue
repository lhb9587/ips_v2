<script>
import { BillInternalQueryToDoTask } from "@/api/caseList";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import {
  queryBillInternalUrl,
  singleSubmitBillInternalUrl,
} from "@/api/billApi";
import { mapState } from 'vuex'

export default {
  props: {
    tableHeight:{
      type: Number,
    }
  },
  components: {
    GridView,
    Pagination
  },
  data() {
    return {
      columnList: [
        { title: "案件文号", value: "showrefno" },
        {
          title: "案件名称",
          value: "caseName",
        },
        {
          title: "客户",
          value: "custIdString",
        },
        {
          title: "客户组",
          value: "wkgidString",
        },
        {
          title: "承办组",
          value: "costWkgIdString",
        },
        {
          title: "总金额",
          value: "total",
        },
        {
          title: "操作",
          value: "operate",
        },
      ],
      gridData: [],
      showApproval: false,
      rowInfo: {},
      approvalInfo: {},
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
      isLoading: false,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
  },
  watch: {},
  methods: {
    fetchLocalPageSize() {
      const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
      const routeName = 'innerBillMatter';
      const savedData = pageSizeData.find(item => item.name === routeName);
      if (savedData) {
        return savedData.pageSize
      }else {
        return 10
      }
    },
    passOrReturn(type) {
      delete this.approvalInfo.billCost;
      delete this.approvalInfo.billRecords;
      this.approvalInfo.result = type;
      this.approvalInfo.taskIdList = this.approvalInfo.taskId;
      this.approvalInfo.fillinuserid = this.$store.state.user.userId;
      singleSubmitBillInternalUrl(this.approvalInfo)
        .then((res) => {
          if (res.success) {
            res.message && this.$message.success(res.message);
            this.closeApprovalModal();
            this.fetchTaskData();
            this.$emit('getsum')
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    closeApprovalModal() {
      this.showApproval = false;
      this.approvalInfo = {};
    },
    fetchBillInternal(billInternalId) {
      queryBillInternalUrl({ billInternalId }).then((res) => {
        this.approvalInfo = res.data;
      });
    },
    fetchTaskData() {
      this.isLoading = true
      const data = {
        ...this.listQuery,
        userId: this.userId,
      };
      BillInternalQueryToDoTask(data,{ isLoading : false}).then((res) => {
        this.gridData = res.data || [];
        this.total = res.total || 0;
        this.isLoading = false
      });
    },
    cellRenderer(params) {
      if (params.colDef.field == "operate") {
        const clikView = (data) => {
          console.log(data, "data");
          this.rowInfo = data;
          this.showApproval = true;
          this.fetchBillInternal(data.billinterid);
          if (data.pageId == 202) {
            console.log(data, "data");
          }
        };
        window.clikView = clikView;
        const info = JSON.stringify(params.data);
        const operateRender = `<button class="btn btn-soft-primary btn-sm btn-rounded" onclick='clikView(${info})'>处理</button>`;
        if ([202].includes(params.data?.pageId)) {
          return operateRender;
        } else {
          return operateRender;
        }
      }
      return `<span title="${params.value}">${
        params.value || params.value === 0 ? params.value : ""
      }</span>`;
    },
  },
  created() {
    this.listQuery.pageSize = this.fetchLocalPageSize();
    this.fetchTaskData();
  },
};
</script>
<template>
  <GridView
    gridName="innerBillMatter"
    :height="tableHeight"
    :rowHeight="40"
    :columnDefs="columnList"
    :gridData="gridData"
    :cellRenderer="cellRenderer"
    rowSelection="singleRow"
    :isLoading="isLoading"
  />
  <div
    class="mt-3"
    v-if="total"
  >
    <Pagination
      :total="total"
      v-model:page="listQuery.pageNo"
      v-model:limit="listQuery.pageSize"
      @pagination="fetchTaskData"
      :pageSizes="pageSizesList"
      storageName="innerBillMatter"
    ></Pagination>
  </div>
  <b-modal
    v-model="showApproval"
    title="审核"
    centered
    hide-footer
    content-class="autoWidth-modal"
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
              账单详情 :
            </th>
            <td style="width: 35%">查看</td>
            <th
              scope="row"
              style="width: 15%"
            >
              总金额 :
            </th>
            <td style="width: 35%">{{ approvalInfo.total }}</td>
          </tr>
          <tr>
            <th scope="row">承办组 :</th>
            <td>{{ approvalInfo.costWkgIdString }}</td>
            <th scope="row">客户组 :</th>
            <td>{{ approvalInfo.wkgidString }}</td>
          </tr>
          <tr>
            <th scope="row">案件文号 :</th>
            <td>{{ approvalInfo.showrefno }}</td>
            <th scope="row">案件类型 :</th>
            <td>{{ approvalInfo.caseTypeIdString }}</td>
          </tr>
          <tr>
            <th scope="row">客户名称 :</th>
            <td colspan="3">{{ approvalInfo.custIdString }}</td>
          </tr>
          <tr>
            <th scope="row">案件名称 :</th>
            <td
              colspan="3"
              style="white-space: normal"
            >
              {{ approvalInfo.caseName }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="text-end mt-3">
      <b-button
        variant="light"
        @click="closeApprovalModal"
        >取消</b-button
      >
      <b-button
        variant="danger"
        class="ms-1"
        @click="passOrReturn('0')"
        >退回</b-button
      >
      <b-button
        variant="success"
        class="ms-1"
        @click="passOrReturn('1')"
        >审核</b-button
      >
    </div>
  </b-modal>
</template>
