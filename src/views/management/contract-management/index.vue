<script setup>
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import { ref, onUnmounted, onMounted, computed, watch } from "vue";
import { ElMessageBox } from "element-plus";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import {
  getContractList,
  getToBeReviewedNumber,
  exportContractFlow,
  copyCreateContract,
} from "@/api/contract";
import { deriveList } from "@/api/caseList";
import { saveTableConfig, downLoadAll } from "@/utils";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ContractSidebar from "@/views/management/contract-management/detail-sidebar";
import ContractCreate from "@/views/management/contract-management/components/contract-create.vue";
import TemplateModal from "@/views/management/contract-management/components/TemplateModal.vue"; // 引入模态框组件

const route = useRoute();
const store = useStore();

const tabList = ref([
  { label: "全部", value: 0 },
  { label: "待办", value: 1 },
]);
const selectedTab = ref(0);

watch(selectedTab, () => {
  fetchDataFunc();
});

const bussId = 93;
const gridName = "ContractInfoListGrid";
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
        1,
      );
  saveTableConfig("isBorderline", gridName, newVal);
};
const changeRowStyle = (newVal) => {
  newVal
    ? activeClass.value.push("zebra")
    : activeClass.value.splice(
        activeClass.value.findIndex((i) => i === "zebra"),
        1,
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
  } else if (layout === "no") {
    return windowHeight - 135;
  } else {
    return windowHeight - 290;
  }
};
// 导出
const exportData = () => {
  ElMessageBox.confirm("是否同时导出合同流程？", "提示", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "warning",
    distinguishCancelAndClose: true,
  })
    .then(() => {
      exportContractFlow({
        ...formInline.value,
        bussId: 93,
        keywords: diminput.value || undefined,
        toBeReviewed: selectedTab.value,
      }).then((res) => {
        if (res.success) {
          const data = {
            url: `/ipdoc${res.data}`,
          };
          downLoadAll(data);
        }
      });
    })
    .catch((action) => {
      if (action === "cancel") {
        deriveList({
          ...formInline.value,
          bussId: 93,
          keywords: diminput.value || undefined,
          toBeReviewed: selectedTab.value,
        }).then((res) => {
          if (res.success) {
            const data = {
              url: `/${res.data}`,
            };
            downLoadAll(data);
          }
        });
      }
    });
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
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const routeName = route.name;
  const savedData = pageSizeData.find((item) => item.name === routeName);
  if (savedData) {
    return savedData.pageSize;
  } else {
    return 50;
  }
};
const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});
// 模糊搜索
const diminput = ref("");
const gridData = ref([]);
const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  fetchDataFunc();
};
const fetchDataFunc = (isLoading = false) => {
  //卡片和表格的数据
  getContractList(
    {
      keywords: diminput.value,
      toBeReviewed: selectedTab.value,
      ...listQuery.value,
      ...formInline.value,
    },
    {
      isLoading,
    },
  ).then((res) => {
    getToNumber(); // 获取待审批数量
    gridData.value = res.data || [];
    gridData.value.forEach((item, index) => {
      item.sid = index;
    });
    isLoading && toggleSidebar({ data: gridData.value[0] });
    total.value = res.total || 0;
  });
};

const toBeReviewedNumber = ref(0);
const getToNumber = () => {
  getToBeReviewedNumber({
    keywords: diminput.value,
    toBeReviewed: 1,
    ...listQuery.value,
    ...formInline.value,
  }).then((res) => {
    toBeReviewedNumber.value = res.data || 0;
  });
};
const tagList = ref([]);
const requestData = ref(undefined);
const handleSearch = (typeStr) => {
  diminput.value = "";
  formInline.value = { ...typeStr.data };
  tagList.value = typeStr.tagList || [];
  fetchDataFunc();
  requestData.value = {
    ...typeStr.data,
  };
};
// 添加路由参数监听
watch(
  () => route.query,
  (query) => {
    if (query.type === "todo") {
      selectedTab.value = 1;
      fetchDataFunc();
    }
  },
  { immediate: true },
);
const contractId = ref("");
const isShowDetail = ref(false);
const toggleSidebar = (params) => {
  const id = params.data.contractId;
  contractId.value = id;
  isShowDetail.value = true;
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
onMounted(() => {
  // 检查url参数layout
  let layoutParam = "";
  if (route && route.query && route.query.layout) {
    layoutParam = route.query.layout;
  }
  if (layoutParam === "no") {
    store.dispatch("layout/changeLayoutType", {
      layoutType: "no",
    });
  }
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});
onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});

const modalState = ref(false);
const oparateType = ref("create");
const contractInfo = ref({});

// 创建申请
const createHandle = () => {
  modalState.value = true;
  oparateType.value = "create";
};

const hiddenModal = () => {
  contractInfo.value = {};
  modalState.value = false;
};

// 合同模版
const isTemplateModalVisible = ref(false);

const showTemplateModal = () => {
  isTemplateModalVisible.value = true;
};

const hiddenTemplateModal = () => {
  isTemplateModalVisible.value = false;
};

// 右键菜单配置
const contextmenuList = ref([
  {
    name: "复制合同新建",
    action: (rowData) => {
      copyCreateContract({ contractId: rowData.contractId }).then((res) => {
        if (res.success) {
          fetchDataFunc(true);
        }
      });
    },
  },
]);
const statusBar = ref({
  statusPanels: [
    { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
    // { statusPanel: 'agSelectedRowCountComponent', align: 'left' }
  ],
})
</script>
<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
          class="card box mb-0"
          ref="boxRef"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <div class="mb-0 flex-grow-1">
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-button
                    type="primary"
                    @click="createHandle"
                  >
                    <i
                      class="bx bx-edit-alt font-size-16 align-middle me-2"
                    ></i>
                    新建审批</el-button
                  >

                  <div>
                    <b-tabs
                      pills
                      v-model="selectedTab"
                      nav-class="bg-light rounded custom-tabs"
                    >
                      <b-tab
                        v-for="item of tabList"
                        :key="item.value"
                      >
                        <template #title>
                          {{ item.label }}
                          <span
                            v-if="item.value === 1"
                            class="matter-number"
                            >{{ toBeReviewedNumber }}</span
                          >
                        </template>
                      </b-tab>
                    </b-tabs>
                  </div>

                  <el-input
                    v-model="diminput"
                    style="width: 200px"
                    placeholder="搜索..."
                    clearable
                    @keyup.enter="fuzzySearch"
                    class="top-search"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <ListSearch
                    name="gailanlist"
                    :buss-id="93"
                    :is-show="true"
                    @search="handleSearch"
                    ref="searchRef"
                  >
                  </ListSearch>
                  <el-button
                    variant="soft-primary"
                    @click="exportData"
                  >
                    <i class="bx bx-export align-middle me-2"></i>
                    导出</el-button
                  >
                </div>
              </div>
              <div class="flex-shrink-0">
                <div class="d-flex">
                  <el-button
                    variant="soft-primary"
                    @click="showTemplateModal"
                  >
                    <i class="bx bx-paste font-size-16 align-middle me-2"></i>
                    合同模板</el-button
                  >
                  <!-- <div
                    style="
                      display: flex;
                      align-items: center;
                      margin-left: 10px;
                    "
                  >
                    <el-tooltip
                      content="导出"
                      placement="top"
                    >
                      <div
                        class="bx bx-export right-config"
                        style="font-size: 18px; cursor: pointer"
                        @click="exportData"
                      ></div>
                    </el-tooltip>
                  </div> -->
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
                      keywords: diminput,
                    }"
                    :isFull="isFull"
                  >
                  </TopListTool>
                </div>
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
              :rowClick="toggleSidebar"
              :contextmenuList="contextmenuList"
              :statusBar="statusBar"
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
              @pagination="fetchDataFunc(false)"
              :pageSizes="pageSizesList"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  <ContractSidebar
    :contractId="contractId"
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    @refresh="fetchDataFunc"
  />

  <b-modal
    v-model="modalState"
    @hidden="hiddenModal"
    centered
    hide-footer
    size="xl"
    :no-close-on-esc="true"
    :lazy="true"
    dialog-class="createContract-modal"
    :no-close-on-backdrop="true"
  >
    <template #header>
      <div
        class="my-header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        "
      >
        <div>
          <span style="font-size: 20px">新建审批</span>
          <el-popover
            placement="bottom-start"
            title="B类合同有以下情形请勾选："
            :width="350"
            trigger="hover"
            ref="descPopoverRef"
            popper-style="{'width':'auto'}"
          >
            <template #reference>
              <i
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer; margin-left: 4px"
              ></i>
            </template>
            <div>
              <div>
                1.来源于客户委托的主要合同义务或者公司可以处理的业务需转委托他方办理的；
              </div>
              <div>2.有风险代理约定的；</div>
              <div>3.需要垫付程序性费用或保证金的；</div>
              <div>4.约定账期超过6个月的；</div>
              <div>5.服务收费标准低于通用报价20%以上的。</div>
            </div>
          </el-popover>
        </div>
        <div
          style="width: 16px; cursor: pointer"
          @click="hiddenModal"
        >
          <span class="btn-close"></span>
        </div>
      </div>
    </template>
    <ContractCreate
      @hiddenModal="hiddenModal"
      :contractInfo="contractInfo"
      :operateType="oparateType"
      @refresh="fetchDataFunc"
    />
  </b-modal>
  <b-modal
    v-model="isTemplateModalVisible"
    @hidden="hiddenTemplateModal"
    centered
    hide-footer
    hide-header
    size="lg"
    :lazy="true"
    style="padding: 0"
    dialog-class="template-modal"
  >
    <TemplateModal @hiddenTemplateModal="hiddenTemplateModal" />
  </b-modal>
</template>
<style lang="scss">
.offcanvas.offcanvas-end {
  width: 80%;
}
.card-body {
  flex: none;
}
.template-modal {
  max-width: 980px;
  width: 980px;
  .modal-body {
    padding: 0 !important;
  }
}
.createContract-modal {
  .modal-body {
    padding: 0 !important;
  }
  .modal-footer {
    margin-top: 0;
  }
}
.custom-tabs {
  .nav-link {
    padding: 6px 14px;
  }
}
.matter-number {
  min-width: 18px;
  height: 18px;
  color: #fff;
  background-color: #63c093;
  line-height: 18px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 4px;
  text-align: center;
  padding: 0 4px;
  display: inline-block;
}
</style>
