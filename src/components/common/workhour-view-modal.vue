<template>
  <el-dialog
    :model-value="modelValue"
    title="工时查看"
    width="780px"
    :append-to-body="true"
    :z-index="3000"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="loading" class="workhour-view-loading">加载中...</div>
    <div v-else class="workhour-view-body">
      <table class="workhour-view-table">
        <tbody>
          <tr>
            <th>活动类型</th>
            <td>{{ detail.workTypeName || detail.workType || "--" }}</td>
            <th>工时日期</th>
            <td>{{ detail.hourDate || "--" }}</td>
          </tr>
          <tr>
            <th>客户名称</th>
            <td>{{ detail.custName || "--" }}</td>
            <th>案件名称</th>
            <td>{{ detail.caseName || "--" }}</td>
          </tr>
          <tr>
            <th>案件类型</th>
            <td>{{ detail.caseType || "--" }}</td>
            <th>员工</th>
            <td>{{ detail.whUserName || "--" }}</td>
          </tr>
          <tr>
            <th>开始时间</th>
            <td>{{ detail.beginDate || "--" }}</td>
            <th>结束时间</th>
            <td>{{ detail.endDate || "--" }}</td>
          </tr>
          <tr>
            <th>工时</th>
            <td>{{ detail.time || "--" }}</td>
            <th>核定工时</th>
            <td>{{ detail.approvedTime || "--" }}</td>
          </tr>
          <tr>
            <th>费率</th>
            <td>{{ detail.criterionRate || "--" }}</td>
            <th>账单额</th>
            <td>{{ formatAmount(detail.amount) || "--" }}</td>
          </tr>
          <tr>
            <th>核定金额</th>
            <td>{{ formatAmount(detail.approvedAmountCust) || "--" }}</td>
            <th>小组</th>
            <td>{{ detail.groupName || "--" }}</td>
          </tr>
        </tbody>
      </table>

      <div class="workhour-view-section">
        <div class="workhour-view-section-title">工时内容</div>
        <div class="workhour-view-content">{{ detail.workContent || "--" }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/* global defineProps, defineEmits */
import { ref, watch } from "vue";
import { queryWorkHours } from "@/api/caseList";
import { formatAmount } from "@/utils";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  hoursId: { type: [Number, String], default: null },
});

const emit = defineEmits(["update:modelValue"]);

const loading = ref(false);
const detail = ref({});

const handleClose = () => {
  emit("update:modelValue", false);
};

const loadDetail = async () => {
  if (!props.hoursId) return;
  loading.value = true;
  try {
    const res = await queryWorkHours({ hoursId: props.hoursId });
    const workhoursInfo = res?.data?.workhoursList?.[0] || {};
    detail.value = {
      ...workhoursInfo,
      approvedTime: workhoursInfo.time || workhoursInfo.approvedTime,
      approvedAmountCust: workhoursInfo.amount || workhoursInfo.approvedAmountCust,
    };
  } catch (error) {
    console.error("加载工时详情失败:", error);
    detail.value = {};
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.modelValue, props.hoursId],
  ([visible]) => {
    if (visible) loadDetail();
  }
);
</script>

<style scoped lang="scss">
.workhour-view-loading {
  padding: 16px;
  color: #5f6f86;
}

.workhour-view-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workhour-view-table {
  width: 100%;
  border-collapse: collapse;

  th {
    width: 110px;
    text-align: left;
    font-weight: 600;
    color: #1f2a44;
    padding: 6px 8px;
    background: #f5f7fa;
    border: 1px solid #e6edf8;
    white-space: nowrap;
  }

  td {
    padding: 6px 8px;
    border: 1px solid #e6edf8;
    color: #1f2a44;
  }
}

.workhour-view-section-title {
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 6px;
}

.workhour-view-content {
  padding: 10px 12px;
  border: 1px solid #e6edf8;
  background: #f9fbff;
  color: #1f2a44;
  white-space: pre-wrap;
  border-radius: 6px;
}
</style>
