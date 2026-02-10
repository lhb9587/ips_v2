<template>
  <Layout>
    <div
      class="config-top"
      v-if="projectShowType === 'folder'"
    >
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
      <div class="config-right">
        <Tabs
          :tabList="showFirstTypeTabsList"
          :activeTab="firstActiveTab"
          @change="switchFirstTab"
          v-if="breadcrumbList.length === 1"
        />
        <div
          class="text-search"
          v-if="currentLevel !== 'caseList'"
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
        <div>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleCreateProject"
            v-if="
              (currentLevel === 'project' && firstActiveTab === 'project') ||
              (firstActiveTab === 'owner' && currentLevel === 'owner')
            "
            >新建项目</el-button
          >
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleCreateTask"
            v-if="currentLevel === 'task' && editPermissionLevel"
            >新建事项</el-button
          >
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleCreateTask"
            v-if="currentLevel === 'subtask' && editPermissionLevel"
            >新建子事项</el-button
          >
        </div>
        <div
          class="file-total"
          v-if="folderList?.length"
        >
          {{ totalText }}
        </div>
      </div>
    </div>
    <div
      class="list-content"
      v-if="projectShowType === 'folder'"
    >
      <div
        class="folder-list"
        v-if="folderList?.length"
      >
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
          @view-details="(payload) => viewDetail(item, payload)"
          @dblclick="(payload) => handleEnterFolder(item, payload)"
        />
      </div>
      <div
        class="empty-data"
        v-if="!folderList?.length"
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
          <div style="margin-top: 12px; font-size: 14px; color: #62748eb3">
            {{ emptyTextDesc }}
          </div>
        </div>
      </div>
    </div>

    <ProjectList v-if="projectShowType === 'list'" />
    <CreateProject
      v-model:visible="showCreateProjectModal"
      @success="handleCreateProjectSuccess"
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
      v-if="showCreateTaskModal"
      sidebarName="task-sidebar"
      v-model="showCreateTaskModal"
      @close="closeCreateTaskModal"
      ><CreateTask
        @close="closeCreateTaskModal"
        :taskType="taskType"
        :projectId="projectId"
        :objId="objId"
        :breadcrumbList="breadcrumbList"
        :relatedProject="currentInfo"
      />
    </DragSidebar>
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
  </Layout>
</template>
<script setup>
import { computed, ref, nextTick, onMounted, watch } from "vue";
import Tabs from "@/components/common/tabs";
import { Plus } from "@element-plus/icons-vue";
import Layout from "@/layouts/main";
import {
  queryFolderViewData,
  queryFolderViewTasks,
  queryFolderViewSubtasks,
  queryFolderViewSubtasksLevel4,
  checkEditPermission,
} from "@/api/project.js";
import ProjectList from "./components/table";
import FolderItem from "./components/folder-item.vue";
// import ProjectSidebar from "./components/project-detail/project-sidebar.vue";
// import taskCreateSidebar from "./components/task/task-create-sidebar.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import ProjectDetail from "./components/project-detail/project-detail.vue";
import TaskDetail from "./components/task/task-detail.vue";
import CreateTask from "./components/task/create-task.vue";
import CreateProject from "./components/create-project-modal/index.vue";
import { ArrowRight } from "@element-plus/icons-vue";
import { statusListMap, priorityListMap } from "./dataMap";
import { useStore } from "vuex";
const store = useStore();

//事项详情
const taskDetailModelValue = ref(false);
const closeTaskDetailModal = () => {
  taskDetailModelValue.value = false;
  fetchFolderViewData();
};
const closeCreateTaskModal = () => {
  showCreateTaskModal.value = false;
  fetchFolderViewData();
};
const objId = ref(null);
const projectId = ref(null);
const taskType = ref(1); //1:事项 3:子事项
const editPermissionLevel = ref(0);
//显示类型
const projectShowType = computed(() => {
  return store.state.layout.projectShowType;
});
const isShowPrjDetail = ref(false);
const handlePrjSidebarUpdate = () => {
  isShowPrjDetail.value = false;
  fetchFolderViewData();
};
const viewDetail = (values) => {
  console.log(values);
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
const currentInfo = ref({});
const handleEnterFolder = (item) => {
  currentInfo.value = item;
  const nextLevel = levelOptions.value[currentLevel.value];
  if (!nextLevel) {
    return;
  }
  const label = item.name;
  if (label) {
    breadcrumbList.value.push({
      label,
      value: nextLevel,
      id: item.objId,
      status: item.status,
      priority: item.priority,
      taskCode: item.objCode,
    });
  }
  currentLevel.value = nextLevel;
  if (nextLevel === "task" || nextLevel === "subtask") {
    checkEditPermissionFn(item.objId);
  }
};
//案件领域
const firstActiveTab = ref("project");
const showFirstTypeTabsList = [
  {
    label: "项目优先",
    value: "project",
    icon: "bx bx-buildings",
  },
  {
    label: "负责人优先",
    value: "owner",
    icon: "icon iconfont icon-users",
  },
];

const switchFirstTab = (value) => {
  if (firstActiveTab.value === value) {
    return;
  }
  firstActiveTab.value = value;
};

const levelOptions = computed(() => {
  return switchFirstTab.value === "project"
    ? {
        project: "task",
        task: "subtask",
      }
    : {
        owner: "project",
        project: "task",
        task: "subtask",
      };
});
const emptyText = computed(() => {
  if (currentLevel.value === "project") {
    return "项目为空";
  } else if (currentLevel.value === "task") {
    return "事项为空";
  } else if (currentLevel.value === "subtask") {
    return "子事项为空";
  } else if (currentLevel.value === "owner") {
    return "负责人为空";
  } else {
    return "";
  }
});

const emptyTextDesc = computed(() => {
  if (currentLevel.value === "project" || currentLevel.value === "owner") {
    return "这里还没有项目，创建一个开始吧";
  } else if (currentLevel.value === "task") {
    return "这个项目还没有事项，添加一个试试";
  } else if (currentLevel.value === "subtask") {
    return "还没有子事项，可以继续拆分任务";
  } else {
    return "";
  }
});

//搜索相关
const showTopSearch = ref(false);
const inputValue = ref(undefined);
const textSearchRef = ref(null);
const fuzzySearch = () => {
  fetchFolderViewData();
};
//获取文件夹一级数据
const fetchFolderViewData = () => {
  if (firstActiveTab.value === "project") {
    if (currentLevel.value === "project") {
      const params = {
        keyword: inputValue.value,
        viewMode:
          firstActiveTab.value === "project"
            ? "project_priority"
            : "owner_priority",
      };
      queryFolderViewData(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    } else if (currentLevel.value === "task") {
      const params = {
        keyword: inputValue.value,
        projectId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
      queryFolderViewTasks(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    } else if (currentLevel.value === "subtask") {
      const params = {
        keyword: inputValue.value,
        taskId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
      queryFolderViewSubtasks(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    }
  } else if (firstActiveTab.value === "owner") {
    if (currentLevel.value === "owner") {
      const params = {
        keyword: inputValue.value,
        viewMode:
          firstActiveTab.value === "project"
            ? "project_priority"
            : "owner_priority",
      };
      queryFolderViewData(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    } else if (currentLevel.value === "project") {
      const params = {
        keyword: inputValue.value,
        ownerId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
      queryFolderViewTasks(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    } else if (currentLevel.value === "task") {
      const params = {
        keyword: inputValue.value,
        projectId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
      queryFolderViewSubtasks(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    } else if (currentLevel.value === "subtask") {
      const params = {
        keyword: inputValue.value,
        taskId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
      queryFolderViewSubtasksLevel4(params).then((res) => {
        folderList.value = res.data || [];
        currentLevelValue.value = currentLevel.value;
      });
    }
  }
};
const showInput = () => {
  showTopSearch.value = true;
  nextTick(() => {
    textSearchRef?.value?.focus();
  });
};
const closeInput = () => {
  showTopSearch.value = false;
  inputValue.value = "";
  fetchFolderViewData()
};
const defaultBreadcrumbByTab = {
  project: { label: "项目", value: "project" },
  owner: { label: "负责人", value: "owner" },
};
const currentLevel = ref(defaultBreadcrumbByTab.project.value);
const currentLevelValue = ref(defaultBreadcrumbByTab.project.value); //解决获取子列表时，图标提前更新的问题定义的属性
//文件夹列表
const folderList = ref([]);
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
    owner: {
      icon: "bx bx-user",
      iconColor: "#9810fa",
      iconBgColor: "#d7f9fd",
      itemType: "负责人",
    },
  };
  return map[currentLevelValue.value] || map.project;
});

const totalText = computed(() => {
  return folderList.value?.length
    ? `${folderList.value.length}个${folderItemInfo.value.itemType}`
    : "";
});
//面包屑
const breadcrumbList = ref([]);
const initBreadcrumb = () => {
  const base =
    defaultBreadcrumbByTab[firstActiveTab.value] ||
    defaultBreadcrumbByTab.project;
  breadcrumbList.value = [{ ...base }];

  if (currentLevel.value !== base.value) {
    currentLevel.value = base.value;
  }
  console.log(currentLevel.value, "currentLevel.value");
};

watch(
  () => firstActiveTab.value,
  () => {
    initBreadcrumb();
  },
  { immediate: true }
);
watch(
  () => currentLevel.value,
  () => {
    inputValue.value = null;
    showTopSearch.value = false;
    fetchFolderViewData();
  },
  { immediate: true }
);
//检查创建权限
const checkEditPermissionFn = (id) => {
  const params = {
    [currentLevel.value === "task" ? "prjId" : "taskId"]: id,
  };
  checkEditPermission(params).then((res) => {
    if (res.success) {
      editPermissionLevel.value = res.data.editPermissionLevel || 0;
    }
  });
};
//打开创建项目弹窗
const showCreateProjectModal = ref(false);
const handleCreateProject = () => {
  showCreateProjectModal.value = true;
};
const handleCreateProjectSuccess = () => {
  fetchFolderViewData();
};
//创建事项弹窗
const showCreateTaskModal = ref(false);
const handleTaskSidebarUpdate = (value) => {
  showCreateTaskModal.value = value;
  //关闭弹窗时刷新页面
  if (!value) {
    fetchFolderViewData();
  }
};
const handleCreateTask = () => {
  if (currentLevel.value === "task") {
    taskType.value = 1;
  } else if (currentLevel.value === "subtask") {
    taskType.value = 3;
    projectId.value = breadcrumbList.value[breadcrumbList.value.length - 2]?.id;
  }
  objId.value = breadcrumbList.value[breadcrumbList.value.length - 1]?.id;
  handleTaskSidebarUpdate(true);
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
onMounted(() => {
  // fetchFolderViewData();
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
  height: 50px;
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
    gap: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(162px, 1fr));
    width: 100%;
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
