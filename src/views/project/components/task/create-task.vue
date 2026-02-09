<template>
  <div class="h-100">
    <div class="detail-header">
      <div class="detail-header-left">
        <div v-if="taskType === 1">
          <div class="detail-title">创建事项</div>
          <div class="detail-desc">
            为项目 "{{ relatedProject.projectName || relatedProject.name }}"
            创建新事项
          </div>
        </div>
        <div v-else>
          <div class="detail-title">创建子事项</div>
          <div class="detail-desc">
            为事项 "{{ relatedProject.name }}" 创建子事项
          </div>
        </div>
      </div>
      <div class="detail-header-right">
        <el-tooltip
          content="关闭"
          placement="top"
        >
          <div
            class="detail-header-config mdi mdi-window-close"
            @click="closeSideBar"
          ></div>
        </el-tooltip>
      </div>
    </div>
    <div class="detail-content">
      <div class="content-left">
        <div class="content-item">
          <div style="display: flex; gap: 3px; margin-bottom: 6px">
            <span class="content-title">名称</span
            ><span class="required">*</span>
          </div>
          <div>
            <el-input
              v-model="taskForm.name"
              placeholder="请输入事项名称"
            ></el-input>
          </div>
        </div>
        <div class="content-item">
          <div class="content-title">描述</div>
          <Editor
            :modelValue="taskForm.description"
            @onEditorReady="handleEditorReady"
            :excludeKeys="descExcludeKeys"
            height="200px"
          />
        </div>
        <div class="content-item">
          <div class="content-title">附件</div>
          <UploadFile
            :objType="taskType"
            ref="uploadFileRef"
          />
        </div>
        <RelatedCase ref="relatedCaseRef" />
        <RelatedTask ref="relatedTaskRef" />
      </div>
      <div class="content-right">
        <div class="content-item">
          <div class="content-title">关联项目</div>
          <div class="project-card">
            <div class="project-icon-wrapper">
              <i class="bx bx-folder-open project-icon"></i>
            </div>
            <div class="project-info">
              <div class="project-name">
                {{
                  relatedProject.projectName ||
                  relatedProject.name ||
                  relatedProjectInfo.name
                }}
              </div>
              <div class="project-status">
                {{
                  statusListMap[relatedProject.projectStatus] ||
                  statusListMap[relatedProject.status] ||
                  statusListMap[relatedProjectInfo.status]
                }}
                ·
                {{
                  priorityListMap[relatedProject.projectPriority] ||
                  priorityListMap[relatedProject.priority] ||
                  priorityListMap[relatedProjectInfo.priority]
                }}
              </div>
            </div>
          </div>
        </div>
        <div
          class="content-item"
          v-if="taskType === 3"
        >
          <div class="content-title">父事项</div>
          <div class="project-card">
            <div class="project-icon-wrapper">
              <i class="mdi mdi-file-tree project-icon"></i>
            </div>
            <div class="project-info">
              <div class="project-name">{{ relatedProject.name }}</div>
              <div class="project-status">
                {{ statusListMap[relatedProject.status] }} ·
                {{ priorityListMap[relatedProject.priority] }}
              </div>
            </div>
          </div>
        </div>
        <TaskDetailEdit ref="taskEditRef" />
      </div>
    </div>
    <div class="detail-footer">
      <div class="footer-left">创建事项 · 按ESC键关闭</div>
      <div class="footer-right">
        <el-button @click="closeSideBar">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm()"
          >{{ taskType === 1 ? "创建事项" : "创建子事项" }}</el-button
        >
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineEmits, ref, defineProps, computed } from "vue";
import Editor from "@/components/common/editor/index.vue";
import RelatedCase from "./related-case.vue";
import RelatedTask from "./related-task.vue";
import TaskDetailEdit from "./task-baseinfo-edit.vue";
import { ElMessage } from "element-plus";
import { createTaskUrl, createSubtask } from "@/api/project";
import { statusListMap, priorityListMap } from "../../dataMap";
import UploadFile from "./upload-file.vue";

const emits = defineEmits(["close"]);
const props = defineProps({
  objId: {
    type: Number,
    required: true,
  },
  taskType: {
    type: Number,
    default: 1,
  },
  projectId: {
    type: Number,
  },
  relatedProject: {
    type: Object,
    default: () => {},
  },
  breadcrumbList: {
    type: Array,
    default: () => [],
  },
});
const taskEditRef = ref(null);
const relatedCaseRef = ref(null);
const relatedTaskRef = ref(null);
const uploadFileRef = ref(null);
const objId = computed(() => props.objId);
const projectId = computed(() => props.projectId);
const taskForm = ref({});
const descExcludeKeys = ref([
  "blockquote",
  "emotion",
  "bgColor",
  "insertLink",
  "insertTable",
  "fullScreen",
  "group-image",
  "group-video",
  "group-indent",
  "group-justify",
  "group-more-style",
  "divider",
  "lineHeight",
]);
const handleEditorReady = (editor) => {
  // 当编辑器准备就绪后，保存编辑器实例
  taskForm.value.description = editor;
};
const closeSideBar = () => {
  emits("close");
};

const relatedProjectInfo = computed(() => {
  if (props.taskType === 2) {
    return props.breadcrumbList[props.breadcrumbList.length - 2];
  } else {
    return {};
  }
});

// const fatherTask = computed(() => {
//   if (props.taskType === 3) {
//     return props.breadcrumbList[props.breadcrumbList.length - 1];
//   } else {
//     return null;
//   }
// });

const submitForm = () => {
  let params = {
    name: taskForm.value.name,
    description: taskForm.value.description,
  };
  if (props.taskType === 1) {
    params.projectId = objId.value;
  } else {
    params.taskId = objId.value;
    params.projectId = projectId.value;
  }

  if (!params.name) {
    return ElMessage.warning("请填写事项名称");
  }
  const cases = relatedCaseRef.value.getRelatedCases();
  if (cases.length) {
    params.caseList = cases.map((item) => ({
      caseId: item.caseId,
      caseName: item.caseName,
      agentNum: item.agentNum,
    }));
  }
  const tasks = relatedTaskRef.value.getRelatedTasks();
  if (tasks.length) {
    params.referenceList = tasks.map((item) => ({
      referencedObjType: item.objType,
      referencedTaskId: item.taskId,
    }));
  }

  const materialList = uploadFileRef.value.getUploadedFiles();
  if (materialList?.length) {
    params.materialList = materialList.map((file) => ({
      materialId: file.materialId,
    }));
  }
  const data = taskEditRef.value.getFormData();
  if (data) {
    if (props.taskType === 1) {
      createTaskUrl({ ...data, ...params }).then((res) => {
        if (res.success) {
          res.message && ElMessage.success(res.message);
          closeSideBar();
        }
      });
    } else {
      // 创建子事项
      createSubtask({ ...data, ...params }).then((res) => {
        if (res.success) {
          res.message && ElMessage.success(res.message);
          closeSideBar();
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  .detail-header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .detail-title {
      font-size: 20px;
      font-weight: bold;
    }
    .detail-desc {
      color: #62748e;
    }
  }
  .detail-header-config {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    &:hover {
      background-color: #e0e6f5;
    }
  }
}
.detail-content {
  height: calc(100% - 124px);
  display: flex;
  .content-left {
    flex: 1;
    padding: 16px 16px 16px 0;
    border-right: 1px solid #e0e6f5;
    max-height: 100%;
    overflow-y: auto;
    height: 100%;
  }
  .content-item {
    margin-bottom: 16px;
  }
  .content-right {
    padding: 16px 0 16px 16px;
    width: 400px;
    max-height: 100%;
    overflow-y: auto;
    height: 100%;
  }
}

.content-title {
  font-weight: bold;
  font-size: 14px;
}
.required {
  color: red;
}

.project-card {
  margin-top: 12px;
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.project-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}

.project-icon {
  font-size: 24px;
  color: #606266;
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.project-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-status {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  .footer-left {
    font-size: 14px;
  }
}
</style>
