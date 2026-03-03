<template>
  <div class="cover-container">
    <div class="cover-left">
      <div class="summary-cards">
        <!-- 新案递交提醒 - 红色 -->
        <div class="summary-card card-red">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-time-five"></i>
              </div>
              <div class="card-value">
                {{ minDayDiffInfo?.dayDiff || 0
                }}{{ minDayDiffInfo?.dayDiff ? "天" : "" }}
              </div>
            </div>
            <div
              class="card-title"
              :title="minDayDiffInfo?.typeName"
            >
              {{ minDayDiffInfo?.typeName || "暂无时限" }}
            </div>
            <div class="card-subtitle">距下一时限(天)</div>
          </div>
        </div>

        <!-- 账单总金额 - 蓝色 -->
        <div class="summary-card card-blue">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-yen"></i>
              </div>
              <div class="card-value">
                {{ formatNumber(caseCoverBillInfo.billSum) }}
              </div>
            </div>
            <div class="card-title">账单总金额</div>
            <div class="card-subtitle">
              已收:¥{{ formatNumber(caseCoverBillInfo.paidLocalSum) }}
            </div>
          </div>
        </div>

        <!-- 文档资料 - 紫色 -->
        <div class="summary-card card-purple">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-file"></i>
              </div>
              <div class="card-value">{{ eventFiletotal }}</div>
            </div>
            <div class="card-title">文档资料</div>
            <div class="card-subtitle">已归档文档数</div>
          </div>
        </div>

        <!-- 关键事项 - 黄色 -->
        <div class="summary-card card-yellow">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-error"></i>
              </div>
              <div class="card-value">{{ dayDiffTotal }}</div>
            </div>
            <div class="card-title">关键事项</div>
            <div class="card-subtitle">需立即处理</div>
          </div>
        </div>
      </div>

      <!-- 信息模块区域 -->
      <div class="info-panels">
        <!-- 基础信息 - 左上 -->
        <div class="info-panel card mb-0">
          <div class="panel-header">
            <i
              class="mdi mdi-clipboard-text-outline"
              style="color: #155dfc"
            ></i>
            <span class="panel-title">基础信息</span>
          </div>
          <div class="panel-body">
            <div class="info-item">
              <span class="info-label">案件名称</span>
              <span class="info-value">{{ caseCoverInfo.caseName }}</span>
            </div>
            <div class="info-grid">
              <div class="info-column">
                <div class="info-item">
                  <span class="info-label">案件领域</span>
                  <span class="info-value">{{ caseCoverInfo.domain }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">申请方向</span>
                  <span class="info-value">{{ caseCoverInfo.appFromto }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">机密案件</span>
                  <span class="info-value text-danger">{{
                    caseCoverInfo.ifsec
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">立卷日期</span>
                  <span class="info-value">{{ caseCoverInfo.caseDate }}</span>
                </div>
              </div>
              <div class="info-column">
                <div class="info-item">
                  <span class="info-label">案件类型</span>
                  <span class="info-value">{{
                    caseCoverInfo.caseTypeStr
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">权利号</span>
                  <span class="info-value">{{
                    caseCoverInfo.droitNumber
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">案件等级</span>
                  <span class="info-value text-warning">{{
                    caseCoverInfo.caseLevelStr
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">下一时限</span>
                  <span class="info-value text-danger">{{
                    minDayDiffInfo.abslimitDate
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 客户信息 - 右上 -->
        <div class="info-panel card mb-0">
          <div class="panel-header">
            <i
              class="icon iconfont icon-users"
              style="color: #9810fa"
            ></i>
            <span class="panel-title">客户信息</span>
          </div>
          <div class="panel-body">
            <div class="info-item">
              <span class="info-label">客户名称</span>
              <span class="info-value">{{ caseCoverInfo.custName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">客户联系人</span>
              <span class="info-value">{{
                caseCoverInfo.custContactName
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请人中文名称</span>
              <span class="info-value">{{ caseCoverInfo.appName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请人中文地址</span>
              <span class="info-value">{{ caseCoverInfo.appCnAddr }}</span>
            </div>
          </div>
        </div>

        <!-- 账单收入 - 左下 -->
        <div class="info-panel card mb-0">
          <div class="panel-header">
            <i
              class="bx bx-yen"
              style="color: #67c23a"
            ></i>
            <span class="panel-title">账单收入</span>
            <div
              class="view-all"
              @click="changeComponent('bill')"
              v-if="Object.keys(caseCoverBillInfo).length"
            >
              查看明细
            </div>
          </div>
          <div class="panel-body">
            <template v-if="Object.keys(caseCoverBillInfo).length">
              <div class="bill-item">
                <span class="bill-label">账单总金额</span>
                <span class="bill-value text-success"
                  >¥{{ formatNumber(caseCoverBillInfo.billSum) }}</span
                >
              </div>
              <div class="bill-item">
                <span class="bill-label">费用</span>
                <span class="bill-value text-danger"
                  >{{ caseCoverBillInfo.feeSum ? "-" : "" }}¥{{
                    formatNumber(caseCoverBillInfo.feeSum)
                  }}</span
                >
              </div>
              <div
                class="bill-item"
                style="padding-bottom: 12px; border-bottom: 1px solid #ebeef5"
              >
                <span class="bill-label">内账</span>
                <span class="bill-value text-danger"
                  >{{ caseCoverBillInfo.billInterSum ? "-" : "" }}¥{{
                    formatNumber(caseCoverBillInfo.billInterSum)
                  }}</span
                >
              </div>
              <div class="bill-item">
                <span class="bill-label">可分配金额</span>
                <span class="bill-value text-success"
                  >¥{{ formatNumber(caseCoverBillInfo.alloSum) }}</span
                >
              </div>
            </template>
            <el-empty
              v-else
              description="暂无数据"
              :image-size="80"
              style="padding: 10px"
            />
          </div>
        </div>

        <!-- 重点关注 - 右下 -->
        <div class="info-panel card mb-0">
          <div class="panel-header">
            <i
              class="bx bx-error"
              style="color: #f46a6a"
            ></i>
            <span class="panel-title">重点关注事项</span>
          </div>
          <div class="panel-body panel-body-sroll">
            <div
              :class="{
                'alert-red': item.dayDiff <= 7,
                'alert-yellow': item.dayDiff > 7 && item.dayDiff <= 14,
              }"
              class="alert-item"
              v-for="(item, index) in abslimitList"
              :key="index"
              @click="viewLimitDetail(item)"
            >
              <div class="alert-icon">
                <i
                  class="bx bx-error"
                  v-if="item.dayDiff <= 7"
                ></i>
                <i
                  class="bx bx-time-five"
                  v-else
                ></i>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ item.typeName }}</div>
                <div class="alert-subtitle">{{ item.caption }}</div>
              </div>
              <div class="day-count">{{ item.dayDiff }}天</div>
            </div>
            <el-empty
              description="暂无数据"
              v-if="!abslimitList.length"
              :image-size="80"
              style="padding: 10px"
            />
            <!-- <div class="alert-item alert-yellow">
              <div class="alert-icon">
                <i class="bx bx-time-five"></i>
              </div>
              <div class="alert-content">
                <div class="alert-title">客户特殊指示待确认</div>
                <div class="alert-subtitle">关于境外申请策略调整</div>
              </div>
            </div> -->
          </div>
        </div>
      </div>

      <!-- 底部三个模块：办案团队、文档统计、境外申请 -->
      <div
        class="bottom-panels"
        :class="{ 'two-columns': !hasOverseasApplication }"
      >
        <!-- 办案团队 -->
        <div class="bottom-panel card mb-0">
          <div class="panel-header">
            <i
              class="bx bx-group"
              style="color: #4f39f6"
            ></i>
            <span class="panel-title">办案团队</span>
            <div
              class="view-all"
              @click="changeComponent('case-handler')"
            >
              查看全部
            </div>
          </div>
          <div class="panel-body">
            <div class="team-item">
              <div class="team-name">{{ caseManager }}</div>
              <div class="team-role">客户负责人</div>
            </div>
            <div
              class="team-item"
              v-for="item of caseInfo.trademarkCaseCustWorkgroups"
              :key="item.groupId"
            >
              <div class="team-name">{{ item.groupName }}</div>
              <div class="team-role">客户组</div>
            </div>
            <div
              class="team-item"
              v-for="item of caseInfo.trademarkCaseCBWorkgroups"
              :key="item.groupId"
            >
              <div class="team-name">{{ item.groupName }}</div>
              <div class="team-role">承办组</div>
            </div>
            <div
              class="team-item"
              v-for="item of caseInfo.trademarkCaseLCWorkgroups"
              :key="item.groupId"
            >
              <div class="team-name">{{ item.groupName }}</div>
              <div class="team-role">流程组</div>
            </div>
          </div>
        </div>

        <!-- 文档统计 -->
        <div class="bottom-panel card mb-0">
          <div class="panel-header">
            <i
              class="bx bx-folder-open"
              style="color: #9810fa"
            ></i>
            <span class="panel-title">文档统计</span>
          </div>
          <div class="doc-stat-body">
            <div
              class="doc-stat-item"
              v-for="(item, index) in eventList"
              :key="index"
            >
              <span class="doc-label">{{ item.docTypeName }}</span>
              <span :class="['doc-badge', getBadgeClass(index)]">{{
                item.docCount
              }}</span>
            </div>
          </div>
          <el-empty
            description="暂无数据"
            v-if="!eventList.length"
            :image-size="80"
            style="padding: 10px"
          />
        </div>

        <!-- 境外申请 - 可能不存在 -->
        <div
          v-if="hasOverseasApplication"
          class="bottom-panel card mb-0"
        >
          <div class="panel-header">
            <i
              class="bx bx-buildings"
              style="color: #155dfc"
            ></i>
            <span class="panel-title">境外申请</span>
          </div>
          <div class="panel-body">
            <div class="d-flex justify-content-between align-items-center">
              <span class="overseas-label">注册方式</span>
              <span style="font-weight: 600; color: #212529">{{
                caseCoverInfo.madrid
              }}</span>
            </div>
            <div class="overseas-item">
              <span class="overseas-label">国家</span>
              <span class="overseas-input">{{ caseCoverInfo.appState }}</span>
            </div>
            <div class="overseas-item">
              <span class="overseas-label">外方代理所</span>
              <span class="overseas-input">{{
                caseCoverInfo.agencyCustName
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cover-right">
      <div class="timeline-card card mb-0">
        <div class="panel-header">
          <i class="bx bx-time-five"></i>
          <span class="panel-title">案件动态</span>
        </div>
        <div class="timeline-body">
          <div
            class="timeline-item"
            v-for="(item, index) in caseTimeline"
            :key="index"
          >
            <div class="timeline-marker">
              <div class="timeline-dot status-success">
                <i class="mdi mdi-check-circle-outline"></i>
              </div>
              <div class="timeline-line" />
            </div>
            <div class="timeline-main">
              <div class="timeline-date-row">
                <span class="timeline-source">{{ item.stageName }}</span>
                <span class="timeline-owner">
                  <i class="bx bx-user"></i>{{ item.opertorName }}
                </span>
                <span class="timeline-date">{{
                  dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss")
                }}</span>
              </div>
              <div class="timeline-content">
                <div class="timeline-desc">{{ item.proceeName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="showLimitDetailModal"
      title="时限详情"
      centered
      hide-footer
      content-class="autoWidth-modal"
      style="z-index: 2000"
    >
      <LimitDetail
        :detail="limitDetail"
        :noCliclDetail="true"
      />
    </b-modal>
  </div>
</template>
<script setup>
import { ref, defineProps, watch, computed, defineEmits } from "vue";
import { getCaseTimelimitList, getCaseInfoByCaseId } from "@/api/caseList";
import { queryBillStatisticsByCaseId } from "@/api/billApi";
import { queryCaseEventListUrl } from "@/api/caseDetail";
import dayjs from "dayjs";
import { formatNumber } from "@/utils/count";
import LimitDetail from "@/components/sidebar/components/limit/detail";

const props = defineProps({
  caseInfo: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["change-component"]);
const caseCoverInfo = ref({});
const caseCoverBillInfo = ref({});
const eventList = ref([]);
const eventFiletotal = ref(0);
const changeComponent = (type) => {
  emit("change-component", type);
};
//时限
const minDayDiffInfo = ref({});
const dayDiffTotal = ref(0);
const abslimitList = ref([]);
const showLimitDetailModal = ref(false);
const limitDetail = ref({});
const viewLimitDetail = (item) => {
  showLimitDetailModal.value = true;
  limitDetail.value = item;
};
//客户负责人
const caseManager = computed(() => {
  const managers = props.caseInfo.caseCustRespUserArray || [];
  if (!managers || !managers.length) return "无";
  return managers.map((item) => item.fullname).join("、");
});
const getCaseTimelimitNum = () => {
  const params = {
    caseId: props.caseInfo.caseId || "",
    timelimitState: 1,
  };
  getCaseTimelimitList(params).then((res) => {
    if (res.success) {
      if (res.data && res.data.length) {
        //获取距离绝限日期最近的一条数据就是dayDiff最小的
        const minDayDiff = res.data.reduce((minObj, current) => {
          const minVal = Number(minObj.dayDiff);
          const currVal = Number(current.dayDiff);
          // 比较并返回较小值的对象
          return currVal < minVal ? current : minObj;
        });
        minDayDiffInfo.value = minDayDiff;
        dayDiffTotal.value = res?.total || 0;
        const list = res.data || [];
        //筛选出<=14天的时限
        // abslimitList.value = list.filter((item) => item.dayDiff <= 14);
        abslimitList.value = list;
      } else {
        dayDiffTotal.value = 0;
        abslimitList.value = [];
        minDayDiffInfo.value = {};
      }
    }
  });
};

//获取案件信息
const fetchCaseInfoByCaseId = () => {
  getCaseInfoByCaseId({
    caseId: props.caseInfo.caseId,
  }).then((res) => {
    caseCoverInfo.value = res.data[0] || {};
  });
};
//获取案件关联账单信息
const fetchBillStatisticsByCaseId = () => {
  queryBillStatisticsByCaseId({ caseId: props.caseInfo.caseId }).then((res) => {
    caseCoverBillInfo.value = res.data || {};
  });
};
//获取案件动态
const hasOverseasApplication = computed(() => {
  return ["内-外", "外-外"].includes(caseCoverInfo.value.appFromto);
});
const caseTimeline = computed(() => {
  const list =
    props.caseInfo.caseEvolve?.filter((item) => typeof item === "object") || [];
  list.reverse();
  const arr = list
    .filter((item) => Array.isArray(item.taskRecordArray))
    .flatMap((item) => item.taskRecordArray);
  return arr;
});
//下一时限
// const nextLimits = computed(() => {
//   if (!abslimitList.value || abslimitList.value.length === 0) {
//     return "";
//   }
//   return abslimitList.value[0].abslimitDate || "";
// });
//获取文档列表
const fetchCaseEventList = () => {
  queryCaseEventListUrl({ caseId: props.caseInfo.caseId }).then((res) => {
    eventList.value = res.data || [];
    eventFiletotal.value = res.total || 0;
  });
};

// 根据索引获取徽章颜色类
const getBadgeClass = (index) => {
  const badgeClasses = [
    "badge-blue",
    "badge-green",
    "badge-purple",
    "badge-orange",
    "badge-cyan",
    "badge-red",
  ];
  return badgeClasses[index % badgeClasses.length];
};
watch(
  () => props.caseInfo,
  (newVal) => {
    if (newVal.caseId) {
      getCaseTimelimitNum();
      fetchCaseInfoByCaseId();
      fetchBillStatisticsByCaseId();
      fetchCaseEventList();
    }
  },
  { immediate: true, deep: true },
);
</script>
<style lang="scss" scoped>
.cover-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 16px;
  .cover-left {
    flex: 2;
    height: 100%;
    display: flex;
    flex-direction: column;

    .summary-cards {
      display: flex;
      flex-direction: row;
      gap: 12px;
      height: 100px;

      .summary-card {
        flex: 1;
        border-radius: 8px;
        padding: 10px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .card-content {
          width: 100%;
          height: 100%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .card-into-top {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .card-icon {
          opacity: 0.8;

          i {
            font-size: 24px;
            color: #ffffff;
          }
        }

        .card-value {
          font-size: 20px;
          font-weight: 500;
          color: #ffffff;
          line-height: 1;
        }

        .card-title {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          //超出隐藏
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
        }

        &.card-red {
          background: linear-gradient(135deg, #f46a6a 0%, #e74c3c 100%);
        }

        &.card-blue {
          background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
        }

        &.card-purple {
          background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
        }

        &.card-yellow {
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
        }
      }
    }

    .info-panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;

      .info-panel {
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        overflow: hidden;
        padding: 16px;

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 0 12px 0;
          border-bottom: 1px solid #ebeef5;

          i {
            font-size: 18px;
            color: #495057;
          }

          .panel-title {
            font-size: 15px;
            font-weight: 600;
            color: #212529;
            flex: 1;
          }
        }

        .panel-body {
          padding: 16px 0 0 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .panel-body-sroll {
          overflow-y: auto;
          max-height: 250px;
        }

        // 基础信息和客户信息的样式
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .info-label {
            color: #909399;
            font-size: 14px;
          }

          .info-value {
            font-size: 14px;
            color: #303133;
            font-weight: 500;
            min-height: 21px;

            &.text-danger {
              color: #f46a6a;
            }

            &.text-warning {
              color: #ff9800;
            }
          }
        }

        // 账单收入的样式
        .bill-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0;

          .bill-label {
            font-size: 14px;
            color: #606266;
          }

          .bill-value {
            font-size: 14px;
            font-weight: 600;

            &.text-success {
              color: #67c23a;
            }

            &.text-danger {
              color: #f46a6a;
            }
          }
        }

        // 重点关注的样式
        .alert-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #409eff;
          background-color: #f8f9fa;
          cursor: pointer;

          &.alert-red {
            border-left-color: #f46a6a;
            background-color: #fef2f2;
          }

          &.alert-yellow {
            border-left-color: #ffc107;
            background-color: #fefce8;
          }

          .alert-icon {
            flex-shrink: 0;

            i {
              font-size: 20px;
            }
          }

          &.alert-red .alert-icon i {
            color: #f46a6a;
          }

          &.alert-yellow .alert-icon i {
            color: #ffc107;
          }

          .alert-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .alert-title {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }

            .alert-subtitle {
              font-size: 12px;
              color: #909399;
            }
          }
          .day-count {
            display: flex;
            align-items: center;
          }
        }
      }
    }

    .bottom-panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-top: 16px;

      &.two-columns {
        grid-template-columns: repeat(2, 1fr);
      }

      .bottom-panel {
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        overflow: hidden;
        padding: 16px;

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 0 12px 0;
          border-bottom: 1px solid #ebeef5;

          i {
            font-size: 18px;
            color: #495057;
          }

          .panel-title {
            font-size: 15px;
            font-weight: 600;
            color: #212529;
            flex: 1;
          }
        }
        .panel-body {
          padding: 16px 0 0 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        // 办案团队样式
        .team-item {
          padding: 10px 12px;
          background-color: #f5f7fa;
          border-radius: 6px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          .team-name {
            font-size: 14px;
            color: #303133;
            font-weight: 500;
          }

          .team-role {
            font-size: 12px;
            color: #909399;
          }
        }

        // 文档统计样式
        .doc-stat-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 16px;
          .doc-stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .doc-label {
              font-size: 14px;
              color: #606266;
            }

            .doc-badge {
              display: inline-block;
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 13px;
              font-weight: 600;
              color: #ffffff;
              min-width: 24px;
              text-align: center;

              &.badge-blue {
                background-color: #409eff;
              }

              &.badge-green {
                background-color: #67c23a;
              }

              &.badge-purple {
                background-color: #9c27b0;
              }

              &.badge-orange {
                background-color: #ff9800;
              }

              &.badge-cyan {
                background-color: #17a2b8;
              }

              &.badge-red {
                background-color: #f46a6a;
              }
            }
          }
        }

        // 境外申请样式
        .overseas-item {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .overseas-label {
            font-size: 12px;
            color: #909399;
          }

          .overseas-value {
            font-size: 14px;
            color: #303133;
            font-weight: 600;
          }

          .overseas-input {
            font-size: 14px;
            color: #606266;
            padding: 8px 12px;
            background-color: #f5f7fa;
            border-radius: 4px;
            min-height: 36px;
          }
        }
      }
    }
  }
  .view-all {
    font-size: 13px;
    color: #409eff;
    cursor: pointer;
  }
  .cover-right {
    flex: 1;
    max-height: 100%;
    display: flex;
    flex-direction: column;

    .timeline-card {
      max-height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16px;

      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;

        i {
          font-size: 18px;
          color: #495057;
        }

        .panel-title {
          font-size: 15px;
          font-weight: 600;
          color: #212529;
        }
      }

      .timeline-body {
        flex: 1;
        margin-top: 16px;
        overflow-y: auto;
        max-height: calc(100vh - 150px);
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
          background-color: #f9fafc;
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: inset 0 0 0 1px #f0f2f5;

          .timeline-desc {
            font-size: 14px;
            color: #303133;
            line-height: 1.5;
          }
        }
      }
    }
  }
}
</style>
