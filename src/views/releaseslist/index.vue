<script setup>
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import { ref, onUnmounted, onMounted, computed, watch } from "vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import { queryReleaseList } from "@/api/releases";
import ReleasesCreate from "@/views/releaseslist/components/releases-create.vue";
import ReleasesInfo from "@/views/releaseslist/components/releases-info.vue";
import { deleteRelease, queryReleaseById } from "@/api/releases";
import { ElMessage, ElMessageBox } from "element-plus";
import { saveTableConfig } from "@/utils"
import { useStore } from "vuex";
const store = useStore();

const bussId = 88;
const gridName = "releaseListGrid"
const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = list;
  columnList.value.push({ title: "操作", value: "handle" });
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
const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});
// 模糊搜索
const diminput = ref(undefined);
const gridData = ref([]);
const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  queryListFunc();
};
const queryListFunc = () => {
  //卡片和表格的数据
  queryReleaseList({
    keyword: diminput.value,
    ...listQuery.value,
    ...formInline.value,
  },{isLoading: true}).then((res) => {
    gridData.value = res.data || [];
    total.value = res.total || 0;
  });
};
const tagList = ref([]);
const requestData = ref(undefined);
const handleSearch = (typeStr) => {
  diminput.value = undefined;
  formInline.value = { ...typeStr.data };
  tagList.value = typeStr.tagList || [];
  queryListFunc();
  requestData.value = {
    ...typeStr.data,
  };
};
const boxRef = ref(null);
const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};
const createHandle = () => {
  modalState.value = true;
  oparateType.value = "create";
};
const releaseCreateRef = ref(null);

const modalState = ref(false);
const hiddenModal = () => {
  releaseCreateRef.value.resetForm();
  releaseInfo.value = {};
  modalState.value = false;
};

const oparateType = ref("create");

const releaseInfo = ref({});

const infoModalState = ref(false);
const hiddenInfoModal = () => {
  releaseInfo.value = {};
  infoModalState.value = false;
};
const fetchReleaseInfo = (id,type) => {
  queryReleaseById({ releaseId: id }).then((res) => {
    if (res.success) {
      releaseInfo.value = res.data || {};
      if (type === 'mod') {
        modalState.value = true;
      }else{
        infoModalState.value = true;
      }
    }
  });
};
const cellRenderer = (params) => {
  if (params.colDef.field === "handle") {
    const clickReleaseHandle = (id, type) => {
      if (type == "del") {
        ElMessageBox.confirm("该操作将删除此条发布信息，是否继续？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          deleteRelease({ releaseId: id }).then((res) => {
            if (res.success) {
              ElMessage.success("删除成功");
              queryListFunc();
            }
          });
        });
      } else if (type == "mod") {
        oparateType.value = type;
        fetchReleaseInfo(id,type);
      } else if (type == "see") {
        fetchReleaseInfo(id,type);
      }
    };
    window.clickReleaseHandle = clickReleaseHandle;
    return `<div>
      <span link style="color: #4A8DDC;cursor: pointer" onclick="clickReleaseHandle(${params.data.releaseId}, 'see')">查看</span>
      <span link style="color: #4A8DDC;cursor: pointer" onclick="clickReleaseHandle(${params.data.releaseId}, 'mod')">编辑</span>
      <span link style="color: #F56C6C;cursor: pointer" onclick="clickReleaseHandle(${params.data.releaseId}, 'del')">删除</span>
      </div>`;
  } else {
    return `<span title="${params.value}">${
      params.value || params.value === 0 ? params.value : ""
    }</span>`;
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
        <div
          class="card box"
          ref="boxRef"
        >
          <div class="card-body" style="padding-bottom: 10px;">
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
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
                    :buss-id="bussId"
                    :is-show="true"
                    @search="handleSearch"
                    ref="searchRef"
                  >
                  </ListSearch>
                </div>
              </span>
              <div class="flex-shrink-0">
                <div class="d-flex">
                  <el-button
                    type="primary"
                    @click="createHandle"
                    >新建</el-button
                  >
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
                      keyword: diminput,
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
              :cell-renderer="cellRenderer"
            />
          </div>
          <div
            class="card-body border-bottom"
            v-if="total > 0"
            style="padding-top: 10px;"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              @pagination="queryListFunc"
              :pageSizes="pageSizesList"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  <b-modal
    v-model="modalState"
    @hidden="hiddenModal"
    :no-close-on-backdrop="true"
    :title="oparateType == 'create' ? '新建发布说明' : '编辑发布说明'"
    centered
    hide-footer
    size="lg"
    :no-close-on-esc="true"
    :lazy="true"
    body-class="modal-form"
  >
    <ReleasesCreate
      @hiddenModal="hiddenModal"
      @updateList="queryListFunc"
      ref="releaseCreateRef"
      :releaseInfo="releaseInfo"
      :operateType="oparateType"
    />
  </b-modal>
  <b-modal
    v-model="infoModalState"
    @hidden="hiddenInfoModal"
    centered
    hide-footer
    size="lg"
    :lazy="true"
    style="z-index: 2024;"
    body-class="view-form"
    ><ReleasesInfo :releaseInfo="releaseInfo"
  /></b-modal>
</template>
<style scoped>
.card-body {
  flex: none;
}

.releaseForm .el-form-item {
  display: block;
}
</style>

<style lang="scss">
.modal-form {
  // max-height: 86vh !important;
  padding: 0;
}
.view-form{
  padding: 0 !important;
}
</style>
