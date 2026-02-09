<template>
  <div class="m-wangEditor">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      ref="wEdit"
      class="editor-content"
      :style="{ height: height }"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="changeHtml"
    />
  </div>
</template>
<script setup>
// 引入 wangEditor
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
// import { DomEditor } from "@wangeditor/editor";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { creatematerialUrl } from "@/api/serviceApi.config.js";

import {
  onBeforeUnmount,
  shallowRef,
  ref,
  computed,
  defineEmits,
  defineProps,
} from "vue";
import { ElMessage } from "element-plus";
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
import { getToken } from "@/utils/auth";
const toolbarConfig = computed(() => ({
  showToolbar: true,
  excludeKeys: [...props.excludeKeys],
}));
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      //图片上传
      fieldName: "attachFile",
      server: creatematerialUrl,
      base64Limitsize: 5 * 1024,
      meta: {
        tokenID: getToken(),
      },
      customInsert(res, insertFn) {
        // JS 语法
        // res 即服务端的返回结果
        // 从 res 中找到 url alt href ，然后插入图片
        insertFn("/ipdoc" + res.data[0].address, "", "");
      },
    },
    uploadVideo: {
      //视频上传
      fieldName: "attachFile",
      server: creatematerialUrl,
      maxFileSize: 500 * 1024 * 1024,
      allowedFileTypes: ["video/*"],
      meta: {
        tokenID: getToken(),
      },
      onSuccess(file, res) {
        // TS 语法
        // onSuccess(file, res) {          // JS 语法
        console.log(`${file.name} 上传成功`, res);
      },

      customInsert(res, insertFn) {
        // JS 语法
        // res 即服务端的返回结果
        // 从 res 中找到 url alt href ，然后插入图片
        insertFn("/ipdoc" + res.data[0].address, "", "");
      },
      onFailed(file, res) {
        // TS 语法
        // onFailed(file, res) {           // JS 语法
        console.log(`${file.name} 上传失败`, res);
      },

      // 上传错误，或者触发 timeout 超时
      onError(file, err) {
        // TS 语法
        // onError(file, err, res) {               // JS 语法
        // console.log(`${file.name} 上传出错`, err, res)
        ElMessage.error("上传出错:" + err);
      },
    },
  },
};

// 内容 HTML
const mode = ref("default");
let emit = defineEmits(["update:modelValue", "onEditorReady"]);

let props = defineProps({
  modelValue: String,
  excludeKeys: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: "400px",
  },
});

const changeHtml = () => {};

// const getEditorData = () => {
//   // 通过代码获取编辑器内容
//   let data = editors.txt.html();
//   alert(data);
// };

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  // 渲染完成后调整视频显示大小
  changeHtml();
};
const valueHtml = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    // 防止富文本内容为空时，校验失败
    if (editorRef.value.isEmpty()) val = "";
    emit("update:modelValue", val);
    emit("onEditorReady", val);
    // const toolbar = DomEditor.getToolbar(editorRef.value);
    // const curToolbarConfig = toolbar.getConfig();
    // console.log(curToolbarConfig.toolbarKeys, "toolbarKeys");
  },
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  // 调用销毁 API 对当前编辑器实例进行销毁
  const editor = editorRef.value;
  if (editor == null) {
    return;
  }
  editor.destroy();
});
</script>
<style lang="scss" scoped>
.m-wangEditor {
  width: 100%;
  border: 1px solid #cccccc;
  border-radius: 8px;
  .editor-toolbar {
    border-bottom: 1px solid #cccccc;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  :deep(.w-e-toolbar) {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .editor-content {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
}
:deep(.w-e-textarea-video-container) {
  video {
    width: 100%;
    height: auto;
  }
}
:deep(.w-e-text-container) {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
