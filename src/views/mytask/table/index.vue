<script setup>
import GridView from "@/components/common/grid-table/index.vue";
import { ref, onUnmounted, onMounted, computed, watch } from "vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import { queryMyTaskList } from "@/api/project";
import { saveTableConfig } from "@/utils";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import TaskDetail from "@/views/project/components/task/task-detail.vue";
import ContractSidebar from "@/views/management/contract-management/detail-sidebar";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
const route = useRoute();
const store = useStore();

const bussId = 94;
const gridName = "CustomerInfoListGrid";
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
const isShowConDetail = ref(false);
const contractId = ref();
const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  fetchDataFunc();
};
const fetchDataFunc = () => {
  //卡片和表格的数据
  queryMyTaskList(
    {
      keyword: diminput.value,
      ...listQuery.value,
      ...formInline.value,
    },
    { isLoading: true }
  ).then((res) => {
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
  fetchDataFunc();
  requestData.value = {
    ...typeStr.data,
  };
};
const objId = ref();
const taskType = ref();
const taskDetailModelValue = ref(false);
const toggleSidebar = (params) => {
  taskType.value = params.data.taskType;
  if (taskType.value === "合同审核") {
    contractId.value = params.data.parentId;
    isShowConDetail.value = true;
    return;
  } else {
    objId.value = params.data.objectId;
    taskDetailModelValue.value = true;
  }
};

const closeTaskDetailModal = () => {
  taskDetailModelValue.value = false;
  fetchDataFunc();
};
const handleConSidebarUpdate = (val) => {
  isShowConDetail.value = val;
};
const mytaskCellRenderer = (params) => {
  const field = params.colDef.field;
  if (field == "taskName") {
    if (params.data.taskType == "事项" || params.data.taskType == "子事项") {
      const text = params.value || "";
      const lastSlashIndex = text.lastIndexOf("/");
      if (lastSlashIndex !== -1) {
        const beforeSlash = text.substring(0, lastSlashIndex + 1); // +1 包含斜杠
        const afterSlash = text.substring(lastSlashIndex + 1);
        return `<span style="color: #999">${beforeSlash}</span>${afterSlash}`;
      }
      return text;
    } else {
      return `<span title="${params.value}">${
        params.value || params.value === 0 ? params.value : ""
      }</span>`;
    }
  } else {
    return `<span title="${params.value}">${
      params.value || params.value === 0 ? params.value : ""
    }</span>`;
  }
};
const boxRef = ref(null);
const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
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
              <div
                class="d-flex"
                style="gap: 10px"
              >
                <el-input
                  v-model="diminput"
                  style="width: 200px"
                  placeholder="根据名称或编号搜索..."
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
                  keywords: diminput,
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
            :rowClick="toggleSidebar"
            :cellRenderer="mytaskCellRenderer"
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
            @pagination="fetchDataFunc"
            :pageSizes="pageSizesList"
          ></Pagination>
        </div>
      </div>
    </div>
    <DragSidebar
      :noCloseOnEsc="false"
      v-if="taskDetailModelValue"
      sidebarName="task-sidebar"
      v-model="taskDetailModelValue"
      @close="closeTaskDetailModal"
      ><TaskDetail
        :taskId="objId"
        @close="closeTaskDetailModal"
        :taskType="taskType === '事项' ? 1 : 3"
      />
    </DragSidebar>
    <ContractSidebar
      :contractId="contractId"
      v-if="isShowConDetail"
      :showSidebar="isShowConDetail"
      @update:showSidebar="handleConSidebarUpdate"
      @refresh="fetchDataFunc"
    />
  </div>
</template>
<style lang="scss" scoped>
.card-body {
  flex: none;
}
</style>
