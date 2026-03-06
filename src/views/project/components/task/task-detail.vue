<template>
  <div
    class="h-100 task-detail-container"
    ref="taskDetailRef"
  >
    <div class="detail-header">
      <div class="detail-header-left">
        <div class="project-info">
          <div class="detail-title">
            <div v-if="localTaskType === 1">
              <span
                class="detail-link"
                @click="viewProDetail(detailInfo?.projectCode)"
                >{{ detailInfo.projectName }}</span
              >
              /
              <span class="task-code">{{ detailInfo?.taskCode }}</span>
            </div>
            <div v-else>
              <span
                class="detail-link"
                @click="viewProDetail(detailInfo?.projectCode)"
                >{{ detailInfo.projectName }}</span
              >
              /
              <span
                class="detail-link"
                @click="viewTaskDetail(detailInfo, 1)"
                >{{ detailInfo?.taskCode }}-{{ detailInfo.taskName }}</span
              >
              /
              <span class="task-code">{{ detailInfo?.subtaskCode }}</span>
            </div>
          </div>
          <div class="detail-name-wrapper">
            <div
              v-if="!isEdit"
              class="detail-name"
            >
              {{ detailInfo.name }}
            </div>
            <input
              v-else
              ref="taskNameInputRef"
              class="detail-name detail-name-input"
              v-model="editingName"
              placeholder="请输入事项名称"
            />
          </div>
        </div>
      </div>
      <div class="detail-header-actions">
        <div v-if="editPermissionLevel === 1">
          <el-button
            :icon="EditPen"
            @click="startEdit"
            v-if="!isEdit"
            >编辑</el-button
          >
          <template v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button
              :icon="MessageBox"
              type="primary"
              @click="saveTaskInfo"
              >保存</el-button
            >
          </template>
        </div>
        <el-tooltip
          content="复制链接"
          placement="top"
        >
          <div
            class="detail-header-config bx bx-link-alt"
            @click="copyLink"
          ></div>
        </el-tooltip>
        <el-tooltip
          content="全屏查看"
          placement="top"
        >
          <div
            class="detail-header-config mdi mdi-arrow-top-right-bottom-left"
            @click="toggleFullscreen"
          ></div>
        </el-tooltip>
        <el-tooltip
          content="删除"
          placement="top"
          v-if="editPermissionLevel === 1"
        >
          <div
            class="detail-header-config bx bx-trash delete-icon"
            @click="handleDeleteTask"
          ></div>
        </el-tooltip>
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
          <div class="desc-header">
            <div class="content-title">描述</div>
            <div
              class="desc-action"
              v-if="!isEdit && editPermissionLevel"
            >
              <div
                class="d-flex gap-3"
                v-if="isDescEdit"
              >
                <span
                  style="cursor: pointer"
                  @click="cancelDescEdit"
                  >取消</span
                >
                <div
                  class="d-flex gap-2 clickable align-items-center"
                  @click="saveDescInfo"
                >
                  <el-icon><MessageBox /></el-icon>
                  <span>保存</span>
                </div>
              </div>
              <div
                class="d-flex gap-2 clickable align-items-center"
                @click="isDescEdit = true"
                v-else
              >
                <i
                  class="bx bx-edit-alt"
                  style="font-size: 14px"
                ></i>
                <span>编辑</span>
              </div>
            </div>
          </div>
          <div
            class="content-desc"
            v-if="!isEdit && !isDescEdit"
          >
            <div
              v-html="detailInfo.description"
              v-if="detailInfo.description"
            ></div>
            <div
              v-else
              style="color: #909399"
            >
              点击编辑添加描述信息
            </div>
          </div>
          <Editor
            v-else
            :modelValue="detailInfo.description"
            @onEditorReady="handleEditorReady"
            :excludeKeys="descExcludeKeys"
            height="200px"
          />
        </div>
        <div class="content-item">
          <div class="content-title">附件</div>
          <UploadFile
            :objId="
              localTaskType === 1 ? detailInfo.taskId : detailInfo.subtaskId
            "
            :objType="localTaskType"
            :defaultMaterialList="materialList"
            :editPermissionLevel="editPermissionLevel"
          />
        </div>
        <SubtaskList
          v-if="localTaskType === 1"
          :subtaskList="subtaskList"
          :editPermissionLevel="editPermissionLevel"
          @createSubTask="createSubTask"
          @viewSubTaskDetail="viewSubTaskDetail"
        />
        <RelatedCase
          :defaultRelatedCases="relatedCases"
          :objType="localTaskType"
          :objId="
            localTaskType === 1 ? detailInfo.taskId : detailInfo.subtaskId
          "
          :editPermissionLevel="editPermissionLevel"
        />
        <RelatedTask
          :defaultRelatedTasks="relatedTasks"
          :objType="localTaskType"
          :objId="
            localTaskType === 1 ? detailInfo.taskId : detailInfo.subtaskId
          "
          :editPermissionLevel="editPermissionLevel"
        />
        <Tabs
          :tabList="notesTypeList"
          :activeTab="notesType"
          @change="switchNotesType"
        />
        <Notes
          v-if="notesType === 'note'"
          :objId="
            localTaskType === 1 ? detailInfo.taskId : detailInfo.subtaskId
          "
          :objType="localTaskType"
          :editPermissionLevel="editPermissionLevel"
          :refresh-method="fetchTaskDetail"
        />
        <Changehistory
          v-if="notesType === 'changehistory'"
          :objId="
            localTaskType === 1 ? detailInfo.taskId : detailInfo.subtaskId
          "
          :objType="localTaskType"
          ref="changeHistoryRef"
        />
      </div>
      <div class="content-right">
        <div class="content-item">
          <div class="content-title">关联项目</div>
          <div class="project-card">
            <div class="project-icon-wrapper">
              <i class="bx bx-folder-open project-icon"></i>
            </div>
            <div class="project-info">
              <div class="project-name">{{ detailInfo.projectName }}</div>
              <div class="project-status">
                {{ statusListMap[detailInfo.projectStatus] }} ·
                {{ priorityListMap[detailInfo.projectPriority] }}
              </div>
            </div>
          </div>
        </div>
        <div
          class="content-item"
          v-if="localTaskType === 3"
        >
          <div class="content-title">父事项</div>
          <div class="project-card">
            <div class="project-icon-wrapper">
              <i class="mdi mdi-file-tree project-icon"></i>
            </div>
            <div class="project-info">
              <div class="project-name">{{ detailInfo.taskName }}</div>
              <div class="project-status">
                {{ statusListMap[detailInfo.taskStatus] }} ·
                {{ priorityListMap[detailInfo.taskPriority] }}
              </div>
            </div>
          </div>
        </div>
        <TaskBaseinfo
          v-if="!isEdit"
          :detailInfo="detailInfo"
        />
        <TaskBaseinfoEdit
          v-else
          :detailInfo="detailInfo"
          ref="taskEditRef"
        />
        <DragSidebar
          :noCloseOnEsc="false"
          v-if="showCreateTaskModal"
          sidebarName="task-sidebar"
          v-model="showCreateTaskModal"
          @close="closeCreateTaskModal"
          ><CreateTask
            @close="closeCreateTaskModal"
            :taskType="3"
            :projectId="detailInfo.projectId"
            :objId="detailInfo.taskId"
            :relatedProject="detailInfo"
          />
        </DragSidebar>
        <DragSidebar
          :noCloseOnEsc="false"
          v-if="isShowPrjDetail"
          sidebarName="project-sidebar"
          v-model="isShowPrjDetail"
          @close="closePrjSidebar"
        >
          <ProjectDetail
            @close="closePrjSidebar"
            :project-id="detailInfo.projectId"
          />
        </DragSidebar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EditPen, MessageBox } from "@element-plus/icons-vue";
import {
  ref,
  defineProps,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  computed,
  defineEmits,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  queryTaskDetail,
  updateTaskUrl,
  deleteTaskUrl,
  querySubtaskDetail,
  updateSubtask,
  deleteSubtask,
  checkEditPermission,
  queryUserRoleList,
  queryProjectDetail,
} from "@/api/project";
import ProjectDetail from "@/views/project/components/project-detail/project-detail.vue";
import TaskBaseinfo from "./task-baseinfo.vue";
import TaskBaseinfoEdit from "./task-baseinfo-edit.vue";
import SubtaskList from "./subtask-list.vue";
import RelatedCase from "./related-case.vue";
import RelatedTask from "./related-task.vue";
import UploadFile from "./upload-file.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import CreateTask from "./create-task.vue";
import Changehistory from "./change-history.vue";
import Notes from "./notes.vue";
import Editor from "@/components/common/editor/index.vue";
import Tabs from "@/components/common/tabs";
import { statusListMap, priorityListMap } from "../../dataMap";
import clipboard3 from "vue-clipboard3";
const { toClipboard } = clipboard3();

const props = defineProps({
  taskId: {
    type: Number,
    required: true,
  },
  taskCode: {
    type: Number,
    required: true,
  },
  taskType: {
    type: Number,
    required: true,
  },
});
const emits = defineEmits(["close"]);
const closeSideBar = () => {
  emits("close");
};

const changeHistoryRef = ref(null);

// 全屏功能
const isFullscreen = ref(false);
const taskDetailRef = ref(null);

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    // 进入全屏
    if (taskDetailRef.value) {
      taskDetailRef.value.requestFullscreen().catch((err) => {
        ElMessage.error(`尝试进入全屏模式失败: ${err.message}`);
      });
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  isFullscreen.value = !isFullscreen.value;
};

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
const isDescEdit = ref(false);
const notesType = ref("note");
const notesTypeList = ref([
  {
    label: "备注",
    value: "note",
  },
  {
    label: "变更历史",
    value: "changehistory",
  },
]);
const switchNotesType = (value) => {
  notesType.value = value;
};
const isShowPrjDetail = ref(false);
const closePrjSidebar = () => {
  isShowPrjDetail.value = false;
};
const viewProDetail = () => {
  // window.open(`/v2/project/project-detail/${code}`);
  isShowPrjDetail.value = true;
  // closeSideBar()
};
const viewTaskDetail = (info, type) => {
  // 更新本地taskCode并重新调用详情接口
  console.log(info, "info");

  if (info.taskCode && info.taskCode !== localTaskCode.value) {
    localTaskCode.value = info.taskCode;
    localTaskType.value = type;
    // 更新taskId
    if (info.taskId) {
      localTaskId.value = info.taskId;
    }
    // 重新获取任务详情
    fetchTaskDetail();
  }
};
const viewSubTaskDetail = (info, type) => {
  // 更新本地taskCode并重新调用详情接口
  console.log(info, "info");

  if (info.subtaskCode && info.subtaskCode !== localTaskCode.value) {
    localTaskCode.value = info.subtaskCode;
    localTaskType.value = type;
    // 更新taskId
    if (info.subtaskId) {
      localTaskId.value = info.subtaskId;
    }
    // 重新获取任务详情
    fetchTaskDetail();
  }
};
// 关联项目数据
// const relatedProject = computed(() => {
//   if (props.taskType === 1) {
//     return props.breadcrumbList[props.breadcrumbList.length - 1];
//   } else {
//     return props.breadcrumbList[props.breadcrumbList.length - 2] || {};
//   }
// });

// const fatherTask = computed(() => {
//   if (props.taskType === 3) {
//     return props.breadcrumbList[props.breadcrumbList.length - 1];
//   } else {
//     return null;
//   }
// });
const taskEditRef = ref(null);
const isEdit = ref(false);
const editingName = ref("");
const originalName = ref("");
const taskNameInputRef = ref(null);
const detailInfo = ref({});
// 创建本地变量存储taskCode、taskId和taskType
const localTaskCode = ref(props.taskCode);
const localTaskId = ref(props.taskId);
const localTaskType = ref(props.taskType);
const relatedCases = computed(() => detailInfo.value.caseList || []);
const subtaskList = computed(() => detailInfo.value.subtaskList || []);
const materialList = computed(() => detailInfo.value.materialList || []);
const relatedTasks = ref([]);
const editPermissionLevel = ref(0);
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
const originalOwnerInfo = ref({}); //当前负责人信息

//复制链接
const copyLink = () => {
  let link;
  if (localTaskType.value === 1) {
    link = `${window.location.origin}/v2/project/task-detail/${detailInfo.value.taskCode}`;
  } else {
    link = `${window.location.origin}/v2/project/subtask-detail/${detailInfo.value.subtaskCode}`;
  }
  toClipboard(link);
  ElMessage.success("链接已复制");
};
const showCreateTaskModal = ref(false);
const closeCreateTaskModal = () => {
  showCreateTaskModal.value = false;
  fetchTaskDetail();
};
const createSubTask = () => {
  showCreateTaskModal.value = true;
};
const handleEditorReady = (editor) => {
  // 当编辑器准备就绪后，保存编辑器实例
  detailInfo.value.description = editor;
};
const cancelDescEdit = () => {
  isDescEdit.value = false;
  fetchTaskDetail();
};

const handleDeleteTask = () => {
  let params = {
    [localTaskType.value === 1 ? "taskId" : "subtaskId"]:
      localTaskType.value === 1
        ? detailInfo.value.taskId
        : detailInfo.value.subtaskId,
  };
  const confirmMessage = subtaskList.value.length
    ? `确定删除该事项吗？
    该操作将同时删除${subtaskList.value.length}个子事项，此操作不可撤销！`
    : "确定删除该事项吗？此操作不可撤销！";
  ElMessageBox.confirm(confirmMessage, "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(() => {
    if (localTaskType.value === 1) {
      deleteTaskUrl(params).then((res) => {
        if (res.success) {
          const successMsg = subtaskList.value.length
            ? `已删除该事项及${subtaskList.value.length}个子事项`
            : "删除成功";
          ElMessage.success(successMsg);
          closeSideBar();
        }
      });
    } else {
      deleteSubtask(params).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          closeSideBar();
        }
      });
    }
  });
};
const saveDescInfo = () => {
  const data = JSON.parse(JSON.stringify(detailInfo.value));
  delete data.referenceList;
  delete data.caseList;
  delete data.noteList;
  delete data.materialList;
  delete data.subtaskList;
  if (localTaskType.value === 1) {
    data.taskId = detailInfo.value.taskId;
    updateTaskUrl(data).then((res) => {
      if (res.success) {
        isDescEdit.value = false;
      }
    });
  } else {
    data.subtaskId = detailInfo.value.subtaskId;
    updateSubtask(data).then((res) => {
      if (res.success) {
        isDescEdit.value = false;
      }
    });
  }
};
const fetchTaskDetail = async (type) => {
  let res;
  if (localTaskType.value === 1) {
    const params = {
      taskId: localTaskId.value,
      taskCode: localTaskCode.value,
    };
    try {
      res = await queryTaskDetail(params, { showErrorMessage: false });
    } catch (error) {
      if (error.message?.includes("没有权限") && type === "changeOwner") {
        closeSideBar();
      } else {
        ElMessage.error(error.message || "请求失败");
      }
    }
  } else {
    const params = {
      subtaskId: localTaskId.value,
      subtaskCode: localTaskCode.value,
    };
    try {
      res = await querySubtaskDetail(params, { showErrorMessage: false });
    } catch (error) {
      if (error.message?.includes("没有权限") && type === "changeOwner") {
        closeSideBar();
      } else {
        ElMessage.error(error.message || "请求失败");
      }
    }
  }
  detailInfo.value = res.data || {};
  originalOwnerInfo.value = {
    ownerId: detailInfo.value.ownerId,
    ownerName: detailInfo.value.ownerName,
  };
  if (res.data.referenceList && res.data.referenceList.length) {
    relatedTasks.value = res.data.referenceList.map((task) => {
      const isSubtask = task.referencedObjType === 3;
      const refItem = isSubtask ? task.referencedSubtask : task.referencedTask;

      return {
        hasPermission: task.hasPermission,
        taskId: task.referencedTaskId,
        objType: task.referencedObjType,
        name: refItem?.name,
        prjName: refItem?.projectName,
        taskCode: refItem?.taskCode || refItem?.subtaskCode,
        status: refItem?.status,
        prjOwnerName: refItem?.projectOwnerName,
      };
    });
  } else {
    relatedTasks.value = [];
  }
  if (!isEdit.value) {
    editingName.value = detailInfo.value.name || "";
    originalName.value = detailInfo.value.name || "";
  }
  checkEditPermissionFn()
};
const startEdit = () => {
  editingName.value = detailInfo.value.name || "";
  originalName.value = detailInfo.value.name || "";
  isEdit.value = true;
  nextTick(() => {
    const input = taskNameInputRef.value;
    if (input) {
      input.focus();
      const val = input.value;
      input.setSelectionRange(val.length, val.length);
    }
  });
};
const cancelEdit = () => {
  editingName.value = originalName.value || detailInfo.value.name || "";
  isEdit.value = false;
};
const saveTaskInfo = async () => {
  const nameValue = editingName.value?.trim();
  if (!nameValue) {
    ElMessage.warning("事项名称不能为空");
    return;
  }
  const data = await taskEditRef.value.getFormData();
  if (!data) return;
  delete data.referenceList;
  delete data.caseList;
  delete data.noteList;
  delete data.materialList;
  delete data.subtaskList;
  data.name = nameValue;

  data.description = detailInfo.value.description || undefined;
  // 如果负责人变更，需要判断原负责人角色，如果都不属于必要角色，需要提示是否将其加入参与人列表
  if (data.ownerId !== detailInfo.value.ownerId) {
    const bol = await checkOwner(detailInfo.value.ownerId, data.memberList);
    if (!bol) {
      ElMessageBox.confirm(
        "原负责人将失去访问权限，是否将其加入参与人列表以保留操作权限？",
        "负责人变更提示",
        {
          type: "warning",
          confirmButtonText: "确认并加入",
          cancelButtonText: "仅更换负责人",
          showClose: false,
        },
      )
        .then(async () => {
          data.memberList.push({
            userId: detailInfo.value.ownerId,
            userName: detailInfo.value.ownerName,
          });
          updateTaskFunc(data);
        })
        .catch(async () => {
          updateTaskFunc(data, "changeOwner");
        });
    } else {
      updateTaskFunc(data);
    }
  } else {
    updateTaskFunc(data);
  }
};
//判断更换的负责人是否符合条件
const checkOwner = async (ownerId, memberList) => {
  const isProjectAdmin = await fetchUserRole(ownerId);
  const isMember = memberList?.some((item) => item.userId === ownerId);
  //获取父项信息
  if (localTaskType.value === 1) {
    const res = await fetchProjectInfo();
    const isPrj = checkParentTask(res, ownerId);
    return isProjectAdmin || isMember || isPrj;
  } else {
    //当前是子事项需要判断父事项和项目信息
    const projectInfo = await fetchProjectInfo();
    const isPrj = checkParentTask(projectInfo, ownerId);
    const parentInfo = await fetchParentTaskInfo();
    const isParent = checkParentTask(parentInfo, ownerId);
    return isProjectAdmin || isMember || isPrj || isParent;
  }
};
//获取所属项目信息
const fetchProjectInfo = async () => {
  const res = await queryProjectDetail({
    projectId: detailInfo.value.projectId,
  });
  return res.data;
};

//获取父事项信息
const fetchParentTaskInfo = async () => {
  const res = await queryTaskDetail({
    taskId: detailInfo.value.taskId,
  });
  return res.data;
};
//判断是所属项目的创建人、负责人、参与人
const checkParentTask = (parentInfo, ownerId) => {
  const isfatherOwner = parentInfo.ownerId === ownerId;
  const isfatherCreater = parentInfo.creatorId === ownerId;
  const isfatherMember = parentInfo.memberList?.some(
    (item) => item.userId === ownerId,
  );
  return isfatherOwner || isfatherCreater || isfatherMember;
};
const updateTaskFunc = (params, type) => {
  if (localTaskType.value === 1) {
    params.taskId = detailInfo.value.taskId;
    updateTaskUrl(params).then((res) => {
      if (res.success) {
        ElMessage.success("保存成功");
        isEdit.value = false;
        fetchTaskDetail(type);
        // checkEditPermissionFn();
        changeHistoryRef.value && changeHistoryRef.value.fetchChangeHistory();
      }
    });
  } else {
    params.subtaskId = detailInfo.value.subtaskId;
    updateSubtask(params).then((res) => {
      if (res.success) {
        ElMessage.success("保存成功");
        isEdit.value = false;
        fetchTaskDetail(type);
        // checkEditPermissionFn();
      }
    });
  }
};

watch(
  () => detailInfo.value.name,
  (val) => {
    if (!isEdit.value) {
      editingName.value = val || "";
      originalName.value = val || "";
    }
  },
);
// watch(
//   () => detailInfo.value.taskId,
//   () => {
//     if (localTaskType.value === 1) {
//       checkEditPermissionFn();
//     }
//   },
// );
// watch(
//   () => detailInfo.value.subtaskId,
//   () => {
//     if (localTaskType.value !== 1) {
//       checkEditPermissionFn();
//     }
//   },
// );

const checkEditPermissionFn = () => {
  const params = {
    [localTaskType.value === 1 ? "taskId" : "subtaskId"]:
      localTaskType.value === 1
        ? detailInfo.value.taskId
        : detailInfo.value.subtaskId,
  };
  checkEditPermission(params).then((res) => {
    if (res.success) {
      editPermissionLevel.value = res.data.editPermissionLevel || 0;
    }
  });
};
//查询用户角色
const fetchUserRole = async (userId) => {
  const res = await queryUserRoleList({ userId: userId });
  if (res.data && res.data.length) {
    return res.data[0]?.roleCode === "PROJECT_ADMIN";
  } else {
    return false;
  }
};
onMounted(() => {
  fetchTaskDetail();
});
</script>

<style lang="scss" scoped>
.task-detail-container {
  background-color: #f8f8fb;
  padding: 8px;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  .detail-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .project-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5c73f0;
  }
  .project-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .detail-title {
      font-size: 14px;
      color: #62748e;
      .task-code {
        color: #020618;
      }
    }
    .detail-name-wrapper {
      display: flex;
      align-items: center;
    }
    .detail-name {
      font-size: 20px;
      font-weight: bold;
    }
    .detail-name-input {
      border: none;
      background: transparent;
      outline: none;
      padding: 0;
      width: 100%;
    }
  }
  .project-name {
    font-size: 20px;
    font-weight: 600;
    color: #1f2d3d;
  }
  .detail-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
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
}
.detail-content {
  height: calc(100% - 62px);
  display: flex;
  .content-left {
    flex: 1;
    padding: 24px 24px 24px 8px;
    border-right: 1px solid #e0e6f5;
    max-height: 100%;
    overflow-y: auto;
    height: 100%;
  }
  .content-item {
    margin-bottom: 16px;
  }
  .content-right {
    padding: 24px 8px 24px 24px;
    width: 400px;
    max-height: 100%;
    overflow-y: auto;
    height: 100%;
  }
}
.content-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 12px;
}
.content-desc {
  border: 1px solid #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  min-height: 80px;
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

.upload-file {
  :deep(.el-upload-dragger) {
    background-color: unset;
  }
}
.desc-header {
  display: flex;
  justify-content: space-between;
}
.delete-icon {
  &:hover {
    color: #f87171;
  }
}
.detail-link {
  color: #62748e;
  cursor: pointer;
  &:hover {
    color: #155dfc;
    text-decoration: underline;
    text-decoration-color: #155dfc;
  }
}
</style>
