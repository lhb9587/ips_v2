<template>
  <div
    class="card"
    style="height: 100%"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <LoadingOverlay :loading="loading"></LoadingOverlay>
    <div class="card-body">
      <div class="mb-4 d-flex align-items-center gap-1">
        <h4 class="card-title mb-0">
          <span>待办任务</span>
          <el-popover
            placement="bottom-start"
            title="待办任务"
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
      <b-tabs
        pills
        nav-class="bg-light rounded"
        content-class="mt-2"
      >
        <b-tab
          :title="`${item.label}（${item.num}）`"
          v-model="selectedTab"
          v-for="item of taskList"
          :key="item.value"
          @click="changeTab(item.value)"
        >
        </b-tab>
      </b-tabs>
      <component
        :is="selectedTab"
        :tableHeight="tableHeight"
      ></component>
    </div>
  </div>
</template>

<script>
import CaseMatter from "./components/task/case-matter";
import BillMatter from "./components/task/bill-matter";
import InnerBillMatter from "./components/task/inner-bill-matter";
import FeeMatter from "./components/task/fee-matter";
import WorkTimeMatter from "./components/task/work-time-matter";
import LoadingOverlay from "@/components/common/loading";

import { getSum } from "@/api/caseList";
export default {
  props: {
    containerHegiht: {
      type: Number,
      default: 500,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  components: {
    CaseMatter,
    BillMatter,
    InnerBillMatter,
    FeeMatter,
    WorkTimeMatter,
    LoadingOverlay,
  },
  data() {
    return {
      loading: false,
      taskList: [
        {
          numValue: "caseMatterSum",
          value: "CaseMatter",
          label: "案件待办",
          num: 0,
        },
        // {
        //   numValue: "ldCaseMatterSum",
        //   value: "OtherCaseMatter",
        //   label: "其他案件待办",
        //   num: 0,
        // },
        {
          numValue: "billMatterSum",
          value: "BillMatter",
          label: "账单待办",
          num: 0,
        },
        {
          numValue: "billInternalMatterSum",
          value: "InnerBillMatter",
          label: "内部账单待办",
          num: 0,
        },
        {
          numValue: "feeMatterSum",
          value: "FeeMatter",
          label: "费用待办",
          num: 0,
        },
        {
          numValue: "worhourMatterSum",
          value: "WorkTimeMatter",
          label: "待审工时",
          num: 0,
        },
      ],
      selectedTab: "CaseMatter",
      mouseInner: false,
    };
  },
  computed: {
    tableHeight() {
      return this.containerHegiht - 175;
    },
  },
  methods: {
    changeTab(value) {
      this.selectedTab = value;
    },
    fetchNum() {
      this.loading = true;
      getSum({}, { isloading: false }).then((res) => {
        this.taskList.forEach((item) => {
          item.num = res.data[item.numValue];
        });
        this.taskList.sort((a, b) => b.num - a.num);
        this.selectedTab = this.taskList[0].value;
        this.loading = false;
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
  created() {
    this.fetchNum();
  },
};
</script>

<style scoped>
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
