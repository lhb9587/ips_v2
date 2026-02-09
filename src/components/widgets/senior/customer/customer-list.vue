<template>
  <div class="card h-100 mb-0 w-100">
    <div
      class="card-top d-flex justify-content-between w-100"
      ref="cardTopRef"
    >
      <div class="d-flex gap-2">
        <b-tabs
          pills
          nav-class="bg-light rounded custom-tabs"
        >
          <b-tab
            :title="item.label"
            v-model="selectedTab"
            v-for="item of tabList"
            :key="item.value"
            @click.stop="changeTab(item.value)"
            title-link-class="small-tabItem"
          >
          </b-tab>
        </b-tabs>
        <Carousel />
      </div>
      <div class="d-flex align-items-center gap-2 content-right">
        <template v-if="!isCondensedFilter">
          <el-select
            v-model="custId"
            remote
            clearable
            filterable
            style="width: 200px"
            @change="changeCust"
            placeholder="输入客户名称"
            :remote-method="customerRemoteMethod"
            class="cust-select"
            ref="custSelectRef"
          >
            <template #prefix>
              <i
                class="bx bx-search-alt"
                style="cursor: pointer"
                @click="changeFilter"
              ></i>
            </template>
            <el-option
              v-for="itm in customOptions"
              :key="itm.id"
              :label="itm.name"
              :value="itm.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="custRangValue"
            placeholder="请选择"
            style="width: 150px"
            @change="changeFilter"
          >
            <el-option
              v-for="item in custRangOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="filterValue"
            placeholder="请选择"
            style="width: 200px"
            @change="changeFilter"
          >
            <el-option
              v-for="item in filterOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <template v-else>
          <el-dropdown trigger="click">
            <el-button
              type="primary"
              plain
              >筛选条件</el-button
            >
            <template #dropdown>
              <div style="padding: 8px 16px; width: 220px">
                <el-select
                  v-model="custId"
                  remote
                  clearable
                  filterable
                  style="width: 100%; margin-bottom: 8px"
                  @change="changeCust"
                  placeholder="输入客户名称"
                  :remote-method="customerRemoteMethod"
                  class="cust-select"
                  ref="custSelectRef"
                >
                  <template #prefix>
                    <i
                      class="bx bx-search-alt"
                      style="cursor: pointer"
                      @click="changeFilter"
                    ></i>
                  </template>
                  <el-option
                    v-for="itm in customOptions"
                    :key="itm.id"
                    :label="itm.name"
                    :value="itm.id"
                  >
                  </el-option>
                </el-select>
                <el-select
                  v-model="custRangValue"
                  placeholder="请选择"
                  style="width: 100%; margin-bottom: 8px"
                  @change="changeFilter"
                >
                  <el-option
                    v-for="item in custRangOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-select
                  v-model="filterValue"
                  placeholder="请选择"
                  style="width: 100%"
                  @change="changeFilter"
                >
                  <el-option
                    v-for="item in filterOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </template>
          </el-dropdown>
        </template>
        <el-tag
          type="info"
          effect="light"
          round
        >
          <span style="font-weight: 600"> 共计：{{ listTotal }} </span>
        </el-tag>
        <div
          class="simple-pagination"
          v-if="totalPages > 1"
        >
          <div class="page-show">
            <span>{{ currentPage }} / {{ totalPages }}</span>
          </div>
          <div class="pagination-controls">
            <div
              class="page-control"
              @click="prevPage"
              :disabled="currentPage <= 1"
              :class="{ 'page-control-disabled': currentPage <= 1 }"
            >
              <i
                class="bx bx-chevron-up"
                style="font-size: 22px"
              ></i>
            </div>
            <div
              class="page-control"
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              :class="{ 'page-control-disabled': currentPage >= totalPages }"
            >
              <i
                class="bx bx-chevron-down"
                style="font-size: 22px"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-divider style="margin: 0" />
    <LoadingOverlay :loading="loading" />
    <div class="customer-grid-container">
      <div
        class="customer-grid"
        :style="gridStyle"
      >
        <div
          v-for="cust in customerList"
          :key="cust.custId"
        >
          <CustomerCardInfo :custInfo="cust" />
        </div>
      </div>
      <div
        style="
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        "
        v-if="customerList.length === 0"
      >
        <el-empty
          description="暂无数据"
          :image-size="90"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import CustomerCardInfo from "./cust-info/customer-cardInfo.vue";
import { queryCustomerCard } from "@/api/dashboard";
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import LoadingOverlay from "@/components/common/loading";
import { queryCustomerNameId } from "@/api/caseList";
import { unique } from "@/utils";
import Carousel from "./components/cust-carousel.vue";

const customerList = ref([]);

const loading = ref(false);

// 根据屏幕宽度设置每页显示数量
const getDefaultItemsPerPage = () => {
  return window.innerWidth > 1900 ? 5 : 4;
};

// 分页相关
const listTotal = ref(0);
const itemsPerPage = ref(getDefaultItemsPerPage()); // 根据屏幕宽度设置初始值
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil(listTotal.value / itemsPerPage.value)
);

// 监听窗口大小变化
const handleWindowResize = () => {
  const newItemsPerPage = getDefaultItemsPerPage();
  if (itemsPerPage.value !== newItemsPerPage) {
    itemsPerPage.value = newItemsPerPage;
    currentPage.value = 1; // 重置当前页码
    fetchCustomerList(); // 重新获取数据
  }
};

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchCustomerList();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchCustomerList();
  }
};

const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(330px, 1fr))`,
  gap: "1rem",
}));

const selectedTab = ref(1);
const tabList = ref([
  {
    label: "我负责的",
    value: 1,
  },
  {
    label: "全部客户",
    value: 2,
  },
]);
const changeTab = (value) => {
  selectedTab.value = value;
  currentPage.value = 1;
  fetchCustomerList();
};

const filterValue = ref(1);
const filterOptions = ref([
  {
    value: 1,
    label: "按本年账单收入排序",
  },
  {
    value: 2,
    label: "按本年案件数量排序",
  },
  {
    value: 5,
    label: "按总账单收入排序",
  },
  {
    value: 3,
    label: "按最近来案时间排序",
  },
  {
    value: 4,
    label: "按最近开账单时间排序",
  },
]);
const custRangValue = ref(1);
const custRangOptions = ref([
  {
    value: 1,
    label: "本年有账单客户",
  },
  {
    value: 0,
    label: "历年有账单客户",
  },
]);

const changeFilter = () => {
  currentPage.value = 1;
  fetchCustomerList();
};

//客户名称搜索
const custId = ref(undefined);
const customOptions = ref([]);

const changeCust = (value) => {
  custId.value = value;
  currentPage.value = 1;
  fetchCustomerList();
};

const customerRemoteMethod = (value) => {
  if (!value) {
    return false;
  }
  const data = {
    pageNo: 1,
    pageSize: 100,
    isCustomer: 1,
    keyword: value,
  };
  queryCustomerNameId(data).then((res) => {
    const list = unique(
      [
        ...new Set([
          ...res.data.map((item) => ({
            id: item.custId,
            name: item.name,
          })),
        ]),
      ],
      "id"
    );
    customOptions.value = list;
  });
};

const fetchCustomerList = () => {
  loading.value = true;
  const params = {
    pageNo: currentPage.value,
    pageSize: itemsPerPage.value,
    custRadius: selectedTab.value,
    type: filterValue.value,
    custId: custId.value,
    custCardRange: custRangValue.value,
  };
  queryCustomerCard(params)
    .then((res) => {
      loading.value = false;
      listTotal.value = res.total || 0;
      customerList.value = res.data || [];
    })
    .catch((err) => {
      console.log(err);
    });
};

const isCondensedFilter = ref(false);
const cardTopRef = ref(null);
let cardTopResizeObserver = null;

const checkCardTopWidth = () => {
  if (cardTopRef.value) {
    console.log(cardTopRef.value.offsetWidth, "cardTopRef.value.offsetWidth");

    isCondensedFilter.value = cardTopRef.value.offsetWidth < 1521;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleWindowResize);
  fetchCustomerList();
  nextTick(() => {
    if (cardTopRef.value && window.ResizeObserver) {
      cardTopResizeObserver = new ResizeObserver(checkCardTopWidth);
      cardTopResizeObserver.observe(cardTopRef.value);
      checkCardTopWidth();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleWindowResize);
  if (cardTopResizeObserver && cardTopRef.value) {
    cardTopResizeObserver.disconnect();
  }
});
</script>
<style>
.card-top {
  padding: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.custom-tabs {
  width: auto !important;
  display: flex;
  flex-wrap: nowrap;
  .nav-link {
    padding: 6px 14px;
    white-space: nowrap;
  }
}
.customer-grid-container {
  overflow-x: hidden;
  padding: 15px;
  width: 100%;
}
.customer-grid {
  gap: 1rem;
  width: 100%;
}
.customer-grid > div {
  max-width: 450px;
  width: 100%;
}

@media screen and (max-width: 768px) {
  .customer-grid {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}

.simple-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  .page-show {
    min-width: 36px;
    white-space: nowrap;
  }
  .pagination-controls {
    display: flex;
    gap: 4px;
    margin-left: 4px;
    .page-control {
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid #e5e5e5;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: #f5f5f5;
      }
    }
    .page-control-disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}
.cust-select {
  .el-select__input {
    width: 100% !important;
  }
}
.small-tabItem {
  padding: 8px !important;
}
</style>
