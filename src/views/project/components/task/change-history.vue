<template>
  <div class="timeline-wrapper">
    <div
      v-for="(item, index) in changeHistoryList"
      :key="item.id"
      class="timeline-item"
    >
      <!-- 左侧圆点 + 竖线 -->
      <div class="left-line">
        <div class="dot"></div>
        <!-- 最后一项不绘制竖线 -->
        <div
          v-if="index !== changeHistoryList.length - 1"
          class="line"
        ></div>
      </div>

      <!-- 内容 -->
      <div class="content">
        <div class="title">{{ item.fieldLabel }}</div>
        <div class="desc">
          <span
            class="old-value"
            v-if="item.fieldName === 'description' && item.oldValue"
            v-html="item.oldValue"
          ></span>
          <span
            class="old-value"
            v-else
            >{{ item.oldValue }}</span
          >
          <el-icon><Right /></el-icon>
          <span
            class="new-value"
            v-if="item.fieldName === 'description' && item.newValue"
            v-html="item.newValue"
          ></span>
          <span
            class="new-value"
            v-else
            >{{ item.newValue || "置空" }}</span
          >
        </div>
        <div class="user">{{ item.operatorName }}</div>
      </div>

      <!-- 右侧时间 -->
      <div class="time">
        {{ dayjs(item.createTime).format("YY/MM/DD HH:mm") }}
      </div>
    </div>
    <el-empty
      v-if="changeHistoryList.length === 0"
      description="暂无数据"
      :image-size="80"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { queryChangeHistory } from "@/api/project";
import dayjs from "dayjs";
import { Right } from "@element-plus/icons-vue";

const props = defineProps({
  objId: {
    type: Number,
    required: true,
  },
  objType: {
    type: Number,
    required: true,
  },
});
const changeHistoryList = ref([]);
const fetchChangeHistory = () => {
  const params = {
    objId: props.objId,
    objType: props.objType === 1 ? 2 : 3,
  };
  queryChangeHistory(params).then((res) => {
    changeHistoryList.value = res.data || [];
  });
};
onMounted(() => {
  fetchChangeHistory();
});
</script>

<style scoped>
.timeline-wrapper {
  padding-left: 20px;
  position: relative;
  margin-top: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
  position: relative;
}

/* 左侧：圆点 + 竖线 */
.left-line {
  width: 12px;
  position: relative;
}

.dot {
  width: 10px;
  height: 10px;
  background: #1f1f1f;
  border-radius: 50%;
  position: relative;
  left: -6px;
}

.line {
  width: 2px;
  background: #e5e5e5;
  height: calc(100% + 50px);
  position: absolute;
  left: -2px;
  top: 10px;
}

/* 中间内容 */
.content {
  flex: 1;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 4px;
}

.desc {
  color: #444;
  font-size: 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  .old-value {
    color: red;
  }
  .new-value {
    color: #00a63e;
    font-weight: 600;
  }
  .new-value :deep(p) {
    margin-bottom: 0;
  }
  .old-value :deep(p) {
    margin-bottom: 0;
  }
}

.user {
  color: #999;
  font-size: 13px;
}

/* 右侧时间 */
.time {
  white-space: nowrap;
  color: #999;
  font-size: 13px;
  padding-top: 2px;
}
</style>
