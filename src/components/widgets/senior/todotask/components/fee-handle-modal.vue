<template>
  <b-modal
    v-model="showModal"
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
            <td
              style="width: 35%"
              class="clickable"
              @click="toggleSidebar"
            >
              查看
            </td>
            <th
              scope="row"
              style="width: 15%"
            >
              总金额 :
            </th>
            <td style="width: 35%">{{ dataDetail.total }}</td>
          </tr>
          <tr>
            <th scope="row">费用承担工作组 :</th>
            <td>{{ dataDetail.costWkgIdStr }}</td>
            <th scope="row">报销所属工作组 :</th>
            <td>{{ dataDetail.reimburseWkgIdStr }}</td>
          </tr>
          <tr>
            <th scope="row">客户名称 :</th>
            <td colspan="3">{{ dataDetail.custIdStr }}</td>
          </tr>
          <tr>
            <th scope="row">案件名称 :</th>
            <td
              colspan="3"
              style="white-space: normal"
            >
              {{ dataDetail.caseName }}
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
    <FeeSidebar
      v-if="isShowDetail"
      :showSidebar="isShowDetail"
      @update:showSidebar="handleSidebarUpdate"
      :feeId="feeId"
    />
  </b-modal>
</template>

<script>
import FeeSidebar from "@/views/finance/finance-fee/detail-sidebar";
import { submitFee } from "@/api/feeList";
export default {
  components: {
    FeeSidebar,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    dataDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      feeId: undefined,
      isShowDetail: false,
      failReasion: undefined,
    };
  },
  computed: {
    showModal() {
      return this.modelValue;
    },
  },
  watch: {
    showModal: {
      handler(val) {
        if (!val) {
          if (this.$refs.returnPopover) {
            this.$refs.returnPopover.hide(); // 调用 Element UI 的方法关闭 Popover
          }
        }
      },
    },
  },
  methods: {
    closeApprovalModal() {
      this.$emit("update:modelValue", false);
    },
    toggleSidebar() {
      const id = this.dataDetail.feeId;
      this.feeId = id;
      this.isShowDetail = !this.isShowDetail;
    },
    handleSidebarUpdate(value) {
      this.isShowDetail = value;
    },
    passOrReturn(type) {
      let reqData = JSON.parse(JSON.stringify(this.dataDetail));
      reqData?.feeDetails?.forEach((item) => {
        item.feeId = reqData.feeId;
        delete item.feetIdList;
        delete item.invoices; // 删除关联发票信息
      });
      reqData.taskIdList = reqData.taskId;
      const params = {
        ...reqData,
        failReasion: this.failReasion,
        result: type,
      };
      submitFee(params).then((res) => {
        if (res.success) {
          this.$message.success("操作成功");
          this.closeApprovalModal()
          this.failReasion = "";
          this.$emit("refresh");
        }
      });
    },
  },
};
</script>
