<template>
  <div class="card h-100 mb-0">
    <div class="info-tip" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
      <span class="bx bx-info-circle" style="font-size: 14px;"></span>
      <span
        >点击国家查看详细数据 | 右上角重置按钮或客户区域"返回全球"可重置选择 |
        左上角选择时间范围</span
      >
    </div>
    <div class="d-flex" style="height: calc(100% - 30px)">
      <div
        class="map-container flex-grow-1"
        style="padding: 12px 0 12px 12px"
      >
        <WorldMap
          @country-selected="handleCountrySelected"
          @data-updated="handleDataUpdated"
          ref="worldMapRef"
        />
      </div>
      <el-divider
        direction="vertical"
        style="margin: 0; height: 100%"
      />
      <div class="custlist-container">
        <CountryCustomers
          :selected-country="selectedCountry"
          :all-customers="allMapData"
          @clear-selection="clearCountrySelection"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import WorldMap from "@/components/widgets/senior/customer/cust-info/worldmap.vue";
import CountryCustomers from "./cust-info/country-customers.vue";

const worldMapRef = ref(null);
const allMapData = ref({
  countries: [],
  totals: {
    accountBill: 0,
    cases: 0,
    countryCount: 0,
  },
  custList: [],
  statisticalScope:""
});
// 选中国家的数据
const selectedCountry = ref(null);

// 处理国家选择事件
const handleCountrySelected = (data) => {
  selectedCountry.value = data;
  console.log("选中国家:", data);
};

// 处理地图数据更新事件
const handleDataUpdated = (data) => {
  allMapData.value = data;
  console.log("地图数据已更新:", data);
};

const clearCountrySelection = () => {
  if (worldMapRef.value) {
    worldMapRef.value.resetSelection();
  }
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
  height: 100%;
}

.map-header {
  z-index: 2;
}

.info-tip {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 30px;
  color: #556ee6;
  background-color: #f0f6fe;
  border-bottom: 1px;
  padding-left: 12px;
}
.custlist-container{
    min-width: 315px;
    width: 40%;
}
</style>
