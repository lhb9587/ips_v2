<template>
  <div class="timeline-card mb-0">
    <div class="timeline-body">
      <div
        class="timeline-item"
        v-for="(item, index) in timelineList"
        :key="index"
      >
        <div class="timeline-marker">
          <div class="timeline-dot status-success">
            <i class="mdi mdi-check-circle-outline"></i>
          </div>
          <div class="timeline-line"></div>
        </div>
        <div class="timeline-main">
          <div class="timeline-date-row">
            <span class="timeline-date">{{
              dayjs(item.createTime).format("YYYY-MM-DD")
            }}</span>
            <span class="timeline-owner">
              <i class="bx bx-user"></i>{{ item.operatorName }}
            </span>
            <!-- <span class="timeline-source">{{ item.stageName }}</span> -->
          </div>
          <div class="timeline-content">
            <div class="timeline-desc">{{ item.actionDesc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import dayjs from "dayjs";
import { defineProps, computed } from "vue";

const props = defineProps({
  timelineList: {
    type: Array,
    default: () => [],
  },
});

const timelineList = computed(() => props.timelineList);
</script>

<style lang="scss">
.timeline-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .timeline-body {
    flex: 1;
    margin-top: 16px;
    overflow-y: auto;
    padding-right: 4px;

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 16px;
      align-items: flex-start;

      &:last-child .timeline-line {
        display: none;
      }
    }

    .timeline-marker {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;

      .timeline-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid rgba(24, 144, 255, 0.2);
        background-color: rgba(24, 144, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 4px;

        i {
          font-size: 14px;
          color: #1890ff;
        }

        &.status-success {
          border-color: #b9f8cf;
          background-color: #dcfce7;

          i {
            color: #00a63e;
          }
        }

        &.status-warning {
          border-color: rgba(255, 152, 0, 0.2);
          background-color: rgba(255, 152, 0, 0.1);

          i {
            color: #ff9800;
          }
        }

        &.status-info {
          border-color: rgba(64, 158, 255, 0.2);
          background-color: rgba(64, 158, 255, 0.1);

          i {
            color: #409eff;
          }
        }
      }

      .timeline-line {
        width: 2px;
        flex: 1;
        background-color: #e4e7ed;
        margin-top: 4px;
      }
    }

    .timeline-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .timeline-date-row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      padding-top: 2px;

      .timeline-date {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .timeline-owner {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #606266;

        i {
          font-size: 14px;
        }
      }

      .timeline-source {
        font-size: 12px;
        color: #909399;
      }
    }

    .timeline-content {
      flex: 1;
      background-color: #fbfcff;
      border-radius: 8px;
      padding: 12px 16px;
      border: 1px solid #edf0fb;
      .timeline-desc {
        font-size: 14px;
        color: #303133;
        line-height: 1.5;
      }
    }
  }
}
</style>
