<template>
  <div
    class="card h-100"
    ref="cardRef"
  >
    <div class="card-body h-100">
      <!-- 头部区域 -->
      <div class="concerns-header mb-2">
        <div class="header-left">
          <div class="title-section">
            <h4 class="card-title mb-0">我的关注</h4>
            <el-popover
              placement="bottom-start"
              title="我的关注"
              :width="350"
              trigger="hover"
              content="查看并管理关注案件"
              ref="descPopoverRef"
            >
              <template #reference>
                <i
                  class="bx bx-help-circle"
                  style="font-size: 16px; cursor: pointer"
                ></i>
              </template>
            </el-popover>
          </div>
        </div>
        <div class="header-right">
          <el-popover
            placement="bottom"
            :width="320"
            trigger="click"
            ref="addPopover"
          >
            <template #reference>
              <el-button :icon="Plus" size='small'>添加关注</el-button>
            </template>
            <div class="case-list">
              <div class="case-search">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索案件名称或编号..."
                  clearable
                  @keyup.enter="fuzzySearch"
                  class="top-search"
                  size="small"
                >
                  <template #prepend>
                    <el-button @click="fuzzySearch">
                      <i class="bx bx-search-alt"></i>
                    </el-button>
                  </template>
                </el-input>
              </div>
              <div class="case-scroll">
                <div
                  v-if="popoverLoading"
                  class="loading-inline"
                >
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
                <template v-else>
                  <div
                    class="case-row"
                    v-for="(item, i) in popoverCases"
                    :key="i"
                    @click="toggleCaseSidebar(item)"
                  >
                    <div class="left">
                      <div class="agentNum">{{ item.agentNum }}</div>
                      <div class="name">{{ item.caseName }}</div>
                    </div>
                    <div class="right">
                      <span
                        class="status-badge"
                        :class="{
                          processing: item.caseStatusName === '进行中',
                          closed: item.caseStatusName !== '进行中',
                        }"
                      >
                        {{ item.caseStatusName }}
                      </span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </el-popover>

          <el-tooltip
            content="刷新"
            placement="top"
          >
            <div
              class="refresh-icon"
              @click="handleRefresh"
            >
              <el-icon :size="16"><Refresh /></el-icon>
            </div>
          </el-tooltip>
        </div>
      </div>

      <!-- 标签页区域 -->
      <div class="tabs-container">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
        >
          <i
            class="mdi mdi-eye"
            style="font-size: 16px"
          ></i>
          全部关注 ({{ allCasesCount }})
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'important' }"
          @click="switchTab('important')"
        >
          <i
            class="mdi mdi-star-outline"
            style="font-size: 16px"
          ></i>
          重点案件 ({{ importantCasesCount }})
        </div>
      </div>

      <!-- 案件列表区域 -->
      <div
        class="cases-list"
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="currentBusy || !currentHasMore"
        :infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
        ref="caseListRef"
      >
        <div
          v-if="currentCases.length === 0 && !loading"
          class="empty-state"
        >
          <el-empty
            description="暂无数据"
            :image-size="100"
          />
        </div>
        <div
          v-for="(caseItem, index) in currentCases"
          :key="caseItem.id || index"
          class="case-item"
          @click="toggleCaseSidebar(caseItem)"
        >
          <div class="case-left">
            <span class="case-agentNum">{{ caseItem.agentNum }}</span>
            <i
              v-if="caseItem.caseLevel === 2"
              class="mdi mdi-star"
              style="color: #e6b313; margin-right: 6px; font-size: 16px"
            ></i>
            <el-tooltip
              :content="caseItem.caseName"
              placement="top"
            >
              <span class="case-name">{{ caseItem.caseName }}</span>
            </el-tooltip>
          </div>
          <div class="case-right">
            <div class="progress-info" v-if="caseItem.progressName">
              <i
                class="mdi mdi-file-document-outline"
                style="margin-right: 4px"
              ></i>
              <span class="progress-text">{{ caseItem.progressName }}</span>
            </div>
            <div
              class="status-badge"
              :class="{
                processing: caseItem.statusName === '进行中',
                closed: caseItem.statusName !== '进行中',
              }"
              v-if="caseItem.statusName"
            >
              {{ caseItem.statusName }}
            </div>
            <div class="date-info" v-if="caseItem.progressLastTime">
              <i
                class="mdi mdi-calendar-month-outline"
                style="margin-right: 4px"
              ></i>
              <span class="date">{{
                caseItem.progressLastTime
              }}</span>
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="取消关注"
              placement="top"
              v-if="activeTab === 'all'"
            >
              <i
                class="mdi mdi-eye-off-outline icon-unfollow"
                @click.stop="unfollowHandle(caseItem)"
              ></i>
            </el-tooltip>
          </div>
        </div>
        <div
          v-if="loading"
          class="loading-state"
        >
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          <span>加载中...</span>
        </div>
        <div
          v-if="!currentHasMore && currentCases.length > 0"
          class="no-more"
        >
          没有更多数据了
        </div>
      </div>
    </div>
  </div>
  <CaseSidebar
    v-if="showCaseDetail"
    :showSidebar="showCaseDetail"
    @update:showSidebar="handleSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { Plus, Refresh, Loading } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  queryFollowCasesByUserId,
  queryImportantCasesByUserId,
  settingsSubscribe,
} from "@/api/dashboard";
import { getAllCaseInfo } from "@/api/caseList";

// 响应式数据
const activeTab = ref("all");
const caseListRef = ref();
const allCases = ref([]);
const importantCases = ref([]);
const addPopover = ref();

// 分页参数
const pageSize = ref(10);
const allCasesTotal = ref(0);
const importantCasesTotal = ref(0);

// 分页状态 - 全部关注
const allCasesPageNo = ref(1);
const allCasesHasMore = ref(true);
const allCasesBusy = ref(false);

// 分页状态 - 重点案件
const importantCasesPageNo = ref(1);
const importantCasesHasMore = ref(true);
const importantCasesBusy = ref(false);

// 加载状态
const loading = ref(false);

//点击的案件信息
const caseId = ref();
const taskType = ref();
const showCaseDetail = ref(false);

// 弹层-搜索与数据（示例）
const searchKeyword = ref("");
const popoverCases = ref([]);
const popoverLoading = ref(false);
// const filteredCases = computed(() => {
//   const kw = searchKeyword.value.trim().toLowerCase();
//   if (!kw) return popoverCases.value;
//   return popoverCases.value.filter(
//     (c) =>
//       c.agentNum.toLowerCase().includes(kw) ||
//       c.caseName.toLowerCase().includes(kw)
//   );
// });

//获取添加关注列表的案件默认最近关注的50条
const fetchPopoverCases = () => {
  popoverLoading.value = true;
  const params = {
    pageNo: 1,
    pageSize: 50,
    keyWord: searchKeyword.value,
    caseStatusId: searchKeyword.value ? undefined : 100,
  };
  getAllCaseInfo(params)
    .then((res) => {
      popoverCases.value = res?.data || [];
    })
    .catch(() => {
      popoverCases.value = [];
    })
    .finally(() => {
      popoverLoading.value = false;
    });
};

//打开案件详情
const toggleCaseSidebar = (values) => {
  caseId.value = values.caseId;
  taskType.value = values.taskType;
  if (addPopover.value) {
    addPopover.value?.hide();
  }
  showCaseDetail.value = true;
};

const handleSidebarUpdate = (value) => {
  showCaseDetail.value = value;
};

// 计算属性
const currentCases = computed(() => {
  if (activeTab.value === "important") {
    return importantCases.value;
  }
  return allCases.value;
});

const allCasesCount = computed(() => allCasesTotal.value);
const importantCasesCount = computed(() => importantCasesTotal.value);

const currentBusy = computed(() => {
  return activeTab.value === "all"
    ? allCasesBusy.value
    : importantCasesBusy.value;
});

const currentHasMore = computed(() => {
  return activeTab.value === "all"
    ? allCasesHasMore.value
    : importantCasesHasMore.value;
});

// 方法
const switchTab = (tab) => {
  if (activeTab.value !== tab) {
    activeTab.value = tab;
    nextTick(() => {
      if (caseListRef.value) {
        caseListRef.value.scrollTop = 0;
      }
    });
  }
};

watch(activeTab, (newVal) => {
  if (newVal === "all") {
    if (allCases.value.length === 0) {
      fetchAllCases(true);
    }
  } else {
    if (importantCases.value.length === 0) {
      fetchImportantCases(true);
    }
  }
});

// 取消关注
const unfollowHandle = (caseItem) => {
  ElMessageBox.confirm("是否取消该案件的关注", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      settingsSubscribe({
        objInstId: caseItem.caseId,
        objType: 1,
        subscribe: 0,
      }).then((res) => {
        if (res.success) {
          ElMessage.success("操作成功");
          fetchAllCases(true);
        }
      });
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 获取所有关注案件列表
const fetchAllCases = (isReset = false) => {
  // isReset时只检查各自的busy状态，不检查全局loading，允许并行加载
  // 非isReset时检查全局loading和各自的busy状态
  if (isReset) {
    if (allCasesBusy.value) return;
  } else {
    if (loading.value || allCasesBusy.value) return;
  }

  if (isReset) {
    allCasesPageNo.value = 1;
    allCases.value = [];
    allCasesHasMore.value = true;
  }

  if (!allCasesHasMore.value && !isReset) return;

  loading.value = true;
  allCasesBusy.value = true;

  queryFollowCasesByUserId({
    pageNo: allCasesPageNo.value,
    pageSize: pageSize.value,
  })
    .then((res) => {
      if (res && res.success && res.data) {
        const list = res.data;
        const total = res.total;
        if (isReset) {
          allCases.value = list;
        } else {
          allCases.value.push(...list);
        }

        allCasesTotal.value = total;

        // 判断是否还有更多数据
        allCasesHasMore.value =
          allCases.value.length < total && list.length === pageSize.value;

        if (allCasesHasMore.value) {
          allCasesPageNo.value++;
        }
      } else {
        allCasesHasMore.value = false;
      }
    })
    .catch((error) => {
      console.error("获取全部关注案件失败:", error);
      ElMessage.error("获取数据失败，请稍后重试");
      allCasesHasMore.value = false;
    })
    .finally(() => {
      loading.value = false;
      allCasesBusy.value = false;
    });
};

// 获取重点案件列表
const fetchImportantCases = (isReset = false) => {
  // isReset时只检查各自的busy状态，不检查全局loading，允许并行加载
  // 非isReset时检查全局loading和各自的busy状态
  if (isReset) {
    if (importantCasesBusy.value) return;
  } else {
    if (loading.value || importantCasesBusy.value) return;
  }

  if (isReset) {
    importantCasesPageNo.value = 1;
    importantCases.value = [];
    importantCasesHasMore.value = true;
  }

  if (!importantCasesHasMore.value && !isReset) return;

  loading.value = true;
  importantCasesBusy.value = true;

  queryImportantCasesByUserId({
    pageNo: importantCasesPageNo.value,
    pageSize: pageSize.value,
  })
    .then((res) => {
      if (res && res.success && res.data) {
        const list = res.data || [];
        const total = res.total || 0;

        if (isReset) {
          importantCases.value = list;
        } else {
          importantCases.value.push(...list);
        }

        importantCasesTotal.value = total;

        // 判断是否还有更多数据
        importantCasesHasMore.value =
          importantCases.value.length < total && list.length === pageSize.value;

        if (importantCasesHasMore.value) {
          importantCasesPageNo.value++;
        }
      } else {
        importantCasesHasMore.value = false;
      }
    })
    .catch((error) => {
      console.error("获取重点案件失败:", error);
      ElMessage.error("获取数据失败，请稍后重试");
      importantCasesHasMore.value = false;
    })
    .finally(() => {
      loading.value = false;
      importantCasesBusy.value = false;
    });
};

// 滚动加载更多
const loadMore = () => {
  if (activeTab.value === "all") {
    fetchAllCases(false);
  } else {
    fetchImportantCases(false);
  }
};

// 刷新数据
const handleRefresh = () => {
  fetchAllCases(true);
  fetchImportantCases(true);
};

// 搜索功能
const fuzzySearch = () => {
  fetchPopoverCases();
};

onMounted(() => {
  fetchAllCases(true);
  fetchImportantCases(true);
  fetchPopoverCases();
});
</script>

<style lang="scss" scoped>
.concerns-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  .header-left {
    height: 32px;
    .title-section {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      gap: 6px;
      height: 100%;

      .icon-eye {
        font-size: 18px;
        margin-right: 8px;
        color: #2c3e50;
      }

      .main-title {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.tabs-container {
  background: #f0f2f5;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
  display: flex;
  position: relative;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    color: #2c3e50;
    position: relative;
    z-index: 1;

    i {
      margin-right: 6px;
      font-size: 14px;
    }

    &.active {
      background: white;
      color: #2c3e50;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
      color: #495057;
    }
  }
}

.cases-list {
  height: calc(100% - 108px);
  overflow-y: auto;
  overflow-x: hidden; // avoid horizontal scrollbar when inner content is long

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    gap: 8px;
    color: #909399;
    font-size: 14px;

    .el-icon {
      font-size: 18px;
    }
  }

  .no-more {
    text-align: center;
    padding: 10px;
    color: #909399;
    font-size: 12px;
  }

  .case-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 8px;
    background: white;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box; // ensure padding/border do not exceed container width

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: #dee2e6;
    }

    .case-left {
      display: flex;
      align-items: center;
      min-width: 0; // allow flex children to shrink to avoid overflow

      .case-agentNum {
        font-size: 14px;
        font-weight: 500;
        color: #2c3e50;
        margin-right: 6px;
      }

      .case-name {
        font-size: 12px;
        color: #495057;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }
    }

    .case-right {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0; // prevent pushing container to overflow

      .progress-info {
        display: flex;
        align-items: center;
        .progress-text {
          font-size: 12px;
          color: #495057;
          min-width: 40px;
        }
      }
      .date-info {
        display: flex;
        align-items: center;

        .date {
          font-size: 12px;
          color: #6c757d;
          white-space: nowrap;
        }
      }
      .icon-unfollow {
        font-size: 16px;
        cursor: pointer;
        &:hover {
          color: #da4846;
        }
      }
    }
  }
}
.status-badge {
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  &.processing {
    background: #28a745;
  }
  &.closed {
    background: #909399;
  }
}
.refresh-icon {
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #f5f7fa;
  }
}
.case-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  .case-search {
    padding: 8px 8px 8px 8px;
  }
  .case-scroll {
    position: relative;
    height: 220px;
    max-height: 200px;
    overflow: auto;
    padding: 0 4px;
    .loading-inline {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #909399;
      font-size: 12px;
    }
  }
  .case-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    transition: background 0.2s ease;
    cursor: pointer;
    gap: 8px;
    &:hover {
      background: #f5f7fa;
    }
    .left {
      .agentNum {
        font-weight: 600;
        font-size: 13px;
        color: #2c3e50;
      }
      .name {
        font-size: 12px;
        color: #6c757d;
        margin-top: 2px;
      }
    }
    // .right {
    //   .status {
    //     display: inline-block;
    //     min-width: 56px;
    //     text-align: center;
    //     padding: 2px 10px;
    //     border-radius: 12px;
    //     font-size: 12px;
    //     &.processing {
    //       background: #e8faf0;
    //       color: #2fb26a;
    //     }
    //     &.pending {
    //       background: #fff5e6;
    //       color: #c98a00;
    //     }
    //   }
    // }
  }
}
</style>
