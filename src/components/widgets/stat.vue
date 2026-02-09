<script>
/**
 * Stat component -- specify the widget icon, title and value.
 */
import { getTimelimitList, getTimelimitNum } from "@/api/caseList.js";
import dayjs from "dayjs";
import LimitDetail from "@/components/sidebar/components/limit/detail";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";

export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    showDetail: {
      type: Boolean,
      default: false,
    },
    helpText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showListModal: false,
      showDetailModal: false,
      busy: false, // 控制加载状态，防止重复触发
      pageNo: 1,
      columnDefs: [],
      gridData: [],
      detail: {},
      timelimitSum: 0,
      caseId: "",
      taskType: 1,
      isCaseDetail: false,
      custId: "",
      isCustDetail: false,
      limitListLoading: false,
      mouseInner:false
    };
  },
  computed: {
    tltTypeIdList() {
      let data = [];
      switch (this.title) {
        case "专利年费":
          data = [118, 300173, 300176];
          break;
        case "合同到期":
          data = [4];
          break;
        default:
          break;
      }
      return data;
    },
    columns() {
      let col = [];
      const caseCloumns = [
        { title: "案件文号", value: "agentNum", width: 165 },
        {
          title: "案件类型",
          value: "caseTypeName",
          width: 100,
        },
        {
          title: "客户",
          value: "custName",
        },
        { title: "时限类型", value: "typeName" },
        {
          title: "绝限日期",
          value: "abslimitDate",
          width: 120,
        },
        {
          title: "操作",
          value: "operate",
        },
      ];
      const patentCloumns = [
        { title: "专利类型", value: "patentTypeStr" },
        { title: "专利名称", value: "caseName" },
        { title: "客户", value: "custName" },
        { title: "到期时间", value: "abslimitDate" },
        { title: "状态", value: "statusStr" },
      ];
      const contractCloumns = [
        { title: "客户", value: "custName" },
        { title: "到期时间", value: "abslimitDate" },
        { title: "状态", value: "statusStr" },
      ];
      switch (this.title) {
        case "专利年费":
          col = patentCloumns;
          break;
        case "合同到期":
          col = contractCloumns;
          break;
        case "案件时限":
          col = caseCloumns;
          break;
        default:
          break;
      }
      return col;
    },
  },
  components: {
    LimitDetail,
    CaseSidebar,
    CustomerSidebar,
  },
  methods: {
    dayjs,
    clickDetil() {
      this.showListModal = true;
      this.fetchData();
      this.limitListLoading = true;
    },
    fetchData() {
      const data = {};
      if (this.title == "案件时限") {
        data.excludetltTypeIdList = [118, 300173, 300176, 4];
      } else {
        data.tltTypeIdList = this.tltTypeIdList;
      }
      getTimelimitList({ pageNo: 1, pageSize: 10, ...data }).then((res) => {
        this.limitListLoading = false;
        this.gridData = res.data;
      });
    },
    viewDetail(data) {
      this.detail = data;
      this.showDetailModal = true;
    },
    loadMoreData() {
      this.limitListLoading = true;
      this.busy = true;
      this.pageNo++;
      const data = {};
      if (this.title == "案件时限") {
        data.excludetltTypeIdList = [118, 300173, 300176, 4];
      } else {
        data.tltTypeIdList = this.tltTypeIdList;
      }
      getTimelimitList({ pageNo: this.pageNo, pageSize: 10, ...data }).then(
        (res) => {
          this.limitListLoading = false;
          this.gridData = this.gridData.concat(res.data);
          if (this.gridData.length == res.data.total) {
            this.busy = true;
          } else {
            this.busy = false;
          }
        }
      );
    },
    fetchNum() {
      getTimelimitNum({ tltTypeIdList: this.tltTypeIdList }).then((res) => {
        this.timelimitSum = res.data.timelimitSum || 0;
      });
    },
    toggleCaseSidebar(rowInfo) {
      this.taskType = rowInfo.taskType;
      this.caseId = rowInfo.caseId;
      this.isCaseDetail = true;
    },
    caseSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    toggleCustSidebar(rowInfo) {
      this.custId = rowInfo.custId;
      this.isCustDetail = true;
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
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
      }else{
        this.mouseInner = false;
      }
    },
  },
  mounted() {
    this.fetchNum();
  },
};
</script>

<template>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
  <CustomerSidebar
    :custId="custId"
    v-if="isCustDetail"
    :showSidebar="isCustDetail"
    @update:showSidebar="custSidebarUpdate"
  />
  <div
    class="card mini-stats-wid"
    style="height: 100%"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="card-body"
      v-on:click="clickDetil"
      style="cursor: pointer"
    >
      <div class="d-flex">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center mb-2 gap-1">
            <a
              v-if="showDetail"
              href="javascript: void(0);"
              ><p class="text-muted fw-medium mb-0">{{ title }}</p></a
            >
            <p
              v-else
              class="text-muted fw-medium"
            >
              {{ title }}
            </p>
            <el-popover
              placement="bottom-start"
              :width="350"
              trigger="hover"
              :content="helpText"
            >
              <template #reference>
                <i
                  v-if="helpText && mouseInner"
                  class="bx bx-help-circle"
                  style="font-size: 14px; cursor: pointer"
                ></i>
              </template>
            </el-popover>
          </div>

          <h4 class="mb-0">{{ timelimitSum }}</h4>
        </div>

        <div
          class="avatar-sm align-self-center mini-stat-icon rounded-circle bg-primary"
        >
          <span class="avatar-title">
            <i :class="`${icon} font-size-24`"></i>
          </span>
        </div>
      </div>
    </div>
    <!-- end card-body -->
  </div>
  <!-- end card -->
  <b-modal
    v-model="showListModal"
    :title="title"
    centered
    size="lg"
    hide-footer
    content-class="limit-container"
    style="z-index: 1040"
  >
    <div
      class="table-responsive mb-0"
      style="height: 405px"
    >
      <el-table
        :data="gridData"
        :fit="true"
        height="400"
        show-overflow-tooltip
        v-el-table-infinite-scroll="loadMoreData"
        infinite-scroll-disabled="busy"
        infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
        v-loading="limitListLoading"
        element-loading-text="请等待"
        :scrollbar-always-on="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :width="col.width ? col.width : 'auto'"
        >
          <template #default="scope">
            <button
              v-if="col.value == 'operate'"
              type="button"
              class="btn btn-soft-primary btn-sm btn-rounded"
              @click="viewDetail(scope.row)"
            >
              查看详情
            </button>
            <span v-if="col.value == 'statusStr'">
              {{
                dayjs(scope.row.abslimitDate)
                  .startOf()
                  .isAfter(dayjs().subtract(1, "day"))
                  ? "即将到期"
                  : "已到期"
              }}
            </span>
            <span
              v-if="col.value == 'agentNum'"
              class="agent-number"
              v-on:click.stop="toggleCaseSidebar(scope.row)"
              >{{ scope.row.agentNum }}</span
            >
            <span
              v-if="col.value == 'custName'"
              class="agent-number"
              v-on:click.stop="toggleCustSidebar(scope.row)"
              >{{ scope.row.custName }}</span
            >
          </template></el-table-column
        >
      </el-table>
      <!-- <table
        class="table align-middle table-nowrap"
        v-infinite-scroll="loadMoreData"
        infinite-scroll-disabled="busy"
        infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
      >
        <thead class="table-light">
          <tr>
            <th
              class="align-middle"
              v-for="col of columns"
              :key="col.value"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="data in gridData"
            :key="data.id"
          >
            <td
              v-for="item of columns"
              :key="item.value"
              style="height: 52px"
            >
              <template v-if="item.value === 'operate'">
                <button
                  type="button"
                  class="btn btn-soft-primary btn-sm btn-rounded"
                  @click="viewDetail(data)"
                >
                  查看详情
                </button>
              </template>
              <template v-else-if="item.value === 'statusStr'">
                {{
                  dayjs(data.abslimitDate)
                    .startOf()
                    .isAfter(dayjs().subtract(1, "day"))
                    ? "即将到期"
                    : "已到期"
                }}
              </template>
              <template v-else>
                {{ data[item.value] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table> -->
    </div>
  </b-modal>
  <b-modal
    v-model="showDetailModal"
    title="时限详情"
    centered
    hide-footer
    content-class="autoWidth-modal"
    style="z-index: 1041"
  >
    <LimitDetail :detail="detail" />
  </b-modal>
</template>
<style scoped lang="scss">
.agent-number {
  cursor: pointer;
  color: #556ee6 !important;
}

@media screen and (max-width: 550px) {
  .card-body .avatar-sm {
    display: none;
  }
}
</style>
