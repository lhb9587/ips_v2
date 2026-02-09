<script setup>
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import {
  ref,
  onUnmounted,
  onMounted,
  computed,
  watch,
  onBeforeMount,
} from "vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import { queryFeeList, queryFeeTypeList } from "@/api/feeList";
import FeeSidebar from "@/views/finance/finance-fee/detail-sidebar";
import { saveTableConfig, getTwoDimensionalArray, getMenuName } from "@/utils";
import { useStore } from "vuex";
import { useRoute } from 'vue-router'
const route = useRoute();
const store = useStore();

const bussId = 14;
const gridName = "feeListGrid";
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
  saveTableConfig("isBorderline", gridName, newVal);
};
const changeRowStyle = (newVal) => {
  newVal
    ? activeClass.value.push("zebra")
    : activeClass.value.splice(
        activeClass.value.findIndex((i) => i === "zebra"),
        1
      );
  saveTableConfig("iszebra", gridName, newVal);
};
//密度
const rowHeight = ref(40);
const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};
const isFull = ref(false);
const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 235;
  } else {
    return windowHeight - 290;
  }
};
const gridHeight = ref(calculateGridHeight());

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
      gridHeight.value = calculateGridHeight();
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
const queryBillListFunc = () => {
  //卡片和表格的数据
  queryFeeList({
    searchWord: diminput.value,
    ...listQuery.value,
    ...formInline.value,
  }).then((res) => {
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
  queryBillListFunc();
  requestData.value = {
    ...typeStr.data,
  };
};
const feeId = ref("");
const isShowDetail = ref(false);
const toggleSidebar = (params) => {
  const id = params.data.feeId;
  if (id) {
    feeId.value = id;
    isShowDetail.value = true;  
  }
};
const handleSidebarUpdate = (value) => {
  isShowDetail.value = value;
};
const boxRef = ref(null);
const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};
const detailCellRendererParams = ref({});

const feeTypeList = ref([]);
const fetchFeeTypeList = async () => {
  const res = await queryFeeTypeList();
  feeTypeList.value = res.data;
};
const getLoactionWidth = (value) => {
  if (!localStorage.getItem("tableDetailHeader")) {
    return "auto";
  } else {
    let obj = JSON.parse(localStorage.getItem("tableDetailHeader"));
    console.log(obj, "obj");
    if (obj.feeDetialList) {
      let localWidth;
      obj.feeDetialList.map((item) => {
        if (item.prop == value) {
          localWidth = item.width;
        }
      });
      console.log(localWidth,'localWidth');
      
      return Number(localWidth);
    } else {
      return "auto";
    }
  }
};
const saveColumnsWidth = (params) => {
  let tableHeader = params.columnApi.columnModel
    .getColumnState()
    .map((item) => ({
      width: item.width,
      prop: item.colId,
    }));
  let obj = JSON.parse(localStorage.getItem("tableDetailHeader")) || {};
  obj.feeDetialList = tableHeader;
  localStorage.setItem("tableDetailHeader", JSON.stringify(obj));
};
onBeforeMount(() => {
  detailCellRendererParams.value = {
    detailGridOptions: {
      onGridReady: (params) => {
        const obj = JSON.parse(localStorage.getItem("tableDetailHeader")) || {};
        if (!obj.feeDetialList) {
          setTimeout(() => {
            if(params.api){
              params.api.sizeColumnsToFit();
            }
          }, 500);
          params.columnApi.setColumnWidths([{ key: "feetId", newWidth: 260 }]);
          setTimeout(() => {
            saveColumnsWidth(params);
          }, 800);
        }
      },
      columnDefs: [
        {
          headerName: "费用类型",
          field: "feetId",
          cellRenderer: (params) => {
            let feetIdList = getTwoDimensionalArray(
              feeTypeList.value,
              "feetId",
              params.value,
              { children: "feeTypes" }
            );
            let feetName = feetIdList
              .map(
                (i) =>
                  getMenuName(feeTypeList.value, "feeTypes").find(
                    (ii) => ii.feetId == i
                  ).feeName
              )
              .join("/");
            return `<span title="${feetName}">${feetName}</span>`;
          },
          width: getLoactionWidth('feetId'),
        },
        {
          headerName: "费用名",
          field: "feeName",
          width:getLoactionWidth('feeName')
        },
        {
          headerName: "金额",
          field: "amount",
          width:getLoactionWidth('amount')
        },
        {
          headerName: "盈余核算状态",
          field: "surplusStatus",
          width:getLoactionWidth('surplusStatus')
        },
        {
          headerName: "收款对方名称",
          field: "receiverName",
          width:getLoactionWidth('receiverName')
        },
        {
          headerName: "费用描述",
          field: "feeDesc",
          width:getLoactionWidth('feeDesc')
        },
      ],
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.feeDetails);
    },
  };
});
onMounted(() => {
  fetchFeeTypeList();
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
        <div
          class="card box"
          ref="boxRef"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <div class="mb-0 flex-grow-1">
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
              :gridName="gridName"
              :bussId="bussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :activeClass="activeClass"
              :columnDefs="columnList"
              :grid-data="gridData"
              :detailCellRendererParams="detailCellRendererParams"
              :hasDetailGrid="true"
              :rowClick="toggleSidebar"
              :masterDetail="true"
              :columnDisplay="[
                'actualReimburse',
                'total',
              ]"
            />
          </div>
          <div
            class="card-body border-bottom"
            v-if="total > 0"
            style="padding-top: 10px"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              @pagination="queryBillListFunc"
              :pageSizes="pageSizesList"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  <FeeSidebar
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    :feeId="feeId"
  />
</template>
<style lang="scss" scoped>
.card-body {
  flex: none;
}
</style>
