<template>
  <b-modal
    v-model="show"
    centered
    hide-footer
    size="xl"
    :no-close-on-esc="true"
    :lazy="true"
    dialog-class="fee-modal"
    :no-close-on-backdrop="true"
    @hidden="handleHidden"
    body-class="p-0"
  >
    <template #header>
      <h5 class="offcanvas-title" id="offcanvasRightLabel">
        {{ feeInfo.beginDate }} - {{ feeInfo.reimburseUserIdStr }}
      </h5>
      <button type="button" class="btn-close" @click="handleHidden()"></button>
    </template>
    <div class="fee-dialog-content">
      <FeeDetail :feeInfo="feeInfo" />
      <FeeBaseInfo :feeInfo="feeInfo" />
      <FeeProcess :progressData="progressData" />
    </div>
  </b-modal>
</template>
<script>
import { queryFeeInfo, queryFeeTypeList } from "@/api/feeList";
import { queryBillTaskRecord } from "@/api/billApi";
import FeeDetail from "@/views/finance/finance-fee/componens/fee-detail";
import FeeBaseInfo from "@/views/finance/finance-fee/componens/fee-info";
import FeeProcess from "@/views/finance/finance-fee/componens/fee-process";
import { getMenuName, getTwoDimensionalArray } from "@/utils";
// import { setSidebarWidth,getSidebarWidth } from "@/utils/user";

export default {
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    feeId: {
      type: Number,
      required: true,
    },
  },
  components: {
    FeeDetail,
    FeeBaseInfo,
    FeeProcess,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: "Fee",
      feeInfo: {},
      progressData: [],
      feeTypeList: [],
      maxHeight:document.documentElement.clientHeight - 84,
      dragging: false,
      startX: 0,
      currentWidth: 0,
      initialWidth: 0,
      isFullWidth: false,
    };
  },
  computed:{
    isnotPc(){
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  },
  created() {
    this.show = this.showSidebar;
    this.fetchFeeTypeList();
  },
  mounted() {

  },
  watch:{
    showSidebar: {
      handler(val) {
        this.show = val;
      },
      immediate: true
    },
    feeId:{
      handler(){
        this.fetchFeeTypeList();
      }
    }
  },
  methods: {
    getMenuName,
    getTwoDimensionalArray,
    fetchFeeTypeList() {
      queryFeeTypeList().then((res) => {
        this.feeTypeList = res.data || [];
        this.fetchFeeInfo();
      });
    },
    handleHidden() {
      this.$emit("update:showSidebar", false);
    },
    checkComponent(name) {
      this.componentName = name;
    },
    fetchFeeInfo() {
      queryFeeInfo({ feeId: this.feeId }).then((res) => {
        this.feeInfo = res.data || {};
        this.feeInfo.feeDetails.forEach((item) => {
          item.feetIdList = this.getTwoDimensionalArray(
            this.feeTypeList,
            "feetId",
            item.feetId,
            { children: "feeTypes" }
          );
          item.feetName = item.feetIdList
            .map(
              (i) =>
                this.getMenuName(this.feeTypeList, "feeTypes").find(
                  (ii) => ii.feetId == i
                ).feeName
            )
            .join("/");
        });
        this.fetchBillTaskRecord(res?.data?.feeId);
      });
    },
    fetchBillTaskRecord(id) {
      queryBillTaskRecord({ id: id, typeId: 14 }).then((res) => {
        this.progressData = res.data;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.fee-dialog-content {
  padding: 20px;
}
</style>
