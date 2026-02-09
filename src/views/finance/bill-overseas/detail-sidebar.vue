<script>
import Fee from "@/views/finance/bill-overseas/componens/info-fee";
import Bill from "@/views/finance/bill-overseas/componens/info-bill";
import Payment from "@/views/finance/bill-overseas/componens/info-payment";
import Bank from "@/views/finance/bill-overseas/componens/info-bank";
import System from "@/views/finance/bill-overseas/componens/info-system";
import Process from "@/views/finance/bill-overseas/componens/info-process";
import { queryAbroadBillDetail, queryBillTaskRecord } from "@/api/billApi";
import { setSidebarWidth,getSidebarWidth } from "@/utils/user";

export default {
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    billId: {
      type: Number,
      required: true,
    },
  },
  components: {
    Fee,
    Bill,
    Payment,
    Bank,
    System,
    Process,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: "Fee",
      billInfo: {},
      progressData: [],
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
    this.fetchBillInfo();
  },
  mounted() {
    // 获取初始宽度
    this.$nextTick(() => {
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const obj = getSidebarWidth() || {}
        if (obj['overseas-sidebar']) {
          const width = obj['overseas-sidebar'];
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
    billId: {
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
        obj['overseas-sidebar'] = this.isFullWidth? maxWidth : '70%'
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
        obj['overseas-sidebar'] = newWidth
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
      queryAbroadBillDetail({ abroadBillId: this.billId }).then((res) => {
        this.billInfo = res.data || {};
        this.fetchBillTaskRecord(res?.data?.abroadBillId);
      });
    },
    fetchBillTaskRecord(id) {
      queryBillTaskRecord({ id: id, typeId: 19 }).then((res) => {
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
            {{ billInfo.showRefno }}
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
                :class="componentName == 'Fee' ? 'active' : ''"
                @click="checkComponent('Fee')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-box-outline me-2"></i>费用信息
              </a>
              <a
                :class="componentName == 'Bill' ? 'active' : ''"
                @click="checkComponent('Bill')"
                class="leftbar-item"
              >
                <i class="mdi mdi-format-list-bulleted-type me-2"></i>账单信息
              </a>
              <a
                :class="componentName == 'Payment' ? 'active' : ''"
                @click="checkComponent('Payment')"
                class="leftbar-item"
              >
                <i class="bx bx-dollar-circle me-2"></i>支付信息
              </a>
              <a
                :class="componentName == 'Bank' ? 'active' : ''"
                @click="checkComponent('Bank')"
                class="leftbar-item"
              >
                <i class="mdi mdi-bank me-2"></i>银行信息
              </a>
              <a
                :class="componentName == 'System' ? 'active' : ''"
                @click="checkComponent('System')"
                class="leftbar-item"
              >
                <i class="mdi mdi-cog me-2"></i>系统信息
              </a>
              <a
                :class="componentName == 'Process' ? 'active' : ''"
                @click="checkComponent('Process')"
                class="leftbar-item"
              >
                <i class="bx bx-git-compare me-2"></i>任务流程
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
