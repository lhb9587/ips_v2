<script setup>
import GridView from "@/components/common/grid-table/index.vue";
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import Tabs from "@/components/common/tabs";
import { queryCaseList } from "@/api/caseList";
import { saveTableConfig } from "@/utils";
import { useStore } from "vuex";
import { useRoute,useRouter } from 'vue-router'
const store = useStore();
const route = useRoute();
const router = useRouter();

const bussId = 5;
const business = 2;
const gridName = "trademarkListGrid";
const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = list;
};
const defaultQueryData = computed(() => {
  if (showType.value==='folder' && route.path === '/case/case-folders') {
    const list = store.state.case.breadcrumbList || [];
    const caseTypeIndex = list.findIndex(item => item.value === "casetype") + 1
    const caseTypeId = list[caseTypeIndex]?.id || undefined
    const custIdIndex = list.findIndex(item => item.value === "customer") + 1
    const custId = list[custIdIndex]?.id || undefined
    return{
      caseTypeId,
      custIdArray: custId ? [custId] : [],
    }
  }else if(route.path === '/customer/customer-overview'){
    const list = store.state.case.breadcrumbList || [];
    const custIdIndex = list.findIndex(item => item.value ==="classified")
    const custId = list[custIdIndex]?.id || undefined
    return{
      custIdArray: custId ? [custId] : [],
    }
  }else{
    return {}
  }
});
//显示类型
const showType = computed(() => {
  return store.state.layout.caseShowType;
});
//案件状态
const caseStatus = computed({
  get() {
    return store.state.case.caseStatus;
  },
  set(value) {
    store.commit('case/CHANGE_CASESTATUS', value);
  }
});
const caseStatusTabsList = [
  {
    label: "进行中",
    value: 1,
  },
  {
    label: "所有状态",
    value: 0,
  },
];
const changeCaseStatusValue = (value) => {
  caseStatus.value = value;
  queryCaseListFunc()
};
//案件所属
const casebelongValue = computed({
  get() {
    return store.state.case.caseBelongTo;
  },
  set(value) {
    store.commit('case/CHANGE_CASEBELONGTO', value);
  }
});
const caseBelongTabsList = [
  {
    label: "我的案件",
    value: 1,
    icon: "bx bx-user",
  },
  {
    label: "团队案件",
    value: 2,
    icon: "icon iconfont icon-users",
  },
  {
    label: "所有案件",
    value: 3,
    icon: "bx bx-folder-open",
  },
];
const changeCasebelongValue = (value) => {
  casebelongValue.value = value;
  queryCaseListFunc()
};
//案件领域
const caseDomainValue = computed({
  get() {
    return store.state.case.caseDomain;
  },
  set(value) {
    store.commit("case/CHANGE_CASEDOMAIN", value);
  },
});
const caseDomainTabsList = [
  {
    label: "商标",
    value: 3,
  },
  {
    label: "专利",
    value: 4,
  },
  {
    label: "诉讼",
    value: 2,
  },
  {
    label: "保护",
    value: 1,
  },
  {
    label: "域名",
    value: 75,
  },
  {
    label: "著作权",
    value: 76,
  },
  {
    label: "非诉",
    value: 86,
  },
  {
    label: "全部",
    value: 0,
  },
];
const changeCaseDoaminValue = (value) => {
  caseDomainValue.value = value;
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
  if (newVal) {
    setTimeout(() => {
      activeClass.value.push("zebra");
    }, 100);
  } else {
    activeClass.value.splice(
      activeClass.value.findIndex((i) => i === "zebra"),
      1
    );
  }
  saveTableConfig("iszebra", gridName, newVal);
};
//密度
const rowHeight = ref(40);
const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};
const isFull = ref(false);
// const gridHeight = ref(document.documentElement.clientHeight - 260);

const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return showType.value === 'list'? windowHeight - 244 : windowHeight - 288;
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
const caseId = ref("");
const taskType = ref(1);
const isCaseDetail = ref(false);
const handleSidebarUpdate = (value) => {
  isCaseDetail.value = value;
};
let clickTimer = null;
const toggleSidebar = (params) => {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    return;
  }
  clickTimer = setTimeout(() => {
    caseId.value = params.data.caseId;
    isCaseDetail.value = true;
    const node = document.getElementById("cloneNode")
    if (node) {
      node.remove();
    }
    clickTimer = null;
  },250)
};
const rowDoubleClicked = (row) => {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
  router.push({
    name: 'case-detail',
    params: {
      caseId: row.data.caseId
    },
    query: {
      taskType: taskType.value
    }
  })
};
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});
// 模糊搜索
const diminput = ref("");
const gridData = ref([]);
const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  queryCaseListFunc();
};
const queryCaseListFunc = () => {
  //卡片和表格的数据
  queryCaseList({
    business: business,
    regAndAgent: diminput.value,
    ...defaultQueryData.value,
    ...listQuery.value,
    ...formInline.value,
    caseStatusId: caseStatus.value || undefined,
    caseOfMine: casebelongValue.value === 1 ? 1 : undefined,
    teamCase: casebelongValue.value === 2 ? 1 : undefined,
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
  // if (firstLoad.value) return
  formInline.value = { ...typeStr.data };
  tagList.value = typeStr.tagList || [];
  queryCaseListFunc();
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
const cellRenderer = (params) => {
  if (params.colDef.field == "imageFile") {
    let tyimage = "";
    if (/^tmFile|\/tmFile/.test(params.value)) {
      tyimage = `${params.value}`;
    } else {
      tyimage = `/ipdoc${params.value}`;
    }
    return params.value ? `<img class="filterTableTmg" style="height:28px" src="${tyimage}" alt="">` : "";
  }
  return `<span title="${params.value}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};
const handleMousemove = () => {
  document.querySelector(".main-content").onmouseover = function (e) {
    if (e.target.className == "filterTableTmg") {
      let cloneNode = e.target.cloneNode(true);
      cloneNode.setAttribute("id", "cloneNode");
      cloneNode.style.left = e.pageX + 10 + "px";
      cloneNode.style.top = e.pageY + "px";
      cloneNode.style.width = 200 + "px";
      cloneNode.style.height = "auto";
      cloneNode.style.zIndex = "3000";
      document.querySelector(".main-content").appendChild(cloneNode);
    }
  };
  document.querySelector(".main-content").onmouseout = function (e) {
    if (e.target.className == "filterTableTmg") {
      document.getElementById("cloneNode").remove();
    }
  };
};
onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  document.addEventListener("mousemove", handleMousemove);
});
onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
  document.removeEventListener("mousemove", handleMousemove);
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
              <div class="d-flex gap-2">
                <Tabs
                  :tabList="caseBelongTabsList"
                  :activeTab="casebelongValue"
                  @change="changeCasebelongValue"
                  theme="dark"
                />
                <Tabs
                  :tabList="caseDomainTabsList"
                  :activeTab="caseDomainValue"
                  @change="changeCaseDoaminValue"
                  theme="dark"
                  v-if="showType === 'list'"
                />
                <Tabs
                  :tabList="caseStatusTabsList"
                  :activeTab="caseStatus"
                  @change="changeCaseStatusValue"
                  theme="dark"
                />
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
              :height="gridHeight"
              :bussId="bussId"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :rowClick="toggleSidebar"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
              :rowDoubleClicked="rowDoubleClicked"
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
              @pagination="queryCaseListFunc"
              :pageSizes="pageSizesList"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="handleSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
</template>
<style lang="scss" scoped>
.card-body {
  flex: none;
}
</style>
