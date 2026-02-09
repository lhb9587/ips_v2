<template>
  <div class="change-history">
    <div class="section-header">
      <div class="section-header-left">
        <i class="bx bx-history section-icon"></i>
        <span class="section-title">变更记录</span>
        <span class="section-count">（{{ histories?.length }}条）</span>
      </div>
    </div>
    <div class="history-list">
      <div
        class="history-card"
        v-for="item in histories"
        :key="item.chId"
      >
        <div class="history-card-header">
          <div class="history-user">
            <div
              class="bx bx-user"
              style="font-size: 14px; color: #97a3c1"
            ></div>
            <div class="history-user-info">
              <span class="name">{{ item.operatorName }}</span>
              <span class="time">{{ dayjs(item.createTime).format("YY/MM/DD HH:mm")}}</span>
            </div>
          </div>
          <div class="history-field">{{ item.fieldLabel }}</div>
        </div>
        <div class="history-body">
          <div class="history-item">
            <span class="label danger">
              <span class="dot"></span>
              变更前
            </span>
            <div class="value danger">{{ item.oldValue }}</div>
          </div>
          <div class="history-item">
            <span class="label success">
              <span class="dot"></span>
              变更后
            </span>
            <div class="value success">{{ item.newValue }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import dayjs from "dayjs";
const props = defineProps({
  changeHistoryList: {
    type: Array,
    default: () => [],
  },
});
const histories = computed(() => props.changeHistoryList);
// const histories = [
//   {
//     id: 1,
//     user: "张经理",
//     time: "01/25 15:30",
//     field: "截止日期",
//     before: "2024-02-28",
//     after: "2024-03-15",
//   },
//   {
//     id: 2,
//     user: "张经理",
//     time: "01/21 10:20",
//     field: "关联客户",
//     before: "未关联",
//     after: "华为技术",
//   },
//   {
//     id: 3,
//     user: "张经理",
//     time: "01/20 14:15",
//     field: "参与人",
//     before: "李会计，陈开发",
//     after: "李会计，陈开发，王设计师",
//   },
//   {
//     id: 4,
//     user: "侯强",
//     time: "01/19 16:45",
//     field: "优先级",
//     before: "中",
//     after: "高",
//   },
//   {
//     id: 5,
//     user: "张经理",
//     time: "01/18 11:30",
//     field: "负责人",
//     before: "未分配",
//     after: "张经理",
//   },
//   {
//     id: 6,
//     user: "张经理",
//     time: "01/17 09:40",
//     field: "关联客户",
//     before: "未关联",
//     after: "华为技术",
//   },
//   {
//     id: 7,
//     user: "张经理",
//     time: "01/16 09:20",
//     field: "参与人",
//     before: "李会计",
//     after: "李会计，陈开发",
//   },
//   {
//     id: 8,
//     user: "张经理",
//     time: "01/15 10:00",
//     field: "优先级",
//     before: "低",
//     after: "中",
//   },
// ];
</script>

<style scoped lang="scss">
.change-history {
  padding: 16px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  .section-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-icon {
    font-size: 18px;
    color: #303133;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #232f41;
  }
  .section-count {
    font-size: 13px;
    color: #97a3c1;
  }
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.history-card {
  border: 1px solid #edf0fb;
  border-radius: 12px;
  padding: 16px;
  background-color: #fbfcff;
}
.history-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.history-user {
  display: flex;
  align-items: center;
  gap: 12px;
  .history-user-info {
    display: flex;
    gap: 12px;
    .name {
      font-weight: 600;
      color: #2f3b54;
    }
    .time {
      font-size: 12px;
      color: #97a3c1;
    }
  }
}
.history-field {
  font-size: 14px;
  font-weight: 600;
  color: #2f3b54;
}
.history-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .label {
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .label.danger {
    color: #f04438;
  }
  .label.success {
    color: #1ea672;
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background-color: currentColor;
  }
  .value {
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid;
    font-size: 12px;
  }
  .value.danger {
    color: #f04438;
    border-color: rgba(240, 68, 56, 0.4);
    background-color: rgba(240, 68, 56, 0.08);
  }
  .value.success {
    color: #1ea672;
    border-color: rgba(30, 166, 114, 0.4);
    background-color: rgba(30, 166, 114, 0.08);
  }
}
@media (max-width: 768px) {
  .history-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
