<template>
  <div class="cover-container">
    <div class="cover-top">
      <div class="summary-cards">
        <!-- 进行中案件 - 蓝色 -->
        <div class="summary-card card-blue">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-file"></i>
              </div>
              <div class="card-value">{{ coverData.inProgressCaseCount }}</div>
            </div>
            <div class="card-title">进行中案件</div>
            <div class="card-subtitle">
              总案件：{{ coverData.sumCaseCount }}
            </div>
          </div>
        </div>
        <!-- 总账单收入 - 绿色 -->
        <div class="summary-card card-green">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-dollar-circle"></i>
              </div>
              <div class="card-value">
                <span v-if="coverData.billSum">￥</span>
                {{ formatNumber(coverData.billSum) }}
              </div>
            </div>
            <div class="card-title">总账单收入</div>
            <div class="card-subtitle">
              账单：{{ coverData.billSumCount }}笔
            </div>
          </div>
        </div>
        <!-- 文档资料 - 橙色 -->
        <div class="summary-card card-orange">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-briefcase-alt-2"></i>
              </div>
              <div class="card-value">{{ coverData.projectRunCount }}</div>
            </div>
            <div class="card-title">进行中项目</div>
            <div class="card-subtitle">
              总项目：{{ coverData.projectSumCount }}
            </div>
          </div>
        </div>
        <!-- 关联客户 - 天蓝 -->
        <div class="summary-card card-skyblue">
          <div class="card-content">
            <div class="card-into-top">
              <div class="card-icon">
                <i class="bx bx-buildings"></i>
              </div>
              <div class="card-value">{{ coverData.parentCustIdCount }}</div>
            </div>
            <div class="card-title">关联客户</div>
            <div class="card-subtitle">基于父单位字段统计</div>
          </div>
        </div>
      </div>
    </div>
    <div class="cover-content">
      <div class="info-panel card mb-0">
        <div class="panel-header">
          <i
            class="bx bx-buildings title-icon"
            style="color: #155dfc"
          ></i>
          <span class="panel-title">{{ coverData.fullname }}</span>
        </div>
        <div class="panel-body">
          <div class="panel-item">
            <span class="panel-item-title">客户等级</span>
            <span class="panel-item-value">
              <el-tag
                type="danger"
                effect="dark"
                round
                v-if="coverData.custGradeStr"
              >
                {{ coverData.custGradeStr }}
              </el-tag></span
            >
          </div>
          <div class="panel-item">
            <span class="panel-item-title">客户信用等级</span>
            <span class="panel-item-value"
              ><el-tag
                :type="
                  coverData.level === 'VIP' || coverData.level === 'A'
                    ? 'success'
                    : 'info'
                "
                effect="dark"
                round
                v-if="coverData.level"
              >
                {{ coverData.level }}
              </el-tag></span
            >
          </div>
          <div class="panel-item">
            <span class="panel-item-title">合作年限</span>
            <span class="panel-item-value">{{
              coverData.cooperationYear
            }}</span>
          </div>
          <div class="panel-item">
            <span class="panel-item-title">国籍</span>
            <span class="panel-item-value">{{ coverData.country }}</span>
          </div>
          <div class="panel-item">
            <span class="panel-item-title">行业类别</span>
            <span class="panel-item-value">{{ coverData.industryStr }}</span>
          </div>
          <div class="panel-item">
            <span class="panel-item-title">首次来案日期</span>
            <span class="panel-item-value">{{ coverData.firstcaseDate }}</span>
          </div>
        </div>
      </div>
      <div class="info-panel card mb-0">
        <div class="panel-header">
          <i
            class="bx bx-file title-icon"
            style="color: #155dfc"
          ></i>
          <span class="panel-title">案件与账单</span>
        </div>
        <div class="stats-container">
          <!-- 案件统计 -->
          <div class="section-title">案件统计</div>
          <div class="stats-grid">
            <div class="stat-item stat-blue">
              <div class="value">{{ coverData.sumCaseCount }}</div>
              <div class="label">总案件</div>
            </div>
            <div class="stat-item stat-green">
              <div class="value">{{ coverData.caseClosedCount }}</div>
              <div class="label">已完成</div>
            </div>
            <div class="stat-item stat-orange">
              <div class="value">{{ coverData.inProgressCaseCount }}</div>
              <div class="label">进行中</div>
            </div>
          </div>

          <!-- 账单统计 -->
          <div class="section-title">账单统计</div>
          <div class="stats-grid">
            <div class="stat-item stat-purple">
              <div class="value">
                <span v-if="coverData.billSum">￥</span
                >{{ formatNumber(coverData.billSum) }}
              </div>
              <div class="label">总账单收入</div>
            </div>
            <div class="stat-item stat-red">
              <div class="value">{{ coverData.overdueBillCount }}笔</div>
              <div class="label">坏账</div>
            </div>
            <div class="stat-item stat-blue">
              <div class="value">
                <span v-if="coverData.billSum">￥</span
                >{{ formatNumber(coverData.yearBillSum) }}
              </div>
              <div class="label">本年账单</div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-panel card mb-0">
        <div class="panel-header">
          <i
            class="bx bx-error"
            style="color: #f46a6a"
          ></i>
          <span class="panel-title">重点关注</span>
        </div>
        <div class="panel-body">
          <div
            class="alert-item alert-red"
            v-if="coverData.overdueBillCount"
          >
            <div class="alert-icon">
              <i class="bx bx-dollar-circle"></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">
                {{ coverData.overdueBillCount }}笔账单逾期
              </div>
              <div class="alert-subtitle">需及时跟进催收</div>
            </div>
          </div>
          <div
            class="alert-item alert-blue"
            v-if="coverData.projectRunCount"
          >
            <div class="alert-icon">
              <i class="bx bx-briefcase-alt-2"></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">
                {{ coverData.projectRunCount }}个项目进行中
              </div>
              <div class="alert-subtitle">关注项目交付进度</div>
            </div>
          </div>
          <div
            class="alert-item alert-yellow"
            v-if="coverData.inProgressCaseCount"
          >
            <div class="alert-icon">
              <i class="bx bx-file"></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">
                {{ coverData.inProgressCaseCount }}个案件进行中
              </div>
              <div class="alert-subtitle">关注案件处理进度</div>
            </div>
          </div>
          <el-empty
            description="暂无数据"
            v-if="
              !coverData.overdueBillCount &&
              !coverData.projectRunCount &&
              !coverData.inProgressCaseCount
            "
            :image-size="80"
          />
        </div>
      </div>
    </div>
    <div class="cover-content">
      <div class="info-panel card mb-0">
        <div class="panel-header">
          <i
            class="icon iconfont icon-users"
            style="color: #155dfc"
          ></i>
          <span class="panel-title">我方负责团队</span>
        </div>
        <div class="panel-body">
          <div class="team-item">
            <div class="team-name">{{ coverData.custResponsible || "无" }}</div>
            <div class="team-role">客户负责人</div>
          </div>
          <div class="team-item">
            <div class="team-name">
              {{ coverData.custCoordination || "无" }}
            </div>
            <div class="team-role">客户协调人</div>
          </div>
          <div class="team-item">
            <div class="team-name">{{ coverData.custIntroductor || "无" }}</div>
            <div class="team-role">客户开发人</div>
          </div>
          <div
            class="stats-grid"
            style="margin-bottom: 0"
          >
            <div class="stat-item stat-green">
              <div class="value">{{ coverData.custResponsibleCount }}</div>
              <div class="label">负责人</div>
            </div>
            <div class="stat-item stat-blue">
              <div class="value">{{ coverData.custWorkCount }}</div>
              <div class="label">工作组</div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-panel card mb-0">
        <div class="panel-header">
          <i
            class="bx bx-phone"
            style="color: #009966"
          ></i>
          <span class="panel-title"><span>客户联系人</span> </span>
          <span
            class="view-all"
            @click="changeComponent('Contacts')"
          >
            查看全部
          </span>
        </div>
        <div class="panel-body">
          <div
            class="stats-grid"
            style="padding-bottom: 12px; border-bottom: 1px solid #ebeef5"
          >
            <div class="stat-item stat-green">
              <div class="value">{{ coverData.customerContactSumCount }}</div>
              <div class="label">总联系人</div>
            </div>
            <div class="stat-item stat-blue">
              <div class="value">
                {{ coverData.customerContactEmployedCount }}
              </div>
              <div class="label">在职</div>
            </div>
          </div>
          <div class="panel-item">
            <span class="panel-item-title">离职联系人</span>
            <span class="panel-item-value">{{
              coverData.customerContactResignCount
            }}</span>
          </div>
          <div class="panel-item">
            <span class="panel-item-title">本月新增</span>
            <span class="panel-item-value">{{
              coverData.customerContactNewCount
            }}</span>
          </div>
          <div class="panel-item">
            <span class="panel-item-title">主要合作人</span>
            <span class="panel-item-value">{{
              coverData.customerContactIsmainCount
            }}</span>
          </div>
        </div>
      </div>
      <div class="info-panel card mb-0">
        <div class="panel-header">
          <i
            class="bx bx-briefcase-alt-2"
            style="color: #e17100"
          ></i>
          <span class="panel-title">项目进度统计</span>
        </div>
        <div class="panel-body">
          <div class="panel-item">
            <span class="panel-item-title">总项目数</span>
            <span
              class="panel-item-value"
              style="font-size: 18px"
              >{{ coverData.projectSumCount }}</span
            >
          </div>
          <div class="paoject-progress">
            <div
              class="panel-item"
              style="margin-bottom: 6px"
            >
              <span class="panel-item-title">进行中</span>
              <span
                class="panel-item-value"
                style="color: #556ee6"
                >{{ coverData.projectRunCount }}</span
              >
            </div>
            <el-progress
              :percentage="
                coverData.projectSumCount
                  ? (coverData.projectRunCount / coverData.projectSumCount) *
                    100
                  : 0
              "
              :stroke-width="10"
              :show-text="false"
            />
          </div>
          <div class="paoject-progress">
            <div
              class="panel-item"
              style="margin-bottom: 6px"
            >
              <span class="panel-item-title">已完成</span>
              <span
                class="panel-item-value"
                style="color: #67c23a"
                >{{ coverData.projectCompletedCount }}</span
              >
            </div>
            <el-progress
              :percentage="
                coverData.projectSumCount
                  ? (coverData.projectCompletedCount /
                      coverData.projectSumCount) *
                    100
                  : 0
              "
              :stroke-width="10"
              :show-text="false"
              status="success"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, defineProps, onMounted, defineEmits } from "vue";
import { queryCustCoverPage } from "@/api/customerList";
const emit = defineEmits(["change-component"]);

const props = defineProps({
  custId: {
    type: Number,
    required: true,
  },
});
const coverData = ref({});
const fetchCoverData = () => {
  queryCustCoverPage({ custId: props.custId }).then((res) => {
    coverData.value = res.data || {};
  });
};
const changeComponent = (type) => {
  emit("change-component", type);
};
watch(
  () => props.custId,
  () => {
    fetchCoverData();
  }
);
onMounted(() => {
  fetchCoverData();
});
//数字格式化
const formatNumber = (num) => {
  if (num == null || isNaN(num)) return "0";

  const absNum = Math.abs(num);

  // 单位（注意：去掉十万，百万才开始显示单位）
  const units = [
    { value: 1e8, symbol: "亿" },
    { value: 1e7, symbol: "千万" },
    { value: 1e6, symbol: "百万" },
  ];

  // 1. 超过百万 → 按单位显示
  for (const u of units) {
    if (absNum >= u.value) {
      const formatted = (num / u.value).toFixed(2);
      // 如果小数部分为"00"，则只显示整数部分
      if (formatted.endsWith(".00")) {
        return `${parseInt(formatted)}${u.symbol}`;
      }
      return `${formatted}${u.symbol}`;
    }
  }

  // 2. 小于百万 → 千分位显示
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // 如果小数部分为"00"，则只显示整数部分
  if (formatted.endsWith(".00")) {
    return formatted.substring(0, formatted.length - 3);
  }

  return formatted;
};
</script>
<style lang="scss" scoped>
.cover-container {
  width: 100%;
  height: 100%;
  .cover-top {
    width: 100%;
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
          font-size: 26px;
          font-weight: bold;
          color: #ffffff;
          line-height: 1;
        }

        .card-title {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
        }

        .card-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
        }

        &.card-blue {
          background: linear-gradient(135deg, #51a2ff 0%, #2b7fff 100%);
        }

        &.card-green {
          background: linear-gradient(135deg, #05df72 0%, #00c951 100%);
        }

        &.card-orange {
          background: linear-gradient(135deg, #ffb900 0%, #fe9a00 100%);
        }

        &.card-skyblue {
          background: linear-gradient(135deg, #00d3f3 0%, #00b8db 100%);
        }
      }
    }
  }
  .cover-content {
    display: flex;
    width: 100%;
    margin-top: 16px;
    gap: 16px;
    .info-panel {
      flex: 1;
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
          font-size: 20px;
          color: #495057;
        }
        .title-icon {
          font-size: 20px;
        }
        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          flex: 1;
          // word-break: break-all
        }
        .view-all {
          font-size: 13px;
          color: #409eff;
          cursor: pointer;
        }
      }

      .panel-body {
        padding: 16px 0 0 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        .panel-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .panel-item-title {
            font-size: 14px;
            color: #6c757d;
          }
          .panel-item-value {
            font-size: 14px;
            color: #1d293d;
            font-weight: bold;
          }
        }
      }
    }
  }
  .stats-container {
    width: 100%;
    font-family: "PingFang SC", Arial, sans-serif;
    color: #333;

    .section-title {
      margin: 16px 0 8px;
      font-size: 14px;
      font-weight: 600;
    }
  }
  .stats-grid {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    .stat-item {
      flex: 1;
      padding: 8px 6px;
      margin-right: 8px;
      text-align: center;
      border-radius: 6px;
      background: #f8f8f8;

      &:last-child {
        margin-right: 0;
      }

      .value {
        font-size: 16px;
        font-weight: 700;
      }

      .label {
        font-size: 12px;
        margin-top: 2px;
        color: #6c757d;
      }
    }

    /* 颜色主题 */
    .stat-blue {
      background-color: #eff6ff;
      .value {
        color: #3d7fff;
      }
    }
    .stat-green {
      background-color: #f0fdf4;
      .value {
        color: #27c36a;
      }
    }
    .stat-orange {
      background-color: #fffbeb;
      .value {
        color: #f8a120;
      }
    }

    .stat-purple {
      background-color: #faf5ff;
      .value {
        color: #8c4bff;
      }
    }
    .stat-red {
      background-color: #fff7ed;
      .value {
        color: #ff6b6b;
      }
    }
  }
  // 重点关注的样式
  .alert-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid;
    background-color: #f8f9fa;

    &.alert-red {
      border-left-color: #f46a6a;
      background-color: #fef2f2;
    }

    &.alert-yellow {
      border-left-color: #ffc107;
      background-color: #fefce8;
    }
    &.alert-blue {
      border-left-color: #2b7fff;
      background-color: #eff6ff;
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
    &.alert-blue .alert-icon i {
      color: #2b7fff;
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
  }
  // 负责团队样式
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
}
</style>
