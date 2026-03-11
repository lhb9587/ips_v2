<template>
  <div class="notes-wrapper">
    <div
      class="note-input-card"
      v-if="editPermissionLevel"
    >
      <el-input
        v-model="noteInput"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 6 }"
        placeholder="添加备注..."
        maxlength="1000"
        show-word-limit
      />
      <div
        v-if="pendingAttachments.length"
        class="pending-attachment-list"
      >
        <div
          class="pending-file"
          v-for="(file, index) in pendingAttachments"
          :key="file.id"
        >
          <i class="mdi mdi-paperclip"></i>
          <span
            class="name"
            :title="file.name"
            >{{ file.name }}</span
          >
          <span class="size">{{ formatFileSize(file.size) }}</span>
          <i
            class="mdi mdi-close remove-icon"
            @click="removePendingAttachment(index)"
          ></i>
        </div>
      </div>
      <div class="note-input-actions">
        <div class="left-actions">
          <!-- <div
            class="attach-btn"
            @click="triggerFileSelect"
          >
            <i class="mdi mdi-paperclip"></i>
            添加附件
          </div>
          <input
            ref="fileInputRef"
            type="file"
            class="hidden-file-input"
            multiple
            @change="handleFilesSelected"
          /> -->
          <el-upload
            name="attachFile"
            class="upload-file"
            :data="attUploadFileData"
            :show-file-list="false"
            :on-success="handleFileSuccess"
            :before-upload="handleBeforeUpload"
            :action="uploadUrl"
          >
            <div class="attach-btn">
              <i class="mdi mdi-paperclip"></i>
              <el-icon
                v-if="isUploading"
                class="is-loading"
                ><Loading
              /></el-icon>
              {{ isUploading ? "正在上传中" : "添加附件" }}
            </div>
          </el-upload>
        </div>
        <div class="right-actions">
          <el-button
            @click="handleCancel"
            text
            v-if="noteInput"
          >
            清空
          </el-button>
          <el-button
            type="primary"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>

    <div class="notes-timeline">
      <div
        v-for="note in noteList"
        :key="note.tnoId || note.snoId"
        class="note-item"
      >
        <div class="avatar">
          {{ getAvatarText(note.creatorName) }}
        </div>
        <div class="note-body">
          <div class="note-header">
            <div class="note-meta">
              <span class="name">{{ note.creatorName }}</span>
              <span class="time">{{ formatDisplayTime(note.createdAt) }}</span>
            </div>
            <div
              class="note-actions"
              v-if="editPermissionLevel && note.creatorId == userId"
            >
              <i
                class="mdi mdi-pencil-outline"
                title="编辑"
                @click="handleEditNote(note)"
              ></i>
              <i
                class="mdi mdi-delete-outline"
                title="删除"
                @click="handleDeleteNote(note)"
              ></i>
            </div>
          </div>
          <!-- 编辑状态 -->
          <div
            v-if="isEditing && editingNoteId === getNoteIdentifier(note)"
            class="note-edit-form"
          >
            <el-input
              v-model="editingNoteInput"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="编辑备注..."
              maxlength="1000"
              show-word-limit
            />
            <div
              v-if="editingAttachments.length"
              class="pending-attachment-list"
            >
              <div
                class="pending-file"
                v-for="(file, index) in editingAttachments"
                :key="file.id"
              >
                <i class="mdi mdi-paperclip"></i>
                <span
                  class="name"
                  :title="file.name"
                  >{{ file.name }}</span
                >
                <span class="size">{{ formatFileSize(file.size) }}</span>
                <i
                  class="mdi mdi-close remove-icon"
                  @click="removeEditingAttachment(index)"
                ></i>
              </div>
            </div>
            <div class="note-edit-actions">
              <div class="left-actions">
                <el-upload
                  name="attachFile"
                  class="upload-file"
                  :data="attUploadFileData"
                  :show-file-list="false"
                  :on-success="handleEditFileSuccess"
                  :before-upload="handleEditBeforeUpload"
                  :action="uploadUrl"
                >
                  <div class="attach-btn">
                    <i class="mdi mdi-paperclip"></i>
                    <el-icon
                      v-if="isEditingUploading"
                      class="is-loading"
                      ><Loading
                    /></el-icon>
                    {{ isEditingUploading ? "正在上传中" : "添加附件" }}
                  </div>
                </el-upload>
              </div>
              <div class="right-actions">
                <el-button
                  @click="handleEditCancel"
                  text
                  size="small"
                >
                  取消
                </el-button>
                <el-button
                  type="primary"
                  :disabled="!canEditSubmit"
                  @click="handleEditSubmit"
                  size="small"
                >
                  保存
                </el-button>
              </div>
            </div>
          </div>
          <!-- 非编辑状态 -->
          <template v-else>
            <div class="note-text">
              {{ note.content }}
            </div>
            <div
              class="note-attachments"
              v-if="note.attachments?.length"
            >
              <div
                class="attachment-item"
                v-for="file in note.attachments"
                :key="file.id"
                @click="handleAttachmentClick(file)"
              >
                <i class="mdi mdi-paperclip"></i>
                <span
                  class="link"
                  :title="file.name"
                  >{{ file.name }}</span
                >
                <span class="size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  defineProps,
  ref,
  defineExpose,
  watch,
  onMounted,
} from "vue";
import { useStore } from "vuex";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import {
  addTaskNote,
  updateTaskNote,
  deleteTaskNote,
  addSubtaskNote,
  updateSubtaskNote,
  deleteSubtaskNote,
  queryTaskNoteList,
  querySubtaskNoteList,
  downloadMaterial,
  viewMaterial,
} from "@/api/project";
import { getToken } from "@/utils/auth";
import { createPrjMaterialUrl } from "@/api/serviceApi.config.js";
const uploadUrl = createPrjMaterialUrl;

import { getUserInfo } from "@/utils/user";
const userId = getUserInfo()?.userId;
console.log(userId, "userId@@");

const props = defineProps({
  objId: {
    type: Number,
    default: undefined,
  },
  objType: {
    type: Number,
    default: 1,
  },
  editPermissionLevel: {
    type: Number,
    default: 0,
  },
  refreshMethod: {
    type: Function,
    default: null,
  },
});
// 动态构建上传参数，当 objId 有值时才添加 objInstIdList
const attUploadFileData = computed(() => {
  const data = {
    tokenID: getToken(),
    objType: props.objType === 1 ? 3 : 4,
  };
  // 只有当 objId 有值时才添加 objInstIdList
  if (props.objId) {
    data.objInstIdList = [props.objId];
  }
  return data;
});
const store = useStore();
const noteInput = ref("");
const pendingAttachments = ref([]);
const noteList = ref([]);
// 编辑状态相关变量
const isEditing = ref(false);
const editingNoteId = ref(null);
const editingNoteInput = ref("");
const editingAttachments = ref([]);
// 上传状态
const isUploading = ref(false);
const isEditingUploading = ref(false);

const currentUserName = computed(() => store.state.user?.name || "我");

const canSubmit = computed(() => {
  if (isUploading.value) return false;
  return Boolean(noteInput.value.trim()) || pendingAttachments.value.length > 0;
});

const canEditSubmit = computed(() => {
  if (isEditingUploading.value) return false;
  return (
    Boolean(editingNoteInput.value.trim()) ||
    editingAttachments.value.length > 0
  );
});

const normalizeNote = (note) => {
  return {
    tnoId: note.tnoId || note.snoId,
    creatorName: note.creatorName,
    content: note.content,
    createdAt: note.createdAt,
    creatorId: note.creatorId,
    attachments: (note.attachmentList || []).map((file) => ({
      id: file.materialId,
      materialId: file.materialId,
      name: file.name || file.materialName,
      size: file.size || file.fileSize || 0,
      url: file.address || "",
    })),
  };
};

const fetchNotesList = async () => {
  const apiSet = getNoteApiSet();
  let params = {};
  if (!props.objId) return;
  if (apiSet.idKey === "tnoId") {
    params.taskId = props.objId;
  } else {
    params.subtaskId = props.objId;
  }
  const res = await apiSet.get(params);
  noteList.value = res.data.map((item) => normalizeNote(item));
};

const handleFileSuccess = (response, file) => {
  console.log(response, "response");
  console.log(file, "file");
  if (response && response.success && response.data) {
    // 获取文件大小，优先使用 raw 属性中的原始文件大小
    const fileSize = file.raw?.size || file.size || 0;
    const uploadedFile = {
      name: file.name,
      size: fileSize,
      createDate: new Date(),
      materialId: response.data[0]?.materialId,
      id: response.data[0]?.materialId,
      address: response.data[0]?.address,
      uid: file.uid,
    };
    pendingAttachments.value.push(uploadedFile);
  }
  // 上传完成，重置上传状态
  isUploading.value = false;
};

// 上传前处理
const handleBeforeUpload = () => {
  isUploading.value = true;
  return true;
};

const handleEditFileSuccess = (response, file) => {
  if (response && response.success && response.data) {
    // 获取文件大小，优先使用 raw 属性中的原始文件大小
    const fileSize = file.raw?.size || file.size || 0;
    const uploadedFile = {
      name: file.name,
      size: fileSize,
      createDate: new Date(),
      materialId: response.data[0]?.materialId,
      id: response.data[0]?.materialId,
      address: response.data[0]?.address,
      uid: file.uid || Date.now(),
    };
    editingAttachments.value.push(uploadedFile);
  }
  // 上传完成，重置上传状态
  isEditingUploading.value = false;
};

// 编辑模式下上传前处理
const handleEditBeforeUpload = () => {
  isEditingUploading.value = true;
  return true;
};

const clearPendingAttachments = () => {
  pendingAttachments.value = [];
};

const removePendingAttachment = (index) => {
  pendingAttachments.value.splice(index, 1);
};

const removeEditingAttachment = (index) => {
  editingAttachments.value.splice(index, 1);
};

const handleCancel = () => {
  noteInput.value = "";
  // clearPendingAttachments();
};

const handleEditCancel = () => {
  isEditing.value = false;
  editingNoteId.value = null;
  editingNoteInput.value = "";
  editingAttachments.value = [];
};

const handleEditSubmit = async () => {
  if (!canEditSubmit.value) {
    ElMessage.warning("请输入备注内容或上传附件");
    return;
  }

  const apiSet = getNoteApiSet();

  const payload = {
    content: editingNoteInput.value.trim(),
    hasAttachment: editingAttachments.value.length > 0 ? 1 : 0,
  };
  payload[apiSet.idKey] = editingNoteId.value;

  if (editingAttachments.value.length) {
    payload.attachmentList = editingAttachments.value.map((item) => ({
      materialId: item.materialId,
    }));
  }

  const res = await apiSet.update(payload);
  if (res.success) {
    fetchNotesList();
    // 重置编辑状态
    handleEditCancel();
    if (props.refreshMethod) {
      props.refreshMethod();
    }
  }
};

const getNoteApiSet = () => {
  const isTask = props.objType === 1;
  return {
    get: isTask ? queryTaskNoteList : querySubtaskNoteList,
    add: isTask ? addTaskNote : addSubtaskNote,
    update: isTask ? updateTaskNote : updateSubtaskNote,
    remove: isTask ? deleteTaskNote : deleteSubtaskNote,
    idKey: isTask ? "tnoId" : "snoId",
  };
};

const getNoteIdentifier = (note) => note.tnoId || note.snoId;

const handleSubmit = async () => {
  if (!canSubmit.value) {
    ElMessage.warning("请输入备注内容或上传附件");
    return;
  }
  const apiSet = getNoteApiSet();

  const params = {
    content: noteInput.value.trim(),
    creatorName: currentUserName.value,
    hasAttachment: pendingAttachments.value.length > 0 ? 1 : 0,
  };
  if (apiSet.idKey === "tnoId") {
    params.taskId = props.objId;
  } else {
    params.subtaskId = props.objId;
  }
  if (pendingAttachments.value.length) {
    params.attachmentList = pendingAttachments.value.map((item) => ({
      materialId: item.materialId || item.id,
    }));
  }
  const res = await apiSet.add(params);
  if (res.success) {
    fetchNotesList();
    handleCancel();
    clearPendingAttachments()
    if (props.refreshMethod) {
      props.refreshMethod();
    }
  }
};

const getAvatarText = (name) => {
  if (!name) return "";
  return name.slice(0, 1);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, index)).toFixed(1);
  return `${value} ${units[index]}`;
};

const formatDisplayTime = (time) => {
  const day = dayjs(time);
  if (day.isSame(dayjs(), "day")) {
    return `今天 ${day.format("HH:mm")}`;
  }
  return day.format("YYYY/M/D HH:mm");
};

const handleAttachmentClick = (file) => {
  const params = {
    materialId: file.materialId,
  };
  if (isPreviewable(file)) {
    previewFile(params);
  } else {
    downLoadFile(params, file);
  }
};
const previewFile = (params) => {
  viewMaterial(params).then((res) => {
    // 从response.data中获取Blob数据
    const blob = new Blob([res.data], {
      type: res.headers["content-type"] || "application/octet-stream",
    });
    // 创建一个临时URL用于下载
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  });
};
const downLoadFile = (params, file) => {
  downloadMaterial(params, { responseType: "blob" })
    .then((response) => {
      // 从response.data中获取Blob数据
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // 创建一个临时URL用于下载
      const url = window.URL.createObjectURL(blob);

      // 创建一个隐藏的a标签来触发下载
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name || file.materialName || "下载文件";
      document.body.appendChild(link);
      link.click();

      // 清理资源
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      ElMessage.success("文件下载成功");
    })
    .catch((error) => {
      console.error("下载文件失败:", error);
      ElMessage.error("文件下载失败");
    });
};
// 判断文件是否可预览
const isPreviewable = (file) => {
  if (!file.name && !file.materialName) return false;

  const fileName = file.name || file.materialName;
  const fileExt = fileName.split(".").pop().toLowerCase();

  const previewableTypes = ["jpeg", "jpg", "png", "svg", "pdf", "doc", "docx"];
  return previewableTypes.includes(fileExt);
};

defineExpose({
  fetchNotesList,
});

const handleEditNote = (note) => {
  const targetIndex = noteList.value.findIndex(
    (item) => getNoteIdentifier(item) === getNoteIdentifier(note),
  );
  if (targetIndex === -1) return;

  // 设置编辑状态
  isEditing.value = true;
  editingNoteId.value = getNoteIdentifier(note);
  editingNoteInput.value = note.content;
  editingAttachments.value = note.attachments ? [...note.attachments] : [];

  // 滚动到编辑区域
  setTimeout(() => {
    const editElement = document.querySelector(".edit-note-card");
    if (editElement) {
      editElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
};

const handleDeleteNote = (note) => {
  const apiSet = getNoteApiSet();
  const noteId = getNoteIdentifier(note);
  console.log(note, "note@@");

  if (!noteId) {
    ElMessage.error("无法获取备注标识");
    return;
  }
  ElMessageBox.confirm("确定删除该备注吗？", "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(async () => {
    const payload = {};
    payload[apiSet.idKey] = noteId;
    const res = await apiSet.remove(payload);
    if (res?.success) {
      fetchNotesList();
    }
  });
};
watch(
  () => props.objId,
  () => {
    fetchNotesList();
  },
);

onMounted(() => {
  if (props.objId) {
    fetchNotesList();
  }
});
</script>

<style lang="scss" scoped>
.notes-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 12px;
}

.note-input-card,
.edit-note-card {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);

  :deep(.el-textarea__inner) {
    background-color: #f8fafc;
    border-color: #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #1f2937;
  }
}

.note-edit-form {
  border: 1px solid #4c6ef5;
  background-color: #f8faff;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;

  :deep(.el-textarea__inner) {
    background-color: #fff;
    border-color: #cbd5f5;
  }
}

.pending-attachment-list {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pending-file {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background-color: #eef2ff;
  font-size: 12px;
  gap: 6px;

  .name {
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .size {
    color: #64748b;
  }

  .remove-icon {
    cursor: pointer;
  }
}

.note-edit-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.note-input-actions {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.attach-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4c6ef5;
  cursor: pointer;
  font-size: 14px;
}

.hidden-file-input {
  display: none;
}

.notes-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-item {
  display: flex;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(120deg, #60a5fa, #4f46e5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.note-body {
  flex: 1;
}

.note-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;

  .note-meta {
    display: flex;
    align-items: center;
    gap: 10px;

    .name {
      font-weight: 600;
      color: #0f172a;
    }

    .time {
      font-size: 13px;
      color: #94a3b8;
    }
  }
}

.note-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;

  i {
    cursor: pointer;
    font-size: 16px;
    transition: color 0.2s;

    &:hover {
      color: #4c6ef5;
    }
  }
}

.note-text {
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 8px;
  white-space: pre-line;
}

.note-attachments {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #3b82f6;
  font-size: 13px;
  width: fit-content;

  .link {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .size {
    color: #94a3b8;
  }
}
</style>
