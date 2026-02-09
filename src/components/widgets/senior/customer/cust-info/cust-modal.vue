<template>
  <b-modal
    v-model="modalState"
    @hidden="hiddenModal"
    centered
    hide-footer
    size="md"
    :no-close-on-esc="true"
    :lazy="true"
    dialog-class="custinfo-modal"
    :no-close-on-backdrop="true"
    :title="initcustInfo.fullname"
  >
    <div class="cust-modal-content">
      <!-- 客户基本信息 -->
      <div class="cust-info">
        <el-row
          :gutter="12"
          style="margin-bottom: 12px"
        >
          <el-col :span="12">
            <div class="cust-info-item">
              <div class="item-text">本年账单收入</div>
              <div class="item-number">
                {{ formatNumberWithCommas(custData.billSum) }}
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="cust-info-item">
              <div class="item-text">同期增长率</div>
              <div class="item-number">
                <div
                  style="color: #34c38f"
                  v-if="parseFloat(custData.tendency) < 0"
                >
                  <span>{{ custData.tendency }}</span>
                </div>
                <div
                  style="color: #f46a6a"
                  v-if="parseFloat(custData.tendency) > 0"
                >
                  <span>+{{ custData.tendency }}</span>
                </div>
                <div
                  style="color: #f46a6a"
                  v-if="parseFloat(custData.tendency) == 0"
                >
                  <span>+{{ custData.tendency }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <div class="cust-info-item">
              <div class="item-text">进行中案件</div>
              <div class="item-number">{{ custData.ztCaseCount }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="cust-info-item">
              <div class="item-text">案量</div>
              <div class="item-number">{{ custData.caseCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="info-container">
        <div class="info-title">同期业务趋势</div>
        <div
          class="info-box"
          style="padding: 0; height: 180px"
        >
          <columnChart :chartData="custData.chartData" />
        </div>
      </div>
      <div
        class="info-container"
        style="min-height: 160px"
        v-if="custData.responsiblePersons?.length > 0"
      >
        <div class="info-title">负责人信息</div>
        <div style="display: flex; gap: 12px; flex-direction: column">
          <div
            class="info-box"
            style="min-height: 120px"
            v-for="(item, index) in custData.responsiblePersons"
            :key="index"
          >
            <div class="d-flex">
              <div>
                <div
                  class="align-self-center me-2"
                  style="width: 40px; height: 40px"
                >
                  <span
                    style="font-size: 14px"
                    class="avatar-title rounded-circle bg-soft bg-primary text-primary"
                    >{{ item.fullname?.slice(0, 1) }}</span
                  >
                </div>
              </div>
              <div style="flex-grow: 1">
                <div
                  class="info-box-title"
                  style="color: #000000"
                >
                  {{ item.fullname }}
                </div>
                <div
                  class="info-box-subtitle"
                  style="font-size: 12px"
                >
                  {{ item.typeName }}
                </div>
                <div style="margin-top: 8px; font-size: 12px">专业领域：</div>
                <div
                  style="display: flex; flex-wrap: wrap; gap: 6px; padding: 4px"
                >
                  <el-tag
                    round
                    style="border: none; background-color: #eff6ff"
                    v-for="item in item.userDomainList"
                    :key="item"
                    >{{ item }}</el-tag
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="info-container"
        style="min-height: 200px"
        v-else
      >
        <div class="info-title">无负责人</div>
        <div
          style="
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0;
          "
          class="info-box"
        >
          <el-empty
            description="暂无数据"
            :image-size="80"
          />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <el-button
        type="primary"
        style="width: 100%; margin-top: 12px"
        @click="openCustomerInfo"
        >查看客户信息</el-button
      >
    </div>
  </b-modal>
  <CustomerSidebar
    :custId="initcustInfo.custId"
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
  />
</template>

<script setup>
import { ref, defineExpose } from "vue";
import columnChart from "./column-chart.vue";
import { queryCustomerInfo } from "@/api/dashboard"; // 假设这是获取客户详情的API
import { formatNumberWithCommas } from "@/utils/count.js";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";

const modalState = ref(false);
const initcustInfo = ref({});
const custData = ref({});
const isShowDetail = ref(false);

const handleSidebarUpdate = (value) => {
  isShowDetail.value = value;
};
const openCustomerInfo = () => {
  modalState.value = false;
  isShowDetail.value = true;
};

// 获取客户详情数据
const fetchCustomerDetail = async (custId) => {
  if (!custId) return;
  const params = {
    custId,
    timeDimension: initcustInfo.value.timeDimension,
    belongToDate: initcustInfo.value.belongToDate || undefined,
  };
  try {
    const res = await queryCustomerInfo(params);
    custData.value = res.data;
  } catch (error) {
    console.error("获取客户详情失败:", error);
  }
};

// 打开模态框方法
const openModal = (custInfo) => {
  modalState.value = true;
  if (custInfo?.custId) {
    initcustInfo.value = custInfo;
    fetchCustomerDetail(custInfo.custId);
  }
};

// 关闭模态框方法
const hiddenModal = () => {
  modalState.value = false;
  custData.value = {}; // 清空数据
};

// 对外暴露方法
defineExpose({
  openModal,
  hiddenModal,
});
</script>

<style lang="scss">
.custinfo-modal {
  :deep(.modal-content) {
    width: 450px;
    .modal-header .modal-title {
      font-weight: bold !important;
    }
  }
  .modal-body {
    padding: 0 !important;
  }
}

.cust-modal-content {
  min-height: 400px;
  max-height: calc(80vh - 80px);
  overflow-y: auto;
  padding: 20px;
}
.cust-info {
  .cust-info-item {
    background-color: #f9fafb;
    padding: 8px;
    .item-number {
      font-size: 16px;
      font-weight: bold;
    }
    .text-green {
      color: #77c195;
    }
  }
}
.info-container {
  margin-top: 12px;
  .info-title {
    color: #000000;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .info-box {
    width: 100%;
    background-color: #f3f4f6;
    border-radius: 6px;
    padding: 12px;
  }
}
</style>
