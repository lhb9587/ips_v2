<template>
  <div class="config-top">
    <div class="config-breadcrumb">
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
          @click="handleRefresh"
        >
          <i
            class="mdi mdi-refresh"
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
    </div>
    <div class="config-right">
      <div
        class="text-search"
        v-if="currentLevel !== 'myTodos'"
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
  <div class="list-content">
    <div
      class="todo-folder-list"
      v-if="currentLevel === 'myTodos'"
    >
      <FolderItem
        title="合同审核"
        :count="contractTotal"
        :contentList="contractShowList"
        @dblclick="
          handleEnterFolder({
            id: 'contract',
            name: '合同审核',
            value: 'contract',
          })
        "
        @viewDetails="(payload) => viewConDetail(payload)"
      />
      <FolderItem
        title="项目事项"
        :count="taskTotal"
        :contentList="taskShowList"
        theme="purple"
        @dblclick="
          handleEnterFolder({
            id: 'mytask',
            name: '项目事项',
            value: 'mytask',
          })
        "
        @viewDetails="(payload) => viewTaskDetail(payload)"
      />
    </div>
    <div
      class="folder-list"
      v-else
    >
      <template v-if="currentLevel === 'contractList'">
        <ContractItem
          v-for="item in folderList"
          :detailInfo="item"
          :key="item.contractId"
          @viewDetails="viewConDetail(item)"
          @dblclick="viewConDetail(item)"
        />
      </template>
      <template v-if="['project', 'task', 'subtask'].includes(currentLevel)">
        <TaskFolderItem
          v-for="item in folderList"
          :key="item.objId"
          :icon="folderItemInfo(item.objType).icon"
          :icon-color="folderItemInfo(item.objType).iconColor"
          :iconBgColor="folderItemInfo(item.objType).iconBgColor"
          :itemType="folderItemInfo(item.objType).itemType"
          :title="item.name"
          :priority="priorityListMap[item.priority]"
          :status-tag="statusListMap[item.status]"
          :item-count="item.childCount"
          :dueDate="item.dueDate"
          :owner="item.ownerName || userInfo.name"
          @view-details="(payload) => viewTaskDetail(item, payload)"
          @dblclick="(payload) => handleEnterFolder(item, payload)"
        />
      </template>
    </div>
    <div
      class="empty-data"
      v-if="!folderList?.length && currentLevel !== 'myTodos'"
    >
      <div class="empty-box">
        <div
          class="bx bx-folder"
          style="font-size: 64px; color: #62748eb3"
        ></div>
        <div
          style="
            margin-top: 12px;
            font-size: 18px;
            color: #62748eb3;
            font-weight: bold;
          "
        >
          {{ emptyText }}
        </div>
        <!-- <div style="margin-top: 12px; font-size: 14px; color: #62748eb3">
        {{ emptyTextDesc }}
      </div> -->
      </div>
    </div>
  </div>
  <ContractSidebar
    :contractId="contractId"
    v-if="isShowConDetail"
    :showSidebar="isShowConDetail"
    @update:showSidebar="handleSidebarUpdate"
    @refresh="refreshContractList"
  />
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
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { getContractList } from "@/api/contract";
import {
  queryMyTasksAsOwner,
  queryOwnerProjects,
  queryOwnerTasksAndSubTasks,
  queryOwnerSubTasks,
} from "@/api/project";
import FolderItem from "./folder-item.vue";
import TaskFolderItem from "@/views/project/components/folder-item.vue";
import ContractItem from "./contract-item.vue";
import { ArrowRight } from "@element-plus/icons-vue";
import ContractSidebar from "@/views/management/contract-management/detail-sidebar";
import { statusListMap, priorityListMap } from "@/views/project/dataMap";
//导入项目、事项详情
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import ProjectDetail from "@/views/project/components/project-detail/project-detail.vue";
import TaskDetail from "@/views/project/components/task/task-detail.vue";
import { getUserInfo } from "@/utils/user";

const userInfo = getUserInfo() || {};

const contractTotal = ref(0);
const contractList = ref([]);
const contractShowList = ref([]);
const taskTotal = ref(0);
const taskList = ref([]);
const taskShowList = ref([]);
const currentLevel = ref("myTodos");
const breadcrumbList = ref([{ label: "任务", value: "myTodos" }]);
const folderList = ref([]);
const inputValue = ref();
const contractId = ref();
const isShowConDetail = ref(false);
const taskType = ref(1); //1:事项 3:子事项
const objId = ref();
const showTopSearch = ref(false);
const textSearchRef = ref(null);

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

const totalText = computed(() => {
  const textMap = {
    contractList: "合同待办",
    project: "项目",
    task: "事项",
  };
  return folderList.value?.length
    ? `${folderList.value.length}个${textMap[currentLevel.value] || "任务"}`
    : "";
});
const emptyText = computed(() => {
  if (currentLevel.value === "project") {
    return "项目为空";
  } else if (currentLevel.value === "task") {
    return "事项为空";
  } else if (currentLevel.value === "subtask") {
    return "子事项为空";
  } else if (currentLevel.value === "contractList") {
    return "合同审核为空";
  } else {
    return "";
  }
});

const closeInput = () => {
  showTopSearch.value = false;
  inputValue.value = "";
  fuzzySearch();
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

const handleSidebarUpdate = (value) => {
  isShowConDetail.value = value;
};

const levelOptions = {
  contract: "contractList",
  mytask: "project",
  project: "task",
  task: "subtask",
};

const folderItemInfo = (type) => {
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
  if (currentLevel.value === "project") {
    return map.project;
  }

  return map[type === 1 ? "task" : "subtask"];
};

const refreshContractList = async () => {
  await fetchContractList();
  folderList.value = contractList.value;
};
const fetchContractList = async () => {
  const params = {
    pageNo: 1,
    pageSize: 100,
    toBeReviewed: 1,
    keywords: inputValue.value,
  };
  const res = await getContractList(params);
  const data = res.data || [];
  contractList.value = data;
  contractShowList.value = data
    ?.filter((item) => item.contractName)
    .splice(0, 3);
  // .map((item) => item.contractName);
  contractTotal.value = res.total || 0;
  return data;
};

const fetchTaskList = () => {
  queryMyTasksAsOwner().then((res) => {
    const data = res.data || [];
    taskList.value = data;
    console.log(data, "data@@");
    taskShowList.value = data?.filter((item) => item.name).splice(0, 3);
    taskTotal.value = res.data?.length || 0;
  });
};
const handleRefresh = () => {
  fetchFolderList("search");
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
const handleEnterFolder = (values) => {
  if (["project", "task", "subtask"].includes(currentLevel.value)) {
    if (!values.childCount) {
      return;
    }
  }
  if (currentLevel.value === "myTodos") {
    if (values.id === "contract" && !contractTotal.value) {
      return;
    } else if (values.id === "mytask" && !taskTotal.value) {
      return;
    }
  }
  let nextLevel;
  if (currentLevel.value === "myTodos") {
    nextLevel = levelOptions[values.value];
  } else {
    nextLevel = levelOptions[currentLevel.value];
  }

  if (!nextLevel) {
    return;
  }
  currentLevel.value = nextLevel;
  breadcrumbList.value.push({
    id: values.id || values.objId,
    label: values.name,
    value: nextLevel,
  });
};
const viewTaskDetail = (values) => {
  objId.value = values.objId;
  if (currentLevel.value === "project") {
    isShowPrjDetail.value = true;
  } else {
    if (values.objType === 1) {
      taskType.value = 1;
      taskDetailModelValue.value = true;
    } else {
      taskType.value = 3;
      taskDetailModelValue.value = true;
    }
  }
};
const fetchFolderList = async (type) => {
  if (currentLevel.value === "myTodos") {
    init();
  } else if (currentLevel.value === "contractList") {
    if (type === "search") {
      folderList.value = await fetchContractList();
      console.log(folderList.value, "folderList.value@@@");
    } else {
      folderList.value = contractList.value;
    }
    console.log(folderList.value, "folderList.value");
  } else if (["project", "task", "subtask"].includes(currentLevel.value)) {
    fetchFolderViewData();
  } else {
    folderList.value = [];
  }
};
const viewConDetail = (values) => {
  contractId.value = values.contractId;
  isShowConDetail.value = true;
};
const fetchFolderViewData = () => {
  if (currentLevel.value === "project") {
    const params = {
      keyword: inputValue.value,
    };
    queryOwnerProjects(params).then((res) => {
      folderList.value = res.data.filter((item) => item.childCount > 0) || [];
    });
  } else if (currentLevel.value === "task") {
    const params = {
      keyword: inputValue.value,
      projectId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
    };
    queryOwnerTasksAndSubTasks(params).then((res) => {
      folderList.value = res.data || [];
    });
  } else if (currentLevel.value === "subtask") {
    const params = {
      keyword: inputValue.value,
      taskId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
    };
    queryOwnerSubTasks(params).then((res) => {
      folderList.value = res.data || [];
    });
  }
};
const init = () => {
  fetchContractList();
  fetchTaskList();
};
watch(
  () => currentLevel.value,
  () => {
    folderList.value = [];
    inputValue.value = null;
    showTopSearch.value = false;
    fetchFolderList();
  },
  { immediate: true },
);
onMounted(() => {
  init();
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
}
.list-content {
  border: 1px solid #e3e8f0;
  padding: 16px;
  height: calc(100vh - 150px);
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow-y: auto;
}
.todo-folder-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
  padding: 0 48px;

  /* 响应式布局：根据宽度调整每行显示的元素数量 */
  @media (min-width: 1426px) {
    grid-template-columns: repeat(4, minmax(280px, 1fr));
  }

  @media (min-width: 950px) and (max-width: 1425px) {
    grid-template-columns: repeat(3, minmax(280px, 1fr));
  }

  @media (max-width: 949px) {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}
.folder-list {
  gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(162px, 1fr));
  width: 100%;
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
