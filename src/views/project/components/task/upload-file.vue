<template>
  <div class="upload-file-container">
    <el-upload
      name="attachFile"
      :data="attUploadFileData"
      class="upload-file"
      drag
      :action="uploadUrl"
      :on-success="handleFileSuccess"
      :before-upload="beforeUpload"
      :show-file-list="false"
      :disabled="!editPermissionLevel"
    >
      <i
        class="mdi mdi-cloud-upload-outline"
        style="font-size: 36px"
      ></i>
      <div class="el-upload__text">将文件拖拽到此处以添加附件，或者浏览，最大200MB</div>
    </el-upload>

    <!-- 已上传文件列表 -->
    <div
      v-if="uploadedFiles.length > 0"
      class="file-list"
    >
      <div
        v-for="(file, index) in uploadedFiles"
        :key="file.materialId || index"
        class="file-item"
      >
        <div class="file-icon">
          <i class="mdi mdi-file-document-outline"></i>
        </div>
        <div class="file-info">
          <div class="file-name">{{ file.name || file.materialName }}</div>
          <div class="file-meta">
            {{ formatFileSize(file.size) }} • {{ formatDate(file.createDate) }}
          </div>
        </div>
        <div class="file-actions">
          <!-- <i
            class="mdi mdi-pencil file-action-icon"
            @click="handleEdit(file, index)"
            title="编辑"
          ></i> -->
          <i
            v-if="isPreviewable(file)"
            class="mdi mdi-eye-outline file-action-icon"
            @click="handleView(file)"
            title="预览"
          ></i>
          <i
            class="mdi mdi-download file-action-icon"
            @click="handleDownload(file)"
            title="下载"
          ></i>
          <i
            class="mdi mdi-close file-action-icon"
            @click="handleDelete(file, index)"
            title="删除"
            v-if="editPermissionLevel"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, defineProps, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getToken } from "@/utils/auth";
import { createPrjMaterialUrl } from "@/api/serviceApi.config.js";
import dayjs from "dayjs";
import {
  deleteMaterialUrl,
  downloadMaterial,
  viewMaterial,
} from "@/api/project";

const uploadUrl = createPrjMaterialUrl;
const props = defineProps({
  defaultMaterialList: {
    type: Array,
    default: () => [],
  },
  objType: {
    type: Number,
  },
  objId: {
    type: Number,
  },
  editPermissionLevel: {
    type:Number,
    default: 1
  }
});
// 动态构建上传参数，当 objId 有值时才添加 objInstIdList
const attUploadFileData = computed(() => {
  const data = {
    tokenID: getToken(),
    objType: props.objType === 1 ? props.objType : 2,
  };
  // 只有当 objId 有值时才添加 objInstIdList
  if (props.objId) {
    data.objInstIdList = [props.objId];
  }
  return data;
});

// 已上传文件列表（用于自定义显示）
const uploadedFiles = ref([]);

watch(
  () => props.defaultMaterialList,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      uploadedFiles.value = [...newValue];
    }
  },
  { deep: true, immediate: true }
);

// 上传前检查文件大小
const beforeUpload = (file) => {
  // 200MB = 200 * 1024 * 1024 bytes
  const isLt200M = file.size / 1024 / 1024 < 200;
  if (!isLt200M) {
    ElMessage.error('上传文件大小不能超过 200MB!');
    return false;
  }
  return true;
};

// 处理上传成功
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
      filePath: response.data[0]?.address,
      uid: file.uid || Date.now(),
    };
    uploadedFiles.value.push(uploadedFile);
    ElMessage.success("文件上传成功");
  }
};

// 处理文件移除
// const handleFileRemoveFile = (file) => {
//   // 从已上传列表中移除
//   const attachmentId = file.attachmentId || file.response?.data?.attachmentId;
//   if (attachmentId) {
//     uploadedFiles.value = uploadedFiles.value.filter(
//       (item) => item.attachmentId !== attachmentId
//     );
//     ElMessage.success("文件删除成功");
//   } else {
//     // 如果没有 attachmentId，尝试通过 uid 或 name 匹配
//     const index = uploadedFiles.value.findIndex(
//       (item) => item.uid === file.uid || item.name === file.name
//     );
//     if (index > -1) {
//       uploadedFiles.value.splice(index, 1);
//       ElMessage.success("文件删除成功");
//     }
//   }
// };

// 处理编辑文件名
// const handleEdit = (file, index) => {
//   ElMessageBox.prompt("请输入新文件名", "编辑文件名", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     inputValue: file.name,
//     inputValidator: (value) => {
//       if (!value || !value.trim()) {
//         return "文件名不能为空";
//       }
//       return true;
//     },
//   })
//     .then(({ value }) => {
//       uploadedFiles.value[index].name = value.trim();
//       ElMessage.success("文件名修改成功");
//     })
//     .catch(() => {
//       // 用户取消
//     });
// };

// 处理下载文件
const handleDownload = (file) => {
  const params = {
    materialId: file.materialId,
  };

  // 显示加载状态
  const loading = ElMessage({
    message: "正在下载文件...",
    type: "info",
    duration: 0,
  });

  downloadMaterial(params)
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

      loading.close();
      ElMessage.success("文件下载成功");
    })
    .catch((error) => {
      console.error("下载文件失败:", error);
      loading.close();
      ElMessage.error("文件下载失败");
    });
};

const handleView = (file) => {
  const params = {
    materialId: file.materialId,
  };
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

// 处理删除文件
const handleDelete = (file, index) => {
  ElMessageBox.confirm("确定要删除该文件吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const params = {
      materialIdList: [file.materialId],
    };
    deleteMaterialUrl(params).then((res) => {
      if (res.success) {
        uploadedFiles.value.splice(index, 1);
        ElMessage.success("文件删除成功");
      }
    });
  });
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("YYYY/MM/DD HH:mm:ss");
};

// 判断文件是否可预览
const isPreviewable = (file) => {
  if (!file.name && !file.materialName) return false;
  
  const fileName = file.name || file.materialName;
  const fileExt = fileName.split(".").pop().toLowerCase();
  
  const previewableTypes = ["jpeg", "jpg", "png", "svg", "pdf", "doc", "docx"];
  return previewableTypes.includes(fileExt);
};

// 暴露方法供父组件调用
defineExpose({
  getUploadedFiles: () => uploadedFiles.value,
  clearFiles: () => {
    uploadedFiles.value = [];
  },
});
</script>

<style lang="scss" scoped>
.upload-file-container {
  .upload-file {
    :deep(.el-upload-dragger) {
      background-color: #fafafa;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      padding: 40px 20px;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background-color: #f5f7fa;
      }
    }

    .el-upload__text {
      color: #606266;
      font-size: 14px;
      text-align: center;
    }
  }

  .file-list {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .file-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;
      border: 1px solid #e2e8f0;
      width: calc(50% - 6px);
      box-sizing: border-box;

      &:hover {
        background-color: #eef2f7;
        cursor: pointer;
        .file-actions {
          opacity: 1;
        }
      }

      .file-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        background-color: #f0f0f0;
        border-radius: 6px;
        color: #606266;
        font-size: 18px;
        flex-shrink: 0;
      }

      .file-info {
        flex: 1;
        min-width: 0;

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          font-size: 12px;
          color: #909399;
        }
      }

      .file-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: 12px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.3s;

        .file-action-icon {
          font-size: 16px;
          color: #909399;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #409eff;
          }

          &.mdi-close:hover {
            color: #f56c6c;
          }
        }
      }
    }
  }
}
</style>
