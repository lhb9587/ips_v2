<script>
import {
  fetchList,
  queryRecentBillList,
} from "@/api/billApi";
import { formatAmount } from "@/utils";
import BillSidebar from "@/components/sidebar/bill-sidebar";

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
      isBillDetail: false,
      tabList: [
        { value: 1, label: "最近账单" },
        { value: 2, label: "收款中" },
        { value: 3, label: "收款完毕" },
      ],
      selectedTab: 1,
      billDataList: [],
      busy: false, // 控制加载状态，防止重复触发
      pageNo: 1,
      billId: "",
      caseId: "",
      tableData: [],
      total: 0,
      caseagentNumList: [],
      columns: [
        {
          title: "案件文号",
          value: "agentNumString",
          width: 180,
        },
        {
          title: "客户",
          value: "custShortNameString",
        },
        {
          title: "账单号",
          value: "billNo",
          width: 130,
        },
        {
          title: "账单收入",
          value: "billIn",
          width: 100,
        },
        {
          title: "开单日期",
          value: "billDate",
          width: 120,
        },
      ],
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
  },
  methods: {
    formatAmount,
    changeTab(value) {
      this.selectedTab = value;
      this.pageNo = 1;
      this.busy = false;
      this.billDataList = []
      this.fetchBillList();
    },
    loadMoreData() {
      if (this.busy || this.selectedTab == 1) return;
      this.loading = true
      this.busy = true;
      this.pageNo++;
      const data = {
        pageNo: this.pageNo,
        pageSize: 10,
        paymentStatusArray: [this.selectedTab],
      };
      fetchList(data, { isLoading: false }).then((res) => {
        this.billDataList = this.billDataList.concat(res.data);
        this.loading = false
        if (this.billDataList.length == res.data.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
    },
    fetchRecentBillList() {
      queryRecentBillList().then((res) => {
        this.billDataList = res.data;
        this.loading = false
      });
    },
    toggleBillSidebar(rowInfo) {
      this.billId = rowInfo.billId;
      this.isBillDetail = !this.isSBillDetail;
    },
    billSidebarUpdate(value) {
      this.isBillDetail = value;
    },
    fetchBillList() {
      this.loading = true
      if (this.selectedTab == 1) {
        this.fetchRecentBillList();
      } else {
        const data = {
          pageNo: 1,
          pageSize: 10,
          paymentStatusArray: [this.selectedTab],
        };
        // 获取案件列表
        fetchList(data, { isLoading: false })
          .then((res) => {
            this.billDataList = res.data;
            this.total = res.total;
            this.loading = false
          })
          .catch((err) => {
            console.log(err, "err");
          });
      }
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
    :billId="billId"
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
            <span>账单</span>
            <el-popover
              placement="bottom-start"
              title="账单"
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
          :data="billDataList"
          v-loading="loading"
          element-loading-text="请等待"
          :fit="true"
          show-overflow-tooltip
          @rowClick="toggleBillSidebar"
          :height="contentHeight"
          ref="billTable"
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
              <span v-if="col.value === 'billIn'">{{
                formatAmount(scope.row[col.value])
              }}</span>
              <!-- <div v-if="col.value === 'agentNumString'">
                <el-dropdown
                  trigger="click"
                  :hide-on-click="true"
                  placement="bottom-start"
                  v-if="
                    scope.row.agentNumString?.indexOf('~') != -1 ||
                    scope.row.agentNumString?.indexOf('/') != -1
                  "
                >
                  <span class="agent-number" v-on:click.stop="fetchCaseList(scope.row.billId)">
                    {{ scope.row.agentNumString }}
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu style="max-height: 126px">
                      <el-dropdown-item
                        v-for="item in caseagentNumList"
                        :key="item"
                        @click="queryCaseDetailFunc(item)"
                        >{{ item.agentNum }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <span
                  v-else
                  class="agent-number"
                  v-on:click.stop="toggleCaseSidebar(scope.row)"
                  >{{ scope.row.agentNumString }}</span
                >
              </div> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
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
