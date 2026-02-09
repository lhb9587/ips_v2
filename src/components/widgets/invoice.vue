<script>
import { queryReceiptList, queryReceiptDetail } from "@/api/caseList";
import { formatAmount } from "@/utils";
import BillSidebar from "@/components/sidebar/bill-sidebar";
import InvoiceDetail from "@/views/finance/invoice-management/invoice_opener/detail";

export default {
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
      isReceiptDetail: false,
      isBillDetail: false,
      tabList: [
        { value: "已完成", label: "已开具" },
        { value: "待开具", label: "待开具" },
      ],
      selectedTab: "已完成",
      ReceiptList: [],
      busy: false, // 控制加载状态，防止重复触发
      pageNo: 1,
      billNo: "",
      receiptId: "",
      tableData: [],
      total: 0,
      columns: [
        {
          title: "账单号",
          value: "billNos",
          width: 180,
        },
        {
          title: "客户",
          value: "custFullName",
        },
        {
          title: "申请日期",
          value: "appDate",
          width: 120,
        },
        {
          title: "发票金额",
          value: "receiptTotal",
          width: 100,
        },
        {
          title: "开票日期",
          value: "optDate",
          width: 120,
        },
      ],
      detailInfo: {},
      loading: false,
      mouseInner: false,
    };
  },
  computed: {
    contentHeight() {
      return this.containerHegiht - 150;
    }
  },
  components: {
    BillSidebar,
    InvoiceDetail,
  },
  methods: {
    formatAmount,
    changeTab(value) {
      this.selectedTab = value;
      this.pageNo = 1;
      this.busy = false;
      this.ReceiptList = [];
      this.fetchBillList();
    },
    loadMoreData() {
      if (this.busy) return;
      this.loading = true
      this.busy = true;
      this.pageNo++;
      const data = {
        pageNo: this.pageNo,
        pageSize: 10,
        wfStatus: this.selectedTab,
      };
      queryReceiptList(data, { isLoading: false }).then((res) => {
        this.ReceiptList = this.ReceiptList.concat(res.data);
        this.loading = false
        if (this.ReceiptList.length == res.data.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
    },
    toggleBillSidebar(billNo) {
      console.log(billNo, 'billNo');
      this.billNo = billNo;
      this.isBillDetail = !this.isBillDetail;
    },
    toggleReceiptSidebar(rowInfo) {
      const id = rowInfo.receiptId;
      this.fetchDetailInfo(id);
      this.isReceiptDetail = !this.isReceiptDetail;
    },
    billSidebarUpdate(value) {
      this.isBillDetail = value;
    },
    fetchBillList() {
      this.loading = true
      const data = {
        pageNo: 1,
        pageSize: 10,
        wfStatus: this.selectedTab,
      };
      // 获取案件列表
      queryReceiptList(data, { isLoading: false })
        .then((res) => {
          this.ReceiptList = res.data;
          this.total = res.total;
          this.loading = false
        })
        .catch((err) => {
          console.log(err, "err");
        });
    },
    fetchDetailInfo(id) {
      queryReceiptDetail({ receiptId: id })
        .then((res) => {
          if (res.success) {
            this.detailInfo = res.data || {};
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
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
      } else {
        this.mouseInner = false;
      }
    },
  },
  mounted() {
    this.fetchBillList();
    // 表格添加滚动事件
  },
};
</script>

<template>
  <BillSidebar
    v-if="isBillDetail"
    :showSidebar="isBillDetail"
    @update:showSidebar="billSidebarUpdate"
    :billNo="billNo"
  />
  <div 
    class="card"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body">
      <div class="d-sm-flex">
        <div class="mb-4 d-flex align-items-center gap-1">
          <h4 class="card-title mb-0">
            <span>发票</span>
            <el-popover
              placement="bottom-start"
              title="发票"
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
        </div>
      </div>
      <b-tabs
        pills
        nav-class="bg-light rounded"
        content-class="mt-3"
      >
        <b-tab
          :title="item.label"
          v-model="selectedTab"
          v-for="item of tabList"
          :key="item.value"
          @click="changeTab(item.value)"
        >
        </b-tab>
      </b-tabs>
      <div
        class="table-responsive"
        :style="{ height: `${contentHeight}px` }"
      >
        <el-table
          :data="ReceiptList"
          :fit="true"
          @rowClick="toggleReceiptSidebar"
          v-loading="loading"
          element-loading-text="请等待"
          :height="contentHeight"
          ref="invoiceTable"
          v-el-table-infinite-scroll="loadMoreData"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="2"
          :infinite-scroll-immediate="false"
          :scrollbar-always-on="true"
          :row-style="{ cursor: 'pointer' }"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <span v-if="col.value === 'receiptTotal'">{{
                formatAmount(scope.row[col.value])
              }}</span>
              <!-- <div
                v-if="col.value === 'billNos'"
                class="agent-number"
              >
                <el-dropdown
                  placement="bottom-start"
                  v-if="scope.row.billNos&&scope.row.billNos.split(';').length > 1"
                >
                  <div class="agent-number" style="line-height: 24px;">{{ scope.row.billNos }}</div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item of scope.row.billNos.split(';')"
                        :key="item"
                        v-on:click.stop="toggleBillSidebar(item)"
                        >{{ item }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template> </el-dropdown
                ><span v-else v-on:click.stop="toggleBillSidebar(scope.row.billNos)">{{ scope.row.billNos }}</span>
              </div> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <b-modal
    v-model="isReceiptDetail"
    title="发票查看"
    centered
    size="lg"
    hide-footer
    style="z-index: 1040"
  >
    <InvoiceDetail :detailInfo="detailInfo"
  /></b-modal>
</template>

<style scoped lang="scss">
.agent-number {
  cursor: pointer;
  color: #556ee6 !important;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
