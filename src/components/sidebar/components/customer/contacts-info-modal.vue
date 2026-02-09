<template>
  <!-- 详细信息弹框 -->
  <div
    v-if="dialogVisible"
    class="conModal-backdrop"
    @click="closeModal"
  >
    <div
      class="modal-content"
      @click.stop
    >
      <div class="modal-header">
        <div class="header-left">
          <div
            class="avatar"
            v-if="detailInfo.photo"
          >
            <img
              :src="`/ipdoc${detailInfo.photo}`"
              :alt="detailInfo.name"
            />
          </div>
          <div class="header-info">
            <h3>{{ detailInfo.name || "未知人员" }}</h3>
            <p class="subtitle">
              {{ detailInfo.jobtitle || "职位未设置" }}
            </p>
          </div>
        </div>
        <button
          class="close-btn"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            ></line>
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            ></line>
          </svg>
        </button>
      </div>

      <div class="contacts-modal-body">
        <div class="two-column-layout">
          <!-- 左侧：基本信息/添加事项/查看事项 -->
          <div class="info-section">
            <div v-if="currentLeftPanel === 'info'">
              <h4 class="section-title">基本信息</h4>

              <div class="info-card">
                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">所属单位</div>
                    <div class="info-value">
                      {{ orgName }}
                    </div>
                  </div>
                </div>

                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">部门</div>
                    <div class="info-value">
                      {{ detailInfo.department || "未设置" }}
                    </div>
                  </div>
                </div>

                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">职务</div>
                    <div class="info-value">
                      {{ detailInfo.jobtitle || "未设置" }}
                    </div>
                  </div>
                </div>

                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">性别</div>
                    <div class="info-value">
                      {{ detailInfo.genderStr || "未设置" }}
                    </div>
                  </div>
                </div>

                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">邮箱</div>
                    <div class="info-value email">
                      {{ detailInfo.email || "未设置" }}
                    </div>
                  </div>
                </div>

                <div class="info-row" v-if="detailInfo.tel || detailInfo.mobile2">
                  <div class="info-group" v-if="detailInfo.tel">
                    <div class="info-label">办公电话1</div>
                    <div class="info-value">
                      {{ detailInfo.tel || "未设置" }}
                    </div>
                  </div>
                  <div class="info-group" v-if="detailInfo.mobile2">
                    <div class="info-label">办公电话2</div>
                    <div class="info-value">
                      {{ detailInfo.mobile2 || "未设置" }}
                    </div>
                  </div>
                </div>
                <div class="info-row" v-if="detailInfo.mobile1 || detailInfo.phone2">
                  <div class="info-group" v-if="detailInfo.mobile1">
                    <div class="info-label">移动电话</div>
                    <div class="info-value">
                      {{ detailInfo.mobile1 || "未设置" }}
                    </div>
                  </div>
                  <div class="info-group" v-if="detailInfo.phone2">
                    <div class="info-label">住宅电话</div>
                    <div class="info-value">
                      {{ detailInfo.phone2 || "未设置" }}
                    </div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-group">
                    <div class="info-label">上级主管</div>
                    <div class="info-value">
                      {{ detailInfo.bossCustContactName || "未设置" }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">我方联系人</div>
                    <div class="info-value">
                      {{ ourCustContactName || "未设置" }}
                    </div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-group">
                    <div class="info-label">来源人</div>
                    <div class="info-value">
                      {{ detailInfo.infoFromStaff || "未设置" }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">来源场合</div>
                    <div class="info-value">
                      {{ detailInfo.infoFromPlace || "未设置" }}
                    </div>
                  </div>
                </div>
                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">来源日期</div>
                    <div class="info-value">
                      {{ detailInfo.infoFromDate || "未设置" }}
                    </div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-group">
                    <div class="info-label">主要联系人</div>
                    <div class="info-value">
                      <span
                        class="checkmark"
                        :class="{ active: detailInfo.ismain }"
                      ></span>
                      {{ detailInfo.ismain ? "是" : "否" }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">账单联系人</div>
                    <div class="info-value">
                      <span
                        class="checkmark"
                        :class="{ active: detailInfo.isBillContact }"
                      ></span>
                      {{ detailInfo.isBillContact ? "是" : "否" }}
                    </div>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-group">
                    <div class="info-label">状态</div>
                    <div class="info-value">
                      {{ detailInfo.statusStr || "未知" }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">启用状态</div>
                    <div class="info-value">
                      {{ detailInfo.sysStatusStr || "未知" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加事项表单 - 在左侧面板内 -->
            <div
              v-else-if="
                currentLeftPanel === 'addTask' ||
                currentLeftPanel === 'editTask'
              "
              class="task-form-container"
            >
              <div class="form-header">
                <button
                  class="back-btn"
                  @click="backToInfo"
                >
                  <span class="bx bx-left-arrow-alt"></span>
                  返回基本信息
                </button>
              </div>

              <h4 class="section-title">
                {{ editTaskInfo.custContactMatId ? "编辑事项" : "添加事项" }}
              </h4>

              <div class="form-group">
                <label>事项标题 <span class="required">*</span></label>
                <el-input
                  v-model="editTaskInfo.title"
                  placeholder="请输入事项标题"
                  @input="setFormChanged"
                  size="large"
                />
              </div>

              <div class="form-group">
                <label>事项类型 <span class="required">*</span></label>
                <el-select
                  v-model="editTaskInfo.matterType"
                  placeholder="请选择事项类型"
                  size="large"
                  @change="setFormChanged"
                >
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>

              <div class="form-group">
                <label>描述信息</label>
                <el-input
                  v-model="editTaskInfo.description"
                  placeholder="请输入事项描述..."
                  @input="setFormChanged"
                  type="textarea"
                  :rows="4"
                ></el-input>
              </div>

              <!-- <div class="form-group">
                <label>创建时间</label>
                <el-date-picker
                  v-model="editTaskInfo.createdAt"
                  type="date"
                  placeholder="请选择创建时间"
                  size="large"
                  @change="setFormChanged"
                  style="width: 100%"
                />
              </div> -->
              <div class="form-actions">
                <button
                  class="cancel-btn"
                  @click="backToInfo"
                >
                  取消
                </button>
                <button
                  class="submit-btn"
                  @click="saveTask"
                  :disabled="!isNewTaskValid"
                >
                  确认
                </button>
              </div>
            </div>

            <!-- 查看事项详情 -->
            <div
              v-else-if="currentLeftPanel === 'viewTask'"
              class="task-view-container"
            >
              <div class="form-header">
                <button
                  class="back-btn"
                  @click="backToInfo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line
                      x1="19"
                      y1="12"
                      x2="5"
                      y2="12"
                    ></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  返回基本信息
                </button>
              </div>

              <h4 class="section-title">事项详情</h4>

              <div class="info-card">
                <div class="task-detail-header">
                  <h5>{{ selectedTask.title }}</h5>
                  <!-- <div class="task-status-badge" :class="`status-${selectedTask.status}`">
                      {{ getStatusText(selectedTask.status) }}
                    </div> -->
                </div>

                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">事项类型</div>
                    <div class="info-value">
                      {{ selectedTask.matterTypeStr }}
                    </div>
                  </div>
                </div>

                <div class="info-row-single">
                  <div class="info-group">
                    <div class="info-label">创建时间</div>
                    <div class="info-value">
                      {{
                        selectedTask.createdDate &&
                        dayjs(selectedTask.createdDate).format("YYYY-MM-DD")
                      }}
                    </div>
                  </div>
                </div>

                <div
                  class="info-row-single"
                  v-if="selectedTask.description"
                >
                  <div class="info-group">
                    <div class="info-label">描述信息</div>
                    <div class="info-value description">
                      {{ selectedTask.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：相关事项 -->
          <div class="task-section">
            <div class="section-header">
              <h4 class="section-title">相关事项</h4>
              <div class="section-actions">
                <div class="search-wrapper">
                  <input
                    type="text"
                    placeholder="搜索事项..."
                    v-model="taskSearchQuery"
                    @input="throttledFetchTasks"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                    ></circle>
                    <line
                      x1="21"
                      y1="21"
                      x2="16.65"
                      y2="16.65"
                    ></line>
                  </svg>
                </div>
                <button
                  class="add-btn"
                  @click="switchToAddTask"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line
                      x1="12"
                      y1="5"
                      x2="12"
                      y2="19"
                    ></line>
                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                    ></line>
                  </svg>
                  添加事项
                </button>
              </div>
            </div>

            <div class="task-list">
              <div
                v-if="filteredTasks.length === 0"
                class="empty-tasks"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  ></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line
                    x1="16"
                    y1="13"
                    x2="8"
                    y2="13"
                  ></line>
                  <line
                    x1="16"
                    y1="17"
                    x2="8"
                    y2="17"
                  ></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p>暂无相关事项</p>
              </div>

              <div
                v-for="(task, index) in filteredTasks"
                :key="index"
                class="task-card"
              >
                <div class="task-header">
                  <h5 class="task-title">{{ task.title }}</h5>
                  <div class="task-actions">
                    <button
                      class="icon-btn"
                      @click="viewTaskDetail(task)"
                      title="查看详情"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        ></path>
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        ></circle>
                      </svg>
                    </button>
                    <button
                      class="icon-btn"
                      @click="editTaskDetail(task)"
                      title="编辑"
                      v-if="userInfo.userId == task.createUserId"
                    >
                      <span
                        class="bx bx-edit-alt"
                        style="font-size: 16px"
                      ></span>
                    </button>
                    <button
                      class="icon-btn delete"
                      @click="confirmDeleteTask(task.custContactMatId)"
                      title="删除"
                      v-if="userInfo.userId == task.createUserId"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path
                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="task-info">
                  <div class="task-meta">
                    <span class="task-type">{{ task.matterTypeStr }}</span>
                    <span class="task-date">{{
                      task.createdDate &&
                      dayjs(task.createdDate).format("YYYY-MM-DD")
                    }}</span>
                  </div>
                  <!-- <div class="task-status-badge" :class="`status-${task.status}`">
                      {{ getStatusText(task.status) }}
                    </div> -->
                </div>

                <p
                  v-if="task.description"
                  class="task-description"
                >
                  {{ task.description }}
                </p>
              </div>
            </div>
            <!-- 分页控件 -->
            <div
              class="pagination"
              v-if="totalPages > 1"
            >
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span>{{ currentPage }} / {{ totalPages }}</span>
              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 成功提示信息 -->
  <div
    v-if="showSuccess"
    class="success-toast"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>{{ successMessage }}</span>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, watch } from "vue";
import dayjs from "dayjs";
import {
  getMatterList,
  createMatter,
  updateMatter,
  deleteMatter,
  querycustSelectClass,
} from "@/api/customerList";
import { throttle } from "lodash";
import { getUserInfo } from "@/utils/user";
import { ElMessageBox } from "element-plus";

const userInfo = getUserInfo();

const emit = defineEmits(["close"]);
const props = defineProps({
  showDetailModal: {
    type: Boolean,
    default: false,
  },
  detailInfos: {
    type: Object,
    default: () => {},
  },
  orgName: {
    type: String,
    default: "",
  },
});
const currentLeftPanel = ref("info");
const dialogVisible = ref(props.showDetailModal);
const detailInfo = computed(() => props.detailInfos);
const hasPendingChanges = ref(false);
const activeTab = ref("info");
const typeOptions = ref([]);

//获取事项类型
const fetchtypeOptions = () => {
  querycustSelectClass({ classId: 1184 }).then((res) => {
    const data = res.data[1184] || [];
    typeOptions.value = data.map((item) => {
      return {
        label: item.typeName,
        value: item.id,
      };
    });
  });
};
// 关闭弹框
const closeModal = () => {
  if (hasPendingChanges.value) {
    ElMessageBox.confirm("您有未保存的更改，是否放弃？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        dialogVisible.value = false;
        activeTab.value = "info"; // 重置回基本信息标签
        currentLeftPanel.value = "info"; // 重置左侧面板
        hasPendingChanges.value = false;
        emit("close");
      })
      .catch(() => {
        return;
      });
  } else {
    dialogVisible.value = false;
    activeTab.value = "info"; // 重置回基本信息标签
    currentLeftPanel.value = "info"; // 重置左侧面板
    hasPendingChanges.value = false;
    emit("close");
  }
};
const tasks = ref([]);
//获取相关事项列表
const fetchTasks = async() => {
  return getMatterList({
    custContactId: detailInfo.value.custContactId,
    keyword: taskSearchQuery.value,
    pageSize: 1000,
  }).then((res) => {
    tasks.value = res.data || [];
  });
};

const throttledFetchTasks = throttle(() => {
  currentPage.value = 1;
  fetchTasks();
}, 500);

const taskSearchQuery = ref();
const currentPage = ref(1);
const pageSize = 5;

// 新事项表单
const editTaskInfo = ref({
  title: "",
  matterType: "",
  description: "",
});

// 选中的任务
const selectedTask = ref({
  id: 0,
  title: "",
  matterType: "",
  description: "",
});

// 验证新事项是否有效
const isNewTaskValid = computed(() => {
  return (
    editTaskInfo.value.title.trim() !== "" &&
    editTaskInfo.value.matterType !== ""
  );
});

// 过滤和分页事项
const filteredTasks = computed(() => {
  let filtered = tasks.value;

  // 分页
  const start = (currentPage.value - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(tasks.value.length / pageSize);
});
// 切换到添加事项面板
const switchToAddTask = () => {
  if (currentLeftPanel.value == "addTask") {
    return;
  }
  // 重置表单
  editTaskInfo.value = {
    title: "",
    matterType: "",
    description: "",
  };

  hasPendingChanges.value = false;
  currentLeftPanel.value = "addTask";
};
//切换到编辑事项面板
const editTaskDetail = (info) => {
  // 重置表单
  editTaskInfo.value = {
    title: info.title,
    matterType: info.matterType,
    description: info.description,
    custContactMatId: info.custContactMatId,
  };
  hasPendingChanges.value = false;
  currentLeftPanel.value = "editTask";
};

// 返回基本信息面板
const backToInfo = () => {
  hasPendingChanges.value = false;
  currentLeftPanel.value = "info";
};

// 查看任务详情
const viewTaskDetail = (task) => {
  selectedTask.value = { ...task };
  currentLeftPanel.value = "viewTask";
};

// 表单输入变化时设置未保存状态
const setFormChanged = () => {
  hasPendingChanges.value = true;
};

//重置表单
const resetTaskInfo = () => {
  editTaskInfo.value = {
    title: "",
    matterType: "",
    description: "",
  };
};

// 添加事项
const saveTask = () => {
  if (!isNewTaskValid.value) return;
  const params = {
    ...editTaskInfo.value,
    custContactId: detailInfo.value.custContactId,
  };

  if (editTaskInfo.value.custContactMatId) {
    updateMatter({
      ...params,
      custContactMatId: editTaskInfo.value.custContactMatId,
    }).then((res) => {
      if (res.success) {
        showSuccessMessage("事项编辑成功");
        fetchTasks();
        resetTaskInfo();
        hasPendingChanges.value = false;
        currentLeftPanel.value = "info"; // 添加成功后返回基本信息
      }
    });
  } else {
    createMatter(params).then((res) => {
      if (res.success) {
        showSuccessMessage("事项添加成功");
        fetchTasks();
        resetTaskInfo();
        hasPendingChanges.value = false;
        currentLeftPanel.value = "info"; // 添加成功后返回基本信息
        currentPage.value = 1; // 回到第一页
      }
    });
  }
};

// 确认删除事项
const confirmDeleteTask = (id) => {
  ElMessageBox.confirm("确定要删除此事项吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteMatter({ custContactMatId: id }).then((res) => {
        if (res.success) {
          showSuccessMessage("事项已删除");
          // 如果正在查看该任务，返回基本信息
          if (currentLeftPanel.value === "viewTask") {
            currentLeftPanel.value = "info";
          }
          fetchTasks().then(() => {
            // 如果当前页没有数据了且不是第一页，则回到上一页
            if (filteredTasks.value.length === 0 && currentPage.value > 1) {
              currentPage.value--;
            }
          });
        }
      });
    })
    .catch(() => {
      return;
    });
};

// 显示成功提示消息
const successMessage = ref("");
const showSuccess = ref(false);

function showSuccessMessage(message) {
  successMessage.value = message;
  showSuccess.value = true;

  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
}

const ourCustContactName = computed(() =>{
  return detailInfo.value.customerContactAgencyContacts?.map(item => item.userName).join(',');
});

watch(detailInfo, (newVal) => {
  if (newVal.custContactId) {
    fetchTasks();
  }
});

onMounted(() => {
  fetchtypeOptions();
});
</script>

<style scoped>
/* 弹框样式 */
.conModal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}
.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
  width: 92%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #eaecef;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f5f7fa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-info {
  display: flex;
  flex-direction: column;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 15px;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.contacts-modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

/* 两列布局 */
.two-column-layout {
  display: flex;
  height: 100%;
  min-height: 600px;
}

.info-section {
  flex: 0 0 42%;
  padding: 16px 30px;
  border-right: 1px solid #eaecef;
  max-height: 600px;
  overflow: auto;
  transition: all 0.3s ease;
}

.task-section {
  flex: 0 0 58%;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.section-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.3px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  /* border-bottom: 1px solid #eaecef; */
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 基本信息卡片样式 */
.info-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 6px;
}

.info-row-single {
  margin-bottom: 6px;
}

.info-row:last-child,
.info-row-single:last-child {
  margin-bottom: 0;
}

.info-group {
  flex: 1;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}

.info-value {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

.info-value.email {
  color: #2563eb;
}

.info-value.description {
  white-space: pre-line;
  line-height: 1.5;
  font-weight: normal;
  color: #4b5563;
}

.checkmark {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  margin-right: 6px;
  position: relative;
  top: 2px;
}

.checkmark.active {
  background-color: #10b981;
  border-color: #10b981;
}

.checkmark.active::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 搜索框样式 */
.search-wrapper {
  position: relative;
  width: 220px;
}

.search-wrapper input {
  width: 100%;
  padding: 10px 16px 10px 38px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.search-wrapper svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 添加按钮样式 */
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
}

.add-btn:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

/* 事项列表样式 */
.task-list {
  padding: 0 30px 30px;
  overflow-y: auto;
  flex-grow: 1;
}

.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #94a3b8;
  padding: 40px 0;
}

.empty-tasks svg {
  margin-bottom: 16px;
  stroke: #cbd5e1;
}

.empty-tasks p {
  font-size: 15px;
}

.task-card {
  margin-bottom: 16px;
  padding: 18px 20px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.icon-btn.delete:hover {
  background-color: #fee2e2;
  color: #b91c1c;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-type {
  font-size: 13px;
  color: #6b7280;
  background-color: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.task-date {
  font-size: 13px;
  color: #64748b;
}

.task-status-badge {
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
}

.status-progress {
  background-color: #e0f2fe;
  color: #0369a1;
}

.status-completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.task-description {
  margin: 10px 0 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  padding: 12px 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #cbd5e1;
}

.pagination span {
  color: #4b5563;
  font-size: 14px;
}

/* 添加事项表单样式 */
.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
  font-size: 14px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.cancel-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2563eb;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

/* 添加事项表单和查看详情样式 */
.task-form-container,
.task-view-container {
  animation: fadeIn 0.3s ease;
}

.form-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 0;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.task-detail-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-detail-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* 成功提示消息 */
.success-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s;
}
</style>
