<script>
import Info from "@/components/sidebar/components/bill/info";
import OurAccount from "@/components/sidebar/components/bill/our-account";
import BillDetails from "@/components/sidebar/components/bill/bill-details";
import WriteOffInfo from "@/components/sidebar/components/bill/writeoff-info";
import Process from "@/components/sidebar/components/bill/process";
import BillAllocation from "@/components/sidebar/components/bill/allocation";
import {
  queryBillByBillNo,
  queryBillUrl,
  queryBillInfoByBillId,
  queryBillTaskRecord,
} from "@/api/billApi";
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
    billNo: {
      type: String,
    },
  },
  components: {
    Info,
    OurAccount,
    BillDetails,
    WriteOffInfo,
    Process,
    BillAllocation,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: "Info",
      billInfo: {},
      writeOffList: [],
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
        if (obj['bill-sidebar']) {
          const width = obj['bill-sidebar'];
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
        offcanvas.style.width = this.isFullWidth? maxWidth + 'px': '70%';
        const obj = getSidebarWidth() || {}
        obj['bill-sidebar'] = this.isFullWidth? maxWidth : '70%'
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
        obj['bill-sidebar'] = newWidth
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
      if (this.billNo) {
        queryBillByBillNo({ billNo: this.billNo })
          .then((res) => {
            this.billInfo = res.data || {};
            this.fetchWriteOffList(res?.data?.billId);
            this.fetchBillTaskRecord(res?.data?.billId);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        queryBillUrl({ billId: this.billId }, { isLoading: true }).then(
          (res) => {
            this.billInfo = res.data || {};
            this.fetchWriteOffList(res?.data?.billId);
            this.fetchBillTaskRecord(res?.data?.billId);
          }
        );
      }
    },
    formatList(list) {
      return list.reduce(
        (pre, next) => {
          if (!pre.screenId[next.screenId]) {
            pre.screenId[next.screenId] = true;
            next["expandList"] = [JSON.parse(JSON.stringify(next))];
            pre.list.push(next);
          } else {
            let data = pre.list.find((item) => item.screenId == next.screenId);
            data["expandList"].push(next);
            data.amountBill = +data["expandList"]
              .reduce((p, n) => p + +n.amountBill, 0)
              .toFixed(2);
            data.feetStr = data["expandList"].reduce(
              (p, n) => p + (n.feetStr + ";"),
              ""
            );
            data.description = data["expandList"].reduce(
              (p, n) => p + (n.description + ";"),
              ""
            );
          }
          return pre;
        },
        { screenId: {}, list: [] }
      ).list;
    },
    fetchWriteOffList(id) {
      queryBillInfoByBillId({ billId: id }).then((res) => {
        this.writeOffList = this.formatList(res.data);
      });
    },
    fetchBillTaskRecord(id) {
      queryBillTaskRecord({ id: id, typeId: 8 }).then((res) => {
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
          <div
            :title="billInfo.showRefno"
            style="
              max-width: 400px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
          >
            <span
              class="offcanvas-title"
              id="offcanvasRightLabel"
              style="font-size: 16px; font-weight: 500; color: #495047"
            >
              {{ billInfo.showRefno }}
            </span>
          </div>
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
            <!-- <div class="text-center">
              <img
                :src="`ipdoc${billInfo.userIcon}`"
                alt=""
                height="50"
                class="mx-auto d-block"
              />
            </div> -->
            <div class="mail-list mt-1">
              <a
                :class="componentName == 'Info' ? 'active' : ''"
                @click="checkComponent('Info')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-box-outline me-2"></i>基本信息
              </a>
              <a
                :class="componentName == 'BillDetails' ? 'active' : ''"
                @click="checkComponent('BillDetails')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-document-outline me-2"></i>账单明细
              </a>
              <a
                :class="componentName == 'BillAllocation' ? 'active' : ''"
                @click="checkComponent('BillAllocation')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-document-edit-outline me-2"></i>账单分配
              </a>
              <a
                :class="componentName == 'OurAccount' ? 'active' : ''"
                @click="checkComponent('OurAccount')"
                class="leftbar-item"
              >
                <i class="mdi mdi-email-outline me-2"></i>我方账户
              </a>
              <a
                :class="componentName == 'WriteOffInfo' ? 'active' : ''"
                @click="checkComponent('WriteOffInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-timeline-check-outline me-2"></i>核销信息
              </a>
              <a
                :class="componentName == 'Process' ? 'active' : ''"
                @click="checkComponent('Process')"
                class="leftbar-item"
              >
                <i class="bx bx-git-compare me-2"></i>账单流程
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
              :writeOffList="writeOffList"
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
