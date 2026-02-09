<template>
  <div class="card mb-0">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="card-title mb-0">任务流程</h4>
        <!-- <a
          href="#"
          class="text-muted"
          @click.prevent="toggleExpand"
        >
          {{ isExpanded ? "收起" : "展开" }}
          <i
            class="bx"
            :class="isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'"
          ></i>
        </a> -->
      </div>

      <!-- 表格形式展示任务流程 -->
      <div class="table-responsive">
        <table class="table process-table">
          <thead>
            <tr>
              <th class="col-type">流程类型</th>
              <th class="col-handler">处理人</th>
              <th class="col-remark">处理意见</th>
              <th class="col-status">处理状态</th>
              <th class="col-date">日期</th>
              <th class="col-contract">合同版本</th>
              <th class="col-attachment">附件</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(step, index) of progressData" :key="index" class="process-row">
              <td>
                <div class="task-type">
                  <i class="bx status-icon" :class="getStatusIcon(step.progress)"></i>
                  <span>{{ step.taskName }}</span>
                </div>
              </td>
              <td>{{ step.handlerName || '-' }}</td>
              <td class="remark-cell">
                <div class="remark-content">{{ step.remark || '-' }}</div>
              </td>
              <td>
                <span v-if="step.progress !=='需加审'" class="status-badge" :class="getStatusClass(step.progress)">
                  {{ step.progress }}
                </span>
              </td>
              <td class="col-date">{{ step.handlerDate ? dayjs(step.handlerDate).format('YYYY-MM-DD HH:mm') : '-' }}</td>
              <td class="col-contract">
                <div v-if="step.taskName === '合同撤回'">-</div>
                <div v-else-if="step.contractFiles?.length" class="file-list">
                  <div v-for="(contract, idx) in step.contractFiles" :key="idx" class="file-item">
                    <span 
                      class="clickable file-name" 
                      @click="contractViewFile(contract.filePath, contract.fileName)"
                      :title="contract.fileName"
                    >
                      <i class="bx bx-file"></i> {{ contract.fileName }}
                    </span>
                  </div>
                </div>
                <div v-else>-</div>
              </td>
              <td class="col-attachment">
                <div v-if="step.taskName === '合同撤回'">-</div>
                <div v-else-if="step.attachmentFiles?.length" class="file-list">
                  <div v-for="(attachment, idx) in step.attachmentFiles" :key="idx" class="file-item">
                    <span 
                      class="clickable file-name" 
                      @click="contractViewFile(attachment.filePath, attachment.fileName)"
                      :title="attachment.fileName"
                    >
                      <i class="bx bx-paperclip"></i> {{ attachment.fileName }}
                    </span>
                  </div>
                </div>
                <div v-else>-</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { defineProps, computed } from "vue";
import { contractViewFile } from "@/utils";

const props = defineProps({
  progressData: {
    type: Array,
    required: true,
  },
});

const progressData = computed(() => {
  return props.progressData;
});
// 添加展开收起状态控制
// const isExpanded = ref(true);

// 展开收起切换函数
// const toggleExpand = () => {
//   isExpanded.value = !isExpanded.value;
// };

// 更新状态图标映射
const getStatusIcon = (progress) => {
  if (!progress) {
    return "bxs-check-circle text-success";
  }
  if (progress === "进行中" || progress === "待审核" || progress === "待提交" || progress === "需加审" ) {
    return "bx-loader-circle bx-spin text-primary";
  }
  if (progress.includes("退回")) {
    return "bxs-x-circle text-danger";
  }
  if (
    progress.includes("通过") ||
    progress.includes("呈批") ||
    progress.includes("用印备案") ||
    progress === "已结束"
  ) {
    return "bxs-check-circle text-success";
  }
  return "bxs-check-circle text-success";
};

// 更新状态样式映射
const getStatusClass = (progress) => {
  if (!progress) {
    return "text-success";
  }
  if (
    progress.includes("通过") ||
    progress.includes("呈批") ||
    progress.includes("用印备案") ||
    progress === "已结束"
  ) {
    return "text-success";
  }
  if (progress === "进行中" || progress === "待审核" || progress === "待提交") {
    return "text-primary";
  }
  if (progress.includes("退回") || progress === "撤回" || progress === "注销") {
    return "text-danger";
  }
  return "text-success";
};
</script>

<style scoped lang="scss">
.process-table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0;
  table-layout: fixed;
  
  th {
    background-color: #f8f9fa;
    font-weight: 500;
    padding: 10px 8px;
    border-bottom: 1px solid #e9ecef;
    color: #495057;
    font-size: 14px;
    white-space: nowrap;
  }
  
  td {
    padding: 12px 8px;
    border-top: none;
    border-bottom: 1px solid #e9ecef;
    vertical-align: middle;
    font-size: 13px;
    word-wrap: break-word;
  }
  
  // 设置各列宽度
  .col-type {
    width: 12%;
  }
  
  .col-handler {
    width: 8%;
  }
  
  .col-remark {
    width: 25%;
  }
  
  .col-status {
    width: 8%;
  }
  
  .col-date {
    width: 10%;
  }
  
  .col-contract {
    width: 18%;
  }
  
  .col-attachment {
    width: 19%;
  }
}

.task-type {
  display: flex;
  align-items: center;
  // white-space: nowrap;
  
  .status-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  
  &.text-success {
    background-color: rgba(10, 187, 135, 0.1);
    color: #0abb87;
  }
  
  &.text-primary {
    background-color: rgba(85, 110, 230, 0.1);
    color: #556ee6;
  }
  
  &.text-danger {
    background-color: rgba(244, 106, 106, 0.1);
    color: #f46a6a;
  }
}

.remark-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.remark-content {
  display: -webkit-box;
  // -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.file-item {
  line-height: 1.4;
  
  .clickable {
    cursor: pointer;
    color: #556ee6;
    display: inline-block;
    word-break: break-all;
    
    &:hover {
      text-decoration: underline;
    }
    
    &.file-name {
      white-space: normal;
      line-height: 1.3;
    }
  }
  
  i {
    font-size: 14px;
    margin-right: 3px;
    vertical-align: top;
    margin-top: 1px;
  }
}

// 添加动画效果
.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
