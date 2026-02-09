<script>
import Info from "@/views/finance/bill-management/bill-internal/components/info";
import BillType from "@/views/finance/bill-management/bill-internal/components/bill-type";
import Process from "@/components/sidebar/components/bill/process";
import { queryBillInternalUrl, queryBillTaskRecord } from "@/api/billApi";
import { setSidebarWidth,getSidebarWidth } from "@/utils/user";

export default {
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    billinterid: {
      type: Number,
      required: true,
    },
  },
  components: {
    Info,
    BillType,
    Process,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: "Info",
      billInfo: {},
      progressData: [],
      dragging: false,
      startX: 0,
      currentWidth: 0,
      initialWidth: 0,
      isFullWidth: false,
    };
  },
  created() {
    this.show = this.showSidebar;
    this.fetchBillInfo();
  },
  computed:{
    isnotPc(){
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  },
  mounted() {
    // 获取初始宽度
    this.$nextTick(() => {
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const obj = getSidebarWidth() || {}
        if (obj['internal-sidebar']) {
          const width = obj['internal-sidebar'];
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
  watch: {
    billinterid: {
      handler() {
        this.fetchBillInfo();
      },
    },
  },
  methods: {
    toggleFullWidth() {
      this.isFullWidth = !this.isFullWidth;
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const maxWidth = window.innerWidth - 70;
        offcanvas.style.width = this.isFullWidth? maxWidth + 'px' : '70%';
        const obj = getSidebarWidth() || {}
        obj['internal-sidebar'] = this.isFullWidth? maxWidth : '70%'
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
        obj['internal-sidebar'] = newWidth
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
    handleHidden() {
      this.$emit("update:showSidebar", false);
    },
    checkComponent(name) {
      this.componentName = name;
    },
    handleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    fetchBillInfo() {
      queryBillInternalUrl({ billInternalId: this.billinterid }).then((res) => {
        this.billInfo = res.data || {};
        this.fetchBillTaskRecord(res?.data?.billinterid);
      });
    },
    fetchBillTaskRecord(id) {
      queryBillTaskRecord({ id: id, typeId: 15 }).then((res) => {
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
            <span>{{
              [
                billInfo.showrefno,
                billInfo.caseTypeIdString,
                billInfo.billinterno,
              ]
                .filter((item) => item)
                .join("；")
            }}</span>
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
        <!-- Right Sidebar -->
        <div class="col-12">
          <div
            v-show="isExpanded"
            class="email-leftbar card"
          >
            <div class="mail-list mt-1">
              <a
                :class="componentName == 'Info' ? 'active' : ''"
                @click="checkComponent('Info')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-box-outline me-2"></i>基本信息
              </a>
              <a
                :class="componentName == 'BillType' ? 'active' : ''"
                @click="checkComponent('BillType')"
                class="leftbar-item"
              >
                <i class="mdi mdi-format-list-bulleted-type me-2"></i>账单种类
              </a>
              <a
                :class="componentName == 'Process' ? 'active' : ''"
                @click="checkComponent('Process')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-outline me-2"></i>账单流程
              </a>
            </div>
          </div>

          <!-- 展开功能 -->
          <span
            class="detial-expanded"
            @click="handleExpanded()"
          >
            <div class="expanded-div">
              <i
                :class="
                  isExpanded ? 'bx bx-chevron-left' : 'bx bx-chevron-right'
                "
              ></i>
            </div>
          </span>

          <div :class="isExpanded ? 'email-rightbar mb-3' : 'mx-4'">
            <!-- 动态组件调用 -->
            <component
              :billInfo="billInfo"
              :progressData="progressData"
              :is="componentName"
            ></component>
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
