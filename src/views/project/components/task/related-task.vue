<template>
  <div class="task-container">
    <div class="title-box">
      <div class="content-title">
        引用其他事项({{ relatedTasks?.length || 0 }})
      </div>
      <div
        class="d-flex gap-2"
        v-if="editPermissionLevel"
      >
        <div
          class="clickable"
          style="display: flex; gap: 4px; align-items: center"
          v-show="!isExtendAddTasks"
          @click="isExtendAddTasks = true"
        >
          <i
            class="bx bx-plus"
            style="font-size: 14px"
          ></i>
          <span style="white-space: nowrap">添加事项</span>
        </div>
        <div
          class="clickable"
          style="display: flex; gap: 4px; align-items: center"
          v-show="isExtendAddTasks"
          @click="isExtendAddTasks = false"
        >
          <i
            class="bx bx-plus"
            style="font-size: 14px"
          ></i>
          <span style="white-space: nowrap">收起</span>
        </div>
      </div>
    </div>

    <!-- 已选事项显示区域 -->
    <div
      class="selected-tasks-section"
      v-if="relatedTasks.length"
    >
      <div class="selected-tasks-list">
        <div
          v-for="(item, index) in relatedTasks"
          :key="index"
          class="selected-task-item"
          :class="{ 'disabled-section': !item.hasPermission }"
          @click="handlePreviewTask(item)"
        >
          <div style="display: flex; align-items: center">
            <div
              class="bx bx-link"
              style="margin-right: 8px; font-size: 16px"
            ></div>
            <div class="task-info">
              <div class="task-info-main">
                <span class="task-name"
                  >{{ item.name }}
                  <span v-if="!item.hasPermission">🔒</span></span
                >
              </div>
              <div class="task-info-extra">
                <span class="task-prjOwnerName">{{ item.prjOwnerName }} •</span>
                <span class="task-prjName">{{ item.prjName }} •</span>
                <!-- <span class="task-taskCode">ID:{{ item.taskCode }} •</span> -->
                <span class="task-status">{{
                  statusListMap[item.status]
                }}</span>
                <span v-if="!item.hasPermission"> • 受限访问</span>
              </div>
            </div>
          </div>
          <span
            v-if="!item.hasPermission"
            class="added-tag"
            >已受限</span
          >
          <div
            class="task-actions"
            v-else
          >
            <el-tooltip
              content="查看事项"
              placement="top"
            >
              <i
                class="mdi mdi-eye-outline view-icon"
                @click.stop="handlePreviewTask(item)"
              ></i>
            </el-tooltip>
            <i
              class="mdi mdi-close-circle remove-task-icon"
              @click.stop="removeTask(item)"
              v-if="editPermissionLevel"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <div
      class="related-task-section"
      v-if="isExtendAddTasks"
    >
      <div class="related-task-search">
        <el-input
          v-model="taskSearchKeyword"
          placeholder="搜索事项ID、名称或所属项目..."
          clearable
          @keyup.enter="handleTaskSearch"
        >
          <template #prefix>
            <i class="bx bx-search related-task-search-icon"></i>
          </template>
          <template #append>
            <el-button
              type="primary"
              :loading="taskListLoading"
              @click="handleTaskSearch"
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="related-task-header">
        <el-checkbox
          v-model="selectAllTasks"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllTasks"
          style="margin-bottom: 0"
        >
          全选<span v-if="selectedTaskDetails?.length"
            >（已选{{ selectedTaskDetails?.length }}个）</span
          >
        </el-checkbox>
        <el-button
          type="primary"
          v-if="selectedTaskDetails?.length"
          @click="handleBatchAdd"
        >
          添加（{{ selectedTaskDetails?.length }}）
        </el-button>
      </div>
      <div class="related-task-body">
        <el-skeleton
          :rows="3"
          animated
          v-if="taskListLoading"
        />
        <el-empty
          v-else-if="!taskList.length"
          description="暂无符合条件的事项"
        />
        <div
          v-else
          class="related-task-list"
          v-infinite-scroll="loadMoreTasks"
          :infinite-scroll-disabled="
            loadingMore || taskListLoading || !hasMoreTasks || true
          "
          :infinite-scroll-distance="20"
        >
          <div
            v-for="(item, index) in taskList"
            :key="index"
            class="related-task-item"
            :class="{
              selected: selectedTaskDetails.some(
                (task) =>
                  task.taskId === item.taskId && task.objType === item.objType,
              ),
              disabled: isTaskAdded(item.taskId, item.objType),
            }"
          >
            <div class="task-item-left">
              <el-checkbox
                v-if="!isTaskAdded(item.taskId, item.objType)"
                :model-value="
                  selectedTaskDetails.some(
                    (task) =>
                      task.taskId === item.taskId &&
                      task.objType === item.objType,
                  )
                "
                :disabled="isTaskAdded(item.taskId, item.objType)"
                style="margin-bottom: 0"
                @update:model-value="(val) => toggleTaskSelection(val, item)"
              />
              <div class="task-info">
                <div class="task-info-main">
                  <span class="task-name">{{ item.name }}</span>
                </div>
                <div class="task-info-extra">
                  <span class="task-prjOwnerName"
                    >{{ item.prjOwnerName }}•</span
                  >
                  <span class="task-prjName">{{ item.prjName }}•</span>
                  <!-- <span class="task-taskCode">ID:{{ item.taskCode }}•</span> -->
                  <span class="task-status">{{
                    statusListMap[item.status]
                  }}</span>
                </div>
              </div>
            </div>
            <div class="task-item-right">
              <el-tooltip
                content="查看事项"
                placement="top"
              >
                <i
                  class="mdi mdi-eye-outline task-view-icon"
                  @click="handlePreviewTask(item)"
                ></i>
              </el-tooltip>
              <span
                v-if="isTaskAdded(item.taskId, item.objType)"
                class="added-tag"
                >已添加</span
              >
            </div>
          </div>
          <div class="list-status">
            <div
              v-if="loadingMore"
              class="loading-inline"
            >
              <span class="spinner"></span>
              <span class="status-text">加载中...</span>
            </div>
            <!-- <div
              v-else-if="!hasMoreTasks"
              class="status-text"
            >
              没有更多事项了
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  defineExpose,
  defineProps,
} from "vue";
import { ElInfiniteScroll } from "element-plus";
import { getAllTasklist } from "@/api/project";
import { statusListMap } from "../../dataMap";
import { ElMessageBox } from "element-plus";
import { addRelatedTask, removeRelatedTask } from "@/api/project";

const props = defineProps({
  defaultRelatedTasks: {
    type: Array,
    default: () => [],
  },
  objId: {
    type: Number,
    required: true,
  },
  objType: {
    type: Number,
    required: true,
  },
  editPermissionLevel: {
    type: Number,
    default: 1,
  },
});
const vInfiniteScroll = ElInfiniteScroll;

// const taskForm = ref({
//   name: "",
//   relatedTaskIds: [],
//   relatedTaskDetails: [],
// });

// 存储已选中的事项
const relatedTasks = ref([]);
const isExtendAddTasks = ref(false);
const taskSearchKeyword = ref("");
const taskList = ref([]);
const taskListLoading = ref(false);
const loadingMore = ref(false);
const hasMoreTasks = ref(true);
// const selectedTaskIds = ref([]);
const selectedTaskDetails = ref([]);
const selectAllTasks = ref(false);
const pagination = ref({
  pageNo: 1,
  pageSize: 20,
});

const selectedCountInCurrentList = computed(
  () =>
    taskList.value.filter((item) =>
      selectedTaskDetails.value.some(
        (task) => task.taskId === item.taskId && task.objType === item.objType,
      ),
    ).length,
);
const isIndeterminate = computed(() => {
  const selectedCount = selectedCountInCurrentList.value;
  return selectedCount > 0 && selectedCount < taskList.value.length;
});

// 检查事项是否已添加到relatedTasks
const isTaskAdded = (taskId, objType) => {
  return relatedTasks.value.some(
    (item) => item.taskId === taskId && item.objType === objType,
  );
};

// 监听 props.defaultRelatedTasks 的变化，当接口返回数据时同步更新
watch(
  () => props.defaultRelatedTasks,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      relatedTasks.value = [...newValue];
    } else {
      relatedTasks.value = [];
    }
    console.log(newValue, "引用事项数据@@");
  },
  { deep: true, immediate: true },
);

watch(
  () => taskList.value,
  () => {
    if (!taskList.value.length) {
      selectAllTasks.value = false;
      return;
    }
    const selectedCount = selectedCountInCurrentList.value;
    selectAllTasks.value =
      selectedCount > 0 && selectedCount === taskList.value.length;
  },
  { deep: true },
);
const toggleTaskSelection = (checked, taskItem) => {
  if (checked) {
    if (
      !selectedTaskDetails.value.some(
        (item) =>
          item.taskId === taskItem.taskId && item.objType === taskItem.objType,
      )
    ) {
      // selectedTaskIds.value.push(taskItem.taskId);
      selectedTaskDetails.value.push(taskItem);
    }
  } else {
    // const idIndex = selectedTaskIds.value.indexOf(taskItem.taskId);
    // if (idIndex > -1) {
    //   selectedTaskIds.value.splice(idIndex, 1);
    // }
    const detailIndex = selectedTaskDetails.value.findIndex(
      (item) =>
        item.taskId === taskItem.taskId && item.objType === taskItem.objType,
    );
    if (detailIndex > -1) {
      selectedTaskDetails.value.splice(detailIndex, 1);
    }
  }
};

const handleSelectAllTasks = (checked) => {
  if (checked) {
    taskList.value.forEach((item) => {
      // 排除已添加的项
      if (!isTaskAdded(item.taskId, item.objType)) {
        toggleTaskSelection(true, item);
      }
    });
  } else {
    taskList.value.forEach((item) => toggleTaskSelection(false, item));
  }
};

const fetchTaskList = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    taskListLoading.value = true;
    hasMoreTasks.value = true;
    if (pagination.value.pageNo === 1) {
      taskList.value = [];
    }
  }
  try {
    const params = {
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
    };
    if (taskSearchKeyword.value.trim()) {
      params.keyword = taskSearchKeyword.value.trim();
    }
    // 这里需要根据实际的API接口调整
    const res = await getAllTasklist(params);
    const list = res.data.taskList || [];
    list.forEach((item) => {
      item.hasPermission = true;
    });
    if (isLoadMore) {
      taskList.value = [...taskList.value, ...list];
    } else {
      taskList.value = list;
    }
    if (list.length < pagination.value.pageSize) {
      hasMoreTasks.value = false;
    }
  } finally {
    if (isLoadMore) {
      loadingMore.value = false;
    } else {
      taskListLoading.value = false;
    }
  }
};

const handleTaskSearch = (value) => {
  if (value === taskSearchKeyword.value) return;
  pagination.value.pageNo = 1;
  hasMoreTasks.value = true;
  fetchTaskList();
};

const handlePreviewTask = (taskItem) => {
  if (!taskItem.hasPermission) {
    ElMessageBox.alert("您没有权限查看该事项，请联系负责人申请权限", "提示", {
      confirmButtonText: "确定",
      type: "warning",
    });
    return;
  }
  if (!taskItem.objType) return;
  // 根据实际的路由调整
  console.log(taskItem, "taskItem信息");

  let targetUrl;
  if (taskItem.objType === 1) {
    targetUrl = `${window.location.origin}/v2/project/task-detail/${taskItem?.taskCode}`;
  } else {
    targetUrl = `${window.location.origin}/v2/project/subtask-detail/${taskItem?.taskCode}`;
  }
  window.open(targetUrl, "_blank");
};

const loadMoreTasks = () => {
  if (loadingMore.value || taskListLoading.value || !hasMoreTasks.value) return;
  pagination.value.pageNo += 1;
  fetchTaskList(true);
};

// 批量添加事项到已选列表
const handleBatchAdd = async () => {
  // 获取所有选中的事项详情
  const newTasks = selectedTaskDetails.value.filter(
    (item) =>
      !relatedTasks.value.some(
        (existing) =>
          existing.taskId === item.taskId && existing.objType === item.objType,
      ),
  );
  newTasks.forEach((item) => {
    item.hasPermission = true;
  });
  const params = {
    objId: props.objId,
    objType: props.objType,
    referenceList: newTasks.map((item) => ({
      referencedObjType: item.objType,
      referencedTaskId: item.taskId,
    })),
  };
  if (props.objId) {
    const res = await addRelatedTask(params);
    if (res.success) {
      // 将新选中的事项添加到relatedTasks
      relatedTasks.value = [...relatedTasks.value, ...newTasks];
      // 清空选中状态
      // selectedTaskIds.value = [];
      selectedTaskDetails.value = [];
      selectAllTasks.value = false;
    }
  } else {
    relatedTasks.value = [...relatedTasks.value, ...newTasks];
    // 清空选中状态
    // selectedTaskIds.value = [];
    selectedTaskDetails.value = [];
    selectAllTasks.value = false;
  }
};

// 从已选列表中移除事项
const removeTask = async (task) => {
  console.log(task, "task");
  const params = {
    objId: props.objId,
    objType: props.objType,
    referencedObjId: task.taskId,
    referencedObjType: task.objType,
  };
  const res = await removeRelatedTask(params);
  if (res.success) {
    const index = relatedTasks.value.findIndex(
      (item) => item.taskId === task.taskId && item.objType === task.objType,
    );
    if (index !== -1) {
      relatedTasks.value.splice(index, 1);
    }
  }
};

const getRelatedTasks = () => {
  console.log(relatedTasks.value, "relatedTasks.value");
  return relatedTasks.value || [];
};
// const fetchRelatedTasks = async () => {
//   const params = {
//     objId: props.objId,
//     objType: props.objType,
//   };
//   const res = await queryRelatedTasks(params);
//   if (res.data && res.data?.length) {
//     relatedTasks.value = res.data?.map((task) => ({
//       hasPermission: task.hasPermission,
//       taskId: task.referencedTaskId,
//       objType: task.objType,
//       name: task.referencedTask?.name,
//       prjName: task.referencedTask?.projectName,
//       taskCode: task.referencedTask?.taskCode,
//       status: task.referencedTask?.status,
//     }));
//   }

//   //   updateTaskFormTasks();
// };

defineExpose({
  getRelatedTasks,
});

onMounted(() => {
  //   fetchRelatedTasks();
  fetchTaskList();
});
</script>
<style lang="scss" scoped>
.task-container {
  margin-bottom: 16px;
  .title-box {
    display: flex;
    justify-content: space-between;
    .content-title {
      font-weight: bold;
      font-size: 14px;
    }
  }
}
.related-task-section {
  margin-top: 12px;
  border: 1px solid #e0e6f5;
  border-radius: 8px;
  padding: 16px;
  background: #f9fbff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.related-task-search {
  width: 100%;
}
.related-task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  color: #2d2f33;
}
.related-task-header .header-title {
  font-size: 16px;
}
.related-task-body {
  min-height: 160px;
  border: 1px dashed #d3daf0;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}
.related-task-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}
.related-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
}
.relatedsed-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
  border-color: #d9e4ff;
  background: #f5f8ff;
}
.related-task-item:hover {
  border-color: #d9e4ff;
  background: #f5f8ff;
}
.related-task-item.selected {
  border-color: #556ee6;
  background: #eef2ff;
}
.list-status {
  text-align: center;
  padding: 8px 0 0;
}
.loading-inline {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.status-text {
  font-size: 12px;
  color: #8c8c8c;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #d0d7ff;
  border-top-color: #556ee6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.task-item-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex: 1;
}
.task-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.task-info-main {
  display: flex;
  gap: 8px;
  font-weight: 600;
  color: #2d2f33;
}
.task-info-extra {
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: #848b9c;
}
.task-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #848b9c;
}
.task-view-icon {
  font-size: 18px;
  cursor: pointer;
  color: #909399;
  opacity: 0;
  transition: opacity 0.2s;
}
.view-icon {
  font-size: 18px;
  cursor: pointer;
  color: #909399;
}
.view-icon:hover {
  color: #556ee6;
}
.related-task-item:hover .task-view-icon {
  opacity: 1;
}
.task-view-icon:hover {
  color: #556ee6;
}
.related-task-search-icon {
  color: #c0c4cc;
}
.selected-tasks-section {
  margin-top: 12px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-title {
  font-weight: bold;
  font-size: 14px;
}
.clear-all-btn {
  color: #f56c6c;
  padding: 0;
}
.clear-all-btn:hover {
  color: #f78989;
}
.selected-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.selected-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #e0e6f5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.selected-task-item:hover .task-actions {
  opacity: 1;
}
.remove-task-icon {
  font-size: 18px;
  cursor: pointer;
  color: #909399;
}
.remove-task-icon:hover {
  color: #f56c6c;
}
.related-task-item.disabled {
  opacity: 0.7;
  background-color: #f5f7fa;
}
.related-task-item.disabled:hover {
  border-color: transparent;
  background-color: #f5f7fa;
}
.added-tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 12px;
  color: #848b9c;
  background-color: #ecf5ff;
  border-radius: 4px;
}
.task-view-icon.disabled {
  color: #c0c4cc !important;
  cursor: not-allowed;
}
.task-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
}
.disabled-section {
  opacity: 0.7;
  background-color: #f5f7fa;
  // cursor: not-allowed;
}
</style>
