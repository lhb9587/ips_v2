<template>
  <div class="card h-100">
    <div class="card-body">
      <div class="title mb-2 d-flex justify-content-between">
        <div style="display: flex;align-items: center;gap: 6px;">
          <h4 class="card-title mb-0">重要事项</h4>
          <el-popover
            placement="bottom-start"
            title="重要事项"
            :width="350"
            trigger="hover"
            content="展示您关注案件的最新变动，包括客户事件、案件进展和账单收款。目前仅案件进展类支持诉讼案件提醒。"
            ref="descPopoverRef"
          >
            <template #reference>
                <i class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;"></i>
            </template>
          </el-popover>
        </div>
        <div class="tool-right">
          <div class="btn-top shadow-sm">
            <div
              class="d-flex gap-1"
              :style="{
                opacity: isAllRead ? '0.5' : '1',
                cursor: isAllRead ? 'not-allowed' : 'pointer',
                color: '#556ee6',
              }"
              @click="setAllRead"
            >
              <span
                class="mdi mdi-check-circle-outline"
                style="font-size: 14px"
              ></span>
              <span>全部已读</span>
            </div>
          </div>
          <div
            class="btn-top shadow-sm"
            @click="showSettingModal"
          >
            <div class="d-flex gap-1 align-items-center">
              <span
                class="bx bx-cog"
                style="font-size: 14px"
              ></span>
              <span>设置</span>
            </div>
          </div>
        </div>
      </div>
      <div
        class="filter-top d-flex align-items-center mb-3"
        style="gap: 8px"
      >
        <el-input
          v-model="searchText"
          placeholder="搜索..."
          clearable
          class="flex-grow-1 search-input top-search"
          @input="searchDebounce"
        >
          <template #prepend>
            <el-button @click="getNoticeList">
              <i class="bx bx-search-alt"></i>
            </el-button> </template
        ></el-input>
        <el-select
          v-model="noticeType"
          placeholder="所有类型"
          style="width: 100px"
          clearable
          @change="getNoticeList"
        >
          <el-option
            v-for="item in noticeTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-model="status"
          placeholder="所有状态"
          style="width: 100px"
          clearable
          @change="getNoticeList"
        >
          <el-option
            label="已读"
            value="1"
          />
          <el-option
            label="未读"
            value="0"
          />
        </el-select>
      </div>
      <div
        class="matters-info-component"
        ref="mattersRef"
      >
        <LoadingOverlay :loading="loading" />
        <el-collapse v-model="activeNames">
          <el-collapse-item
            :name="item.createTime"
            v-for="(item, index) in noticeList"
            :key="index"
          >
            <template #title>
              <div class="d-flex gap-2 align-items-center">
                <span
                  class="bx bx-calendar-minus"
                  style="color: #556ee6; font-size: 24px"
                ></span>
                <span style="font-size: 16px">{{ item.createTime }}</span>
                <span style="color: #74788d">{{ item.countNum || 0 }}条</span>
              </div>
            </template>
            <div class="matters-content">
              <div
                class="notice-card"
                v-for="(childItem, idx) in item.childs"
                :key="idx"
              >
                <div
                  class="notice-header d-flex align-items-center justify-content-between"
                >
                  <div>
                    <!-- <span
                      :class="childItem.icon"
                      :style="childItem.iconStyle"
                    ></span> -->
                    <span class="notice-title">{{ childItem.typeBrief }}</span>
                    <span
                      v-if="!childItem.read"
                      class="unread-dot"
                    ></span>
                  </div>
                  <div>
                    <span class="notice-time">{{ childItem.time }}</span>
                    <el-tag
                      v-if="childItem.noticeTypeStr"
                      :type="childItem.typeTagType"
                      size="small"
                      class="notice-type-tag"
                      round
                      >{{ childItem.noticeTypeStr }}</el-tag
                    >
                  </div>
                </div>
                <div class="notice-content-actions-row">
                  <div class="notice-content">
                    {{ childItem.mainText?.replace(/\*/g, "") }}
                  </div>
                  <div class="notice-actions d-flex justify-content-end">
                    <el-button
                      v-if="!childItem.read"
                      size="small"
                      type="primary"
                      style="border: none"
                      plain
                      @click.stop="setRead(childItem)"
                      >标记为已读</el-button
                    >
                    <el-button
                      size="small"
                      type="info"
                      style="border: none"
                      plain
                      @click.stop="viewNoticeDetail(childItem)"
                      >查看详情</el-button
                    >
                    <el-button
                      v-if="childItem.noticeType == 2176"
                      size="small"
                      type="success"
                      style="border: none"
                      plain
                      @click.stop="viewRelatedCase(childItem)"
                      >查看关联案件</el-button
                    >
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-empty
          description="暂无数据"
          v-if="!noticeList.length"
          :image-size="90"
        ></el-empty>
      </div>
      <el-dialog
        v-model="showSetting"
        title="事项设置"
        width="480px"
        :close-on-click-modal="false"
        append-to-body
        :cneter="true"
      >
        <div style="font-size: 15px; color: #666; margin-bottom: 18px">
          选择您希望接收的事项类型
        </div>
        <div style="font-weight: 500; color: #222; margin-bottom: 8px">
          事项类型
          <span
            style="
              float: right;
              color: #556ee6;
              cursor: pointer;
              font-size: 14px;
            "
            @click="selectAll"
            >全选</span
          >
        </div>
        <el-card
          shadow="never"
          style="background: #f8f9fa; margin-bottom: 18px"
        >
          <el-checkbox-group
            v-model="checkedTypes"
            class="type-checkbox-group"
          >
            <el-row :gutter="24">
              <el-col
                :span="12"
                v-for="item in noticeTypeList"
                :key="item.value"
                style="margin-bottom: 8px"
              >
                <el-checkbox :label="item.value">{{ item.label }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-card>
        <div class="d-flex justify-content-end gap-2 mt-2">
          <el-button @click="resetDefault">恢复默认设置</el-button>
          <el-button
            type="primary"
            @click="saveSetting"
            >保存设置</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
  <BillSidebar
    v-if="isBillDetail"
    :showSidebar="isBillDetail"
    @update:showSidebar="billSidebarUpdate"
    :billId="billId"
  />
  <MajorEventInfo
    v-model="detailModalStatus"
    :eventDetail="custEventDetail"
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
import { ref, onMounted, computed, nextTick, watch } from "vue";
import {
  queryImportantMatters,
  querySubscribeRange,
  settingsNoticeRead,
  settingsSubscribeRange,
  queryNoticeImpl,
  settingsSubscribe,
} from "@/api/dashboard";
import { querycustSelectClass, queryCustEventDetail } from "@/api/customerList";
import { ElMessage } from "element-plus";
import { debounce } from "lodash";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import BillSidebar from "@/components/sidebar/bill-sidebar";
import MajorEventInfo from "@/components/sidebar/components/customer/majorEvent-info/index.vue";
import CaseEventModal from "@/components/widgets/senior/caseevent-modal.vue";
import LoadingOverlay from "@/components/common/loading";

const searchText = ref("");
const noticeType = ref("");
const status = ref("");
const activeNames = ref([]);
const caseModelValue = ref(false);
const caseDetail = ref({});
const mattersRef = ref();
const showSubscribeDialog = ref(false);
const subscribeDialogMsg = ref("");

// 设置弹窗相关
const showSetting = ref(false);
const checkedTypes = ref([]);
const defaultTypes = ref([]);
const showSettingModal = () => {
  showSetting.value = true;
};
const selectAll = () => {
  checkedTypes.value = noticeTypeList.value.map((i) => i.value);
};
const loading = ref(false);

// 检查详情
const viewNoticeDetail = (item) => {
  if (item.noticeType == 2176) {
    openCaseDetail(item);
  } else if (item.noticeType == 2177) {
    billId.value = item.billId;
    isBillDetail.value = true;
  } else if (item.noticeType == 2178) {
    getCustEventDetail(item);
  }
  setRead(item);
};

const openCaseDetail = (item) => {
  noticeId.value = item.noticeId;
  queryNoticeImpl({ noticeId: item.noticeId }).then((res) => {
    if (res.success && res.data) {
      caseDetail.value = res.data;
      caseModelValue.value = true;
      if (res.data.newCase) {
        subscribeDialogMsg.value = `是否订阅二审案件${
          res.data.newCase.agentNum || ""
        }案件消息`;
        showSubscribeDialog.value = true;
      }
    }
  });
};

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
const caseId = ref("");
const taskType = ref("");
const isCaseDetail = ref(false);
const noticeId = ref("");
// 查看关联案件
const viewRelatedCase = (item) => {
  caseId.value = item.caseId;
  taskType.value = item.taskType;
  isCaseDetail.value = true;
};
// 关闭关联案件
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

// 查看关联账单
const billId = ref("");
const isBillDetail = ref(false);
const billSidebarUpdate = () => {
  isBillDetail.value = false;
  billId.value = "";
};

//查看客户事件详情
const detailModalStatus = ref(false);
const custEventDetail = ref({});
const getCustEventDetail = (item) => {
  queryCustEventDetail({
    eventId: item.eventId,
  }).then((res) => {
    custEventDetail.value = res.data || {};
    detailModalStatus.value = true;
  });
};
const resetDefault = () => {
  settingsSubscribeRange({
    defaultData: 1,
  }).then((res) => {
    if (res.success) {
      ElMessage.success("恢复默认成功");
      showSetting.value = false;
      getSubscribeRange();
    }
  });
};
const saveSetting = () => {
  // 这里可以加保存逻辑
  settingsSubscribeRange({
    noticeTypeList: checkedTypes.value,
  }).then((res) => {
    console.log(res);
    if (res.success) {
      ElMessage.success("保存成功");
      showSetting.value = false;
      getSubscribeRange();
    }
  });
};

const noticeTypeList = ref([]);
//获取通知类型
const getNoticeType = () => {
  const params = {
    classId: 1183,
  };
  querycustSelectClass(params).then((res) => {
    const list = res.data[1183] || [];
    noticeTypeList.value = list.map((item) => ({
      label: item.typeName,
      value: item.id,
    }));
    defaultTypes.value = noticeTypeList.value.map((i) => i.value);
    console.log(defaultTypes.value, "defaultTypes.value");
  });
};
//获取订阅范围
const getSubscribeRange = () => {
  querySubscribeRange().then((res) => {
    checkedTypes.value = res.data?.noticeTypeList || [];
  });
};

const noticeList = ref([]);
// 获取通知列表
const getNoticeList = () => {
  loading.value = true;
  const params = {
    keyword: searchText.value,
    noticeType: noticeType.value,
    read: status.value,
  };
  queryImportantMatters(params).then((res) => {
    noticeList.value = res.data || [];
    loading.value = false;
    if (res.data.length > 0) {
      activeNames.value = res.data[0].createTime;
    }
    if (mattersRef.value) {
      mattersRef.value.scrollTop = 0;
    }
  });
};

//设置搜索节流
const searchDebounce = debounce(getNoticeList, 500);

//通过computed判断所有通知是否已读
const isAllRead = computed(() => {
  const allNotice = getAllNotice(noticeList.value);
  return allNotice.every((i) => i.read);
});

//设置已读
const setRead = (item) => {
  if (item.read) return;
  settingsNoticeRead({
    noticeIdList: [item.noticeId],
  }).then((res) => {
    if (res.success) {
      //找到noticeList中childs下noticeId等于item.noticeId 的read置为1
      for (const group of noticeList.value) {
        const target = group.childs.find(
          (child) => child.noticeId === item.noticeId
        );
        if (target) {
          target.read = 1;
          break;
        }
      }
    }
  });
};

//设置全部已读
const setAllRead = () => {
  if (isAllRead.value) return;
  // 只保留未读的 notice
  const allNotice = getAllNotice(noticeList.value).filter((i) => !i.read);
  if (!allNotice.length) return;
  const noticeIdList = allNotice.map((i) => i.noticeId);
  console.log(noticeIdList, "noticeIdList");

  settingsNoticeRead({
    noticeIdList,
  }).then((res) => {
    if (res.success) {
      getNoticeList();
    }
  });
};

//获取所有通知
const getAllNotice = (list) => {
  //将list中所有的childs合并到一起
  const allNotice = list.map((i) => i.childs).flat();
  return allNotice;
};

// 新增：判断内容是否多行
const setMultilineClass = () => {
  nextTick(() => {
    const rows = document.querySelectorAll(".notice-content-actions-row");
    rows.forEach((row) => {
      const content = row.querySelector(".notice-content");
      if (content) {
        if (content.scrollHeight > content.clientHeight + 2) {
          content.classList.add("multiline");
        } else {
          content.classList.remove("multiline");
        }
      }
    });
  });
};

onMounted(() => {
  getNoticeList();
  getNoticeType();
  getSubscribeRange();
  setTimeout(setMultilineClass, 500);
});

watch(noticeList, () => {
  setTimeout(setMultilineClass, 300);
});
</script>
<style lang="scss" scoped>
.tool-right {
  display: flex;
  gap: 4px;
  .btn-top {
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 4px;
  }
}
/* 搜索框样式 */
.search-wrapper {
  position: relative;
  width: 220px;
}

.search-wrapper input {
  width: 100%;
  padding: 10px 16px 10px 38px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background-color: #f8fafc;
  transition: all 0.2s;
}
.filter-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-input {
  flex: 1 1 0%;
  min-width: 0;
}
.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.matters-info-component {
  flex: 1 1 0%;
  height: calc(100% - 120px);
  overflow-y: auto;
  :deep(.el-collapse) {
    border: none;
  }

  :deep(.el-collapse-item) {
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ebeef5;

    .el-collapse-item__header {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      background: #f5f7fa;
      border-bottom: none;
    }

    .el-collapse-item__content {
      //   padding: 0 16px 16px;
      padding: 0;
    }
  }

  .info-card {
    background: #fff;
  }

  .files {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}
.matters-content {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}
.notice-card {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 16px 20px 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  &:hover {
    background: #f9fafb;
  }
  /* 新增：正文和按钮响应式一行两端 */
  .notice-content-actions-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }
  .notice-content {
    flex: 1 1 auto;
    min-width: 0;
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
    word-break: break-all;
    overflow: visible;
    text-overflow: initial;
    white-space: normal;
    display: block;
  }
  .notice-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    margin-left: auto;
    width: auto;
    justify-content: flex-end;
    /* 关键：不允许换行，只有空间不足时才自动下方 */
    min-width: 180px; /* 按钮区最小宽度，可根据实际按钮数量调整 */
  }
  /* 多行或空间不足时按钮自动下方右对齐 */
  .notice-content-actions-row {
    /* 让按钮只有在空间不足或内容多行时才换行 */
  }
  @media (max-width: 700px) {
    .notice-content-actions-row {
      flex-direction: column;
      align-items: stretch;
    }
    .notice-actions {
      width: 100%;
      justify-content: flex-end;
      margin-left: 0;
      margin-top: 4px;
    }
  }
}
.notice-header {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
  .notice-title {
    margin-right: 8px;
  }
  .notice-type-tag {
    margin-left: 8px;
  }
  .notice-time {
    color: #888;
    font-size: 13px;
    margin-left: auto;
    margin-right: 0;
  }
}
.unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fa8c16;
  margin-left: 2px;
  vertical-align: middle;
}
</style>
