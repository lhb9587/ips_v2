<script setup>
import { ref, watch, defineProps, markRaw, onMounted } from "vue";
import Cover from "@/components/sidebar/components/customer/cust-cover.vue";
import Info from "@/components/sidebar/components/customer/info";
import Address from "@/components/sidebar/components/customer/address";
import Case from "@/components/sidebar/components/customer/case";
import Bill from "@/components/sidebar/components/customer/bill";
import Contacts from "@/components/sidebar/components/customer/contacts";
import Activities from "@/components/sidebar/components/customer/activities";
import OurSideContact from "@/components/sidebar/components/customer/our-contacts";
import Affiliates from "@/components/sidebar/components/customer/affiliates";
import Conflict from "@/components/sidebar/components/customer/conflict";
import Industry from "@/components/sidebar/components/customer/industry";
import Business from "@/components/sidebar/components/customer/business";
import MajorEvents from "@/components/sidebar/components/customer/majorEvents";
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

// Props定义
const props = defineProps({
  custId: {
    type: Number,
    required: true,
  },
});

// 响应式数据
const isExpanded = ref(true);
const componentName = ref(markRaw(Cover));
const customerInfo = ref({});
const customerAddrList = ref([]);
const businessList = ref([]);
const workTimeActiveList = ref([]);
const caseCount = ref({});
const billCount = ref({});
const custWithcaseTotal = ref(0);
const custWithBillTotal = ref(0);
const imageLoadError = ref(false);
const activeList = ref([]);
const ourContactCount = ref(0);

// 监听器
watch(
  () => props.custId,
  () => {
    init();
  }
);
const handleImageError = () => {
  imageLoadError.value = true;
};

const checkComponent = (name) => {
  componentName.value = name;
};

const handleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const fetchCustomerInfo = () => {
  const params = {
    customerID: props.custId,
  };
  queryCustomerUrl(params).then((res) => {
    customerInfo.value = res.data || {};
  });
};

const fetchCustomerAddrList = () => {
  const params = { custId: props.custId };
  queryCustomerAddrListUrl(params).then((res) => {
    customerAddrList.value = res.data || [];
  });
};

const fetchBusinessList = () => {
  const params = { custId: props.custId };
  queryShangjiList(params).then((res) => {
    businessList.value = res.data || [];
  });
};

const fetchWorkTimeActiveList = () => {
  queryhuodongList({
    custId: props.custId,
    pageSize: 99999,
  }).then((res) => {
    workTimeActiveList.value = res.data || [];
  });
};

const fetchActivityList = () => {
  const params = { custId: props.custId, isCustomer: 1, pageSize: 9999 };
  queryActivityListUrl(params).then((res) => {
    activeList.value = res.data;
  });
};

const fetchTotalCase = () => {
  queryTotalBillAndCase({ custId: props.custId, caseCount: 1 }).then((res) => {
    caseCount.value = res.data || {};
  });
};

const fetchTotalBill = () => {
  queryTotalBillAndCase({ custId: props.custId, caseCount: 0 }).then((res) => {
    billCount.value = res.data || {};
  });
};

const fetchCustonWithCase = () => {
  getAllCaseInfo({ custIdArray: [props.custId] }).then((res) => {
    custWithcaseTotal.value = res.total || 0;
  });
};

const fetchCustonWithBill = () => {
  fetchList({ custIdList: [props.custId] }).then((res) => {
    custWithBillTotal.value = res.total || 0;
  });
};

//获取我方联系人数量
const getOurContactCount = () => {
  queryAgencyContactListUrl({ customerID: props.custId }).then((res) => {
    ourContactCount.value = res.total || 0;
  });
};

const init = () => {
  fetchCustomerInfo();
  fetchCustomerAddrList();
  fetchBusinessList();
  fetchWorkTimeActiveList();
  fetchTotalBill();
  fetchTotalCase();
  fetchCustonWithCase();
  fetchCustonWithBill();
  fetchActivityList();
  getOurContactCount();
};
onMounted(() => {
  init();
});
</script>
<template>
  <div class="customer-detail-container">
    <!-- <div class="customer-detail-content">
      <div class="customer-detail-header">
        <h5 class="customer-title">{{ customerInfo.fullname }}</h5>
      </div>
    </div> -->
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
              :class="componentName == markRaw(Cover) ? 'active' : ''"
              @click="checkComponent(markRaw(Cover))"
              class="leftbar-item"
            >
              <i class="bx bx-customize me-2"></i>客户封面
            </a>
            <a
              :class="componentName == markRaw(Info) ? 'active' : ''"
              @click="checkComponent(markRaw(Info))"
              class="leftbar-item"
            >
              <i class="mdi mdi-account-box-outline me-2"></i>基本信息
            </a>
            <a
              :class="componentName == markRaw(Case) ? 'active' : ''"
              @click="checkComponent(markRaw(Case))"
              class="leftbar-item"
            >
              <i class="mdi mdi-file-document-outline me-2"></i>关联案件
              <span class="ms-1 float-end">({{ custWithcaseTotal || 0 }})</span>
            </a>
            <a
              :class="componentName == markRaw(Bill) ? 'active' : ''"
              @click="checkComponent(markRaw(Bill))"
              class="leftbar-item"
            >
              <i class="mdi mdi-file-document-edit-outline me-2"></i>关联账单
              <span class="ms-1 float-end">({{ custWithBillTotal || 0 }})</span>
            </a>
            <a
              :class="componentName == markRaw(Address) ? 'active' : ''"
              @click="checkComponent(markRaw(Address))"
              class="leftbar-item"
            >
              <i class="mdi mdi-email-outline me-2"></i>客户地址
              <span class="ms-1 float-end"
                >({{ customerAddrList?.length || 0 }})</span
              >
            </a>
            <a
              :class="componentName == markRaw(Contacts) ? 'active' : ''"
              @click="checkComponent(markRaw(Contacts))"
              class="leftbar-item"
            >
              <i class="bx bx-user-voice me-2"></i>客户联系人
              <span class="ms-1 float-end"
                >({{ customerInfo?.customerContacts?.length || 0 }})</span
              >
            </a>
            <a
              :class="componentName == markRaw(Activities) ? 'active' : ''"
              @click="checkComponent(markRaw(Activities))"
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
              :class="componentName == markRaw(OurSideContact) ? 'active' : ''"
              @click="checkComponent(markRaw(OurSideContact))"
              class="leftbar-item"
            >
              <i class="bx bx-user-pin me-2"></i>我方联系人
              <span class="ms-1 float-end">({{ ourContactCount || 0 }})</span>
            </a>
            <a
              :class="componentName == markRaw(Affiliates) ? 'active' : ''"
              @click="checkComponent(markRaw(Affiliates))"
              class="leftbar-item"
            >
              <i class="bx bx-buildings me-2"></i>关联公司
              <span class="ms-1 float-end"
                >({{ customerInfo?.customerAssociates?.length || 0 }})</span
              >
            </a>
            <a
              :class="componentName == markRaw(Conflict) ? 'active' : ''"
              @click="checkComponent(markRaw(Conflict))"
              class="leftbar-item"
            >
              <i class="mdi mdi-credit-card-check-outline me-2"></i>利益冲突
            </a>
            <a
              :class="componentName == markRaw(Industry) ? 'active' : ''"
              @click="checkComponent(markRaw(Industry))"
              class="leftbar-item"
            >
              <i class="bx bx-cube me-2"></i>行业
            </a>
            <a
              :class="componentName == markRaw(Business) ? 'active' : ''"
              @click="checkComponent(markRaw(Business))"
              class="leftbar-item"
            >
              <i class="mdi mdi-earth me-2"></i>关联商机
            </a>
            <a
              :class="componentName == markRaw(MajorEvents) ? 'active' : ''"
              @click="checkComponent(markRaw(MajorEvents))"
              class="leftbar-item"
            >
              <i class="bx bx-error me-2"></i>重大事件
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
              :class="isExpanded ? 'bx bx-chevron-left' : 'bx bx-chevron-right'"
            ></i>
          </div>
        </span>

        <div :class="isExpanded ? 'email-rightbar mb-3' : 'mx-4'">
          <!-- 动态组件调用 -->
          <component
            :is="componentName"
            :customerInfo="customerInfo"
            :custId="custId"
            :customerAddrList="customerAddrList"
            :businessList="businessList"
            :workTimeActiveList="workTimeActiveList"
            :custWithBillTotal="custWithBillTotal"
            :caseCount="caseCount"
            :billCount="billCount"
            :activeList="activeList"
            @change-component="checkComponent"
          />
        </div>
      </div>
    </div>
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
