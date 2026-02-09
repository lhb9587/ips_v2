<template>
  <div class="card h-100" ref="cardRef">
    <div class="card-body">
      <div
        class="case-header mb-2 d-flex align-items-center justify-content-between"
      >
        <div class="d-flex gap-2">
          <h4 class="card-title mb-0">重点案件信息</h4>
          <el-button
            size="small"
            :type="activeTab === '全部' ? 'primary' : 'default'"
            @click="activeTab = '全部'"
            class="filter-btn"
            >全部</el-button
          >
          <el-button
            size="small"
            :type="activeTab === '今日' ? 'primary' : 'default'"
            @click="activeTab = '今日'"
            class="filter-btn"
            >今日</el-button
          >
          <el-button
            size="small"
            :type="activeTab === '未读' ? 'primary' : 'default'"
            @click="activeTab = '未读'"
            class="filter-btn"
          >
            <span>未读</span>
            <span
              v-if="unreadCount > 0"
              class="unread-count"
              >{{ unreadCount }}</span
            ></el-button
          >
        </div>
        <el-input
          v-if="showSearch"
          v-model="searchText"
          placeholder="搜索案件..."
          clearable
          style="width: 240px"
          class="top-search"
          @input="debounceSearch"
        >
          <template #prepend>
            <el-button @click="getCaseNoticeList">
              <i class="bx bx-search-alt"></i>
            </el-button>
          </template>
        </el-input>
      </div>

      <div
        class="case-list"
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="busy"
        :infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
        ref="caseListRef"
      >
        <LoadingOverlay :loading="loading" />
        <div
          v-for="(item, idx) in caseList"
          :key="idx"
          @click="openCaseDetail(item)"
          class="case-item d-flex align-items-start"
        >
          <div class="case-main flex-grow-1">
            <div class="case-title-bar d-flex align-items-center">
              <div
                class="case-title"
                :title="item.caseName"
              >
                {{ item.caseName }}
              </div>
              <div
                v-if="!item.read"
                class="unread-dot"
              ></div>
              <el-tag
                size="small"
                type="info"
                class="case-tag"
                v-if="item.judgeRank"
                >{{ item.judgeRank }}</el-tag
              >
              <el-tag
                size="small"
                class="case-tag"
                type="info"
                v-if="item.typeStr"
                >{{ item.typeStr }}</el-tag
              >
            </div>
            <div class="case-desc">
              <span v-html="highlightJudgment(item.mainText)"></span>
            </div>
          </div>
          <div class="case-meta d-flex flex-column align-items-end">
            <span class="case-time">{{ item.createTime }}</span>
            <el-button
              type="text"
              size="small"
              class="case-view-btn"
            >
              <div class="d-flex gap-1">
                <span class="fas fa-eye"></span><span>查看</span>
              </div></el-button
            >
          </div>
        </div>
        <el-empty
          description="暂无数据"
          v-if="caseList.length === 0"
          :image-size="90"
          style="padding-top: 80px"
        ></el-empty>
      </div>
    </div>
  </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
  <CaseEventModal
    v-model="caseModelValue"
    :caseDetail="caseDetail"
  />
  <el-dialog
    v-model="showSubscribeDialog"
    title="提示"
    width="400px"
    :close-on-click-modal="false"
    :show-close="true"
    append-to-body
    align-center
  >
    <div
      style="display: flex; align-items: center; gap: 12px; min-height: 24px"
    >
      <span
        class="bx bxs-info-circle"
        style="font-size: 24px; color: #e6a23c"
      ></span>
      <span>{{ subscribeDialogMsg }}</span>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 12px">
      <el-button @click="showSubscribeDialog = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleViewCase"
        >查看案件</el-button
      >
      <el-button
        type="primary"
        @click="handleSubscribe"
        >确定</el-button
      >
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import {
  queryCaseNotice,
  queryNoticeImpl,
  settingsNoticeRead,
  settingsSubscribe,
} from "@/api/dashboard";
import { debounce } from "lodash";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import CaseEventModal from "@/components/widgets/senior/caseevent-modal.vue";
import { ElMessage } from "element-plus";
import LoadingOverlay from "@/components/common/loading";

const activeTab = ref("全部");
const searchText = ref("");
const isCaseDetail = ref(false);
const caseId = ref("");
const taskType = ref("");
const caseModelValue = ref(false);
const loading = ref(false);

const caseList = ref([]);
const caseListRef = ref(null);
const noticeId = ref("");
const cardRef = ref(null);
const showSearch = ref(true);
let cardResizeObserver = null;

const caseSidebarUpdate = (val) => {
  //关闭侧边栏，打开重要案件和订阅弹窗
  if (!val) {
    caseModelValue.value = true;
    queryNoticeImpl({ noticeId: noticeId.value }).then((res) => {
      caseDetail.value = res.data;
      if (res.data.newCase) {
        subscribeDialogMsg.value = `是否订阅二审案件${
          res.data.newCase.agentNum || ""
        }案件消息`;
        showSubscribeDialog.value = true;
      }
    });
    isCaseDetail.value = val;
    caseId.value = "";
    taskType.value = "";
  }
};

const unreadCount = ref(0);
const caseDetail = ref({});
const showSubscribeDialog = ref(false);
const subscribeDialogMsg = ref("");

const handleSubscribe = () => {
  settingsSubscribe({
    objInstId: caseDetail.value.newCase.caseId,
    objType: 1,
    subscribe: 1,
  }).then((res) => {
    if (res.success) {
      ElMessage.success("订阅成功");
      showSubscribeDialog.value = false;
    }
  });
};
const handleViewCase = () => {
  // 跳转到案件详情页或打开侧边栏
  caseId.value = caseDetail.value.newCase.caseId;
  taskType.value = caseDetail.value.newCase.taskType;
  showSubscribeDialog.value = false;
  caseModelValue.value = false;
  isCaseDetail.value = true;
};

const openCaseDetail = (item) => {
  caseModelValue.value = true;
  noticeId.value = item.noticeId;
  queryNoticeImpl({ noticeId: item.noticeId }).then((res) => {
    caseDetail.value = res.data;
    if (res.data.newCase) {
      subscribeDialogMsg.value = `是否订阅二审案件${
        res.data.newCase.agentNum || ""
      }案件消息`;
      showSubscribeDialog.value = true;
    }
  });
  setRead(item);
};

const setRead = (item) => {
  if (item.read) return;
  settingsNoticeRead({
    noticeIdList: [item.noticeId],
  }).then((res) => {
    if (res.success) {
      //找到当前item，并设置read为1
      const index = caseList.value.findIndex(
        (i) => i.noticeId === item.noticeId
      );
      if (index !== -1) {
        caseList.value[index].read = 1;
      }
      unreadCount.value--;
    }
  });
};

watch(activeTab, () => {
  pageNo.value = 1;
  getCaseNoticeList();
});

const getCaseNoticeList = () => {
  loading.value = true;
  const params = {
    belongToTab: activeTab.value,
    keyword: searchText.value,
    pageNo: 1,
    pageSize: 10,
  };
  queryCaseNotice(params)
    .then((res) => {
      caseList.value = res.data.data || [];
      // 重置滚动条位置
      nextTick(() => {
        if (caseListRef.value) {
          caseListRef.value.scrollTop = 0;
        }
      });
      unreadCount.value = res.data.notReadNum || 0;
      if (res.total == caseList.value.length) {
        busy.value = true;
      } else {
        busy.value = false;
      }
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};
const busy = ref(false);
const pageNo = ref(1);
const loadMore = () => {
  busy.value = true;
  pageNo.value++;
  const params = {
    belongToTab: activeTab.value,
    keyword: searchText.value,
    pageNo: pageNo.value,
    pageSize: 10,
  };
  queryCaseNotice(params).then((res) => {
    caseList.value = caseList.value.concat(res.data.data || []);
    console.log(caseList.value.length, res.total, "案件数量！！！");

    if (res.total == caseList.value.length) {
      busy.value = true;
    } else {
      busy.value = false;
    }
  });
};

const debounceSearch = debounce(getCaseNoticeList, 500);
onMounted(() => {
  // 获取通知列表
  getCaseNoticeList();
  nextTick(() => {
    if (cardRef.value && window.ResizeObserver) {
      cardResizeObserver = new ResizeObserver(() => {
        showSearch.value = cardRef.value.offsetWidth >= 440;
      });
      cardResizeObserver.observe(cardRef.value);
      showSearch.value = cardRef.value.offsetWidth >= 440;
    }
  });
});
onBeforeUnmount(() => {
  if (cardResizeObserver && cardRef.value) {
    cardResizeObserver.disconnect();
  }
});

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
.title {
  font-size: 18px;
  font-weight: 600;
}
.filter-bar {
  gap: 8px;
}
.case-search {
  width: 180px;
}
.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.case-header {
  flex-shrink: 0;
}
.case-list {
  flex: 1 1 0%;
  height: calc(100% - 80px);
  overflow-y: auto;
}
.case-item {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 12px 8px 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f9fafb;
  }
}
.case-main {
  width: calc(100% - 90px);
}
.case-title-bar {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  .case-title {
    margin-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 150px);
    display: inline-block;
    vertical-align: bottom;
  }
  .case-tag {
    margin-left: 8px;
    flex-shrink: 0;
  }
}
.case-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}
.case-meta {
  min-width: 80px;
  height: 100%;
  .case-time {
    color: #888;
    font-size: 13px;
    margin-bottom: 4px;
    text-align: right;
  }
  .case-view-btn {
    color: #556ee6;
    font-size: 14px;
    padding: 0;
    margin: 0;
    margin-top: auto;
  }
}
.unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  margin-left: 2px;
  vertical-align: middle;
}
.unread-count {
  color: #ef4444;
  display: block;
  margin-left: 4px;
}
.filter-btn {
  border: none;
  border-radius: 12px;
  display: flex;
  margin-left: 4px;
}
</style>
