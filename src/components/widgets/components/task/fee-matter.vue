<script>
import { queryFeeTask, queryFeeInfo, submitFee } from "@/api/feeList";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import FeeSidebar from "@/views/finance/finance-fee/detail-sidebar";

export default {
  props: {
    tableHeight:{
      type: Number,
    }
  },
  components: {
    GridView,
    Pagination,
    FeeSidebar
  },
  data() {
    return {
      columnList: [
        { title: "费用科目", value: "feeName" },
        {
          title: "总金额",
          value: "total",
        },
        {
          title: "案件文号",
          value: "showRefno",
        },
        {
          title: "客户",
          value: "TORAY",
        },
        {
          title: "报销人",
          value: "reimburseUserIdStr",
        },
        {
          title: "报销人所属工作组",
          value: "reimburseWkgIdStr",
        },
        {
          title: "费用承担工作组",
          value: "costWkgIdStr",
        },
        {
          title: "操作",
          value: "operate",
        },
      ],
      gridData: [],
      rowInfo: {},
      feeInfo: {},
      showApproval: false,
      failReasion: "",
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
      isShowDetail:false,
      feeId:null,
      isLoading:false
    };
  },
  computed: {},
  watch: {},
  methods: {
    fetchLocalPageSize() {
      const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
      const routeName = 'feeMatter';
      const savedData = pageSizeData.find(item => item.name === routeName);
      if (savedData) {
        return savedData.pageSize
      }else {
        return 10
      }
    },
    passOrReturn(type) {
      if (this.$refs.returnPopover) {
        this.$refs.returnPopover.hide(); // 调用 Element UI 的方法关闭 Popover
      }
      let reqData = JSON.parse(JSON.stringify(this.feeInfo));
      reqData?.feeDetails?.forEach((item) => {
        item.feeId =  reqData.feeId;
        delete item.feetIdList;
        delete item.invoices; // 删除关联发票信息
      });
      reqData.taskIdList = reqData.taskId
      const params = {
        ...reqData,
        failReasion: this.failReasion,
        result: type,
      };
      console.log(params, "params");
      submitFee(params).then((res) => {
        if (res.success) {
          this.$message.success('操作成功');
          this.showApproval = false;
          this.fetchTaskData();
          // this.$emit("getsum");
          this.failReasion = ""
        }
      });
    },
    closeApprovalModal() {
      if (this.$refs.returnPopover) {
        this.$refs.returnPopover.hide(); // 调用 Element UI 的方法关闭 Popover
      }
      this.showApproval = false;
      this.feeInfo = {};
      this.failReasion = "";
    },
    fetchFeeInfo(feeId) {
      queryFeeInfo({ feeId }).then((res) => {
        this.feeInfo = res.data;
      });
    },
    fetchTaskData() {
      this.isLoading = true
      const data = {
        ...this.listQuery
      };
      queryFeeTask(data,{ isLoading : false}).then((res) => {
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
          this.fetchFeeInfo(data.feeId);
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
    toggleSidebar(){
      const id = this.feeInfo.feeId;
      this.feeId = id;
      this.isShowDetail = !this.isShowDetail;
    },
    handleSidebarUpdate(value){
      this.isShowDetail = value;
    }
  },
  created() {
    this.listQuery.pageSize = this.fetchLocalPageSize();
    this.fetchTaskData();
  },
};
</script>
<template>
  <GridView
    gridName="feeMatter"
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
      storageName="feeMatter"
    ></Pagination>
  </div>
  <b-modal
    v-model="showApproval"
    title="审核"
    centered
    hide-footer
    @close="closeApprovalModal"
    content-class="autoWidth-modal"
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
              费用详情 :
            </th>
            <td style="width: 35%;" class="clickable" @click="toggleSidebar">查看</td>
            <th
              scope="row"
              style="width: 15%"
            >
              总金额 :
            </th>
            <td style="width: 35%">{{ feeInfo.total }}</td>
          </tr>
          <tr>
            <th scope="row">费用承担工作组 :</th>
            <td>{{ feeInfo.costWkgIdStr }}</td>
            <th scope="row">报销所属工作组 :</th>
            <td>{{ feeInfo.reimburseWkgIdStr }}</td>
          </tr>
          <tr>
            <th scope="row">客户名称 :</th>
            <td colspan="3">{{ feeInfo.custIdStr }}</td>
          </tr>
          <tr>
            <th scope="row">案件名称 :</th>
            <td
              colspan="3"
              style="white-space: normal"
            >
              {{ feeInfo.caseName }}
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
      <el-popover
        placement="top"
        ref="returnPopover"
        width="250"
        title="退回原因"
        trigger="click"
      >
        <div style="text-align: right">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="failReasion"
          >
          </el-input>
          <b-button
            variant="danger"
            style="margin-top: 6px"
            @click="passOrReturn('0')"
            class="ms-1"
            size="sm"
            >确认退回</b-button
          >
        </div>
        <template #reference>
          <b-button
            variant="danger"
            class="ms-1"
            >退回</b-button
          >
        </template>
      </el-popover>
      <b-button
        variant="success"
        class="ms-1"
        @click="passOrReturn('1')"
        >审核</b-button
      >
    </div>
  </b-modal>
  <FeeSidebar
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    :feeId="feeId"
  />
</template>
