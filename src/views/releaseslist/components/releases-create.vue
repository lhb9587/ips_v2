<script setup>
import { ref, defineEmits, defineExpose, defineProps, onMounted } from "vue";
import Editor from "@/components/common/editor/index.vue";
import { createRelease, modifyRelease } from "@/api/releases";
import { ElMessage } from "element-plus";
import { creatematerialUrl } from "@/api/serviceApi.config.js";
import { getToken } from "@/utils/auth";

const props = defineProps({
  releaseInfo: {
    type: Object,
    default: () => {},
  },
  operateType: {
    type: String,
    default: "create",
  },
});

const releaseForm = ref(props.releaseInfo);
const rules = ref({
  title: [{ required: true, message: "此项为必填项" }],
  displayStatus: [{ required: true, message: "此项为必选项" }],
});

const releaseFormRef = ref(null);
const statusList = ref([
  {
    label: "显示",
    value: 1,
  },
  {
    label: "禁用",
    value: 0,
  },
]);
const handleEditorReady = (editor) => {
  // 当编辑器准备就绪后，保存编辑器实例
  releaseForm.value.content = editor;
};
const uploadFileData = ref({
  tokenID: getToken(),
  subject: "发布说明",
  materialTypeId: 301648,
});
const filesList = ref([]);
const successCallback = (res, file, fileList) => {
  releaseForm.value.coverImage = fileList.map((item) => {
    if (item.materialId) {
      return item.materialId;
    } else {
      return item.response?.data[0]?.materialId;
    }
  })[0];
  filesList.value.push(
    res.data.map((item) => ({
      name: item.materialName,
      url: item.address,
      materialId: item.materialId,
    }))[0]
  );
};
const brforeRemoveFile = (file, fileList) => {
  console.log(file, "filr");
  console.log(fileList, "fileList");
  releaseForm.value.coverImage = "";
  releaseForm.value.coverImageName = "";
  releaseForm.value.coverImagePath = "";
  filesList.value = [];
  // let delmaterialId;
  // if (file.response) {
  //   delmaterialId = file.response.data[0].materialId;
  // } else {
  //   delmaterialId = file.materialId;
  // }
  // delCaseMaterialUrl({
  //   materialId: delmaterialId,
  // })
  //   .then((res) => {
  //     res.message && ElMessage.success();
  //     releaseForm.value.coverImage = "";
  //     filesList.value = fileList;
  //   })
  //   .catch(() => {
  //     releaseForm.value.coverImage = "";
  //   });
};
const beforeUpload = (file) => {
  const FILE_NAME = file.name;
  if (
    FILE_NAME.substring(FILE_NAME.lastIndexOf(".")) !== ".png" &&
    FILE_NAME.substring(FILE_NAME.lastIndexOf(".")) !== ".jpg"
  ) {
    ElMessage.warning("仅支持.png.jpg格式图片");
    return false;
  }
};
const onPreview = (data) => {
  console.log(data, "data");
  let url = "";
  if (data.response) {
    url = data.response?.data[0]?.address;
  } else {
    url = data.url;
  }
  if (!url) {
    return false;
  }
  if (
    ["jpg", "png"].some(
      (item) => url.replace(/.+\./, "").toLocaleLowerCase() == item
    )
  ) {
    window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
  }
};
const emits = defineEmits(["hiddenModal", "updateList"]);
const closeModal = () => {
  resetForm();
  emits("hiddenModal");
};
const resetForm = () => {
  releaseFormRef.value.resetFields();
  releaseForm.value = {};
};
const submitForm = () => {
  releaseFormRef.value.validate((valid) => {
    if (valid) {
      createRelease(releaseForm.value).then((res) => {
        if (res.success) {
          closeModal();
          ElMessage.success("创建成功");
          emits("updateList");
        }
      });
    } else {
      return false;
    }
  });
};
const saveForm = () => {
  releaseFormRef.value.validate((valid) => {
    if (valid) {
      console.log(releaseForm.value, "releaseForm.value");
      modifyRelease(releaseForm.value).then((res) => {
        if (res.success) {
          closeModal();
          ElMessage.success("编辑成功");
          emits("updateList");
        }
      });
    } else {
      return false;
    }
  });
};
onMounted(() => {
  console.log(props.releaseInfo, "props.releaseInfo");
  if (props.operateType === "mod" && props.releaseInfo.coverImage) {
    filesList.value = [
      {
        name: props.releaseInfo.coverImageName,
        url: props.releaseInfo.coverImagePath,
        coverImage: props.releaseInfo.coverImage,
      },
    ];
  }
});
defineExpose({ resetForm });
</script>
<template>
  <el-form
    :model="releaseForm"
    :rules="rules"
    ref="releaseFormRef"
    class="releaseForm p-3"
  >
    <el-form-item
      label="标题"
      prop="title"
    >
      <el-input
        v-model="releaseForm.title"
        placeholder="请输入标题"
      />
    </el-form-item>
    <el-form-item
      label="显示状态"
      prop="displayStatus"
    >
      <el-select
        v-model="releaseForm.displayStatus"
        clearable
        placeholder="请选择显示状态"
        style="width: 200px"
      >
        <el-option
          v-for="item in statusList"
          :key="item.displayStatus"
          :label="item.label"
          :value="item.value"
        /> </el-select
    ></el-form-item>
    <el-form-item
      label="版本"
      prop="version"
    >
      <el-input
        style="width: 200px"
        v-model="releaseForm.version"
        placeholder="请输入版本"
      />
    </el-form-item>
    <el-form-item
      label="封面图片"
      prop="coverImage"
    >
      <el-upload
        name="attachFile"
        :data="uploadFileData"
        :action="creatematerialUrl"
        :on-preview="onPreview"
        :on-remove="brforeRemoveFile"
        :on-success="successCallback"
        :before-upload="beforeUpload"
        :auto-upload="true"
        :file-list="filesList"
        limit="1"
      >
        <span
          style="color: #556ee6; cursor: pointer"
          v-if="!releaseForm.coverImage"
          >点击上传</span
        >
        <span
          style="color: #d3d3d3; cursor: not-allowed"
          v-else
          @click.stop
          >点击上传</span
        >
        <template #tip>
          <span style="font-size: 11px; color: #d3d3d3; margin-left: 6px"
            >(仅支持jpg、png格式图片，建议320x160或2:1比例的图片)</span
          >
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item
      label="更新内容"
      prop="summary"
    >
      <el-input
        v-model="releaseForm.summary"
        :autosize="{ minRows: 2, maxRows: 4 }"
        type="textarea"
        placeholder="请输入更新内容"
      />
    </el-form-item>
    <el-form-item
      label="正文内容"
      prop="content"
      class="fwb"
    >
      <Editor
        :modelValue="releaseForm.content"
        @onEditorReady="handleEditorReady"
      ></Editor>
    </el-form-item>
  </el-form>
  <div class="w-100 modal-footer">
    <div class="text-end">
      <b-button
        variant="light"
        @click="closeModal"
        >取消</b-button
      >
      <b-button
        v-if="operateType == 'create'"
        variant="success"
        class="ms-1"
        @click="submitForm()"
        >确定</b-button
      >
      <a
        v-else
        class="btn btn-primary ms-1"
        @click="saveForm()"
      >
        保存
      </a>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.releaseForm {
  max-height: calc(80vh - 88px);
  overflow-y: auto;
}
.releaseForm .el-form-item {
  display: block;
}
</style>
