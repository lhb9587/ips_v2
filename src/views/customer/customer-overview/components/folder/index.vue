<template>
  <div class="config-top">
    <div class="config-breadcrumb">
      <div
        class="config-breadcrumb-item"
        @click="handleGoHome"
      >
        <i
          class="bx bx-home-alt"
          style="font-size: 18px"
        ></i>
      </div>
      <div
        class="config-breadcrumb-item"
        @click="handleGoBackOne"
        v-if="breadcrumbList.length > 1"
      >
        <i
          class="bx bx-left-arrow-alt"
          style="font-size: 18px"
        ></i>
      </div>
      <el-breadcrumb
        :separator-icon="ArrowRight"
        class="breadcrumb-custom"
      >
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbList"
          :key="`${item.value}-${index}`"
          :class="{
            'breadcrumb-clickable': index !== breadcrumbList.length - 1,
          }"
          @click="handleBreadcrumbClick(item, index)"
          >{{ item.label }}</el-breadcrumb-item
        >
      </el-breadcrumb>
    </div>
    <div
      class="config-right"
      v-if="currentLevel !== 'caseList'"
    >
      <div
        class="text-search"
        v-if="currentLevel !== 'classified'"
      >
        <div
          v-if="showTopSearch"
          class="text-search-input"
        >
          <el-input
            v-model="inputValue"
            style="width: 260px"
            placeholder="搜索..."
            @keyup.enter="fuzzySearch"
            class="top-search"
            ref="textSearchRef"
          >
            <template #prepend>
              <el-button @click="fuzzySearch">
                <i class="bx bx-search-alt"></i>
              </el-button>
            </template>
          </el-input>
          <div
            class="close-input"
            @click="closeInput"
          >
            <i
              class="mdi mdi-close"
              style="font-size: 18px"
            ></i>
          </div>
        </div>
        <div
          v-else
          class="search-icon"
          @click="showInput"
        >
          <i
            class="bx bx-search-alt"
            style="font-size: 18px"
          ></i>
        </div>
      </div>
      <div
        class="file-total"
        v-if="folderList?.length"
      >
        <!-- {{ folderList?.length }}条数据 -->
        {{ totalText }}
      </div>
    </div>
  </div>
  <div
    class="list-content"
    v-if="currentLevel !== 'caseList'"
    v-infinite-scroll="currentLevel === 'cust' ? loadMore : () => {}"
    :infinite-scroll-disabled="currentBusy || !currentHasMore"
    :infinite-scroll-distance="2"
    :infinite-scroll-immediate="false"
  >
    <div class="folder-list">
      <template v-if="currentLevel === 'cust'">
        <CustFolderItem
          v-for="(cust, index) in folderList"
          :key="index"
          :detailInfo="cust"
          @dblclick="handleEnterFolder(cust)"
          @popover-show="handleCustomerPopoverShow"
          :selected="cust.custId === selectedId"
          @select="selectedId = cust.custId"
          @view-details="viewCustDetail(cust)"
        />
      </template>
      <template v-if="currentLevel === 'classified'">
        <ClassifiedItem
          v-for="(item, index) in folderList"
          :key="index"
          @dblclick="handleEnterFolder(item)"
          :detailInfo="item"
          :selected="item.id === selectedId"
          @select="selectedId = item.id"
        />
      </template>
      <template v-if="['project', 'task', 'subtask'].includes(currentLevel)">
        <FolderItem
          v-for="item in folderList"
          :key="item.objId"
          :icon="folderItemInfo.icon"
          :icon-color="folderItemInfo.iconColor"
          :iconBgColor="folderItemInfo.iconBgColor"
          :itemType="folderItemInfo.itemType"
          :title="item.name"
          :priority="priorityListMap[item.priority]"
          :status-tag="statusListMap[item.status]"
          :item-count="item.childCount"
          :dueDate="item.dueDate"
          :owner="item.ownerName"
          @view-details="(payload) => viewTaskDetail(item, payload)"
          @dblclick="(payload) => handleEnterFolder(item, payload)"
        />
      </template>
    </div>
    <div
      class="empty-data"
      v-if="!folderList?.length"
    >
      <div class="empty-box">
        <div
          class="bx bx-folder"
          style="font-size: 64px; color: #62748e"
        ></div>
        <div
          style="
            margin-top: 12px;
            font-size: 18px;
            color: #62748e;
            font-weight: bold;
          "
        >
          暂无数据
        </div>
      </div>
    </div>
    <div
      class="more-customer"
      v-if="currentLevel === 'cust'"
    >
      <el-button
        v-if="myFollow === 1"
        :icon="ArrowDownBold"
        type="info"
        plain
        @click="changeCustFanwei(0)"
        >查看更多客户</el-button
      >
      <el-button
        v-else
        :icon="ArrowUpBold"
        type="info"
        plain
        @click="changeCustFanwei(1)"
        >显示我的客户</el-button
      >
    </div>
  </div>
  <div v-if="currentLevel === 'caseList'">
    <TrademarkList v-if="caseDomain === 3" />
    <PatentList v-if="caseDomain === 4" />
    <LitigationList v-if="caseDomain === 2" />
    <ProtectionList v-if="caseDomain === 1" />
    <DomainList v-if="caseDomain === 75" />
    <CopyrightList v-if="caseDomain === 76" />
    <NonlitigationList v-if="caseDomain === 86" />
    <AllCasesList v-if="caseDomain === 0" />
  </div>
  <DragSidebar
    :noCloseOnEsc="false"
    v-if="isShowPrjDetail"
    sidebarName="project-sidebar"
    v-model="isShowPrjDetail"
    @close="handlePrjSidebarUpdate"
  >
    <ProjectDetail
      @close="handlePrjSidebarUpdate"
      :project-id="objId"
  /></DragSidebar>
  <DragSidebar
    :noCloseOnEsc="false"
    v-if="taskDetailModelValue"
    sidebarName="task-sidebar"
    v-model="taskDetailModelValue"
    @close="closeTaskDetailModal"
    ><TaskDetail
      :taskId="objId"
      @close="closeTaskDetailModal"
      :taskType="taskType"
    />
  </DragSidebar>
  <CustomerSidebar
    :custId="custId"
    v-if="isShowCustDetail"
    :showSidebar="isShowCustDetail"
    @update:showSidebar="handleSidebarUpdate"
  />
</template>
<script setup>
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from "vue";
import CustFolderItem from "../folder-item/cust-folder.vue";
import ClassifiedItem from "../folder-item/classified-folder.vue";
import { queryCustomerListNew, queryCustomerCardNew } from "@/api/customerList";
import {
  ArrowRight,
  ArrowUpBold,
  ArrowDownBold,
} from "@element-plus/icons-vue";
import {
  queryFolderViewData,
  queryFolderViewTasks,
  queryFolderViewSubtasks,
} from "@/api/project.js";
import { statusListMap, priorityListMap } from "@/views/project/dataMap";
import FolderItem from "@/views/project/components/folder-item.vue";
//导入所有案件列表
import TrademarkList from "@/views/case/trademark";
import PatentList from "@/views/case/patent";
import LitigationList from "@/views/case/litigation";
import ProtectionList from "@/views/case/protection";
import DomainList from "@/views/case/domain";
import CopyrightList from "@/views/case/copyright";
import NonlitigationList from "@/views/case/nonlitigation";
import AllCasesList from "@/views/case/allcases";
//导入项目、事项详情
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import ProjectDetail from "@/views/project/components/project-detail/project-detail.vue";
import TaskDetail from "@/views/project/components/task/task-detail.vue";

import { useStore } from "vuex";
const store = useStore();

//面包屑状态
const currentLevel = ref("cust");
const currentLavelValue = ref("rust");
const breadcrumbList = ref([{ label: "客户", value: "cust" }]);
const levelOptions = {
  cust: "classified",
  mycase: "caseList",
  teamcase: "caseList",
  relatedprj: "project",
  project: "task",
  task: "subtask",
};
const folderItemInfo = computed(() => {
  const map = {
    project: {
      icon: "bx bx-folder-open",
      iconColor: "#e17100",
      iconBgColor: "#fcf3cb",
      itemType: "项目",
    },
    task: {
      icon: "mdi mdi-file-tree",
      iconColor: "#155dfc",
      iconBgColor: "#deeafc",
      itemType: "事项",
    },
    subtask: {
      icon: "bx bx-file",
      iconColor: "#6a7282",
      iconBgColor: "#f3f4f6",
      itemType: "子事项",
    },
  };
  return map[currentLavelValue.value] || map.project;
});
const currentInfo = ref({});
const folderList = ref([]);
const inputValue = ref();
const myFollow = ref(1);
const showTopSearch = ref(false);
const textSearchRef = ref();
// 滚动加载相关状态
const currentPage = ref(1);
const currentBusy = ref(false);
const currentHasMore = ref(true);
const isShowCustDetail = ref(false);
const custId = ref();
const objId = ref(null);
const taskType = ref(1); //1:事项 3:子事项
const customerList = ref([]);
const customerCardCache = new Map();
const customerCardRequestMap = new Map();

const totalText = computed(() => {
  const textMap = {
    cust: "客户",
    classified: "分类",
    project: "项目",
    task: "事项",
    subtask: "子事项",
  };
  return folderList.value?.length
    ? `${folderList.value.length}个${textMap[currentLevel.value]}`
    : "";
});

//事项详情
const taskDetailModelValue = ref(false);
const closeTaskDetailModal = () => {
  taskDetailModelValue.value = false;
  fetchFolderViewData();
};
//项目详情
const isShowPrjDetail = ref(false);
const handlePrjSidebarUpdate = () => {
  isShowPrjDetail.value = false;
  fetchFolderViewData();
};
const closeInput = () => {
  showTopSearch.value = false;
  inputValue.value = "";
  fetchFolderList("search");
};
const showInput = () => {
  showTopSearch.value = true;
  nextTick(() => {
    textSearchRef?.value?.focus();
  });
};
const fuzzySearch = () => {
  fetchFolderList("search");
};

const caseDomain = computed({
  get() {
    return store.state.case.caseDomain;
  },
  set(value) {
    store.commit("case/CHANGE_CASEDOMAIN", value);
  },
});

const changeCustFanwei = (value) => {
  myFollow.value = value;
  // 切换客户范围时重置分页
  fetchCustomerListNew();
};

const normalizeCustomerList = (list = []) => {
  return list.map((item) => {
    const cachedCustomerDto = customerCardCache.get(item.custId);
    return {
      ...item,
      customerDto: cachedCustomerDto ?? item.customerDto,
      customerCardLoading: customerCardRequestMap.has(item.custId),
    };
  });
};

const patchCustomerInLists = (custId, updater) => {
  const targetLists = [folderList.value, customerList.value].filter(
    (list, index, source) => Array.isArray(list) && source.indexOf(list) === index
  );

  targetLists.forEach((list) => {
    const targetIndex = list.findIndex((item) => item?.custId === custId);
    if (targetIndex === -1) {
      return;
    }

    const currentItem = list[targetIndex];
    list.splice(targetIndex, 1, {
      ...currentItem,
      ...updater(currentItem),
    });
  });
};

const setCustomerCardLoading = (custId, loading) => {
  patchCustomerInLists(custId, () => ({
    customerCardLoading: loading,
  }));
};

const mergeCustomerCardInfo = (custId, customerDto) => {
  patchCustomerInLists(custId, (currentItem) => ({
    customerDto: {
      ...(currentItem.customerDto || {}),
      ...(customerDto || {}),
    },
    customerCardLoading: false,
  }));
};

const loadCustomerCardInfo = async (custId) => {
  if (!custId) {
    return {};
  }

  if (customerCardCache.has(custId)) {
    return customerCardCache.get(custId) || {};
  }

  if (customerCardRequestMap.has(custId)) {
    return customerCardRequestMap.get(custId);
  }

  setCustomerCardLoading(custId, true);
  const requestPromise = queryCustomerCardNew(
    { custId },
    { isLoading: false }
  )
    .then((res) => {
      const customerDto = res.data || {};
      customerCardCache.set(custId, customerDto);
      mergeCustomerCardInfo(custId, customerDto);
      return customerDto;
    })
    .catch((error) => {
      setCustomerCardLoading(custId, false);
      throw error;
    })
    .finally(() => {
      customerCardRequestMap.delete(custId);
    });

  customerCardRequestMap.set(custId, requestPromise);
  return requestPromise;
};

const ensureCustomerCardInfo = async (item) => {
  if (!item?.custId) {
    return item?.customerDto || {};
  }

  if (customerCardCache.has(item.custId)) {
    return customerCardCache.get(item.custId) || {};
  }

  if (item.customerDto && Object.keys(item.customerDto).length) {
    customerCardCache.set(item.custId, item.customerDto);
    return item.customerDto;
  }

  return loadCustomerCardInfo(item.custId).catch(() => item?.customerDto || {});
};

const handleCustomerPopoverShow = (item) => {
  ensureCustomerCardInfo(item);
};

const handleEnterFolder = async (item) => {
  let nextLevel;
  if (currentLevel.value === "classified") {
    nextLevel = levelOptions[item.value];
    if (!item.total) {
      return 
    }
  } else {
    nextLevel = levelOptions[currentLevel.value];
  }
  if (!nextLevel) {
    return;
  }
  const detail =
    currentLevel.value === "cust"
      ? await ensureCustomerCardInfo(item)
      : item.customerDto || {};
  currentInfo.value = detail;
  currentLevel.value = nextLevel;
  breadcrumbList.value.push({
    id: item.custId || item.id || item.objId,
    label: item.name || item.fullname,
    value: nextLevel,
    myCaseCount: detail.myCaseCount,
    teamCount: detail.teamCount,
    myCaseField: detail?.myCaseField || [],
    teamField: detail?.teamField || [],
    projectSumCount: detail.projectSumCount,
  });
};
const viewTaskDetail = (values) => {
  objId.value = values.objId;
  if (currentLevel.value === "project") {
    isShowPrjDetail.value = true;
  } else if (currentLevel.value === "task") {
    taskType.value = 1;
    taskDetailModelValue.value = true;
  } else if (currentLevel.value === "subtask") {
    taskType.value = 3;
    taskDetailModelValue.value = true;
  }
};

const viewCustDetail = (values) => {
  custId.value = values.custId;
  isShowCustDetail.value = true;
};

const handleSidebarUpdate = (value) => {
  isShowCustDetail.value = value;
};

const fetchFolderList = (type) => {
  if (currentLevel.value === "cust") {
    if (type === "search") {
      fetchCustomerListNew();
    } else {
      folderList.value = customerList.value;
    }
  } else if (currentLevel.value === "classified") {
    const list = [
      {
        id: 1,
        name: "我的案件",
        value: "mycase",
        fields:
          breadcrumbList.value[breadcrumbList.value.length - 1].myCaseField,
        total:
          breadcrumbList.value[breadcrumbList.value.length - 1].myCaseCount,
      },
      {
        id: 2,
        name: "团队案件",
        value: "teamcase",
        fields: breadcrumbList.value[breadcrumbList.value.length - 1].teamField,
        total: breadcrumbList.value[breadcrumbList.value.length - 1].teamCount,
      },
      {
        id: 3,
        name: "项目",
        value: "relatedprj",
        total:
          breadcrumbList.value[breadcrumbList.value.length - 1].projectSumCount,
      },
    ];
    folderList.value = list;
  } else if (currentLevel.value === "caseList") {
    const type =
      breadcrumbList.value[breadcrumbList.value.length - 1]?.label ===
      "我的案件"
        ? 1
        : 2;
    store.commit("case/CHANGE_CASEDOMAIN", 0);
    store.commit("case/CHANGE_CASEBELONGTO", type);
    store.commit("layout/CHANGE_CASE_SHOWTYPE", "list");
    store.commit("case/CHANGE_BREADCRUMB", breadcrumbList.value);
  } else if (["project", "task", "subtask"].includes(currentLevel.value)) {
    fetchFolderViewData();
  }
};
//获取项目、事项、子事项列表
const fetchFolderViewData = () => {
  if (currentLevel.value === "project") {
    const params = {
      keyword: inputValue.value,
      viewMode: "project_priority",
      custId: breadcrumbList.value[1].id,
    };
    queryFolderViewData(params).then((res) => {
      folderList.value = res.data || [];
      currentLavelValue.value = currentLevel.value;
    });
  } else if (currentLevel.value === "task") {
    const params = {
      keyword: inputValue.value,
      projectId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
    };
    queryFolderViewTasks(params).then((res) => {
      folderList.value = res.data || [];
      currentLavelValue.value = currentLevel.value;
    });
  } else if (currentLevel.value === "subtask") {
    const params = {
      keyword: inputValue.value,
      taskId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
    };
    queryFolderViewSubtasks(params).then((res) => {
      folderList.value = res.data || [];
      currentLavelValue.value = currentLevel.value;
    });
  }
};
//返回上一级
const handleGoBackOne = () => {
  if (breadcrumbList.value.length <= 1) return;
  // 回退一步：去掉最后一个，并回到新的最后一个 level
  breadcrumbList.value = breadcrumbList.value.slice(0, -1);
  const last = breadcrumbList.value[breadcrumbList.value.length - 1];
  if (last) {
    currentLevel.value = last.value;
  }
};
//返回首页
const handleGoHome = () => {
  if (breadcrumbList.value.length <= 1) return;
  // 只保留第一个面包屑
  breadcrumbList.value = breadcrumbList.value.slice(0, 1);
  const first = breadcrumbList.value[0];
  if (first) {
    currentLevel.value = first.value;
  }
};
const handleBreadcrumbClick = (item, index) => {
  if (index === breadcrumbList.value.length - 1) {
    return;
  }
  breadcrumbList.value = breadcrumbList.value.slice(0, index + 1);
  if (currentLevel.value === item.value) {
    return;
  }
  currentLevel.value = item.value;
};

//获取客户列表
const fetchCustomerListNew = (reset = true) => {
  if (reset) {
    currentPage.value = 1;
    // folderList.value = [];
    currentHasMore.value = true;
  }

  if (currentBusy.value || !currentHasMore.value) return;
  currentBusy.value = true;

  const params = {
    myFollow: myFollow.value,
    pageSize: 50,
    pageNo: currentPage.value,
    keywords: inputValue.value,
  };
  queryCustomerListNew(params, { isLoading: true })
    .then((res) => {
      const customerData = normalizeCustomerList(res.data || []);
      if (reset) {
        folderList.value = customerData;
        customerList.value = customerData;
      } else {
        folderList.value = [...folderList.value, ...customerData];
        customerList.value = [...customerList.value, ...customerData];
      }

      // 判断是否还有更多数据
      if (customerData.length < 50) {
        currentHasMore.value = false;
      } else {
        currentPage.value += 1;
      }
      currentBusy.value = false;
    })
    .catch(() => {
      currentBusy.value = false;
    });
};
// 滚动加载更多数据
const loadMore = () => {
  if (
    currentLevel.value === "cust" &&
    !currentBusy.value &&
    currentHasMore.value
  ) {
    fetchCustomerListNew(false);
  }
};

watch(
  () => currentLevel.value,
  () => {
    inputValue.value = null;
    showTopSearch.value = false;
    fetchFolderList();
  },
  { immediate: true }
);
onMounted(() => {
  fetchFolderList("search");
});
onUnmounted(() => {
  store.commit("case/CHANGE_CASEDOMAIN", 0);
  store.commit("case/CHANGE_CASEBELONGTO", 1);
  store.commit("case/CHANGE_CASESTATUS", 0);
  store.commit("case/CHANGE_BREADCRUMB", []);
  store.commit("layout/CHANGE_CASE_SHOWTYPE", "folder");
});
</script>

<style lang="scss" scoped>
.config-top {
  padding: 8px 16px;
  border: 1px solid #e3e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.config-right {
  display: flex;
  gap: 12px;
  align-items: center;
  .text-search {
    .search-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: #e4e7ed;
      }
    }
    .text-search-input {
      position: relative;
      .close-input {
        position: absolute;
        top: 3px;
        right: 4px;
        cursor: pointer;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover {
          background-color: #e4e7ed;
        }
      }
    }
  }
}
.list-content {
  border: 1px solid #e3e8f0;
  padding: 16px;
  height: calc(100vh - 150px);
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow-y: auto;
  .folder-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(162px, 1fr));
    gap: 16px;
    width: 100%;
  }
}
.config-breadcrumb {
  display: flex;
  gap: 6px;
  justify-content: space-between;
  align-items: center;
  .breadcrumb-custom {
    :deep(.el-breadcrumb__inner) {
      height: 24px;
      display: flex;
      align-items: center;
    }
    :deep(.breadcrumb-clickable .el-breadcrumb__inner) {
      cursor: pointer;
      color: #62748e;
      border-radius: 4px;
      padding: 2px 6px;
      transition: background-color 0.2s ease;
      &:hover {
        color: #030a24;
        background-color: #e4e7ed;
      }
    }
  }
  .config-breadcrumb-item {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: #e4e7ed;
    }
  }
}
.more-customer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 120px;
}
.empty-data {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 48px 0 24px 0;
  .empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
