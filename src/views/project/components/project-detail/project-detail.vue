<template>
  <div
    class="h-100 project-detail-container"
    ref="projectDetailRef"
  >
    <div class="detail-header">
      <div class="detail-header-left">
        <div class="project-icon">
          <el-icon :size="28">
            <FolderOpened />
          </el-icon>
        </div>
        <div class="project-info">
          <div class="project-name-wrapper">
            <div
              v-if="!isEdit"
              class="project-name"
            >
              {{ detailInfo.name }}
            </div>
            <input
              v-else
              ref="projectNameInputRef"
              class="project-name project-name-input"
              v-model="editingName"
              placeholder="请输入项目名称"
            />
          </div>
          <div class="project-tags">
            <span class="project-tag">
              {{ detailInfo.ownerName }} ·
              {{ statusListMap[detailInfo.status] }}
            </span>
            <span class="project-tag">
              {{ priorityListMap[detailInfo.priority] }}
            </span>
          </div>
        </div>
      </div>
      <div class="detail-header-actions">
        <div v-if="editPermissionLevel === 1">
          <el-button
            :icon="EditPen"
            @click="startEdit"
            v-if="!isEdit"
            >编辑项目</el-button
          >
          <template v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button
              :icon="MessageBox"
              type="primary"
              @click="saveProjectInfo"
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
            @click="handleDeletePrj"
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
        <div class="section-header">
          <div class="section-title-left">
            <i class="bx bx-bullseye section-title-icon"></i>
            <span class="section-title-text">项目统计</span>
          </div>
          <el-button
            type="primary"
            v-if="editPermissionLevel === 1"
            @click="handleCreateTask"
          >
            <i class="bx bx-plus me-1"></i>
            创建事项
          </el-button>
        </div>
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-number">
              {{ projectStatistics.totalCount || 0 }}
            </div>
            <div class="stat-label">总事项</div>
          </div>
          <div class="stat-card stat-done">
            <div class="stat-number">
              {{ projectStatistics["已完成"] || 0 }}
            </div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-number">
              {{ projectStatistics["待开始"] || 0 }}
            </div>
            <div class="stat-label">待开始</div>
          </div>
          <div class="stat-card stat-running">
            <div class="stat-number">
              {{ projectStatistics["进行中"] || 0 }}
            </div>
            <div class="stat-label">进行中</div>
          </div>
          <div class="stat-card stat-paused">
            <div class="stat-number">
              {{ projectStatistics["已暂停"] || 0 }}
            </div>
            <div class="stat-label">已暂停</div>
          </div>
          <div class="stat-card stat-cancel">
            <div class="stat-number">
              {{ projectStatistics["已取消"] || 0 }}
            </div>
            <div class="stat-label">已取消</div>
          </div>
        </div>
        <ProjectBaseInfo
          v-if="!isEdit"
          :detailInfo="detailInfo"
        />
        <ProjectBaseInfoEdit
          v-else
          :detailInfo="detailInfo"
          ref="projectEditRef"
        />
      </div>
      <div class="content-right">
        <div class="content-action">
          <el-button
            :type="showType === 'activity' ? 'primary' : 'default'"
            @click="changeShowType('activity')"
            ><div style="display: flex; gap: 4px">
              <i
                class="bx bx-pulse"
                style="font-size: 16px"
              ></i
              ><span>项目动态</span>
            </div></el-button
          >
          <el-button
            :type="showType === 'history' ? 'primary' : 'default'"
            @click="changeShowType('history')"
            ><div style="display: flex; gap: 4px">
              <i
                class="bx bx-time"
                style="font-size: 16px"
              ></i
              ><span>变更历史</span>
            </div></el-button
          >
        </div>
        <div>
          <Timeline
            :timelineList="timelineList"
            v-show="showType === 'activity'"
          />
          <ProjectChangeHistory
            :changeHistoryList="changeHistoryList"
            v-show="showType === 'history'"
          />
        </div>
      </div>
    </div>
    <DragSidebar
      :noCloseOnEsc="false"
      v-if="showCreateTaskModal"
      sidebarName="task-sidebar"
      v-model="showCreateTaskModal"
      @close="closeCreateTaskModal"
      ><CreateTask
        @close="closeCreateTaskModal"
        :taskType="1"
        :objId="detailInfo.prjId"
        :relatedProject="detailInfo"
      />
    </DragSidebar>
  </div>
</template>

<script setup>
import { FolderOpened, EditPen, MessageBox } from "@element-plus/icons-vue";
import ProjectBaseInfo from "./project-baseInfo.vue";
import ProjectBaseInfoEdit from "./project-baseinfo-edit.vue";
import ProjectChangeHistory from "./project-change-history.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import CreateTask from "../task/create-task.vue";
import Timeline from "./timeline.vue";
import {
  queryProjectDetail,
  updateProject,
  deleteProjectUrl,
  queryActivityLog,
  queryChangeHistory,
  queryProjectStatistics,
  checkEditPermission,
  queryUserRoleList,
} from "@/api/project";
import {
  defineEmits,
  ref,
  defineProps,
  onMounted,
  nextTick,
  watch,
  onUnmounted,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { statusListMap, priorityListMap } from "../../dataMap.js";
// import { getUserInfo } from "@/utils/user";
import clipboard3 from "vue-clipboard3";
const { toClipboard } = clipboard3();

// const userInfo = getUserInfo() || {};
const emits = defineEmits(["close"]);
const projectEditRef = ref(null);
const timelineList = ref([]);
const changeHistoryList = ref([]);
const originalOwnerInfo = ref({}); //当前负责人信息
const closeSideBar = () => {
  emits("close");
};

// 全屏功能
const isFullscreen = ref(false);
const projectDetailRef = ref(null);

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    // 进入全屏
    if (projectDetailRef.value) {
      projectDetailRef.value.requestFullscreen().catch((err) => {
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
const isEdit = ref(false);
const editingName = ref("");
const originalName = ref("");
const projectNameInputRef = ref(null);
const showType = ref("activity");
const projectStatistics = ref({});
const editPermissionLevel = ref(0);

const changeShowType = (type) => {
  showType.value = type;
};

const props = defineProps({
  projectId: {
    type: Number,
    required: true,
  },
  projectCode: {
    type: Number,
    required: true,
  },
});
const detailInfo = ref({});
const fetchProjectDetail = async () => {
  const params = {
    projectId: props.projectId,
    projectCode: props.projectCode,
  };
  try {
    const res = await queryProjectDetail(params, { showErrorMessage: false });
    detailInfo.value = res.data || {};
    if (!isEdit.value) {
      editingName.value = detailInfo.value.name || "";
      originalName.value = detailInfo.value.name || "";
    }
    originalOwnerInfo.value = {
      ownerId: detailInfo.value.ownerId,
      ownerName: detailInfo.value.ownerName,
    };
  } catch (error) {
    if (error.message?.includes("没有权限")) {
      ElMessageBox.alert(error.message, "提示", {
        type: "warning",
        callback: () => {
          closeSideBar();
        },
      });
    } else {
      ElMessage.error(error.message || "请求失败");
    }
  }
};
//复制链接
const copyLink = () => {
  const link = `${window.location.origin}/v2/project/project-detail/${detailInfo.value.projectCode}`;
  console.log(link, "link@@");
  toClipboard(link);
  ElMessage.success("链接已复制");
};
const showCreateTaskModal = ref(false);
const closeCreateTaskModal = () => {
  showCreateTaskModal.value = false;
  fetchProjectDetail();
  init();
};
const handleCreateTask = () => {
  showCreateTaskModal.value = true;
};
const handleDeletePrj = () => {
  ElMessageBox.confirm("确定删除该项目吗？", "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(() => {
    const params = {
      prjId: detailInfo.value.prjId,
    };
    deleteProjectUrl(params).then((res) => {
      if (res.success) {
        ElMessage.success("删除成功");
        closeSideBar();
      }
    });
  });
};
const startEdit = () => {
  editingName.value = detailInfo.value.name || "";
  originalName.value = detailInfo.value.name || "";
  isEdit.value = true;
  nextTick(() => {
    const input = projectNameInputRef.value;
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
const saveProjectInfo = async () => {
  const nameValue = editingName.value?.trim();
  if (!nameValue) {
    ElMessage.warning("项目名称不能为空");
    return;
  }
  const data = await projectEditRef.value.getFormData();
  if (!data) return;
  data.name = nameValue;
  data.prjId = detailInfo.value.prjId;
  data.creatorName = detailInfo.value.creatorName;
  data.creatorId = detailInfo.value.creatorId;
  // 如果负责人变更，需要判断原负责人角色，如果都不属于必要角色，需要提示是否将其加入参与人列表
  if (data.ownerId !== detailInfo.value.ownerId) {
    const isProjectAdmin = await fetchUserRole(originalOwnerInfo.value.ownerId);
    const ismember = data.memberList?.some(
      (person) => person.userId === originalOwnerInfo.value.ownerId,
    );
    const bol =
      isProjectAdmin ||
      ismember ||
      originalOwnerInfo.value.ownerId === detailInfo.value.creatorId;

    if (!bol) {
      ElMessageBox.confirm(
        "原负责人将失去访问权限，是否将其加入参与人列表以保留操作权限？",
        "负责人变更提示",
        {
          type: "warning",
          confirmButtonText: "确认并加入",
          cancelButtonText: "仅更换负责人",
        },
      )
        .then(async () => {
          data.memberList.push({
            userId: originalOwnerInfo.value.ownerId,
            userName: originalOwnerInfo.value.ownerName,
          });
          updateProjectFunc(data);
        })
        .catch(async () => {
          updateProjectFunc(data);
        });
    } else {
      updateProjectFunc(data);
    }
  } else {
    updateProjectFunc(data);
  }
};
const updateProjectFunc = async (data) => {
  console.log(data, "data@@");

  const res = await updateProject(data);
  if (res.success) {
    ElMessage.success("保存成功");
    resetForm();
  }
};
const resetForm = () => {
  isEdit.value = false;
  fetchProjectDetail();
  fetchActivityLog();
  fetchChangeHistory();
  checkEditPermissionFn();
};
const fetchActivityLog = () => {
  const params = {
    objId: detailInfo.value.prjId,
    objType: 1,
  };
  queryActivityLog(params).then((res) => {
    timelineList.value = res.data || [];
  });
};
const fetchChangeHistory = () => {
  const params = {
    objId: detailInfo.value.prjId,
    objType: 1,
  };
  queryChangeHistory(params).then((res) => {
    changeHistoryList.value = res.data || [];
  });
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

watch(
  () => detailInfo.value.prjId,
  () => {
    init();
  },
);

const fetchProjectStatistics = () => {
  queryProjectStatistics({ projectId: detailInfo.value.prjId }).then((res) => {
    projectStatistics.value = res.data || {};
  });
};

const checkEditPermissionFn = () => {
  checkEditPermission({ prjId: detailInfo.value.prjId }).then((res) => {
    editPermissionLevel.value = res.data?.editPermissionLevel || 0;
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
const init = () => {
  fetchActivityLog();
  fetchChangeHistory();
  fetchProjectStatistics();
  checkEditPermissionFn();
};

onMounted(() => {
  fetchProjectDetail();
});
</script>

<style lang="scss" scoped>
.project-detail-container {
  padding: 0 8px 8px 8px;
  background-color: #f8f8fb;
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
    gap: 2px;
  }
  .project-name-wrapper {
    display: flex;
    align-items: center;
  }
  .project-name {
    font-size: 20px;
    font-weight: 600;
    color: #1f2d3d;
  }
  .project-name-input {
    border: none;
    background: transparent;
    outline: none;
    padding: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2d3d;
    width: 100%;
  }
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .project-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 12px;
    color: #596c8f;
    background-color: #f4f6fb;
    border: 1px solid #e0e6f5;
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
  height: calc(100% - 68px);
  display: flex;
  .content-left {
    flex: 1;
    padding: 16px 16px 16px 0;
    border-right: 1px solid #e0e6f5;
    max-height: 100%;
    overflow-y: auto;
    height: 100%;
  }
  .content-right {
    width: 400px;
    max-height: 100%;
    overflow-y: auto;
    height: 100%;
  }
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  .section-title-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title-icon {
    font-size: 18px;
    color: #303133;
  }
  .section-title-text {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  /* 当宽度足够时，卡片在一行显示 */
  @media (min-width: 1400px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
.stat-card {
  border-radius: 12px;
  padding: 10px 18px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .stat-number {
    font-size: 24px;
    font-weight: 600;
  }
  .stat-label {
    font-size: 13px;
  }
}
.stat-total {
  background-color: #edf4ff;
  border: 1px solid #bedbff;
  .stat-number {
    color: #2979ff;
  }
  .stat-label {
    color: #2979ff;
  }
}
.stat-done {
  background-color: #e8f8ef;
  border: 1px solid #b9f8cf;
  .stat-number {
    color: #16a75c;
  }
  .stat-label {
    color: #16a75c;
  }
}
.stat-pending {
  background-color: #f3f5fb;
  border: 1px solid #e2e8f0;
  .stat-number {
    color: #475569;
  }
  .stat-label {
    color: #6b7280;
  }
}
.stat-running {
  background-color: #fff1e6;
  border: 1px solid #ffd7a8;
  .stat-number {
    color: #ff7a00;
  }
  .stat-label {
    color: #ff7a00;
  }
}
.stat-paused {
  background-color: #fff7db;
  border: 1px solid #fff085;
  .stat-number {
    color: #d97706;
  }
  .stat-label {
    color: #d97706;
  }
}
.stat-cancel {
  background-color: #ffecec;
  border: 1px solid #ffc9c9;
  .stat-number {
    color: #f04438;
  }
  .stat-label {
    color: #f04438;
  }
}
.content-action {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  border-bottom: 1px solid #ebeef5;
}
.delete-icon {
  &:hover {
    color: #f87171;
  }
}
</style>
