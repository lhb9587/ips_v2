<template>
  <div class="subtask-wrapper">
    <div class="subtask-header">
      <div class="subtask-title">子事项 ({{ taskList?.length }})</div>
      <!-- <el-button
        type="primary"
        class="create-btn"
        v-if="editPermissionLevel"
        @click="handleCreatsubTask"
      >
        <i class="bx bx-plus me-1"></i>
        创建子事项
      </el-button> -->
      <div
        class="clickable"
        style="display: flex; gap: 4px; align-items: center"
        v-show="editPermissionLevel"
        @click="handleCreatsubTask"
      >
        <i
          class="bx bx-plus"
          style="font-size: 14px"
        ></i>
        <span style="white-space: nowrap">创建子事项</span>
      </div>
    </div>

    <div class="subtask-list">
      <div
        v-for="item in taskList"
        :key="item.subtaskId"
        class="subtask-item"
        @click="handlePreviewTask(item)"
      >
        <div class="subtask-left">
          <div class="subtask-icon">
            <i class="bx bx-file"></i>
          </div>
          <div class="subtask-info">
            <div
              class="subtask-name"
              :class="{ 'subtask-complete': item.status === 2 }"
            >
              {{ item.name }}
            </div>
            <div class="subtask-meta">
              ID: {{ item.subtaskCode }} · 负责人：{{ item.ownerName }}
            </div>
          </div>
        </div>
        <div class="subtask-right">
          <el-tag
            size="small"
            class="subtask-status-tag"
            type="info"
          >
            {{ statusListMap[item.status] }}
          </el-tag>
          <div
            class="delete-btn"
            v-if="editPermissionLevel"
          >
            <el-tooltip
              content="删除子事项"
              placement="top"
            >
              <i
                class="bx bx-trash delete-icon"
                @click.stop="handleDeleteTask(item)"
              ></i>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, watch, ref, defineEmits } from "vue";
import { statusListMap } from "../../dataMap";
import { deleteSubtask } from "@/api/project";
import { ElMessage, ElMessageBox } from "element-plus";
const props = defineProps({
  subtaskList: {
    type: Array,
    default: () => [],
  },
  editPermissionLevel: {
    type: Number,
    default: 0,
  },
});
const emits = defineEmits(["createSubTask", "viewSubTaskDetail"]);
const taskList = ref([]);
watch(
  () => props.subtaskList,
  (newValue) => {
    if (newValue.length) {
      taskList.value = newValue;
    }
  },
  { deep: true, immediate: true },
);
const handleCreatsubTask = () => {
  emits("createSubTask");
};

const handleDeleteTask = (values) => {
  const params = {
    subtaskId: values.subtaskId,
  };
  ElMessageBox.confirm("确定删除该子事项吗？", "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(() => {
    deleteSubtask(params).then((res) => {
      if (res.success) {
        ElMessage.success("删除成功");
        taskList.value = taskList.value.filter(
          (item) => item.subtaskId !== values.subtaskId,
        );
      }
    });
  });
};
const handlePreviewTask = (taskItem) => {
  emits("viewSubTaskDetail", taskItem, 3);
};
</script>

<style scoped lang="scss">
.subtask-wrapper {
  margin-bottom: 16px;
}
.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-bottom: 16px;
  .subtask-title {
    font-size: 14px;
    font-weight: bold;
  }
  .create-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.subtask-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f9fbff;
  transition: box-shadow 0.2s;
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  }
  &:first-child {
    margin-top: 16px;
  }
}

.subtask-left {
  display: flex;
  align-items: center;
  gap: 12px;
  .subtask-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5c73f0;
    font-size: 18px;
  }
  .subtask-info {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    .subtask-name {
      font-weight: 500;
      color: #1f2937;
    }
    .subtask-meta {
      color: #6b7280;
    }
  }
}
.subtask-complete {
  text-decoration: line-through;
  color: #6b7280 !important;
}

.subtask-right {
  display: flex;
  align-items: center;
  gap: 12px;
  .subtask-status-tag {
    border-radius: 999px;
  }
  .delete-btn {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .delete-icon {
    font-size: 20px;
    color: #94a3b8;
    cursor: pointer;
    &:hover {
      color: #f87171;
    }
  }
}

.subtask-item:hover .delete-btn {
  opacity: 1;
  pointer-events: auto;
}
</style>
