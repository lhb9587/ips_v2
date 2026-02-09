<script setup>
/* eslint-disable */
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import { ref, onUnmounted, onMounted,computed, watch } from "vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import { queryReceiptList, queryReceiptDetail } from "@/api/caseList";
import InvoiceDetail from "./detail";
import { useStore } from 'vuex';
import { useRoute } from 'vue-router'
const route = useRoute();
import { saveTableConfig } from "@/utils"
const store = useStore();

const showInvoiceDetail = ref(false);
const bussId = 15;
const gridName = "ReceiptListGrid"

const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = list;
};

//斑马线
const activeClass = ref([]);
const changeBorder = (newVal) => {
  newVal
    ? activeClass.value.push("Borderline")
    : activeClass.value.splice(
        activeClass.value.findIndex((i) => i === "Borderline"),
        1
      );
      saveTableConfig("isBorderline",gridName,newVal)
};
const changeRowStyle = (newVal) => {
  newVal
    ? activeClass.value.push("zebra")
    : activeClass.value.splice(
        activeClass.value.findIndex((i) => i === "zebra"),
        1
      );
      saveTableConfig("iszebra",gridName,newVal)
};
//密度
const rowHeight = ref(40);
const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight",gridName,height)
};
const isFull = ref(false);
const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === 'vertical') {
    return windowHeight - 235;
  } else {
    return windowHeight - 290;
  }
};
const gridHeight = ref(calculateGridHeight())

// 创建一个 computed 属性来监听布局变化
const layoutType = computed(() => store.state.layout.layoutType);
watch(layoutType, () => {
  gridHeight.value = calculateGridHeight();
});

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!document.fullscreenElement) {
    element.requestFullscreen().then(() => {
      setTimeout(() => {
        gridHeight.value = document.documentElement.clientHeight - 155;
      }, 100);
    });
  } else {
    document.exitFullscreen().then(() => {
      gridHeight.value = calculateGridHeight();;
    });
  }
};
const total = ref(0);
const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
  const routeName = route.name;
  const savedData = pageSizeData.find(item => item.name === routeName);
  if (savedData) {
    return savedData.pageSize
  }else {
    return 50
  }
}
const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});
// 模糊搜索
const diminput = ref("");
const gridData = ref([]);
const queryReceiptListFunc = () => {
  //卡片和表格的数据
  queryReceiptList({
    searchWord: diminput.value,
    ...listQuery.value,
    ...formInline.value,
  },{isLoading: true}).then((res) => {
    gridData.value = res.data || [];
    gridData.value.forEach((item, index) => {
      item.sid = index;
    });
    total.value = res.total || 0;
  });
};
const tagList = ref([]);
const requestData = ref(undefined);
const handleSearch = (typeStr) => {
  diminput.value = "";
  formInline.value = { ...typeStr.data };
  tagList.value = typeStr.tagList || [];
  queryReceiptListFunc();
  requestData.value = {
    ...typeStr.data,
  };
};
const receiptId = ref("");
const toggleSidebar = (params) => {
  const id = params.data.receiptId;
  fetchDetailInfo(id);
  console.log(id, "id");
  showInvoiceDetail.value = !showInvoiceDetail.value;
};
const detailInfo = ref({});
const fetchDetailInfo = (id) => {
  queryReceiptDetail({ receiptId: id })
    .then((res) => {
      if (res.success) {
        detailInfo.value = res.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });
};
const boxRef = ref(null);
const handleFullScreenChange = () => {
  isFull.value = !isFull.value
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};
onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});
onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>
<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card box" ref="boxRef">
          <div class="card-body" style="padding-bottom: 10px;">
            <div class="d-flex align-items-center">
              <div class="mb-0 card-title flex-grow-1">
                <div class="d-flex">
                  <ListSearch
                    name="gailanlist"
                    :buss-id="bussId"
                    :is-show="true"
                    @search="handleSearch"
                    ref="searchRef"
                  >
                  </ListSearch>
                </div>
              </div>
              <div class="flex-shrink-0">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: diminput,
                  }"
                  :isFull="isFull"
                >
                </TopListTool>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :rowClick="toggleSidebar"
              :activeClass="activeClass"
            />
          </div>
          <div class="card-body border-bottom" v-if="total > 0" style="padding-top: 10px;">
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              @pagination="queryReceiptListFunc"
              :pageSizes="pageSizesList"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  <b-modal
    v-model="showInvoiceDetail"
    title="发票查看"
    style="z-index: 1040"
    centered
    size="lg"
    hide-footer
  >
    <InvoiceDetail :detailInfo="detailInfo"
  /></b-modal>
</template>
<style lang="scss" scoped>
.card-body {
  flex: none;
}
</style>
