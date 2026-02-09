<script>
import { queryFeeInfo, queryFeeTypeList } from "@/api/feeList";
import { queryBillTaskRecord } from "@/api/billApi";
import FeeDetail from "./componens/fee-detail";
import FeeBaseInfo from "./componens/fee-info";
import FeeProcess from "./componens/fee-process";
import { getMenuName, getTwoDimensionalArray } from "@/utils";
import { setSidebarWidth,getSidebarWidth } from "@/utils/user";

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
    // 获取初始宽度
    this.$nextTick(() => {
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const obj = getSidebarWidth() || {}
        if (obj['fee-sidebar']) {
          const width = obj['fee-sidebar'];
          const maxWidth = window.innerWidth - 70;
          if(String(width).includes('%')){
            offcanvas.style.width = width;
            this.initialWidth = width;
            this.currentWidth = width;
          }else{
            const fromatWidth = width > maxWidth ? maxWidth : width
            offcanvas.style.width = `${fromatWidth}px`;
            this.initialWidth = `${fromatWidth}px`;
            this.currentWidth = `${fromatWidth}px`;
          }
          this.isFullWidth = width == maxWidth;
        }else{
          this.initialWidth = offcanvas.offsetWidth;
          this.currentWidth = this.initialWidth;
        }
      }
    });
  },
  watch:{
    feeId:{
      handler(){
        this.fetchFeeTypeList();
      }
    }
  },
  methods: {
    toggleFullWidth() {
      this.isFullWidth = !this.isFullWidth;
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const maxWidth = window.innerWidth - 70;
        offcanvas.style.width = this.isFullWidth? maxWidth + 'px' : '70%';
        const obj = getSidebarWidth() || {}
        obj['fee-sidebar'] = this.isFullWidth? maxWidth : '70%'
        setSidebarWidth(JSON.stringify(obj))
      }
    },
    handleDragStart(e) {
      this.dragging = true;
      this.startX = e.clientX;
      const offcanvas = document.querySelector('.offcanvas-end');
      this.currentWidth = offcanvas.offsetWidth;
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.handleDragEnd);
      // 防止文本选中
      document.body.style.userSelect = 'none';
    },
    handleDrag(e) {
      if (!this.dragging) return;
      const dx = this.startX - e.clientX;
      const minWidth = Math.max(window.innerWidth * 0.4, 400);
      const maxWidth = window.innerWidth - 70;
      const newWidth = Math.min(Math.max(this.currentWidth + dx, minWidth), maxWidth);
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        offcanvas.style.width = `${newWidth}px`;
        const obj = getSidebarWidth() || {}
        obj['fee-sidebar'] = newWidth
        setSidebarWidth(JSON.stringify(obj))
      }
    },
    handleDragEnd() {
      this.dragging = false;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.handleDragEnd);
      document.body.style.userSelect = '';
      // 保存最终宽度
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        this.currentWidth = offcanvas.offsetWidth;
      }
    },
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
<template>
  <div>
    <BOffcanvas
      v-model="show"
      @hidden="handleHidden"
      :placement="'end'"
      backdrop="false"
      responsive="md"
      :no-close-on-esc="true"
    >
      <div
        class="drag-handle"
        @mousedown="handleDragStart"
        v-if="!isnotPc"
      ></div>
      <template #header>
        <div class="custom-offcanvas-header">
          <b-button
            variant="close"
            class="close-btn-custom"
            @click="handleHidden"
          ></b-button>
          <h5
            class="offcanvas-title"
            id="offcanvasRightLabel"
          >
            {{ feeInfo.beginDate }} - {{ feeInfo.reimburseUserIdStr }}
          </h5>
        </div>
      </template>
      <!-- 全屏切换按钮 -->
      <div 
        v-if="show&&isnotPc"
        class="full-width-toggle"
        @click="toggleFullWidth"
      >
        <i 
          class="bx"
          :class="isFullWidth ? 'bx-chevron-right' : 'bx-chevron-left'"
          style="font-size: 20px"
        ></i>
      </div>
      <div class="row">
        <div class="col-12">
          <div :style="{ 'max-height': maxHeight + 'px', 'overflow-y': 'scroll' }">
            <FeeDetail :feeInfo="feeInfo" />
            <FeeBaseInfo :feeInfo="feeInfo" />
            <FeeProcess :progressData="progressData" />
          </div>
        </div>
      </div>
    </BOffcanvas>
  </div>
</template>
<style scoped>
.drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
}

.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.drag-handle:active {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
