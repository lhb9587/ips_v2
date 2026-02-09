<template>
  <div
    class="info-card"
    @click="openCustModal"
  >
    <div class="info-card-header d-flex gap-2">
      <div>
        <el-image
          :src="`/ipdoc${custInfo.userIcon}`"
          style="width: 64px; height: 64px"
          fit="contain"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><icon-picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="d-flex flex-column justify-content-center w-100">
        <div class="w-100">
          <div class="info-card-title">{{ custInfo.fullname }}</div>
          <div class="d-flex justify-content-between w-100">
            <div class="info-card-info d-flex gap-1 align-items-center">
              <div class="bx bx-map"></div>
              <div>{{ custInfo.country }}</div>
            </div>
            <div class="d-flex gap-1 align-items-center">
              <div
                style="color: #34c38f"
                v-if="parseFloat(custInfo.tendency) < 0"
              >
                <i class="icon iconfont icon-xiadie"></i>
                <span>{{ custInfo.tendency }}</span>
              </div>
              <div
                style="color: #f46a6a"
                v-if="parseFloat(custInfo.tendency) > 0"
              >
                <i class="icon iconfont icon-shangzhang"></i>
                <span>{{ custInfo.tendency }}</span>
              </div>
              <div
                style="color: #f46a6a"
                v-if="parseFloat(custInfo.tendency) == 0"
              >
                <i class="icon iconfont icon-shangzhang"></i>
                <span>{{ custInfo.tendency }}</span>
              </div>
              <el-tag
                type="info"
                effect="plain"
                round
                style="border-color: #e5e5e5"
              >
                <span style="color: #0a0a0a"
                  >{{ formatNumberWithCommas(custInfo.totalBilling) }} ¥</span
                >
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-divider style="margin: 0" />
    <div class="info-card-body">
      <div class="info-tabs">
        <div
          v-for="item in tabList"
          :key="item"
          class="info-tab"
          :class="tabSelected === item.value ? 'info-tab-selected' : ''"
          @click.stop="tabSelected = item.value"
        >
          <span
            class="tab-icon"
            :class="item.icon"
          ></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="info-tab-content">
        <div
          v-if="tabSelected === 1"
          class="h-100 w-100"
        >
          <lineChart :custData="custInfo" />
        </div>
        <div
          v-if="tabSelected === 2"
          class="h-100"
          style="padding: 24px 0"
        >
          <div
            class="director-list d-flex gap-4"
            v-if="custInfo.responsiblePersons?.length"
          >
            <div
              class="director-item d-flex justify-content-between"
              v-for="(item, index) in custInfo.responsiblePersons"
              :key="index"
            >
              <div class="d-flex align-items-center gap-1">
                <span class="bx bx-user-circle"></span>
                <span>{{ item.fullname }}</span>
              </div>
              <div>
                <el-tag
                  type="info"
                  effect="plain"
                  round
                >
                  <span style="font-weight: 600; color: #0a0a31">{{
                    item.typeName
                  }}</span>
                </el-tag>
              </div>
            </div>
          </div>
          <el-empty
            description="暂无数据"
            :image-size="40"
            style="padding: 0"
            v-else
          />
        </div>
        <div
          v-if="tabSelected === 3"
          class="h-100"
        >
          <div style="display: flex; padding: 24px 0">
            <div
              class="d-flex justify-content-center flex-grow-1"
              v-for="(item, index) in custInfo.caseStatistics"
              :key="index"
            >
              <div class="d-flex flex-column align-items-center gap-1">
                <div>{{ item.name }}</div>
                <div class="case-number">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <cust-modal ref="custModalRef" />
</template>
<script setup>
import { defineProps, computed, ref } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";
import lineChart from "@/components/widgets/senior/customer/cust-info/line-chart.vue";
import custModal from "@/components/widgets/senior/customer/cust-info/cust-modal.vue";
import { formatNumberWithCommas } from "@/utils/count.js";
const props = defineProps({
  custInfo: {
    type: Object,
    default: () => ({}),
  },
});
const custInfo = computed(() => props.custInfo);
const tabSelected = ref(1);
const tabList = [
  {
    label: "业绩",
    value: 1,
    icon: "bx bx-bar-chart",
  },
  {
    label: "负责人",
    value: 2,
    icon: "bx bx-user-circle",
  },
  {
    label: "案量",
    value: 3,
    icon: "bx bx-briefcase-alt",
  },
];

// 模态框引用
const custModalRef = ref(null);

// 打开客户详情模态框
const openCustModal = () => {
  custModalRef.value.openModal(props.custInfo);
};
</script>
<style lang="scss" scoped>
.info-card {
  cursor: pointer;
  width: 100%;
  height: 280px;
  border-radius: 5px;
  border: 1px solid #ebeef5;
  .info-card-header {
    height: 100px;
    padding: 16px;
  }
  .info-card-body {
    padding: 16px 16px 0 16px;
    height: calc(100% - 100px);
  }
}
.el-image {
  width: 64px;
  height: 64px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 22px;
}
.image-slot .el-icon {
  font-size: 22px;
}
.info-card-title {
  font-size: 15px;
  font-weight: 600;
}
.info-tabs {
  cursor: pointer;
  display: flex;
  .info-tab {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    gap: 4px;
  }
  .info-tab-selected {
    background-color: #e5e7eb;
    border-radius: 4px;
  }
}
.info-tab-content {
  height: calc(100% - 24px);
}
.case-number {
  font-size: 16px;
  font-weight: 600;
}
.director-list {
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  padding: 0 8px;
}
</style>
