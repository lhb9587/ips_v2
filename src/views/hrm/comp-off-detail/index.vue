<!-- 调休明细表列表页，负责按周期范围分页查询员工调休额度生成、使用、失效和剩余情况。 -->
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { saveTableConfig } from "@/utils";
import { queryCompOffDetailPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 477;
const gridName = "compOffDetailGrid";
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const gridData = ref([]);
const total = ref(0);
const columnList = ref([]);
const deptCodes = ref([]);
const keyword = ref("");

const formInline = ref({
  deptCode: "",
});

const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const attendanceOrganizationOptions = computed(() => {
  const scope = store.getters["attendanceScope/scope"] || {};
  if (Array.isArray(scope?.deptScopeTree) && scope.deptScopeTree.length > 0) {
    return scope.deptScopeTree;
  }
  return store.getters["attendanceScope/deptScopes"] || [];
});

const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const calculateGridHeight = () => {
  const windowHeight = document.documentElement.clientHeight;
  if (store.state.layout.embedMode) {
    return windowHeight - 135;
  }
  const layout = store.state.layout.layoutType;
  if (layout === "vertical") {
    return windowHeight - 235;
  }
  return windowHeight - 290;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => [store.state.layout.layoutType, store.state.layout.embedMode],
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 50;
  return Math.min(pageSize, 200);
};

listQuery.value.pageSize = fetchLocalPageSize();

const changeBorder = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("Borderline")) {
      activeClass.value.push("Borderline");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "Borderline");
  }
  saveTableConfig("isBorderline", gridName, newVal);
};

const changeRowStyle = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("zebra")) {
      activeClass.value.push("zebra");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "zebra");
  }
  saveTableConfig("iszebra", gridName, newVal);
};

const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!element) {
    return;
  }
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

const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};

const buildQueryParams = () => {
  const talentKeyword = keyword.value.trim();
  return {
    pageNo: listQuery.value.pageNo,
    pageSize: Math.min(listQuery.value.pageSize, 200),
    deptCode: formInline.value.deptCode || undefined,
    talentName: talentKeyword || undefined,
  };
};

const normalizeRecord = (item = {}, index = 0) => ({
  ...item,
  id:
    item.id ||
    `${item.talentCode || "talent"}-${item.periodName || "period"}-${index}`,
  sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
});

const fetchCompOffDetailList = () => {
  queryCompOffDetailPage(buildQueryParams(), { isLoading: true })
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      gridData.value = records.map((item, index) => normalizeRecord(item, index));
      total.value = Number(res?.total || 0);
      if (Number(res?.currPage)) {
        listQuery.value.pageNo = Number(res.currPage);
      }
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchCompOffDetailList();
};

const handlePagination = () => {
  fetchCompOffDetailList();
};

const handleDeptChange = (value) => {
  const nextCodes = Array.isArray(value) ? value : [];
  deptCodes.value = nextCodes;
  formInline.value.deptCode = nextCodes.length ? nextCodes[nextCodes.length - 1] : "";
  fuzzySearch();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchCompOffDetailList();
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
          ref="boxRef"
          class="card box"
          style="margin-bottom: 0;"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex comp-off-detail__toolbar"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="keyword"
                    class="top-search"
                    style="width: 220px"
                    placeholder="请输入员工姓名"
                    clearable
                    @keyup.enter="fuzzySearch"
                    @clear="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-cascader
                    v-model="deptCodes"
                    class="comp-off-detail__cascader"
                    :options="attendanceOrganizationOptions"
                    :props="{
                      checkStrictly: true,
                      emitPath: true,
                      value: 'deptCode',
                      label: 'deptName',
                    }"
                    clearable
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择组织"
                    @change="handleDeptChange"
                  />
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: keyword,
                  }"
                  :isFull="isFull"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                />
              </div>
            </div>
          </div>

          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :bussId="bussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
            />
          </div>

          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :total="total"
              :pageSizes="pageSizesList"
              @pagination="handlePagination"
            />
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.comp-off-detail__toolbar {
  flex-wrap: wrap;
}

:deep(.comp-off-detail__cascader.el-cascader) {
  width: 260px;
}
</style>
