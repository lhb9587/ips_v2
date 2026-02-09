<script>
import Cover from "./components/customer/cust-cover.vue";
import Info from "./components/customer/info";
import Address from "./components/customer/address";
import Case from "./components/customer/case";
import Bill from "./components/customer/bill";
import Contacts from "./components/customer/contacts";
import Activities from "./components/customer/activities";
import OurSideContact from "./components/customer/our-contacts";
import Affiliates from "./components/customer/affiliates";
import Conflict from "./components/customer/conflict";
import Industry from "./components/customer/industry";
import Business from "./components/customer/business";
import MajorEvents from "./components/customer/majorEvents";
import BranchOffices from "./components/customer/branchOffices";
import {
  queryCustomerUrl,
  queryhuodongList,
  queryTotalBillAndCase,
  queryCustomerAddrListUrl,
  queryActivityListUrl,
  queryAgencyContactListUrl,
} from "@/api/customerList";
import { queryShangjiList } from "@/api/business";
import { getAllCaseInfo } from "@/api/caseList";
import { fetchList } from "@/api/billApi";
import { setSidebarWidth,getSidebarWidth } from "@/utils/user";

export default {
  name: "CustomerSidebar",
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    custId: {
      type: Number,
      required: true,
    },
    defaultComponent:{
      type:String,
      default:"Cover"
    }
  },
  components: {
    Cover,
    Info,
    Address,
    Case,
    Bill,
    Contacts,
    Activities,
    OurSideContact,
    Affiliates,
    Conflict,
    Industry,
    Business,
    BranchOffices,
    isFullWidth: false,
    MajorEvents,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: this.defaultComponent,
      customerInfo: {},
      customerAddrList: [],
      businessList: [],
      workTimeActiveList: [],
      caseCount: {},
      billCount: {},
      custWithcaseTotal: 0,
      custWithBillTotal: 0,
      imageLoadError: false,
      activeList: [],
      dragging: false,
      startX: 0,
      currentWidth: 0,
      initialWidth: 0,
      ourContactCount: 0,
    };
  },
  computed:{
    isnotPc(){
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  },
  created() {
    this.show = this.showSidebar;
    this.fetchCustomerInfo();
    this.fetchCustomerAddrList();
    this.fetchBusinessList();
    this.fetchWorkTimeActiveList();
    this.fetchTotalBill();
    this.fetchTotalCase();
    this.fetchCustonWithCase();
    this.fetchCustonWithBill();
    this.fetchActivityList();
    this.getOurContactCount();
  },
  mounted() {
    // 获取初始宽度
    this.$nextTick(() => {
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const obj = getSidebarWidth() || {}
        if (obj['customer-sidebar']) {
          const width = obj['customer-sidebar'];
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
    custId: {
      handler() {
        this.fetchCustomerInfo();
        this.fetchCustomerAddrList();
        this.fetchBusinessList();
        this.fetchWorkTimeActiveList();
        this.fetchTotalBill();
        this.fetchTotalCase();
        this.fetchCustonWithCase();
        this.fetchCustonWithBill();
        this.fetchActivityList();
        this.getOurContactCount();
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
        obj['customer-sidebar'] = this.isFullWidth? maxWidth : '70%'
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
        obj['customer-sidebar'] = newWidth
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
    handleImageError() {
      this.imageLoadError = true;
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
    fetchCustomerInfo() {
      const params = {
        customerID: this.custId,
      };
      queryCustomerUrl(params).then((res) => {
        this.customerInfo = res.data || {};
      });
    },
    fetchCustomerAddrList() {
      const params = { custId: this.custId };
      queryCustomerAddrListUrl(params).then((res) => {
        this.customerAddrList = res.data || [];
      });
    },
    fetchBusinessList() {
      const params = { custId: this.custId };
      queryShangjiList(params).then((res) => {
        this.businessList = res.data || [];
      });
    },
    fetchWorkTimeActiveList() {
      queryhuodongList({
        custId: this.custId,
        pageSize: 99999,
      }).then((res) => {
        this.workTimeActiveList = res.data || [];
      });
    },
    fetchActivityList() {
      const params = { custId: this.custId, isCustomer: 1, pageSize: 9999 };
      queryActivityListUrl(params).then((res) => {
        this.activeList = res.data;
      });
    },
    fetchTotalCase() {
      queryTotalBillAndCase({ custId: this.custId, caseCount: 1 }).then(
        (res) => {
          this.caseCount = res.data || {};
        }
      );
    },
    fetchTotalBill() {
      queryTotalBillAndCase({ custId: this.custId, caseCount: 0 }).then(
        (res) => {
          this.billCount = res.data || {};
        }
      );
    },
    fetchCustonWithCase() {
      getAllCaseInfo({ custIdArray: [this.custId] }).then((res) => {
        this.custWithcaseTotal = res.total || 0;
      });
    },
    fetchCustonWithBill() {
      fetchList({ custIdList: [this.custId] }).then((res) => {
        this.custWithBillTotal = res.total || 0;
      });
    },
    //获取我方联系人数量
    getOurContactCount() {
      queryAgencyContactListUrl({ customerID: this.custId }).then((res) => {
        this.ourContactCount = res.total || 0;
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
            {{ customerInfo.fullname }}
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
            <div class="text-center">
              <img
                v-if="customerInfo.userIcon && !imageLoadError"
                :src="`/ipdoc${customerInfo.userIcon}`"
                alt=""
                height="50"
                style="max-width: 200px"
                class="mx-auto d-block"
                @error="handleImageError"
              />
            </div>
            <div class="mail-list mt-1">
              <a
                :class="componentName == 'Cover' ? 'active' : ''"
                @click="checkComponent('Cover')"
                class="leftbar-item"
              >
                <i class="bx bx-customize me-2"></i>客户封面
              </a>
              <a
                :class="componentName == 'Info' ? 'active' : ''"
                @click="checkComponent('Info')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-box-outline me-2"></i>基本信息
              </a>
              <a
                :class="componentName == 'Case' ? 'active' : ''"
                @click="checkComponent('Case')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-document-outline me-2"></i>关联案件
                <span class="ms-1 float-end"
                  >({{ custWithcaseTotal || 0 }})</span
                >
              </a>
              <a
                :class="componentName == 'Bill' ? 'active' : ''"
                @click="checkComponent('Bill')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-document-edit-outline me-2"></i>关联账单
                <span class="ms-1 float-end"
                  >({{ custWithBillTotal || 0 }})</span
                >
              </a>
              <a
                :class="componentName == 'Address' ? 'active' : ''"
                @click="checkComponent('Address')"
                class="leftbar-item"
              >
                <i class="mdi mdi-email-outline me-2"></i>客户地址
                <span class="ms-1 float-end"
                  >({{ customerAddrList?.length || 0 }})</span
                >
              </a>
              <a
                :class="componentName == 'Contacts' ? 'active' : ''"
                @click="checkComponent('Contacts')"
                class="leftbar-item"
              >
                <i class="bx bx-user-voice me-2"></i>客户联系人
                <span class="ms-1 float-end"
                  >({{ customerInfo?.customerContacts?.length || 0 }})</span
                >
              </a>
              <a
                :class="componentName == 'Activities' ? 'active' : ''"
                @click="checkComponent('Activities')"
                class="leftbar-item"
              >
                <i class="mdi mdi-file-outline me-2"></i>客户活动
                <span class="ms-1 float-end"
                  >({{
                    (activeList?.length || 0) + workTimeActiveList.length
                  }})</span
                >
              </a>
              <a
                :class="componentName == 'OurSideContact' ? 'active' : ''"
                @click="checkComponent('OurSideContact')"
                class="leftbar-item"
              >
                <i class="bx bx-user-pin me-2"></i>我方联系人
                <span class="ms-1 float-end"
                  >({{ ourContactCount || 0 }})</span
                >
              </a>
              <!-- <a
                
                :class="componentName == 'Instruct' ? 'active' : ''"
                @click="checkComponent('Instruct')"
              >
                <i class="mdi mdi-file-account-outline me-2"></i>客户指示
                <span class="ms-1 float-end">(2410)</span>
              </a> -->
              <a
                :class="componentName == 'Affiliates' ? 'active' : ''"
                @click="checkComponent('Affiliates')"
                class="leftbar-item"
              >
                <i class="bx bx-buildings me-2"></i>关联公司
                <span class="ms-1 float-end"
                  >({{ customerInfo?.customerAssociates?.length || 0 }})</span
                >
              </a>
              <a
                :class="componentName == 'Conflict' ? 'active' : ''"
                @click="checkComponent('Conflict')"
                class="leftbar-item"
              >
                <i class="mdi mdi-credit-card-check-outline me-2"></i>利益冲突
              </a>
              <a
                :class="componentName == 'Industry' ? 'active' : ''"
                @click="checkComponent('Industry')"
                class="leftbar-item"
              >
                <i class="bx bx-cube me-2"></i>行业
              </a>
              <a
                :class="componentName == 'Business' ? 'active' : ''"
                @click="checkComponent('Business')"
                class="leftbar-item"
              >
                <i class="mdi mdi-earth me-2"></i>关联商机
              </a>
              <a
                :class="componentName == 'MajorEvents' ? 'active' : ''"
                @click="checkComponent('MajorEvents')"
                class="leftbar-item"
              >
                <i class="bx bx-error me-2"></i>重大事件
              </a>
              <!-- <a
                :class="componentName == 'BranchOffices' ? 'active' : ''"
                @click="checkComponent('BranchOffices')"
                class="leftbar-item"
              >
                <i class="mdi mdi-credit-card-check-outline me-2"></i>分支机构
              </a> -->
              <!-- <a
                
                :class="componentName == 'Performance' ? 'active' : ''"
                @click="checkComponent('Performance')"
              >
                <i class="mdi mdi-file-powerpoint-outline me-2"></i>业绩
              </a> -->
              <!-- <a
                
                :class="componentName == 'Report' ? 'active' : ''"
                @click="checkComponent('Report')"
              >
                <i class="mdi mdi-earth me-2"></i>客户报告
              </a> -->
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
              :customerInfo="customerInfo"
              :custId="custId"
              :customerAddrList="customerAddrList"
              :businessList="businessList"
              :workTimeActiveList="workTimeActiveList"
              :custWithBillTotal="custWithBillTotal"
              :caseCount="caseCount"
              :billCount="billCount"
              :activeList="activeList"
              :is="componentName"
              @change-component="checkComponent"
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
