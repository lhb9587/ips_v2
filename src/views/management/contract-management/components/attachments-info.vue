<template>
  <div
    class="card"
    style="margin-bottom: 0"
  >
    <div class="card-body">
      <div>
        <div class="d-flex justify-content-between mb-1">
          <h4 class="card-title">附件信息</h4>
        </div>
        <el-table
          :data="dataList"
          :fit="true"
          :max-height="300"
          :show-overflow-tooltip="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
          >
            <template #default="scope">
              <span
                v-if="col.value === 'uploadTime'"
                >{{
                  dayjs(scope.row.uploadTime).format("YYYY-MM-DD HH:mm:ss")
                }}</span
              >
              <span
                v-if="col.value === 'fileName'"
                class="clickable"
                @click="viewFile(scope.row.filePath, scope.row.fileName)"
                >{{
                  scope.row.fileName
                }}</span
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, defineProps } from "vue";
import dayjs from "dayjs";
import { viewFile } from "@/utils";
const columns = ref([
  {
    title: "流程节点",
    value: "taskInfo",
  },
  {
    title: "类型",
    value: "fileType",
    width: "70px",
  },
  {
    title: "文件名称",
    value: "fileName",
  },
  {
    title: "上传时间",
    value: "uploadTime",
    width: "170px",
  },
  {
    title: "上传人",
    value: "uploaderName",
    width: "90px",
  },
]);

const props = defineProps({
  contractDetial: {
    type: Object,
    default: () => {},
  },
});

const dataList = computed(() => {
  return props.contractDetial?.flowAttachments || [];
});
</script>
