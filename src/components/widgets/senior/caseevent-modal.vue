<template>
  <b-modal
    title="案件详情"
    v-model="detailModalStatus"
    hide-footer
    centered
    @close="detailModalStatus = false"
    :no-close-on-backdrop="true"
    size="xl"
    body-class="important-case-body"
  >
    <div class="case-detail-container">
      <div class="detail-side">
        <div class="detail-content">
          <div class="detail-title">基本信息</div>
          <div class="detail-box">
            <div class="info-grid">
              <div class="info-group case-name-group">
                <div class="info-label">案件名称</div>
                <div class="info-value">
                  <span class="case-name">{{ caseDetail.caseName }}</span>
                </div>
              </div>
              <div class="info-group">
                <div class="info-label">案件文号</div>
                <div class="info-value">{{ caseDetail.agentNum }}</div>
              </div>
              <div class="info-group">
                <div class="info-label">审级</div>
                <div class="info-value">
                  <el-tag
                    v-if="caseDetail.judgeRankStr"
                    type="danger"
                    size="small"
                    style="margin-right: 20px"
                    round
                    >{{ caseDetail.judgeRankStr }}</el-tag
                  >
                </div>
              </div>
              <div class="info-group">
                <div class="info-label">案件类型</div>
                <div class="info-value">{{ caseDetail.caseType }}</div>
              </div>
              <div class="info-group">
                <div class="info-label">申请方向</div>
                <div class="info-value">{{ caseDetail.appFromto }}</div>
              </div>
              <div class="info-group">
                <div class="info-label">案件状态</div>
                <div class="info-value font-size-14">
                  {{ caseDetail.caseStatus }}
                </div>
              </div>
              <div class="info-group">
                <div class="info-label">判决结果</div>
                <div class="font-size-14">
                  <span class="judgment-date">
                    {{ caseDetail.judgmentDate }}
                  </span>
                  <span class="judgment-status">
                    <el-tag
                      v-if="caseDetail.judgment"
                      :type="caseDetail.judgment ? 'success' : 'danger'"
                      size="small"
                      style="margin-left: 20px"
                      round
                      >{{ caseDetail.judgment }}</el-tag
                    >
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-content">
          <div class="detail-title">当事人信息</div>
          <div class="detail-box">
            <div style="display: flex; flex-direction: column; gap: 18px">
              <div class="info-group">
                <div class="info-label">原告</div>
                <div class="info-value font-size-14">
                  {{
                    (caseDetail.plaintiffList &&
                      caseDetail.plaintiffList[0]?.fullname) ||
                    "暂无"
                  }}
                </div>
              </div>
              <div class="info-group">
                <div class="info-label">被告</div>
                <div class="info-value">
                  {{
                    (caseDetail.defendantList &&
                      caseDetail.defendantList[0]?.fullname) ||
                    "暂无"
                  }}
                </div>
              </div>
              <div class="info-group">
                <div class="info-label">客户律师一</div>
                <div class="info-value">{{ caseDetail.cuLawyer1UserId }}</div>
              </div>
              <div class="info-group">
                <div class="info-label">承办律师一</div>
                <div class="info-value">{{ caseDetail.lawyer1UserId }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="detail-side">
        <div class="detail-content">
          <div class="detail-title">最新变动</div>
          <div class="detail-box">
            <div class="change-block">
              <div class="change-title">
                <span class="dot-red"></span>
                {{ caseDetail.type }}
              </div>
              <div class="change-content">
                <div class="case-desc">
                  <span v-html="highlightJudgment(caseDetail.mainText)"></span>
                </div>
                <div class="change-time">{{ caseDetail.createTime }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-content">
          <div class="detail-title">进展时间轴</div>
          <div class="detail-box">
            <el-timeline class="case-timeline">
              <el-timeline-item
                v-for="(item, idx) in timelineData"
                :key="idx"
                :timestamp="item.time"
                color="#409EFF"
                placement="bottom"
              >
                <div class="timeline-title">{{ item.title }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="case-modal-footer">
        <el-button @click="detailModalStatus = false">关闭</el-button>
        <el-button
          type="primary"
          @click="goToRelativeCaseDetail"
          v-if="caseDetail.associationCase"
        >
          查看关联案件
        </el-button>
        <el-button
          type="primary"
          @click="goToCaseDetail"
        >
          查看完整案件详情
        </el-button>
      </div>
    </div>
  </b-modal>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="caseInfo.caseId"
    :taskType="caseInfo.taskType"
  />
</template>

<script setup>
import { computed, defineProps, defineEmits, ref } from "vue";
import CaseSidebar from "@/components/sidebar/case-sidebar";

const props = defineProps({
  caseDetail: {
    type: Object,
    default: () => {},
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const timelineData = computed(() => {
  return props.caseDetail.caseStageList?.map((i) => ({
    title: i.stageName,
    time: i.createTime,
  }));
});
const isCaseDetail = ref(false);
const caseInfo = ref({});
const emit = defineEmits(["update:modelValue"]);
const detailModalStatus = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
const closeDetailModal = () => {
  emit("update:modelValue", false);
};
const goToCaseDetail = () => {
  closeDetailModal();
  caseInfo.value = {
    caseId: props.caseDetail.caseId,
    taskType: props.caseDetail.taskType,
  };
  isCaseDetail.value = true;
};
const goToRelativeCaseDetail = () => {
  closeDetailModal();
  caseInfo.value = {
    caseId: props.caseDetail.associationCase.caseId,
    taskType: props.caseDetail.associationCase.taskType,
  };
  isCaseDetail.value = true;
};
const caseSidebarUpdate = (val) => {
  isCaseDetail.value = val;
};
const highlightJudgment = (text) => {
  if (!text) return "";
  return text
    .replace(
      /胜诉/g,
      '<span style="color: #16b16a; font-weight: 600;">胜诉</span>'
    )
    .replace(
      /败诉/g,
      '<span style="color: #ef4444; font-weight: 600;">败诉</span>'
    )
    .replace(/\*(.*?)\*/g, (match, p1) => {
      return `<span style="color: #ef4444; font-weight: 600;">${p1}</span>`;
    });
};
</script>

<style lang="scss" scoped>
.important-case-body {
  padding-bottom: 0;
}
.modal-footer {
  padding: 12px 0 0;
}
.case-detail-container {
  display: flex;
  gap: 16px;
  .detail-side {
    width: 50%;
    .detail-content {
      margin-bottom: 16px;
    }
  }
  .detail-title {
    font-size: 18px;
    margin-bottom: 12px;
    color: #000000;
  }
  .detail-box {
    background-color: #f9fafb;
    border-radius: 6px;
    padding: 18px 18px 10px 18px;
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 18px;
      column-gap: 32px;
    }
    .info-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    .info-label {
      color: #8a8a8a;
      text-align: left;
      font-size: 14px;
      line-height: 1.2;
    }
    .info-value {
      color: #222;
      text-align: left;
      font-size: 16px;
      display: flex;
      align-items: center;
      line-height: 1.5;
    }
    .judgment-date {
      color: #8a8a8a;
      font-size: 12px;
    }
    .dot-priority {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e6b200;
      margin-right: 6px;
    }
    .change-block {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .change-title {
      font-size: 14px;
      font-weight: 500;
      color: #222;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot-red {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e14c3f;
      margin-right: 4px;
    }
    .change-content {
      margin-left: 24px;
      .change-desc {
        color: #666;
        font-size: 15px;
        line-height: 1.6;
        word-break: break-all;
      }
      .change-time {
        color: #b0b0b0;
        font-size: 13px;
        margin-top: 8px;
      }
    }
    .case-timeline {
      padding-left: 0;
      .el-timeline {
        padding-left: 0;
        margin-left: 0;
      }
      .el-timeline-item__tail {
        left: 6px;
        border-left: 2px solid #e4e7ed;
      }
      .el-timeline-item__node {
        left: 0;
        width: 12px;
        height: 12px;
        background: #409eff;
        border: none;
      }
      .el-timeline-item__wrapper {
        margin-left: 24px;
      }
      .timeline-title {
        font-size: 15px;
        color: #222;
        margin-bottom: 2px;
      }
      .el-timeline-item__timestamp {
        color: #888;
        font-size: 13px;
        margin-top: 0;
      }
      .el-timeline-item:last-child {
        padding-bottom: 0 !important;
      }
    }
    .case-name-group {
      grid-column: 1 / -1;
    }
    .case-name {
      display: block;
      white-space: pre-line;
      word-break: break-all;
    }
  }
}
.case-modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
</style>
